import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import LecturerHeader from './lecturer-header';

const layoutStyles = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#f5f5f5",
};

const mainStyles = {
  flex: 1,
  overflowY: "auto",
};

const LecturerLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/lecturer/dashboard' || location.pathname === '/lecturer';
  
  return (
    <div style={layoutStyles}>
      <LecturerHeader />
      <main style={mainStyles}>
        <Outlet />
      </main>
    </div>
  );
};

export default LecturerLayout;