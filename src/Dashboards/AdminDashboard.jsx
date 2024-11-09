import React from 'react'
import Dashboardcards from '../Components/Dashboardcards';
import { MdOutlineFoodBank } from "react-icons/md";
import { FaBowlRice } from "react-icons/fa6";
import { MdDinnerDining } from "react-icons/md";
import RegisteredUserTable from '../Components/Admin/RegisteredUserTable';
import EmployeeScanner from '../Components/Employee/EmployeeScanner';


const AdminDashboard = () => {

  const eventData = [
    {
      eventType: 'Breakfast',
      number: 250,
      icon: <MdOutlineFoodBank />,
    },
    {
      eventType: 'Lunch',
      number: 180,
      icon: <FaBowlRice />,
    },
    {
      eventType: 'Dinner',
      number: 54,
      icon: <MdDinnerDining />,
    },

  ];

  return (
    <div className="flex w-full min-h-screen bg-[#f7fafc] overflow-x-hidden">
      

      {/* main content */}
      <main className="w-full">


        {/* dashboard content */}
        <div className=" w-full overflow-hidden">
          {/* dashboard-cards */}
          <div className="w-full flex gap-5 flex-wrap justify-center lg:justify-start">
            {eventData.map((item, i) => (
              <Dashboardcards key={i} eventData={item} />
            ))}
          </div>

          {/* table-componenet */}
          <div className="table-component mt-10">
            <h1 className="text-xl lg:text-2xl font-semibold mb-6">Events</h1>
              <RegisteredUserTable/>
              {/* <EmployeeScanner/> */}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard