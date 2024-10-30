// src/Components/Superadmin/EventgroupsSuperadminTable.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEvents,
  deleteEvent,
} from '../../Redux/Slices/SuperAdmin/EventgroupssuperadminSlice';
import { FaRegEye } from 'react-icons/fa';
import { FiEdit3 } from 'react-icons/fi';
import { MdOutlineDeleteOutline } from 'react-icons/md';

const EventgroupsSuperadminTable = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.eventGroups);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      dispatch(deleteEvent(id));
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/api/placeholder/40/40';
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!Array.isArray(events) || events.length === 0) {
    return <div className="p-4">No events available.</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-8 mt-10">
      <div className="relative overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Event Group
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Owner's Name
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  e-mail
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">Phone</th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Event Status
                </th>
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0">
                        {event.profilePicture ? (
                          <img
                            src={event.profilePicture}
                            alt={`${event.eventGroup} logo`}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">
                              No img
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{event.eventGroup}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.ownerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24">
                      {event.status ? (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs text-center w-full">
                          Up Coming
                        </span>
                      ) : (
                        <span className="inline-block px-2 text-center w-full">
                          -
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        className="text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center"
                        onClick={() => console.log('View event:', event.id)}
                      >
                        <FaRegEye className="text-[1.2rem]" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center"
                        onClick={() => console.log('Edit event:', event.id)}
                      >
                        <FiEdit3 className="text-[1.2rem]" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 w-10 h-10 flex items-center justify-center"
                        onClick={() => handleDelete(event.id)}
                      >
                        <MdOutlineDeleteOutline className="text-[1.2rem]" />
                      </button>
                    </div>
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

export default EventgroupsSuperadminTable;