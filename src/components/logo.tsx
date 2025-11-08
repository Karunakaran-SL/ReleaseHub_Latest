import { cn } from '@/lib/utils';
import { Rocket } from 'lucide-react';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Rocket className="h-6 w-6 text-primary" />
      <span className='font-bold text-xl'>ReleaseHub</span>
    </div>
  );
}
