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


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        
        const mealTypesResponse = await axiosInstance.get(
          '/unique-meals-list/'
        );
        const allMealTypes = mealTypesResponse.data.data;

        
        const countResponse = await axiosInstance.get(
          '/mealcount-currentdate/'
        );
        const currentCounts = countResponse.data.data || [];

        
        const countsMap = {};
        
        if (Array.isArray(currentCounts)) {
          currentCounts.forEach((meal) => {
            countsMap[meal.meal_type_name.toLowerCase()] = meal.count;
          });
        } else {
        
        }


        const initialData = allMealTypes.map((mealType) => ({
          eventType: mealType,
          number: countsMap[mealType.toLowerCase()] || 0,
          icon: getMealIcon(mealType),
        }));

        setMealData(initialData);

        if (countResponse.data.event?.id) {
          setEventId(countResponse.data.event.id);
        }
      } catch (error) {

        const defaultData =
          allMealTypes?.map((mealType) => ({
            eventType: mealType,
            number: 0,
            icon: getMealIcon(mealType),
          })) || [];
        setMealData(defaultData);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!event_id) return;


    if (!websocketService.isInRoom(event_id)) {
      websocketService.connectWithAuth(event_id);
    }

    const handleWebSocketMessage = (data) => {

      if (data.type === 'MEAL_SCANNED') {
        setMealData((prevData) => {

          return prevData.map((meal) => {
            if (meal.eventType.toLowerCase() === data.meal_type.toLowerCase()) {

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



    return () => {
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
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-[#f7fafc] overflow-x-hidden">
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
