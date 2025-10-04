import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentList from "../pages/student/studentTable/StudentList";
import ClassPage from "../pages/manager";
import ClassDetail from "../pages/manager/ClassDetail";
import SubjectPage from "../pages/manager/SubjectManage/Index";
import ManagerLayout from "../pages/layouts/manager-layout";

function Home() {
  return (
    <div style={{ padding: 32 }}>
      <h2>Trang chủ</h2>
      <p>Chào mừng bạn đến với hệ thống quản lý sinh viên!</p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studentTable" element={<StudentList />} />
        <Route path="/manager/class" element={<ClassPage />} />
        <Route path="/manager/subject" element={<SubjectPage />} />
        <Route
          path="/manager/class/:classId"
          element={
            <ManagerLayout>
              <ClassDetail />
            </ManagerLayout>
          }
        />
        <Route path="/manager" element={<ManagerLayout />} />
      </Routes>
    </Router>
  );
}
