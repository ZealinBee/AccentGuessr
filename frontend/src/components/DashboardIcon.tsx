import { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import "../scss/DashboardIcon.scss";
import { LayoutDashboard, Mic, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function DashboardIcon() {
  const { userPictureURL, username, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

  const openDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const scheduleCloseDropdown = (delay = 350) => {
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
              <Link
                href="/dashboard"
                className="dropdown-item dashboard-item"
              >
                <LayoutDashboard className="dropdown-icon" size={20} />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/my-voice"
                className="dropdown-item myvoice-item"
              >
                <Mic className="dropdown-icon" size={20} />
                <span>My Voice</span>
              </Link>
              <button
                className="dropdown-item signout-item"
                onClick={handleSignOut}
              >
                <LogOut className="dropdown-icon" size={20} />
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