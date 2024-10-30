import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import "./TableComponent.css"
import {
  fetchEvents,
  updatePaymentStatus,
} from '../../Redux/Slices/SuperAdmin/eventssuperadminSlice';

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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-4 mt-10 events-table-main">
      <div className="relative overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-gray-800">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Event
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Event Group
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Start Date
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  End Date
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Event Status
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Payment Status
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-6 text-black whitespace-nowrap">
                    {event.event}
                  </td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">
                    {event.eventgroup}
                  </td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">
                    {event.eventdate}
                  </td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">
                    {event.eventenddate}
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="w-28">
                      <span className={getEventStatusStyle(event.eventstatus)}>
                        {event.eventstatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="w-32">
                      <select
                        value={event.paymentstatus}
                        onChange={(e) =>
                          handlePaymentStatusChange(event.id, e.target.value)
                        }
                        className={`w-full outline-none px-3 pr-8 py-1 rounded-md appearance-none bg-no-repeat bg-[length:16px] bg-[center_right_8px] ${getPaymentStatusStyle(
                          event.paymentstatus
                        )}`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Advance Paid">Advance Paid</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-20">
                      {event.paymentstatus !== 'Completed' && (
                        <button
                          className="w-full bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                          onClick={() =>
                            handlePaymentStatusChange(event.id, 'Cancel')
                          }
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