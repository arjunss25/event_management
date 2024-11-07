import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Fetch events data from the JSON file
const fetchEvents = async () => {
  try {
    const response = await axios.get('src/utils/chartData.json');
    console.log('Fetched data:', response.data); // Log to check the structure of the data
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Custom tooltip for chart display
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-lg rounded-lg">
        <p className="text-sm text-gray-600">{`${payload[0].payload.name}`}</p>
        <p className="text-sm font-medium">{`Events: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const SuperadminChart = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [chartData, setChartData] = useState([]);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load chart data from JSON file
  useEffect(() => {
    const loadChartData = async () => {
      try {
        const data = await fetchEvents();

        // If data is an array, format it for the chart, otherwise set it as an empty array
        const formattedData = Array.isArray(data)
          ? data.map(item => ({
              name: item.month,
              events: item.events,
            }))
          : [];
          
        setChartData(formattedData);
      } catch (error) {
        console.error('Error loading chart data:', error);
      }
    };

    loadChartData();
  }, []);

  return (
    <div className="w-full h-[50vh] lg:h-[50vh] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 16,
            right: isMobile ? 5 : 16,
            left: isMobile ? 5 : 30,
            bottom: 0,
          }}
        >
          <XAxis
            dataKey="name"
            tick={!isMobile}
            tickLine={false}
            axisLine={false}
            stroke="#666"
            fontSize={12}
          />
          <YAxis
            width={40}
            tickLine={false}
            axisLine={false}
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <CartesianGrid
            strokeDasharray=""
            vertical={false}
            horizontal={true}
            stroke="#b2bec3"
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'transparent' }}
          />
          <Bar
            dataKey="events"
            fill="#2D3436"
            radius={[4, 4, 0, 0]}
            cursor={{ fill: 'rgba(45, 52, 54, 0.05)' }}
            background={{ fill: '#eaeef1' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SuperadminChart;
