const passwordInput =
document.getElementById("password");

const togglePassword =
document.getElementById("togglePassword");

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

    const usuarios =
    JSON.parse(
        localStorage.getItem("usuariosEduClass")
    ) || [];

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