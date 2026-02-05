from flask import Flask
from flask_cors import CORS

from routes.test_routes import test_bp
from routes.class_routes import class_bp
from routes.exam_routes import exam_bp
from routes.question_routes import question_bp
from routes.result_routes import result_bp
from routes.cheat_routes import cheat_bp
from routes.report_routes import report_bp
from routes.auth_routes import auth_bp



app = Flask(__name__)
CORS(app, supports_credentials=True)

# đăng ký routes
app.register_blueprint(test_bp, url_prefix="/api/test")
app.register_blueprint(class_bp, url_prefix="/api/classes")
app.register_blueprint(exam_bp, url_prefix="/api/exams")
app.register_blueprint(question_bp, url_prefix="/api/questions")
app.register_blueprint(result_bp, url_prefix="/api/results")
app.register_blueprint(cheat_bp, url_prefix="/api/cheat")
app.register_blueprint(report_bp, url_prefix="/api/reports")
app.register_blueprint(auth_bp, url_prefix="/api/auth")




if __name__ == "__main__":
    app.run(debug=True)

