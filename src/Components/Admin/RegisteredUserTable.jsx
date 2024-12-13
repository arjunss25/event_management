import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRegisteredUsers, searchUsers } from '../../Redux/Slices/Admin/adminUserRegistrationSlice';
import { FaRegEye, FaSearch } from 'react-icons/fa';
import debounce from 'lodash/debounce';

const EmptyState = () => (
  <tr>
    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
      <div className="flex flex-col items-center justify-center">
        <p className="text-lg">No registered users available</p>
        <p className="text-sm text-gray-400"></p>
      </div>
    </td>
  </tr>
);

const LoadingSpinner = () => (
  <div className="w-full h-48 flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const TableContent = ({ users, navigate }) => (
  <table className="w-full text-sm text-left text-gray-500">
    <thead className="text-xs text-white uppercase bg-gray-800">
      <tr>
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
            <td className="px-6 py-4">{user.full_name}</td>
            <td className="px-6 py-4">{user.email}</td>
            <td className="px-6 py-4">{user.phone}</td>
            <td className="px-6 py-4">{formatDate(user.created_date)}</td>
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

const RegisteredUserTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { users, loading, error } = useSelector((state) => state.adminUserRegistration);

  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.trim()) {
        dispatch(searchUsers(term));
      } else {
        dispatch(fetchRegisteredUsers());
      }
    }, 300),
    [dispatch]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    dispatch(fetchRegisteredUsers());
  }, [dispatch]);

  return (
    <div className="w-full">
      <div className="w-full bg-white rounded-lg p-4">
        {/* Search Bar */}
        <div className="mb-6 relative w-full md:w-[60%] lg:w-[30%]">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search users..."
            className="w-full px-4 py-2 pl-10 text-gray-600 border-2 rounded-full focus:outline-none focus:border-gray-400"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
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