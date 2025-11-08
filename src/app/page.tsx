'use client';
import { redirect } from 'next/navigation';
import { getUser, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  Bell,
  Box,
  ChevronDown,
  ClipboardList,
  FileText,
  GanttChartSquare,
  HardDrive,
  LayoutGrid,
  ListChecks,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Workflow as WorkflowIcon,
  File,
  BarChart,
  LineChart,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

function Header({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Logo className="text-xl" />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="relative hidden w-full max-w-sm items-center md:flex">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-full bg-muted pl-10"
            />
          </div>
          <Button variant="ghost" size="icon">
            <LayoutGrid />
            <span className="ml-2 hidden md:inline">Mega Menu</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings />
            <span className="ml-2 hidden md:inline">Settings</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-auto px-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src="https://picsum.photos/seed/karan/40/40"
                      alt={user?.username}
                    />
                    <AvatarFallback>
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left md:block">
                    <div className="font-medium">{user?.username}</div>
                    <div className="text-xs text-muted-foreground">
                      Release Engineer
                    </div>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Release Engineer
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={signOut} className="w-full">
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full">
                    Sign Out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function SummaryCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <div className="text-primary">{icon}</div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const fetchedUser = await getUser();
      setUser(fetchedUser);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <Header user={user} />
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <Collapsible asChild>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive
                        tooltip={{ children: 'Dashboard' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <LayoutGrid />
                        Dashboard
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            Data Flow Mgmt
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            Release & Baseline Mgmt
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            Fleet Mgmt
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            Workflow Mgmt
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            Jobs Monitoring
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            Security Monitoring
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            Compliance Monitoring
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
                
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{ children: 'Products' }}>
                    <Box />
                    Products
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{ children: 'Specifications' }}>
                    <FileText />
                    Specifications
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible asChild>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={{ children: 'CMDB' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <HardDrive />
                        CMDB
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible asChild>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={{ children: 'Release Management' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <GanttChartSquare />
                        Release Managment
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                </Collapsible>
                
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{ children: 'Fleet Mgmt' }}>
                    <Users />
                    Fleet Mgmt
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{ children: 'Workflow' }}>
                    <WorkflowIcon />
                    Workflow
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{ children: 'Jobs' }}>
                    <ClipboardList />
                    Jobs
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible asChild>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={{ children: 'Audit' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <ShieldCheck />
                        Audit
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{ children: 'Compliance' }}>
                    <ListChecks />
                    Compliance
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <Collapsible asChild>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={{ children: 'Settings' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <Settings />
                        Settings
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                </Collapsible>

              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border-t">
                <File className="h-4 w-4" />
                <span>Updated a policy by Admin</span>
              </div>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <main className="flex-1 space-y-8 p-6 md:p-10">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome to ReleaseHub
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Here's a summary of your operations.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
                <SummaryCard
                  icon={<Users className="h-8 w-8" />}
                  title="Fleet Management"
                  description="Manage and monitor your fleet of devices."
                />
                <SummaryCard
                  icon={<Box className="h-8 w-8" />}
                  title="Product Management"
                  description="Oversee your product lifecycle and specifications."
                />
                <SummaryCard
                  icon={<GanttChartSquare className="h-8 w-8" />}
                  title="Release Management"
                  description="Track and manage your software releases."
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Quick Actions
                </h2>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <LineChart className="mr-2" />
                    MONITOR JOBS
                  </Button>
                  <Button>
                    <ListChecks className="mr-2" />
                    CHECK COMPLIANCE
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <ShieldCheck className="mr-2" />
                    SECURITY ALERTS
                  </Button>
                  <Button>
                    <Box className="mr-2" />
                    VIEW PRODUCTS
                  </Button>
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
