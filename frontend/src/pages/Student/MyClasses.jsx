import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("/classes/student/me")
      .then(res => setClasses(res.data))
      .catch(() => alert("Không tải được lớp"));
  }, []);

  return (
    <div>
      <h2>Lớp của tôi</h2>

      {classes.length === 0 && <p>Chưa tham gia lớp nào</p>}

      <ul>
        {classes.map(c => (
          <li key={c._id}>
            <b>{c.class_name}</b>
            <br />
            <button
            onClick={() => navigate(`/student/classes/${c._id}/exams`)}
            >
            Xem đề thi
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
