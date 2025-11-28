import { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import "../scss/DashboardIcon.scss";
import { LayoutDashboard, Mic, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

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
    router.push("/dashboard");
  };

  const handleMyVoice = () => {
    router.push("/my-voice");
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
                <LayoutDashboard className="dropdown-icon" size={20} />
                <span>Dashboard</span>
              </button>
              <button
                className="dropdown-item myvoice-item"
                onClick={handleMyVoice}
              >
                <Mic className="dropdown-icon" size={20} />
                <span>My Voice</span>
              </button>
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