import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:5000/api', // Change this if your backend URL is different
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
})

export default instance
