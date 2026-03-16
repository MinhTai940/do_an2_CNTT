from ultralytics import YOLO
import cv2
import numpy as np
import base64

# ===== LOAD MODEL =====
model = YOLO("yolov8s.pt")


def analyze_image(base64_image):

    # ===== DECODE IMAGE =====
    image_bytes = base64.b64decode(base64_image.split(",")[1])
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    violations = []

    # ===== YOLO DETECTION =====
    results = model(img)

    phone_detected = False
    person_count = 0

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            label = model.names[cls]
            conf = float(box.conf[0])

            if label == "cell phone" and conf > 0.75:
                phone_detected = True

            if label == "person" and conf > 0.6:
                person_count += 1

    # ===== PHONE =====
    if phone_detected and person_count >= 1:
        violations.append("phone_detected")

    # ===== MULTIPLE PERSON =====
    if person_count > 1:
        violations.append("multiple_person")

    # ===== NO FACE (dựa vào person) =====
    if person_count == 0:
        violations.append("no_face")

    print(
        "Persons:", person_count,
        "| Phone:", phone_detected,
        "| Violations:", violations
    )

    return violations