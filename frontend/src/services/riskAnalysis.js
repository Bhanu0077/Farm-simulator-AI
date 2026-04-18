import api from "./api";


export async function getRiskAnalysis(data) {
  const response = await api.post("/risk-analysis", data);
  return response.data;
}
