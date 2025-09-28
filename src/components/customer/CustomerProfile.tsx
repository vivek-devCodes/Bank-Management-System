import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { customersAPI } from '../../services/api';

const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      // In a real app, you'd fetch customer data by user ID
      // For now, we'll use mock data based on the user
      const mockCustomerData = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '(555) 123-4567',
        address: '123 Main St, Springfield, IL 62701',
        dateOfBirth: '1990-01-01',
        createdAt: user?.createdAt || new Date().toISOString()
      };
      
      setCustomerData(mockCustomerData);
      setFormData({
        firstName: mockCustomerData.firstName,
        lastName: mockCustomerData.lastName,
        email: mockCustomerData.email,
        phone: mockCustomerData.phone,
        address: mockCustomerData.address
      });
    } catch (error) {
      console.error('Failed to fetch customer data', error);
      setError('Failed to load profile data');
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you'd update the customer data via API
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCustomerData({ ...customerData, ...formData });
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }

    setSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and account settings</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {customerData?.firstName} {customerData?.lastName}
            </h2>
            <p className="text-gray-600 mb-4">{customerData?.email}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <Calendar className="h-4 w-4" />
              <span>Member since {new Date(customerData?.createdAt).getFullYear()}</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-green-800">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Account Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{customerData?.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{customerData?.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{customerData?.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{customerData?.phone}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{customerData?.address}</p>
                )}
              </div>

              {/* Date of Birth (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Date of Birth
                </label>
                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                  {new Date(customerData?.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h3>
            <div className="space-y-4">
              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Change Password</h4>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
              </button>
              
              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;