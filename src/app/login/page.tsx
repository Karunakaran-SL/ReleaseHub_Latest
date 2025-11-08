import LoginForm from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-cyan-400 p-8 text-white">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-4xl font-bold">Welcome Back!</h1>
          <p className="text-lg">
            Sign in to access your One Stop Shop for managing all your operational needs. From fleet and product management to compliance and security, we have you covered.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-background p-4">
        <LoginForm />
      </div>
    </main>
  );
}
