import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../../lib/auth';
import api from '../../lib/api';
import Skeleton from '../ui/Skeleton';
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
      if (mobileRef.current && !mobileRef.current.contains(event.target) && !event.target.closest(`.${styles.hamburger}`)) {
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
          navigate(`/jobs/${notif.jobId}`);
      }
      setIsNotifOpen(false);
  }

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.left}>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(prev => !prev)}>
            <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.open : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.open : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.open : ''}`}></span>
          </button>
          <div className={styles.logo}>JT</div>
          <span className={styles.appName}>JobTrackr</span>
        </div>
        <nav className={styles.center}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Board</NavLink>
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
              <div className={`${styles.dropdown} ${styles.dropdownVisible}`}>
                <div className={styles.dropdownHeader}>
                  <strong>Notifications</strong>
                  <button onClick={handleMarkAllRead} className={styles.markAllRead}>Mark all read</button>
                </div>
                <div className={styles.notifList}>
                  {notifLoading ? (
                    <div className={styles.notifSkeletonList}>
                      {[1,2,3].map(i => (
                        <div key={i} className={styles.notifSkeletonItem}>
                          <Skeleton width="8px" height="8px" borderRadius="50%" />
                          <div style={{flex: 1}}>
                            <Skeleton height="14px" width="80%" />
                            <Skeleton height="10px" width="30%" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length > 0 ? notifications.map(notif => (
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
                  <div className={`${styles.dropdown} ${styles.dropdownVisible}`} style={{width: '180px'}}>
                      <button onClick={() => { navigate('/profile'); setIsUserMenuOpen(false); }} className={styles.dropdownItem}>Profile</button>
                      <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logout}`}>Logout</button>
                  </div>
              )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && <div className={styles.drawerOverlay} onClick={() => setMobileMenuOpen(false)} />}
      <div ref={mobileRef} className={`${styles.drawer} ${mobileMenuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.logo}>JT</div>
          <span className={styles.appName}>JobTrackr</span>
        </div>
        <nav className={styles.drawerNav}>
          <NavLink to="/" end onClick={closeMobile} className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Board</NavLink>
          <NavLink to="/quiz" onClick={closeMobile} className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Quiz</NavLink>
          <NavLink to="/ats" onClick={closeMobile} className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>ATS Analyser</NavLink>
          <NavLink to="/roadmap" onClick={closeMobile} className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Roadmap</NavLink>
          <NavLink to="/profile" onClick={closeMobile} className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>Profile</NavLink>
        </nav>
        <div className={styles.drawerFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
