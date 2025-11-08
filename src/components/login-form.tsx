'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock } from 'lucide-react';

const SignInSchema = z.object({
  username: z.string().min(1, { message: 'Please enter a valid username.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  rememberMe: z.boolean().default(false),
});

type SignInFormValues = z.infer<typeof SignInSchema>;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.message || 'An unexpected error occurred.';
        setErrorMessage(message);
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: message,
        });
      } else {
        router.push('/');
        router.refresh(); 
      }
    } catch (error) {
      const message = 'Failed to connect to the server. Please try again.';
      setErrorMessage(message);
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder=""
                required
                className="pl-10"
                {...form.register('username')}
              />
            </div>
            {form.formState.errors.username && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                placeholder=""
                required 
                className="pl-10"
                {...form.register('password')}
              />
            </div>
            {form.formState.errors.password && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center">
             <Checkbox id="rememberMe" {...form.register('rememberMe')} />
             <Label htmlFor="rememberMe" className="ml-2 font-normal">
                Remember me
             </Label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            SIGN IN
          </Button>
           {errorMessage && (
             <p aria-live="polite" className="text-sm font-medium text-destructive text-center">
              {errorMessage}
            </p>
          )}
        </form>
         <div className="mt-6 text-center text-sm">
            <Link href="#" className="text-primary hover:underline">
                Forgot password?
            </Link>
            <span className="text-muted-foreground"> Don't have an account? </span>
            <Link href="#" className="text-primary hover:underline">
                Sign Up
            </Link>
          </div>
      </CardContent>
    </Card>
  );
}
