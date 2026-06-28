import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../../lib/auth';
import api from '../../lib/api';
import Skeleton from '../ui/Skeleton';

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
};

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileRef = useRef(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { data } = await api.get('/notifications/count');
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Failed to fetch notification count");
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(event.target) && !event.target.closest('[data-hamburger]')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };
  
  const handleNotifToggle = async () => {
    const willOpen = !isNotifOpen;
    setIsNotifOpen(willOpen);
    if (willOpen) {
      setNotifLoading(true);
      try {
        const { data } = await api.get('/notifications');
            setNotifications(data.notifications);
      } catch (error) {
        console.error("Failed to fetch notifications");
      } finally {
        setNotifLoading(false);
      }
    }
  };
  
  const handleMarkAllRead = async () => {
      try {
          await api.post('/notifications/mark-all-read');
          setUnreadCount(0);
          setNotifications(prev => prev.map(n => ({...n, read: true})));
      } catch (error) {
          console.error("Failed to mark all as read");
      }
  };

  const handleNotificationClick = async (notif) => {
      try {
        if (!notif.read) {
          await api.patch(`/notifications/${notif._id}/read`);
          setUnreadCount(prev => Math.max(0, prev - 1));
          setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
        }
      } catch (error) {
        console.error("Failed to mark notification as read");
      }
      if (notif.jobId) {
          navigate(`/board/jobs/${notif.jobId}`);
      }
      setIsNotifOpen(false);
  }

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-100 bg-bg-950/85 backdrop-blur-xl border-b border-border h-16 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button data-hamburger className="flex md:hidden flex-col gap-1 bg-transparent p-1 mr-3 cursor-pointer" onClick={() => setMobileMenuOpen(prev => !prev)}>
            <span className={`block w-5 h-0.5 bg-text-300 rounded transition duration-200 ease-out ${mobileMenuOpen ? 'rotate-45 translate-x-[4px] translate-y-[4px]' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-text-300 rounded transition duration-200 ease-out ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-text-300 rounded transition duration-200 ease-out ${mobileMenuOpen ? '-rotate-45 translate-x-[4px] -translate-y-[4px]' : ''}`}></span>
          </button>
          <div className="w-8 h-8 bg-accent-tint text-accent rounded flex items-center justify-center font-bold mr-2 shrink-0">JT</div>
          <span className="text-accent font-bold text-lg">JobTracker</span>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/board" end className={({ isActive }) => isActive ? 'text-accent bg-accent-tint text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline' : 'text-text-300 text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline hover:text-text-100 hover:bg-bg-700'}>Board</NavLink>
          <NavLink to="/board/quiz" className={({ isActive }) => isActive ? 'text-accent bg-accent-tint text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline' : 'text-text-300 text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline hover:text-text-100 hover:bg-bg-700'}>Quiz</NavLink>
          <NavLink to="/board/ats" className={({ isActive }) => isActive ? 'text-accent bg-accent-tint text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline' : 'text-text-300 text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline hover:text-text-100 hover:bg-bg-700'}>ATS Analyser</NavLink>
          <NavLink to="/board/roadmap" className={({ isActive }) => isActive ? 'text-accent bg-accent-tint text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline' : 'text-text-300 text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline hover:text-text-100 hover:bg-bg-700'}>Roadmap</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <div className="relative" ref={notifRef}>
            <button onClick={handleNotifToggle} className="bg-transparent text-text-300 text-xl p-1.5 rounded-full hover:bg-bg-700 hover:text-text-100 cursor-pointer">
              🔔
              {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-danger border-2 border-bg-800"></span>}
            </button>
            {isNotifOpen && (
              <div className="absolute top-[140%] bg-bg-800 border border-border rounded-lg shadow-lg z-50 overflow-hidden right-[-60px] md:right-0 w-[280px] md:w-80">
                <div className="flex justify-between items-center px-4 py-3 border-b border-border-subtle">
                  <strong className="font-semibold text-text-100">Notifications</strong>
                  <button onClick={handleMarkAllRead} className="bg-transparent text-accent text-xs font-medium cursor-pointer">Mark all read</button>
                </div>
                <div className="max-h-75 overflow-y-auto">
                  {notifLoading ? (
                    <div className="p-3 flex flex-col gap-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex gap-3 items-center">
                          <Skeleton width="8px" height="8px" borderRadius="50%" />
                          <div style={{flex: 1}}>
                            <Skeleton height="14px" width="80%" />
                            <Skeleton height="10px" width="30%" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif._id} className="px-4 py-3 border-b border-border-subtle flex gap-3 cursor-pointer hover:bg-bg-700 last:border-b-0" onClick={() => handleNotificationClick(notif)}>
                      <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${notif.read ? 'bg-bg-600' : 'bg-accent'}`}></div>
                      <div>
                        <p className={`text-xs leading-normal ${notif.read ? 'text-text-400' : 'text-text-200'}`}>{notif.message}</p>
                        <span className="text-[11px] text-text-400">{timeAgo(notif.createdAt)}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 px-5 text-text-400 text-sm">No new notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="w-9 h-9 rounded-full bg-accent-dark text-text-100 font-bold text-sm flex items-center justify-center cursor-pointer shrink-0">
                  {userInitials}
              </button>
              {isUserMenuOpen && (
                  <div className="absolute right-0 top-[140%] bg-bg-800 border border-border rounded-lg shadow-lg z-50 overflow-hidden" style={{width: '180px'}}>
                      <button onClick={() => { navigate('/board/profile'); setIsUserMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm bg-transparent text-text-200 border-none hover:bg-bg-700 hover:text-text-100 cursor-pointer">Profile</button>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm bg-transparent text-danger border-none hover:bg-bg-700 hover:text-text-100 cursor-pointer">Logout</button>
                  </div>
              )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && <div className="fixed inset-0 z-99 bg-black/50" onClick={() => setMobileMenuOpen(false)} />}
      <div ref={mobileRef} className={`fixed top-0 left-[-280px] w-[260px] h-full bg-bg-800 border-r border-border z-101 transition-all duration-300 flex flex-col px-4 py-6 ${mobileMenuOpen ? 'left-0' : ''}`}>
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-accent-tint text-accent rounded flex items-center justify-center font-bold mr-2 shrink-0">JT</div>
          <span className="text-accent font-bold text-lg">JobTracker</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          <NavLink to="/board" end onClick={closeMobile} className={({ isActive }) => isActive ? 'text-accent bg-accent-tint text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline' : 'text-text-300 text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline hover:text-text-100 hover:bg-bg-700'}>Board</NavLink>
          <NavLink to="/board/quiz" onClick={closeMobile} className={({ isActive }) => isActive ? 'text-accent bg-accent-tint text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline' : 'text-text-300 text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline hover:text-text-100 hover:bg-bg-700'}>Quiz</NavLink>
          <NavLink to="/board/ats" onClick={closeMobile} className={({ isActive }) => isActive ? 'text-accent bg-accent-tint text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline' : 'text-text-300 text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline hover:text-text-100 hover:bg-bg-700'}>ATS Analyser</NavLink>
          <NavLink to="/board/roadmap" onClick={closeMobile} className={({ isActive }) => isActive ? 'text-accent bg-accent-tint text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline' : 'text-text-300 text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline hover:text-text-100 hover:bg-bg-700'}>Roadmap</NavLink>
          <NavLink to="/board/profile" onClick={closeMobile} className={({ isActive }) => isActive ? 'text-accent bg-accent-tint text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline' : 'text-text-300 text-sm font-medium px-3 py-1.5 rounded transition duration-200 ease-out no-underline hover:text-text-100 hover:bg-bg-700'}>Profile</NavLink>
        </nav>
        <div className="pt-4 border-t border-border-subtle">
          <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm bg-transparent text-danger border-none rounded hover:bg-bg-700 cursor-pointer">Logout</button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
