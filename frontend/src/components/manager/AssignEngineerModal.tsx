import React, { useState, useEffect } from 'react';
import { requestService } from '@/services/requestService';
import { User } from '@/types';
import { X, UserPlus } from 'lucide-react';

interface AssignEngineerModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number;
  onAssign: (engineerId: number, note: string) => Promise<void>;
}

export const AssignEngineerModal: React.FC<AssignEngineerModalProps> = ({
  isOpen, onClose, onAssign,
}) => {
  const [engineers, setEngineers] = useState<User[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<string>('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEngineers, setLoadingEngineers] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSelectedEngineer('');
      setNote('');
      requestService.getEngineers().then(data => {
        setEngineers(data);
        setLoadingEngineers(false);
      });
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedEngineer) return;
    setLoading(true);
    try {
      await onAssign(parseInt(selectedEngineer), note);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Assign Engineer</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Select Engineer
            </label>
            {loadingEngineers ? (
              <p className="text-sm text-gray-500">Loading engineers...</p>
            ) : (
              <select
                value={selectedEngineer}
                onChange={(e) => setSelectedEngineer(e.target.value)}
                className="input-field"
              >
                <option value="">-- Select an engineer --</option>
                {engineers.map(eng => (
                  <option key={eng.id} value={eng.id}>{eng.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Assignment Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="Add a note for the engineer..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-border">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!selectedEngineer || loading}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
