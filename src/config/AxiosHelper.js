import axios from 'axios';

export const baseURL = 'https://api.example.com'; // Replace with your actual base URL
export const httpClient = axios.create({
baseURL: baseURL,
});