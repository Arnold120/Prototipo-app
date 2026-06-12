const form =
document.getElementById("signupForm");

const passwordInput =
document.getElementById("password");

const togglePassword =
document.getElementById("togglePassword");

/* ======================
   TOGGLE PASSWORD
====================== */
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

/* ======================
   INSTITUTOS AUTOCOMPLETE
====================== */
const institutos = [
    "Centro Escolar José Martí",
    "Colegio Santa Rosa de Lima",
    "Colegio Génesis",
    "Instituto Nac. Ramón Matus Acevedo",
    "Colegio San José",
    "Instituto Nacional Manuel Hernández Martínez",
    "Instituto Nacional Juan José Rodríguez",
    "Academia de Santa María",
    "Centro Escolar Pedro Joaquín Chamorro",
    "Colegio Corazón de María",
    "Colegio Cristiano Rubén Darío",
    "Escuela Nueva Esperanza",
    "Colegio Central de Nicaragua",
    "Centro Escolar El Guabillo"
];

const inputInstituto =
document.getElementById("institutoInput");

const listaInstitutos =
document.getElementById("listaInstitutos");

if (inputInstituto && listaInstitutos) {

    inputInstituto.addEventListener("input", () => {

        const valor =
        inputInstituto.value.toLowerCase();

        listaInstitutos.innerHTML = "";

        if (!valor) {

            listaInstitutos.style.display = "none";
            return;
        }

        const filtrados =
        institutos.filter(i =>
            i.toLowerCase().includes(valor)
        );

        if (filtrados.length === 0) {

            listaInstitutos.style.display = "none";
            return;
        }

        filtrados.forEach(nombre => {

            const item =
            document.createElement("div");

            item.classList.add("autocomplete-item");

            item.textContent = nombre;

            item.addEventListener("click", () => {

                inputInstituto.value = nombre;

                listaInstitutos.innerHTML = "";
                listaInstitutos.style.display = "none";
            });

            listaInstitutos.appendChild(item);
        });

        listaInstitutos.style.display = "block";
    });

    document.addEventListener("click", (e) => {

        if (!e.target.closest(".autocomplete")) {

            listaInstitutos.style.display = "none";
        }
    });
}

/* ======================
   MODAL SYSTEM
====================== */
function mostrarModal({
    titulo,
    mensaje,
    icono = "fa-solid fa-circle-info",
    tipo = "info"
}) {

    const modal =
    document.getElementById("modalMensaje");

    if (!modal) return;

    document.getElementById("tituloMensaje")
        .textContent = titulo;

    document.getElementById("textoMensaje")
        .textContent = mensaje;

    document.getElementById("iconoMensaje")
        .innerHTML = `<i class="${icono}"></i>`;

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

/* ======================
   CLOSE MODAL
====================== */
const btnCerrar =
document.getElementById("btnCerrar");

if (btnCerrar) {

    btnCerrar.addEventListener("click", () => {

        document
        .getElementById("modalMensaje")
        .classList.remove("show");
    });
}

/* ======================
   FORM SUBMIT
====================== */
if (form) {

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const nombre =
        document.getElementById("nombre")
        .value.trim();

        const correo =
        document.getElementById("correo")
        .value.trim();

        const instituto =
        document.getElementById("institutoInput")
        .value.trim();

        const rol =
        document.getElementById("rol")
        .value;

        const password =
        passwordInput.value.trim();

        /* Validaciones */
        if (!nombre || !correo || !instituto || !rol || !password) {

            return mostrarModal({
                titulo: "Campos incompletos",
                mensaje: "Debes completar todos los campos para continuar.",
                icono: "fa-solid fa-triangle-exclamation",
                tipo: "error"
            });
        }

        const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(correo)) {

            return mostrarModal({
                titulo: "Correo inválido",
                mensaje: "Ingresa un correo electrónico válido.",
                icono: "fa-solid fa-envelope",
                tipo: "error"
            });
        }

        if (password.length < 6) {

            return mostrarModal({
                titulo: "Contraseña débil",
                mensaje: "La contraseña debe tener al menos 6 caracteres.",
                icono: "fa-solid fa-lock",
                tipo: "error"
            });
        }

        const usuarios =
        JSON.parse(
            localStorage.getItem("usuariosEduClass")
        ) || [];

        const existeUsuario =
        usuarios.find(u =>
            u.correo.toLowerCase() === correo.toLowerCase()
        );

        if (existeUsuario) {

            return mostrarModal({
                titulo: "Cuenta existente",
                mensaje: "Ya existe una cuenta con este correo electrónico.",
                icono: "fa-solid fa-user-xmark",
                tipo: "error"
            });
        }

        /* Crear usuario */
        const nuevoUsuario = {
            id: Date.now(),
            nombre,
            correo,
            instituto,
            rol,
            password,
            fechaRegistro: new Date().toLocaleDateString()
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

        mostrarModal({
            titulo: "Registro exitoso",
            mensaje: `¡Bienvenido a EduClass, ${nombre}!`,
            icono: "fa-solid fa-circle-check",
            tipo: "success"
        });

        setTimeout(() => {

            window.location.href =
                nuevoUsuario.rol.toLowerCase() === "docente"
                    ? "../docente/index.html"
                    : "../index.html";

        }, 1800);
    });
}