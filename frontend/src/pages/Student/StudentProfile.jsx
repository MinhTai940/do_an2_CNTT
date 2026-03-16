import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function StudentProfile() {

  const [form, setForm] = useState({});
  const [editingFields, setEditingFields] = useState([]);

  useEffect(() => {
    axiosClient.get("/student/profile").then(res => {
      setForm(res.data);
    });
  }, []);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };


  const enableEdit = (field) => {
    if (!editingFields.includes(field)) {
      setEditingFields([...editingFields, field]);
    }
  };


  const handleSaveAll = async () => {
    try {

      await axiosClient.post("/student/profile", form);

      setEditingFields([]); // khóa lại input

      alert("✅ Đã cập nhật thành công");

    } catch {

      alert("❌ Cập nhật thất bại");

    }
  };


  return (

    <div style={{ padding: 30 }}>

      <h2 style={{ marginBottom: 25 }}>👨‍🎓 Thông tin sinh viên</h2>


      <div
        style={{
          background: "white",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          maxWidth: 900
        }}
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20
          }}
        >

          <EditableField
            label="Họ và tên"
            name="full_name"
            value={form.full_name}
            editingFields={editingFields}
            enableEdit={enableEdit}
            handleChange={handleChange}
          />

          <EditableField
            label="Mã sinh viên"
            name="student_code"
            value={form.student_code}
            editingFields={editingFields}
            enableEdit={enableEdit}
            handleChange={handleChange}
          />

          <EditableField
            label="Lớp"
            name="class_name"
            value={form.class_name}
            editingFields={editingFields}
            enableEdit={enableEdit}
            handleChange={handleChange}
          />

          <EditableField
            label="Ngày sinh"
            name="birth_date"
            type="date"
            value={form.birth_date}
            editingFields={editingFields}
            enableEdit={enableEdit}
            handleChange={handleChange}
          />

          <EditableField
            label="Email"
            name="email"
            value={form.email}
            editingFields={editingFields}
            enableEdit={enableEdit}
            handleChange={handleChange}
          />

          <EditableField
            label="Số điện thoại"
            name="phone"
            value={form.phone}
            editingFields={editingFields}
            enableEdit={enableEdit}
            handleChange={handleChange}
          />

          <EditableField
            label="Giới tính"
            name="gender"
            type="select"
            value={form.gender}
            editingFields={editingFields}
            enableEdit={enableEdit}
            handleChange={handleChange}
          />

          <EditableField
            label="Địa chỉ"
            name="address"
            value={form.address}
            editingFields={editingFields}
            enableEdit={enableEdit}
            handleChange={handleChange}
          />

        </div>


        {/* NÚT LƯU */}

        {editingFields.length > 0 && (

          <div style={{ textAlign: "right", marginTop: 30 }}>

            <button
              onClick={handleSaveAll}
              style={{
                padding: "10px 30px",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              💾 Lưu thay đổi
            </button>

          </div>

        )}

      </div>

    </div>

  );
}


/* COMPONENT EDIT FIELD */

function EditableField({
  label,
  name,
  value,
  type = "text",
  editingFields,
  enableEdit,
  handleChange
}) {

  const isEditing = editingFields.includes(name);

  return (

    <div style={{ display: "flex", flexDirection: "column" }}>

      <label style={{ fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#f3f4f6",
          borderRadius: 8,
          padding: "8px 12px"
        }}
      >

        {type === "select" ? (

          <select
            name={name}
            value={value || ""}
            disabled={!isEditing}
            onChange={handleChange}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none"
            }}
          >

            <option value="">Chọn</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>

          </select>

        ) : (

          <input
            type={type}
            name={name}
            value={value || ""}
            disabled={!isEditing}
            onChange={handleChange}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none"
            }}
          />

        )}

        <span
          style={{ cursor: "pointer", marginLeft: 10 }}
          onClick={() => enableEdit(name)}
        >
          ✏️
        </span>

      </div>

    </div>

  );
}