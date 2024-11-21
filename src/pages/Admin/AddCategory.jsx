import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoAddOutline, IoAddCircleOutline, IoRemoveCircleOutline } from 'react-icons/io5';
import axiosInstance from '../../axiosConfig';

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

  // Fetch initial categories and position choices
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch existing employee fields
        const fieldsResponse = await axiosInstance.get('/add-employee-extrafields/');
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
    
        // Fetch position choices
        const positionResponse = await axiosInstance.get('/position-choices/');
        const positionOptions = positionResponse.data.data.map(pos => pos.name);
        
        // Store existing positions with their IDs
        setExistingPositions(positionResponse.data.data);
    
        setCategories([
          { id: 'role', label: 'Role/Position', fieldType: 'select', options: positionOptions },
          ...additionalFields
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  const handleSavePositionChoices = async () => {
    try {
      // Validate roles before processing
      const validRoles = tempRoles
        .map(role => role.trim())
        .filter(role => role !== '');
  
      if (validRoles.length === 0) {
        alert('Please enter at least one role');
        return;
      }
  
      const updatePromises = validRoles.map(role => {
        // Find if the role already exists
        const existingPosition = existingPositions.find(pos => pos.name === role);
  
        if (existingPosition) {
          // If role exists, update the existing position
          return axiosInstance.put(`/position-choices/${existingPosition.id}/`, { name: role });
        } else {
          // If role is new, create a new position
          return axiosInstance.post('/position-choices/', { 
            name: role 
          });
        }
      });
  
      // Execute all updates/creates
      const responses = await Promise.all(updatePromises);
  
      // Prepare updated positions list
      const updatedPositions = responses.map((response, index) => ({
        id: response.data.id || existingPositions.find(pos => pos.name === validRoles[index])?.id,
        name: validRoles[index]
      }));
  
      // Update existing positions state
      setExistingPositions([
        ...existingPositions.filter(pos => 
          !validRoles.includes(pos.name)
        ),
        ...updatedPositions
      ]);
  
      // Update categories with new roles
      setCategories(categories.map(cat => 
        cat.id === 'role' ? { ...cat, options: [...validRoles] } : cat
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving position choices:', error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      
      alert('Failed to save position choices. Please check the console for more details.');
    }
  };
  const handleAddCategory = async () => {
    if (newCategoryLabel && newFieldType) {
      try {
        // Prepare payload for API
        const payload = {
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
  
        // API call to add new field
        await axiosInstance.post('/add-employee-extrafields/', payload);
  
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

  const handleRemoveRoleOption = (index) => {
    setTempRoles(tempRoles.filter((_, i) => i !== index));
  };

  const handleRoleOptionChange = (index, value) => {
    const updatedRoles = [...tempRoles];
    updatedRoles[index] = value;
    setTempRoles(updatedRoles);
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg w-80">
            <h3 className="text-lg font-semibold">Edit Role/Position Options</h3>
            {tempRoles.map((role, index) => (
              <div key={index} className="flex items-center my-2">
                <input
                  type="text"
                  value={role}
                  onChange={(e) => handleRoleOptionChange(index, e.target.value)}
                  className="w-full border p-2 rounded"
                />
                <button onClick={() => handleRemoveRoleOption(index)} className="ml-2 text-red-500">
                  <IoRemoveCircleOutline />
                </button>
              </div>
            ))}
            <button onClick={handleAddRoleOption} className="mt-4 text-blue-500 flex items-center gap-1 mt-3">
              <IoAddCircleOutline /> Add Option
            </button>
            <div className="flex justify-end mt-4 gap-3">
              <button onClick={handleSavePositionChoices} className="px-7 py-2 bg-black text-white rounded">Save</button>
              <button onClick={handleCancelEdit} className="px-4 py-2 border border-black text-black rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategory;