import axios from 'axios'

const instance = axios.create({
<<<<<<< HEAD
    baseURL: import.meta.env.VITE_API_BASE_URL, //  'https://shopy-1-jf5l.onrender.com/api', Use your deployed backend URL here ||
=======
    baseURL: 'https://shopy-1-jf5l.onrender.com/api', //  'https://shopy-1-jf5l.onrender.com/api', Use your deployed backend URL here ||
>>>>>>> 2e8aedec24720a92407dca526392e4be72a01b59
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
})

export default instance
