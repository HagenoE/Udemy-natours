import 'core-js/stable';
import 'regenerator-runtime';


import { displayMap } from "./mapBox";
import { login, logout, signup } from "./auth";
import { updateData } from './updateSettings';
import { bookTour } from './stripe';


const loginForm = document.querySelector('.form-login');
const mapBox = document.getElementById('map');
const signupForm = document.querySelector('.form-signup');
const logoutButton = document.querySelector('.nav__el--logout')
const settingsDataForm = document.querySelector('.form-user-data')
const passwordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour');


if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    })
};

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations)
}

if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name, email, password, passwordConfirm);
    })
}

if (logoutButton) logoutButton.addEventListener('click', logout)


if (settingsDataForm) {

    settingsDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();

        form.append('email', document.getElementById('email').value)
        form.append('name', document.getElementById('name').value)
        form.append('photo', document.getElementById('photo').files[0])

        updateData(form, 'settings')
    })
}

if (passwordForm) {
    passwordForm.addEventListener('submit', async e => {
        e.preventDefault();

        document.querySelector('.btn--save-password').textContent = 'Updating ....'
        const currentPassword = document.getElementById('password-current').value
        const newPassword = document.getElementById('password').value
        const newPasswordConfirm = document.getElementById('password-confirm').value

        const datas = { currentPassword, newPassword, newPasswordConfirm }
        await updateData(datas, 'password')

        document.querySelector('.btn--save-password').textContent = 'Save password'
        document.getElementById('password-current').value = ''
        document.getElementById('password').value = ''
        document.getElementById('password-confirm').value = ''
    })
}

if (bookBtn) {

    bookBtn.addEventListener('click', e => {

        e.preventDefault();

        e.target.textContent = 'Processing...'
        const { tourId } = e.target.dataset;

        bookTour(tourId);

    })
}