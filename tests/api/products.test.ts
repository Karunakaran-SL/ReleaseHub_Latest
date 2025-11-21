/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/products/route';
import { PUT, DELETE } from '@/app/api/products/[id]/route';
import { MongoClient, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NextRequest } from 'next/server';
import { createMocks } from 'node-mocks-http';

// Mock the external dependencies
jest.mock('@/lib/auth', () => ({
  getUser: jest.fn().mockResolvedValue({ username: 'testuser' }),
}));

jest.mock('@/lib/audit', () => ({
    logAuditEvent: jest.fn().mockResolvedValue(undefined),
}));

// Use a mock MongoDB server
let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;

// Mock the clientPromise to use the in-memory server
jest.mock('@/lib/mongodb', () => {
    return {
        __esModule: true,
        default: new Promise<MongoClient>((resolve) => {
            // This promise will be resolved in beforeAll
        }),
    };
});

// We need to re-import mongodb after the mock is set up.
let mockMongoClientPromise: Promise<MongoClient>;
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('testdb');
    
    // Resolve the mocked promise with the in-memory client
    mockMongoClientPromise = Promise.resolve(client);
    jest.mock('@/lib/mongodb', () => ({
        __esModule: true,
        default: mockMongoClientPromise,
    }));
});


afterAll(async () => {
  await client.close();
  await mongod.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }
});


describe('Products API', () => {

  const mockProduct = {
      _id: 'TestProduct1',
      name: 'Test Product 1',
      owner: 'Test Owner',
      owner_email: 'owner@test.com',
      product_image: 'https://example.com/image.png',
      approval_needed: false,
      default_workflow: { id: 'wf1', name: 'Workflow 1' },
      custom_workflows: [],
      cmdb: { id: 'cmdb1', name: 'CMDB 1' },
      compliance_checks: [],
      deployment_type: { id: 'dt1', name: 'Deployment Type 1' },
      git_repo: 'https://git.example.com',
      artifacts_repo: 'https://artifacts.example.com',
      pipeline: 'https://pipeline.example.com',
      version: '1.0.0',
      updateComment: 'Initial creation'
  };

  /**
   * Unit & Contract Test for GET /api/products
   */
  it('should fetch all products', async () => {
    await db.collection('products').insertOne(mockProduct);

    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBe(1);
    expect(data[0].name).toBe('Test Product 1');
  });

  /**
   * Unit & Contract Test for POST /api/products
   */
   it('should create a new product', async () => {
        const { req } = createMocks({
            method: 'POST',
            body: { ...mockProduct, _id: undefined },
        });

        const response = await POST(req as unknown as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data).toHaveProperty('_id');
        expect(data.name).toBe(mockProduct.name);

        const count = await db.collection('products').countDocuments();
        expect(count).toBe(1);
   });


  /**
   * Unit & Contract Test for GET /api/products/[id]
   */
   it('should fetch a single product by ID', async () => {
       await db.collection('products').insertOne(mockProduct);
       const { req } = createMocks({ method: 'GET' });

       const response = await GET(req as unknown as NextRequest, { params: { id: mockProduct._id } });
       const data = await response.json();

       expect(response.status).toBe(200);
       expect(data.name).toBe(mockProduct.name);
   });
   
   /**
   * Unit & Contract Test for PUT /api/products/[id]
   */
   it('should update a product', async () => {
       await db.collection('products').insertOne(mockProduct);
       
       const updatedData = { name: 'Updated Product Name', updateComment: 'Name was changed' };
       const { req } = createMocks({
           method: 'PUT',
           body: updatedData,
       });

       const response = await PUT(req as unknown as NextRequest, { params: { id: mockProduct._id } });
       const data = await response.json();
       
       expect(response.status).toBe(200);
       expect(data.name).toBe('Updated Product Name');
       
       const dbProduct = await db.collection('products').findOne({ _id: mockProduct._id });
       expect(dbProduct.name).toBe('Updated Product Name');
   });
   
   /**
   * Unit & Contract Test for DELETE /api/products/[id]
   */
   it('should delete a product', async () => {
       await db.collection('products').insertOne(mockProduct);
       
       const { req } = createMocks({
           method: 'DELETE',
           body: { comment: 'Decommissioned' }
       });

       const response = await DELETE(req as unknown as NextRequest, { params: { id: mockProduct._id } });
       
       expect(response.status).toBe(200);
       const count = await db.collection('products').countDocuments({ _id: mockProduct._id });
       expect(count).toBe(0);
   });

});