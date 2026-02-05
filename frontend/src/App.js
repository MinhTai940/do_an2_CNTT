import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

// Student pages
import JoinClass from "./pages/Student/JoinClass";
import MyClasses from "./pages/Student/MyClasses";

// Teacher pages
import CreateClass from "./pages/Teacher/CreateClass";
import MyTeacherClasses from "./pages/Teacher/MyClasses";


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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
