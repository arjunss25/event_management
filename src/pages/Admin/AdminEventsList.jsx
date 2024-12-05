import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosConfig';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../../Redux/authSlice';
import { tokenService } from '../../tokenService';
import { useNavigate } from 'react-router-dom';

const AdminEventsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const handleEventSelect = async (eventId) => {
    try {
      const response = await axiosInstance.post('/event-group-event-token/', {
        event_id: eventId,
      });

      if (response.data.status === 'Success') {
        const { access, refresh, event_group_id } = response.data.data;

        // Store new tokens
        tokenService.setTokens(access, refresh);

        // Update Redux state with the correct event_group_id from the response
        dispatch(
          loginSuccess({
            token: access,
            user: tokenService.getUserData(),
            event_group_id: event_group_id,
          })
        );

        // Navigate to dashboard or next page
        navigate('/admin/dashboard');
      } else {
        throw new Error(response.data.message || 'Failed to generate tokens');
      }
    } catch (err) {
      console.error('Error generating tokens:', err);
      setError(err.message || 'Failed to generate tokens');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-12 flex flex-col space-y-1">
        <span className="text-xs font-medium tracking-widest uppercase text-gray-500">
          Administration
        </span>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-light text-gray-900">
            Events
            <span className="font-bold">List</span>
          </h1>
          <span className="text-sm text-gray-400 font-medium">
            {events.length} Events
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 ease-out transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handleEventSelect(event.id)}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.image}
                alt={event.event_name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    event.event_status === 'upcoming'
                      ? 'bg-green-500/20 text-green-500 backdrop-blur-sm'
                      : 'bg-gray-500/20 text-gray-100 backdrop-blur-sm'
                  }`}
                >
                  {event.event_status}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 line-clamp-1">
                  {event.event_name}
                </h2>
                <p className="text-xs text-gray-500 font-medium line-clamp-1">
                  {event.event_group_name}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center text-gray-600 group-hover:text-purple-500 transition-colors duration-300">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs">
                    {event.start_date} - {event.end_date}
                  </span>
                </div>

                <div className="flex items-center text-gray-600 group-hover:text-purple-500 transition-colors duration-300">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-xs line-clamp-1">
                    {event.venue || 'Location TBA'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-wide font-medium text-gray-500">
                    Amount
                  </span>
                  <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                    ₹{event.total_amount}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                    event.payment_status === 'Pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
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
