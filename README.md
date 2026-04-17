# Smart Farm Simulator

## Project Structure

```text
Farm-simulator-AI/
|-- README.md
|-- backend/
|   |-- app.py
|   |-- config.py
|   |-- models.py
|   |-- requirements.txt
|   |-- instance/
|   |   `-- app.db
|   `-- routes/
|       |-- __init__.py
|       |-- auth.py
|       `-- simulator.py
`-- frontend/
    |-- index.html
    |-- package.json
    |-- postcss.config.js
    |-- tailwind.config.js
    |-- vite.config.js
    `-- src/
        |-- App.jsx
        |-- index.css
        |-- main.jsx
        |-- components/
        |-- context/
        |-- pages/
        `-- services/
```

## Backend Setup

From the project root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Run the Flask API:

```powershell
$env:FLASK_APP="app.py"
python -m flask run --port=5000
```

Backend base URL:

```text
http://localhost:5000
```

## Frontend Setup

Open a new terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend dev server:

```text
http://localhost:5173
```

The frontend is already configured to call the backend at `http://localhost:5000`, and the Flask backend already allows CORS from `http://localhost:5173`.

## Frontend Features

- React 18 + Vite
- Tailwind CSS
- React Router protected routes
- Axios instance with JWT interceptor
- Auth state with React Context API
- Login, register, forgot password, and reset password pages
- Protected simulator page with yield cards, best crop highlight, and Recharts bar chart
- Toast notifications via `sonner`

## Auth Flow

1. Register at `/register`
2. The frontend auto-logs in after successful registration
3. Login stores `user` and `token` in `localStorage`
4. Protected routes redirect unauthenticated users to `/login`
5. Forgot password posts to `/auth/forgot-password`
6. Reset password reads the `token` from `/reset-password?token=XYZ`
7. Logout clears local auth state and redirects to `/login`

## Backend Endpoints Used By Frontend

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /predict`

## Quick Test

1. Start the backend on port `5000`
2. Start the frontend on port `5173`
3. Open [http://localhost:5173](http://localhost:5173)
4. Register a new account
5. You should be redirected to `/simulator`
6. Run a simulation with rainfall, temperature, humidity, and soil type
7. Use forgot password to generate a reset token, then open the reset link shown in the backend console
