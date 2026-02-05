import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { role, logout } = useContext(AuthContext);

  return (
    <nav>
      {role === "student" && (
        <>
          <Link to="/student/join">Join lớp</Link> |{" "}
          <Link to="/student/classes">Lớp của tôi</Link>
        </>
      )}

      {role === "teacher" && (
        <>
          <Link to="/teacher/create-class">Tạo lớp</Link> |{" "}
          <Link to="/teacher/classes">Lớp của tôi</Link>
        </>
      )}

      <button onClick={logout}>Logout</button>
    </nav>
  );
}
