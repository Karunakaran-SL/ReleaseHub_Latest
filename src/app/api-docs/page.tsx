
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import DashboardLayout from '../dashboard-layout';

function ApiEndpoint({ 
    method, 
    path, 
    description,
    requestBody,
    responses,
    searchParams
 }: { 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    path: string, 
    description: string,
    requestBody?: string,
    responses: { status: number, description: string, body?: string }[]
    searchParams?: { name: string, description: string }[]
 }) {

    const methodColors = {
        GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }

    return (
        <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
                <Badge variant="secondary" className={`text-base font-bold ${methodColors[method]}`}>{method}</Badge>
                <h3 className="text-xl font-semibold font-mono text-foreground">{path}</h3>
            </div>
            <p className="text-muted-foreground mb-4">
                {description}
            </p>

            {searchParams && (
                <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold mb-2">Query Parameters</h4>
                    {searchParams.map(param => (
                        <div key={param.name} className="mb-2">
                            <code className="font-mono bg-muted p-1 rounded-md">{param.name}</code>
                            <p className="text-sm text-muted-foreground pl-2">{param.description}</p>
                        </div>
                    ))}
                </>
            )}

            {requestBody && (
                <>
                    <Separator className="my-4" />
                    <h4 className="font-semibold mb-2">Request Body</h4>
                    <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                        <pre><code>{requestBody}</code></pre>
                    </div>
                </>
            )}

            <Separator className="my-4" />

            <h4 className="font-semibold mb-2">Responses</h4>
            <div className="space-y-4">
                {responses.map(({status, description, body}) => (
                    <div key={status}>
                        <p className="font-mono text-sm"><Badge variant={status >= 400 ? 'destructive' : 'default'}>{status}</Badge> - {description}</p>
                        {body && (
                             <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mt-2">
                                <pre><code>{body}</code></pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function ApiDocsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

  return (
    <DashboardLayout user={user}>
        <main className="flex-1 p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
            
            <Card className="mb-8">
                <CardHeader>
                <CardTitle className="text-2xl">Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                    <ApiEndpoint 
                        method="POST"
                        path="/api/login"
                        description="Authenticates a user and returns a session cookie. The first login attempt will create the user if they do not exist."
                        requestBody={`{
    "username": "yourusername",
    "password": "yourpassword"
}`}
                        responses={[
                            { status: 200, description: 'Login successful or password updated.', body: `{ "message": "Logged in successfully" }` },
                            { status: 201, description: 'New user created and logged in.', body: `{ "message": "User created and logged in successfully" }` },
                            { status: 400, description: 'Invalid request body.', body: `{ "message": "Invalid username or password format." }` },
                            { status: 500, description: 'Internal server error.', body: `{ "message": "An internal server error occurred." }` }
                        ]}
                    />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                <CardTitle className="text-2xl">Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <ApiEndpoint 
                        method="GET"
                        path="/api/products"
                        description="Retrieves a list of all products. Can be filtered by name using a query parameter."
                        searchParams={[{name: 'q', description: 'A string to search for in product names (case-insensitive).'}]}
                        responses={[
                            { status: 200, description: 'Successfully retrieved products.', body: `[
    {
        "_id": "60d...a",
        "name": "OneStopShop Portal",
        ...
    },
    ...
]`},
                            { status: 500, description: 'Internal server error.'}
                        ]}
                    />

                    <Separator className="my-8" />
                    
                    <ApiEndpoint 
                        method="POST"
                        path="/api/products"
                        description="Creates a new product. The created_at and updated_at fields will be set automatically."
                        requestBody={`{
    "id": "Product_C",
    "name": "New Awesome Product",
    ...
}`}
                        responses={[
                            { status: 201, description: 'Product created successfully.', body: `{
    "_id": "60d...b",
    "name": "New Awesome Product",
    ...
}`},
                            { status: 400, description: 'Invalid product data.' },
                            { status: 500, description: 'Internal server error.'}
                        ]}
                    />

                     <Separator className="my-8" />
                    
                    <ApiEndpoint 
                        method="GET"
                        path="/api/products/{id}"
                        description="Retrieves a single product by its MongoDB ObjectId."
                        responses={[
                            { status: 200, description: 'Successfully retrieved product.' },
                            { status: 400, description: 'Invalid product ID.' },
                            { status: 404, description: 'Product not found.' },
                            { status: 500, description: 'Internal server error.'}
                        ]}
                    />

                    <Separator className="my-8" />
                    
                    <ApiEndpoint 
                        method="PUT"
                        path="/api/products/{id}"
                        description="Updates an existing product by its MongoDB ObjectId. The updated_at field is automatically updated."
                        requestBody={`{
    "name": "Updated Product Name",
    "owner": "New Owner"
    ...
}`}
                        responses={[
                            { status: 200, description: 'Product updated successfully.' },
                            { status: 400, description: 'Invalid product ID or data.' },
                            { status: 404, description: 'Product not found.' },
                            { status: 500, description: 'Internal server error.'}
                        ]}
                    />

                    <Separator className="my-8" />

                    <ApiEndpoint 
                        method="DELETE"
                        path="/api/products/{id}"
                        description="Deletes a product by its MongoDB ObjectId."
                        responses={[
                            { status: 200, description: 'Product deleted successfully.', body: `{ "message": "Product deleted successfully." }` },
                            { status: 400, description: 'Invalid product ID.' },
                            { status: 404, description: 'Product not found.' },
                            { status: 500, description: 'Internal server error.'}
                        ]}
                    />
                </CardContent>
            </Card>
        </main>
    </DashboardLayout>
  );
}
