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
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    console.log({
        email,
        password
    });

    alert("Inicio de sesión exitoso");
});