import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Auth/Register";
// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TeacherManagement from "./pages/Admin/TeacherManagement";
import AdminLayout from "./components/AdminLayout";
import UserManagement from "./pages/Admin/UserManagement";
import AdminClassManagement from "./pages/Admin/AdminClassManagement";
import AdminClassDetail from "./pages/Admin/AdminClassDetail";





// Student pages
//import JoinClass from "./pages/Student/JoinClass";
import MyClasses from "./pages/Student/MyClasses";
import ClassExams from "./pages/Student/ClassExams";
import DoExam from "./pages/Student/DoExam";
//import StudentClasses from "./pages/Student/StudentClasses";
import StudentLayout from "./components/StudentLayout";
import StudentDashboard from "./pages/Student/StudentDashboard";
//import ExamResult from "./pages/Student/ExamResult";
import StudentResults from "./pages/Student/StudentResults";
import StudentProfile from "./pages/Student/StudentProfile";
import StudentExamReview from "./pages/Student/StudentExamReview";





// Teacher pages
import CreateClass from "./pages/Teacher/CreateClass";
import MyTeacherClasses from "./pages/Teacher/MyClasses";
import ClassDetail from "./pages/Teacher/ClassDetail";
import CreateExam from "./pages/Teacher/CreateExam";
// import ExamQuestions from "./pages/Teacher/ExamQuestions";
// import AddQuestion from "./pages/Teacher/AddQuestion";
import ExamDetail from "./pages/Teacher/ExamDetail";
import CreateQuestion from "./pages/Teacher/CreateQuestion";
import TeacherLayout from "./components/TeacherLayout";
import TeacherDashboard from "./pages/Teacher/Dashboard";
import ExamReport from "./pages/Teacher/ExamReport";
// import CheatReport from "./pages/Teacher/CheatReport";
import Reports from "./pages/Teacher/Reports";
import ExamsByClass from "./pages/Teacher/ExamsByClass";
import TeacherProfile from "./pages/Teacher/TeacherProfile";
import Students from "./pages/Teacher/Students";










function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />   {/* 👈 BẮT BUỘC */}
        <Route path="/register" element={<Register />} />

        {/* ================= STUDENT ================= */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="classes" element={<MyClasses />} />
          <Route path="classes/:classId/exams" element={<ClassExams />} />
          {/* <Route path="join" element={<JoinClass />} /> */}
          {/* <Route path="exams/:examId" element={<DoExam />} /> */}
          <Route path="results" element={<StudentResults />} />
          <Route path="results/:examId" element={<StudentExamReview />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
        <Route
          path="/student/exams/:examId"
          element={
            <ProtectedRoute role="student">
              <DoExam />
            </ProtectedRoute>
          }
        />


        {/* ================= TEACHER ================= */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<MyTeacherClasses />} />
          <Route path="create-class" element={<CreateClass />} />
          <Route path="profile" element={<TeacherProfile />} />

          <Route path="classes/:classId" element={<ClassDetail />} />
          <Route path="classes/:classId/exams" element={<ExamsByClass />} />
          <Route path="create-exam/:classId" element={<CreateExam />} />

          <Route path="exams/:examId" element={<ExamDetail />} />
          <Route path="exams/:examId/create-question" element={<CreateQuestion />} />
          <Route path="reports/:examId" element={<Reports />} />
          <Route path="/teacher/students" element={<Students />} />
        </Route>

        {/*admin*/}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="classes" element={<AdminClassManagement />} />
          {/* 👇 ROUTE CHI TIẾT LỚP */}
          <Route path="classes/:classId" element={<AdminClassDetail />} />
        </Route>
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute role="admin">
              <TeacherManagement />
            </ProtectedRoute>
          }
        />
        {/*tạo câu hỏi*/}
        <Route
          path="/teacher/exams/:examId"
          element={
            <ProtectedRoute role="teacher">
              <ExamDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/exams/:examId/create-question"
          element={
            <ProtectedRoute role="teacher">
              <CreateQuestion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<MyTeacherClasses />} />
          <Route path="create-class" element={<CreateClass />} />
          <Route path="classes/:classId" element={<ClassDetail />} />
          <Route path="create-exam/:classId" element={<CreateExam />} />
          <Route path="exams/:examId" element={<ExamDetail />} />
          <Route path="exams/:examId/create-question" element={<CreateQuestion />} />
        </Route>
        <Route
          path="/teacher/reports/exam/:examId"
          element={
            <ProtectedRoute role="teacher">
              <ExamReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
