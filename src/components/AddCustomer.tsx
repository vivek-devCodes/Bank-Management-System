import React, { useState } from 'react';
import { customersAPI } from '../services/api';

interface AddCustomerProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    socialSecurityNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await customersAPI.create(formData);
      onSuccess();
    } catch (err) {
      setError('Failed to create customer. Please try again.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Add New Customer</h2>
        {error && <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full p-2 border rounded-md" required />
            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full p-2 border rounded-md" required />
          </div>
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded-md" required />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded-md" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full p-2 border rounded-md" />
          <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} placeholder="Date of Birth" className="w-full p-2 border rounded-md" />
          <input name="socialSecurityNumber" value={formData.socialSecurityNumber} onChange={handleChange} placeholder="Social Security Number" className="w-full p-2 border rounded-md" />
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;