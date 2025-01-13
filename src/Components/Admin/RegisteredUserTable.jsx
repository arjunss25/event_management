import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaRegEye, FaSearch, FaTrash } from 'react-icons/fa';
import debounce from 'lodash/debounce';
import axiosInstance from '../../axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { MdOutlineDeleteOutline } from 'react-icons/md';

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

const DeleteModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] md:w-[400px] transform transition-all">
        {isDeleting ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
            <p className="text-gray-600">Deleting user...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                <MdOutlineDeleteOutline className="text-red-500 text-2xl" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Delete User
            </h3>
            <p className="text-gray-500 text-center mb-8">
              This action cannot be undone. Are you sure you want to delete this
              user?
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SuccessModal = ({ isVisible, message }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed inset-0 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-white rounded-lg p-8 flex flex-col items-center shadow-2xl relative"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4"
          >
            <motion.svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold text-gray-800 mb-2"
          >
            Success!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-center"
          >
            {message}
          </motion.p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const TableContent = ({ users, navigate, onDeleteUser }) => (
  <table className="w-full text-sm text-left text-gray-500">
    <thead className="text-xs text-white uppercase bg-gray-800">
      <tr>
        <th className="px-6 py-3">Full Name</th>
        <th className="px-6 py-3">Email</th>
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
            <td className="px-6 py-4">{formatDate(user.created_date)}</td>
            <td className="px-6 py-4 flex gap-4">
              <button onClick={() => navigate(`/admin/user/${user.id}`)}>
                <FaRegEye className="text-gray-500 hover:text-blue-500 text-[1.2rem]" />
              </button>
              <button onClick={() => onDeleteUser(user.id)}>
                <FaTrash className="text-gray-500 hover:text-red-500 text-[1.2rem]" />
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const showDeleteConfirmation = (userId) => {
    setSelectedUserId(userId);
    setModalMessage('Are you sure you want to delete this user?');
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await axiosInstance.delete('/delete-user/', {
        data: { user_id: selectedUserId.toString() },
      });

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUserId)
      );
      setIsModalOpen(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('/list-registered-users/');
        setUsers(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="w-full">
      <div className="w-full bg-white rounded-lg p-4">
        {/* Search Bar */}
        <div className="mb-6 relative w-full md:w-[60%] lg:w-[30%] mt-5">
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
            <TableContent
              users={users}
              navigate={navigate}
              onDeleteUser={showDeleteConfirmation}
            />
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Animated Success Modal */}
      <SuccessModal isVisible={showSuccess} message={successMessage} />
    </div>
  );
};

export default RegisteredUserTable;
