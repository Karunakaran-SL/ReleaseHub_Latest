import { cn } from '@/lib/utils';
import { Rocket } from 'lucide-react';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-xl font-bold text-primary-foreground bg-primary p-2 rounded-lg', className)}>
      <Rocket className="h-6 w-6" />
      <span className='font-headline'>ReleaseHub</span>
    </div>
  );
}
