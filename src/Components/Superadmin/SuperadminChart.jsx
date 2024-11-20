import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axiosInstance from '../../axiosConfig';

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate array of years (current year and 4 years back)
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data based on selected year
  const fetchEventsByYear = async (year) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching data for year:', year);
      const response = await axiosInstance.get(`/filter-events-by-year/${year}/`);
      console.log('API Response:', response);

      if (!response.data) {
        throw new Error('No data received from API');
      }

      if (!response.data.data) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response structure - missing data property');
      }

      const monthlyData = response.data.data.monthly_event_counts;
      console.log('Monthly data:', monthlyData);

      if (!monthlyData) {
        throw new Error('No monthly_event_counts in response');
      }

      const formattedData = Object.entries(monthlyData).map(([month, count]) => ({
        name: month,
        events: count
      }));

      console.log('Formatted chart data:', formattedData);
      setChartData(formattedData);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setError(error.message);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load chart data when year changes
  useEffect(() => {
    fetchEventsByYear(selectedYear);
  }, [selectedYear]);

  return (
    <div className="w-full h-[50vh] lg:h-[55vh] p-4 ">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Event Statistics</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      
      {error && (
        <div className="mb-4 p-4 text-red-600">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <p>Loading data...</p>
        </div>
      ) : chartData.length > 0 ? (
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
      ) : (
        <div className="h-80 flex items-center justify-center">
          <p>No data available for selected year</p>
        </div>
      )}
    </div>
  );
};

export default SuperadminChart;