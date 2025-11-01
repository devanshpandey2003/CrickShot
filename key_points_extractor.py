import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import math
import os


#  Initialize BlazePose for Keypoint Extraction

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False, min_detection_confidence=0.5, model_complexity=2
)


KEY_LANDMARKS = [
    mp_pose.PoseLandmark.LEFT_SHOULDER,
    mp_pose.PoseLandmark.RIGHT_SHOULDER,
    mp_pose.PoseLandmark.LEFT_ELBOW,
    mp_pose.PoseLandmark.RIGHT_ELBOW,
    mp_pose.PoseLandmark.LEFT_WRIST,
    mp_pose.PoseLandmark.RIGHT_WRIST,
    mp_pose.PoseLandmark.LEFT_HIP,
    mp_pose.PoseLandmark.RIGHT_HIP,
    mp_pose.PoseLandmark.LEFT_KNEE,
    mp_pose.PoseLandmark.RIGHT_KNEE,
    mp_pose.PoseLandmark.LEFT_ANKLE,
    mp_pose.PoseLandmark.RIGHT_ANKLE,
    mp_pose.PoseLandmark.LEFT_HEEL,
    mp_pose.PoseLandmark.RIGHT_HEEL,
    mp_pose.PoseLandmark.LEFT_FOOT_INDEX,
    mp_pose.PoseLandmark.RIGHT_FOOT_INDEX,
]


#  Helper Functions: Angle & Distance Computation


def calculate_angle(a, b, c):
    """Compute angle between three points (in degrees)."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    ab = a - b
    cb = c - b
    cosine_angle = np.dot(ab, cb) / (np.linalg.norm(ab) * np.linalg.norm(cb) + 1e-6)
    angle = np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))
    return angle


def euclidean_distance(a, b):
    """Compute distance between two points."""
    a, b = np.array(a), np.array(b)
    return np.linalg.norm(a - b)


# Feature Extraction from Landmarks


def extract_features(image):
    """Extract normalized landmarks, compute angles & distances."""
    results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    if not results.pose_landmarks:
        return None  # No person detected

    landmarks = results.pose_landmarks.landmark
    selected = [(landmarks[i].x, landmarks[i].y, landmarks[i].z) for i in KEY_LANDMARKS]

    # Normalize coordinates based on torso length (shoulder to hip)
    left_shoulder = np.array(selected[0])
    right_shoulder = np.array(selected[1])
    left_hip = np.array(selected[6])
    right_hip = np.array(selected[7])
    torso_length = (
        euclidean_distance(left_shoulder, left_hip)
        + euclidean_distance(right_shoulder, right_hip)
    ) / 2
    normalized = [
        (x / torso_length, y / torso_length, z / torso_length) for (x, y, z) in selected
    ]

    features = []

    # --- Joint Angles ---
    features.append(
        calculate_angle(normalized[0], normalized[2], normalized[4])
    )  # left arm
    features.append(
        calculate_angle(normalized[1], normalized[3], normalized[5])
    )  # right arm
    features.append(
        calculate_angle(normalized[6], normalized[8], normalized[10])
    )  # left leg
    features.append(
        calculate_angle(normalized[7], normalized[9], normalized[11])
    )  # right leg

    # --- Inter-joint Distances ---
    features.append(
        euclidean_distance(normalized[4], normalized[0])
    )  # left wrist to shoulder
    features.append(
        euclidean_distance(normalized[5], normalized[1])
    )  # right wrist to shoulder
    features.append(
        euclidean_distance(normalized[6], normalized[10])
    )  # left hip to ankle
    features.append(
        euclidean_distance(normalized[7], normalized[11])
    )  # right hip to ankle
    features.append(
        euclidean_distance(normalized[0], normalized[6])
    )  # left shoulder to left hip
    features.append(
        euclidean_distance(normalized[1], normalized[7])
    )  # right shoulder to right hip

    return np.array(features)


# Dataset Creation
DATA_DIR = "dataset/"
labels, data = [], []

for label in os.listdir(DATA_DIR):
    folder = os.path.join(DATA_DIR, label)
    for img_name in os.listdir(folder):
        img_path = os.path.join(folder, img_name)
        img = cv2.imread(img_path)
        feats = extract_features(img)
        if feats is not None:
            data.append(feats)
            labels.append(label)

X = np.array(data)
y = np.array(labels)
print(f"Dataset Shape: {X.shape}, Labels: {len(set(y))}")


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)

rf = RandomForestClassifier(
    n_estimators=82,
    max_depth=None,
    min_samples_split=2,
    random_state=42,
)
rf.fit(X_train, y_train)

# Evaluation

y_pred = rf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print("Model Accuracy:", round(accuracy * 100, 2), "%")
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Save the trained model
import joblib

joblib.dump(rf, "cricket_shot_random_forest.pkl")
print("✅ Model saved as 'cricket_shot_random_forest.pkl'")
