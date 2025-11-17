
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
                        <div className="font-mono text-sm"><Badge variant={status >= 400 ? 'destructive' : 'default'}>{status}</Badge> - {description}</div>
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

function Section({ title, id, children }: { title: string, id: string, children: React.ReactNode }) {
    return (
        <Card id={id} className="mb-8 scroll-mt-20">
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
    const genericPostResponses = (itemName = 'Item') => [
        { status: 201, description: `${itemName} created successfully.`},
        { status: 400, description: 'Invalid data.' },
        { status: 401, description: 'Unauthorized.' },
        { status: 500, description: 'Internal server error.'}
    ];
    const genericGetOneResponses = (itemName = 'Item') => [
        { status: 200, description: `Successfully retrieved ${itemName}.` },
        { status: 404, description: `${itemName} not found.` },
        { status: 500, description: 'Internal server error.'}
    ];
    const genericPutResponses = (itemName = 'Item') => [
        { status: 200, description: `${itemName} updated successfully.` },
        { status: 400, description: 'Invalid ID or data.' },
        { status: 404, description: `${itemName} not found.` },
        { status: 401, description: 'Unauthorized.' },
        { status: 500, description: 'Internal server error.'}
    ];
    const genericDeleteResponses = (itemName = 'Item') => [
        { status: 200, description: `${itemName} deleted successfully.`, body: `{ "message": "${itemName} deleted successfully." }` },
        { status: 400, description: 'Invalid ID or missing comment.' },
        { status: 404, description: `${itemName} not found.` },
        { status: 401, description: 'Unauthorized.' },
        { status: 500, description: 'Internal server error.'}
    ];

  return (
    <DashboardLayout user={user}>
        <main className="flex-1 p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
            
            <Section title="Authentication" id="authentication">
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
                        { status: 401, description: 'Invalid username or password.' },
                        { status: 500, description: 'Internal server error.', body: `{ "message": "An internal server error occurred." }` }
                    ]}
                />
            </Section>

             <Section title="Data Management" id="data-management">
                <ApiEndpoint
                    method="POST"
                    path="/api/seed"
                    description="Seeds the database with initial data for all collections. This is a protected endpoint and requires authentication."
                    responses={[
                        { status: 200, description: 'Database seeded successfully or partially.' },
                        { status: 401, description: 'Unauthorized.' },
                        { status: 500, description: 'Internal server error during seeding.' },
                    ]}
                />
                <Separator className="my-8" />
                 <ApiEndpoint
                    method="POST"
                    path="/api/clear"
                    description="Clears all data from specified collections in the database. This is a protected, destructive endpoint."
                    responses={[
                        { status: 200, description: 'All data cleared successfully.' },
                        { status: 401, description: 'Unauthorized.' },
                        { status: 500, description: 'Internal server error.' },
                    ]}
                />
            </Section>
            
            <Section title="Products" id="products">
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
                    description="Creates a new product. The `_id`, `created_at`, and `updated_at` fields will be set automatically."
                    requestBody={`{ "name": "New Awesome Product", "owner": "...", ... }`}
                    responses={genericPostResponses('Product')}
                />
                <Separator className="my-8" />
                <ApiEndpoint 
                    method="GET"
                    path="/api/products/{id}"
                    description="Retrieves a single product by its ID."
                    responses={genericGetOneResponses('Product')}
                />
                <Separator className="my-8" />
                <ApiEndpoint 
                    method="PUT"
                    path="/api/products/{id}"
                    description="Updates an existing product by its ID. A mandatory `updateComment` field must be included for auditing."
                    requestBody={`{ 
    "name": "Updated Product Name", 
    "owner": "New Owner",
    "updateComment": "Updating the owner for Q3 re-org." 
}`}
                    responses={genericPutResponses('Product')}
                />
                <Separator className="my-8" />
                <ApiEndpoint 
                    method="DELETE"
                    path="/api/products/{id}"
                    description="Deletes a product by its ID. A mandatory `comment` field must be included for auditing."
                    requestBody={`{ "comment": "Decommissioning old product." }`}
                    responses={genericDeleteResponses('Product')}
                />
            </Section>

            <Section title="Audits" id="audits">
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
                    description="Creates a new audit log entry. This is typically called internally by other API endpoints when modifications are made."
                    requestBody={`{ 
    "action": "CREATE" | "UPDATE" | "DELETE",
    "entity": "product",
    "entityId": "...",
    "comment": "User provided comment."
}`}
                    responses={genericPostResponses('Audit Log')}
                />
            </Section>
            
            <Section title="Baselines" id="baselines">
                 <ApiEndpoint 
                    method="GET"
                    path="/api/baselines"
                    description="Retrieves a list of all baselines."
                    responses={genericGetListResponses}
                />
                 <Separator className="my-8" />
                <ApiEndpoint 
                    method="POST"
                    path="/api/baselines"
                    description="Creates a new baseline. Automatically increments version number based on `versionIncrementType`."
                    requestBody={`{ 
    "product": { "id": "...", "name": "..." },
    "specifications": [ ... ],
    "tenants": [ ... ],
    "versionIncrementType": "major" | "minor" | "patch"
}`}
                    responses={genericPostResponses('Baseline')}
                />
                 <Separator className="my-8" />
                <ApiEndpoint 
                    method="GET"
                    path="/api/baselines/{id}"
                    description="Retrieves a single baseline by its ID."
                    responses={genericGetOneResponses('Baseline')}
                />
                <Separator className="my-8" />
                <ApiEndpoint 
                    method="PUT"
                    path="/api/baselines/{id}"
                    description="Updates the status or validation phases of a baseline."
                     requestBody={`{ 
    "status": "VALIDATING" | "RELEASED" | "REJECTED",
    "updateComment": "Moving to validation stage.",
    "validation_phases": [ ... ] 
}`}
                    responses={genericPutResponses('Baseline')}
                />
            </Section>

            <Section title="CMDB" id="cmdb">
                <p className="text-muted-foreground mb-4">Endpoints for managing the Configuration Management Database.</p>
                <ApiEndpoint method="GET" path="/api/cmdb/tenants" description="Retrieves a list of all tenants." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                 <ApiEndpoint method="POST" path="/api/cmdb/tenants" description="Onboards a new tenant." requestBody={`{ "id": "...", "name": "...", ... }`} responses={genericPostResponses('Tenant')}/>
                 <Separator className="my-8" />
                 <ApiEndpoint method="GET" path="/api/cmdb/tenants/{id}" description="Retrieves a single tenant by ID." responses={genericGetOneResponses('Tenant')}/>
                 <Separator className="my-8" />
                 <ApiEndpoint method="PUT" path="/api/cmdb/tenants/{id}" description="Updates a tenant. Requires `updateComment`." requestBody={`{ "name": "New Name", "updateComment": "Reason" }`} responses={genericPutResponses('Tenant')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/cmdb/tenants/{id}" description="Deletes a tenant. Requires `comment`." requestBody={`{ "comment": "Reason" }`} responses={genericDeleteResponses('Tenant')}/>
                <Separator className="my-8" />

                <ApiEndpoint method="GET" path="/api/cmdb/components" description="Retrieves a list of all components." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                 <ApiEndpoint method="POST" path="/api/cmdb/components" description="Onboards a new component." requestBody={`{ "id": "...", "name": "...", ... }`} responses={genericPostResponses('Component')}/>
                 <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/cmdb/components/{id}" description="Retrieves a single component by ID." responses={genericGetOneResponses('Component')}/>
                 <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/cmdb/components/{id}" description="Updates a component. Requires `updateComment`." requestBody={`{ "name": "New Name", "updateComment": "Reason" }`} responses={genericPutResponses('Component')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/cmdb/components/{id}" description="Deletes a component. Requires `comment`." requestBody={`{ "comment": "Reason" }`} responses={genericDeleteResponses('Component')}/>
                <Separator className="my-8" />

                <ApiEndpoint method="GET" path="/api/cmdb/applications" description="Retrieves a list of all applications." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/cmdb/applications" description="Onboards a new application." requestBody={`{ "id": "...", "name": "...", ... }`} responses={genericPostResponses('Application')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/cmdb/applications/{id}" description="Retrieves a single application by ID." responses={genericGetOneResponses('Application')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/cmdb/applications/{id}" description="Updates an application. Requires `updateComment`." requestBody={`{ "name": "New Name", "updateComment": "Reason" }`} responses={genericPutResponses('Application')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/cmdb/applications/{id}" description="Deletes an application. Requires `comment`." requestBody={`{ "comment": "Reason" }`} responses={genericDeleteResponses('Application')}/>
                <Separator className="my-8" />

                <ApiEndpoint method="GET" path="/api/cmdb/interfaces" description="Retrieves a list of all interfaces." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/cmdb/interfaces" description="Creates a new interface." requestBody={`{ "id": "...", "name": "...", ... }`} responses={genericPostResponses('Interface')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/cmdb/interfaces/{id}" description="Retrieves a single interface by ID." responses={genericGetOneResponses('Interface')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/cmdb/interfaces/{id}" description="Updates an interface. Requires `updateComment`." requestBody={`{ "name": "New Name", "updateComment": "Reason" }`} responses={genericPutResponses('Interface')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/cmdb/interfaces/{id}" description="Deletes an interface. Requires `comment`." requestBody={`{ "comment": "Reason" }`} responses={genericDeleteResponses('Interface')}/>
                <Separator className="my-8" />

                <ApiEndpoint method="GET" path="/api/cmdb/interface-types" description="Retrieves a list of all interface types." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/cmdb/interface-types" description="Creates a new interface type." requestBody={`{ "id": "...", "name": "..." }`} responses={genericPostResponses('Interface Type')}/>
            </Section>

             <Section title="Deployments" id="deployments">
                <ApiEndpoint method="GET" path="/api/deployments" description="Retrieves a list of all deployments." responses={genericGetListResponses} />
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/deployments" description="Initiates a new deployment." requestBody={`{ "productId": "...", "details": { "deploymentId": "...", "customer": "..." }, ... }`} responses={genericPostResponses('Deployment')} />
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/deployments/{id}" description="Retrieves a single deployment by its ID." responses={genericGetOneResponses('Deployment')} />
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/deployments/{id}" description="Updates a deployment. Requires `updateComment`." requestBody={`{ "status": "ACTIVE", "updateComment": "Provisioning complete." }`} responses={genericPutResponses('Deployment')} />
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/deployments/{id}" description="Deletes a deployment. Requires `comment`." requestBody={`{ "comment": "Decommissioned." }`} responses={genericDeleteResponses('Deployment')} />
             </Section>
             
             <Section title="Upgrade History" id="upgrade-history">
                <ApiEndpoint method="GET" path="/api/upgrade-history" description="Retrieves a list of all upgrade operations, grouped by operation." responses={genericGetListResponses} />
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/upgrade-history" description="Schedules a new upgrade operation for one or more deployments." responses={genericPostResponses('Upgrade Operation')} />
                <Separator className="my-8" />
                 <ApiEndpoint method="GET" path="/api/upgrade-history/{deploymentId}" description="Retrieves the upgrade history for a specific deployment ID." responses={genericGetListResponses} />
             </Section>

             <Section title="Dependency Tree" id="dependency-tree">
                <ApiEndpoint method="GET" path="/api/dependency-tree/product/{productId}" description="Retrieves the pre-generated dependency tree for a given product ID." responses={genericGetOneResponses('Tree')} />
                <Separator className="my-8" />
                 <ApiEndpoint method="GET" path="/api/dependency-tree/{entityType}/{entityId}" description="Generates a dependency graph (parents and children) for any given CMDB entity on-the-fly." responses={genericGetOneResponses('Graph')} />
                <Separator className="my-8" />
                 <ApiEndpoint method="POST" path="/api/dependency-tree/update-all" description="Triggers a regeneration of all stored product dependency trees." responses={[ { status: 200, description: 'Successfully initiated tree generation.' }, { status: 500, description: 'Internal server error.' } ]} />
             </Section>
             
             <Section title="Licenses" id="licenses">
                <ApiEndpoint method="GET" path="/api/licenses/usage" description="Retrieves a list of all defined licenses." responses={genericGetListResponses} />
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/licenses/usage" description="Creates a new license definition." responses={genericPostResponses('License')} />
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/licenses/usage/{id}" description="Retrieves a single license by ID." responses={genericGetOneResponses('License')} />
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/licenses/usage/{id}" description="Updates a license. Requires `updateComment`." responses={genericPutResponses('License')} />
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/licenses/usage/{id}" description="Deletes a license. Requires `comment`." responses={genericDeleteResponses('License')} />
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/product-licensing" description="Retrieves product-specific licensing configurations." responses={genericGetListResponses} />
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/product-licensing" description="Creates a new product-specific license configuration." responses={genericPostResponses('Product License')} />
                 <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/product-licensing/{id}" description="Updates a product-specific license configuration." responses={genericPutResponses('Product License')} />
             </Section>

            <Section title="Specifications" id="specifications">
                <ApiEndpoint method="GET" path="/api/specifications" description="Retrieves a list of all specifications." responses={genericGetListResponses}/>
                <Separator className="my-8" />
                <ApiEndpoint method="POST" path="/api/specifications" description="Creates a new specification entry." requestBody={`{ "name": "...", ... }`} responses={genericPostResponses('Specification')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="GET" path="/api/specifications/{id}" description="Retrieves a single specification by its ID." responses={genericGetOneResponses('Specification')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="PUT" path="/api/specifications/{id}" description="Updates an existing specification. Requires `updateComment`." requestBody={`{ "name": "New Name", "updateComment": "Reason" }`} responses={genericPutResponses('Specification')}/>
                <Separator className="my-8" />
                <ApiEndpoint method="DELETE" path="/api/specifications/{id}" description="Deletes a specification. Requires `comment`." requestBody={`{ "comment": "Reason" }`} responses={genericDeleteResponses('Specification')}/>
            </Section>

            <Section title="Settings" id="settings">
                 <p className="text-muted-foreground mb-4">Endpoints for managing lookup data and configurations.</p>
                <ApiEndpoint 
                    method="GET"
                    path="/api/settings/specifications/{type}"
                    description="Retrieves a list of all items for a given specification reference type. Replace {type} with one of: hw-types, vendors, plug-power-cords, network-cards, hypervisors."
                    responses={genericGetListResponses}
                />
                <Separator className="my-8" />
                 <ApiEndpoint 
                    method="GET"
                    path="/api/settings/onboarding"
                    description="Retrieves all versions of all onboarding configurations (tenant, component, application)."
                    responses={genericGetListResponses}
                />
                 <Separator className="my-8" />
                  <ApiEndpoint 
                    method="POST"
                    path="/api/settings/onboarding"
                    description="Saves a new version of an onboarding configuration."
                    responses={genericPostResponses('Onboarding Configuration')}
                />
                 <Separator className="my-8" />
                 <ApiEndpoint 
                    method="GET"
                    path="/api/settings/approvals/{approvalType}"
                    description="Retrieves all versions of a specific approval configuration."
                    responses={genericGetListResponses}
                />
                 <Separator className="my-8" />
                <ApiEndpoint 
                    method="POST"
                    path="/api/settings/approvals/{approvalType}"
                    description="Saves a new version of an approval configuration."
                    responses={genericPostResponses('Approval Configuration')}
                />
                 <Separator className="my-8" />
                  <ApiEndpoint 
                    method="GET"
                    path="/api/settings/baseline-onboarding"
                    description="Retrieves all versions of the baseline onboarding configuration."
                    responses={genericGetListResponses}
                />
                 <Separator className="my-8" />
                <ApiEndpoint 
                    method="POST"
                    path="/api/settings/baseline-onboarding"
                    description="Saves a new version of the baseline onboarding configuration."
                    responses={genericPostResponses('Baseline Onboarding Configuration')}
                />
            </Section>
        </main>
    </DashboardLayout>
  );
}
