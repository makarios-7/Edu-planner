
document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            let users = JSON.parse(localStorage.getItem('eduPlannerUsers')) || [];

            if (users.some(user => user.email === email)) {
                alert('This email is already registered.');
                return;
            }

            const newUser = {
                username,
                email,
                password 
            };
            users.push(newUser);
            localStorage.setItem('eduPlannerUsers', JSON.stringify(users));

            alert('Registration successful! Please log in.');
            window.location.href = 'login.html';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            let users = JSON.parse(localStorage.getItem('eduPlannerUsers')) || [];

            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('loggedInUser', JSON.stringify({ email: user.email, username: user.username }));
                alert('Login successful! Welcome back.');
                window.location.href = 'index.html'; 
            } else {
                alert('Invalid email or password.');
            }
        });
    }

    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && document.getElementById('userNameDisplay')) {
        document.getElementById('userNameDisplay').textContent = loggedInUser.username;
        document.getElementById('userEmailDisplay').textContent = loggedInUser.email;
    }

});