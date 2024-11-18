import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosConfig';

const ExpiredeventsTableSuperadmin = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch events using Axios
    axiosInstance.get('/list-expired-events/')
      .then(response => {
        // Log the response data to inspect its structure
        console.log(response.data);  

        // Access the events array from the correct property
        const eventsData = Array.isArray(response.data.data) ? response.data.data : []; // Fix: access events via response.data.data
        
        if (eventsData.length > 0) {
          // Transform the data if it's an array
          const transformedData = eventsData.map(event => ({
            id: event.event_name, // Ensure an id is used for React key
            eventName: event.event_name,
            eventGroup: event.event_group,
            startDate: event.start_date,
            endDate: event.end_date, // Assuming you have an end date or modify accordingly
            status: event.event_status,
          }));
          setEvents(transformedData);
        } else {
          setError('No events available');
        }
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    }
    if (status === "Cancelled") {
      return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    }
    return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap'; // For other statuses
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  if (!Array.isArray(events) || events.length === 0) {
    return <div>No events available</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-4 mt-10 events-table-main">
      {/* Table container with horizontal scroll */}
      <div className="relative overflow-x-auto">
        {/* Set minimum width to prevent table from becoming too narrow */}
        <div className="min-w-[1000px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-gray-800">
              <tr>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Event Name</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Event Group</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Start Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">End Date</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-6 text-black whitespace-nowrap">{event.eventName}</td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">{event.eventGroup}</td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">{event.startDate}</td>
                  <td className="px-6 py-6 text-black whitespace-nowrap">{event.endDate}</td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="w-28">
                      <span className={getStatusStyle(event.status)}>
                        {event.status}
                      </span>
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

export default ExpiredeventsTableSuperadmin;
