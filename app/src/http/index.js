


import axios from 'axios';




const api = axios.create({
    baseURL: 'https://neonmortgage.com/api/user',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})

export const getPosts = async (page, search = '') => api.get(`/blog/get/${page}`);

export const getPost = async (slug) => api.get(`/blog/posts/${slug}`);


export const createContact = async (data) => api.post('/contact/create', data);
export const createApplication = async (data) => api.post('/application/create', data);
export const updateApplication = async (id, data) => api.post(`/application/update/${id}`, data);
export const getApplication = async (id) => api.get(`/application/get/${id}`);

export const getEibor = async () => api.get('/eibor/get')
