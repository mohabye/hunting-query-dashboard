import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2, Edit2, Plus, Shield, User } from 'lucide-react';

export default function AdminUsers() {
  const { user, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'analyst',
  });

  // Mock user data - in real app, fetch from API
  const [users] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      username: 'admin',
      role: 'admin',
      createdAt: new Date('2026-01-15'),
      lastActivity: new Date('2026-02-09'),
    },
    {
      id: 2,
      name: 'Analyst User',
      email: 'analyst@example.com',
      username: 'analyst',
      role: 'analyst',
      createdAt: new Date('2026-01-20'),
      lastActivity: new Date('2026-02-08'),
    },
  ]);

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-red-400">Access Denied: Admin privileges required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOpenDialog = (userToEdit?: any) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        username: userToEdit.username,
        password: '',
        role: userToEdit.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'analyst',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.username) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Call API to save user
      toast.success(editingUser ? 'User updated successfully!' : 'User created successfully!');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(`Error saving user: ${(error as Error).message}`);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        // Call API to delete user
        toast.success('User deleted successfully!');
      } catch (error) {
        toast.error(`Error deleting user: ${(error as Error).message}`);
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-red-600' : 'bg-blue-600';
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-slate-400 mt-2">Create, update, and manage user accounts and roles</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
                <Plus size={18} className="mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="text-slate-200">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="johndoe"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-slate-200">
                    Password {editingUser && '(leave blank to keep current)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="text-slate-200">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSaveUser}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Active Users</CardTitle>
            <CardDescription>Total: {users.length} users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Username</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300">Created</TableHead>
                    <TableHead className="text-slate-300">Last Activity</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="border-slate-700 hover:bg-slate-700">
                      <TableCell className="text-slate-200 font-medium">{u.name}</TableCell>
                      <TableCell className="text-slate-400">{u.email}</TableCell>
                      <TableCell className="text-slate-400">{u.username}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded text-white text-sm ${getRoleBadgeColor(u.role)}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {u.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {u.lastActivity.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(u)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Monitoring */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">User Activity Log</CardTitle>
            <CardDescription>Recent user actions and modifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-3 bg-slate-700 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-slate-200 text-sm"><span className="font-semibold">admin</span> created new user <span className="font-semibold">analyst</span></p>
                  <p className="text-slate-500 text-xs">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-slate-700 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-slate-200 text-sm"><span className="font-semibold">analyst</span> created 5 new hunting queries</p>
                  <p className="text-slate-500 text-xs">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-slate-700 rounded">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-slate-200 text-sm"><span className="font-semibold">admin</span> updated user role for <span className="font-semibold">analyst</span></p>
                  <p className="text-slate-500 text-xs">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
