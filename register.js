const registerBtn = document.getElementById('registerBtn');
const message = document.getElementById('message');

registerBtn.addEventListener('click', ()=>{
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if(!name || !email || !password){
        message.textContent = "Please fill all fields";
        message.style.color = "red";
        return;
    }

    let users = JSON.parse(localStorage.getItem('users') || '[]');

    if(users.some(u=>u.email === email)){
        message.textContent = "Email already registered!";
        message.style.color = "red";
        return;
    }

    users.push({name, email, password});
    localStorage.setItem('users', JSON.stringify(users));
    message.textContent = "Registration successful!";
    message.style.color = "green";

    setTimeout(()=> window.location.href = "login.html", 1000);
});
