import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMealCount } from '../Redux/Slices/Employee/mealScannerSlice';
import Dashboardcards from '../Components/Dashboardcards';
import RegisteredUserTable from '../Components/Admin/RegisteredUserTable';
import { websocketService } from '../services/websocketService';
import axiosInstance from '../axiosConfig';
import {
  MdOutlineFoodBank,
  MdDinnerDining,
  MdFreeBreakfast,
  MdCoffee,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

// Add getMealIcon function
const getMealIcon = (mealType) => {
  const type = mealType.toLowerCase();
  switch (type) {
    case 'breakfast':
      return <MdFreeBreakfast className="text-blue-500" />;
    case 'lunch':
      return <MdOutlineFoodBank className="text-green-500" />;
    case 'dinner':
      return <MdDinnerDining className="text-purple-500" />;
    case 'refreshment':
    case 'refrshment':
      return <MdCoffee className="text-orange-500" />;
    default:
      return <MdOutlineFoodBank className="text-gray-500" />;
  }
};

const AdminDashboard = () => {
  const [mealData, setMealData] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const event_id = useSelector((state) => state.auth.event_id);
  const [roomStatus, setRoomStatus] = useState({ joined: false, members: [] });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await axiosInstance.get('/mealcount-currentdate/');
        const initialData = response.data.data.map((meal) => ({
          eventType: meal.meal_type_name,
          number: meal.count,
          icon: getMealIcon(meal.meal_type_name),
        }));
        console.log('Initial meal data loaded:', initialData);
        setMealData(initialData);

        if (response.data.event?.id) {
          console.log('AdminDashboard: Got event_id:', response.data.event.id);
          setEventId(response.data.event.id);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Setup WebSocket
  useEffect(() => {
    if (!event_id) return;

    console.log(
      'AdminDashboard: Setting up WebSocket subscription for event:',
      event_id
    );

    // Only connect if not already in the correct room
    if (!websocketService.isInRoom(event_id)) {
      websocketService.connectWithAuth(event_id);
    }

    const handleWebSocketMessage = (data) => {
      console.log('AdminDashboard: Received WebSocket message:', data);

      if (data.type === 'MEAL_SCANNED') {
        setMealData((prevData) => {
          console.log('Current meal data:', prevData);
          console.log('Updating for meal type:', data.meal_type);

          return prevData.map((meal) => {
            if (meal.eventType.toLowerCase() === data.meal_type.toLowerCase()) {
              console.log(
                `Updating ${meal.eventType} count from ${meal.number} to ${data.new_count}`
              );
              return {
                ...meal,
                number: parseInt(data.new_count, 10),
              };
            }
            return meal;
          });
        });
      }
    };

    const unsubscribe = websocketService.subscribe(handleWebSocketMessage);

    // Log subscription setup
    console.log('AdminDashboard: WebSocket subscription set up');

    return () => {
      console.log('AdminDashboard: Cleaning up WebSocket subscription');
      unsubscribe();
    };
  }, [event_id]);

  useEffect(() => {
    const unsubscribe = websocketService.subscribe((data) => {
      if (data.type === 'ROOM_JOIN_STATUS') {
        setRoomStatus({
          joined: data.success,
          members: data.members,
        });
        console.log('📡 Admin Room Status:', {
          joined: data.success,
          members: data.members,
          eventId: data.event_id,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-[#f7fafc] overflow-x-hidden">
      {/* <div className="absolute top-4 right-4 text-gray-600 text-sm">
        WebSocket: {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div> */}

      <main className="w-full">
        <div className="w-full overflow-hidden">
          <div className="w-full flex gap-5 flex-wrap justify-center lg:justify-start">
            {mealData.map((item) => (
              <Dashboardcards
                key={`${item.eventType}-${item.number}`}
                eventData={item}
              />
            ))}
          </div>
          <div className="table-component mt-10">
            <h1 className="text-xl lg:text-2xl font-semibold mb-6">Events</h1>
            <RegisteredUserTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
