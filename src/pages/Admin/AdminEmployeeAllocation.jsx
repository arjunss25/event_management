import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdClose } from 'react-icons/io';
import { FiSearch } from 'react-icons/fi';
import { IoIosArrowDown } from "react-icons/io";
import {
  fetchPositions,
  fetchEmployeesByPosition,
  fetchAllocatedEmployees,
  setSelectedPosition,
  addEmployeeToAllocation,
  removeEmployeeFromAllocation,
  removeEmployeePosition,
  setSearchTerm,
  fetchEventsByEventGroup,
  importAllocationsFromEvent,
  setShowImportModal,
  selectPositions,
  selectEmployees,
  selectAllocatedSections,
  selectSelectedPosition,
  selectStatus,
  selectError,
  selectSearchTerm,
  selectAddingEmployee,
  selectRemovingEmployee,
  selectRemovingPosition,
  selectLoadingAllocated,
  selectEvents,
  selectLoadingEvents,
  selectImportingAllocations,
  selectShowImportModal,
  fetchEmployeesByEvent,
  selectEventEmployees,
  selectLoadingEventEmployees,
  resetEventEmployees,
  addEmployeesToEvent,
} from '../../Redux/Slices/Admin/employeeAllocationSlice';

// Loading component
const LoadingState = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Error component
const ErrorState = ({ error, onRetry }) => (
  <div className="flex justify-center items-center p-8">
    <div className="text-red-500 text-center">
      <p className="text-xl font-semibold mb-2">Error Loading Data</p>
      <p>{error}</p>
      <button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// Import Modal Component
const ImportModal = ({ isOpen, onClose, events, loading }) => {
  const dispatch = useDispatch();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const eventEmployees = useSelector(selectEventEmployees);
  const loadingEventEmployees = useSelector(selectLoadingEventEmployees);

  useEffect(() => {
    if (!isOpen) {
      setSelectedEvent(null);
      dispatch(resetEventEmployees());
    }
  }, [isOpen, dispatch]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    dispatch(resetEventEmployees());
    dispatch(fetchEmployeesByEvent(event.id));
  };

  const handleAddToEvent = () => {
    const employees = eventEmployees.map(emp => ({ id: emp.id, name: emp.name }));
    dispatch(addEmployeesToEvent(employees))
      .unwrap()
      .then(() => {
        dispatch(fetchAllocatedEmployees());
        onClose();
      })
      .catch((error) => {
        console.error('Failed to add employees to event:', error);
      });
  };

  const groupedEmployees = eventEmployees.reduce((acc, emp) => {
    if (!acc[emp.position]) {
      acc[emp.position] = [];
    }
    acc[emp.position].push(emp);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedEvent ? 'Event Employees' : 'Import from Previous Events'}
            </h2>
            <button
              onClick={() => {
                setSelectedEvent(null);
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoMdClose size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <LoadingState />
          ) : selectedEvent ? (
            loadingEventEmployees ? (
              <LoadingState />
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-medium">{selectedEvent.event_name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedEvent.start_date} to {selectedEvent.end_date}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleAddToEvent}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                    >
                      Add to Event
                    </button>
                  </div>
                </div>
                
                {eventEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No employees found for this event.</p>
                  </div>
                ) : (
                  Object.entries(groupedEmployees).map(([position, employees]) => (
                    <div key={position} className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-md font-semibold text-gray-800 mb-3">
                        {position}
                      </h4>
                      <div className="grid gap-3">
                        {employees.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                          >
                            <div>
                              <span className="font-medium">{employee.name}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                #{employee.id}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              employee.is_available 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {employee.is_available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleEventSelect(event)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{event.event_name}</h3>
                      <p className="text-sm text-gray-500">
                        {event.start_date} to {event.end_date}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.event_status === 'upcoming' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {event.event_status}
                      </span>
                    </div>
                    <IoIosArrowDown size={20} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Employee List component
const EmployeeList = ({ selectedPosition, filteredEmployees, handleAddEmployee }) => {
  const addingEmployee = useSelector(selectAddingEmployee);

  if (!selectedPosition) {
    return (
      <div className="text-center text-gray-500 py-4">
        Please select a position to view available employees
      </div>
    );
  }

  if (filteredEmployees.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No employees available for this position. They might be all allocated or none exist.
      </div>
    );
  }

  return (
    <>
      {filteredEmployees.map((employee) => (
        <div key={employee.id} className="grid grid-cols-3 gap-4 items-center py-2 bg-white">
          <div className="text-gray-600">#{employee.id}</div>
          <div className="text-gray-800">{employee.name}</div>
          <button
            onClick={() => handleAddEmployee(employee)}
            disabled={addingEmployee}
            className={`px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors ${
              addingEmployee ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {addingEmployee ? 'Adding...' : 'Add'}
          </button>
        </div>
      ))}
    </>
  );
};

// Allocated Sections component
const AllocatedSections = ({ sections, onRemovePosition, onRemoveEmployee }) => {
  const removingEmployee = useSelector(selectRemovingEmployee);
  const removingPosition = useSelector(selectRemovingPosition);

  if (sections.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No positions have been allocated yet. Select a position and add employees.
      </div>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <div key={section.position} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">{section.position}</h3>
            <button
              onClick={() => onRemovePosition(section.position)}
              disabled={removingPosition}
              className={`px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors ${
                removingPosition ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {removingPosition ? 'Removing...' : 'Remove Position'}
            </button>
          </div>
          {section.employees.length === 0 ? (
            <div className="text-gray-500 text-sm">No employees allocated to this position</div>
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
                  onClick={() => onRemoveEmployee(section.position, employee.id, employee.name)}
                  disabled={removingEmployee}
                  className={`text-gray-500 hover:text-red-500 transition-colors ${
                    removingEmployee ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Remove employee"
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      ))}
    </>
  );
};

// Add this new component near your other component definitions
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? 'Removing...' : 'Remove Position'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminEmployeeAllocation = () => {
  const dispatch = useDispatch();
  
  const positions = useSelector(selectPositions);
  const employees = useSelector(selectEmployees);
  const allocatedSections = useSelector(selectAllocatedSections);
  const selectedPosition = useSelector(selectSelectedPosition);
  const status = useSelector(selectStatus);
  const error = useSelector(selectError);
  const searchTerm = useSelector(selectSearchTerm);
  const loadingAllocated = useSelector(selectLoadingAllocated);
  const events = useSelector(selectEvents);
  const loadingEvents = useSelector(selectLoadingEvents);
  const importingAllocations = useSelector(selectImportingAllocations);
  const showImportModal = useSelector(selectShowImportModal);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    positionToRemove: null
  });
  const removingPosition = useSelector(selectRemovingPosition);

  useEffect(() => {
    dispatch(fetchPositions());
    dispatch(fetchAllocatedEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPosition) {
      dispatch(fetchEmployeesByPosition(selectedPosition));
    }
  }, [dispatch, selectedPosition]);

  const handlePositionSelect = (position) => {
    dispatch(setSelectedPosition(position));
  };

  const handleAddEmployee = (employee) => {
    if (selectedPosition) {
      dispatch(addEmployeeToAllocation(employee))
        .unwrap()
        .catch((error) => {
          console.error('Failed to add employee:', error);
        });
    }
  };

  const handleRemoveEmployee = (positionName, employeeId, employeeName) => {
    dispatch(removeEmployeeFromAllocation({ employeeId, positionName, employeeName }))
      .unwrap()
      .catch((error) => {
        console.error('Failed to remove employee:', error);
      });
  };

  const handleRemovePosition = (positionName) => {
    setConfirmationModal({
      isOpen: true,
      positionToRemove: positionName
    });
  };

  const handleConfirmRemove = async () => {
    const positionName = confirmationModal.positionToRemove;
    try {
      // Find the section with the position we want to remove
      const sectionToRemove = allocatedSections.find(
        section => section.position === positionName
      );

      if (!sectionToRemove) {
        throw new Error('Position not found');
      }

      // If no employees are allocated, just update the state locally
      if (sectionToRemove.employees.length === 0) {
        // Dispatch a success action directly to update the state
        dispatch(removeEmployeePosition.fulfilled(positionName));
        setConfirmationModal({ isOpen: false, positionToRemove: null });
        return;
      }

      // Otherwise, proceed with API call for positions with employees
      await dispatch(removeEmployeePosition({
        positionName,
        employees: sectionToRemove.employees
      })).unwrap();

      setConfirmationModal({ isOpen: false, positionToRemove: null });
    } catch (error) {
      console.error('Failed to remove position:', error);
      setConfirmationModal({ isOpen: false, positionToRemove: null });
    }
  };

  const handleSearchChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleOpenImportModal = () => {
    dispatch(setShowImportModal(true));
    dispatch(fetchEventsByEventGroup());
  };

  const handleCloseImportModal = () => {
    dispatch(setShowImportModal(false));
  };

  const handleImport = (eventId) => {
    dispatch(importAllocationsFromEvent(eventId))
      .unwrap()
      .then(() => {
        handleCloseImportModal();
      })
      .catch((error) => {
        console.error('Failed to import allocations:', error);
      });
  };

  const handleRetry = () => {
    dispatch(fetchPositions());
    dispatch(fetchAllocatedEmployees());
    if (selectedPosition) {
      dispatch(fetchEmployeesByPosition(selectedPosition));
    }
  };

  const getAllocatedEmployeeIds = () => {
    const selectedSection = allocatedSections.find(
      section => section.position === selectedPosition
    );
    return selectedSection ? selectedSection.employees.map(emp => emp.id) : [];
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const allocatedIds = getAllocatedEmployeeIds();
    const isNotAllocated = !allocatedIds.includes(employee.id);
    return matchesSearch && isNotAllocated;
  });

  if (status === 'failed' && error && 
      !error.includes('No positions available') && 
      !error.includes('Failed to fetch allocated employees')) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="flex w-full min-h-screen lg:flex-row flex-col gap-4 p-4">
      <div className="w-full lg:w-1/2 bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Employee Allocation</h2>
          <button
            onClick={handleOpenImportModal}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Import from Previous Events
          </button>
        </div>
        {loadingAllocated ? (
          <LoadingState />
        ) : (
          <AllocatedSections 
            sections={allocatedSections}
            onRemovePosition={handleRemovePosition}
            onRemoveEmployee={handleRemoveEmployee}
          />
        )}
      </div>

      <div className="w-full lg:w-1/2 bg-black rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-white">Add Employees to Position</h2>
        <div className="mb-6 relative">
          <select
            value={selectedPosition}
            onChange={(e) => handlePositionSelect(e.target.value)}
            className="w-full p-3 pr-10 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors appearance-none"
          >
            <option value="">Select Position</option>
            {positions.map((position) => (
              <option key={position.id} value={position.name}>
                {position.name}
              </option>
            ))}
          </select>
          <IoIosArrowDown size={20} className="absolute right-4 top-3 text-gray-400" />
        </div>
        
        {positions.length === 0 && (
          <div className="text-white text-center p-4">
            No positions available. Please add positions first.
          </div>
        )}

        {positions.length > 0 && (
          <>
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search employees"
                  className="w-full p-3 pl-10 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
                <FiSearch size={20} className="absolute left-4 top-3 text-gray-400" />
              </div>
            </div>
            
            <EmployeeList
              selectedPosition={selectedPosition}
              filteredEmployees={filteredEmployees}
              handleAddEmployee={handleAddEmployee}
            />
          </>
        )}
      </div>

      <ImportModal
        isOpen={showImportModal}
        onClose={handleCloseImportModal}
        events={events}
        onImport={handleImport}
        loading={loadingEvents || importingAllocations}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, positionToRemove: null })}
        onConfirm={handleConfirmRemove}
        title="Remove Position"
        message={`Are you sure you want to remove ${confirmationModal.positionToRemove}? This action cannot be undone.`}
        loading={removingPosition}
      />
    </div>
  );
};

export default AdminEmployeeAllocation;