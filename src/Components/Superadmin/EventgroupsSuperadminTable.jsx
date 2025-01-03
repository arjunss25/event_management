import React, { useEffect, useState, memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchEvents,
  deleteEvent,
  clearErrors,
} from '../../Redux/Slices/SuperAdmin/EventgroupssuperadminSlice';
import { FaRegEye, FaSearch } from 'react-icons/fa';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import axiosInstance from '../../axiosConfig';
import { auth } from '../../firebase/firebaseConfig';
import { deleteUser, signInWithEmailAndPassword } from 'firebase/auth';

// Memoized Search Component
const SearchBar = memo(({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  return (
    <div className="mb-6 relative w-full md:w-[60%] lg:w-[30%]">
      <input
        type="text"
        value={searchValue}
        onChange={handleSearch}
        placeholder="Search event groups..."
        className="w-full px-4 py-2 pl-10 text-gray-600 border-2 rounded-full focus:outline-none focus:border-gray-400"
      />
      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
});

// Memoized Table Row Component
const TableRow = memo(
  ({
    event,
    onDelete,
    onView,
    deleteLoading,
    setSelectedEventGroup,
    setShowModal,
  }) => {
    const handleImageError = (e) => {
      e.target.src = '';
    };

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 items-center justify-center">
              {event.image ? (
                <img
                  src="/eventgroup profile.png"
                  alt={`${event.company_name} logo`}
                  className="w-8 h-8 rounded-lg object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No img</span>
                </div>
              )}
            </div>
            <span className="font-medium">{event.company_name}</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{event.owner_name}</td>
        <td className="px-6 py-4 whitespace-nowrap">{event.email}</td>
        <td className="px-6 py-4 whitespace-nowrap">{event.phone}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex">
            <button
              className="text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center transition-colors duration-200"
              onClick={() => {
                console.log('View button clicked for event:', event);
                onView(event);
              }}
              title="View Details"
            >
              <FaRegEye className="text-[1.2rem]" />
            </button>
            <button
              className="text-gray-600 hover:text-red-600 w-10 h-10 flex items-center justify-center transition-colors duration-200"
              onClick={() => {
                setSelectedEventGroup(event.id);
                setShowModal(true);
              }}
              title="Delete Event Group"
            >
              <MdOutlineDeleteOutline className="text-[1.2rem]" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

// Main Component
const EventgroupsSuperadminTable = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { events, loading, error, deleteLoading, deleteError } = useSelector(
    (state) => state.eventGroups
  );

  const [statusMessage, setStatusMessage] = useState({
    show: false,
    message: '',
    isError: false,
  });
  const [displayData, setDisplayData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventGroup, setSelectedEventGroup] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null); // 'loading', 'success', 'error'

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchEvents());
    return () => dispatch(clearErrors());
  }, [dispatch]);

  // Update displayData when either props.data or events changes
  useEffect(() => {
    if (data && data.length > 0) {
      setDisplayData(data);
    } else if (events && !loading && !tableLoading) {
      setDisplayData(Array.isArray(events) ? events : []);
    }
  }, [data, loading]);

  // Update the handleSearch function
  const handleSearch = React.useCallback(
    async (searchTerm) => {
      setTableLoading(true);
      setSearchError(null);

      try {
        if (!searchTerm.trim()) {
          // If search is empty, fetch all events
          const response = await dispatch(fetchEvents()).unwrap();
          setDisplayData(Array.isArray(response) ? response : []);
        } else {
          // Search for specific term
          const response = await axiosInstance.get(
            `/search-eventgroup-name/${searchTerm}`
          );
          
          if (response.status === 200) {
            // Even if data is empty, we should update the display
            const searchResults = response.data?.data || [];
            setDisplayData(searchResults);
            
            // Optional: Show a message when no results found
            if (searchResults.length === 0) {
              setSearchError(`No event groups found matching "${searchTerm}"`);
            }
          }
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchError('Failed to fetch search results');
        setDisplayData([]); // Set empty array on error
      } finally {
        setTableLoading(false);
      }
    },
    [dispatch]
  );

  // Replace the debouncedSearch implementation with a proper debounce
  const debouncedSearch = React.useCallback(
    (() => {
      let timeoutId;
      return (searchTerm) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleSearch(searchTerm);
        }, 300); // 300ms delay
      };
    })(),
    [handleSearch]
  );

  // Update handleDelete to use the modal
  const handleDelete = async () => {
    setDeleteStatus('loading');
    try {
      const eventGroup = displayData.find(
        (event) => event.id === selectedEventGroup
      );
      if (!eventGroup) {
        throw new Error('Event group not found');
      }

      const resultAction = await dispatch(deleteEvent(selectedEventGroup));

      if (deleteEvent.fulfilled.match(resultAction)) {
        await dispatch(fetchEvents());
        setDeleteStatus('success');
        
        setTimeout(() => {
          setShowModal(false);
          setSelectedEventGroup(null);
          setDeleteStatus(null);
        }, 1500);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteStatus('error');
      
      setTimeout(() => {
        setShowModal(false);
        setSelectedEventGroup(null);
        setDeleteStatus(null);
      }, 1500);
    }
  };

  // Status message effect
  useEffect(() => {
    if (statusMessage.show) {
      const timer = setTimeout(() => {
        setStatusMessage({ show: false, message: '', isError: false });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Define handleView inside the main component
  const handleView = useCallback(
    (event) => {
      console.log('Navigating to event group profile with ID:', event.id);
      navigate(`/superadmin/eventgroup-profile/${event.id}`, {
        state: { eventData: event },
      });
    },
    [navigate]
  );

  // Status message effect
  useEffect(() => {
    if (deleteError) {
      setStatusMessage({ show: true, message: deleteError, isError: true });
      const timer = setTimeout(() => {
        setStatusMessage({ show: false, message: '', isError: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteError]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Memoized Search Component */}
      <SearchBar onSearch={debouncedSearch} />

      {/* Error States */}
      {(error || searchError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error || searchError}
        </div>
      )}

      {/* Status Message */}
      {statusMessage.show && (
        <div
          className={`mb-4 p-3 rounded ${
            statusMessage.isError
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {statusMessage.message}
        </div>
      )}

      {/* Table Container */}
      <div className="w-full bg-white rounded-lg p-4 md:p-8">
        {tableLoading ? (
          <div className="w-full p-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : !Array.isArray(displayData) || displayData.length === 0 ? (
          <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-500 text-center">No event groups found.</p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Owner's Name
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayData.map((event) => (
                    <TableRow
                      key={event.id}
                      event={event}
                      onDelete={handleDelete}
                      onView={handleView}
                      deleteLoading={deleteLoading}
                      setSelectedEventGroup={setSelectedEventGroup}
                      setShowModal={setShowModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] md:w-[400px] transform transition-all">
            {deleteStatus === 'loading' && (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
                <p className="text-gray-600">Deleting event group...</p>
              </div>
            )}

            {deleteStatus === 'success' && (
              <div className="flex flex-col items-center justify-center py-4">
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
                <p className="text-gray-600 text-center font-medium">
                  Event group deleted successfully!
                </p>
              </div>
            )}

            {deleteStatus === 'error' && (
              <div className="flex flex-col items-center justify-center py-4">
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
                <p className="text-red-600 text-center font-medium">
                  Failed to delete event group
                </p>
              </div>
            )}

            {deleteStatus === null && (
              <>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                    <MdOutlineDeleteOutline className="text-red-500 text-2xl" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Delete Event Group
                </h3>
                <p className="text-gray-500 text-center mb-8">
                  This action cannot be undone. Are you sure you want to delete
                  this event group?
                </p>
                <div className="flex gap-4">
                  <button
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => setShowModal(false)}
                    disabled={deleteStatus === 'loading'}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    onClick={handleDelete}
                    disabled={deleteStatus === 'loading'}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventgroupsSuperadminTable;
