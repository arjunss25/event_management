import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig'; // Adjust the path as per your project structure
import Navcomponent from '../Components/Navcomponent';
import Dashboardcards from '../Components/Dashboardcards';
import Superadmingraph from '../Components/Superadmin/Superadmingraph';
import TableComponent from '../Components/Superadmin/TableComponent';
import { IoCheckmarkDoneCircleOutline } from 'react-icons/io5';
import { MdPendingActions, MdOutlineCancel, MdOutlineEventAvailable } from 'react-icons/md';

const SuperadminDashboard = () => {
  const [eventData, setEventData] = useState([]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.get('/cards-event-details/');
        const data = response.data.data; // Access the nested 'data' object
  
        // Map the data to include the required icons and labels
        const mappedData = [
          {
            eventType: 'Total Events',
            number: data.total_events, // Adjust to match API key
            icon: <MdOutlineEventAvailable />,
          },
          {
            eventType: 'Completed Events',
            number: data.completed_events, // Adjust to match API key
            icon: <IoCheckmarkDoneCircleOutline />,
          },
          {
            eventType: 'Upcoming Events',
            number: data.upcoming_events, // Adjust to match API key
            icon: <MdPendingActions />,
          },
          {
            eventType: 'Cancelled Events',
            number: data.cancelled_events, // Adjust to match API key
            icon: <MdOutlineCancel />,
          },
        ];
  
        setEventData(mappedData);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };
  
    fetchEventData();
  }, []);
  
  return (
    <div className="flex w-full min-h-screen bg-[#f7fafc] overflow-x-hidden">
      {/* sidebar */}
      {/* <aside className="fixed left-0 top-0 z-20 w-[78px] lg:w-[300px] h-screen bg-white border-r border-[#e6e6e6] transition-all duration-300">
        <SidebarSuperadmin/>
      </aside> */}

      {/* main content */}
      <main className="w-full">

        {/* dashboard content */}
        <div className="p-4 lg:p-8 w-full overflow-hidden">
          {/* dashboard-cards */}
          <div className="w-full flex gap-5 flex-wrap justify-center lg:justify-start">
            {eventData.map((item, i) => (
              <Dashboardcards key={i} eventData={item} />
            ))}
          </div>

          {/* graph-component */}
          <div className="mt-8 lg:mt-12">
            <Superadmingraph />
          </div>

          {/* table-component */}
          <div className="table-component">
            <h1 className="text-xl lg:text-2xl font-semibold mb-6">Events</h1>
            <TableComponent />
          </div>

          <div className="modal w-full"></div>
        </div>
      </main>
    </div>
  );
};

export default SuperadminDashboard;
