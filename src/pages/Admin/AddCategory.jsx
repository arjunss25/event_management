import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  IoAddOutline,
  IoAddCircleOutline,
  IoRemoveCircleOutline,
  IoPencil,
  IoTrash,
  IoCheckmark,
  IoClose,
} from 'react-icons/io5';
import axiosInstance from '../../axiosConfig';
import { useSelector } from 'react-redux';
import { selectEventGroupId } from '../../Redux/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import './AddCategory.css';

const AddCategory = () => {
  const [categories, setCategories] = useState([
    { id: 'role', label: 'Role/Position', fieldType: 'select', options: [] },
  ]);

  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('');
  const [newOptions, setNewOptions] = useState(['']);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempRoles, setTempRoles] = useState([]);
  const [existingPositions, setExistingPositions] = useState([]);
  const event_group_id = useSelector(selectEventGroupId);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [editedRoleName, setEditedRoleName] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);

  // New state for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add new state for position deletion confirmation
  const [showPositionDeleteModal, setShowPositionDeleteModal] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);

  // Add new loading state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {}, [event_group_id]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const fieldsResponse = await axiosInstance.get(
          `/add-employee-extrafields/?event_group=${event_group_id}`
        );
        const additionalFields = fieldsResponse.data.data.extra_fields.map(
          (field) => ({
            id: field.field_name,
            label: field.field_name,
            fieldType:
              field.field_type.toLowerCase() === 'option'
                ? 'select'
                : field.field_type.toLowerCase() === 'radio'
                ? 'radio'
                : field.field_type.toLowerCase() === 'checkbox'
                ? 'checkbox'
                : field.field_type.toLowerCase(),
            options:
              field.field_option && typeof field.field_option === 'object'
                ? Object.values(field.field_option).filter(Boolean)
                : [],
          })
        );

        const positionResponse = await axiosInstance.get(
          `/position-choices/?event_group=${event_group_id}`
        );
        const positionOptions = positionResponse.data.data.map(
          (pos) => pos.name
        );

        setExistingPositions(positionResponse.data.data);
        setCategories([
          {
            id: 'role',
            label: 'Role/Position',
            fieldType: 'select',
            options: positionOptions,
          },
          ...additionalFields,
        ]);
      } catch (error) {
        setErrorMessage('Failed to fetch categories');
        setShowError(true);
      }
    };

    if (event_group_id) {
      fetchInitialData();
    }
  }, [event_group_id]);

  const containsOnlyLetters = (str) => {
    return /^[A-Za-z\s]+$/.test(str);
  };

  const handleSavePositionChoices = async () => {
    try {
      const validRoles = tempRoles
        .map((role) => role.trim())
        .filter((role) => role !== '');

      if (!event_group_id || event_group_id === 'undefined') {
        setErrorMessage('Event group ID is missing or invalid');
        setShowError(true);
        return;
      }

      if (validRoles.length === 0) {
        setErrorMessage('Please enter at least one role');
        setShowError(true);
        return;
      }

      for (const role of validRoles) {
        const payload = {
          event_group: event_group_id,
          name: role,
        };

        const response = await axiosInstance.post(
          '/position-choices/',
          payload
        );
      }

      // Refresh the positions after saving
      const positionResponse = await axiosInstance.get(`/position-choices/`);
      const positionOptions = positionResponse.data.data.map((pos) => pos.name);

      setCategories(
        categories.map((cat) =>
          cat.id === 'role' ? { ...cat, options: positionOptions } : cat
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      if (error.response) {
        setErrorMessage(
          error.response.data.non_field_errors?.[0] ||
            'Failed to save position choices'
        );
      } else {
        setErrorMessage('Network error or unexpected issue');
      }

      setShowError(true);
    }
  };

  const handleAddCategory = async () => {
    // Reset any existing error messages
    setErrorMessage('');
    setShowError(false);

    // Validate required fields
    if (!newCategoryLabel.trim()) {
      setErrorMessage('Please enter a Field label');
      setShowError(true);
      setTimeout(() => setShowError(false), 1500);
      return;
    }

    // Add validation for letters only
    if (!containsOnlyLetters(newCategoryLabel)) {
      setErrorMessage('Field label can only contain letters');
      setShowError(true);
      setTimeout(() => setShowError(false), 1500);
      return;
    }

    if (!newFieldType) {
      setErrorMessage('Please select a field type');
      setShowError(true);
      setTimeout(() => setShowError(false), 1500);
      return;
    }

    // Validate options for select, radio, and checkbox fields
    if (['select', 'radio', 'checkbox'].includes(newFieldType)) {
      const validOptions = newOptions.filter((option) => option.trim());
      if (validOptions.length === 0) {
        setErrorMessage('Please add at least one option');
        setShowError(true);
        setTimeout(() => setShowError(false), 1500);
        return;
      }
    }

    try {
      if (!event_group_id) {
        setErrorMessage('Event group ID is missing');
        setShowError(true);
        setTimeout(() => setShowError(false), 1500);
        return;
      }

      const isDuplicate = categories.some(
        (cat) => cat.label.toLowerCase() === newCategoryLabel.toLowerCase()
      );

      if (isDuplicate) {
        setErrorMessage('This category already exists');
        setShowError(true);
        setTimeout(() => setShowError(false), 1500);
        return;
      }

      let payload;

      if (
        newCategoryLabel.toLowerCase() === 'role' ||
        newCategoryLabel.toLowerCase() === 'position'
      ) {
        payload = {
          name: newCategoryLabel,
          event_group: event_group_id,
        };

        await axiosInstance.post('/position-choices/', payload);
      } else {
        // Regular category payload
        payload = {
          field_name: newCategoryLabel,
          field_type:
            newFieldType === 'select'
              ? 'Option'
              : newFieldType === 'radio'
              ? 'Radio'
              : newFieldType === 'checkbox'
              ? 'Checkbox'
              : newFieldType.charAt(0).toUpperCase() + newFieldType.slice(1),
          event_group: event_group_id,
        };

        if (['select', 'radio', 'checkbox'].includes(newFieldType)) {
          payload.field_option = newOptions.reduce((acc, option, index) => {
            acc[`option${index + 1}`] = option;
            return acc;
          }, {});
        }
        await axiosInstance.post('/add-employee-extrafields/', payload);
      }

      const newCategory = {
        id: newCategoryLabel,
        label: newCategoryLabel,
        fieldType: newFieldType,
        options: ['radio', 'checkbox', 'select'].includes(newFieldType)
          ? newOptions
          : [],
      };

      setCategories([...categories, newCategory]);

      // Set success message and show success modal
      setSuccessMessage(`${newCategoryLabel} category added successfully`);
      setShowSuccessModal(true);

      // Reset form fields
      setNewCategoryLabel('');
      setNewFieldType('');
      setNewOptions(['']);

      // Automatically hide success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Failed to add category'
      );
      setShowError(true);
      setTimeout(() => setShowError(false), 1500);
    }
  };

  // Success Modal Component
  const SuccessModal = () => (
    <AnimatePresence>
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center notification"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl p-8 w-[90%] md:w-[400px] transform transition-all"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Success!
              </h3>
              <p className="text-gray-500 text-center mb-6">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const closeEditModal = () => {
    setCategories(
      categories.map((cat) =>
        cat.id === 'role' ? { ...cat, options: [...tempRoles] } : cat
      )
    );
    setIsEditModalOpen(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find((category) => category.id === categoryId);

    // Prevent deleting Role/Position
    if (category.id === 'role') {
      return;
    }

    setCategoryToDelete(category);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteStatus('loading');
    try {
      await axiosInstance.delete(
        `/delete-employee-fields/${categoryToDelete.label}/`
      );
      setDeleteStatus('success');

      // Update local state after successful deletion
      setTimeout(() => {
        setCategories(
          categories.filter((category) => category.id !== categoryToDelete.id)
        );
        setShowDeleteConfirmation(false);
        setCategoryToDelete(null);
        setDeleteStatus(null);
      }, 1500);
    } catch (error) {
      setDeleteStatus('error');
      setTimeout(() => {
        setShowDeleteConfirmation(false);
        setCategoryToDelete(null);
        setDeleteStatus(null);
      }, 1500);
    }
  };

  const handleEditRoles = () => {
    setTempRoles([...categories.find((cat) => cat.id === 'role').options]);
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    const originalRoles = categories.find((cat) => cat.id === 'role').options;
    setTempRoles([...originalRoles]);
    setIsEditModalOpen(false);
  };

  const handleAddRoleOption = () => {
    setTempRoles([...tempRoles, '']);
  };

  const handleDeletePositionClick = (index, role) => {
    const position = existingPositions.find((pos) => pos.name === role);
    setPositionToDelete({
      index,
      name: role,
      id: position?.id,
    });
    setShowPositionDeleteModal(true);
  };

  const handleConfirmPositionDelete = async () => {
    setIsLoading(true);
    try {
      if (!positionToDelete?.id) {
        throw new Error('Position ID not found');
      }

      await axiosInstance.delete(
        `/remove-employee-with-position/${positionToDelete.name}/${positionToDelete.id}/`
      );

      // Refresh the positions data
      const positionResponse = await axiosInstance.get(
        `/position-choices/?event_group=${event_group_id}`
      );
      const positionOptions = positionResponse.data.data.map((pos) => pos.name);
      setExistingPositions(positionResponse.data.data);

      // Update categories with new data
      setCategories(
        categories.map((cat) =>
          cat.id === 'role' ? { ...cat, options: positionOptions } : cat
        )
      );

      // Close both modals
      setShowPositionDeleteModal(false);
      setIsEditModalOpen(false);
      setPositionToDelete(null);

      // Show success message
      setSuccessMessage('Position deleted successfully');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      setErrorMessage('Failed to delete position');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleOptionChange = (index, value) => {
    const updatedRoles = [...tempRoles];
    updatedRoles[index] = value;
    setTempRoles(updatedRoles);
  };

  const ErrorPopup = () => (
    <AnimatePresence>
      {showError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-5 right-5 bg-white rounded-lg p-6 max-w-md notification"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Error</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setShowError(false)}
              className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      setErrorMessage('Position/Role name is required');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        event_group: event_group_id,
        name: newRoleName.trim(),
      };

      await axiosInstance.post('/position-choices/', payload);

      // Refresh the positions data
      const positionResponse = await axiosInstance.get(
        `/position-choices/?event_group=${event_group_id}`
      );
      const positionOptions = positionResponse.data.data.map((pos) => pos.name);
      setExistingPositions(positionResponse.data.data);

      // Update categories with new data
      setCategories(
        categories.map((cat) =>
          cat.id === 'role' ? { ...cat, options: positionOptions } : cat
        )
      );

      // Close the edit modal and reset form
      setIsEditModalOpen(false);
      setNewRoleName('');

      // Show success message
      setSuccessMessage('Position added successfully');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to add role');
      setShowError(true);
      setTimeout(() => setShowError(false), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (index, role) => {
    setEditingId(index);
    setEditedRoleName(role);
  };

  const handleSaveEdit = async (index) => {
    try {
      const oldRole = categories.find((cat) => cat.id === 'role').options[
        index
      ];
      const position = existingPositions.find((pos) => pos.name === oldRole);

      if (position) {
        const payload = {
          event_group: event_group_id,
          name: editedRoleName.trim(),
        };

        await axiosInstance.put(
          `/position-choices-details/${position.id}/`,
          payload
        );

        const updatedCategories = categories.map((cat) => {
          if (cat.id === 'role') {
            const newOptions = [...cat.options];
            newOptions[index] = editedRoleName.trim();
            return { ...cat, options: newOptions };
          }
          return cat;
        });

        setCategories(updatedCategories);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update role');
      setShowError(true);
    }
    setEditingId(null);
  };

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] md:w-[400px] transform transition-all">
        {deleteStatus === 'loading' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
            <p className="text-gray-600">Deleting category...</p>
          </div>
        )}

        {deleteStatus === 'success' && (
          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={() => {
                setShowDeleteConfirmation(false);
                setCategoryToDelete(null);
                setDeleteStatus(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IoClose className="w-6 h-6" />
            </button>
            <div className="w-12 h-12 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <p className="text-gray-600 text-center font-medium mb-6">
              Category deleted successfully!
            </p>
            <button
              onClick={() => {
                setShowDeleteConfirmation(false);
                setCategoryToDelete(null);
                setDeleteStatus(null);
              }}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {deleteStatus === 'error' && (
          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={() => {
                setShowDeleteConfirmation(false);
                setCategoryToDelete(null);
                setDeleteStatus(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IoClose className="w-6 h-6" />
            </button>
            <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <p className="text-red-600 text-center font-medium mb-6">
              Failed to delete category
            </p>
            <button
              onClick={() => {
                setShowDeleteConfirmation(false);
                setCategoryToDelete(null);
                setDeleteStatus(null);
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {deleteStatus === null && (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Delete Category
            </h3>
            <p className="text-gray-500 text-center mb-8">
              Are you sure you want to delete "{categoryToDelete?.label}"? This
              action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={deleteStatus === 'loading'}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                onClick={handleConfirmDelete}
                disabled={deleteStatus === 'loading'}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Add new Position Delete Confirmation Modal component
  const PositionDeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] md:w-[400px] transform transition-all">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
          Delete Position
        </h3>
        <p className="text-gray-500 text-center mb-6">
          Are you sure you want to delete "{positionToDelete?.name}"? All users
          registered with this position will be removed.
        </p>
        <div className="flex gap-4">
          <button
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            onClick={() => setShowPositionDeleteModal(false)}
          >
            Cancel
          </button>
          <button
            className={`flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleConfirmPositionDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Update Loader component
  const Loader = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 flex flex-col items-center">
        <div className="w-full h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Processing...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen ">
      <div className="w-full px-6 md:px-10 py-8 md:py-12">
        <h1 className="text-3xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
          Employee Fields
        </h1>
      </div>

      <div className="w-[93.3%] mx-auto bg-white rounded-2xl overflow-hidden">
        <div className="addcategory-main flex flex-col-reverse lg:flex-row">
          <div className="w-full lg:w-[60%] p-8 md:p-12 left-sec-category">
            <h2 className="text-2xl font-bold mb-10 text-gray-800">
              Active Fields
            </h2>
            <form className="space-y-8">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 ease-in-out"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {category.label}
                  </label>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {category.fieldType === 'select' && (
                      <div className="relative w-full md:w-[18rem]">
                        <select
                          className="w-full h-12 pl-4 pr-10 rounded-xl border-2 border-gray-200 
                                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                                   appearance-none bg-white text-gray-700 transition-all
                                   hover:border-gray-300"
                        >
                          <option value="">Select {category.label}</option>
                          {category.options?.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}

                    {['text', 'date', 'number'].includes(
                      category.fieldType
                    ) && (
                      <input
                        type={category.fieldType}
                        className="w-full md:w-[18rem] h-12 px-4 rounded-xl border-2 border-gray-200 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                 hover:border-gray-300 transition-all cursor-not-allowed bg-gray-100"
                        placeholder={`Enter ${category.label.toLowerCase()}`}
                        disabled={true}
                      />
                    )}

                    {category.fieldType === 'radio' && (
                      <div className="flex flex-col gap-2">
                        {category.options?.map((option, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name={category.id}
                              value={option}
                              disabled={true}
                              className="h-4 w-4 text-blue-500 cursor-not-allowed"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {category.fieldType === 'checkbox' && (
                      <div className="flex flex-col gap-2">
                        {category.options?.map((option, index) => (
                          <label
                            key={index}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              name={category.id}
                              value={option}
                              disabled={true}
                              className="h-4 w-4 text-blue-500 cursor-not-allowed"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {category.id === 'role' ? (
                      <button
                        type="button"
                        onClick={handleEditRoles}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl
                                 transition-all duration-300 ease-in-out transform hover:scale-105
                                 focus:ring-4 focus:ring-blue-200"
                      >
                        Add/Edit Roles
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl
                                 transition-all duration-300 ease-in-out transform hover:scale-105
                                 focus:ring-4 focus:ring-red-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </form>
          </div>

          <div className="w-full lg:w-[40%] right-sec-category bg-[#2D3436] p-5 md:p-12 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-black"></div>
            </div>

            {/* Content */}
            <div className="relative z-5">
              <h3 className="text-2xl font-bold mb-8 text-white">
                Add New Field
              </h3>
              <form className="w-full space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="categoryLabel"
                    className="text-sm text-gray-300 font-medium block"
                  >
                    Field Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="categoryLabel"
                    className="w-full h-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400
                             focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200
                             backdrop-blur-sm px-4"
                    placeholder="Enter field name"
                    value={newCategoryLabel}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || containsOnlyLetters(value)) {
                        setNewCategoryLabel(value);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="fieldType"
                    className="text-sm text-gray-300 font-medium block"
                  >
                    Field Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="fieldType"
                      className="w-full h-12 rounded-xl bg-white/10 border border-white/20 text-white
                               focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200
                               backdrop-blur-sm px-4 appearance-none"
                      value={newFieldType}
                      onChange={(e) => {
                        setNewFieldType(e.target.value);
                        if (
                          ['radio', 'checkbox', 'select'].includes(
                            e.target.value
                          )
                        ) {
                          setNewOptions(['']);
                        }
                      }}
                    >
                      <option value="" className="text-gray-800">
                        - Select Type -
                      </option>
                      <option value="text" className="text-gray-800">
                        Text
                      </option>
                      <option value="date" className="text-gray-800">
                        Date
                      </option>
                      <option value="number" className="text-gray-800">
                        Number
                      </option>
                      <option value="select" className="text-gray-800">
                        Dropdown
                      </option>
                      <option value="radio" className="text-gray-800">
                        Radio Button
                      </option>
                      <option value="checkbox" className="text-gray-800">
                        Checkbox
                      </option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {(newFieldType === 'radio' ||
                  newFieldType === 'checkbox' ||
                  newFieldType === 'select') && (
                  <div className="space-y-4 pt-4 ">
                    <h4 className="text-sm font-medium text-gray-300">
                      Options
                    </h4>
                    <div className="space-y-3  overflow-y-auto custom-scrollbar pr-2">
                      {newOptions.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 drop-options"
                        >
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const updatedOptions = [...newOptions];
                              updatedOptions[index] = e.target.value;
                              setNewOptions(updatedOptions);
                            }}
                            className="flex-1 h-12 option-field rounded-xl bg-white/10 border border-white/20 text-white
                                   focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200
                                   backdrop-blur-sm px-4"
                            placeholder={`Option ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewOptions(
                                newOptions.filter((_, i) => i !== index)
                              )
                            }
                            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 
                                   transition-all duration-200 flex-shrink-0"
                          >
                            <IoRemoveCircleOutline className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewOptions([...newOptions, ''])}
                      className="w-full h-12 rounded-xl border border-white/20 hover:bg-white/10
                               transition-all duration-200 flex items-center justify-center gap-2
                               text-white"
                    >
                      <IoAddCircleOutline className="w-5 h-5" />
                      Add Option
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="w-full h-12 mt-8 rounded-xl bg-white text-gray-900 font-medium
                           hover:bg-gray-100 transition-all duration-200 flex items-center 
                           justify-center gap-2 transform hover:scale-[1.02]"
                >
                  <IoAddOutline className="w-5 h-5" />
                  Add Field
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 modal-backdrop">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl w-[90%] max-w-2xl p-8 lg:ml-[300px] max-h-[80vh] flex flex-col"
          >
            {/* Header - Fixed at top */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-black">
                Manage Roles & Positions
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* Add new role section - Fixed below header */}
            <div className="mb-8">
              <div className="flex sm:flex-row flex-col sm:items-center items-start gap-3">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Enter new role name"
                  className="flex-1 w-full sm:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <button
                  onClick={handleAddRole}
                  disabled={isLoading}
                  className={`px-6 py-3 bg-black hover:bg-grey-600 text-white rounded-xl flex items-center gap-2 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <IoAddOutline className="w-5 h-5" />
                  )}
                  Add
                </button>
              </div>
            </div>

            {/* Roles list - Scrollable content */}
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                {categories.find((cat) => cat.id === 'role').options.length ===
                0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">No roles added yet</p>
                    <p className="text-sm">Start by adding a new role above</p>
                  </div>
                ) : (
                  categories
                    .find((cat) => cat.id === 'role')
                    .options.map((role, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        {editingId === index ? (
                          <div className="flex items-center w-full gap-2">
                            <input
                              type="text"
                              value={editedRoleName}
                              onChange={(e) =>
                                setEditedRoleName(e.target.value)
                              }
                              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-w-0"
                            />
                            <div className="flex-shrink-0 flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(index)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                <IoCheckmark className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <IoClose className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 font-medium">{role}</span>
                            <button
                              onClick={() => handleStartEdit(index, role)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <IoPencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeletePositionClick(index, role)
                              }
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <IoTrash className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </motion.div>
                    ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <SuccessModal />
      {showDeleteConfirmation && <DeleteConfirmationModal />}
      {showPositionDeleteModal && <PositionDeleteModal />}
      <ErrorPopup />
      {isLoading && <Loader />}
    </div>
  );
};

export default AddCategory;
