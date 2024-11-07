import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRegisteredUsers } from '../../Redux/Slices/Admin/adminUserRegistrationSlice';

const RegisteredUserTable = () => {
  const dispatch = useDispatch();

  // Accessing data from Redux store
  const { users, loading, error } = useSelector((state) => state.adminUserRegistration);

  useEffect(() => {
    dispatch(fetchRegisteredUsers()); // Dispatch the action to fetch users
  }, [dispatch]);

  const tableRows = useMemo(() => {
    if (Array.isArray(users)) {
      return users.map((user) => (
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
      ));
    } else if (typeof users === 'object' && users !== null) {
      return Object.values(users).map((user) => (
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
      ));
    } else {
      return null;
    }
  }, [users]);

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