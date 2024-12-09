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
  const [availableYears, setAvailableYears] = useState([]);

  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch available years
  const fetchAvailableYears = async () => {
    try {
      const response = await axiosInstance.get('/year-list-database/');

      
      if (response.data && response.data.data && response.data.data[0]) {
        // Extract years from the object and convert to array
        const yearsObj = response.data.data[0];
        const years = Object.values(yearsObj)
          .filter(year => !isNaN(year)) 
          .sort((a, b) => b - a); 
        setAvailableYears(years);
        
        // Set the most recent year as default
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } else {
        setError('Failed to load available years');
      }
    } catch (error) {
      setError('Failed to load available years');
    }
  };

  // Fetch data based on selected year
  const fetchEventsByYear = async (year) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/filter-events-by-year/${year}/`);

      if (!response.data) {
        throw new Error('No data received from API');
      }

      if (!response.data.data) {
        throw new Error('Invalid response structure - missing data property');
      }

      const monthlyData = response.data.data.monthly_event_counts;

      if (!monthlyData) {
        throw new Error('No monthly_event_counts in response');
      }

      const formattedData = Object.entries(monthlyData).map(([month, count], index) => ({
        name: month,
        events: count,
        id: `${month}-${year}-${index}`
      }));
      setChartData(formattedData);
    } catch (error) {
      setError(error.message);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load available years when component mounts
  useEffect(() => {
    fetchAvailableYears();
  }, []);

  // Load chart data when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchEventsByYear(selectedYear);
    }
  }, [selectedYear]);

  return (
    <div className="w-full h-[50vh] lg:h-[50vh] p-4 mt-6 md:mt-4 lg:mt-2">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Event Statistics</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || availableYears.length === 0}
        >
          {availableYears.length > 0 ? (
            availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          ) : (
            <option value="">No years available</option>
          )}
        </select>
      </div>
      
      {error && (
        <div className="mb-4 p-4 text-red-600">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
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
              key={`bar-${selectedYear}`}
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