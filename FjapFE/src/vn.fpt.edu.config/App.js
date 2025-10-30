﻿import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useLocation } from "react-router-dom";

import AuthProvider, { useAuth } from "../vn.fpt.edu.pages/login/AuthContext";
import LoginPage from "../vn.fpt.edu.pages/login/LoginPage";
import WeeklyTimetable from "../vn.fpt.edu.pages/student/weeklyTimeTable/WeeklyTimetable";
import StudentGradeReport from "../vn.fpt.edu.pages/student/MarkReport/StudentGradeReport";
import StudentHomepage from "../vn.fpt.edu.pages/student/StudentHomepage";
import AttendanceReportPage from "../vn.fpt.edu.pages/student/AttendanceReportPage";
import HomeworkPage from "../vn.fpt.edu.pages/student/HomeworkPage";
import ClassStudentsList from "../vn.fpt.edu.pages/student/classStudents/ClassStudentsList";
import ManagerLayout from "../vn.fpt.edu.pages/layouts/manager-layout";
import StaffAcademicLayout from "../vn.fpt.edu.pages/layouts/staffAcademic_layout";
import LecturerLayout from "../vn.fpt.edu.pages/layouts/lecturer-layout";
import ClassPage from "../vn.fpt.edu.pages/manager/ClassManage";
import ClassDetail from "../vn.fpt.edu.pages/manager/ClassManage/ClassDetail";
import ClassStudents from "../vn.fpt.edu.pages/manager/ClassManage/ClassStudents";
import ClassAddStudents from "../vn.fpt.edu.pages/manager/ClassManage/ClassAddStudents";
import SubjectPage from "../vn.fpt.edu.pages/manager/SubjectManage/Index";
import CreateSubject from "../vn.fpt.edu.pages/manager/SubjectManage/CreateSubject";
import EditSubject from "../vn.fpt.edu.pages/manager/SubjectManage/EditSubject";
import SubjectDetail from "../vn.fpt.edu.pages/manager/SubjectManage/SubjectDetail";
import GradeManage from "../vn.fpt.edu.pages/manager/GradeManage/Index";
import GradeDetails from "../vn.fpt.edu.pages/manager/GradeManage/GradeDetails";
import GradeEntry from "../vn.fpt.edu.pages/manager/GradeManage/GradeEntry";
import StaffMaterialList from "../vn.fpt.edu.pages/staff/materials/MaterialList";
import LecturerHomepage from "../vn.fpt.edu.pages/layouts/lecturer-layout/LecturerHomepage";
import HomeworkManage from "../vn.fpt.edu.pages/lecturer/HomeworkManage";
import Schedule from "../vn.fpt.edu.pages/lecturer/schedule/Schedule";
import StaffOfAdminPage from "../vn.fpt.edu.pages/admin/StaffOfAdminPage";
import Header from "../vn.fpt.edu.common/Header";
import Footer from "../vn.fpt.edu.common/footer";
import { NotificationProvider } from "../vn.fpt.edu.common/notifications";

function RequireAuth({ children }) {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireManager({ children }) {
  const { user } = useAuth();
  if (!user || Number(user.roleId) !== 2) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RequireStaffAcademic({ children }) {
  const { user } = useAuth();
  if (!user || ![2, 3, 6, 7].includes(Number(user.roleId))) {
    return <Navigate to="/" replace />;
  }
  return children;
}
/*
Hiện tại đang để 2 hàm này neverUsed vì chưa có phân quyền rõ ràng cho student và lecturer
Khi có phân quyền rõ ràng thì sẽ dùng 2 hàm này để bảo vệ route
chưa nghĩ ra việc có màn nào đặc biệt chỉ có student hay lecturer mới vào được hay không nên viết sẵn để đấy
Author: Huy
*/
function RequireStudent({ children }) {
  const { user } = useAuth();
  if (!user || Number(user.roleId) !== 4) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RequireLecturer({ children }) {
  const { user } = useAuth();
  if (!user || Number(user.roleId) !== 3) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleBasedRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const roleId = Number(user.roleId);
  if (roleId === 3) {
    return <Navigate to="/lecturer/dashboard" replace />;
  }
  if (roleId === 4) {
    return <StudentHomepage />;
  }

  // Default fallback
  return <StudentHomepage />;
}

function ProtectedLayout() {
  const location = useLocation();
  const hideHeader =
    location.pathname.startsWith("/staffAcademic") ||
    location.pathname.startsWith("/lecturer");

  return (
    <RequireAuth>
      {!hideHeader && <Header />}
      <Outlet />
      <Footer />
    </RequireAuth>
  );
}

function Home() {
  return <RoleBasedRedirect />;
}

export default function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/staffOfAdmin" element={<StaffOfAdminPage />} />

              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/student/grades" element={<StudentGradeReport />} />
                <Route path="/student/attendance" element={<AttendanceReportPage />} />
                <Route path="/student/homework" element={<HomeworkPage />} />
                <Route path="/student/class/:classId/students" element={<ClassStudentsList />} />
                <Route path="/weeklyTimetable" element={<WeeklyTimetable />} />

                <Route
                  path="/manager/*"
                  element={
                    <RequireManager>
                      <ManagerLayout />
                    </RequireManager>
                  }
                >
                  <Route index element={<ClassPage />} />
                  <Route path="class" element={<ClassPage />} />
                  <Route path="class/:classId" element={<ClassDetail />} />
                  <Route path="class/:classId/students" element={<ClassStudents />} />
                  <Route path="class/:classId/add-students" element={<ClassAddStudents />} />
                  <Route path="subject" element={<SubjectPage />} />
                  <Route path="subject/create" element={<CreateSubject />} />
                  <Route path="subject/edit/:subjectId" element={<EditSubject />} />
                  <Route path="subject/detail/:subjectId" element={<SubjectDetail />} />

                </Route>

                <Route
                  path="/staffAcademic/*"
                  element={
                    <RequireStaffAcademic>
                      <StaffAcademicLayout />
                    </RequireStaffAcademic>
                  }
                >
                  <Route
                    path="dashboard"
                    element={<div style={{ padding: 16 }}><h3>Staff Academic Dashboard (placeholder)</h3></div>}
                  />
                  <Route
                    path="classes"
                    element={<div style={{ padding: 16 }}><h3>Classes (placeholder)</h3></div>}
                  />
                  <Route
                    path="subjects"
                    element={<div style={{ padding: 16 }}><h3>Subjects (placeholder)</h3></div>}
                  />
                  <Route path="materials" element={<StaffMaterialList />} />
                </Route>

                <Route
                  path="/lecturer/*"
                  element={
                    <RequireStaffAcademic>
                      <LecturerLayout />
                    </RequireStaffAcademic>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<LecturerHomepage />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route
                    path="classes"
                    element={<div style={{ padding: 16 }}><h3>Lecturer Classes (coming soon)</h3></div>}
                  />
                  <Route
                    path="subjects"
                    element={<div style={{ padding: 16 }}><h3>Lecturer Subjects (coming soon)</h3></div>}
                  />
                  <Route
                    path="homework"
                    element={<HomeworkManage />}
                  />
                  <Route path="grades" element={<GradeManage />} />
                  <Route path="grades/:courseId" element={<GradeDetails />} />
                  <Route path="grades/enter/:courseId" element={<GradeEntry />} />
                  <Route path="class/:classId/students" element={<ClassStudentsList />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
