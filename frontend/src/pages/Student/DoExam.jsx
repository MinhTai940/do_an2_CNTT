import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function DoExam() {
  const { examId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null); // ✅ null ban đầu
  const [submitted, setSubmitted] = useState(false);
  const [loadedTime, setLoadedTime] = useState(false); // ✅ cờ quan trọng

  // 🔹 Load câu hỏi
  useEffect(() => {
    axiosClient
      .get(`/questions/exam/${examId}`)
      .then(res => setQuestions(res.data))
      .catch(() => alert("Không tải được câu hỏi"));
  }, [examId]);

  // 🔹 Load thời gian làm bài
  useEffect(() => {
    axiosClient
      .get(`/exams/student/${examId}`)
      .then(res => {
        setTimeLeft(res.data.duration * 60); // phút → giây
        setLoadedTime(true); // ✅ đánh dấu đã load xong
      })
      .catch(() => alert("Không tải được thời gian bài thi"));
  }, [examId]);

  // 🔹 Đồng hồ đếm ngược
  useEffect(() => {
    // 🚫 CHƯA LOAD XONG → KHÔNG LÀM GÌ
    if (!loadedTime || submitted) return;

    // ⏰ HẾT GIỜ → AUTO SUBMIT
    if (timeLeft <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, loadedTime]);

  const chooseAnswer = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const submitExam = async () => {
    if (submitted) return; // 🚫 chống submit 2 lần

    try {
      setSubmitted(true);
      await axiosClient.post("/results/submit", {
      exam_id: examId,
      answers});
      alert("✅ Nộp bài thành công");
    } catch (err) {
      console.error(err);
      alert("❌ Nộp bài thất bại");
      setSubmitted(false);
    }
  };

  return (
    <div>
      <h2>📝 Làm bài thi</h2>

      {timeLeft !== null && (
        <h3 style={{ color: timeLeft < 60 ? "red" : "black" }}>
          ⏰ Thời gian còn lại: {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </h3>
      )}

      <hr />

      {questions.map((q, index) => (
        <div key={q._id}>
          <p>
            <b>Câu {index + 1}:</b> {q.content}
          </p>

          {q.options.map((o, i) => (
            <label key={i} style={{ display: "block" }}>
              <input
                type="radio"
                name={q._id}
                checked={answers[q._id] === i}
                onChange={() => chooseAnswer(q._id, i)}
                disabled={submitted}
              />
              {o}
            </label>
          ))}
          <hr />
        </div>
      ))}

      <button onClick={submitExam} disabled={submitted}>
        📤 Nộp bài
      </button>
    </div>
  );
}
