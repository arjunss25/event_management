import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminEvents,
  deleteAdminEvent,
  updateEventStatus
} from '../../Redux/Slices/Admin/AdminEventSlice';
import { FaRegEye } from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';
import { MdOutlineDeleteOutline } from 'react-icons/md';

const AdminEventsTable = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.adminEvents);

  useEffect(() => {
    dispatch(fetchAdminEvents());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      dispatch(deleteAdminEvent(id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!Array.isArray(events) || events.length === 0) {
    return <div className="p-4">No events available.</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-8 mt-10">
      <div className="relative overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Event
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Event Start Date
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Event End Date
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Venue
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Seats Booked
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Event Status
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">    
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    
                      <span className="font-medium">{event.eventName}</span>
                    
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(event.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(event.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.venue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.seatsBooked}/{event.totalSeats}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs text-center w-full ${getStatusColor(event.eventStatus)}`}>
                        {event.eventStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        className="text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center"
                        onClick={() => console.log('View event:', event.id)}
                      >
                        <FaRegEye className="text-[1.2rem]" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center"
                        onClick={() => console.log('Edit event:', event.id)}
                      >
                        <FiEdit3 className="text-[1.2rem]" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center"
                        onClick={() => handleDelete(event.id)}
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
    </div>
  );
};

export default AdminEventsTable;