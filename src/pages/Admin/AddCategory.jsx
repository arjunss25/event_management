import React, { useState } from 'react';
import { IoAddOutline, IoAddCircleOutline, IoRemoveCircleOutline } from 'react-icons/io5';

const AddCategory = () => {
  const [categories, setCategories] = useState([
    { id: 'department', label: 'Department', fieldType: 'select' },
    { id: 'employmentType', label: 'Employment Type', fieldType: 'select', options: ['Full Time', 'Part Time'] },
    { id: 'role', label: 'Role/Position', fieldType: 'select', options: ['Manager', 'Developer', 'Designer'] }
  ]);

  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('');
  const [newOptions, setNewOptions] = useState(['']);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempRoles, setTempRoles] = useState([...categories.find(cat => cat.id === 'role').options]);

  const handleAddCategory = () => {
    if (newCategoryLabel && newFieldType) {
      const newCategory = {
        id: Date.now(),
        label: newCategoryLabel,
        fieldType: newFieldType,
        options: ['radio', 'checkbox', 'select'].includes(newFieldType) ? newOptions : []
      };
      setCategories([...categories, newCategory]);
      setNewCategoryLabel('');
      setNewFieldType('');
      setNewOptions(['']);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    const categoryToDelete = categories.find(category => category.id === categoryId);
    if (categoryToDelete && (categoryToDelete.id === 'department' || categoryToDelete.id === 'employmentType')) {
      const confirmed = window.confirm(`Are you sure you want to delete the "${categoryToDelete.label}" category?`);
      if (!confirmed) return;
    }
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  const handleEditRoles = () => {
    setTempRoles([...categories.find(cat => cat.id === 'role').options]);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCategories(categories.map(cat => 
      cat.id === 'role' ? { ...cat, options: [...tempRoles] } : cat
    ));
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
      <div className="top-sec w-full flex flex-col md:flex-row items-start md:items-center justify-between px-10">
        <h1 className="text-[1.5rem] sm:text-[2rem] font-semibold mb-2 md:mb-0">Employee</h1>
        <button className="px-3 py-2 bg-black text-white flex items-center gap-2 rounded-md text-sm md:text-base">
          <IoAddOutline className="text-white" /> Add Employee
        </button>
      </div>

      <div className="w-[93.3%] h-auto lg:h-[70vh] bg-white mx-10 mt-7 rounded-lg flex flex-col-reverse lg:flex-row">
        <div className="main-cat w-[70%] h-full pl-7 mt-10">
          <h2 className="text-[1.3rem] font-medium mb-5">Categories</h2>
          <form className="flex flex-col items-start justify-center gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col items-start justify-between gap-3 mt-4">
                <label>{category.label}</label>
                <div className="flex items-center justify-between gap-7">
                  {category.fieldType === 'select' && (
                    <select className="w-[18vw] h-8 rounded-2xl text-[0.7rem] pl-3 border border-black">
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
                  {category.id === 'role' ? (
                    <button type="button" onClick={handleEditRoles} className="px-3 py-2 rounded bg-blue-500 text-white">
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
        </div>

        <div className="cat w-full lg:w-[30%] h-full bg-[#2D3436] text-white flex flex-col items-center justify-start pt-10">
          <h3 className="mb-5">Add New Category</h3>
          <form className="flex flex-col items-start justify-center gap-3">
            <label htmlFor="categoryLabel">Category Label</label>
            <input
              type="text"
              id="categoryLabel"
              className="w-[18vw] h-8 rounded-2xl text-[0.7rem] pl-3 text-black"
              placeholder="Name"
              value={newCategoryLabel}
              onChange={(e) => setNewCategoryLabel(e.target.value)}
            />

            <label htmlFor="fieldType">Field Type</label>
            <select
              id="fieldType"
              className="w-[18vw] h-8 rounded-2xl text-[0.7rem] pl-3 text-black"
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
                <h4 className="text-sm">Options:</h4>
                {newOptions.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [...newOptions];
                        updatedOptions[index] = e.target.value;
                        setNewOptions(updatedOptions);
                      }}
                      className="w-full h-8 rounded-2xl text-[0.7rem] pl-3 border border-black"
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

            <div className="w-full flex items-center justify-center mt-4">
              <button type="button" onClick={handleAddCategory} className="px-5 py-2 border border-white rounded-3xl">
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
            <button onClick={handleAddRoleOption} className="mt-4 text-blue-500 flex items-center gap-1">
              <IoAddCircleOutline /> Add Option
            </button>
            <div className="flex justify-end mt-4">
              <button onClick={closeEditModal} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategory;

