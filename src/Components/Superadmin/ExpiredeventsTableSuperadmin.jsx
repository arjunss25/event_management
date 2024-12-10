import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../axiosConfig';
import { FaSearch } from 'react-icons/fa';

// Memoized Search Component
const SearchBar = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  return (
    <div className="mb-6 relative w-full md:w-[60%] lg:w-[30%]">
      <input
        type="text"
        value={searchValue}
        onChange={handleSearch}
        placeholder="Search events..."
        className="w-full px-4 py-2 pl-10 text-gray-600 border-2 rounded-full focus:outline-none focus:border-gray-400"
      />
      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );
};

const ExpiredeventsTableSuperadmin = () => {
  const [events, setEvents] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });
  const [isSendingMail, setIsSendingMail] = useState(false);

  const handleSendMail = async (eventName, eventGroup, eventId) => {
    setIsSendingMail(true);
    try {
      await axiosInstance.post(`/notifications-payment-delay/${eventId}/`);
      setNotification({
        show: true,
        type: 'success',
        message: 'Payment reminder email has been sent successfully!',
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to send payment reminder email. Please try again.',
      });
    } finally {
      setIsSendingMail(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    axiosInstance
      .get('/list-expired-events/')
      .then((response) => {
        const eventsData = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        if (eventsData.length > 0) {
          const transformedData = eventsData.map((event) => ({
            id: event.event_name,
            eventId: event.event_id,
            eventName: event.event_name,
            eventGroup: event.event_group,
            startDate: event.start_date.split('-').reverse().join('-'),
            endDate: event.end_date.split('-').reverse().join('-'),
            status: event.event_status,
            paymentStatus: event.payment_status,
          }));
          setEvents(transformedData);
          setDisplayData(transformedData);
        } else {
          setError('No events available');
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Debounced search handler
  const handleSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm.trim()) {
        setDisplayData(events);
        setTableLoading(false);
        setSearchError(null);
        return;
      }

      try {
        setTableLoading(true);
        setSearchError(null);

        // Filter the existing events array by event name only
        const filteredEvents = events.filter(event => 
          event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setDisplayData(filteredEvents);
      } catch (err) {
        setSearchError('Failed to filter results');
        setDisplayData([]);
      } finally {
        setTableLoading(false);
      }
    },
    [events]
  );

  // Debounced search implementation
  const debouncedSearch = useCallback(
    (searchTerm) => {
      setTableLoading(true);
      const timeoutId = setTimeout(() => {
        handleSearch(searchTerm);
      }, 300);

      return () => {
        clearTimeout(timeoutId);
        if (!searchTerm.trim()) {
          setTableLoading(false);
        }
      };
    },
    [handleSearch]
  );

  const getStatusStyle = (status) => {
    if (status === 'Completed') {
      return 'bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    }
    if (status === 'Cancelled') {
      return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    }
    return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
  };

  if (loading)
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );

  if (error)
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01m-9.384-3.37A12.002 12.002 0 0112 3c5.591 0 10.29 3.824 11.622 9"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Events Found
          </h3>
          {/* <p className="text-gray-500">There are currently no expired events available in the system.</p> */}
        </div>
      </div>
    );

  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Expired Events
          </h3>
          <p className="text-gray-500">
            There are no expired events to display at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SearchBar onSearch={debouncedSearch} />

      {searchError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {searchError}
        </div>
      )}

      <div className="w-full bg-white rounded-lg p-4 md:p-4 mt-10 events-table-main">
        <div className="relative overflow-x-auto">
          <div className="min-w-[1000px]">
            {tableLoading ? (
              <div className="w-full p-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : !Array.isArray(displayData) || displayData.length === 0 ? (
              <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-500 text-center">No events found.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-white uppercase bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">
                      Event Name
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
                      Status
                    </th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayData.map((event) => (
                    <tr key={event.id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        {event.eventName}
                      </td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        {event.eventGroup}
                      </td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        {event.startDate}
                      </td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        {event.endDate}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="w-28">
                          <span className={getStatusStyle(event.status)}>
                            {event.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        {event.status === 'Completed' &&
                          event.paymentStatus !== 'Complete' && (
                            <button
                              onClick={() =>
                                handleSendMail(
                                  event.eventName,
                                  event.eventGroup,
                                  event.eventId
                                )
                              }
                              className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm ${
                                isSendingMail ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={isSendingMail}
                            >
                              {isSendingMail ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mx-auto"></div>
                              ) : (
                                'Send Mail'
                              )}
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <Notification
          notification={notification}
          setNotification={setNotification}
        />
      </div>
    </>
  );
};

const Notification = ({ notification, setNotification }) => {
  if (!notification.show) return null;

  const getIcon = () => {
    if (notification.type === 'success') {
      return (
        <div className="w-12 h-12 rounded-full bg-green-100 p-2 flex items-center justify-center mx-auto mb-4 z-[100]">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-red-100 p-2 flex items-center justify-center mx-auto mb-4 z-[1000]">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all animate-modal-enter">
        <div className="p-6">
          <button
            onClick={() =>
              setNotification({ show: false, type: '', message: '' })
            }
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {getIcon()}

          <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
            {notification.type === 'success' ? 'Success!' : 'Oops!'}
          </h3>

          <p className="text-center text-gray-600 mb-6">
            {notification.message}
          </p>

          <button
            onClick={() =>
              setNotification({ show: false, type: '', message: '' })
            }
            className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 ${
              notification.type === 'success'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {notification.type === 'success' ? 'Continue' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiredeventsTableSuperadmin;
