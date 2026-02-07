import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function CreateQuestion() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);

  const handleCreate = async () => {
    try {
      await axiosClient.post("/questions/create", {
        exam_id: examId,
        content,
        options,
        correct_answer: options[correct]
      });

      alert("Tạo câu hỏi thành công");
      navigate(-1); // quay lại trang đề thi
    } catch {
      alert("Tạo câu hỏi thất bại");
    }
  };

  return (
    <div>
      <h2>Tạo câu hỏi</h2>

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

      <button onClick={handleCreate}>Lưu câu hỏi</button>
    </div>
  );
}
