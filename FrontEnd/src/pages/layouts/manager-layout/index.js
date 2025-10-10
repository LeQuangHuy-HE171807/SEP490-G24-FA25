import React from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "./manager-sidebar";

const layoutStyles = {
  minHeight: "calc(100vh - 56px)",
  display: "flex",
  backgroundColor: "#f5f5f5",
};

const sidebarStyles = {
  width: 220,
  borderRight: "1px solid #f0f0f0",
  background: "#fff",
  flexShrink: 0,
};

const mainStyles = {
  flex: 1,
  padding: "24px",
  background: "#fff",
  overflowY: "auto",
};

const ManagerLayout = ({ children }) => {
  const content = children ?? <Outlet />;

  return (
    <div style={layoutStyles}>
      <aside style={sidebarStyles}>
        <ManagerSidebar />
      </aside>
      <main style={mainStyles}>{content}</main>
    </div>
  );
};

export default ManagerLayout;
