import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Navbar } from '@/components/common/Navbar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EditUserRoleModal } from '@/components/admin/EditUserRoleModal';
import { EditUserModal } from '@/components/admin/EditUserModal';
import { EditAssetModal } from '@/components/admin/EditAssetModal';
import { Users, Package, Plus, Truck, Edit, FolderOpen, Trash2 } from 'lucide-react';
import { requestService } from '@/services/requestService';
import { User, Asset } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit user role modal state
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit user modal state
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  // Edit asset modal state
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // User form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('customer');
  const [userSubmitting, setUserSubmitting] = useState(false);

  // Asset form state
  const [assetName, setAssetName] = useState('');
  const [assetModel, setAssetModel] = useState('');
  const [assetSerial, setAssetSerial] = useState('');
  const [assetLocation, setAssetLocation] = useState('');
  const [assetSubmitting, setAssetSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [userData, assetData] = await Promise.all([
        requestService.getAllUsers(),
        requestService.getAllAssets(),
      ]);
      setUsers(userData);
      setAssets(assetData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !userPassword.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setUserSubmitting(true);
    try {
      await requestService.createUser(userName.trim(), userEmail.trim(), userPassword, userRole);
      toast.success(`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} "${userName}" created successfully!`);
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserRole('customer');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create user');
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !assetModel.trim() || !assetSerial.trim() || !assetLocation.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setAssetSubmitting(true);
    try {
      await requestService.createAsset(
        assetName.trim(),
        assetModel.trim(),
        assetSerial.trim(),
        assetLocation.trim()
      );
      toast.success(`Equipment "${assetName}" added successfully!`);
      setAssetName('');
      setAssetModel('');
      setAssetSerial('');
      setAssetLocation('');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add equipment');
    } finally {
      setAssetSubmitting(false);
    }
  };

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setShowEditRoleModal(true);
  };

  const handleRoleUpdate = async (userId: number, newRole: string) => {
    try {
      await requestService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully!');
      loadData(); // Reload users to show updated role
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update user role');
      throw err; // Re-throw to let modal handle loading state
    }
  };

  const handleCloseEditModal = () => {
    setShowEditRoleModal(false);
    setSelectedUser(null);
  };

  // User update/delete handlers
  const handleEditUser = (user: User) => {
    setSelectedUserForEdit(user);
    setShowEditUserModal(true);
  };

  const handleUserUpdate = async (userId: number, name: string, email: string) => {
    try {
      await requestService.updateUser(userId, name, email);
      toast.success('User updated successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update user');
      throw err;
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (currentUser?.id === user.id) {
      toast.error('Cannot delete your own account');
      return;
    }

    try {
      await requestService.deleteUser(user.id);
      toast.success(`User "${user.name}" deleted successfully!`);
      loadData();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to delete user';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  const handleCloseEditUserModal = () => {
    setShowEditUserModal(false);
    setSelectedUserForEdit(null);
  };

  // Asset update/delete handlers
  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowEditAssetModal(true);
  };

  const handleAssetUpdate = async (
    assetId: number,
    assetName: string,
    model: string,
    serialNumber: string,
    location: string
  ) => {
    try {
      await requestService.updateAsset(assetId, assetName, model, serialNumber, location);
      toast.success('Equipment updated successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update equipment');
      throw err;
    }
  };

  const handleDeleteAsset = async (asset: Asset) => {
    try {
      await requestService.deleteAsset(asset.id);
      toast.success(`Equipment "${asset.asset_name}" deleted successfully!`);
      loadData();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to delete equipment';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  const handleCloseEditAssetModal = () => {
    setShowEditAssetModal(false);
    setSelectedAsset(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'customer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'engineer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-stone-800/30 dark:text-stone-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Manage users and equipment
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => navigate('/admin/product-deliveries')}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              Product Deliveries
            </button>
            <button
              onClick={() => navigate('/files')}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              File Manager
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">{users.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Total Users
            </h3>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">{assets.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
              Total Equipment
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-6 flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </h2>

            {/* Add User Form */}
            <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-gray-50 dark:bg-dark-bg rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add New User
              </h3>
              <input
                type="text"
                placeholder="Full Name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="input-field"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Password"
                value={userPassword}
                onChange={e => setUserPassword(e.target.value)}
                className="input-field"
              />
              <select
                value={userRole}
                onChange={e => setUserRole(e.target.value)}
                className="input-field"
              >
                <option value="customer">Customer</option>
                <option value="engineer">Engineer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={userSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </form>

            {/* Users List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map(u => (
                <div
                  key={u.id}
                  className="border border-gray-200 dark:border-dark-border rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-dark-text text-sm truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-stone-400 truncate">
                        {u.email}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getRoleBadgeColor(u.role)}`}
                    >
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditRole(u)}
                      className="flex-1 text-xs px-2 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-1 transition-colors"
                      title="Edit role"
                    >
                      <Edit className="w-3 h-3" />
                      Role
                    </button>
                    <button
                      onClick={() => handleEditUser(u)}
                      className="flex-1 text-xs px-2 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center gap-1 transition-colors"
                      title="Edit user details"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u)}
                      disabled={currentUser?.id === u.id}
                      className="px-2 py-1.5 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={currentUser?.id === u.id ? "Cannot delete yourself" : "Delete user"}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Management */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-6 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Equipment Management
            </h2>

            {/* Add Equipment Form */}
            <form onSubmit={handleCreateAsset} className="mb-6 p-4 bg-gray-50 dark:bg-dark-bg rounded-lg space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add New Equipment
              </h3>
              <input
                type="text"
                placeholder="Equipment Name"
                value={assetName}
                onChange={e => setAssetName(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Model"
                value={assetModel}
                onChange={e => setAssetModel(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Serial Number"
                value={assetSerial}
                onChange={e => setAssetSerial(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Location"
                value={assetLocation}
                onChange={e => setAssetLocation(e.target.value)}
                className="input-field"
              />
              <button
                type="submit"
                disabled={assetSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assetSubmitting ? 'Adding...' : 'Add Equipment'}
              </button>
            </form>

            {/* Assets List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assets.map(a => (
                <div
                  key={a.id}
                  className="border border-gray-200 dark:border-dark-border rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0 mb-2">
                    <p className="font-medium text-gray-900 dark:text-dark-text text-sm">
                      {a.asset_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-stone-400">
                      <span>{a.model}</span>
                      <span>·</span>
                      <span>{a.serial_number}</span>
                      <span>·</span>
                      <span>{a.location}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditAsset(a)}
                      className="flex-1 text-xs px-2 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center justify-center gap-1 transition-colors"
                      title="Edit equipment"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(a)}
                      className="px-2 py-1.5 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                      title="Delete equipment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Role Modal */}
      <EditUserRoleModal
        isOpen={showEditRoleModal}
        onClose={handleCloseEditModal}
        user={selectedUser}
        onUpdate={handleRoleUpdate}
        currentUserId={currentUser?.id}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditUserModal}
        onClose={handleCloseEditUserModal}
        user={selectedUserForEdit}
        onUpdate={handleUserUpdate}
        currentUserId={currentUser?.id}
      />

      {/* Edit Asset Modal */}
      <EditAssetModal
        isOpen={showEditAssetModal}
        onClose={handleCloseEditAssetModal}
        asset={selectedAsset}
        onUpdate={handleAssetUpdate}
      />
    </div>
  );
};
