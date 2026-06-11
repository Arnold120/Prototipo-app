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

    const usuario = {

        nombre:
        document.getElementById("nombre").value,

        correo:
        document.getElementById("correo").value,

        instituto:
        document.getElementById("instituto").value,

        rol:
        document.getElementById("rol").value,

        password:
        document.getElementById("password").value
    };

    localStorage.setItem(
        "usuarioEduClass",
        JSON.stringify(usuario)
    );

    alert("Cuenta creada correctamente");

    window.location.href = "../index.html";
});