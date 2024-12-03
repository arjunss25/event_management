import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRegisteredUsers } from '../../Redux/Slices/Admin/adminUserRegistrationSlice';
import { FaRegEye } from 'react-icons/fa';

// Add these new components
const EmptyState = () => (
  <tr>
    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
      <div className="flex flex-col items-center justify-center">
        <p className="text-lg">No users found</p>
        <p className="text-sm text-gray-400">No registered users available</p>
      </div>
    </td>
  </tr>
);

const LoadingSpinner = () => (
  <div className="w-full h-48 flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

const TableContent = ({ users, navigate }) => (
  <table className="w-full text-sm text-left text-gray-500">
    <thead className="text-xs text-white uppercase bg-gray-800">
      <tr>
        <th className="px-6 py-3">ID</th>
        <th className="px-6 py-3">Full Name</th>
        <th className="px-6 py-3">Email</th>
        <th className="px-6 py-3">Phone</th>
        <th className="px-6 py-3">Registration Date</th>
        <th className="px-6 py-3">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {users.length > 0 ? (
        users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">{user.id}</td>
            <td className="px-6 py-4">{user.full_name}</td>
            <td className="px-6 py-4">{user.email}</td>
            <td className="px-6 py-4">{user.phone}</td>
            <td className="px-6 py-4">{user.created_date}</td>
            <td className="px-6 py-4">
              <button onClick={() => navigate(`/admin/user/${user.id}`)}>
                <FaRegEye className="text-gray-500 hover:text-blue-500 text-[1.2rem]" />
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

// Update the main component
const RegisteredUserTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get users from the Redux store
  const { users, loading, error } = useSelector((state) => state.adminUserRegistration);

  useEffect(() => {
    dispatch(fetchRegisteredUsers());
  }, [dispatch]);

  return (
    <div className="w-full">
      <div className="w-full bg-white rounded-lg p-4">
        <div className="relative overflow-x-auto">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-4 text-red-500">Error: {error}</div>
          ) : (
            <TableContent users={users} navigate={navigate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisteredUserTable;