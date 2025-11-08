import { redirect } from 'next/navigation';
import { getUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <Logo />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {user.username}
              </span>
              <form action={signOut}>
                <Button variant="ghost" type="submit">
                  Sign Out
                </Button>
              </form>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-10">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to ReleaseHub
            </h1>
            <p className="text-muted-foreground">
              This is your dashboard. More features coming soon!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
