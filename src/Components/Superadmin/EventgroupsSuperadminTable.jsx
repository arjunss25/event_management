import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchEvents,
  deleteEvent,
  clearErrors
} from '../../Redux/Slices/SuperAdmin/EventgroupssuperadminSlice';
import { FaRegEye } from 'react-icons/fa';
import { MdOutlineDeleteOutline } from 'react-icons/md';


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

  useEffect(() => {
    dispatch(fetchEvents());
    
    // Cleanup function to clear errors when component unmounts
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Handle status message display
  useEffect(() => {
    if (deleteError) {
      setStatusMessage({ show: true, message: deleteError, isError: true });
    }
    
    // Clear status message after 3 seconds
    const timer = setTimeout(() => {
      setStatusMessage({ show: false, message: '', isError: false });
    }, 3000);

    return () => clearTimeout(timer);
  }, [deleteError]);

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
        
        // Refresh the events list
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

  const handleView = (event) => {
    navigate(`/superadmin/eventgroup-profile`, { state: { eventData: event } });
  };

  const handleImageError = (e) => {
    e.target.src = '';
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-8 mt-10">
      
      {/* Error State */}
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!Array.isArray(events) || events.length === 0 ? (
        <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-center">No events available.</p>
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
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
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
                          onClick={() => handleView(event)}
                          title="View Details"
                        >
                          <FaRegEye className="text-[1.2rem]" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-red-600 w-10 h-10 flex items-center justify-center transition-colors duration-200"
                          onClick={() => handleDelete(event.id)}
                          title="Delete Event Group"
                          disabled={deleteLoading}
                        >
                          <MdOutlineDeleteOutline className="text-[1.2rem]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventgroupsSuperadminTable;