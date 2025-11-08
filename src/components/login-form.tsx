'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const SignInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type SignInFormValues = z.infer<typeof SignInSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Sign In
    </Button>
  );
}

export default function LoginForm() {
  const [state, dispatch] = useFormState(signIn, undefined);
  const { toast } = useToast();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Welcome to ReleaseHub</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
              {...form.register('email')}
            />
             {form.formState.errors.email && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              {...form.register('password')}
            />
            {form.formState.errors.password && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <SubmitButton />
          {state?.message && (
             <p aria-live="polite" className="text-sm font-medium text-destructive text-center">
              {state.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
