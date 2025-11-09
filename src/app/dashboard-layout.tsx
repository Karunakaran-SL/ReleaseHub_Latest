
'use client';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
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

function Header({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <Header user={user} />
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <Collapsible asChild defaultOpen={!isProductsPage && !isSpecificationsPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={!isProductsPage && !isSpecificationsPage}
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
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
