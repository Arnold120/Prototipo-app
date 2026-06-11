const passwordInput =
document.getElementById("password");

const togglePassword =
document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    const type =
    passwordInput.getAttribute("type") === "password"
    ? "text"
    : "password";

    passwordInput.setAttribute("type", type);

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
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value.trim();

    const usuarioGuardado =
    JSON.parse(
        localStorage.getItem("usuarioEduClass")
    );

    if (!usuarioGuardado) {

        alert("No existe ninguna cuenta registrada.");

        return;
    }

    if (
        usuarioGuardado.correo === email &&
        usuarioGuardado.password === password
    ) {

        localStorage.setItem(
            "sesionActiva",
            "true"
        );

        alert(
            `Bienvenido ${usuarioGuardado.nombre}`
        );

        window.location.href =
        "../index.html";

    } else {

        alert(
            "Correo o contraseña incorrectos."
        );
    }
});