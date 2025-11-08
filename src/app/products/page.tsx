
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const products = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-muted-foreground"
      >
        <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
        <line x1="8" y1="2" x2="8" y2="22" />
        <line x1="16" y1="2" x2="16" y2="22" />
      </svg>
    ),
    productName: 'Product A',
    owner: 'John Doe',
    deploymentType: 'Cloud',
    deployments: 5,
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-muted-foreground"
      >
        <path d="M20 12c0-4.42-3.58-8-8-8S4 7.58 4 12s3.58 8 8 8 8-3.58 8-8z" />
        <path d="M12 2a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4 4 4 0 0 0 4-4v0a4 4 0 0 0-4-4z" />
        <path d="M10.5 16a2.5 2.5 0 0 1 5 0" />
      </svg>
    ),
    productName: 'Product B',
    owner: 'Jane Smith',
    deploymentType: 'Airgapped',
    deployments: 3,
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-muted-foreground"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 14c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2" />
        <path d="M9 16c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2" />
      </svg>
    ),
    productName: 'Product C',
    owner: 'Peter Jones',
    deploymentType: 'On-Prem',
    deployments: 10,
  },
];

export default function ProductsPage() {
  return (
    <main className="flex-1 space-y-8 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button>CREATE PRODUCT</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Icon</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Deployment Type</TableHead>
                <TableHead>Deployments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.icon}</TableCell>
                  <TableCell className="font-medium">
                    {product.productName}
                  </TableCell>
                  <TableCell>{product.owner}</TableCell>
                  <TableCell>{product.deploymentType}</TableCell>
                  <TableCell>{product.deployments}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        VIEW
                      </Button>
                      <Button variant="outline" size="sm">
                        UPDATE
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-end space-x-6 p-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
            <Select>
              <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm font-medium">1-3 of 3</div>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
