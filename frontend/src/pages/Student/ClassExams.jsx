import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ClassExams() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get(`/exams/student/class/${classId}`)
      .then(res => setExams(res.data))
      .catch(() => alert("Không tải được đề thi"))
      .finally(() => setLoading(false));
  }, [classId]);

  return (
    <div>
      <h2>Danh sách đề thi</h2>

      {loading && <p>Đang tải...</p>}

      {!loading && exams.length === 0 && (
        <p>Chưa có đề thi</p>
      )}

      <ul>
        {exams.map(e => (
          <li key={e._id}>
            <b>{e.exam_name}</b> – {e.duration} phút
            <br />
            <button onClick={() => navigate(`/student/exams/${e._id}`)}>
              📝 Làm bài
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
