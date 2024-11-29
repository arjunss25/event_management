import React from 'react';
import axiosInstance from '../../axiosConfig';

import '../Superadmin/TableComponent.css';

const AdminEventsAssignedTable = ({ data, employeeId, employeeName }) => {
  const handleRemove = async (eventId) => {
    try {
      const payload = {
        employees: [
          {
            id: employeeId,
            name: employeeName
          }
        ]
      };

      console.log('Payload being sent:', payload);

      const response = await axiosInstance.delete('/employee-allocation/', {
        data: payload
      });
      
      if (response.status === 200) {
        alert('Employee removed from event successfully');
        window.location.reload();
      } else {
        alert('Failed to remove employee from event');
      }
    } catch (err) {
      console.error('Error removing employee from event:', err);
      console.log('Full error details:', err.response?.data);
      alert('Error removing employee from event');
    }
  };

  // Check if data is undefined or empty
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No events assigned to this employee.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Venue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((event, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">{event.event_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{event.start_date}</td>
              <td className="px-6 py-4 whitespace-nowrap">{event.end_date}</td>
              <td className="px-6 py-4 whitespace-nowrap">{event.venue}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  event.event_status === 'upcoming' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.event_status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {event.event_status === 'upcoming' ? (
                  <button
                    onClick={() => handleRemove(event.event_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Scan Report
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminEventsAssignedTable;
