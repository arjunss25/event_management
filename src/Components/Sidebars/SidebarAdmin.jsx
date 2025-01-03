import React, { useState, useEffect } from 'react';
import { LuLayoutDashboard } from 'react-icons/lu';
import { MdGroups3, MdOutlineFestival } from 'react-icons/md';
import { IoTimerOutline } from 'react-icons/io5';
import { AiOutlineLogout, AiOutlineClose } from 'react-icons/ai';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logout } from '../../Redux/authSlice';
import axiosInstance from '../../axiosConfig';
import { IoIosPeople } from 'react-icons/io';
import { eventBus } from '../Admin/AdminNavcomponent';

const SidebarAdmin = ({ isSidebarOpen, toggleSidebar }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(false);
  const [logoImage, setLogoImage] = useState('/profile-avatar.png');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchEventLogo = async () => {
      try {
        const response = await axiosInstance.get('/update-event-dp/');
        if (response.data.data && response.data.data.image) {
          const imageUrl = response.data.data.image.startsWith('http')
            ? response.data.data.image
            : `https://event.neurocode.in${response.data.data.image}`;
          setLogoImage(imageUrl);
        }
      } catch (error) {}
    };

    fetchEventLogo();
  }, [refreshKey]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe(() => {
      setRefreshKey((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  const isActive = (path) => location.pathname === `/admin${path}`;

  const getLinkClass = (path) =>
    `sidebar-link flex items-center gap-4 hover:text-black ${
      isActive(path) ? 'text-black' : 'text-[#636e72]'
    }`;

  const toggleEmployees = () => {
    setIsEmployeesOpen(!isEmployeesOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <div
        className={`fixed left-0 top-0 z-[10] w-full sm:w-[300px] lg:w-[300px] h-screen bg-white border-r border-[#e6e6e6] transition-transform duration-300 
          ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="w-full relative">
          <div
            className="absolute top-4 right-4 lg:hidden cursor-pointer"
            onClick={toggleSidebar}
          >
            <AiOutlineClose className="text-2xl text-gray-600 hover:text-black" />
          </div>

          {/* Logo section */}
          <div className="logo-section w-full mt-10 h-[150px] flex items-center justify-center">
            <div className="w-[80px] h-[80px] rounded-full overflow-hidden ">
              <img
                key={refreshKey}
                className="w-full h-full object-cover"
                src={logoImage}
                alt="Logo"
                onError={(e) => {
                  e.target.src = '/profile-avatar.png';
                }}
              />
            </div>
          </div>

          {/* Sidebar links */}
          <div className="sidebar-links flex justify-center lg:justify-start lg:ml-10 text-[1.2rem]">
            <ul className="flex flex-col gap-6">
              <li>
                <Link
                  to="/admin/dashboard"
                  className={getLinkClass('/dashboard')}
                  onClick={toggleSidebar}
                >
                  <LuLayoutDashboard className="icon-size" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/events"
                  className={getLinkClass('/events')}
                  onClick={toggleSidebar}
                >
                  <MdOutlineFestival className="icon-size" />
                  <span>Events</span>
                </Link>
              </li>
              <li className="flex flex-col">
                <button
                  onClick={toggleEmployees}
                  className={`sidebar-link flex items-center justify-between gap-4 hover:text-black text-[#636e72] w-full`}
                >
                  <div className="flex items-center gap-4">
                    <IoIosPeople className="icon-size" />
                    <span>Employees</span>
                  </div>
                  {isEmployeesOpen ? (
                    <FiChevronUp className="text-xl" />
                  ) : (
                    <FiChevronDown className="text-xl" />
                  )}
                </button>
                {isEmployeesOpen && (
                  <ul className="ml-8 mt-2 flex flex-col gap-2">
                    <li>
                      <Link
                        to="/admin/employee-details"
                        className={`flex items-center gap-4 ${getLinkClass(
                          '/employee-details'
                        )}`}
                        onClick={toggleSidebar}
                      >
                        <span className="text-base ml-4 ">Employee Details</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/add-category"
                        className={`flex items-center gap-4 ${getLinkClass(
                          '/add-category'
                        )}`}
                        onClick={toggleSidebar}
                      >
                        <span className="text-base ml-4">Add Field</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="sidebar-link flex items-center gap-4 hover:text-black text-[#636e72]"
                >
                  <AiOutlineLogout className="icon-size" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-[9] lg:hidden"
        ></div>
      )}
    </>
  );
};

export default SidebarAdmin;
