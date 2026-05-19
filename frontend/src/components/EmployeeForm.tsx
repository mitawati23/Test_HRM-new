import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { employeeService } from '../services/api';

interface EmployeeFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editId?: string | null;
  editData?: any;
}

interface FormDataType {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
}

const EmployeeForm = ({ onClose, onSuccess, editId, editData }: EmployeeFormProps) => {
  const [formData, setFormData] = useState<FormDataType>(
    editData || {
      name: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      position: '',
      joinDate: '',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!editId && !formData.password.trim()) {
      setError('Password is required for new employees');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editId) {
        await employeeService.update(editId, formData);
      } else {
        await employeeService.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Operation failed';
      setError(`❌ ${errorMsg}`);
      console.error('Form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editId ? 'Edit Employee' : 'Add New Employee'}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" noValidate>
        {/* Name Field */}
        <div>
          <label htmlFor="name-input" className="block text-gray-700 font-semibold mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter employee full name"
            aria-label="Employee name"
            aria-required="true"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email-input" className="block text-gray-700 font-semibold mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email-input"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@company.com"
            aria-label="Employee email address"
            aria-required="true"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            required
            disabled={!!editId}
          />
          {editId && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
        </div>

        {/* Password Field - Only for Create */}
        {!editId && (
          <div>
            <label htmlFor="password-input" className="block text-gray-700 font-semibold mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              aria-label="Employee password"
              aria-required="true"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              minLength={6}
              required
            />
          </div>
        )}

        {/* Phone Field */}
        <div>
          <label htmlFor="phone-input" className="block text-gray-700 font-semibold mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="phone-input"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., 08123456789"
            aria-label="Employee phone number"
            aria-required="true"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Department Field */}
        <div>
          <label htmlFor="department-input" className="block text-gray-700 font-semibold mb-2">
            Department
          </label>
          <input
            id="department-input"
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., Sales, IT, HR"
            aria-label="Employee department"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Position Field */}
        <div>
          <label htmlFor="position-input" className="block text-gray-700 font-semibold mb-2">
            Position
          </label>
          <input
            id="position-input"
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="e.g., Manager, Staff, Lead"
            aria-label="Employee position"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Join Date Field */}
        <div>
          <label htmlFor="joinDate-input" className="block text-gray-700 font-semibold mb-2">
            Join Date
          </label>
          <input
            id="joinDate-input"
            type="date"
            name="joinDate"
            value={formData.joinDate}
            onChange={handleChange}
            aria-label="Employee join date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="col-span-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start" role="alert" aria-live="polite">
            <span className="mr-2">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* Form Buttons */}
        <div className="col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            aria-label={editId ? 'Update employee information' : 'Create new employee'}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <span>✓</span>
                {editId ? 'Update Employee' : 'Save Employee'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
