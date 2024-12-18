import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosConfig';

import '../Superadmin/TableComponent.css';

const AdminEventsAssignedTable = ({ data, employeeId, employeeName }) => {
  const [showScanReport, setShowScanReport] = useState(false);
  const [scanReportData, setScanReportData] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDays, setEventDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredScanData, setFilteredScanData] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });

  const handleRemove = async (eventId) => {
    try {
      const payload = {
        employees: [
          {
            id: employeeId,
            name: employeeName,
          },
        ],
      };

      const response = await axiosInstance.delete('/employee-allocation/', {
        data: payload,
      });

      if (response.status === 200) {
        setNotification({
          show: true,
          type: 'success',
          message: 'Employee removed from event successfully',
        });
        window.location.reload();
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: 'Failed to remove employee from event',
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Error removing employee from event',
      });
    }
  };

  const fetchEventDays = async () => {
    try {
      const response = await axiosInstance.get('/list-event-days/');
      if (response.status === 200) {
        const daysData = response.data.data.data[0];
        const daysArray = Object.entries(daysData).map(([day, date]) => ({
          day,
          date,
        }));
        setEventDays(daysArray);
      }
    } catch (error) {}
  };

  const fetchMealTypes = async () => {
    try {
      const response = await axiosInstance.get('/unique-meals-list/');
      if (response.status === 200) {
        setMealTypes(response.data.data);
      }
    } catch (error) {}
  };

  const handleScanReport = async (eventId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/scan-report/${employeeId}/`);
      if (response.status === 200) {
        const responseData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setScanReportData(responseData);
        setFilteredScanData(responseData);
        setShowScanReport(true);
        setSelectedEventId(eventId);
        await fetchEventDays();
        await fetchMealTypes();
      }
    } catch (error) {
      setScanReportData([]);
      setFilteredScanData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateFilter = (selectedDate) => {
    setSelectedDay(selectedDate);
    if (selectedDate === '') {
      setFilteredScanData(scanReportData);
    } else {
      const filtered = scanReportData.filter((scan) => {
        const scanDate = scan.meal_date
          .split('T')[0]
          .split('-')
          .reverse()
          .join('-');
        return scanDate === selectedDate;
      });

      setFilteredScanData(filtered);
    }
  };

  const handleMealTypeFilter = (selectedType) => {
    setSelectedMealType(selectedType);
    if (selectedType === '') {
      setFilteredScanData(scanReportData);
    } else {
      const filtered = scanReportData.filter(
        (scan) => scan.meal_type_name === selectedType
      );
      setFilteredScanData(filtered);
    }
  };

  if (showScanReport) {
    return (
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowScanReport(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Events
          </button>

          <div className="flex gap-4">
            <select
              value={selectedDay}
              onChange={(e) => handleDateFilter(e.target.value)}
              className="px-4 py-2 border rounded"
            >
              <option value="">All Days</option>
              {eventDays.map(({ day, date }) => (
                <option key={day} value={date}>
                  {day} - {date}
                </option>
              ))}
            </select>

            <select
              value={selectedMealType}
              onChange={(e) => handleMealTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded"
            >
              <option value="">All Meal Types</option>
              {mealTypes.map((mealType, index) => (
                <option key={index} value={mealType}>
                  {mealType}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredScanData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No scan data available.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meal Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredScanData.map((scan, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {scan.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {scan.registered_event_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {scan.meal_type_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {scan.meal_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {scan.meal_time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // Replace the existing empty data check with table structure
  if (!Array.isArray(data) || data.length === 0) {
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
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                No events assigned to this employee.
              </td>
            </tr>
          </tbody>
        </table>
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
          {Array.isArray(data) &&
            data.map((event, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.event_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.start_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.end_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{event.venue}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      event.event_status === 'upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.event_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.event_status === 'upcoming' ? (
                    <button
                      onClick={() => handleRemove(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleScanReport(event.id)}
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

      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all animate-modal-enter">
            <div className="p-6">
              <button
                onClick={() => setNotification({ show: false, type: '', message: '' })}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className={`w-12 h-12 rounded-full ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'} p-2 flex items-center justify-center mx-auto mb-4`}>
                {notification.type === 'success' ? (
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                {notification.type === 'success' ? 'Success!' : 'Oops!'}
              </h3>

              <p className="text-center text-gray-600 mb-6">{notification.message}</p>

              <button
                onClick={() => setNotification({ show: false, type: '', message: '' })}
                className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 ${
                  notification.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {notification.type === 'success' ? 'Continue' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsAssignedTable;
