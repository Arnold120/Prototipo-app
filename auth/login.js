const passwordInput =
document.getElementById("password");

const togglePassword =
document.getElementById("togglePassword");

// Mostrar/Ocultar contraseña
togglePassword.addEventListener("click", () => {

    const type =
    passwordInput.type === "password"
    ? "text"
    : "password";

    passwordInput.type = type;

    togglePassword.innerHTML =
    type === "password"
    ? '<i class="fa-solid fa-eye"></i>'
    : '<i class="fa-solid fa-eye-slash"></i>';
});

// Login
document
.getElementById("loginForm")
.addEventListener("submit", (e) => {

    e.preventDefault();

    const email =
    document.getElementById("email")
    .value.trim();

    const password =
    document.getElementById("password")
    .value.trim();

    // Obtener todos los usuarios
    const usuarios =
    JSON.parse(
        localStorage.getItem("usuariosEduClass")
    ) || [];

    // Buscar usuario
    const usuarioEncontrado =
    usuarios.find(usuario =>
        usuario.correo.toLowerCase() ===
        email.toLowerCase() &&
        usuario.password === password
    );

    if (!usuarioEncontrado) {

        alert(
            "Correo o contraseña incorrectos."
        );

        return;
    }

    // Guardar sesión
    localStorage.setItem(
        "usuarioActual",
        JSON.stringify(usuarioEncontrado)
    );

    localStorage.setItem(
        "sesionActiva",
        "true"
    );

    alert(
        `Bienvenido ${usuarioEncontrado.nombre}`
    );

    window.location.href =
    "../index.html";
});