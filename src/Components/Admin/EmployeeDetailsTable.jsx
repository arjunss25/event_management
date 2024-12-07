import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegEye, FaChevronDown } from 'react-icons/fa';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import axiosInstance from '../../axiosConfig';
import { debounce } from 'lodash';
import { auth } from '../../firebase/firebaseConfig';
import { deleteUser, signInWithEmailAndPassword } from 'firebase/auth';

const EmptyState = () => (
  <tr>
    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
      <div className="flex flex-col items-center justify-center">
        <p className="text-lg">No employees found</p>
        <p className="text-sm text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    </td>
  </tr>
);

const TableContent = ({
  employees,
  handleView,
  setSelectedEmployee,
  setShowModal,
}) => {
  return (
    <table className="w-full text-sm text-left text-gray-500">
      <thead className="text-xs text-white uppercase bg-gray-800">
        <tr>
          <th className="px-6 py-3">ID</th>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Position</th>
          <th className="px-6 py-3">Email</th>
          <th className="px-6 py-3">Phone</th>
          <th className="px-6 py-3">Assigned</th>
          <th className="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {employees.length > 0 ? (
          employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">{employee.id}</td>
              <td className="px-6 py-4">{employee.name}</td>
              <td className="px-6 py-4">{employee.position}</td>
              <td className="px-6 py-4">{employee.email}</td>
              <td className="px-6 py-4">{employee.phone}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    employee.currentlyAssigned
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {employee.currentlyAssigned ? 'No' : 'Yes'}
                </span>
              </td>
              <td className="px-6 py-4 flex space-x-2">
                <button onClick={() => handleView(employee.id)}>
                  <FaRegEye className="text-gray-500 hover:text-blue-500 text-[1.2rem]" />
                </button>
                <button
                  onClick={() => {
                    setSelectedEmployee(employee.id);
                    setShowModal(true);
                  }}
                >
                  <MdOutlineDeleteOutline className="text-gray-500 hover:text-red-500 text-[1.2rem]" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <EmptyState />
        )}
      </tbody>
    </table>
  );
};

const LoadingSpinner = () => (
  <div className="w-full h-48 flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 w-8 mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-gray-600">Loading employees...</div>
    </div>
  </div>
);

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const searchEmployees = async (searchTerm) => {
    try {
      const response = await axiosInstance.get(
        `/search-employee-start/${searchTerm}/`
      );
      if (response.data?.status_code !== 200) {
        setEmployees([]);
        return;
      }
      setEmployees(
        response.data.data.map((emp) => ({
          ...emp,
          currentlyAssigned: emp.is_available,
        }))
      );
    } catch (err) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(() => debounce(searchEmployees, 300), []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setLoading(true);
    if (value) {
      debouncedSearch(value);
    } else {
      fetchEmployees();
    }
  };

  const handlePositionChange = async (e) => {
    const position = e.target.value;
    setPositionFilter(position);
    setLoading(true);

    try {
      if (position) {
        const response = await axiosInstance.get(
          `/filter-employee-position/${position}/`
        );
        if (response.data?.status_code !== 200) {
          setEmployees([]);
          return;
        }
        setEmployees(
          response.data.data.map((emp) => ({
            ...emp,
            currentlyAssigned: emp.is_available,
          }))
        );
      } else {
        fetchEmployees();
      }
    } catch (err) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/list-all-employees/');
      if (response.data?.status_code !== 200) {
        setEmployees([]);
        return;
      }
      const employeeData = response.data.data.map((emp) => ({
        ...emp,
        currentlyAssigned: emp.is_available,
      }));
      setEmployees(employeeData);

      // Extract and store all unique positions
      const positions = [...new Set(employeeData.map((emp) => emp.position))];
      setAllPositions(positions);
    } catch (err) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter((employee) => {
      const matchesAssignment =
        assignmentFilter === 'all' ||
        (assignmentFilter === 'assigned' && employee.currentlyAssigned) ||
        (assignmentFilter === 'unassigned' && !employee.currentlyAssigned);
      return matchesAssignment;
    });
  }, [employees, assignmentFilter]);

  const handleView = (employeeId) => {
    navigate(`/admin/employee-profile/${employeeId}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const employee = employees.find((emp) => emp.id === selectedEmployee);
      if (!employee) {
        throw new Error('Employee not found');
      }

      console.log('Deleting employee:', {
        id: employee.id,
        email: employee.email,
        firebase_uid: employee.firebase_uid,
      });

      const response = await axiosInstance.delete(
        `/employee-details/${selectedEmployee}`
      );

      if (response.status === 200 || response.status === 204) {
        try {
          if (employee.firebase_uid) {
            console.log(
              'Attempting to delete Firebase user:',
              employee.firebase_uid
            );

            const firebaseResponse = await axiosInstance.post(
              '/delete-firebase-user/',
              {
                firebase_uid: employee.firebase_uid,
                email: employee.email,
              }
            );

            if (firebaseResponse.status === 200) {
              console.log('✅ Firebase user deleted successfully via backend');
            } else {
              console.warn(
                '⚠️ Backend Firebase deletion failed, attempting alternative method'
              );

              const alternativeResponse = await axiosInstance.delete(
                '/delete-firebase-user-alternative/',
                {
                  data: {
                    firebase_uid: employee.firebase_uid,
                    email: employee.email,
                  },
                }
              );

              if (alternativeResponse.status === 200) {
                console.log(
                  '✅ Firebase user deleted successfully via alternative method'
                );
              }
            }
          } else {
            console.warn('⚠️ No Firebase UID found for employee:', employee.id);
          }

          setEmployees(employees.filter((emp) => emp.id !== selectedEmployee));
          setShowModal(false);
        } catch (firebaseError) {
          console.error('Firebase deletion error:', {
            error: firebaseError,
            employee: employee.id,
            firebase_uid: employee.firebase_uid,
          });
        }
      }
    } catch (err) {
      console.error('Error deleting employee:', {
        error: err,
        employee: selectedEmployee,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <input
          type="text"
          className="block w-full md:w-[60%] lg:w-[30%] px-4 py-2 text-gray-600 border-2 rounded-full focus:outline-none"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div className="relative w-full md:w-48">
          <select
            className="block w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none appearance-none"
            value={positionFilter}
            onChange={handlePositionChange}
          >
            <option value="">All Positions</option>
            {allPositions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative w-full md:w-48">
          <select
            className="block w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none appearance-none"
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value)}
          >
            <option value="all">All Assignments</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="w-full bg-white rounded-lg p-4">
        <div className="relative overflow-x-auto">
          <TableContent
            employees={filteredEmployees}
            handleView={handleView}
            setSelectedEmployee={setSelectedEmployee}
            setShowModal={setShowModal}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] md:w-[400px] transform transition-all">
            {isDeleting ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
                <p className="text-gray-600">Deleting employee...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                    <MdOutlineDeleteOutline className="text-red-500 text-2xl" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Delete Employee
                </h3>
                <p className="text-gray-500 text-center mb-8">
                  This action cannot be undone. Are you sure you want to delete
                  this employee?
                </p>
                <div className="flex gap-4">
                  <button
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => setShowModal(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
