import React, { useEffect, useState, memo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IoInformationCircleOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { IoCashOutline } from "react-icons/io5";
import { FaCheckCircle, FaSearch } from "react-icons/fa";
import { fetchEvents, updatePaymentStatus, cancelEvent, fetchTotalAmount, addPayment, fetchPaymentDetails } from '../../Redux/Slices/SuperAdmin/eventssuperadminSlice';
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
  const { paymentLoading, paymentError } = useSelector((state) => state.events);
  
  const [formData, setFormData] = useState({
    date: '',
    amount: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const paymentData = {
      eventId: eventId,
      eventGroupId: eventGroupId,
      date: formData.date,
      amount: formData.amount
    };
    
    console.log('Submitting payment with data:', paymentData);

    try {
      await dispatch(addPayment(paymentData)).unwrap();
      console.log('Payment added successfully');
      dispatch(fetchEvents());
      dispatch(fetchTotalAmount(eventId));
      onClose();
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} to ${value}`);
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white rounded-[1.5rem] w-[30vw] py-8 px-10 border-[2px] border-black">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Add Payment</h1>
          <IoClose 
            className="text-3xl cursor-pointer hover:text-gray-700" 
            onClick={onClose} 
          />
        </div>

        {paymentError && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {paymentError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          <div className="btn-sec w-full flex justify-end">
            <button
              type="submit"
              disabled={paymentLoading}
              className={`w-fit bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors ${
                paymentLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {paymentLoading ? 'Adding Payment...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    paymentDetailsError
  } = useSelector((state) => state.events);

  useEffect(() => {
    console.log('PaymentDetailsModal Mounted with Event Data:', eventData);

    if (eventData?.id) {
      console.log(`Dispatching Total Amount and Payment Details for Event ID: ${eventData.id}`);
      
      dispatch(fetchTotalAmount(eventData.id))
        .unwrap()
        .then(result => {
          console.log('Total Amount Fetch Success:', result);
        })
        .catch(error => {
          console.error('Total Amount Fetch Error:', error);
        });

      dispatch(fetchPaymentDetails(eventData.id))
        .unwrap()
        .then(result => {
          console.log('Payment Details Fetch Success:', result);
        })
        .catch(error => {
          console.error('Payment Details Fetch Error:', error);
        });
    }
  }, [dispatch, eventData?.id]);

  

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-[95%] md:w-[80%] lg:w-[60vw] h-[90vh] md:h-[80vh] overflow-y-scroll py-6 md:py-10 px-4 md:px-10">
          {/* Top section */}
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-semibold">Payment Details</h1>
            <IoClose 
              className="text-2xl md:text-3xl cursor-pointer hover:text-gray-700" 
              onClick={onClose} 
            />
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
                  <div className="text-[1.5rem] md:text-[2rem] font-bold">Loading...</div>
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
                <h2 className="text-[0.9rem] md:text-[1rem]">Remaining Amount</h2>
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
          <div className="mt-6 md:mt-8">
            <div className="top-section flex flex-col md:flex-row justify-between items-start md:items-center w-full mb-4 md:mb-5">
              <h2 className="font-medium text-[1.1rem] md:text-[1.2rem] mb-2 md:mb-0">Payment History</h2>
              <button 
                className="bg-black text-white px-3 md:px-4 py-2 rounded-md text-[0.8rem] md:text-[0.9rem] hover:bg-gray-800 transition-colors"
                onClick={() => {
                  console.log('Add Payment Button Clicked');
                  setIsAddPaymentOpen(true);
                }}
              >
                Add Payment
              </button>
            </div>
            <div className="border-t border-gray-200 overflow-x-auto">
              {paymentDetailsLoading ? (
                <div className="text-center py-4">Loading payment history...</div>
              ) : paymentDetailsError ? (
                <div className="text-red-500 text-center py-4">{paymentDetailsError}</div>
              ) : paymentDetails?.payment_details?.length > 0 ? (
                <div className="min-w-[600px]">
                  {paymentDetails.payment_details.map((payment, index) => (
                    <div 
                      key={index} 
                      className="flex justify-start items-center p-3 md:p-5 border-b-[1px] border-gray-200"
                    >
                      <div className="w-[40px] flex justify-center">
                        <FaCheckCircle className="text-green-600 text-lg" />
                      </div>
                      
                      <div className="flex-1 flex justify-between items-center gap-4 md:gap-32">
                        <div className="date-sec">
                          <h1 className="text-[0.8rem] md:text-base">Date</h1>
                          <p className="text-gray-500 text-[0.8rem] md:text-base">{payment.payment_date}</p>
                        </div>
                        <div className="payment-section">
                          <h1 className="text-[0.8rem] md:text-base">Amount</h1>
                          <p className="text-[0.8rem] md:text-base">{payment.paid_amount}</p>
                        </div>
                        <div className="payment-status">
                          <h1 className="text-[0.8rem] md:text-base">Status</h1>
                          <p className="text-[0.8rem] md:text-base">{payment.payment_status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">No payment history available</div>
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

// Main EventsTable Component
const EventsTable = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { data: events, loading, error } = useSelector((state) => state.events);
  const [isCanceling, setIsCanceling] = useState(false);
  
  // New states for search functionality
  const [displayData, setDisplayData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Initial data fetch
  useEffect(() => {
    console.log('Fetching events...');
    dispatch(fetchEvents())
      .unwrap()
      .then((result) => {
        console.log('Events fetched successfully:', result);
        // Ensure we're setting an array from the response
        const eventsArray = result?.data || [];
        setDisplayData(Array.isArray(eventsArray) ? eventsArray : []);
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
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
  const handleSearch = useCallback(async (searchTerm) => {
    // If search term is empty, reset to show all events
    if (!searchTerm.trim()) {
      setDisplayData(Array.isArray(events) ? events : events?.data || []);
      setTableLoading(false);
      setSearchError(null);
      return;
    }

    try {
      setTableLoading(true);
      setSearchError(null);

      const response = await axiosInstance.get(`/search-events/${searchTerm}`);
      
      if (response.status === 200) {
        const searchResults = response.data?.data || [];
        setDisplayData(Array.isArray(searchResults) ? searchResults : []);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError('Failed to fetch search results');
      setDisplayData([]);
    } finally {
      setTableLoading(false);
    }
  }, [events]);

  // Debounced search implementation
  const debouncedSearch = useCallback((searchTerm) => {
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
  }, [handleSearch]);

  const getEventStatusStyle = (status) => {
    // Convert to lowercase and trim for consistent comparison
    const normalizedStatus = (status || '').toLowerCase().trim();

    switch (normalizedStatus) {
      case 'upcoming':
        return 'bg-[#E6F3FF] text-[#0066CC] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
      case 'cancelled':  // Added both spellings
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
    // Convert to lowercase and trim for consistent comparison
    const normalizedStatus = (status || '').toLowerCase().trim();
    const baseStyle = 'px-3 py-1 w-28 rounded-full text-xs font-medium flex items-center justify-center';
    
    switch (normalizedStatus) {
      case 'pending':
        return `${baseStyle} bg-[#FFE6E6] text-[#CC0000]`;
      case 'advance paid':
      case 'advance':  // Added alternative
        return `${baseStyle} bg-[#FFF3E6] text-[#CC7700]`;
      case 'completed':
        return `${baseStyle} bg-[#E6FFE6] text-[#008000]`;
      case 'ongoing':
        return `${baseStyle} bg-[#E6F3FF] text-[#0066CC]`;
      default:
        return `${baseStyle} bg-[#F0F0F0] text-[#666666]`;
    }
  };

  const handleCancelEvent = async (event) => {
    if (!event.id || !event.event_group) {
      console.error('Missing required event information for cancellation');
      return;
    }

    if (window.confirm('Are you sure you want to cancel this event?')) {
      setIsCanceling(true);
      try {
        await dispatch(cancelEvent({
          eventId: event.id,
          eventGroupId: event.event_group
        })).unwrap();
        console.log('Event cancelled successfully');
        // Event will be automatically removed from the state due to the reducer logic
      } catch (error) {
        console.error('Error cancelling event:', error);
        // You might want to show an error notification here
      } finally {
        setIsCanceling(false);
      }
    }
  };

  const handlePaymentDetailsClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

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
        <div className="text-xl text-red-500 font-semibold">
          Error: {error}
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
                <p className="text-gray-500 text-center">
                  No events found.
                </p>
              </div>
            ) : (
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
                  {displayData.map((event) => (
                    <tr key={event?.id || Math.random()} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-6 text-black whitespace-nowrap">
                        {event.event_name}
                      </td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">{event.event_group_company_name}</td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">{event.start_date}</td>
                      <td className="px-6 py-6 text-black whitespace-nowrap">{event.end_date}</td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="w-28">
                          <span className={getEventStatusStyle(event.event_status)}>
                            {event.event_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center w-36 justify-between">
                          <span className={getPaymentStatusStyle(event.payment_status)}>
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
                          {event.payment_status !== 'Completed' && event.event_status !== 'completed' && (
                            <button
                              className={`w-full bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors ${
                                isCanceling ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              onClick={() => handleCancelEvent(event)}
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
    </>
  );
};

export default EventsTable;