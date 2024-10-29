import React from 'react'
import './DashboardCard.css'
import { HiArrowUpRight } from "react-icons/hi2";

const Dashboardcards = ({eventData}) => {
  return (
    <div className='dashboard-card-main w-[15rem] h-[13rem] bg-white hover:bg-black  rounded-[1rem] p-4 shadow-sm flex flex-col justify-between'>

        {/* top-section */}
        <div className="top-section w-full h-[5rem] flex justify-between">

            {/* icon-section */}
            <div className="icon-section w-14 h-14 rounded-md bg-[#f7fafc] flex items-center justify-center text-[1.5rem]">
                {eventData.icon}
            </div>

            {/* arrow-section */}
            <div className="arrow-section w-14 h-14 rounded-full border-[2px] border-black flex items-center justify-center text-[1.5rem]">
                <HiArrowUpRight className='arrow' />
            </div>
        </div>



        {/* bottom-events */}
        <div className="bottom-events w-full flex flex-col items-start justify-end">
            <h1 className='text-[1rem]'>{eventData.eventType}</h1>
            <h1 className='text-[2rem] font-semibold'>{eventData.number}</h1>
        </div>
    </div>
  )
}

export default Dashboardcards