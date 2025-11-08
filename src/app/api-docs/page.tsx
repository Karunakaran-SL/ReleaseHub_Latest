import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ApiDocsPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Badge variant="secondary" className="text-base">POST</Badge>
              <h3 className="text-xl font-semibold font-mono text-foreground">/api/login</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Authenticates a user and returns a session cookie. The first login attempt will create the user if they do not exist. If an existing user's password is not hashed, it will be updated.
            </p>

            <Separator className="my-4" />

            <h4 className="font-semibold mb-2">Request Body</h4>
            <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
              <pre><code>{`{
  "username": "yourusername",
  "password": "yourpassword"
}`}</code></pre>
            </div>

            <Separator className="my-4" />

            <h4 className="font-semibold mb-2">Responses</h4>
            <div className="space-y-4">
              <div>
                <p className="font-mono text-sm"><Badge>200 OK</Badge> - Login successful</p>
                <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mt-2">
                    <pre><code>{`{
  "message": "Logged in successfully"
}`}</code></pre>
                </div>
              </div>
              <div>
                <p className="font-mono text-sm"><Badge>200 OK</Badge> - Password updated and logged in</p>
                <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mt-2">
                    <pre><code>{`{
  "message": "Password updated and logged in successfully"
}`}</code></pre>
                </div>
              </div>
               <div>
                <p className="font-mono text-sm"><Badge>201 Created</Badge> - New user created and logged in</p>
                <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mt-2">
                    <pre><code>{`{
  "message": "User created and logged in successfully"
}`}</code></pre>
                </div>
              </div>
              <div>
                <p className="font-mono text-sm"><Badge variant="destructive">400 Bad Request</Badge> - Invalid request body</p>
                 <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mt-2">
                    <pre><code>{`{
  "message": "Invalid username or password format."
}`}</code></pre>
                </div>
              </div>
              <div>
                <p className="font-mono text-sm"><Badge variant="destructive">500 Internal Server Error</Badge> - An internal error occurred</p>
                 <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mt-2">
                    <pre><code>{`{
  "message": "An internal server error occurred."
}`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
