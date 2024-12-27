import React, { useEffect, useState, memo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';
import { IoCashOutline } from 'react-icons/io5';
import { FaCheckCircle, FaSearch } from 'react-icons/fa';
import { IoCalendarOutline } from 'react-icons/io5';
import {
  fetchEvents,
  updatePaymentStatus,
  cancelEvent,
  fetchTotalAmount,
  addPayment,
  fetchPaymentDetails,
} from '../../Redux/Slices/SuperAdmin/eventssuperadminSlice';
import axiosInstance from '../../axiosConfig';

// Memoized Search Component
const SearchBar = memo(({ onSearch }) => {
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
});
// Add Payment Modal Component
const AddPaymentModal = ({ onClose, eventId, eventGroupId }) => {
  const dispatch = useDispatch();
  const { paymentLoading, paymentError, totalAmount } = useSelector(
    (state) => state.events
  );

  const [formData, setFormData] = useState({
    date: '',
    amount: '',
  });

  // Add notification state
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });

  // New states for date picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if amount exceeds remaining payment
    const remainingAmount = totalAmount?.remaining_payment_amount || 0;
    if (Number(formData.amount) > remainingAmount) {
      setNotification({
        show: true,
        type: 'error',
        message: `Payment amount cannot exceed the remaining amount (${remainingAmount})`,
      });
      return;
    }

    const paymentData = {
      eventId: eventId,
      eventGroupId: eventGroupId,
      date: formData.date,
      amount: formData.amount,
    };

    try {
      await dispatch(addPayment(paymentData)).unwrap();
      setNotification({
        show: true,
        type: 'success',
        message: 'Payment added successfully!',
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: error.message || 'Failed to add payment. Please try again.',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateClick = () => {
    setShowDatePicker(true);
  };

  const handleDateBlur = () => {
    setTimeout(() => {
      setShowDatePicker(false);
    }, 200);
  };

  // Add Notification component
  const Notification = ({ notification, setNotification }) => {
    if (!notification.show) return null;

    const handleNotificationClose = async () => {
      setNotification({ show: false, type: '', message: '' });
      if (notification.type === 'success') {
        // Refresh data only after notification is acknowledged
        await dispatch(fetchEvents());
        await dispatch(fetchTotalAmount(eventId));
        onClose(); // Close the payment modal
      }
    };

    const getIcon = () => {
      if (notification.type === 'success') {
        return (
          <div className="w-12 h-12 rounded-full bg-green-100 p-2 flex items-center justify-center mx-auto mb-4">
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
        <div className="w-12 h-12 rounded-full bg-red-100 p-2 flex items-center justify-center mx-auto mb-4">
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
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all animate-modal-enter">
          <div className="p-6">
            <button
              onClick={handleNotificationClose}
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
              onClick={handleNotificationClose}
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

  return (
    <>
      <div className="fixed inset-0 z-[60] flex justify-center items-center bg-black bg-opacity-50 p-4">
        {paymentLoading ? (
          <div className="bg-white p-8 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-[1.5rem] w-[95%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] py-6 sm:py-8 px-6 sm:px-10 border-[2px] border-black max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl sm:text-2xl font-semibold">Add Payment</h1>
              <IoClose
                className="text-2xl sm:text-3xl cursor-pointer hover:text-gray-700"
                onClick={onClose}
              />
            </div>

            {paymentError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.date || ''}
                      onClick={handleDateClick}
                      readOnly
                      placeholder="Select date"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 cursor-pointer"
                    />
                    <IoCalendarOutline 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl pointer-events-none" 
                    />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      max={getCurrentDate()}
                      onBlur={handleDateBlur}
                      className={`absolute inset-0 opacity-0 cursor-pointer ${
                        showDatePicker ? '' : 'hidden'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div className="btn-sec w-full flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className={`w-full sm:w-fit bg-black text-white py-2 px-6 rounded-md text-sm sm:text-base hover:bg-gray-800 transition-colors ${
                    paymentLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {paymentLoading ? 'Adding Payment...' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <Notification
        notification={notification}
        setNotification={setNotification}
      />
    </>
  );
};

// Payment Details Modal Component
const PaymentDetailsModal = ({ onClose, eventData }) => {
  const dispatch = useDispatch();
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const {
    totalAmount,
    totalAmountLoading,
    totalAmountError,
    paymentDetails,
    paymentDetailsLoading,
    paymentDetailsError,
  } = useSelector((state) => state.events);

  useEffect(() => {
    if (eventData?.id) {
      dispatch(fetchTotalAmount(eventData.id))
        .unwrap()
        .then((result) => {})
        .catch((error) => {});

      dispatch(fetchPaymentDetails(eventData.id))
        .unwrap()
        .then((result) => {})
        .catch((error) => {});
    }
  }, [dispatch, eventData?.id]);

  const formatPaymentDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const getPaymentStatusStyle = (status) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    switch (normalizedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'advance paid':
      case 'advance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    if (normalizedStatus === 'completed') {
      return <FaCheckCircle className="mr-1.5 h-4 w-4 text-green-600" />;
    }
    return null;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-[95%] md:w-[80%] lg:w-[60vw] h-[90vh] md:h-[80vh] overflow-y-scroll py-6 md:py-10 px-4 md:px-10">
          {/* Top section */}
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Payment Details
              </h1>
              <div className="mt-3 space-y-1">
                <p className="text-gray-900 font-medium text-base md:text-lg">
                  {eventData?.event_name || 'Event Name Not Available'}
                </p>
                <p className="text-gray-600 text-sm md:text-base">
                  {eventData?.event_group_company_name ||
                    'Group Name Not Available'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoClose className="text-2xl md:text-3xl text-gray-600" />
            </button>
          </div>

          {/* Box section - make it responsive */}
          <div className="box-section w-full h-auto md:h-[22vh] flex flex-col md:flex-row gap-3 md:gap-5">
            {/* Total Amount Box */}
            <div className="box-main w-full md:w-[25rem] border-[2px] border-black rounded-[1.2rem]">
              <div className="top w-full p-2 flex justify-end">
                <div className="icon-bg p-2 bg-[#f0f3f5] w-fit rounded-[0.5rem]">
                  <IoCashOutline className="text-[1.2rem] md:text-[1.5rem]" />
                </div>
              </div>
              <div className="btm-section w-full p-3 flex flex-col">
                <h2 className="text-[0.9rem] md:text-[1rem]">Total Amount</h2>
                {totalAmountLoading ? (
                  <div className="text-[1.5rem] md:text-[2rem] font-bold">
                    Loading...
                  </div>
                ) : totalAmountError ? (
                  <div className="text-red-500">Error loading amount</div>
                ) : (
                  <h2 className="text-[1.5rem] md:text-[2rem] font-bold">
                    {totalAmount?.total_amount || '0'}
                  </h2>
                )}
              </div>
            </div>

            {/* Remaining Amount Box */}
            <div className="box-main w-full md:w-[25rem] border-[2px] border-black rounded-[1.2rem]">
              <div className="top w-full p-2 flex justify-end">
                <div className="icon-bg p-2 bg-[#f0f3f5] w-fit rounded-[0.5rem]">
                  <IoCashOutline className="text-[1.2rem] md:text-[1.5rem]" />
                </div>
              </div>
              <div className="btm-section w-full p-3 flex flex-col">
                <h2 className="text-[0.9rem] md:text-[1rem]">
                  Remaining Amount
                </h2>
                <h2 className="text-[1.5rem] md:text-[2rem] font-bold">
                  {totalAmount?.remaining_payment_amount || '0'}
                </h2>
              </div>
            </div>

            {/* Amount Paid Box */}
            <div className="box-main w-full md:w-[25rem] border-[2px] border-black rounded-[1.2rem]">
              <div className="top w-full p-2 flex justify-end">
                <div className="icon-bg p-2 bg-[#f0f3f5] w-fit rounded-[0.5rem]">
                  <IoCashOutline className="text-[1.2rem] md:text-[1.5rem]" />
                </div>
              </div>
              <div className="btm-section w-full p-3 flex flex-col">
                <h2 className="text-[0.9rem] md:text-[1rem]">Amount Paid</h2>
                <h2 className="text-[1.5rem] md:text-[2rem] font-bold">
                  {totalAmount?.total_paid_amount || '0'}
                </h2>
              </div>
            </div>
          </div>

          {/* Payment History section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Payment History
              </h2>
              <button
                className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
                onClick={() => setIsAddPaymentOpen(true)}
              >
                Add Payment
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              {paymentDetailsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    Loading payment history...
                  </p>
                </div>
              ) : paymentDetailsError ? (
                <div className="text-red-500 text-center py-8">
                  {paymentDetailsError}
                </div>
              ) : paymentDetails?.payment_details?.length > 0 ? (
                <div className="min-w-full">
                  {/* Header */}
                  <div className="bg-gray-50 border-b">
                    <div className="grid grid-cols-3 px-6 py-3">
                      <div className="text-sm font-semibold text-gray-900">
                        Date
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        Amount
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        Status
                      </div>
                    </div>
                  </div>
                  {/* Payment Rows */}
                  <div className="divide-y divide-gray-200">
                    {paymentDetails.payment_details.map((payment, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 px-6 py-4 hover:bg-gray-50"
                      >
                        <div className="text-sm text-gray-900">
                          {formatPaymentDate(payment.payment_date)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ₹{payment.paid_amount}
                        </div>
                        <div className="text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-full ${getPaymentStatusStyle(
                              payment.payment_status
                            )}`}
                          >
                            {getStatusIcon(payment.payment_status)}
                            {payment.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payment history available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAddPaymentOpen && (
        <AddPaymentModal
          onClose={() => setIsAddPaymentOpen(false)}
          eventId={eventData.id}
          eventGroupId={eventData.event_group}
        />
      )}
    </>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-');
};

// Main EventsTable Component
const EventsTable = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { data: events, loading, error } = useSelector((state) => state.events);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isCancelSuccessModalOpen, setIsCancelSuccessModalOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null); // 'loading', 'success', 'error'

  // New states for search functionality
  const [displayData, setDisplayData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchEvents())
      .unwrap()
      .then((result) => {
        const eventsArray = result?.data || [];
        setDisplayData(Array.isArray(eventsArray) ? eventsArray : []);
      })
      .catch((error) => {
        setDisplayData([]);
      });
  }, [dispatch]);

  // Update display data when events changes
  useEffect(() => {
    if (events && Array.isArray(events)) {
      setDisplayData(events);
    } else if (events?.data && Array.isArray(events.data)) {
      setDisplayData(events.data);
    } else {
      setDisplayData([]);
    }
  }, [events]);

  // Debounced search handler
  const handleSearch = useCallback(
    async (searchTerm) => {
      setTableLoading(true);
      setSearchError(null);

      try {
        if (!searchTerm.trim()) {
          // If search is empty, fetch all events
          const response = await dispatch(fetchEvents()).unwrap();
          setDisplayData(Array.isArray(response?.data) ? response.data : []);
        } else {
          // Search for specific term
          const response = await axiosInstance.get(
            `/search-events/${searchTerm}`
          );
          
          if (response.status === 200) {
            // Directly set the data from the response
            const searchResults = response.data?.data;
            setDisplayData(Array.isArray(searchResults) ? searchResults : []);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchError('Failed to fetch search results');
        setDisplayData([]); // Set empty array on error
      } finally {
        setTableLoading(false);
      }
    },
    [dispatch]
  );

  // Debounced search implementation
  const debouncedSearch = useCallback(
    (searchTerm) => {
      // Clear any existing timeout
      const timeoutId = setTimeout(() => {
        handleSearch(searchTerm);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [handleSearch]
  );

  const getEventStatusStyle = (status) => {
    const normalizedStatus = (status || '').toLowerCase().trim();

    switch (normalizedStatus) {
      case 'upcoming':
        return 'bg-[#E6F3FF] text-[#0066CC] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
      case 'cancelled':
      case 'canceled':
        return 'bg-[#FFE6E6] text-[#CC0000] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
      case 'completed':
        return 'bg-[#E6FFE6] text-[#008000] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
      case 'ongoing':
        return 'bg-[#FFF3E6] text-[#CC7700] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
      default:
        return 'bg-[#F0F0F0] text-[#666666] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
    }
  };

  const getPaymentStatusStyle = (status) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    const baseStyle =
      'px-3 py-1 w-28 rounded-full text-xs font-medium flex items-center justify-center';

    switch (normalizedStatus) {
      case 'pending':
        return `${baseStyle} bg-red-100 text-red-800`;
      case 'advance paid':
      case 'advance':
        return `${baseStyle} bg-yellow-100 text-yellow-600`;
      case 'completed':
        return `${baseStyle} bg-green-500 text-white`;
      case 'ongoing':
        return `${baseStyle} bg-blue-100 text-blue-800`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  const handleCancelEvent = async () => {
    if (!selectedEvent.id || !selectedEvent.event_group) {
      return;
    }

    setDeleteStatus('loading');
    try {
      await dispatch(
        cancelEvent({
          eventId: selectedEvent.id,
          eventGroupId: selectedEvent.event_group,
        })
      ).unwrap();
      setDeleteStatus('success');
      
      setTimeout(() => {
        setShowConfirmationModal(false);
        setSelectedEvent(null);
        setDeleteStatus(null);
      }, 1500);
    } catch (error) {
      setDeleteStatus('error');
      
      setTimeout(() => {
        setShowConfirmationModal(false);
        setSelectedEvent(null);
        setDeleteStatus(null);
      }, 1500);
    }
  };

  const handleCancelClick = (event) => {
    setSelectedEvent(event);
    setShowConfirmationModal(true);
  };

  const handlePaymentDetailsClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Updated Modal Component with better visuals
  const CancellationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-[90%] md:w-[400px] transform transition-all">
        {deleteStatus === 'loading' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
            <p className="text-gray-600">Cancelling event...</p>
          </div>
        )}

        {deleteStatus === 'success' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <p className="text-gray-600 text-center font-medium">
              Event cancelled successfully!
            </p>
          </div>
        )}

        {deleteStatus === 'error' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <p className="text-red-600 text-center font-medium">
              Failed to cancel event
            </p>
          </div>
        )}

        {deleteStatus === null && (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Cancel Event
            </h3>
            <p className="text-gray-500 text-center mb-8">
              This action cannot be undone. Are you sure you want to cancel this event?
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                onClick={() => setShowConfirmationModal(false)}
                disabled={deleteStatus === 'loading'}
              >
                No, keep it
              </button>
              <button
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                onClick={handleCancelEvent}
                disabled={deleteStatus === 'loading'}
              >
                Yes, cancel it
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (loading && !tableLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-xl text-red-500 font-semibold">Error: {error}</div>
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
                  {displayData.map((event) => (
                    <tr
                      key={event?.id || Math.random()}
                      className="bg-white hover:bg-gray-50"
                    >
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        {event.event_name}
                      </td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        {event.event_group_company_name}
                      </td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        {formatDate(event.start_date)}
                      </td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        {formatDate(event.end_date)}
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="w-28">
                          <span
                            className={getEventStatusStyle(event.event_status)}
                          >
                            {event.event_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center w-36 justify-between">
                          <span
                            className={getPaymentStatusStyle(
                              event.payment_status
                            )}
                          >
                            {event.payment_status}
                          </span>
                          <IoInformationCircleOutline
                            className="text-gray-500 text-[1.5rem] cursor-pointer"
                            onClick={() => handlePaymentDetailsClick(event)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-20">
                          {(event.event_status === 'upcoming' || event.event_status === 'ongoing') && (
                            <button
                              className={`w-full bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors ${
                                isCanceling ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              onClick={() => handleCancelClick(event)}
                              disabled={isCanceling}
                            >
                              {isCanceling ? 'Canceling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <PaymentDetailsModal
          onClose={() => setIsModalOpen(false)}
          eventData={selectedEvent}
        />
      )}

      {showConfirmationModal && <CancellationModal />}

      {isCancelSuccessModalOpen && (
        <CancelSuccessModal onClose={() => setIsCancelSuccessModalOpen(false)} />
      )}
    </>
  );
};

export default EventsTable;
