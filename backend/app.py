from flask import Flask
from flask_cors import CORS
from routes.test_routes import test_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(test_bp, url_prefix="/api/test")

if __name__ == "__main__":
    app.run(debug=True)
