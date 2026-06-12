const sesion =
JSON.parse(localStorage.getItem("usuarioActual"));

if (!sesion || sesion.rol !== "docente") {
    window.location.href = "../auth/login.html";
}

/* CLASES */
let clases =
JSON.parse(localStorage.getItem("clasesEduClass")) || [];

/* generar código único */
function generarCodigo() {

    const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let codigo = "";

    for (let i = 0; i < 6; i++) {

        codigo += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return codigo;
}

/* CREAR CLASE */
function crearClase() {

    const nombre =
    document.getElementById("nombreClase").value.trim();

    if (!nombre) return;

    const clase = {
        id: Date.now(),
        nombre,
        codigo: generarCodigo(),
        instituto: sesion.instituto,
        docenteId: sesion.id,
        fecha: new Date().toLocaleDateString()
    };

    clases.push(clase);

    localStorage.setItem(
        "clasesEduClass",
        JSON.stringify(clases)
    );

    renderClases();
}

/* MOSTRAR CLASES */
function renderClases() {

    const contenedor =
    document.getElementById("listaClases");

    contenedor.innerHTML = "";

    const misClases =
    clases.filter(c =>
        c.docenteId === sesion.id
    );

    misClases.forEach(c => {

        const div = document.createElement("div");

        div.className = "clase-card";

        div.innerHTML = `
            <h3>${c.nombre}</h3>
            <p>
                <i class="fa-solid fa-key"></i>
                Código: <b>${c.codigo}</b>
            </p>
        `;

        contenedor.appendChild(div);
    });
}

renderClases();

/* cerrar sesión */
function cerrarSesion() {

    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("sesionActiva");

    window.location.href = "../auth/login.html";
}