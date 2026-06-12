document.addEventListener('DOMContentLoaded', () => {
    const publicPages = ['auth/login.html', 'auth/signup.html'];
    const currentPage = window.location.pathname.split('/').pop();
    const currentFolder = window.location.pathname.includes('/auth/') ? 'auth' : '';
    
    const isPublicPage = publicPages.some(page => window.location.pathname.includes(page));
    
    if (!isPublicPage) {
        const user = localStorage.getItem('currentUser');
        if (!user) {
            window.location.href = 'auth/login.html';
        }
    }
});