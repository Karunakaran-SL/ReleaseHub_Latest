
'use client';
import { useState, useEffect } from 'react';
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
  Settings2,
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
  GitBranch,
  Shield,
  Fingerprint,
  UserCheck,
  BookLock,
  Landmark,
  FileArchive,
  HelpCircle,
  Plug,
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
import { canView, setRolesCache } from '@/lib/rbac';

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
                    <div className="text-xs text-muted-foreground capitalize truncate max-w-[120px]">
                      {(user?.roles || (user?.role ? [user.role] : ['viewer'])).join(', ')}
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
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {(user?.roles || (user?.role ? [user.role] : ['viewer'])).join(', ')}
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
  const [installedPlugins, setInstalledPlugins] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/system/plugins/list').then(res => res.json()),
      fetch('/api/roles').then(res => res.json())
    ]).then(([pluginData, rolesData]) => {
      if (pluginData.success) {
        setInstalledPlugins(pluginData.plugins);
      }
      if (rolesData.success) {
        // Transform array into an object mapping for the cache
        const cache: Record<string, { permissions: any }> = {};
        for (const r of rolesData.roles) {
          cache[r.name] = { permissions: r.permissions };
        }
        setRolesCache(cache);
      }
    }).catch(err => console.error("Failed to fetch dashboard requirements", err));
  }, []);

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
  const isWorkflowPage = pathname.startsWith('/workflows');
  const isPlatformEngineeringPage = pathname.startsWith('/platform-engineering');
  const isCicdPage = pathname.startsWith('/cicd');
  const isCompliancePage = pathname.startsWith('/compliance');
  const isHelpPage = pathname.startsWith('/help');
  const isPluginsPage = pathname.startsWith('/plugins');

  // Map icon strings from plugin.json to Lucide components
  const IconMapper = ({ name, className }: { name: string, className?: string }) => {
    switch (name) {
      case 'Box': return <Box className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Rocket': return <Rocket className={className} />;
      case 'Users': return <Users className={className} />;
      case 'HelpCircle': return <HelpCircle className={className} />;
      case 'Puzzle': return <Puzzle className={className} />;
      default: return <Plug className={className} />;
    }
  };

  // Helper: extract nav items of a given type from installed plugins
  function getPluginNavItems(type: string) {
    const items: any[] = [];
    for (const plugin of installedPlugins) {
      const navArray = Array.isArray(plugin.navigation) ? plugin.navigation : (plugin.navigation ? [plugin.navigation] : []);
      for (const nav of navArray) {
        if (nav.type === type) {
          items.push({ ...nav, pluginId: plugin.id, pluginName: plugin.name });
        }
      }
    }
    return items;
  }

  const dashboardPlugins = getPluginNavItems('dashboard-submenu');
  const rawMainMenuPlugins = getPluginNavItems('main-menu');
  const mainMenuPlugins = rawMainMenuPlugins.reduce((acc: any[], nav: any) => {
    const existing = acc.find(item => item.label === nav.label);
    if (existing) {
      if (nav.children) {
        existing.children = [...(existing.children || []), ...nav.children];
      }
    } else {
      acc.push({ ...nav, children: nav.children ? [...nav.children] : [] });
    }
    return acc;
  }, []);
  const helpPlugins = getPluginNavItems('help');
  const settingsPlugins = getPluginNavItems('submenu').filter((n: any) => n.parent === 'Settings');


  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full flex-col">
        <Header user={user} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                {canView(user?.roles || user?.role, 'dashboard') && (
                  <Collapsible asChild defaultOpen={!isProductsPage && !isSpecificationsPage && !isApiDocsPage && !isAuditPage && !isSettingsPage && !isCmdbPage && !isDependencyMetricsPage && !isReleaseManagementPage && !isDocumentsPage && !isFleetManagementPage && !isWorkflowPage && !isPlatformEngineeringPage && !isCicdPage && !isCompliancePage && !isHelpPage}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={!isProductsPage && !isSpecificationsPage && !isSettingsPage && !isDependencyMetricsPage && !isFleetManagementPage && !isWorkflowPage && !isPlatformEngineeringPage && !isCicdPage && !isCompliancePage && !isHelpPage}
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
                            <SidebarMenuSubButton href="/dashboard/data-flow" isActive={pathname.startsWith('/dashboard/data-flow')}>
                              Data Flow Mgmt
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/dashboard/release-baseline-mgmt" isActive={pathname.startsWith('/dashboard/release-baseline-mgmt')}>
                              Release & Baseline Mgmt
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/dashboard/fleet-mgmt" isActive={pathname.startsWith('/dashboard/fleet-mgmt')}>
                              Fleet Mgmt
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/dashboard/workflow-mgmt" isActive={pathname.startsWith('/dashboard/workflow-mgmt')}>
                              Workflow Mgmt
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/dashboard/security-monitoring" isActive={pathname.startsWith('/dashboard/security-monitoring')}>
                              Security Monitoring
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/dashboard/compliance-monitoring" isActive={pathname.startsWith('/dashboard/compliance-monitoring')}>
                              Compliance Monitoring
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          {dashboardPlugins.filter((n: any) => !n.feature || canView(user?.roles || user?.role, n.feature)).map((nav: any) => (
                            <SidebarMenuSubItem key={`${nav.pluginId}-${nav.label}`}>
                              <SidebarMenuSubButton href={nav.path} isActive={pathname.startsWith(nav.path)}>
                                <IconMapper name={nav.icon} className="mr-2 h-4 w-4" /> {nav.label}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}

                {canView(user?.roles || user?.role, 'products') && (
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
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>
                  </Collapsible>
                )}

                {canView(user?.roles || user?.role, 'specifications') && (
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
                )}

                {canView(user?.roles || user?.role, 'documents') && (
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
                )}
                {canView(user?.roles || user?.role, 'platform_engineering') && (
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
                              <Blocks className="mr-2" /> Platform Foundations
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <Collapsible asChild defaultOpen={pathname.startsWith('/platform-engineering/sdk')}>
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuSubButton>
                                  <Rocket className="mr-2" /> SDK
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
                              <Grid3x3 className="mr-2" /> App Catalog
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/platform-engineering/no-code-platform" isActive={pathname.startsWith('/platform-engineering/no-code-platform')}>
                              <MousePointerClick className="mr-2" /> No Code Platform
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/platform-engineering/development-environments" isActive={pathname.startsWith('/platform-engineering/development-environments')}>
                              <TerminalSquare className="mr-2" /> Development Environments
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/platform-engineering/test-environments" isActive={pathname.startsWith('/platform-engineering/test-environments')}>
                              <FlaskConical className="mr-2" /> Test Environments
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/platform-engineering/simulators" isActive={pathname.startsWith('/platform-engineering/simulators')}>
                              <Waypoints className="mr-2" /> Simulators
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <Collapsible asChild defaultOpen={pathname.startsWith('/platform-engineering/quality')}>
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuSubButton href="/platform-engineering/quality" isActive={pathname === '/platform-engineering/quality'}>
                                  <BadgeCheck className="mr-2" /> Quality
                                  <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                                </SidebarMenuSubButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton href="/platform-engineering/quality/static-analyzer" isActive={pathname.startsWith('/platform-engineering/quality/static-analyzer')}>
                                      <ScanLine className="mr-2" /> Static Analyzer
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton href="/platform-engineering/quality/dynamic-analyzer" isActive={pathname.startsWith('/platform-engineering/quality/dynamic-analyzer')}>
                                      <ScanSearch className="mr-2" /> Dynamic Analyzer
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
                )}

                {canView(user?.roles || user?.role, 'workflows') && (
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
                            <SidebarMenuSubButton href="/workflows/n8n-ui" isActive={pathname.startsWith('/workflows/n8n-ui')}>
                              <WorkflowIcon className="mr-2" /> Default
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/workflows/integration" isActive={pathname.startsWith('/workflows/integration')}>
                              <DatabaseZap className="mr-2" /> Integration
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}

                {mainMenuPlugins.filter((n: any) => !n.feature || canView(user?.roles || user?.role, n.feature)).map((nav: any) => (
                  <Collapsible key={`${nav.pluginId}-${nav.label}`} asChild defaultOpen={isPluginsPage && pathname.startsWith(nav.path)}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={pathname.startsWith(nav.path)}
                          tooltip={{ children: nav.label }}
                          className="data-[state=open]:bg-sidebar-accent"
                        >
                          <IconMapper name={nav.icon} />
                          {nav.label}
                          {nav.children && nav.children.length > 0 && (
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {nav.children && nav.children.length > 0 && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {nav.children.map((child: any, idx: number) => (
                              child.children && child.children.length > 0 ? (
                                <Collapsible key={idx} asChild defaultOpen={isPluginsPage && pathname.startsWith(child.path)}>
                                  <SidebarMenuSubItem>
                                    <CollapsibleTrigger asChild>
                                      <SidebarMenuSubButton isActive={pathname.startsWith(child.path)} className="cursor-pointer">
                                        <IconMapper name={child.icon} className="mr-2 h-4 w-4" /> {child.label}
                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                                      </SidebarMenuSubButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <SidebarMenuSub>
                                        {child.children.map((subChild: any, subIdx: number) => (
                                          <SidebarMenuSubItem key={subIdx}>
                                            <SidebarMenuSubButton href={subChild.path} isActive={pathname.startsWith(subChild.path)}>
                                              <IconMapper name={subChild.icon} className="mr-2 h-4 w-4" /> {subChild.label}
                                            </SidebarMenuSubButton>
                                          </SidebarMenuSubItem>
                                        ))}
                                      </SidebarMenuSub>
                                    </CollapsibleContent>
                                  </SidebarMenuSubItem>
                                </Collapsible>
                              ) : (
                                <SidebarMenuSubItem key={idx}>
                                  <SidebarMenuSubButton href={child.path} isActive={pathname.startsWith(child.path)}>
                                    <IconMapper name={child.icon} className="mr-2 h-4 w-4" /> {child.label}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                ))}

                {canView(user?.roles || user?.role, 'audits') && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isAuditPage}
                      tooltip={{ children: 'Audit' }}
                    >
                      <Link href="/audits" className='flex items-center gap-2 w-full'>
                        <ShieldCheck />
                        Audit
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {canView(user?.roles || user?.role, 'settings') && (
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
                              <Settings2 className="mr-2" /> General
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/settings/onboarding" isActive={pathname.startsWith('/settings/onboarding')}>
                              <SlidersHorizontal className="mr-2" /> Onboarding
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/settings/approval" isActive={pathname.startsWith('/settings/approval')}>
                              <CheckSquare className="mr-2" /> Approval
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/settings/cicd" isActive={pathname.startsWith('/settings/cicd')}>
                              <GitBranch className="mr-2" /> CICD
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/settings/cmdb" isActive={pathname.startsWith('/settings/cmdb')}>
                              <HardDrive className="mr-2" /> CMDB
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>

                          {canView(user?.roles || user?.role, 'user_management') && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton href="/settings/user-management" isActive={pathname.startsWith('/settings/user-management')}>
                                <Users className="mr-2" /> User Management
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}

                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/settings/plugins" isActive={pathname.startsWith('/settings/plugins')}>
                              <Plug className="mr-2" /> Plugins
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>

                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton href="/settings/specifications" isActive={pathname.startsWith('/settings/specifications')}>
                              <FileText className="mr-2" /> Specifications
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          {settingsPlugins.filter((n: any) => !n.feature || canView(user?.roles || user?.role, n.feature)).map((nav: any) => (
                            <SidebarMenuSubItem key={`${nav.pluginId}-${nav.label}`}>
                              <SidebarMenuSubButton href={nav.path} isActive={pathname.startsWith(nav.path)}>
                                <IconMapper name={nav.icon} className="mr-2 h-4 w-4" /> {nav.label}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}

                <Collapsible asChild defaultOpen={isHelpPage}>
                  <SidebarMenuItem className="mt-auto">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isHelpPage}
                        tooltip={{ children: 'Help' }}
                        className="data-[state=open]:bg-sidebar-accent"
                      >
                        <HelpCircle />
                        Help
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/api-docs">API Documentation</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/help/plugins" isActive={pathname.startsWith('/help/plugins')}>
                            <Plug className="mr-2 h-4 w-4" /> Plugins
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/quick-start">Quick Start</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/specifications">Speciifcations</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/products">Products</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/cmdb">CMDB</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/platform-engineering">Platform Engineering</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/offline-cd">Offline CD</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/deployments">Deployments</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/release-baseline">Release & Baseline</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/ci-integrations">CI Integrations</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/workflows">Workflows</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/onboarding-settings">Onboarding Settings</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/fleet-mgmt">Fleet Mgmnt</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/resource-mgmt">Resource Mgmt</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/audit">Audit</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton href="/help/license">License</SidebarMenuSubButton></SidebarMenuSubItem>
                        {helpPlugins.map((nav: any) => (
                          <SidebarMenuSubItem key={`${nav.pluginId}-${nav.label}`}>
                            <SidebarMenuSubButton href={nav.path} isActive={pathname.startsWith(nav.path)}>
                              <IconMapper name={nav.icon} className="mr-2 h-4 w-4" /> {nav.label}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
          </Sidebar >
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div >
        <Footer />
      </div >
    </SidebarProvider >
  );
}
