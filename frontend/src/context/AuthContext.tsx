import React, { createContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, username?: string, userPictureURL?: string, userId?: string) => void;
  logout: () => void;
  username: string | null;
  userPictureURL: string | null;
  userId: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userPictureURL, setUserPictureURL] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("username");
    const p = localStorage.getItem("userPictureURL");
    if (t) setToken(t);
    if (u) setUsername(u);
    if (p) setUserPictureURL(p);
  }, []);

  const login = (
    t: string,
    usernameArg?: string,
    userPictureURLArg?: string,
    userId?: string
  ) => {
    localStorage.setItem("token", t);
    setToken(t);

    if (usernameArg) {
      localStorage.setItem("username", usernameArg);
      setUsername(usernameArg);
    }

    if (userPictureURLArg) {
      localStorage.setItem("userPictureURL", userPictureURLArg);
      setUserPictureURL(userPictureURLArg);
    }

    if (userId) {
      localStorage.setItem("userId", userId);
      setUserId(userId);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userPictureURL");
    setToken(null);
    setUsername(null);
    setUserPictureURL(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoggedIn: !!token,
        login,
        logout,
        username,
        userPictureURL,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
