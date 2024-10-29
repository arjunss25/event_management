import React from 'react'
import SidebarSuperadmin from '../Components/SidebarSuperadmin'
import Navcomponent from '../Components/Navcomponent'
import Dashboardcards from '../Components/Dashboardcards'
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5"
import { MdPendingActions } from "react-icons/md"
import { MdOutlineCancel } from "react-icons/md"
import { MdOutlineEventAvailable } from "react-icons/md"
import Superadmingraph from '../Components/Superadmingraph'
import TableComponent from '../Components/TableComponent'

const SuperadminDashboard = () => {
  const eventData = [
    {
      eventType: "Total Events",
      number: 250,
      icon: <MdOutlineEventAvailable />,
    },
    {
      eventType: "Completed Events",
      number: 180,
      icon: <IoCheckmarkDoneCircleOutline />,
    },
    {
      eventType: "Upcoming Events",
      number: 54,
      icon: <MdPendingActions />,
    },
    {
      eventType: "Cancelled Events",
      number: 2,
      icon: <MdOutlineCancel />,
    },
  ]

  return (
    <div className='flex w-full min-h-screen bg-[#f7fafc] overflow-x-hidden'>
      {/* sidebar */}
      {/* <aside className="fixed left-0 top-0 z-20 w-[78px] lg:w-[300px] h-screen bg-white border-r border-[#e6e6e6] transition-all duration-300">
        <SidebarSuperadmin/>
      </aside> */}

      {/* main content */}
      <main className="w-full">
        {/* Nav component */}
        <nav className="">
          <Navcomponent/>
        </nav>

        {/* dashboard content */}
        <div className="p-4 lg:p-8 w-full overflow-hidden">
          {/* dashboard-cards */}
          <div className="w-full flex gap-5 flex-wrap">
            {eventData.map((item, i) => (
              <Dashboardcards key={i} eventData={item}/>
            ))}
          </div>

          {/* graph-component */}
          <div className="mt-8 lg:mt-12">
            <Superadmingraph/>
          </div>

            {/* table-componenet */}
          <div className="table-component">
            <h1 className='text-xl lg:text-2xl font-semibold mb-6'>Events</h1>
            <TableComponent/>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SuperadminDashboard