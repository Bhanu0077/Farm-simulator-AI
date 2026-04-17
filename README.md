# Smart Farm Simulator

Smart Farm Simulator now includes:
- password login
- email OTP login
- forgot/reset password
- protected crop simulation
- protected live weather lookup using Open-Meteo

## Project Structure

```text
Farm-simulator-AI/
|-- backend/
|   |-- app.py
|   |-- config.py
|   |-- models.py
|   |-- requirements.txt
|   |-- routes/
|   |   |-- auth.py
|   |   |-- simulator.py
|   |   `-- weather.py
|   `-- services/
|       `-- email_service.py
|-- frontend/
|   |-- package.json
|   `-- src/
|       |-- components/
|       |-- context/
|       |-- pages/
|       `-- services/
`-- README.md
```

## Backend Setup

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Run the backend:

```powershell
$env:FLASK_APP="app.py"
python -m flask run --port=5000
```

Backend URL:

```text
http://localhost:5000
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Email OTP Config

For local testing without real email sending:

```powershell
$env:EMAIL_PROVIDER="console"
```

For Resend:

```powershell
$env:EMAIL_PROVIDER="resend"
$env:EMAIL_FROM="Smart Farm <your-verified-sender@yourdomain.com>"
$env:RESEND_API_KEY="YOUR_RESEND_API_KEY"
```

Optional OTP settings:

```powershell
$env:OTP_EXPIRY_MINUTES="10"
$env:OTP_LENGTH="6"
$env:OTP_RESEND_COOLDOWN_SECONDS="60"
```

When `EMAIL_PROVIDER=console`, the backend prints the OTP in the terminal and also returns `otp_debug` from `POST /auth/request-otp` for easy testing.

## Backend Endpoints

Auth:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/request-otp`
- `POST /auth/verify-otp`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Simulator:
- `POST /predict`

Weather:
- `GET /weather?location=Hyderabad`
- `GET /weather?lat=17.385&lon=78.486`

## Example OTP Flow

Request OTP:

```json
POST /auth/request-otp
{
  "email": "bhanu@example.com"
}
```

Verify OTP:

```json
POST /auth/verify-otp
{
  "email": "bhanu@example.com",
  "otp": "123456"
}
```

## Weather Notes

The weather endpoint uses Open-Meteo geocoding and forecast APIs. It returns:
- resolved location
- current temperature
- humidity
- precipitation
- wind speed
- weather summary
- 3-day forecast

## Verification

- Backend Python files compiled successfully with `python -m compileall`
- Frontend compiled successfully with `npm run build`
