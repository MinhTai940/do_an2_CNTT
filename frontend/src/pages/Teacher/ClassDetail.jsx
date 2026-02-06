import { useParams, useNavigate } from "react-router-dom";

export default function ClassDetail() {
  const { classCode } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h2>Chi tiết lớp: {classCode}</h2>

      <button
        onClick={() =>
          navigate(`/teacher/classes/${classCode}/create-exam`)
        }
      >
        Tạo đề thi
      </button>

      <h3>Danh sách đề thi</h3>
      <p>(Sẽ load từ backend)</p>
    </div>
  );
}
