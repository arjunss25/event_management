import React, { useState, useMemo, useEffect } from 'react';
import { FaRegEye, FaChevronDown } from 'react-icons/fa';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import axios from 'axios';

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('/employeestable.json');
        if (!response.data || !response.data.employees) {
          throw new Error('No employees array in response data');
        }

        setEmployees(response.data.employees);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching employees');
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const positions = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    return [...new Set(employees.map(emp => emp.position))];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];

    return employees.filter(employee => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.phone.includes(searchQuery);

      const matchesPosition = positionFilter === '' || employee.position === positionFilter;

      const matchesAssignment =
        assignmentFilter === 'all' ||
        (assignmentFilter === 'assigned' && employee.currentlyAssigned) ||
        (assignmentFilter === 'unassigned' && !employee.currentlyAssigned);

      return matchesSearch && matchesPosition && matchesAssignment;
    });
  }, [employees, searchQuery, positionFilter, assignmentFilter]);

  const handleView = async (employeeId) => {
    try {
      const response = await axios.get(`api/employees/${employeeId}`);
      console.log('Employee details:', response.data);
    } catch (err) {
      console.error('Error viewing employee:', err);
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      await axios.delete(`api/employees/${employeeId}`);
      const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
      setEmployees(updatedEmployees);
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600">Loading employees...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-48 flex items-center justify-center flex-col">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            className="block md:w-[60%] lg:w-[30%] px-4 py-2 text-gray-600 border-2 rounded-full focus:outline-none"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-48">
          <select
            className="block w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none appearance-none"
            style={{ paddingRight: '2.5rem' }} // Add space for the icon
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            <option value="">All Positions</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          {/* Custom Icon */}
          <FaChevronDown className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="w-full bg-white rounded-lg p-4">
        <div className="relative overflow-x-auto">
          <div className="min-w-[1000px]">
            {employees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No employees found
              </div>
            ) : (
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-white uppercase bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">Employee ID</th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">Name</th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">Position</th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">Email</th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">Phone</th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">Currently Assigned</th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-6 text-black whitespace-nowrap">{employee.id}</td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">{employee.name}</td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">{employee.position}</td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">{employee.email}</td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">{employee.phone}</td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        <span
                          className={`px-5 py-1 rounded-full text-xs ${
                            employee.currentlyAssigned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {employee.currentlyAssigned ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-6 flex space-x-2">
                        <button onClick={() => handleView(employee.id)}>
                          <FaRegEye className="text-gray-500 hover:text-blue-500 text-[1.2rem]" />
                        </button>
                        <button onClick={() => handleDelete(employee.id)}>
                          <MdOutlineDeleteOutline className="text-gray-500 hover:text-red-500 text-[1.2rem]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTable;
