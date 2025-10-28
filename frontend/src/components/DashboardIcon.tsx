import { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import "../scss/DashboardIcon.scss";
import { useNavigate } from "react-router-dom";

function DashboardIcon() {
  const { userPictureURL, username, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const openDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const scheduleCloseDropdown = (delay = 200) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, delay) as unknown as number;
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSignOut = () => {
    logout();
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      {userPictureURL && username && (
        <div
          className="dashboard-icon-container"
          onMouseEnter={openDropdown}
          onMouseLeave={() => scheduleCloseDropdown()}
        >
          <div className="dashboard-icon-wrapper">
            <img
              src={userPictureURL}
              alt={username ? `${username}'s profile` : "User profile"}
              className="dashboard-icon-image"
            />
            <p>{username}</p>
          </div>

          {isOpen && (
            <div
              className="dashboard-dropdown"
              onMouseEnter={openDropdown}
              onMouseLeave={() => scheduleCloseDropdown()}
            >
              <button
                className="dropdown-item dashboard-item"
                onClick={handleDashboard}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Dashboard</span>
              </button>
              <button
                className="dropdown-item signout-item"
                onClick={handleSignOut}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardIcon;