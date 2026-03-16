import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ExamDetail() {

  const { examId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("manual");

  // manual question
  const [content, setContent] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);


  /* ================= LOAD QUESTIONS ================= */

  const loadQuestions = () => {

    axiosClient
      .get(`/questions/exam/${examId}/teacher`)
      .then(res => setQuestions(res.data))
      .catch(() => alert("Không tải được câu hỏi"));

  };

  useEffect(() => {
    loadQuestions();
  }, [examId]);



  /* ================= CREATE QUESTION ================= */

  const saveQuestion = async () => {

    if (!content || options.some(o => !o)) {
      alert("Vui lòng nhập đầy đủ câu hỏi");
      return;
    }

    try {

      await axiosClient.post("/questions/create", {
        exam_id: examId,
        content,
        options,
        correct_index: correctIndex,

        shuffle_questions: shuffleQuestions,
        shuffle_answers: shuffleAnswers
      });

      alert("✅ Thêm câu hỏi thành công");

      setContent("");
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);

      loadQuestions();

    } catch {
      alert("❌ Thêm câu hỏi thất bại");
    }

  };



  /* ================= UPLOAD WORD ================= */

  const uploadWord = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("shuffle_questions", shuffleQuestions);
    formData.append("shuffle_answers", shuffleAnswers);

    try {

      setUploading(true);

      const res = await axiosClient.post(
        `/exams/upload-word/${examId}`,
        formData
      );

      alert(`✅ Upload thành công ${res.data.total_questions} câu`);

      loadQuestions();

    } catch (err) {

      console.error(err);
      alert("❌ Upload thất bại");

    } finally {

      setUploading(false);

    }

  };



  /* ================= EDIT QUESTION ================= */

  const editQuestion = (q) => {

    const content = prompt("Nhập nội dung câu hỏi:", q.content);
    if (!content) return;

    const options = [...q.options];

    for (let i = 0; i < options.length; i++) {

      const opt = prompt(`Đáp án ${i + 1}:`, options[i]);

      if (!opt) return;

      options[i] = opt;

    }

    const correct = prompt("Chỉ số đáp án đúng (0-3):", q.correct_index);

    if (correct === null || isNaN(correct)) {
      alert("Đáp án đúng không hợp lệ");
      return;
    }

    axiosClient
      .put(`/questions/${q._id}`, {
        content,
        options,
        correct_index: Number(correct)
      })
      .then(() => {
        alert("✅ Cập nhật câu hỏi");
        loadQuestions();
      })
      .catch(() => alert("❌ Cập nhật thất bại"));

  };



  /* ================= DELETE QUESTION ================= */

  const deleteQuestion = (id) => {

    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;

    axiosClient
      .delete(`/questions/${id}`)
      .then(() => {

        alert("✅ Đã xóa");

        setQuestions(prev => prev.filter(q => q._id !== id));

      })
      .catch(() => alert("❌ Xóa thất bại"));

  };



  return (

    <div style={container}>

      <h2>📄 Chi tiết đề thi</h2>


      {/* BUTTON */}

      <button
        onClick={() => setShowModal(true)}
        style={createBtn}
      >
        ➕ Tạo câu hỏi
      </button>



      {/* ================= MODAL ================= */}

      {showModal && (

        <div style={overlayStyle}>

          <div style={modalStyle}>

            {/* TAB */}

            <div style={{ marginBottom: 20 }}>

              <button
                onClick={() => setTab("manual")}
                style={tab === "manual" ? activeTab : tabStyle}
              >
                Thêm thủ công
              </button>

              <button
                onClick={() => setTab("file")}
                style={tab === "file" ? activeTab : tabStyle}
              >
                Thêm từ file
              </button>

            </div>
            {/* GLOBAL TOGGLE */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 25,
                marginBottom: 20
              }}
            >

              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>

                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                />

                Đảo câu hỏi

              </label>


              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>

                <input
                  type="checkbox"
                  checked={shuffleAnswers}
                  onChange={(e) => setShuffleAnswers(e.target.checked)}
                />

                Đảo đáp án

              </label>

            </div>



            {/* MANUAL */}

            {tab === "manual" && (

              <div>

                <textarea
                  placeholder="Nội dung câu hỏi"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={inputStyle}
                />

                {options.map((o, i) => (

                  <div key={i}>

                    <input
                      placeholder={`Đáp án ${i + 1}`}
                      value={o}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[i] = e.target.value;
                        setOptions(newOptions);
                      }}
                      style={inputStyle}
                    />

                    <label>

                      <input
                        type="radio"
                        name="correct"
                        checked={correctIndex === i}
                        onChange={() => setCorrectIndex(i)}
                      />

                      Đúng

                    </label>
                  </div>

                ))}

                <button style={saveBtn} onClick={saveQuestion}>
                  Lưu câu hỏi
                </button>

              </div>

            )}

            {/* FILE */}

            {tab === "file" && (

              <div>

                <h4>Upload đề từ Word (.docx)</h4>

                <input
                  type="file"
                  accept=".docx"
                  onChange={uploadWord}
                />

                {uploading && <p>⏳ Đang upload...</p>}

              </div>

            )}



            <button
              onClick={() => setShowModal(false)}
              style={closeBtn}
            >
              Đóng
            </button>

          </div>

        </div>

      )}



      {/* ================= LIST QUESTIONS ================= */}

      <h3>Danh sách câu hỏi</h3>

      {questions.length === 0 && <p>Chưa có câu hỏi</p>}

      {questions.map((q, index) => (

        <div key={q._id} style={questionCard}>

          <div style={questionTitle}>
            {index + 1}. {q.content}
          </div>

          <div style={optionsGrid}>

            {q.options.map((o, i) => (

              <div
                key={i}
                style={{
                  ...optionItem,
                  background:
                    i === q.correct_index
                      ? "#dbeafe"
                      : "#f8fafc"
                }}
              >

                <b>{String.fromCharCode(65 + i)}.</b> {o}

              </div>

            ))}

          </div>

          <div style={actionBar}>

            <button
              style={editBtn}
              onClick={() => editQuestion(q)}
            >
              ✏️ Sửa
            </button>

            <button
              style={deleteBtn}
              onClick={() => deleteQuestion(q._id)}
            >
              🗑 Xóa
            </button>

          </div>

        </div>

      ))}

    </div>

  );

}


