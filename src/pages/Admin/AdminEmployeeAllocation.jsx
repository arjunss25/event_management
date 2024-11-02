import React, { useEffect } from 'react';
import './AdminEmployeeAllocation.css'
import { useDispatch, useSelector } from 'react-redux';
import { IoMdClose } from 'react-icons/io';
import { FiSearch } from 'react-icons/fi';
import { IoIosArrowDown } from "react-icons/io";
import {
  fetchCategories,
  fetchEmployees,
  setSelectedCategory,
  addEmployee,
  removeEmployee,
  removeCategory,
  setSearchTerm,
  selectCategories,
  selectEmployees,
  selectAllocatedSections,
  selectSelectedCategory,
  selectStatus,
  selectError,
  selectSearchTerm
} from '../../Redux/Slices/Admin/employeeAllocationSlice';

const AdminEmployeeAllocation = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const categories = useSelector(selectCategories);
  const employees = useSelector(selectEmployees);
  const allocatedSections = useSelector(selectAllocatedSections);
  const selectedCategory = useSelector(selectSelectedCategory);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const searchTerm = useSelector(selectSearchTerm);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleCategorySelect = (category) => {
    dispatch(setSelectedCategory(category));
  };

  const handleAddEmployee = (employee) => {
    if (selectedCategory) {
      dispatch(addEmployee(employee));
    }
  };

  const handleRemoveEmployee = (categoryName, employeeId) => {
    dispatch(removeEmployee({ categoryName, employeeId }));
  };

  const handleRemoveCategory = (categoryName) => {
    if (window.confirm(`Are you sure you want to remove ${categoryName}?`)) {
      dispatch(removeCategory(categoryName));
    }
  };

  const handleSearchChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  // Get the currently allocated employee IDs for the selected category
  const getAllocatedEmployeeIds = () => {
    const selectedSection = allocatedSections.find(
      section => section.category === selectedCategory
    );
    return selectedSection ? selectedSection.employees.map(emp => emp.id) : [];
  };

  // Updated filtering logic
  const filteredEmployees = employees.filter(employee => {
    // Check if employee matches the selected category
    const matchesCategory = employee.category === selectedCategory;
    
    // Check if employee matches the search term
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if employee is already allocated
    const allocatedIds = getAllocatedEmployeeIds();
    const isNotAllocated = !allocatedIds.includes(employee.id);
    
    return matchesCategory && matchesSearch && isNotAllocated;
  });

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Data</p>
          <p>{error}</p>
          <button 
            onClick={() => {
              dispatch(fetchCategories());
              dispatch(fetchEmployees());
            }}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen  lg:flex-row flex-col  gap-4 employee-allocation-main">
      {/* Left Section - Allocated Employees */}
      <div className="w-full lg:w-1/2 bg-white rounded-lg p-2 employee-allocation-left ">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Employee Allocation</h2>
        {allocatedSections.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No categories have been allocated yet. Select a category and add employees.
          </div>
        ) : (
          allocatedSections.map((section) => (
            <div key={section.category} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">{section.category}</h3>
                <button
                  onClick={() => handleRemoveCategory(section.category)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                >
                  Remove Category
                </button>
              </div>
              {section.employees.length === 0 ? (
                <div className="text-gray-500 text-sm">No employees allocated to this category</div>
              ) : (
                section.employees.map((employee) => (
                  <div 
                    key={employee.id} 
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2 shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <span className="font-medium">{employee.name}</span>
                      <span className="text-sm text-gray-500 ml-2">#{employee.id}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveEmployee(section.category, employee.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      title="Remove employee"
                    >
                      <IoMdClose size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>

      {/* Right Section - Employee Selection */}
      <div className="w-full lg:w-1/2 bg-black rounded-lg p-6  employee-allocation-right">
        <h2 className="text-xl font-semibold mb-6 text-white">Add Employees to Category</h2>
        
        {/* Category Selection */}
        <div className="mb-6 relative">
  <select
    value={selectedCategory}
    onChange={(e) => handleCategorySelect(e.target.value)}
    className="w-full p-3 pr-10 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors appearance-none"
  >
    <option value="">Select Category</option>
    {categories.map((category) => (
      <option key={category.id} value={category.name}>
        {category.name}
      </option>
    ))}
  </select>

  {/* SVG icon positioned on the right */}
  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
    <IoIosArrowDown />
  </span>
</div>


        {/* Search Box */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
          />
          <FiSearch 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-lg p-2 lg:p-4">
          <div className="grid grid-cols-3 gap-4 mb-4 font-medium text-gray-700 border-b pb-2">
            <div>ID</div>
            <div>Name</div>
            <div></div>
          </div>
          <div className="employee-allocation-table space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
            {!selectedCategory ? (
              <div className="text-center text-gray-500 py-4">
                Please select a category to view available employees
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No available employees found for this category
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div key={employee.id} className="grid grid-cols-3 gap-4 items-center py-2 hover:bg-gray-50">
                  <div className="text-gray-600">#{employee.id}</div>
                  <div className="text-gray-800">{employee.name}</div>
                  <button
                    onClick={() => handleAddEmployee(employee)}
                    className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeeAllocation;