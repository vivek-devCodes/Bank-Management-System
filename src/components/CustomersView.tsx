import React, { useState, useEffect } from 'react';
import { Plus, ChevronsUpDown } from 'lucide-react';
import { customersAPI } from '../services/api';
import AddCustomer from './AddCustomer';
import EditCustomer from './EditCustomer';

const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      if (response.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error('Failed to fetch customers', error);
    }
    setLoading(false);
  };

  const handleAddCustomer = () => {
    setAddModalOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersAPI.delete(id);
        fetchCustomers();
      } catch (error) {
        console.error('Failed to delete customer', error);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage all your customers in one place.</p>
        </div>
        <button
          onClick={handleAddCustomer}
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Plus className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">All Customers</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-6 p-4 font-semibold text-gray-600 bg-gray-50">
              <div className="col-span-2 flex items-center gap-1">Name <ChevronsUpDown className="h-4 w-4" /></div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {customers.map((customer) => (
              <div key={customer._id} className="grid grid-cols-6 p-4 items-center">
                <div className="col-span-2 font-medium text-gray-900">{customer.firstName} {customer.lastName}</div>
                <div className="col-span-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {customer.status}
                  </span>
                </div>
                <div className="col-span-2 text-gray-600">{customer.email}</div>
                <div className="col-span-1 text-right space-x-2">
                  <button onClick={() => handleEditCustomer(customer)} className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => handleDeleteCustomer(customer._id)} className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddCustomer
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            setAddModalOpen(false);
            fetchCustomers();
          }}
        />
      )}

      {isEditModalOpen && selectedCustomer && (
        <EditCustomer
          customer={selectedCustomer}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            setEditModalOpen(false);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
};

export default CustomersView;