import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvents, updatePaymentStatus } from '../Redux/eventsadminSlice';
import './TableComponent.css'

const EventsTable = () => {
  const dispatch = useDispatch();
  const { data: events, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handlePaymentStatusChange = (id, status) => {
    dispatch(updatePaymentStatus({ id, status }));
  };

  const getEventStatusStyle = (status) => {
    // Convert to lowercase for case-insensitive comparison
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'up coming' || normalizedStatus === 'upcoming') {
      return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium';
    } else if (normalizedStatus === 'cancel') {
      return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium';
    } else if (normalizedStatus === 'completed') {
      return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium';
    }
    // Default case
    return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium';
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-red-50 text-red-700';
      case 'Advance Paid':
        return 'bg-yellow-50 text-yellow-700';
      case 'Completed':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  if (!Array.isArray(events)) {
    return <div>No events available</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="table-main-div bg-white p-4 md:p-8 overflow-x-scroll w-[75vw] rounded-[1rem]">
      <div className="overflow-x-auto">
      <table className="min-w-full text-xs md:text-sm text-left text-gray-500">
        <thead className="text-xs text-white uppercase bg-gray-800">
          <tr>
            <th className="px-2 md:px-6 py-3 font-medium">Event</th>
            <th className="px-2 md:px-6 py-3 font-medium">Event Group</th>
            <th className="px-2 md:px-6 py-3 font-medium">Start Date</th>
            <th className="px-2 md:px-6 py-3 font-medium">End Date</th>
            <th className="px-2 md:px-6 py-3 font-medium">Event Status</th>
            <th className="px-2 md:px-6 py-3 font-medium">Payment Status</th>
            <th className="px-2 md:px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-2 md:px-6 py-4 text-black">{event.event}</td>
              <td className="px-2 md:px-6 py-4 text-black">{event.eventgroup}</td>
              <td className="px-2 md:px-6 py-4 text-black">{event.eventdate}</td>
              <td className="px-2 md:px-6 py-4 text-black">{event.eventenddate}</td>
              <td className="px-2 md:px-6 py-4">
                <span className={getEventStatusStyle(event.eventstatus)}>
                  {event.eventstatus}
                </span>
              </td>
              <td className="px-2 md:px-6 py-4">
                <select
                  value={event.paymentstatus}
                  onChange={(e) => handlePaymentStatusChange(event.id, e.target.value)}
                  className={`outline-none px-3 py-1 rounded-md ${getPaymentStatusStyle(event.paymentstatus)}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Advance Paid">Advance Paid</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td className="px-2 md:px-6 py-4">
                {event.paymentstatus !== 'Completed' && (
                  <button 
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                    onClick={() => handlePaymentStatusChange(event.id, 'Cancel')}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default EventsTable;