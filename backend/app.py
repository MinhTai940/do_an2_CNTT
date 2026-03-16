from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
print("🔥🔥🔥 FLASK APP WITH CORS IS RUNNING 🔥🔥🔥")
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True
)

from routes.test_routes import test_bp
from routes.class_routes import class_bp
from routes.exam_routes import exam_bp
from routes.question_routes import question_bp
from routes.result_routes import result_bp
from routes.cheat_routes import cheat_bp
from routes.report_routes import report_bp
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.student_routes import student_bp
from routes.teacher_routes import teacher_bp








app.register_blueprint(test_bp, url_prefix="/api/test")
app.register_blueprint(class_bp, url_prefix="/api/classes")
app.register_blueprint(exam_bp, url_prefix="/api/exams")
app.register_blueprint(question_bp, url_prefix="/api/questions")
app.register_blueprint(result_bp, url_prefix="/api/results")
app.register_blueprint(cheat_bp, url_prefix="/api/cheat")
app.register_blueprint(report_bp, url_prefix="/api/reports")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(student_bp, url_prefix="/api/student")
app.register_blueprint(teacher_bp, url_prefix="/api/teacher")






if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

