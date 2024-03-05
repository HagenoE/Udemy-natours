import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {

  try {
    const res = await axios.post('/api/v1/users/login', {
      email,
      password,
    });

    showAlert('success', 'Logged In')

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
}

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios.post('/api/v1/users/signup', {
      name,
      email,
      password,
      passwordConfirm
    });

    showAlert('success', 'Account created')

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }

  } catch (error) {
    showAlert('error', error.response.data.message)
  }
};

export const logout = async () => {
  try {

    const res = await axios.get('/api/v1/users/logout');

    if (res.data.status === 'success') location.reload(true)
  } catch (error) {
    showAlert('error', 'Error logging out! Try again')
  }
}