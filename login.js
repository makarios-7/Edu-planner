const loginBtn = document.getElementById('loginBtn');
const message = document.getElementById('message');

loginBtn.addEventListener('click', ()=>{
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u=>u.email === email && u.password === password);

    if(user){
        localStorage.setItem('currentUser', JSON.stringify(user));
        message.textContent = "Login successful!";
        message.style.color = "green";
        setTimeout(()=> window.location.href = "index.html", 1000);
    } else {
        message.textContent = "Invalid email or password!";
        message.style.color = "red";
    }
});
