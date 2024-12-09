import React, { useEffect, useState, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RiEditLine } from 'react-icons/ri';
import { FaTimes } from 'react-icons/fa';
import './TableComponent.css';
import {
  fetchEventsByGroupId,
  updateEvent,
} from '../../Redux/Slices/SuperAdmin/eventssuperadminSlice';


const STATUS_STYLES = {
  event: {
    upcoming: 'bg-[#E6F3FF] text-[#0066CC]',
    ongoing: 'bg-[#FFF3E6] text-[#CC7700]',
    completed: 'bg-[#E6FFE6] text-[#008000]',
    pending: 'bg-[#FFE6E6] text-[#CC0000]',
    PENDING: 'bg-[#FFE6E6] text-[#CC0000]',
    Pending: 'bg-[#FFE6E6] text-[#CC0000]',
    cancelled: 'bg-[#FFE6E6] text-[#CC0000]',
    canceled: 'bg-[#FFE6E6] text-[#CC0000]'
  },
  payment: {
    pending: 'bg-[#FFE6E6] text-[#CC0000]',
    PENDING: 'bg-[#FFE6E6] text-[#CC0000]',
    Pending: 'bg-[#FFE6E6] text-[#CC0000]',
    completed: 'bg-[#E6FFE6] text-[#008000]',
    'advance paid': 'bg-[#FFF3E6] text-[#CC7700]',
    advance: 'bg-[#FFF3E6] text-[#CC7700]',
    failed: 'bg-[#FFE6E6] text-[#CC0000]',
    ongoing: 'bg-[#E6F3FF] text-[#0066CC]'
  }
};

// Separate Modal component with memo
const EditModal = memo(({ isOpen, onClose, formData, onSubmit, onChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Event</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="event_name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Event Name
            </label>
            <input
              id="event_name"
              name="event_name"
              type="text"
              value={formData.event_name}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Start Date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
            />
          </div>

          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              End Date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
            />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-black bg-white border border-black rounded-full hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

const EventgroupEventsList = ({ eventGroupId }) => {
  const dispatch = useDispatch();
  const { data: events, loading, error } = useSelector((state) => state.events);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    event_name: '',
    start_date: '',
    end_date: '',
    event_status: '',
    payment_status: '',
  });

  useEffect(() => {
    if (eventGroupId) {
      dispatch(fetchEventsByGroupId(eventGroupId));
    }
  }, [dispatch, eventGroupId]);

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setFormData({
      event_name: event.event_name || '',
      start_date: event.start_date || '',
      end_date: event.end_date || '',
      event_status: event.event_status || '',
      payment_status: event.payment_status || '',
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      id: selectedEvent.id,
      ...formData,
    };

    try {
      await dispatch(
        updateEvent({
          eventGroupId,
          eventData: updateData,
        })
      ).unwrap();
      setIsModalOpen(false);
      dispatch(fetchEventsByGroupId(eventGroupId));
    } catch (error) {
    }
  };

  if (!eventGroupId) {
    return <div className="p-4">No event group selected</div>;
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">
          {error === '404' ? 'No events found for this group.' : error}
        </p>
      </div>
    );
  }

  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">
          No events have been added to this group yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 md:p-4 mt-8 events-table-main">
      <div className="relative overflow-x-auto">
        <div className="min-w-[1000px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-white uppercase bg-[#2D3436]">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Event
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Start Date
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  End Date
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Event Status
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Payment Status
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-4 text-black whitespace-nowrap">
                    {event.event_name || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-black whitespace-nowrap">
                    {event.start_date || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-black whitespace-nowrap">
                    {event.end_date || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-28">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_STYLES.event[event.event_status] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {event.event_status || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="w-28">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_STYLES.payment[event.payment_status] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {event.payment_status || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {event.event_status === 'upcoming' && (
                      <button
                        onClick={() => handleEditClick(event)}
                        className="text-black hover:text-blue-700 flex items-center justify-center text-[1.3rem]"
                      >
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

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EventgroupEventsList;
