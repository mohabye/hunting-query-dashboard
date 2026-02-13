import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shield, LogOut, Settings, User, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function TopBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600';
      case 'analyst':
        return 'bg-blue-600';
      default:
        return 'bg-slate-600';
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-900/30 sticky top-0 z-50 shadow-lg shadow-cyan-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 p-2 rounded-lg shadow-lg shadow-cyan-600/50">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">HUNTING QUERY DASHBOARD</h1>
              <p className="text-xs text-cyan-400/80">Threat Intelligence & MITRE ATT&CK Coverage</p>
            </div>
          </div>

          {/* Right: User Info and Menu */}
          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="text-slate-300 hover:text-white"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/mitre')}
                className="text-slate-300 hover:text-white"
              >
                <BarChart3 size={16} className="mr-2" />
                MITRE Navigator
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/ai-tools')}
                className="text-slate-300 hover:text-white"
              >
                AI Tools
              </Button>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3 hover:bg-slate-700/50 transition">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{user?.name || user?.email || 'User'}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getRoleBadgeColor(user?.role || 'user')} text-white`}>
                        {user?.role?.toUpperCase() || 'USER'}
                      </span>
                      <span className="text-xs text-cyan-400">OPERATIONAL</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-cyan-600/50">
                    <User size={16} className="text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-slate-700" />
                
                {/* Admin Only Options */}
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setLocation('/admin/users')}
                      className="text-slate-300 cursor-pointer hover:bg-slate-700"
                    >
                      <Settings size={16} className="mr-2" />
                      User Management
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                  </>
                )}

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 cursor-pointer hover:bg-slate-700"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-t border-cyan-900/20 px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Status: <span className="text-emerald-400 font-semibold">● Online</span></span>
          <span>Last Activity: Just now</span>
        </div>
      </div>
    </div>
  );
}
