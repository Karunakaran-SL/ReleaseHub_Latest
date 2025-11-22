
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
  GitGraph,
  DatabaseZap,
  BookCopy,
  CheckSquare,
  SlidersHorizontal,
  Database,
  FileKey2,
  Wrench,
  BarChart,
  BoxIcon,
  Blocks,
  BookText,
  MousePointerClick,
  TerminalSquare,
  FlaskConical,
  BadgeCheck,
  ScanLine,
  ScanSearch,
  Waypoints,
  Rocket,
  WrenchIcon,
  Globe,
  PieChart,
  Grid3x3,
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
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Logo />
        </div>

        <div className="flex flex-1 justify-center px-4">
            <div className="relative w-full max-w-sm items-center hidden md:flex">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-full bg-muted pl-10"
                />
            </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings />
              <span className="sr-only">Settings</span>
            </Link>
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
    const isDependencyMetricsPage = pathname.startsWith('/dependency-metrics');
    const isReleaseManagementPage = pathname.startsWith('/release-management');
    const isDocumentsPage = pathname.startsWith('/documents');
    const isFleetManagementPage = pathname.startsWith('/fleet-management');
    const isLicensePage = pathname.startsWith('/license');
    const isWorkflowPage = pathname.startsWith('/workflows');
    const isPlatformEngineeringPage = pathname.startsWith('/platform-engineering');


  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full flex-col">
        <Header user={user} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <Collapsible asChild defaultOpen={!isProductsPage && !isSpecificationsPage && !isApiDocsPage && !isAuditPage && !isSettingsPage && !isCmdbPage && !isDependencyMetricsPage && !isReleaseManagementPage && !isDocumentsPage && !isFleetManagementPage && !isLicensePage && !isWorkflowPage && !isPlatformEngineeringPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={!isProductsPage && !isSpecificationsPage && !isSettingsPage && !isDependencyMetricsPage && !isFleetManagementPage && !isLicensePage && !isWorkflowPage && !isPlatformEngineeringPage}
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

                 <SidebarMenuItem>
                    <SidebarMenuButton
                        isActive={isSpecificationsPage}
                        tooltip={{ children: 'Specifications' }}
                    >
                        <Link href="/specifications" className='flex items-center gap-2 w-full'>
                            <FileText />
                            Specifications
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                 <Collapsible asChild defaultOpen={isDocumentsPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        isActive={isDocumentsPage}
                        tooltip={{ children: 'Documents' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <BookCopy />
                        Documents
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                     <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/documents/service-contracts" isActive={pathname.startsWith('/documents/service-contracts')}>
                                Service Contracts
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
                 <Collapsible asChild defaultOpen={isPlatformEngineeringPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isPlatformEngineeringPage}
                        tooltip={{ children: 'Platform Engineering' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <Wrench />
                        Platform Engineering
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                          <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/platform-engineering/platform-foundations" isActive={pathname.startsWith('/platform-engineering/platform-foundations')}>
                             <Blocks className="mr-2"/> Platform Foundations
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <Collapsible asChild defaultOpen={pathname.startsWith('/platform-engineering/sdk')}>
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton>
                                <Rocket className="mr-2"/> SDK
                                <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton href="/platform-engineering/sdk" isActive={pathname === '/platform-engineering/sdk'}>
                                        Project Initializer
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                 <SidebarMenuSubItem>
                                    <SidebarMenuSubButton href="/platform-engineering/sdk/apps" isActive={pathname.startsWith('/platform-engineering/sdk/apps')}>
                                        Generated Applications
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                         <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/platform-engineering/app-catalog" isActive={pathname.startsWith('/platform-engineering/app-catalog')}>
                             <Grid3x3 className="mr-2"/> App Catalog
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/platform-engineering/no-code-platform" isActive={pathname.startsWith('/platform-engineering/no-code-platform')}>
                             <MousePointerClick className="mr-2"/> No Code Platform
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/platform-engineering/development-environments" isActive={pathname.startsWith('/platform-engineering/development-environments')}>
                             <TerminalSquare className="mr-2"/> Development Environments
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/platform-engineering/test-environments" isActive={pathname.startsWith('/platform-engineering/test-environments')}>
                             <FlaskConical className="mr-2"/> Test Environments
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/platform-engineering/simulators" isActive={pathname.startsWith('/platform-engineering/simulators')}>
                             <Waypoints className="mr-2"/> Simulators
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <Collapsible asChild defaultOpen={pathname.startsWith('/platform-engineering/quality')}>
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton href="/platform-engineering/quality" isActive={pathname === '/platform-engineering/quality'}>
                                        <BadgeCheck className="mr-2"/> Quality
                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                                    </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                     <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/platform-engineering/quality/static-analyzer" isActive={pathname.startsWith('/platform-engineering/quality/static-analyzer')}>
                                                <ScanLine className="mr-2"/> Static Analyzer
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/platform-engineering/quality/dynamic-analyzer" isActive={pathname.startsWith('/platform-engineering/quality/dynamic-analyzer')}>
                                                <ScanSearch className="mr-2"/> Dynamic Analyzer
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>


                <Collapsible asChild defaultOpen={isCmdbPage || isDependencyMetricsPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        isActive={isCmdbPage || isDependencyMetricsPage}
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
                         <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/dependency-metrics" isActive={isDependencyMetricsPage}>
                                <GitGraph className="mr-2"/> Dependency Metrics
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/cmdb/integration" isActive={pathname.startsWith('/cmdb/integration')}>
                                <DatabaseZap className="mr-2"/> CMDB Integration
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible asChild defaultOpen={isReleaseManagementPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        isActive={isReleaseManagementPage}
                        tooltip={{ children: 'Release Management' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <GanttChartSquare />
                        Release Managment
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                     <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/release-management/baseline" isActive={pathname.startsWith('/release-management/baseline')}>
                                <FileCode className="mr-2"/> Baseline
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
                
                <Collapsible asChild defaultOpen={isFleetManagementPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isFleetManagementPage}
                        tooltip={{ children: 'Fleet Management' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <Users />
                        Fleet Mgmt
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/fleet-management/deployment" isActive={pathname.startsWith('/fleet-management/deployment')}>
                            <Rocket className="mr-2"/> Deployment
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <Collapsible asChild defaultOpen={pathname.startsWith('/fleet-management/resource-management')}>
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton href="/fleet-management/resource-management" isActive={pathname.startsWith('/fleet-management/resource-management')}>
                                        <Globe className="mr-2"/> Resource Mgmt
                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                                    </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                     <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/fleet-management/resource-management/details" isActive={pathname.startsWith('/fleet-management/resource-management/details')}>
                                                <PieChart className="mr-2"/> Detailed View
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
                
                 <Collapsible asChild defaultOpen={isLicensePage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isLicensePage}
                        tooltip={{ children: 'License' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                         <FileKey2 />
                        License
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/license/usage" isActive={pathname.startsWith('/license/usage')}>
                            <BarChart className="mr-2"/> License Usage
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/license/product-licensing" isActive={pathname.startsWith('/license/product-licensing')}>
                            <BoxIcon className="mr-2"/> Product Licensing
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/license/tools" isActive={pathname.startsWith('/license/tools')}>
                             <Wrench className="mr-2"/> LMS Integrations
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible asChild defaultOpen={isWorkflowPage}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isWorkflowPage}
                        tooltip={{ children: 'Workflow' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <WorkflowIcon />
                        Workflow
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/workflows/integration" isActive={pathname.startsWith('/workflows/integration')}>
                            <DatabaseZap className="mr-2"/> Integration
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

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
                         <Link href="/settings" className='flex items-center gap-2 w-full'>
                            <Settings />
                            Settings
                         </Link>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                     <CollapsibleContent>
                      <SidebarMenuSub>
                         <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/settings/general" isActive={pathname.startsWith('/settings/general')}>
                             <DatabaseZap className="mr-2"/> Development
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/settings/onboarding" isActive={pathname.startsWith('/settings/onboarding')}>
                            <SlidersHorizontal className="mr-2"/> Onboarding
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/settings/approval" isActive={pathname.startsWith('/settings/approval')}>
                            <CheckSquare className="mr-2"/> Approval
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/settings/specifications" isActive={pathname.startsWith('/settings/specifications')}>
                            <HardDrive className="mr-2"/> Specifications
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/settings/cmdb" isActive={pathname.startsWith('/settings/cmdb')}>
                            <Database className="mr-2"/> CMDB
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/settings/baseline" isActive={pathname.startsWith('/settings/baseline')}>
                            <GanttChartSquare className="mr-2"/> Baseline
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
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild isActive={pathname.endsWith('#specification-settings')}>
                                        <Link href="/api-docs#specification-settings">Spec Settings</Link>
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
