const sesion =
JSON.parse(
    localStorage.getItem(
        "usuarioActual"
    )
);

const sesionActiva =
localStorage.getItem(
    "sesionActiva"
);

if (!sesion || !sesionActiva) {

    window.location.href =
        "auth/login.html";
}

/* Verificar rol */

if (
    sesion.rol &&
    sesion.rol.toLowerCase() ===
    "docente"
) {

    window.location.href =
        "./docente/index.html";
}

/* Datos usuario */

document.getElementById(
    "nombreUsuario"
).textContent =
    sesion.nombre;

document.getElementById(
    "rolUsuario"
).textContent =
    sesion.rol;

/* Saludo dinámico */

const hora =
new Date().getHours();

let saludo =
"Bienvenido";

if (hora < 12) {

    saludo =
    "Buenos días";

} else if (hora < 18) {

    saludo =
    "Buenas tardes";

} else {

    saludo =
    "Buenas noches";
}

const titulo =
document.querySelector(
    ".welcome h1"
);

if (titulo) {

    titulo.innerHTML = `
        <i class="fa-solid fa-graduation-cap"></i>
        ${saludo}, ${sesion.nombre}
    `;
}

/* Panel configuración */

function toggleConfig() {

    document
    .getElementById(
        "configPanel"
    )
    .classList.toggle(
        "active"
    );
}

/* Cerrar tocando fuera */

document.addEventListener(
    "click",
    e => {

        const panel =
        document.getElementById(
            "configPanel"
        );

        const boton =
        document.querySelector(
            ".menu-toggle"
        );

        if (
            panel.classList.contains(
                "active"
            ) &&
            !panel.contains(
                e.target
            ) &&
            !boton.contains(
                e.target
            )
        ) {

            panel.classList.remove(
                "active"
            );
        }
    }
);

/* Cerrar sesión */

function cerrarSesion() {

    localStorage.removeItem(
        "usuarioActual"
    );

    localStorage.removeItem(
        "sesionActiva"
    );

    window.location.href =
        "auth/login.html";
}

/* Tareas */

const tareas =
JSON.parse(
    localStorage.getItem(
        "tareasEduClass"
    )
) || [];

const listaPendientes =
document.getElementById(
    "listaPendientes"
);

const listaEntregadas =
document.getElementById(
    "listaEntregadas"
);

function cargarTareas() {

    if (
        !listaPendientes ||
        !listaEntregadas
    ) return;

    listaPendientes.innerHTML =
        "";

    listaEntregadas.innerHTML =
        "";

    let pendientes = 0;
    let entregadas = 0;

    tareas.forEach(
        tarea => {

            const card =
            document.createElement(
                "div"
            );

            card.className =
            "tarea-card";

            card.innerHTML = `
                <h4>
                    ${tarea.titulo}
                </h4>

                <p>
                    ${tarea.descripcion}
                </p>
            `;

            if (
                tarea.entregada
            ) {

                listaEntregadas
                .appendChild(
                    card
                );

                entregadas++;

            } else {

                listaPendientes
                .appendChild(
                    card
                );

                pendientes++;
            }
        }
    );

    const cp =
    document.getElementById(
        "contadorPendientes"
    );

    const ce =
    document.getElementById(
        "contadorEntregadas"
    );

    if (cp) {

        cp.textContent =
        `${pendientes} tareas pendientes`;
    }

    if (ce) {

        ce.textContent =
        `${entregadas} tareas entregadas`;
    }
}

cargarTareas();

/* Buscador */

const buscador =
document.getElementById(
    "buscarTarea"
);

if (buscador) {

    buscador.addEventListener(
        "input",
        e => {

            const texto =
            e.target.value
            .toLowerCase();

            document
            .querySelectorAll(
                ".tarea-card"
            )
            .forEach(
                card => {

                    const contenido =
                    card.textContent
                    .toLowerCase();

                    card.style.display =
                    contenido.includes(
                        texto
                    )
                        ? "block"
                        : "none";
                }
            );
        }
    );
}

/* =========================================================
   SISTEMA DE MATRICULACIÓN POR INSTITUTO (NUEVO)
========================================================= */

/* usuarios del sistema */
const usuariosEdu =
JSON.parse(
    localStorage.getItem("usuariosEduClass")
) || [];

/* matriculas guardadas */
let matriculasEdu =
JSON.parse(
    localStorage.getItem("matriculasEduClass")
) || [];

/* solo docentes del mismo instituto */
const docentesInstituto =
usuariosEdu.filter(u =>
    u.rol &&
    u.rol.toLowerCase() === "docente" &&
    u.instituto === sesion.instituto
);

/* =========================
   MODAL SIMPLE (SIN ALERT)
========================= */
function mostrarMensaje(texto, tipo = "info") {

    let modal =
    document.getElementById("modalEdu");

    if (!modal) {

        modal = document.createElement("div");
        modal.id = "modalEdu";
        modal.innerHTML = `
            <div class="modal-edu ${tipo}">
                <i class="fa-solid fa-circle-check"></i>
                <p id="textoModalEdu"></p>
            </div>
        `;

        document.body.appendChild(modal);
    }

    document.getElementById("textoModalEdu").textContent = texto;

    modal.classList.add("show");

    setTimeout(() => {
        modal.classList.remove("show");
    }, 2500);
}

/* =========================
   CREAR LISTA DE DOCENTES
   (REQUIERE <div id="listaDocentes"></div>)
========================= */
function cargarDocentes() {

    const contenedor =
    document.getElementById("listaDocentes");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (docentesInstituto.length === 0) {

        contenedor.innerHTML = `
            <p>No hay docentes registrados en tu instituto.</p>
        `;

        return;
    }

    docentesInstituto.forEach(docente => {

        const yaMatriculado =
        matriculasEdu.find(m =>
            m.docenteId === docente.id &&
            m.estudianteId === sesion.id
        );

        const card =
        document.createElement("div");

        card.className = "docente-card";

        card.innerHTML = `
            <div>
                <h4>
                    <i class="fa-solid fa-chalkboard-user"></i>
                    ${docente.nombre}
                </h4>
                <small>${docente.instituto}</small>
            </div>

            <button class="btn-matricular">
                ${
                    yaMatriculado
                    ? '<i class="fa-solid fa-check"></i> Matriculado'
                    : '<i class="fa-solid fa-plus"></i> Matricularme'
                }
            </button>
        `;

        const btn =
        card.querySelector("button");

        if (!yaMatriculado) {

            btn.addEventListener("click", () => {

                matriculasEdu.push({
                    id: Date.now(),
                    estudianteId: sesion.id,
                    docenteId: docente.id,
                    instituto: sesion.instituto,
                    fecha: new Date().toLocaleDateString()
                });

                localStorage.setItem(
                    "matriculasEduClass",
                    JSON.stringify(matriculasEdu)
                );

                mostrarMensaje(
                    "Te has matriculado correctamente a la clase",
                    "success"
                );

                cargarDocentes();
            });
        }

        contenedor.appendChild(card);
    });
}

/* cargar docentes al inicio */
cargarDocentes();

/* =========================================================
   FIN SISTEMA NUEVO
========================================================= */