
'use client';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  AppWindow,
  Bell,
  Box,
  ChevronDown,
  ClipboardList,
  FileCode,
  FileText,
  GanttChartSquare,
  HardDrive,
  LayoutGrid,
  ListChecks,
  Network,
  Puzzle,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Warehouse,
  Workflow as WorkflowIcon,
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
import type { User } from '@/lib/definitions';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { usePathname } from 'next/navigation';
import Footer from '@/components/footer';

function Header({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Logo />
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

export default function DashboardLayout({ children, user }: { children: React.ReactNode, user: User | null }) {
    const pathname = usePathname();
    const isProductsPage = pathname.startsWith('/products');
    const isSpecificationsPage = pathname.startsWith('/specifications');
    const isApiDocsPage = pathname.startsWith('/api-docs');
    const isAuditPage = pathname.startsWith('/audits');
    const isSettingsPage = pathname.startsWith('/settings');
    const isCmdbPage = pathname.startsWith('/cmdb');

  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full flex-col">
        <Header user={user} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <Collapsible asChild defaultOpen={!isProductsPage && !isSpecificationsPage && !isApiDocsPage && !isAuditPage && !isSettingsPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={!isProductsPage && !isSpecificationsPage && !isSettingsPage}
                        tooltip={{ children: 'Dashboard' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                         <Link href="/" className='flex items-center gap-2 w-full'>
                            <LayoutGrid />
                            Dashboard
                         </Link>
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
                
                <Collapsible asChild defaultOpen={isProductsPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        isActive={isProductsPage} 
                        tooltip={{ children: 'Products' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                         <Link href="/products" className='flex items-center gap-2 w-full'>
                            <Box />
                            Products
                         </Link>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible asChild defaultOpen={isSpecificationsPage}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            isActive={isSpecificationsPage}
                            tooltip={{ children: 'Specifications' }}
                            className="data-[state=open]:bg-sidebar-accent"
                        >
                            <Link href="/specifications" className='flex items-center gap-2 w-full'>
                                <FileText />
                                Specifications
                            </Link>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                        </CollapsibleTrigger>
                    </SidebarMenuItem>
                </Collapsible>

                <Collapsible asChild defaultOpen={isCmdbPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        isActive={isCmdbPage}
                        tooltip={{ children: 'CMDB' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <HardDrive />
                        CMDB
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/cmdb/tenants" isActive={pathname.startsWith('/cmdb/tenants')}>
                                <Warehouse className="mr-2"/> Tenants
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/cmdb/components" isActive={pathname.startsWith('/cmdb/components')}>
                                <Puzzle className="mr-2"/> Components
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/cmdb/applications" isActive={pathname.startsWith('/cmdb/applications')}>
                                <AppWindow className="mr-2"/> Applications
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/cmdb/interfaces" isActive={pathname.startsWith('/cmdb/interfaces')}>
                                <Network className="mr-2"/> Interfaces
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
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

                <Collapsible asChild defaultOpen={isAuditPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        isActive={isAuditPage}
                        tooltip={{ children: 'Audit' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                         <Link href="/audits" className='flex items-center gap-2 w-full'>
                            <ShieldCheck />
                            Audit
                         </Link>
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
                
                <Collapsible asChild defaultOpen={isSettingsPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        isActive={isSettingsPage}
                        tooltip={{ children: 'Settings' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <Settings />
                        Settings
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                     <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/settings/onboarding" isActive={pathname.startsWith('/settings/onboarding')}>
                            Onboarding
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/settings/cmdb" isActive={pathname.startsWith('/settings/cmdb')}>
                            CMDB
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible asChild defaultOpen={isApiDocsPage}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            isActive={isApiDocsPage}
                            tooltip={{ children: 'API' }}
                            className="data-[state=open]:bg-sidebar-accent"
                        >
                            <Link href="/api-docs" className='flex items-center gap-2 w-full'>
                                <FileCode />
                                API
                            </Link>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                             <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname === '/api-docs' && !pathname.includes('#')}>
                                        <Link href="/api-docs">API Doc</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.endsWith('#authentication')}>
                                        <Link href="/api-docs#authentication">Authentication</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.endsWith('#products')}>
                                        <Link href="/api-docs#products">Products</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.endsWith('#audits')}>
                                        <Link href="/api-docs#audits">Audits</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.endsWith('#workflows')}>
                                        <Link href="/api-docs#workflows">Workflows</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.endsWith('#cmdb')}>
                                        <Link href="/api-docs#cmdb">CMDB</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.endsWith('#compliance-checks')}>
                                        <Link href="/api-docs#compliance-checks">Compliance</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.endsWith('#deployment-types')}>
                                        <Link href="/api-docs#deployment-types">Deployment</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.endsWith('#specifications')}>
                                        <Link href="/api-docs#specifications">Specifications</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>

              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
