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
        alert('Employee removed from event successfully');
        window.location.reload();
      } else {
        alert('Failed to remove employee from event');
      }
    } catch (err) {
      alert('Error removing employee from event');
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
    } catch (error) {
    }
  };

  const fetchMealTypes = async () => {
    try {
      const response = await axiosInstance.get('/unique-meals-list/');
      if (response.status === 200) {
        setMealTypes(response.data.data);
      }
    } catch (error) {
    }
  };

  const handleScanReport = async (eventId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/scan-report/${employeeId}/`);
      if (response.status === 200) {
        const responseData = Array.isArray(response.data.data) ? response.data.data : [];
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
      const filtered = scanReportData.filter(scan => scan.meal_type_name === selectedType);
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

  // Check if data is undefined or empty
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">
          No events assigned to this employee.
        </p>
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
              <td className="px-6 py-4 whitespace-nowrap">
                {event.event_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {event.start_date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{event.end_date}</td>
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
    </div>
  );
};

export default AdminEventsAssignedTable;
