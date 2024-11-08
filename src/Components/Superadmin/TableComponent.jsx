import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IoInformationCircleOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { IoCashOutline } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import './TableComponent.css';
import { fetchEvents, updatePaymentStatus } from '../../Redux/Slices/SuperAdmin/eventssuperadminSlice';

const AddPaymentModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    status: 'pending'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white rounded-[1.5rem] w-[30vw] py-8 px-10 ml-[300px] border-[2px] border-black">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Add Payment</h1>
          <IoClose className="text-3xl cursor-pointer" onClick={onClose} />
        </div>

        {/* Form */}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="pending">Pending</option>
                <option value="advance">Advance Paid</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="btn-sec w-full flex justify-end">
          <button
            type="submit"
            className="w-fit bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            Add Payment
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentDetailsModal = ({ onClose }) => {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  // When modal mounts, disable body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Cleanup function to re-enable scroll when modal unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-[60vw] ml-[300px] py-10 px-10">
          {/* Top section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Payment Details</h1>
            <IoClose className="text-3xl cursor-pointer" onClick={onClose} />
          </div>

          {/* box-section */}
          <div className="box-section w-full h-[22vh] flex gap-5">
            <div className="box-main w-[25rem] border-[2px] border-black rounded-[1.2rem]">
              <div className="top w-full p-2 flex justify-end">
                <div className="icon-bg p-2 bg-[#f0f3f5] w-fit rounded-[0.5rem]">
                  <IoCashOutline className="text-[1.5rem]" />
                </div>
              </div>
              <div className="btm-section w-full p-3 flex flex-col">
                <h2 className="text-[1rem]">Total Amount</h2>
                <h2 className="text-[2rem] font-bold">25000</h2>
              </div>
            </div>

            <div className="box-main w-[25rem] border-[2px] border-black rounded-[1.2rem]">
              <div className="top w-full p-2 flex justify-end">
                <div className="icon-bg p-2 bg-[#f0f3f5] w-fit rounded-[0.5rem]">
                  <IoCashOutline className="text-[1.5rem]" />
                </div>
              </div>
              <div className="btm-section w-full p-3 flex flex-col">
                <h2 className="text-[1rem]">Total Amount</h2>
                <h2 className="text-[2rem] font-bold">25000</h2>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="mt-8">
            <div className="top-section flex justify-between items-center w-full mb-5">
              <h2 className="font-medium text-[1.2rem]">Payment History</h2>
              <button 
                className="bg-black text-white px-4 py-2 rounded-md text-[0.9rem]"
                onClick={() => setIsAddPaymentOpen(true)}
              >
                Add Payment
              </button>
            </div>
            <div className="border-t border-gray-200">
              <div className="flex justify-start gap-32 items-center p-5 border-b-[1px] border-gray-200">
                <FaCheckCircle className="text-green-600" />
                <div className="date-sec">
                  <h1>Date</h1>
                  <p className="text-gray-500">04-11-2024</p>
                </div>
                <div className="payment-section">
                  <h1>Amount</h1>
                  <p>1500</p>
                </div>
              </div>

              <div className="flex justify-start gap-32 items-center p-5 border-b-[1px] border-gray-200">
                <FaCheckCircle className="text-green-600" />
                <div className="date-sec">
                  <h1>Date</h1>
                  <p className="text-gray-500">04-11-2024</p>
                </div>
                <div className="payment-section">
                  <h1>Amount</h1>
                  <p>1500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isAddPaymentOpen && <AddPaymentModal onClose={() => setIsAddPaymentOpen(false)} />}
    </>
  );
};

const EventsTable = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: events, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

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
    const baseStyle = 'px-3 py-1 w-28 rounded-full text-xs font-medium flex items-center justify-center';
    switch (status) {
      case 'Pending':
        return `${baseStyle} bg-red-50 text-red-700`;
      case 'Advance Paid':
        return `${baseStyle} bg-yellow-50 text-yellow-700`;
      case 'Completed':
        return `${baseStyle} bg-green-50 text-green-700`;
      default:
        return `${baseStyle} bg-gray-50 text-gray-700`;
    }
  };

  const handlePaymentStatusChange = (id, status) => {
    dispatch(updatePaymentStatus({ id, status }));
  };

  if (!Array.isArray(events)) {
    return <div>No events available</div>;
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="w-full bg-white rounded-lg p-4 md:p-4 mt-10 events-table-main">
        <div className="relative overflow-x-auto">
          <div className="min-w-[1000px]">
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
                {events.map((event) => (
                  <tr key={event.id} className="bg-white hover:bg-gray-50">
                    <td className="px-6 py-6 text-black whitespace-nowrap">{event.event}</td>
                    <td className="px-6 py-6 text-black whitespace-nowrap">{event.eventgroup}</td>
                    <td className="px-6 py-6 text-black whitespace-nowrap">{event.eventdate}</td>
                    <td className="px-6 py-6 text-black whitespace-nowrap">{event.eventenddate}</td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="w-28">
                        <span className={getEventStatusStyle(event.eventstatus)}>
                          {event.eventstatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center w-36 justify-between">
                        <span className={getPaymentStatusStyle(event.paymentstatus)}>
                          {event.paymentstatus}
                        </span>
                        <IoInformationCircleOutline 
                          className="text-gray-500 text-[1.5rem] cursor-pointer" 
                          onClick={() => setIsModalOpen(true)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-20">
                        {event.paymentstatus !== 'Completed' && (
                          <button
                            className="w-full bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                            onClick={() => handlePaymentStatusChange(event.id, 'Cancel')}
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
      {isModalOpen && <PaymentDetailsModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default EventsTable;