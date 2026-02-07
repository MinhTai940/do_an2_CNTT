import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ExamQuestions() {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);

  const loadQuestions = async () => {
    const res = await axiosClient.get(`/questions/exam/${examId}`);
    setQuestions(res.data);
  };

  useEffect(() => {
    loadQuestions();
  }, [examId]);

  return (
    <div>
      <h2>Câu hỏi của đề thi</h2>

      <a href={`/teacher/exams/${examId}/questions/add`}>
        ➕ Thêm câu hỏi
      </a>

      <ul>
        {questions.map((q, i) => (
          <li key={i}>
            <b>{q.content}</b> ({q.level})
            <ul>
              {q.options.map((opt, idx) => (
                <li key={idx}>
                  {opt} {idx === q.correct_answer && "✅"}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
