import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Lock, User } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const loginMutation = trpc.auth.login.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        username: formData.username,
        password: formData.password,
      });
      
      console.log('Login result:', result); // Debug log
      
      if (result.success) {
        toast.success('Login successful!');
        
        // Store user info in localStorage
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        
        // Force redirect to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error); // Debug log
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">HUNTING</h1>
          </div>
          <p className="text-slate-400">Threat Intelligence & MITRE ATT&CK Coverage</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Secure Login</CardTitle>
            <CardDescription>Enter your credentials to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    Username
                  </div>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g., admin"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </div>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
              <p className="text-sm text-slate-300 mb-2 font-semibold">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-slate-400">
                <p><span className="text-slate-300">Username:</span> admin</p>
                <p><span className="text-slate-300">Password:</span> admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2026 Hunting Query Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
