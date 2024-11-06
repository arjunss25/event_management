import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { fetchRegisteredUsers } from '../../Redux/Slices/Admin/adminUserRegistrationSlice';

// Create base selector
const selectAdminUserRegistrationState = (state) => state.adminUserRegistration || {
  users: [],
  loading: false,
  error: null
};

// Create memoized selectors for individual pieces of state
const selectUsers = createSelector(
  [selectAdminUserRegistrationState],
  (state) => state.users
);

const selectLoading = createSelector(
  [selectAdminUserRegistrationState],
  (state) => state.loading
);

const selectError = createSelector(
  [selectAdminUserRegistrationState],
  (state) => state.error
);

const RegisteredUserTable = () => {
  const dispatch = useDispatch();
  
  // Use individual selectors instead of selecting the whole slice
  const users = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchRegisteredUsers());
  }, [dispatch]);

  const tableRows = useMemo(() => (
    users.map((user) => (
      <tr key={user.id} className="bg-white hover:bg-gray-50">
        <td className="px-6 py-6 text-black whitespace-nowrap">{user.id}</td>
        <td className="px-6 py-6 text-black whitespace-nowrap">{user.username}</td>
        <td className="px-6 py-6 text-black whitespace-nowrap">{user.email}</td>
        <td className="px-6 py-6 text-black whitespace-nowrap">{user.phone}</td>
        <td className="px-6 py-6 text-black whitespace-nowrap">{user.registrationDate}</td>
        <td className="px-6 py-6 whitespace-nowrap">
          <button className="bg-blue-500 text-white px-4 py-1 rounded-md text-xs hover:bg-blue-600 transition-colors">
            View Profile
          </button>
        </td>
      </tr>
    ))
  ), [users]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-4 mt-10 registered-user-table-main">
      <div className="relative overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-gray-800">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">User ID</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Username</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Email ID</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Phone Number</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Registration Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegisteredUserTable;