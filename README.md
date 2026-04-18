# Smart Farm Simulator

Smart Farm Simulator is a full-stack farm planning application built with React and Flask. It helps users select land, fetch weather and soil data, simulate crop yield and profit, analyze farming risk, and ask farm-specific questions through an AI chatbot.

## Features

- User registration and password login
- Email OTP login
- Forgot password and reset password flow
- JWT-protected simulator dashboard
- Interactive land polygon selection
- Automatic acreage calculation
- Live weather lookup using Open-Meteo
- Soil profile lookup using SoilGrids
- Crop yield, risk, and profit simulation
- Backend best-crop recommendation based on estimated profit
- AI-powered risk analysis with fallback logic
- AI chatbot with conversation memory and current farm context

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Leaflet
- Turf.js
- Recharts
- Lucide React

### Backend

- Flask
- Flask-CORS
- Flask-JWT-Extended
- Flask-SQLAlchemy
- SQLite
- Requests
- Werkzeug
- OpenRouter API

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
|   |-- package-lock.json
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

Start the backend server:

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

## Environment Configuration

Set environment variables in the same terminal session before starting the backend.

### Required For AI Features

```powershell
$env:OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"
```

The OpenRouter key is used by the Flask backend for:

- AI chatbot responses
- AI risk analysis

Do not place the OpenRouter key in the frontend. The frontend calls the Flask backend, and the backend calls OpenRouter.

### Local Email OTP Testing

```powershell
$env:EMAIL_PROVIDER="console"
```

When `EMAIL_PROVIDER=console`, OTP codes are printed in the backend terminal and returned as `otp_debug` from `POST /auth/request-otp`.

### Resend Email Provider

```powershell
$env:EMAIL_PROVIDER="resend"
$env:EMAIL_FROM="Smart Farm <your-verified-sender@yourdomain.com>"
$env:RESEND_API_KEY="YOUR_RESEND_API_KEY"
```

### Optional OTP Settings

```powershell
$env:OTP_EXPIRY_MINUTES="10"
$env:OTP_LENGTH="6"
$env:OTP_RESEND_COOLDOWN_SECONDS="60"
```

## API Endpoints

Most application endpoints require a JWT access token.

### Authentication

```text
POST /auth/register
POST /auth/login
POST /auth/request-otp
POST /auth/verify-otp
POST /auth/forgot-password
POST /auth/reset-password
```

### Simulator

```text
POST /predict
```

### Weather

```text
GET /weather?location=Hyderabad
GET /weather?lat=17.385&lon=78.486
```

### Soil Data

```text
GET /soil-data?lat=17.385&lon=78.486
```

### Risk Analysis

```text
POST /risk-analysis
```

### Chatbot

```text
POST /chatbot
```

## Authentication Flow

After login or OTP verification, the backend returns a JWT access token. The frontend stores the token and sends it with protected API requests:

```text
Authorization: Bearer <access_token>
```

Example OTP request:

```json
{
  "email": "bhanu@example.com"
}
```

Example OTP verification:

```json
{
  "email": "bhanu@example.com",
  "otp": "123456"
}
```

## Simulator Logic

The crop simulator is rule-based. It does not use a trained machine learning model.

Each crop profile includes:

- base yield
- ideal rainfall
- ideal temperature
- ideal humidity
- tolerance ranges
- preferred soil types
- crop summary

For each crop, the backend calculates:

- weather penalty
- soil suitability adjustment
- predicted yield per acre
- total predicted yield
- estimated profit
- risk level

The backend selects the best crop by comparing estimated profit across available crop predictions.

## Weather Data

Weather data is fetched from Open-Meteo. The response includes:

- resolved location
- current temperature
- humidity
- precipitation
- wind speed
- weather summary
- 3-day forecast

## Soil Data

Soil data is fetched from SoilGrids using the selected land center point. The response includes:

- sand percentage
- clay percentage
- silt percentage
- pH
- organic carbon
- classified soil type

## Risk Analysis

The risk analysis endpoint first attempts to use OpenRouter. If the AI request fails, the backend uses local fallback rules based on:

- rainfall
- temperature
- humidity
- soil pH
- organic carbon
- sand and clay percentage
- land size

The response includes:

- overall risk
- water risk
- soil risk
- weather risk
- recommendations

## Chatbot

The chatbot uses the current farm context and recent conversation history. The frontend sends recent chat messages and farm data to the Flask backend. The backend builds a system prompt and calls OpenRouter.

The chatbot context includes:

- user name
- recommended crop
- soil values
- weather values
- land size
- recent conversation messages

If the OpenRouter key is missing or the request fails, the frontend displays a fallback response.

## Verification

Run backend syntax checks:

```powershell
python -m compileall backend
```

Run frontend production build:

```powershell
cd frontend
npm run build
```

The frontend build may show a Vite chunk-size warning. This warning does not necessarily indicate a failed build.

## Notes

- Start the backend before using the frontend.
- Restart the backend after changing environment variables.
- AI features require a valid `OPENROUTER_API_KEY`.
- Protected endpoints require a valid JWT token.
- The simulator is designed for planning support and should not replace professional agronomic advice.
