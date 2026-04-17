# 🌾 Smart Farm Simulator

### AI-Powered Crop Decision Support System

Smart Farm Simulator is a web-based application that helps farmers and users make **data-driven crop decisions** based on environmental conditions. By simulating outcomes for different crops, it provides actionable insights on **yield, profit, and risk**.

---

## 🚀 Features

* 📥 User-friendly input system (rainfall, temperature, humidity, soil type)
* 🤖 AI-based simulation for multiple crops (Rice, Wheat, Corn)
* 📊 Predicted:

  * Yield
  * Profit (₹)
  * Risk Level (Low / Medium / High)
* 🏆 Best crop recommendation based on profitability
* 📉 Visual comparison using charts
* ⚡ Fast and responsive UI

---

## 🧠 How It Works

1. User inputs environmental data:

   * Rainfall (mm)
   * Temperature (°C)
   * Humidity (%)
   * Soil Type

2. Frontend sends data to backend via API:

   ```json
   {
     "rainfall": 1200,
     "temperature": 28,
     "humidity": 75,
     "soil_type": "Loamy"
   }
   ```

3. Backend processes the data and returns predictions for:

   * Rice 🌾
   * Wheat 🌿
   * Corn 🌽

4. Results are displayed with:

   * Yield predictions
   * Profit estimation
   * Risk analysis
   * Best crop highlight

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios
* Recharts

### Backend

* Flask (Python)
* REST API

---

## 📁 Project Structure

```
smart-farm-simulator/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── app.py
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/smart-farm-simulator.git
cd smart-farm-simulator
```

---

### 2. Setup Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on:
👉 http://localhost:5000

---

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
👉 http://localhost:5173

---

## 📡 API Endpoint

### POST /predict

**Request Body:**

```json
{
  "rainfall": number,
  "temperature": number,
  "humidity": number,
  "soil_type": "Loamy | Sandy | Clay | Silt"
}
```

**Response Example:**

```json
{
  "crops": [
    {
      "name": "Rice",
      "yield": 4.5,
      "profit": 50000,
      "risk": "Low",
      "explanation": "High rainfall favors rice growth."
    }
  ]
}
```

---

## 🌍 Future Enhancements

* 🌦️ Weather API integration (auto-fill inputs)
* 📡 IoT sensor integration for real-time soil data
* 📱 Mobile app version
* 🧠 Advanced ML models for higher accuracy
* 🌎 Location-based recommendations

---

## 🎯 Use Cases

* Farmers planning crop cycles
* Agricultural students and researchers
* Agri-tech platforms
* Government advisory systems

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repo and submit a pull request.

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Authors

* Bhanu Prakash, Abhinay
* Oblyx

---

## ⭐ Acknowledgment

Built as part of a hackathon to solve real-world agricultural challenges using technology and AI.
