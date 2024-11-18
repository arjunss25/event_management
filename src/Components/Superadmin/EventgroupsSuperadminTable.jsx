import React, { useEffect, useState, memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchEvents,
  deleteEvent,
  clearErrors
} from '../../Redux/Slices/SuperAdmin/EventgroupssuperadminSlice';
import { FaRegEye, FaSearch } from 'react-icons/fa';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import axiosInstance from '../../axiosConfig';

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
const TableRow = memo(({ event, onDelete, onView, deleteLoading }) => {
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
                src={event.image}
                alt={`${event.company_name} logo`}
                className="w-10 h-10 rounded-lg object-cover"
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
        <div className="flex gap-3">
          <button
            className="text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center transition-colors duration-200"
            onClick={() => onView(event)}
            title="View Details"
          >
            <FaRegEye className="text-[1.2rem]" />
          </button>
          <button
            className="text-gray-600 hover:text-red-600 w-10 h-10 flex items-center justify-center transition-colors duration-200"
            onClick={() => onDelete(event.id)}
            title="Delete Event Group"
            disabled={deleteLoading}
          >
            <MdOutlineDeleteOutline className="text-[1.2rem]" />
          </button>
        </div>
      </td>
    </tr>
  );
});

// Main Component
const EventgroupsSuperadminTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    events, 
    loading, 
    error, 
    deleteLoading, 
    deleteError 
  } = useSelector((state) => state.eventGroups);
  
  const [statusMessage, setStatusMessage] = useState({ show: false, message: '', isError: false });
  const [displayData, setDisplayData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchEvents());
    return () => dispatch(clearErrors());
  }, [dispatch]);

  // Update display data when events change
  useEffect(() => {
    setDisplayData(events);
  }, [events]);

  // Debounced search handler
  const handleSearch = React.useCallback(async (searchTerm) => {
    // If search term is empty, reset to show all events
    if (!searchTerm.trim()) {
      setDisplayData(events);
      setTableLoading(false);
      setSearchError(null);
      return;
    }

    try {
      setTableLoading(true);
      setSearchError(null);

      const response = await axiosInstance.get(`/search-eventgroup/${searchTerm}`);
      
      if (response.status === 200) {
        setDisplayData(response.data?.data || []);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError('Failed to fetch search results');
      setDisplayData([]);
    } finally {
      setTableLoading(false);
    }
  }, [events]);

  // Debounced search implementation
  const debouncedSearch = React.useCallback((searchTerm) => {
    setTableLoading(true);
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (!searchTerm.trim()) {
        setTableLoading(false);
      }
    };
  }, [handleSearch]);

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event group?')) {
      return;
    }

    try {
      setStatusMessage({ show: true, message: 'Deleting event group...', isError: false });
      
      const resultAction = await dispatch(deleteEvent(id));
      
      if (deleteEvent.fulfilled.match(resultAction)) {
        setStatusMessage({
          show: true,
          message: 'Event group deleted successfully',
          isError: false
        });
        dispatch(fetchEvents());
      }
    } catch (err) {
      console.error('Delete operation failed:', err);
      setStatusMessage({
        show: true,
        message: 'Failed to delete event group. Please try again.',
        isError: true
      });
    }
  };

  const handleView = useCallback((event) => {
    navigate(`/superadmin/eventgroup-profile`, { state: { eventData: event } });
  }, [navigate]);

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
        <div className={`mb-4 p-3 rounded ${
          statusMessage.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {statusMessage.message}
        </div>
      )}

      {/* Table Container */}
      <div className="w-full bg-white rounded-lg p-4 md:p-8">
        {tableLoading ? (
          <div className="w-full p-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : !displayData || displayData.length === 0 ? (
          <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-500 text-center">
              No event groups found.
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-6 py-3 text-left whitespace-nowrap">Company Name</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Owner's Name</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Email</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Phone</th>
                    <th className="px-6 py-3 text-left whitespace-nowrap">Actions</th>
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
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventgroupsSuperadminTable;