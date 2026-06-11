// scripts.js - Lógica de menú y carga de módulos
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'auth/login.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    
    // Configurar navegación
    setupNavigation();
    
    // Cargar el dashboard por defecto
    loadContent('dashboard');
});

function setupNavigation() {
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = btn.dataset.section;
            if (section === 'logout') {
                handleLogout();
            } else if (section) {
                loadContent(section);
                setActiveButton(btn);
            }
        });
    });
}

function loadContent(module) {
    const contentDiv = document.getElementById('dynamic-content');
    if (!contentDiv) return;
    
    // Mapeo de módulos a sus archivos
    const modules = {
        'dashboard': 'admin/dashboard/dashboard.html',
        'estudiantes': 'admin/estudiantes/estudiantes.html',
        'docentes': 'admin/docentes/docentes.html',
        'tareas': 'admin/tareas/tareas.html',
        'actividades': 'admin/actividades/actividades.html',
        'recursos': 'admin/recursos/recursos.html',
        'notificaciones': 'admin/notificaciones/notificaciones.html'
    };
    
    const url = modules[module];
    if (url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                contentDiv.innerHTML = html;
                // Cargar el CSS específico del módulo si existe
                loadModuleCSS(module);
                // Ejecutar el JS específico del módulo
                loadModuleJS(module);
            })
            .catch(error => {
                console.error('Error cargando módulo:', error);
                contentDiv.innerHTML = `<div class="alert alert-error">Error al cargar el contenido. Por favor, intenta de nuevo.</div>`;
            });
    }
}

function loadModuleCSS(module) {
    const cssMap = {
        'dashboard': 'admin/dashboard/dashboard.css',
        'estudiantes': 'admin/estudiantes/estudiantes.css',
        'docentes': 'admin/docentes/docentes.css',
        'tareas': 'admin/tareas/tareas.css',
        'actividades': 'admin/actividades/actividades.css',
        'recursos': 'admin/recursos/recursos.css',
        'notificaciones': 'admin/notificaciones/notificaciones.css'
    };
    
    const cssFile = cssMap[module];
    if (cssFile) {
        let link = document.querySelector(`link[data-module="${module}"]`);
        if (!link) {
            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.setAttribute('data-module', module);
            link.href = cssFile;
            document.head.appendChild(link);
        }
    }
}

function loadModuleJS(module) {
    const jsMap = {
        'dashboard': 'admin/dashboard/dashboard.js',
        'estudiantes': 'admin/estudiantes/estudiantes.js',
        'docentes': 'admin/docentes/docentes.js',
        'tareas': 'admin/tareas/tareas.js',
        'actividades': 'admin/actividades/actividades.js',
        'recursos': 'admin/recursos/recursos.js',
        'notificaciones': 'admin/notificaciones/notificaciones.js'
    };
    
    const jsFile = jsMap[module];
    if (jsFile) {
        // Remover script anterior si existe
        const oldScript = document.querySelector(`script[data-module="${module}"]`);
        if (oldScript) oldScript.remove();
        
        const script = document.createElement('script');
        script.src = jsFile;
        script.setAttribute('data-module', module);
        document.body.appendChild(script);
    }
}

function setActiveButton(activeBtn) {
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth/login.html';
}