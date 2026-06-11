const form = document.getElementById("signupForm");

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

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const nombre =
    document.getElementById("nombre")
    .value.trim();

    const correo =
    document.getElementById("correo")
    .value.trim();

    const instituto =
    document.getElementById("instituto")
    .value.trim();

    const rol =
    document.getElementById("rol")
    .value;

    const password =
    document.getElementById("password")
    .value.trim();

    if (
        !nombre ||
        !correo ||
        !instituto ||
        !rol ||
        !password
    ) {
        alert(
            "Complete todos los campos."
        );
        return;
    }

    const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(correo)) {

        alert(
            "Ingrese un correo válido."
        );

        return;
    }

    if (password.length < 6) {

        alert(
            "La contraseña debe tener al menos 6 caracteres."
        );

        return;
    }

    const usuarios =
    JSON.parse(
        localStorage.getItem("usuariosEduClass")
    ) || [];

    const existeUsuario =
    usuarios.find(
        usuario =>
        usuario.correo.toLowerCase() ===
        correo.toLowerCase()
    );

    if (existeUsuario) {

        alert(
            "Ya existe una cuenta registrada con este correo."
        );

        return;
    }

    const nuevoUsuario = {
        id: Date.now(),
        nombre,
        correo,
        instituto,
        rol,
        password,
        fechaRegistro:
        new Date().toLocaleDateString()
    };

    usuarios.push(nuevoUsuario);

    localStorage.setItem(
        "usuariosEduClass",
        JSON.stringify(usuarios)
    );

    localStorage.setItem(
        "usuarioActual",
        JSON.stringify(nuevoUsuario)
    );

    localStorage.setItem(
        "sesionActiva",
        "true"
    );

    alert(
        `Bienvenido a EduClass, ${nombre}`
    );

    window.location.href =
    "../index.html";
});