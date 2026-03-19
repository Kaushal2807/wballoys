import React, { useState, useEffect } from 'react';
import { Asset } from '@/types';
import { X, Package } from 'lucide-react';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onUpdate: (
    assetId: number,
    assetName: string,
    model: string,
    serialNumber: string,
    location: string
  ) => Promise<void>;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
  onUpdate,
}) => {
  const [assetName, setAssetName] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && asset) {
      setAssetName(asset.asset_name);
      setModel(asset.model);
      setSerialNumber(asset.serial_number);
      setLocation(asset.location);
    }
  }, [isOpen, asset]);

  const handleConfirm = async () => {
    if (!asset || !assetName.trim() || !model.trim() || !serialNumber.trim() || !location.trim()) {
      return;
    }

    const hasChanged =
      assetName !== asset.asset_name ||
      model !== asset.model ||
      serialNumber !== asset.serial_number ||
      location !== asset.location;

    if (!hasChanged) return;

    setLoading(true);
    try {
      await onUpdate(
        asset.id,
        assetName.trim(),
        model.trim(),
        serialNumber.trim(),
        location.trim()
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAssetName('');
    setModel('');
    setSerialNumber('');
    setLocation('');
    onClose();
  };

  if (!isOpen || !asset) return null;

  const hasChanged =
    assetName !== asset.asset_name ||
    model !== asset.model ||
    serialNumber !== asset.serial_number ||
    location !== asset.location;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
            Edit Equipment
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Equipment Name
            </label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="input-field"
              placeholder="Enter equipment name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Model
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-field"
              placeholder="Enter model"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Serial Number
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="input-field"
              placeholder="Enter serial number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              placeholder="Enter location"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-border">
          <button onClick={handleClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasChanged || loading}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            {loading ? 'Updating...' : 'Update Equipment'}
          </button>
        </div>
      </div>
    </div>
  );
};
