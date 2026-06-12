const sesion =
JSON.parse(localStorage.getItem("usuarioActual"));

if(!sesion){
    window.location.href = "auth/login.html";
}

document.getElementById("nombreUsuario").innerText =
sesion.nombre;

document.getElementById("rolUsuario").innerText =
sesion.rol;

// cerrar sesión
function cerrarSesion(){
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("sesionActiva");
    window.location.href = "auth/login.html";
}

// abrir/cerrar panel config
function toggleConfig(){
    document.getElementById("configPanel")
    .classList.toggle("active");
}