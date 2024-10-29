import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvents, updatePaymentStatus } from '../Redux/eventsadminSlice';

const EventsTable = () => {
  const dispatch = useDispatch();
  const { data: events, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handlePaymentStatusChange = (id, status) => {
    dispatch(updatePaymentStatus({ id, status }));
  };
  if (!Array.isArray(events)) {
    return <div>No events available</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <table className="min-w-full text-xs md:text-sm text-left text-gray-500">
      <thead className="text-xs text-white uppercase bg-gray-800">
        <tr>
          <th className="px-2 md:px-6 py-3 font-medium whitespace-nowrap">Event</th>
          <th className="px-2 md:px-6 py-3 font-medium whitespace-nowrap">Event Group</th>
          <th className="px-2 md:px-6 py-3 font-medium whitespace-nowrap">Event Date</th>
          <th className="px-2 md:px-6 py-3 font-medium whitespace-nowrap">Event End Date</th>
          <th className="px-2 md:px-6 py-3 font-medium whitespace-nowrap">Event Status</th>
          <th className="px-2 md:px-6 py-3 font-medium whitespace-nowrap">Payment Status</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id} className="bg-white border-b hover:bg-gray-50">
            <td className="px-2 md:px-6 py-4 md:py-7 whitespace-nowrap">{event.event}</td>
            <td className="px-2 md:px-6 py-4 md:py-7 whitespace-nowrap">{event.eventgroup}</td>
            <td className="px-2 md:px-6 py-4 md:py-7 whitespace-nowrap">{event.eventdate}</td>
            <td className="px-2 md:px-6 py-4 md:py-7 whitespace-nowrap">{event.eventenddate}</td>
            <td className="px-2 md:px-6 py-4 md:py-7 whitespace-nowrap">{event.eventstatus}</td>
            <td className="px-2 md:px-6 py-4 md:py-7 whitespace-nowrap">
              <select
                value={event.paymentstatus}
                onChange={(e) => handlePaymentStatusChange(event.id, e.target.value)}
                className="outline-none bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
              >
                <option value="Pending">Pending</option>
                <option value="Advance Paid">Advance Paid</option>
                <option value="Completed">Completed</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EventsTable;
