import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosConfig';
import { useSelector } from 'react-redux';

const AdminEventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const eventGroupId = useSelector((state) => state.auth.event_group_id);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/login-eventgroup-event/');
        if (response.data.status === 'Success') {
          setEvents(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch events');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Events List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
            <img
              src={event.image}
              alt={event.event_name}
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{event.event_name}</h2>
            <p className="text-gray-600 mb-2">{event.event_group_name}</p>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Start Date:</span>{' '}
                {event.start_date}
              </p>
              <p>
                <span className="font-medium">End Date:</span> {event.end_date}
              </p>
              <p>
                <span className="font-medium">Venue:</span>{' '}
                {event.venue || 'Not specified'}
              </p>
              <p>
                <span className="font-medium">Total Amount:</span> ₹
                {event.total_amount}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    event.event_status === 'upcoming'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {event.event_status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    event.payment_status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {event.payment_status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEventsList;
