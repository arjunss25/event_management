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

        const eventsData = Array.isArray(response.data.data) ? response.data.data : []; // Fix: access events via response.data.data
        
        if (eventsData.length > 0) {
          const transformedData = eventsData.map(event => ({
            id: event.event_name,
            eventName: event.event_name,
            eventGroup: event.event_group,
            startDate: event.start_date,
            endDate: event.end_date, 
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
    return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
  };

  if (loading) return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
  
  if (error) return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm max-w-md">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01m-9.384-3.37A12.002 12.002 0 0112 3c5.591 0 10.29 3.824 11.622 9" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
        {/* <p className="text-gray-500">There are currently no expired events available in the system.</p> */}
      </div>
    </div>
  );

  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm max-w-md">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Expired Events</h3>
          <p className="text-gray-500">There are no expired events to display at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-4 mt-10 events-table-main">

      <div className="relative overflow-x-auto">

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
