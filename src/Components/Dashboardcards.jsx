import React from 'react';
import './DashboardCard.css';
import { HiArrowUpRight } from 'react-icons/hi2';
import PropTypes from 'prop-types';

const Dashboardcards = ({ eventData }) => {
  const { icon, eventType, number } = eventData;

  console.log(`Rendering card for ${eventType} with count:`, number);

  return (
    <div className="dashboard-card-main w-[15rem] h-[13rem] bg-white hover:bg-black rounded-[1rem] p-4 shadow-sm flex flex-col justify-between">
      <div className="top-section w-full h-[5rem] flex justify-between">
        <div className="icon-section w-14 h-14 rounded-md bg-[#f7fafc] flex items-center justify-center text-[1.5rem]">
          {icon}
        </div>
        <div className="arrow-section">
          <HiArrowUpRight className="text-[1.5rem]" />
        </div>
      </div>
      <div className="bottom-section">
        <p className="text-[1rem] text-gray-500">{eventType}</p>
        <h1 className="text-[2rem] font-semibold">{number}</h1>
      </div>
    </div>
  );
};

Dashboardcards.propTypes = {
  eventData: PropTypes.shape({
    icon: PropTypes.element.isRequired,
    eventType: PropTypes.string.isRequired,
    number: PropTypes.number.isRequired,
  }).isRequired,
};

export default Dashboardcards;
