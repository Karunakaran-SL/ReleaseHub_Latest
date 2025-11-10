
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const SecuritySchema = z.object({
  internal: z.object({
    secure: z.boolean(),
    authentication: z.boolean(),
  }),
  external: z.object({
    secure: z.boolean(),
    authentication: z.boolean(),
  }),
});

const InterfaceSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.object({
    id: z.string(),
    name: z.string(),
  }),
  version: z.string().min(1),
  description: z.string().optional(),
  owner_name: z.string().min(1),
  owner_email: z.string().email(),
  documentation: z.string().url().optional(),
  source: z.object({
    id: z.string(),
    name: z.string(),
  }),
  security: SecuritySchema,
  additional_docs: z.array(z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    url: z.string().url(),
  })).optional(),
  custom_fields: z.array(z.object({
      key: z.string(),
      value: z.string()
  })).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const COLLECTION_NAME = 'cmdb_interfaces';

const interfacePool = [
    { id: "Interface_Metrics_API", name: "Metrics API", owner: "SRE Team", type: { id: "Interface_Type_API", name: "API" } }, 
    { id: "Interface_Tracing_API", name: "Tracing API", owner: "SRE Team", type: { id: "Interface_Type_API", name: "API" } }, 
    { id: "Interface_Logging_API", name: "Logging API", owner: "SRE Team", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_AuthN_API", name: "AuthN API", owner: "Security Team", type: { id: "Interface_Type_API", name: "API" } }, 
    { id: "Interface_AuthZ_API", name: "AuthZ API", owner: "Security Team", type: { id: "Interface_Type_API", name: "API" } }, 
    { id: "Interface_Discovery_API", name: "Discovery API", owner: "Platform Team", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_Storage_S3", name: "S3 Storage API", owner: "Infra Team", type: { id: "Interface_Type_API", name: "API" } }, 
    { id: "Interface_SQL_DB", name: "SQL Database API", owner: "DBA Team", type: { id: "Interface_Type_API", name: "API" } }, 
    { id: "Interface_NoSQL_DB", name: "NoSQL Database API", owner: "DBA Team", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_Streaming_Kafka", name: "Kafka Streaming API", owner: "Data Platform", type: { id: "Interface_Type_Topic", name: "Topic" } }, 
    { id: "Interface_Orchestration_API", name: "Orchestration API", owner: "Platform Team", type: { id: "Interface_Type_API", name: "API" } }, 
    { id: "Interface_Git_API", name: "Git API", owner: "DevEx Team", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_WebApp_UI", name: "WebApp UI", owner: "Frontend Team", type: { id: "Interface_Type_UI", name: "UI" } },
    { id: "Interface_Public_API_Gateway", name: "Public API Gateway", owner: "Gateway Team", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_Internal_GraphQL", name: "Internal GraphQL API", owner: "Platform Team", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_Data_Ingestion", name: "Data Ingestion API", owner: "Data Engineering", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_Data_Query", name: "Data Query API", owner: "Data Engineering", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_Model_Training", name: "Model Training API", owner: "ML Team", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_Model_Inference", name: "Model Inference API", owner: "ML Team", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_Device_Telemetry", name: "Device Telemetry API", owner: "IoT Team", type: { id: "Interface_Type_Topic", name: "Topic" } },
    { id: "Interface_Game_State", name: "Game State API", owner: "Gaming Team", type: { id: "Interface_Type_API", name: "API" } },
    { id: "Interface_Leaderboard", name: "Leaderboard API", owner: "Gaming Team", type: { id: "Interface_Type_API", name: "API" } }
].map(iface => ({
    ...iface,
    _id: iface.id,
    version: "1.0.0",
    description: `Interface for ${iface.name}`,
    owner_name: iface.owner,
    owner_email: `${iface.owner.toLowerCase().replace(' ', '.')}@example.com`,
    source: { id: "Unknown", name: "Unknown" }, // This would be populated by the component/app that provides it
    security: {
        internal: { secure: true, authentication: true },
        external: { secure: false, authentication: false }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
}));



async function seedInterfaces() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(COLLECTION_NAME);
    
    await collection.deleteMany({_id: {$in: interfacePool.map(i => i._id)}})
    await collection.insertMany(interfacePool as any[]);

    console.log('Seeded interfaces collection.');
  } catch (error) {
    console.error('Error seeding interfaces:', error);
  }
}

// List all interfaces
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    await seedInterfaces();
    
    const items = await db.collection(COLLECTION_NAME).find({}).sort({updated_at: -1}).toArray();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// Create a new interface
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = InterfaceSchema.safeParse(body);

        if (!validatedData.success) {
            console.error(validatedData.error.flatten().fieldErrors)
            return NextResponse.json({ message: 'Invalid data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();
        
        const newItem = {
            ...validatedData.data,
            _id: validatedData.data.id,
        };
        
        await db.collection(COLLECTION_NAME).insertOne(newItem as any);

        await logAuditEvent({
            action: 'CREATE',
            entity: 'interface',
            entityId: newItem.id,
            comment: `Interface "${newItem.name}" created.`,
        });

        return NextResponse.json(newItem, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
