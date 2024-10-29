import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './Redux/Store';

import SuperadminDashboard from './Dashboards/SuperadminDashboard';
import SidebarSuperadmin from './Components/SidebarSuperadmin';
import EventgroupsSuperadmin from './pages/EventgroupsSuperadmin';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex">
          {/* Sidebar */}
          <div className="fixed left-0 top-0 z-20 w-[78px] lg:w-[300px] h-screen bg-white border-r border-[#e6e6e6] transition-all duration-300">
            <SidebarSuperadmin />
          </div>

          {/* Main content area */}
          <div className="w-full transition-all duration-300 ml-[78px] lg:ml-[300px]">
            <Routes>
              <Route path="/" element={<SuperadminDashboard />} />
              <Route path="/event-groups" element={<EventgroupsSuperadmin />} />
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