/* ================= STYLES ================= */

const container = {
  padding: "30px 40px",
  marginLeft: "20px",
  maxWidth: "1000px"
};

const createBtn = {
  padding: "10px 18px",
  background: "linear-gradient(135deg,#7c3aed,#6366f1)",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  marginBottom: 25
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalStyle = {
  background: "white",
  padding: 25,
  width: 600,
  borderRadius: 10
};

const tabStyle = {
  padding: "8px 16px",
  border: "1px solid #ddd",
  marginRight: 10,
  cursor: "pointer"
};

const activeTab = {
  padding: "8px 16px",
  background: "#7c3aed",
  color: "white",
  border: "none",
  marginRight: 10
};

const inputStyle = {
  width: "100%",
  padding: 8,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ddd"
};

const saveBtn = {
  padding: "8px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 6
};

const closeBtn = {
  marginTop: 10,
  background: "gray",
  color: "white",
  border: "none",
  padding: "6px 12px"
};

const questionCard = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
};

const questionTitle = {
  fontWeight: "bold",
  marginBottom: 15,
  fontSize: 16
};

const optionsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10
};

const optionItem = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #e5e7eb"
};

const actionBar = {
  marginTop: 15,
  display: "flex",
  gap: 10
};

const editBtn = {
  padding: "6px 14px",
  borderRadius: 6,
  border: "none",
  background: "#f59e0b",
  color: "white",
  cursor: "pointer",
  fontWeight: "500"
};

const deleteBtn = {
  padding: "6px 14px",
  borderRadius: 6,
  border: "none",
  background: "#ef4444",
  color: "white",
  cursor: "pointer",
  fontWeight: "500"
};