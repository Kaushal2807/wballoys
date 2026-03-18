import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { X, UserCog } from 'lucide-react';

interface EditUserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (userId: number, newRole: string) => Promise<void>;
  currentUserId?: number;
}

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer', description: 'Can create service requests and track orders' },
  { value: 'engineer', label: 'Engineer', description: 'Can accept and work on service requests' },
  { value: 'manager', label: 'Manager', description: 'Can assign work and manage team' },
  { value: 'admin', label: 'Admin', description: 'Full system access and user management' },
];

export const EditUserRoleModal: React.FC<EditUserRoleModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
  currentUserId,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role);
    }
  }, [isOpen, user]);

  const handleConfirm = async () => {
    if (!user || !selectedRole || selectedRole === user.role) return;

    setLoading(true);
    try {
      await onUpdate(user.id, selectedRole);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRole('');
    onClose();
  };

  if (!isOpen || !user) return null;

  const isOwnRole = currentUserId === user.id;
  const hasRoleChanged = selectedRole !== user.role;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
            Edit User Role
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-dark-border/50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>

          {isOwnRole && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ You cannot change your own role for security reasons.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={isOwnRole}
              className="input-field"
            >
              {ROLE_OPTIONS.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {selectedRole && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {ROLE_OPTIONS.find(r => r.value === selectedRole)?.description}
              </p>
            )}
          </div>

          {hasRoleChanged && !isOwnRole && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Role will change from <strong>{user.role}</strong> to <strong>{selectedRole}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-border">
          <button onClick={handleClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasRoleChanged || loading || isOwnRole}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <UserCog className="w-4 h-4" />
            {loading ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );
};