import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RiEditLine } from "react-icons/ri";
import "./TableComponent.css";
import {
  fetchEvents,
  fetchEventsByGroupId,
  updatePaymentStatus,
} from '../../Redux/Slices/SuperAdmin/eventssuperadminSlice';

const EventgroupEventsList = ({ eventGroupId }) => {
  const dispatch = useDispatch();
  const { data: events, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    if (eventGroupId) {
      dispatch(fetchEventsByGroupId(eventGroupId));
    } else {
      dispatch(fetchEvents());
    }
  }, [dispatch, eventGroupId]);

  const handlePaymentStatusChange = (id, status) => {
    dispatch(updatePaymentStatus({ id, status }));
  };

  // const getEventStatusStyle = (status) => {
  //   const normalizedStatus = status.toLowerCase();

  //   if (normalizedStatus === 'upcoming') {
  //     return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
  //   } else if (normalizedStatus === 'cancel') {
  //     return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
  //   } else if (normalizedStatus === 'completed') {
  //     return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
  //   }
  //   return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap';
  // };

  // const getPaymentStatusStyle = (status) => {
  //   switch (status) {
  //     case 'Pending':
  //       return 'bg-red-50 text-red-700';
  //     case 'Advance Paid':
  //       return 'bg-yellow-50 text-yellow-700';
  //     case 'Completed':
  //       return 'bg-green-50 text-green-700';
  //     default:
  //       return 'bg-gray-50 text-gray-700';
  //   }
  // };

  if (!Array.isArray(events)) {
    return <div>No events available</div>;
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg p-4 md:p-4 mt-8 events-table-main">
      <div className="relative overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-[#2D3436]">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Event</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Start Date</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">End Date</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Event Status</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Payment Status</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-4 text-black whitespace-nowrap">{event.event}</td>
                  <td className="px-4 py-4 text-black whitespace-nowrap">{event.eventdate}</td>
                  <td className="px-4 py-4 text-black whitespace-nowrap">{event.eventenddate}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-28">
                      <span >
                        {event.eventstatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-28">
                      <span >
                        {event.paymentstatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {event.eventstatus === 'upcoming' && (
                      <button className="text-black hover:text-blue-700 flex items-center justify-center text-[1.3rem]">
                        <RiEditLine />
                      </button>
                    )}
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

export default EventgroupEventsList;