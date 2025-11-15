
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1);

    const protectedPages = ['index.html', 'task.html', 'projects.html', 'calendar.html', 'profile.html'];
    
    const authPages = ['login.html', 'register.html'];

    const loggedInUser = localStorage.getItem('loggedInUser');

    

    if (protectedPages.includes(currentPage) && !loggedInUser) {
        if (currentPage === 'index.html' || currentPage === '') {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'login.html';
        }
        return; 
    }

    if (authPages.includes(currentPage) && loggedInUser) {
        window.location.href = 'index.html';
        return;
    }
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const navLinks = navbar.querySelector('.nav-links');
        const toggleThemeBtn = document.getElementById('toggle-theme');

        if (loggedInUser) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none'; 
            if (toggleThemeBtn) {
                toggleThemeBtn.style.display = 'none';
            }
        }
    }
});
window.logoutUser = function() {
    localStorage.removeItem('loggedInUser');
    alert('Logged out successfully.');
    window.location.href = 'login.html';
};