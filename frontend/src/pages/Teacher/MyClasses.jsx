import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("/classes/teacher/me")
      .then(res => setClasses(res.data))
      .catch(() => alert("Không tải được lớp"));
  }, []);

  return (
    <div>
      <h2>Lớp tôi phụ trách</h2>

      {classes.length === 0 && <p>Chưa tạo lớp nào</p>}

      <ul>
        {classes.map((c, i) => (
          <li
            key={i}
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/teacher/classes/${c.class_code}`)}
          >
            <b>{c.class_name}</b> – {c.subject}
          </li>
        ))}
      </ul>
    </div>
  );
}
