
import axios from 'axios';
// import { REST_API_URL } from ".";

// const BACKEND_REST_API_ENDPOINT = `${REST_API_URL}/api/v1/incident_reporting`
export const BASE_URL = "http://localhost:8080"
export const MEDIA_PATH = "/mediafiles/";



// class ApiService {
//     async request(endpoint, options = {}) {
//         const url = `${BACKEND_REST_API_ENDPOINT}${endpoint}`;
//         const config = {
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             ...options,
//         };

//         try {
//             const response = await fetch(url, config);

//             if (!response.ok) {
//                 const errorData = await response.json().catch(() => ({}));
//                 throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//             }

//             return await response.json();
//         } catch (error) {
//             console.error(`API Error for ${endpoint}:`, error);
//             throw error;
//         }
//     }

//     // Incident endpoints
//     async getIncidents(params = {}) {
//         const queryString = new URLSearchParams(params).toString();
//         const endpoint = `/incidents/${queryString ? `?${queryString}` : ''}`;
//         return this.request(endpoint);
//     }

//     async getIncident(id) {
//         return this.request(`/incidents/${id}/`);
//     }

//     async createIncident(data) {
//         return this.request('/incidents/', {
//             method: 'POST',
//             body: JSON.stringify(data),
//         });
//     }

//     async updateIncident(id, data) {
//         return this.request(`/incidents/${id}/`, {
//             method: 'PUT',
//             body: JSON.stringify(data),
//         });
//     }

//     async deleteIncident(id) {
//         return this.request(`/incidents/${id}/`, {
//             method: 'DELETE',
//         });
//     }

//     async getDashboardStats() {
//         return this.request('/incidents/dashboard_stats/');
//     }

//     async getChoices() {
//         return this.request('/incidents/choices/');
//     }

//     async uploadAttachment(incidentId, formData) {
//         const url = `${REST_API_URL}/incidents/${incidentId}/upload_attachment/`;
//         const response = await fetch(url, {
//             method: 'POST',
//             body: formData, // FormData doesn't need Content-Type header
//         });

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//         }

//         return await response.json();
//     }
// }

// export default new ApiService();



const backendApi = axios.create({
    baseURL: `${BASE_URL}/api/v1/incident_reporting`,
    headers: {
        Accept: 'application/json',
        "Content-Type": 'application/json'
    },
    timeout: 30000,
});

export default backendApi;
