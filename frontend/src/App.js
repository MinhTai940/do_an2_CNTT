import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Student pages
import JoinClass from "./pages/Student/JoinClass";
import MyClasses from "./pages/Student/MyClasses";
import ClassExams from "./pages/Student/ClassExams";
import DoExam from "./pages/Student/DoExam";
import StudentClasses from "./pages/Student/StudentClasses";
import StudentLayout from "./components/StudentLayout";
import StudentDashboard from "./pages/Student/StudentDashboard";
import ExamResult from "./pages/Student/ExamResult";


// Teacher pages
import CreateClass from "./pages/Teacher/CreateClass";
import MyTeacherClasses from "./pages/Teacher/MyClasses";
import ClassDetail from "./pages/Teacher/ClassDetail";
import CreateExam from "./pages/Teacher/CreateExam";
import ExamQuestions from "./pages/Teacher/ExamQuestions";
import AddQuestion from "./pages/Teacher/AddQuestion";
import ExamDetail from "./pages/Teacher/ExamDetail";
import CreateQuestion from "./pages/Teacher/CreateQuestion";
import TeacherLayout from "./components/TeacherLayout";
import TeacherDashboard from "./pages/Teacher/Dashboard";
import ExamReport from "./pages/Teacher/ExamReport";






function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Student */}
        <Route
          path="/student/join"
          element={
            <ProtectedRoute role="student">
              <JoinClass />
            </ProtectedRoute>
          }
        />

        <Route
         path="/student/classes"
         element={
         <ProtectedRoute role="student">
        <MyClasses />
       </ProtectedRoute>
        }
        />

        <Route
        path="/student/classes/:classId"
      element={
      <ProtectedRoute role="student">
      <ClassExams />
      </ProtectedRoute>
        }
      />

        <Route
        path="/student/exams/:examId"
        element={
        <ProtectedRoute role="student">
        <DoExam />
        </ProtectedRoute>
        }
        />
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
  <Route path="join" element={<JoinClass />} />
  <Route path="classes/:classId/exams" element={<ClassExams />} />
  <Route path="exams/:examId" element={<DoExam />} />
</Route>

        {/* Teacher */}
        <Route
          path="/teacher/create-class"
          element={
            <ProtectedRoute role="teacher">
              <CreateClass />
            </ProtectedRoute>
          }
        />
        <Route
         path="/teacher/classes"
        element={
         <ProtectedRoute role="teacher">
        <MyTeacherClasses />
       </ProtectedRoute>
         }
        />
        <Route
         path="/teacher/classes/:classId"
        element={
        <ProtectedRoute role="teacher">
        <ClassDetail />
      </ProtectedRoute>
      }
      />
      <Route
      path="/teacher/create-exam/:classId"
       element={
      <ProtectedRoute role="teacher">
      <CreateExam />
      </ProtectedRoute>
      }
      />
      <Route
      path="/teacher/exams/:examId/questions"
      element={
      <ProtectedRoute role="teacher">
      <ExamQuestions />
      </ProtectedRoute>
      }
      />
      <Route
      path="/teacher/exams/:examId/questions/add"
      element={
      <ProtectedRoute role="teacher">
      <AddQuestion />
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
