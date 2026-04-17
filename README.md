# Smart Farm Simulator Backend MVP

## File Structure

```text
Farm-simulator-AI/
├── README.md
└── backend/
    ├── app.py
    ├── config.py
    ├── models.py
    ├── requirements.txt
    ├── instance/
    │   └── app.db
    └── routes/
        ├── __init__.py
        ├── auth.py
        └── simulator.py
```

## What This Backend Includes

- Flask API with blueprint-based routing
- SQLite database at `backend/instance/app.db`
- JWT authentication with 1 hour access-token expiry
- Password hashing with Werkzeug
- Password reset flow using secure time-limited tokens
- CORS enabled for `http://localhost:5173`
- Protected `/predict` simulator endpoint

## Install

From the project root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

From the `backend` folder:

```powershell
$env:FLASK_APP="app.py"
python -m flask run --port=5000
```

The API will be available at `http://localhost:5000`.

## Auth API

### `POST /auth/register`

Request body:

```json
{
  "name": "Bhanu",
  "email": "bhanu@example.com",
  "password": "StrongPass123"
}
```

Success response:

```json
{
  "message": "User registered successfully"
}
```

### `POST /auth/login`

Request body:

```json
{
  "email": "bhanu@example.com",
  "password": "StrongPass123"
}
```

Success response:

```json
{
  "access_token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "Bhanu",
    "email": "bhanu@example.com"
  }
}
```

### `POST /auth/forgot-password`

Request body:

```json
{
  "email": "bhanu@example.com"
}
```

Behavior:

- Generates a secure reset token valid for 15 minutes
- Prints this to the backend console:

```text
RESET LINK: http://localhost:5173/reset-password?token=XYZ
```

Response:

```json
{
  "message": "If email exists, reset link has been sent",
  "reset_token": "XYZ"
}
```

### `POST /auth/reset-password`

Request body:

```json
{
  "token": "XYZ",
  "new_password": "NewStrongPass123"
}
```

Success response:

```json
{
  "message": "Password reset successfully"
}
```

## Protected Simulator API

### `POST /predict`

Headers:

```text
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Request body:

```json
{
  "rainfall": 210,
  "temperature": 27,
  "humidity": 74,
  "soil_type": "Loamy"
}
```

Response shape:

```json
{
  "inputs": {
    "rainfall": 210.0,
    "temperature": 27.0,
    "humidity": 74.0,
    "soil_type": "Loamy"
  },
  "predictions": {
    "Rice": {
      "predicted_yield": 6.11,
      "profit": 134.42,
      "risk_level": "Low",
      "explanation": "..."
    },
    "Wheat": {
      "predicted_yield": 4.37,
      "profit": 78.66,
      "risk_level": "High",
      "explanation": "..."
    },
    "Corn": {
      "predicted_yield": 9.05,
      "profit": 144.8,
      "risk_level": "Low",
      "explanation": "..."
    }
  },
  "recommended_crop": {
    "name": "Corn",
    "predicted_yield": 9.05,
    "profit": 144.8,
    "risk_level": "Low",
    "explanation": "..."
  }
}
```

## Test With curl

Register:

```powershell
curl -X POST http://localhost:5000/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Bhanu\",\"email\":\"bhanu@example.com\",\"password\":\"StrongPass123\"}"
```

Login:

```powershell
curl -X POST http://localhost:5000/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"bhanu@example.com\",\"password\":\"StrongPass123\"}"
```

Forgot password:

```powershell
curl -X POST http://localhost:5000/auth/forgot-password `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"bhanu@example.com\"}"
```

Reset password:

```powershell
curl -X POST http://localhost:5000/auth/reset-password `
  -H "Content-Type: application/json" `
  -d "{\"token\":\"PASTE_TOKEN_HERE\",\"new_password\":\"NewStrongPass123\"}"
```

Predict:

```powershell
curl -X POST http://localhost:5000/predict `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d "{\"rainfall\":210,\"temperature\":27,\"humidity\":74,\"soil_type\":\"Loamy\"}"
```

## Postman Flow

1. Register a user with `POST /auth/register`
2. Log in with `POST /auth/login`
3. Copy `access_token` from the response
4. Call `POST /predict` with `Authorization -> Bearer Token`
5. Use `POST /auth/forgot-password` to get a test reset token
6. Use that token in `POST /auth/reset-password`
