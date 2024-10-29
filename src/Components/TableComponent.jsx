import React from 'react';

const EventsTable = ({ columns, data }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Up Coming':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm';
      case 'Cancel':
        return 'bg-red-500 text-white px-2 py-1 rounded-md text-sm';
      case 'Completed':
        return 'text-emerald-500 font-medium';
      case 'Pending':
        return 'text-red-400 font-medium';
      default:
        return '';
    }
  };

  const renderCell = (row, columnKey) => {
    const value = row[columnKey.toLowerCase().replace(/\s+/g, '')];
    if (columnKey.includes('Status')) {
      return (
        <span className={getStatusStyle(value)}>
          {value}
        </span>
      );
    }
    return value;
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-black uppercase bg-gray-500 rounded-lg">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                scope="col" 
                className={`px-6 py-3 font-medium ${index === 0 ? 'rounded-l-lg' : ''} ${index === columns.length - 1 ? 'rounded-r-lg' : ''}`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`} className="px-6 py-4">
                  {renderCell(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const ExampleTable = () => {

  const columns = [
    "Event",
    "Event Group",
    "Event Date",
    "Event Duration",
    "Event Status",
    "Payment Status",
    "Location",          
    "Participants",       

  ];

  const sampleData = [
    {
      event: "Convocation",
      eventgroup: "Royal Events",
      eventdate: "25-02-2024",
      eventduration: "10 days",
      eventstatus: "Up Coming",
      paymentstatus: "Completed",
      location: "Main Hall",
      participants: "500",
    },
    {
      event: "Convocation",
      eventgroup: "Royal Events",
      eventdate: "25-02-2024",
      eventduration: "10 days",
      eventstatus: "Up Coming",
      paymentstatus: "Completed",
      location: "Main Hall",
      participants: "500",
    },
    {
      event: "Convocation",
      eventgroup: "Royal Events",
      eventdate: "25-02-2024",
      eventduration: "10 days",
      eventstatus: "Up Coming",
      paymentstatus: "Completed",
      location: "Main Hall",
      participants: "500",
    },
    {
      event: "Convocation",
      eventgroup: "Royal Events",
      eventdate: "25-02-2024",
      eventduration: "10 days",
      eventstatus: "Up Coming",
      paymentstatus: "Completed",
      location: "Main Hall",
      participants: "500",
    },
  ];

  return <EventsTable columns={columns} data={sampleData} />;
};

export default ExampleTable;