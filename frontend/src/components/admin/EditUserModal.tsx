import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { X, UserCog } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (userId: number, name: string, email: string) => Promise<void>;
  currentUserId?: number;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
  currentUserId,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [isOpen, user]);

  const handleConfirm = async () => {
    if (!user || !name.trim() || !email.trim()) return;

    const hasChanged = name !== user.name || email !== user.email;
    if (!hasChanged) return;

    setLoading(true);
    try {
      await onUpdate(user.id, name.trim(), email.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    onClose();
  };

  if (!isOpen || !user) return null;

  const isOwnAccount = currentUserId === user.id;
  const hasChanged = name !== user.name || email !== user.email;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
            Edit User
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isOwnAccount && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Warning: You are editing your own account.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter email address"
            />
          </div>

          {hasChanged && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Changes will be saved for <strong>{user.role}</strong> user.
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
            disabled={!hasChanged || loading || !name.trim() || !email.trim()}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <UserCog className="w-4 h-4" />
            {loading ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </div>
    </div>
  );
};
