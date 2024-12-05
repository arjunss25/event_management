import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoAddOutline, IoAddCircleOutline, IoRemoveCircleOutline, IoPencil, IoTrash, IoCheckmark, IoClose } from 'react-icons/io5';
import axiosInstance from '../../axiosConfig';
import { useSelector } from 'react-redux';
import { selectEventGroupId } from '../../Redux/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import './AddCategory.css'

const AddCategory = () => {
  const [categories, setCategories] = useState([
    { id: 'role', label: 'Role/Position', fieldType: 'select', options: [] }
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


  // Add console.log to debug
  useEffect(() => {
    console.log('Current event_group_id:', event_group_id);
  }, [event_group_id]);

  // Fetch initial categories and position choices
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch existing employee fields with event_group_id
        const fieldsResponse = await axiosInstance.get(`/add-employee-extrafields/?event_group=${event_group_id}`);
        const additionalFields = fieldsResponse.data.data.extra_fields.map(field => ({
          id: field.field_name,
          label: field.field_name,
          fieldType: field.field_type.toLowerCase() === 'option' ? 'select' :
                    field.field_type.toLowerCase() === 'radio' ? 'radio' :
                    field.field_type.toLowerCase() === 'checkbox' ? 'checkbox' : 
                    field.field_type.toLowerCase(),
          options: field.field_option && typeof field.field_option === 'object' 
            ? Object.values(field.field_option).filter(Boolean)
            : []
        }));
    
        // Fetch position choices with event_group_id
        const positionResponse = await axiosInstance.get(`/position-choices/?event_group=${event_group_id}`);
        const positionOptions = positionResponse.data.data.map(pos => pos.name);
        
        setExistingPositions(positionResponse.data.data);
        setCategories([
          { id: 'role', label: 'Role/Position', fieldType: 'select', options: positionOptions },
          ...additionalFields
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setErrorMessage('Failed to fetch categories');
        setShowError(true);
      }
    };

    if (event_group_id) {
      fetchInitialData();
    }
  }, [event_group_id]);




  const handleSavePositionChoices = async () => {
    try {
      const validRoles = tempRoles
        .map(role => role.trim())
        .filter(role => role !== '');
  
      console.log('Current event_group_id from Redux:', event_group_id);
      
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
  
      // If you want to send multiple roles, you might need to make multiple requests
      // or check with your backend how they want to receive multiple roles
      for (const role of validRoles) {
        const payload = {
          event_group: event_group_id,
          name: role
        };
  
        console.log('Position payload:', payload);
  
        const response = await axiosInstance.post('/position-choices/', payload);
        console.log('Server response:', response);
      }
  
      // Refresh the positions after saving
      const positionResponse = await axiosInstance.get(`/position-choices/`);
      const positionOptions = positionResponse.data.data.map(pos => pos.name);
      
      setCategories(categories.map(cat => 
        cat.id === 'role' ? { ...cat, options: positionOptions } : cat
      ));
      
      setIsEditModalOpen(false);
  
    } catch (error) {
      console.error('Complete error object:', error);
      
      if (error.response) {
        console.error('Detailed error response:', JSON.stringify(error.response.data, null, 2));
        setErrorMessage(error.response.data.non_field_errors?.[0] || 'Failed to save position choices');
      } else {
        setErrorMessage('Network error or unexpected issue');
      }
      
      setShowError(true);
    }
  };




  const handleAddCategory = async () => {
    if (newCategoryLabel && newFieldType) {
      try {
        if (!event_group_id) {
          setErrorMessage('Event group ID is missing');
          setShowError(true);
          return;
        }

        // Check for duplicate category
        const isDuplicate = categories.some(
          cat => cat.label.toLowerCase() === newCategoryLabel.toLowerCase()
        );

        if (isDuplicate) {
          setErrorMessage('This category already exists');
          setShowError(true);
          return;
        }

        let payload;
        
        // Special handling for Role/Position
        if (newCategoryLabel.toLowerCase() === 'role' || 
            newCategoryLabel.toLowerCase() === 'position') {
          payload = {
            name: newCategoryLabel,
            event_group: event_group_id
          };
          console.log('Role payload:', payload);
          await axiosInstance.post('/position-choices/', payload);
        } else {
          // Regular category payload
          payload = {
            field_name: newCategoryLabel,
            field_type: newFieldType === 'select' ? 'Option' : 
                       newFieldType === 'radio' ? 'Radio' : 
                       newFieldType === 'checkbox' ? 'Checkbox' : 
                       newFieldType.charAt(0).toUpperCase() + newFieldType.slice(1),
            event_group: event_group_id
          };

          // Add options for dropdown, radio, and checkbox
          if (['select', 'radio', 'checkbox'].includes(newFieldType)) {
            payload.field_option = newOptions.reduce((acc, option, index) => {
              acc[`option${index + 1}`] = option;
              return acc;
            }, {});
          }

          console.log('Category payload:', payload);
          await axiosInstance.post('/add-employee-extrafields/', payload);
        }

        const newCategory = {
          id: newCategoryLabel,
          label: newCategoryLabel,
          fieldType: newFieldType,
          options: ['radio', 'checkbox', 'select'].includes(newFieldType) ? newOptions : []
        };

        setCategories([...categories, newCategory]);
        setNewCategoryLabel('');
        setNewFieldType('');
        setNewOptions(['']);
      } catch (error) {
        console.error('Error adding category:', error);
        setErrorMessage(error.response?.data?.message || 'Failed to add category');
        setShowError(true);
      }
    }
  };


  const closeEditModal = () => {
    setCategories(categories.map(cat => 
      cat.id === 'role' ? { ...cat, options: [...tempRoles] } : cat
    ));
    setIsEditModalOpen(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    const categoryToDelete = categories.find(category => category.id === categoryId);
    
    // Prevent deleting Role/Position
    if (categoryToDelete.id === 'role') {
      return;
    }

    try {
      // Confirm deletion
      const confirmed = window.confirm(`Are you sure you want to delete the "${categoryToDelete.label}" category?`);
      if (!confirmed) return;

      // API call to delete field
      await axiosInstance.delete(`/delete-employee-fields/${categoryToDelete.label}/`);

      // Update local state
      setCategories(categories.filter(category => category.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEditRoles = () => {
    setTempRoles([...categories.find(cat => cat.id === 'role').options]);
    setIsEditModalOpen(true);
  };



  const handleCancelEdit = () => {
    const originalRoles = categories.find(cat => cat.id === 'role').options;
    setTempRoles([...originalRoles]);
    setIsEditModalOpen(false);
  };

  const handleAddRoleOption = () => {
    setTempRoles([...tempRoles, '']);
  };

  const handleRemoveRoleOption = async (index) => {
    try {
        const roleToRemove = tempRoles[index];
        const existingPosition = existingPositions.find(pos => pos.name === roleToRemove);

        if (existingPosition) {
            const payload = {
                event_group: event_group_id,
                name: roleToRemove
            };
            
            await axiosInstance.delete(`/position-choices-details/${existingPosition.id}/`, {
                data: payload
            });

            // Update existingPositions state
            setExistingPositions(prevPositions => 
                prevPositions.filter(pos => pos.id !== existingPosition.id)
            );

            // Update categories state
            setCategories(prevCategories => 
                prevCategories.map(cat => 
                    cat.id === 'role' 
                        ? { ...cat, options: cat.options.filter((_, i) => i !== index) }
                        : cat
                )
            );
        }

        // Update tempRoles state
        setTempRoles(tempRoles.filter((_, i) => i !== index));
    } catch (error) {
        console.error('Error removing position:', error);
        setErrorMessage('Failed to remove position. Please try again.');
        setShowError(true);
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
          className="fixed bottom-5 right-5 bg-white rounded-lg  p-6 max-w-md"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;

    try {
      const payload = {
        event_group: event_group_id,
        name: newRoleName.trim()
      };

      await axiosInstance.post('/position-choices/', payload);
      
      // Update local state
      const updatedCategories = categories.map(cat => 
        cat.id === 'role' 
          ? { ...cat, options: [...cat.options, newRoleName.trim()] }
          : cat
      );

      setCategories(updatedCategories);
      setNewRoleName('');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to add role');
      setShowError(true);
    }
  };

  const handleStartEdit = (index, role) => {
    setEditingId(index);
    setEditedRoleName(role);
  };

  const handleSaveEdit = async (index) => {
    try {
        const oldRole = categories.find(cat => cat.id === 'role').options[index];
        const position = existingPositions.find(pos => pos.name === oldRole);

        if (position) {
            const payload = {
                event_group: event_group_id,
                name: editedRoleName.trim()
            };

            await axiosInstance.put(`/position-choices-details/${position.id}/`, payload);

            const updatedCategories = categories.map(cat => {
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

  return (
    <div className="min-h-screen ">
      <div className="w-full px-6 md:px-10 py-8 md:py-12">
        <h1 className="text-3xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
          Employee Categories
        </h1>
      </div>

      <div className="w-[93.3%] mx-auto bg-white rounded-2xl overflow-hidden">
        <div className="addcategory-main flex flex-col-reverse lg:flex-row">
          <div className="w-full lg:w-[60%] p-8 md:p-12 left-sec-category">
            <h2 className="text-2xl font-bold mb-10 text-gray-800">Active Categories</h2>
            <form className="space-y-8">
              {categories.map((category) => (
                <div key={category.id} 
                     className="group p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 ease-in-out">
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
                            <option key={index} value={option}>{option}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {['text', 'date', 'number'].includes(category.fieldType) && (
                      <input
                        type={category.fieldType}
                        className="w-full md:w-[18rem] h-12 px-4 rounded-xl border-2 border-gray-200 
                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                 hover:border-gray-300 transition-all"
                        placeholder={`Enter ${category.label.toLowerCase()}`}
                      />
                    )}

                    {category.id === 'role' ? (
                      <button 
                        type="button" 
                        onClick={handleEditRoles}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl
                                 transition-all duration-300 ease-in-out transform hover:scale-105
                                 focus:ring-4 focus:ring-blue-200"
                      >
                        Edit Roles
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
              <h3 className="text-2xl font-bold mb-8 text-white">Add New Category</h3>
              <form className="w-full space-y-6">
                <div className="space-y-2">
                  <label htmlFor="categoryLabel" className="text-sm text-gray-300 font-medium block">
                    Category Label
                  </label>
                  <input
                    type="text"
                    id="categoryLabel"
                    className="w-full h-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400
                             focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200
                             backdrop-blur-sm px-4"
                    placeholder="Enter category name"
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="fieldType" className="text-sm text-gray-300 font-medium block">
                    Field Type
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
                        if (['radio', 'checkbox', 'select'].includes(e.target.value)) {
                          setNewOptions(['']);
                        }
                      }}
                    >
                      <option value="" className="text-gray-800">- Select Type -</option>
                      <option value="text" className="text-gray-800">Text</option>
                      <option value="date" className="text-gray-800">Date</option>
                      <option value="number" className="text-gray-800">Number</option>
                      <option value="select" className="text-gray-800">Dropdown</option>
                      <option value="radio" className="text-gray-800">Radio Button</option>
                      <option value="checkbox" className="text-gray-800">Checkbox</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {(newFieldType === 'radio' || newFieldType === 'checkbox' || newFieldType === 'select') && (
                  <div className="space-y-4 pt-4 ">
                    <h4 className="text-sm font-medium text-gray-300">Options</h4>
                    <div className="space-y-3  overflow-y-auto custom-scrollbar pr-2">
                      {newOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 drop-options">
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
                            onClick={() => setNewOptions(newOptions.filter((_, i) => i !== index))}
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
                  Add Category
                </button>
              </form>
            </div>
          </div>







        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z- ">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl w-[90%] max-w-2xl p-8 lg:ml-[300px] "
          >
            <div className="flex justify-between items-center mb-8 ">
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

            {/* Add new role section */}
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
                  className="px-6 py-3 bg-black hover:bg-grey-600 text-white rounded-xl flex items-center gap-2 transition-colors"
                >
                  <IoAddOutline className="w-5 h-5" />
                  Add
                </button>
              </div>
            </div>

            {/* Roles list */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {categories.find(cat => cat.id === 'role').options.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">No roles added yet</p>
                  <p className="text-sm">Start by adding a new role above</p>
                </div>
              ) : (
                categories.find(cat => cat.id === 'role').options.map((role, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {editingId === index ? (
                      <>
                        <input
                          type="text"
                          value={editedRoleName}
                          onChange={(e) => setEditedRoleName(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
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
                      </>
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
                          onClick={() => handleRemoveRoleOption(index)}
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
          </motion.div>
        </div>
      )}
      <ErrorPopup />
    </div>
  );
};

export default AddCategory;