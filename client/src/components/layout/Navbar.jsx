import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../../lib/auth';
import api from '../../lib/api';
import styles from './Navbar.module.css';

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
  
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };
  
  const handleNotifToggle = async () => {
    setIsNotifOpen(prev => !prev);
    if (!isNotifOpen) {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications");
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

  const handleNotificationClick = (notif) => {
      // Mark as read logic could go here
      if (notif.jobId) {
          navigate(`/jobs/${notif.jobId}`);
      }
      setIsNotifOpen(false);
  }

  const userInitials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <div className={styles.logo}>JT</div>
        <span className={styles.appName}>JobTrackr</span>
      </div>
      <nav className={styles.center}>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Board</NavLink>
        <NavLink to="/quiz" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Quiz</NavLink>
        <NavLink to="/ats" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>ATS Analyser</NavLink>
        <NavLink to="/roadmap" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Roadmap</NavLink>
      </nav>
      <div className={styles.right}>
        <div className={styles.notifWrapper} ref={notifRef}>
          <button onClick={handleNotifToggle} className={styles.iconButton}>
            🔔
            {unreadCount > 0 && <span className={styles.notifBadge}></span>}
          </button>
          {isNotifOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <strong>Notifications</strong>
                <button onClick={handleMarkAllRead} className={styles.markAllRead}>Mark all read</button>
              </div>
              <div className={styles.notifList}>
                {notifications.length > 0 ? notifications.map(notif => (
                  <div key={notif._id} className={`${styles.notifItem} ${notif.read ? styles.read : ''}`} onClick={() => handleNotificationClick(notif)}>
                    <div className={styles.notifDot}></div>
                    <div>
                      <p className={styles.notifMessage}>{notif.message}</p>
                      <span className={styles.notifTime}>{timeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                )) : (
                  <div className={styles.emptyNotifs}>No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.userMenuWrapper} ref={userMenuRef}>
            <button onClick={() => setIsUserMenuOpen(prev => !prev)} className={styles.avatar}>
                {userInitials}
            </button>
            {isUserMenuOpen && (
                <div className={styles.dropdown} style={{width: '180px'}}>
                    <button onClick={() => { navigate('/profile'); setIsUserMenuOpen(false); }} className={styles.dropdownItem}>Profile</button>
                    <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logout}`}>Logout</button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
