from flask import Flask
from flask_cors import CORS

from routes.test_routes import test_bp
from routes.class_routes import class_bp

app = Flask(__name__)
CORS(app)

# đăng ký routes
app.register_blueprint(test_bp, url_prefix="/api/test")
app.register_blueprint(class_bp, url_prefix="/api/classes")

if __name__ == "__main__":
    app.run(debug=True)

