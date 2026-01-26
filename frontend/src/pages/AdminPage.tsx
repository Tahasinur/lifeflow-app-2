import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User } from '../types';
import adminService from '../services/adminService';

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: number) => {
    try {
      const response = await adminService.promoteUserToAdmin(userId);
      toast.success(response.message || 'User promoted to admin');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to promote user');
    }
  };

  const demoteToUser = async (userId: number) => {
    try {
      const response = await adminService.demoteUserToUser(userId);
      toast.success(response.message || 'User demoted to regular user');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to demote user');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await adminService.deleteUser(userId);
      toast.success(response.message || 'User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#37352F' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#9B9A97' }}>Manage users and their roles</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead style={{ backgroundColor: '#F7F7F5' }}>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#37352F' }}>
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#37352F' }}>
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#37352F' }}>
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#37352F' }}>
                Created At
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#37352F' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3 text-sm" style={{ color: '#37352F' }}>
                  {user.email}
                </td>
                <td className="px-6 py-3 text-sm" style={{ color: '#37352F' }}>
                  {user.name}
                </td>
                <td className="px-6 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm" style={{ color: '#9B9A97' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 text-sm">
                  <div className="flex gap-2">
                    {user.role === 'USER' ? (
                      <button
                        onClick={() => promoteToAdmin(user.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                      >
                        Promote
                      </button>
                    ) : (
                      <button
                        onClick={() => demoteToUser(user.id)}
                        className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition"
                      >
                        Demote
                      </button>
                    )}
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8" style={{ color: '#9B9A97' }}>
          No users found
        </div>
      )}
    </div>
  );
}
