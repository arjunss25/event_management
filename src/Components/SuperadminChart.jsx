
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

const allData = [
  { name: 'Jan', events: 4000 },
  { name: 'Feb', events: 3000 },
  { name: 'Mar', events: 2000 },
  { name: 'Apr', events: 2780 },
  { name: 'May', events: 1890 },
  { name: 'Jun', events: 2390 },
  { name: 'Jul', events: 3490 },
  { name: 'Aug', events: 2000 },
  { name: 'Sep', events: 2780 },
  { name: 'Oct', events: 1890 },
  { name: 'Nov', events: 2390 },
  { name: 'Dec', events: 3490 },
];

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
  const [chartData, setChartData] = useState(allData);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);
      setChartData(allData);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
            onMouseEnter={(data, index) => {}}
            cursor={{ fill: 'rgba(45, 52, 54, 0.05)' }}
            background={{ fill: '#eaeef1' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SuperadminChart;