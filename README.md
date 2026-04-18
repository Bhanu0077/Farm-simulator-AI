# Smart Farm Simulator

Smart Farm Simulator is a protected React + Flask application for farm planning. It supports land selection, live weather lookup, SoilGrids soil data, crop yield/profit simulation, risk analysis, and an AI chatbot that answers using the user's current farm data.

## Features

- Password login, email OTP login, and forgot/reset password
- JWT-protected dashboard and simulator pages
- Interactive land polygon selection with acreage calculation
- Live weather lookup using Open-Meteo
- Soil profile lookup using SoilGrids
- Crop yield, risk, and profit simulation
- Best-crop selection from backend simulation results
- Risk analysis with OpenRouter AI and local fallback logic
- Chatbot using OpenRouter through the Flask backend
- Chatbot memory using recent conversation history and current farm context

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
|   |   |-- chatbot.py
|   |   |-- land.py
|   |   |-- risk_analysis.py
|   |   |-- simulator.py
|   |   `-- weather.py
|   `-- services/
|       |-- email_service.py
|       |-- market_service.py
|       `-- soil_service.py
|-- frontend/
|   |-- package.json
|   `-- src/
|       |-- components/
|       |-- context/
|       |-- data/
|       |-- pages/
|       |-- services/
|       `-- utils/
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

## Environment Variables

### Required For AI Chatbot And AI Risk Analysis

Set the OpenRouter key on the backend, not the frontend:

```powershell
$env:OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"
```

Restart Flask after setting this value. The chatbot calls `POST /chatbot`, and the Flask backend securely calls OpenRouter using this key.

### Email OTP Config

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

Most app endpoints are JWT-protected. After login or OTP verification, the frontend sends the token in the `Authorization: Bearer <token>` header.

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

Land And Soil:

- `GET /soil-data?lat=17.385&lon=78.486`

Risk Analysis:

- `POST /risk-analysis`

Chatbot:

- `POST /chatbot`

## Simulator Logic

The simulator uses rule-based crop profiles, not a trained ML model. Each crop has base yield, ideal rainfall, ideal temperature, ideal humidity, tolerance values, preferred soils, and a short explanation.

For each crop, the backend calculates:

- weather penalties from rainfall, temperature, and humidity deviation
- soil suitability bonus or penalty
- predicted yield per acre
- total predicted yield using land size
- profit using seasonal fallback crop prices
- risk level: `Low`, `Medium`, or `High`

The backend's best crop is the crop with the highest estimated profit from the simulation.

## Chatbot Logic

The chatbot keeps recent conversation memory in the frontend and sends the last messages to the backend. The backend adds a system prompt containing:

- user name
- soil sand, clay, silt, pH, organic carbon, and soil type
- weather temperature, rainfall, and humidity
- land size
- recommended crop

The backend then calls OpenRouter with `openai/gpt-4o-mini` and returns a concise farming response. If `OPENROUTER_API_KEY` is missing, `/chatbot` returns an error and the frontend shows a fallback message.

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

## Soil Notes

The soil endpoint uses SoilGrids data for the selected land center point. It returns:

- sand percentage
- clay percentage
- silt percentage
- pH
- organic carbon
- classified soil type

## Verification

Run these checks after changes:

```powershell
python -m compileall backend
cd frontend
npm run build
```

Known build note: Vite may warn that some chunks are larger than 500 kB. The build can still complete successfully.
