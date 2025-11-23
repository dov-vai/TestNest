'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { Edit2, Trash2, Check, X, User as UserIcon, Shield, ShieldOff } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export const UserManagement = () => {
  const { accessToken } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [editForm, setEditForm] = useState({
      name: '',
      email: '',
      role: 'user',
      isActive: true
  });

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchUsers();
  }, [accessToken]);

  const handleEditUser = (user: User) => {
      setEditingUser(user);
      setEditForm({
          name: user.name || '',
          email: user.email,
          role: user.role,
          isActive: user.isActive
      });
      setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
      if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
      try {
          const res = await fetchWithAuth(`/api/users/${id}`, {
              method: 'DELETE',
          });
          if (!res.ok) throw new Error('Failed to delete user');
          setUsers(prev => prev.filter(u => u.id !== id));
      } catch (e) {
          alert('Failed to delete user');
      }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;
      setFormLoading(true);

      try {
          const res = await fetchWithAuth(`/api/users/${editingUser.id}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(editForm)
          });
          
          if (!res.ok) throw new Error('Failed to update user');
          const updatedUser = await res.json();
          
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          setIsModalOpen(false);
      } catch (e) {
          alert('Failed to update user');
      } finally {
          setFormLoading(false);
      }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <span className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === 'admin' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center w-fit">
                        Admin
                      </span>
                  ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        User
                      </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isActive ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEditUser(user)} 
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit User"
      >
          <form onSubmit={handleUpdateUser} className="space-y-4">
              <Input 
                  label="Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
              <Input 
                  label="Email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  type="email"
              />
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value as 'user' | 'admin'})}
                  >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                  </select>
              </div>

              <div className="flex items-center">
                  <input
                      id="isActive"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active User
                  </label>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Button type="submit" isLoading={formLoading} className="w-full sm:ml-3 sm:w-auto">
                      Update
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="mt-3 w-full sm:mt-0 sm:w-auto">
                      Cancel
                  </Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

