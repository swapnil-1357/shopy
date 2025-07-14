import axios from 'axios'

const instance = axios.create({
    baseURL: 'https://shopy-1-jf5l.onrender.com/api', //'http://localhost:5000/api', // Use your deployed backend URL here ||
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
})

export default instance
