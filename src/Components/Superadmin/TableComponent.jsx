import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IoInformationCircleOutline } from "react-icons/io5";
import './TableComponent.css';
import { fetchEvents, updatePaymentStatus } from '../../Redux/Slices/SuperAdmin/eventssuperadminSlice';

const EventsTable = () => {
  const dispatch = useDispatch();
  const { data: events, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const getEventStatusStyle = (status) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'up coming' || normalizedStatus === 'upcoming') {
      return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    } else if (normalizedStatus === 'cancel') {
      return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    } else if (normalizedStatus === 'completed') {
      return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    }
    return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
  };

  const getPaymentStatusStyle = (status) => {
    const baseStyle = 'px-3 py-1 w-28 rounded-full text-xs font-medium flex items-center justify-center';
    switch (status) {
      case 'Pending':
        return `${baseStyle} bg-red-50 text-red-700`;
      case 'Advance Paid':
        return `${baseStyle} bg-yellow-50 text-yellow-700`;
      case 'Completed':
        return `${baseStyle} bg-green-50 text-green-700`;
      default:
        return `${baseStyle} bg-gray-50 text-gray-700`;
    }
  };

  const handlePaymentStatusChange = (id, status) => {
    dispatch(updatePaymentStatus({ id, status }));
  };

  if (!Array.isArray(events)) {
    return <div>No events available</div>;
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-4 mt-10 events-table-main">
      <div className="relative overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-gray-800">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Event</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Event Group</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Start Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">End Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Event Status</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Payment Status</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-6 text-black whitespace-nowrap">{event.event}</td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">{event.eventgroup}</td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">{event.eventdate}</td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">{event.eventenddate}</td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="w-28">
                      <span className={getEventStatusStyle(event.eventstatus)}>
                        {event.eventstatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center w-36 justify-between">
                      <span className={getPaymentStatusStyle(event.paymentstatus)}>
                        {event.paymentstatus}
                      </span>
                      <IoInformationCircleOutline className="text-gray-500 text-[1.5rem]" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20">
                      {event.paymentstatus !== 'Completed' && (
                        <button
                          className="w-full bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                          onClick={() => handlePaymentStatusChange(event.id, 'Cancel')}
                        >
                          Cancel
                        </button>
                      )}
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

export default EventsTable;
