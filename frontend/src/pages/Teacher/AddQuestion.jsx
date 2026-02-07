import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function AddQuestion() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [level, setLevel] = useState("medium");

  const handleSubmit = async () => {
    if (!content || options.some(o => !o)) {
      alert("Nhập đầy đủ câu hỏi và đáp án");
      return;
    }

    await axiosClient.post("/questions/create", {
      exam_id: examId,
      content,
      options,
      correct_answer: correct,
      level
    });

    alert("Thêm câu hỏi thành công");
    navigate(`/teacher/exams/${examId}/questions`);
  };

  return (
    <div>
      <h2>Thêm câu hỏi</h2>

      <textarea
        placeholder="Nội dung câu hỏi"
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      {options.map((opt, i) => (
        <div key={i}>
          <input
            placeholder={`Đáp án ${i + 1}`}
            value={opt}
            onChange={e => {
              const newOpts = [...options];
              newOpts[i] = e.target.value;
              setOptions(newOpts);
            }}
          />
          <input
            type="radio"
            checked={correct === i}
            onChange={() => setCorrect(i)}
          /> Đúng
        </div>
      ))}

      <select value={level} onChange={e => setLevel(e.target.value)}>
        <option value="easy">Dễ</option>
        <option value="medium">Trung bình</option>
        <option value="hard">Khó</option>
      </select>

      <br />
      <button onClick={handleSubmit}>Lưu câu hỏi</button>
    </div>
  );
}
