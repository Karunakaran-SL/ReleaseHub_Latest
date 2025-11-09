
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

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}

export default function ApiDocsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const genericGetListResponses = [
        { status: 200, description: 'Successfully retrieved items.'},
        { status: 500, description: 'Internal server error.'}
    ];
    const genericPostResponses = [
        { status: 201, description: 'Item created successfully.'},
        { status: 400, description: 'Invalid data.' },
        { status: 500, description: 'Internal server error.'}
    ];
    const genericGetOneResponses = [
        { status: 200, description: 'Successfully retrieved item.' },
        { status: 400, description: 'Invalid ID.' },
        { status: 404, description: 'Item not found.' },
        { status: 500, description: 'Internal server error.'}
    ];
    const genericPutResponses = [
        { status: 200, description: 'Item updated successfully.' },
        { status: 400, description: 'Invalid ID or data.' },
        { status: 404, description: 'Item not found.' },
        { status: 500, description: 'Internal server error.'}
    ];
    const genericDeleteResponses = [
        { status: 200, description: 'Item deleted successfully.', body: `{ "message": "Item deleted successfully." }` },
        { status: 400, description: 'Invalid ID.' },
        { status: 404, description: 'Item not found.' },
        { status: 500, description: 'Internal server error.'}
    ];

  return (
    <DashboardLayout user={user}>
        <main className="flex-1 p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
            
            <Section title="Authentication">
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
            </Section>
            
            <Section title="Products">
                <ApiEndpoint 
                    method="GET"
                    path="/api/products"
                    description="Retrieves a list of all products. Can be filtered by name using a query parameter."
                    searchParams={[{name: 'q', description: 'A string to search for in product names (case-insensitive).'}]}
                    responses={[
                        { status: 200, description: 'Successfully retrieved products.', body: `[ { "_id": "...", "name": "OneStopShop Portal", ... } ]`},
                        { status: 500, description: 'Internal server error.'}
                    ]}
                />
                <Separator className="my-8" />
                <ApiEndpoint 
                    method="POST"
                    path="/api/products"
                    description="Creates a new product. The created_at and updated_at fields will be set automatically."
                    requestBody={`{ "id": "Product_F", "name": "New Awesome Product", ... }`}
                    responses={[
                        { status: 201, description: 'Product created successfully.', body: `{ "_id": "...", "name": "New Awesome Product", ... }`},
                        { status: 400, description: 'Invalid product data.' },
                        { status: 401, description: 'Unauthorized.' },
                        { status: 500, description: 'Internal server error.'}
                    ]}
                />
                <Separator className="my-8" />
                <ApiEndpoint 
                    method="GET"
                    path="/api/products/{id}"
                    description="Retrieves a single product by its MongoDB ObjectId."
                    responses={genericGetOneResponses.map(r => ({...r, description: r.description.replace('Item', 'Product')}))}
                />
                <Separator className="my-8" />
                <ApiEndpoint 
                    method="PUT"
                    path="/api/products/{id}"
                    description="Updates an existing product by its MongoDB ObjectId. The updated_at field is automatically updated. A mandatory `updateComment` field must be included for auditing."
                    requestBody={`{ 
    "name": "Updated Product Name", 
    "owner": "New Owner",
    "updateComment": "Updating the owner for Q3 re-org." 
}`}
                    responses={genericPutResponses.map(r => ({...r, description: r.description.replace('Item', 'Product')})).concat({ status: 401, description: 'Unauthorized.' })}
                />
                <Separator className="my-8" />
                <ApiEndpoint 
                    method="DELETE"
                    path="/api/products/{id}"
                    description="Deletes a product by its MongoDB ObjectId. A mandatory `comment` field must be included for auditing."
                    requestBody={`{ "comment": "Decommissioning old product." }`}
                    responses={genericDeleteResponses.map(r => ({...r, description: r.description.replace('Item', 'Product')})).concat({ status: 401, description: 'Unauthorized.' })}
                />
            </Section>

            <Section title="Audits">
                 <ApiEndpoint 
                    method="GET"
                    path="/api/audits"
                    description="Retrieves a list of all audit log entries, sorted by most recent."
                    responses={genericGetListResponses}
                />
                 <Separator className="my-8" />
                <ApiEndpoint 
                    method="POST"
                    path="/api/audits"
                    description="Creates a new audit log entry. This is typically called internally by other API endpoints."
                    requestBody={`{ 
    "action": "CREATE" | "UPDATE" | "DELETE",
    "entity": "product",
    "entityId": "...",
    "comment": "User provided comment."
}`}
                    responses={genericPostResponses.map(r => ({...r, description: r.description.replace('Item', 'Log')}))}
                />
            </Section>

            <Section title="Workflows">
                <ApiEndpoint method="GET" path="/api/workflows" description="Retrieves a list of all workflows." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/workflows" description="Creates a new workflow." requestBody={`{ "id": "...", "name": "...", "description": "..." }`} responses={genericPostResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/workflows/{id}" description="Retrieves a single workflow by its MongoDB ObjectId." responses={genericGetOneResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/workflows/{id}" description="Updates an existing workflow." requestBody={`{ "name": "New Name" }`} responses={genericPutResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/workflows/{id}" description="Deletes a workflow." responses={genericDeleteResponses}/>
            </Section>

            <Section title="CMDB">
                <ApiEndpoint method="GET" path="/api/cmdb" description="Retrieves a list of all CMDB entries." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/cmdb" description="Creates a new CMDB entry." requestBody={`{ "id": "...", "name": "...", "description": "..." }`} responses={genericPostResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/cmdb/{id}" description="Retrieves a single CMDB entry by its MongoDB ObjectId." responses={genericGetOneResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/cmdb/{id}" description="Updates an existing CMDB entry." requestBody={`{ "name": "New Name" }`} responses={genericPutResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/cmdb/{id}" description="Deletes a CMDB entry." responses={genericDeleteResponses}/>
            </Section>

            <Section title="Compliance Checks">
                <ApiEndpoint method="GET" path="/api/compliance-checks" description="Retrieves a list of all compliance checks." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/compliance-checks" description="Creates a new compliance check." requestBody={`{ "id": "...", "name": "...", "description": "..." }`} responses={genericPostResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/compliance-checks/{id}" description="Retrieves a single compliance check by its MongoDB ObjectId." responses={genericGetOneResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/compliance-checks/{id}" description="Updates an existing compliance check." requestBody={`{ "name": "New Name" }`} responses={genericPutResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/compliance-checks/{id}" description="Deletes a compliance check." responses={genericDeleteResponses}/>
            </Section>

            <Section title="Deployment Types">
                <ApiEndpoint method="GET" path="/api/deployment-types" description="Retrieves a list of all deployment types." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/deployment-types" description="Creates a new deployment type." requestBody={`{ "id": "...", "name": "...", "description": "..." }`} responses={genericPostResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/deployment-types/{id}" description="Retrieves a single deployment type by its MongoDB ObjectId." responses={genericGetOneResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/deployment-types/{id}" description="Updates an existing deployment type." requestBody={`{ "name": "New Name" }`} responses={genericPutResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/deployment-types/{id}" description="Deletes a deployment type." responses={genericDeleteResponses}/>
            </Section>

            <Section title="Airgapped Details">
                <ApiEndpoint method="GET" path="/api/airgapped-details" description="Retrieves a list of all airgapped details." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/airgapped-details" description="Creates a new airgapped details entry." requestBody={`{ "id": "...", "name": "...", "description": "..." }`} responses={genericPostResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/airgapped-details/{id}" description="Retrieves a single airgapped details entry by its MongoDB ObjectId." responses={genericGetOneResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/airgapped-details/{id}" description="Updates an existing airgapped details entry." requestBody={`{ "name": "New Name" }`} responses={genericPutResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/airgapped-details/{id}" description="Deletes an airgapped details entry." responses={genericDeleteResponses}/>
            </Section>

        </main>
    </DashboardLayout>
  );
}
