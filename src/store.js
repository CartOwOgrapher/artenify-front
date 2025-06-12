// src/store.js
import { createStore } from 'vuex';
import api from '@/axios.js'

const store = createStore({
    state() {
        return {
            user: JSON.parse(localStorage.getItem('user')) || null,
            isAuthenticated: !!localStorage.getItem('access_token'),
            errors: {},
            applications: [],
        };
    },
    getters: {
        user: (state) => state.user,
        isAuthenticated: (state) => state.isAuthenticated,
        errors: (state) => state.errors,
        applications: (state) => state.applications,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
            state.isAuthenticated = !!user;
            localStorage.setItem('user', JSON.stringify(user));
        },
        setErrors(state, errors) {
            state.errors = errors;
        },
        clearUser(state) {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
        },
        clearErrors(state) {
            state.errors = {};
        },
        setApplications(state, applications) {
            state.applications = applications;
        },
    },

    actions: {
        async getUser({ commit }) {
            try {
                const response = await api.get('/profile/me', { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });
                commit('setUser', response.data);
            } catch (error) {
                console.error('Ошибка загрузки пользователя:', error);
            }
        },
        async login({ dispatch, commit }, { email, password }) {
            commit('clearErrors');
            try {
        
                const response = await api.post('/auth/login', { email, password });
                if (response.status === 200) {
                    localStorage.setItem('access_token', response.data.token);
                    await dispatch('getUser');
                }
                return response
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    commit('setErrors', error.response.data.errors);
                } else {
                    console.error('Login failed:', error);
                }
                return error.response;
            }
        },
        async logout({ commit }) {
            try {
                await api.post('/auth/logout', { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });

            } catch (error) {
                localStorage.removeItem('access_token');
                commit('clearUser');
                console.error('Logout failed:', error);
                
            }
            localStorage.removeItem('access_token');
            commit('clearUser');
        },
        async register({ commit }, { name, email, password}) {
            commit('clearErrors');
            try {
                await api.post('/auth/register', {
                    name,
                    email,
                    password, 
                });
            } catch (error) {
                if (error.response && error.response.status === 422) {
                    commit('setErrors', error.response.data.errors);
                } else {
                    console.error('Registration failed:', error);
                }
            }
        },
    },
});

export default store;