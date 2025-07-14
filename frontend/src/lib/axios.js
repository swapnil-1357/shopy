import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:5000/api', //  'https://shopy-1-jf5l.onrender.com/api', Use your deployed backend URL here ||
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
})

export default instance
