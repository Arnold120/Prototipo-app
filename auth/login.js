const passwordInput =
document.getElementById("password");

const togglePassword =
document.getElementById("togglePassword");

/* Toggle password visibility */
if (togglePassword && passwordInput) {

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
}

/* Modal system */
function mostrarModal({
    titulo,
    mensaje,
    icono = "fa-solid fa-circle-info",
    mostrarRegistro = false,
    tipo = "info"
}) {

    const modal =
        document.getElementById("modalMensaje");

    const tituloModal =
        document.getElementById("tituloMensaje");

    const textoModal =
        document.getElementById("textoMensaje");

    const iconoModal =
        document.getElementById("iconoMensaje");

    const btnRegistro =
        document.getElementById("btnRegistro");

    if (!modal) return;

    tituloModal.textContent = titulo;
    textoModal.textContent = mensaje;
    iconoModal.innerHTML = `<i class="${icono}"></i>`;

    btnRegistro.style.display =
        mostrarRegistro ? "inline-flex" : "none";

    modal.classList.add("show");

    const contenido =
        modal.querySelector(".modal-contenido");

    if (contenido) {

        contenido.classList.remove(
            "success",
            "error",
            "info"
        );

        contenido.classList.add(tipo);
    }
}

/* Close modal */
const btnCerrar =
document.getElementById("btnCerrar");

if (btnCerrar) {

    btnCerrar.addEventListener("click", () => {

        document
        .getElementById("modalMensaje")
        .classList.remove("show");
    });
}

/* Go to register */
const btnRegistro =
document.getElementById("btnRegistro");

if (btnRegistro) {

    btnRegistro.addEventListener("click", () => {

        window.location.href =
            "signup.html";
    });
}

/* Login system */
const loginForm =
document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", (e) => {

        e.preventDefault();

        const email =
            document.getElementById("email")
            .value.trim();

        const password =
            document.getElementById("password")
            .value.trim();

        const usuarios =
            JSON.parse(
                localStorage.getItem(
                    "usuariosEduClass"
                )
            ) || [];

        const usuario =
            usuarios.find(u =>
                u.correo.toLowerCase() ===
                email.toLowerCase()
            );

        /* Usuario no existe */
        if (!usuario) {

            mostrarModal({
                titulo: "Cuenta no encontrada",
                mensaje:
                    "No encontramos ninguna cuenta asociada a este correo. ¿Quieres crear una ahora y empezar a usar EduClass?",
                icono: "fa-solid fa-user-plus",
                mostrarRegistro: true,
                tipo: "error"
            });

            return;
        }

        /* Password incorrecta */
        if (usuario.password !== password) {

            mostrarModal({
                titulo: "Contraseña incorrecta",
                mensaje:
                    "La contraseña no coincide con nuestra base de datos. Intenta nuevamente.",
                icono: "fa-solid fa-lock",
                tipo: "error"
            });

            return;
        }

        /* Save session */
        localStorage.setItem(
            "usuarioActual",
            JSON.stringify(usuario)
        );

        localStorage.setItem(
            "sesionActiva",
            "true"
        );

        /* Success modal */
        mostrarModal({
            titulo: "Bienvenido a EduClass",
            mensaje:
                `Hola ${usuario.nombre}, tu sesión ha iniciado correctamente.`,
            icono: "fa-solid fa-circle-check",
            tipo: "success"
        });

        /* Redirect by role */
        setTimeout(() => {

            if (
                usuario.rol &&
                usuario.rol.toLowerCase() === "docente"
            ) {

                window.location.href =
                    "../docente/index.html";

            } else {

                window.location.href =
                    "../index.html";
            }

        }, 1600);
    });
}