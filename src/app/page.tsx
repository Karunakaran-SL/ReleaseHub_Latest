'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Box,
  GanttChartSquare,
  LineChart,
  ListChecks,
  ShieldCheck,
} from 'lucide-react';
import type { User } from '@/lib/definitions';

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
  return (
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
  );
}
