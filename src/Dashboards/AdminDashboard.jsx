import React from 'react'
import AdminNavcomponent from '../Components/Admin/AdminNavcomponent'
import Dashboardcards from '../Components/Dashboardcards';
import Superadmingraph from '../Components/Superadmin/Superadmingraph';
import { MdOutlineFoodBank } from "react-icons/md";
import { FaBowlRice } from "react-icons/fa6";
import { MdDinnerDining } from "react-icons/md";

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
        {/* Nav component */}
        <nav className="">
        <AdminNavcomponent/>
        </nav>

        {/* dashboard content */}
        <div className="p-4 lg:p-8 w-full overflow-hidden">
          {/* dashboard-cards */}
          <div className="w-full flex gap-5 flex-wrap">
            {eventData.map((item, i) => (
              <Dashboardcards key={i} eventData={item} />
            ))}
          </div>

          {/* table-componenet */}
          <div className="table-component mt-10">
            <h1 className="text-xl lg:text-2xl font-semibold mb-6">Events</h1>
            {/* <TableComponent /> */}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard