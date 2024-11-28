import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoAddOutline, IoAddCircleOutline, IoRemoveCircleOutline, IoPencil, IoTrash, IoCheckmark, IoClose } from 'react-icons/io5';
import axiosInstance from '../../axiosConfig';
import { useSelector } from 'react-redux';
import { selectEventGroupId } from '../../Redux/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

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
  
        console.log('Payload being sent:', payload);
  
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
          await axiosInstance.post('/position-choices/', payload);
        } else {
          // Regular category payload
          payload = {
            field_name: newCategoryLabel,
            field_type: newFieldType === 'select' ? 'Option' : 
                       newFieldType === 'radio' ? 'Radio' : 
                       newFieldType === 'checkbox' ? 'Checkbox' : 
                       newFieldType.charAt(0).toUpperCase() + newFieldType.slice(1)
          };

          // Add options for dropdown, radio, and checkbox
          if (['select', 'radio', 'checkbox'].includes(newFieldType)) {
            payload.field_option = newOptions.reduce((acc, option, index) => {
              acc[`option${index + 1}`] = option;
              return acc;
            }, {});
          }

          // Add event_group_id to the payload
          payload.event_group = event_group_id;

          // API call to add new field
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
          className="fixed bottom-5 right-5 bg-white rounded-lg shadow-2xl p-6 max-w-md"
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
    <div className="bg-[#e6eed]">
      <div className="top-sec w-full flex flex-col md:flex-row items-start md:items-center justify-start px-10">
        <h1 className="text-[1.5rem] sm:text-[2rem] font-semibold mb-2 md:mb-0">Employee</h1>
      </div>

      <div className="w-[93.3%] h-auto bg-white mx-10 mt-7 rounded-lg flex flex-col-reverse lg:flex-row">
  <div className="main-cat w-full lg:w-[70%] h-full pl-0 lg:pl-7 mt-10 flex flex-col items-center lg:items-start justify-center">
    <h2 className="text-[1.3rem] font-medium mb-5">Categories</h2>
    <form className="w-full flex flex-col items-center lg:items-start justify-center gap-3">
      {categories.map((category) => (
        <div key={category.id} className="w-full lg:w-auto flex flex-col items-center lg:items-start justify-between gap-3 mt-4">
          <label>{category.label}</label>
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-between gap-5 lg:gap-7">
            {category.fieldType === 'select' && (
              <select className="w-[80%] sm:w-[60%] lg:w-[18vw] h-8 rounded-2xl text-[0.7rem] pl-3 border border-black">
                <option value="">- Select</option>
                {category.options?.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            )}

            {['radio', 'checkbox'].includes(category.fieldType) && (
              <div className="flex flex-col gap-2">
                {category.options?.map((option, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type={category.fieldType}
                      name={category.label}
                      value={option}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {/* Conditional Rendering for text, date, and number inputs */}
            {category.fieldType === 'text' && (
              <input
                type="text"
                className="w-[18vw] h-8 rounded-2xl text-[0.7rem] pl-3 border border-black"
                placeholder="Enter text"
              />
            )}

            {category.fieldType === 'date' && (
              <input
                type="date"
                className="w-[18vw] h-8 rounded-2xl text-[0.7rem] pl-3 border border-black"
              />
            )}

            {category.fieldType === 'number' && (
              <input
                type="number"
                className="w-[18vw] h-8 rounded-2xl text-[0.7rem] pl-3 border border-black"
                placeholder="Enter number"
              />
            )}

            {category.id === 'role' ? (
              <button type="button" onClick={handleEditRoles} className="px-5 py-2 rounded bg-blue-500 text-white">
                Edit
              </button>
            ) : (
              <button type="button" onClick={() => handleDeleteCategory(category.id)} className="px-3 py-2 rounded bg-[#FF5F5F] text-white">
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </form>
    <div className="flex justify-start mt-16">
      <button onClick={closeEditModal} className="px-7 py-2 bg-black text-white rounded">Save</button>
      </div>
  </div>

  <div className="cat w-full lg:w-[30%]  bg-[#2D3436] text-white flex flex-col items-center justify-start pt-10">
    <h3 className="mb-5">Add New Category</h3>
    <form className="w-full flex flex-col items-center justify-center gap-3">
      <label htmlFor="categoryLabel">Category Label</label>
      <input
        type="text"
        id="categoryLabel"
        className="w-[80%] sm:w-[50%] lg:w-[18vw] h-8 rounded-2xl text-[0.7rem] pl-3 text-black"
        placeholder="Name"
        value={newCategoryLabel}
        onChange={(e) => setNewCategoryLabel(e.target.value)}
      />

      <label htmlFor="fieldType">Field Type</label>
      <select
        id="fieldType"
        className="w-[80%] sm:w-[50%] lg:w-[18vw] h-8 rounded-2xl text-[0.7rem] pl-3 text-black"
        value={newFieldType}
        onChange={(e) => {
          setNewFieldType(e.target.value);
          if (['radio', 'checkbox', 'select'].includes(e.target.value)) {
            setNewOptions(['']);
          }
        }}
      >
        <option value="">- Select</option>
        <option value="text">Text</option>
        <option value="date">Date</option>
        <option value="number">Number</option>
        <option value="select">Dropdown</option>
        <option value="radio">Radio Button</option>
        <option value="checkbox">Checkbox</option>
      </select>

      {(newFieldType === 'radio' || newFieldType === 'checkbox' || newFieldType === 'select') && (
        <div>
          <h4 className="text-sm mb-4">Options:</h4>
          {newOptions.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const updatedOptions = [...newOptions];
                  updatedOptions[index] = e.target.value;
                  setNewOptions(updatedOptions);
                }}
                className="w-full h-8 rounded-2xl text-[0.7rem] pl-3 border border-black text-black"
              />
              <button type="button" onClick={() => setNewOptions(newOptions.filter((_, i) => i !== index))} className="ml-2 text-red-500">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setNewOptions([...newOptions, ''])} className="flex items-center gap-1 text-blue-500">
            <IoAddCircleOutline /> Add Option
          </button>
        </div>
      )}

      <div className="w-full flex items-center justify-center mt-4 mb-10">
        <button type="button" onClick={handleAddCategory} className="w-[80%] sm:w-[50%] lg:w-auto px-5 py-2 border border-white rounded-3xl">
          Add Category
        </button>
      </div>
    </form>
  </div>
</div>

    
{isEditModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl w-[90%] max-w-2xl p-8 shadow-2xl"
    >
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

      {/* Add new role section */}
      <div className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Enter new role name"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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