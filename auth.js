// auth.js - Protección de rutas
document.addEventListener('DOMContentLoaded', () => {
    // Lista de páginas que no requieren autenticación
    const publicPages = ['auth/login.html', 'auth/signup.html'];
    const currentPage = window.location.pathname.split('/').pop();
    const currentFolder = window.location.pathname.includes('/auth/') ? 'auth' : '';
    
    // Verificar si estamos en una página pública
    const isPublicPage = publicPages.some(page => window.location.pathname.includes(page));
    
    if (!isPublicPage) {
        const user = localStorage.getItem('currentUser');
        if (!user) {
            window.location.href = 'auth/login.html';
        }
    }
});