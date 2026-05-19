import { useEffect, useState } from 'react';
import { employeeService } from '../services/api';
import EmployeeForm from '../components/EmployeeForm';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      setEmployees(response.data.data);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.delete(id);
        setEmployees(employees.filter((e) => e.id !== id));
      } catch (err) {
        console.error('Failed to delete employee', err);
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setEditData(employee);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    setEditData(null);
  };

  if (loading) {
    return <div className="text-center p-8">Loading employees...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">👥 Employee Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
        >
          {showForm ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <EmployeeForm
            onClose={handleFormClose}
            onSuccess={() => {
              fetchEmployees();
              handleFormClose();
            }}
            editId={editingId}
            editData={editData}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{employee.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{employee.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{employee.department}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{employee.position}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-blue-500 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeManagement;
