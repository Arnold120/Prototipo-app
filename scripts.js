// ==================== CONFIGURACIÓN DE IMÁGENES PREDETERMINADAS ====================
const DEFAULT_AVATAR = "./images/avatar.png";
const DEFAULT_GROUP_AVATAR = "./images/avatar.png";

let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
if (!usuarioActual || usuarioActual.rol !== "estudiante") window.location.href = "auth/login.html";

let grupos = JSON.parse(localStorage.getItem("gruposDocente")) || [];
let trabajos = JSON.parse(localStorage.getItem("trabajosDocente")) || [];
let matriculas = JSON.parse(localStorage.getItem("matriculasEduClass")) || [];
let entregas = JSON.parse(localStorage.getItem("entregasEstudiante")) || [];
let mensajes = JSON.parse(localStorage.getItem("mensajesEduClass")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuariosEduClass")) || [];
let avatares = JSON.parse(localStorage.getItem("avataresUsuarios")) || {};
let grupoAvatares = JSON.parse(localStorage.getItem("grupoAvatares")) || {};

if (!usuarios.find(u => u.id === usuarioActual.id)) usuarios.push(usuarioActual);

function guardarTodo() {
    localStorage.setItem("gruposDocente", JSON.stringify(grupos));
    localStorage.setItem("trabajosDocente", JSON.stringify(trabajos));
    localStorage.setItem("matriculasEduClass", JSON.stringify(matriculas));
    localStorage.setItem("entregasEstudiante", JSON.stringify(entregas));
    localStorage.setItem("mensajesEduClass", JSON.stringify(mensajes));
    localStorage.setItem("usuariosEduClass", JSON.stringify(usuarios));
    localStorage.setItem("avataresUsuarios", JSON.stringify(avatares));
    localStorage.setItem("grupoAvatares", JSON.stringify(grupoAvatares));
}

function getMisGrupos() { return grupos.filter(g => matriculas.some(m => m.estudianteId === usuarioActual.id && m.grupoId === g.id)); }

function getMisTareas() {
    let misGruposIds = getMisGrupos().map(g => g.id);
    return trabajos.filter(t => misGruposIds.includes(t.grupoId)).map(t => ({
        ...t,
        entregada: entregas.some(e => e.trabajoId === t.id && e.estudianteId === usuarioActual.id),
        nota: entregas.find(e => e.trabajoId === t.id && e.estudianteId === usuarioActual.id)?.nota || null
    }));
}

function getAvatarUrl(userId) { return avatares[userId] || DEFAULT_AVATAR; }
function getGrupoAvatarUrl(grupoId) { return grupoAvatares[grupoId] || DEFAULT_GROUP_AVATAR; }

function mostrarToast(texto, tipo) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast-mensaje"; document.body.appendChild(t); }
    t.innerHTML = `<i class="fa-solid fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${texto}`;
    t.className = `toast-mensaje ${tipo} show`;
    setTimeout(() => t.classList.remove("show"), 2500);
}

function actualizarContadores() {
    let tareas = getMisTareas();
    document.getElementById("totalPendientes").innerText = tareas.filter(t => !t.entregada).length;
    document.getElementById("totalEntregadas").innerText = tareas.filter(t => t.entregada).length;
    document.getElementById("totalClases").innerText = getMisGrupos().length;
    document.getElementById("totalMensajes").innerText = mensajes.filter(m => m.paraId === usuarioActual.id && !m.leido).length;
}

function renderizarTareas() {
    let tareas = getMisTareas();
    let pendientes = tareas.filter(t => !t.entregada);
    let entregadasList = tareas.filter(t => t.entregada);
    const render = (t, isPendiente) => `<div class="tarea-card ${t.entregada ? 'entregada' : ''}"><div class="tarea-header"><span class="tarea-titulo"><i class="fa-solid fa-file-alt"></i> ${escapeHtml(t.titulo)}</span><span class="badge-grupo">${escapeHtml(t.grupoNombre)}</span></div><div class="tarea-desc">${escapeHtml(t.descripcion || "Sin descripción")}</div><div class="tarea-footer"><span class="fecha-entrega"><i class="fa-regular fa-calendar"></i> ${t.fechaEntrega || "Sin fecha"}</span>${isPendiente ? `<button class="btn-unirse btn-entregar" onclick="marcarEntregada(${t.id})"><i class="fa-solid fa-check"></i> Entregar</button>` : '<span style="color:#10b981"><i class="fa-solid fa-check-circle"></i> Entregada</span>'}</div></div>`;
    document.getElementById("listaPendientes").innerHTML = pendientes.length ? pendientes.map(t => render(t, true)).join("") : '<div class="empty-message"><i class="fa-regular fa-clock"></i><p>No hay tareas pendientes</p></div>';
    document.getElementById("listaTareasCompletas").innerHTML = [...pendientes, ...entregadasList].length ? [...pendientes, ...entregadasList].map(t => render(t, !t.entregada)).join("") : '<div class="empty-message"><i class="fa-regular fa-file"></i><p>No hay tareas</p><button class="btn-unirse" onclick="abrirModalUnirse()">Unirse a clase</button></div>';
    actualizarContadores();
}

function renderizarClases() {
    let misGrupos = getMisGrupos();
    document.getElementById("listaClases").innerHTML = misGrupos.length ? misGrupos.map(g => `<div class="grupo-card"><img src="${getGrupoAvatarUrl(g.id)}" class="chat-avatar-list" onerror="this.src='${DEFAULT_GROUP_AVATAR}'"><div class="card-info-flex"><div class="grupo-nombre"><i class="fa-solid fa-chalkboard"></i> ${escapeHtml(g.nombre)}</div><div class="grupo-desc">${escapeHtml(g.descripcion || "Sin descripción")}</div><div class="grupo-footer"><span><i class="fa-solid fa-code"></i> Código: ${g.codigo}</span><button class="btn-primary" style="padding:4px 12px; font-size:11px" onclick="abrirChat('docente_${g.docenteId}', '${escapeHtml(g.nombre)} (Docente)', false, null)"><i class="fa-regular fa-comment"></i> Contactar</button></div></div></div>`).join("") : '<div class="empty-message"><i class="fa-regular fa-folder-open"></i><p>No hay clases</p><button class="btn-unirse" onclick="abrirModalUnirse()">Unirse</button></div>';
}

function renderizarNotas() {
    let tareas = getMisTareas().filter(t => t.entregada && t.nota !== null);
    document.getElementById("listaNotas").innerHTML = tareas.length ? tareas.map(t => `<div class="tarea-card"><div class="tarea-header"><span class="tarea-titulo"><i class="fa-solid fa-file-alt"></i> ${escapeHtml(t.titulo)}</span><span class="badge-grupo">${escapeHtml(t.grupoNombre)}</span></div><div class="tarea-footer"><span class="badge-nota"><i class="fa-solid fa-star"></i> ${t.nota}/10</span><span class="fecha-entrega">${t.fechaEntrega || ""}</span></div></div>`).join("") : '<div class="empty-message"><i class="fa-regular fa-star"></i><p>Aún no hay calificaciones</p></div>';
}

function renderizarChats() {
    let contactosMap = new Map();
    getMisGrupos().forEach(g => {
        if (g.docenteId) {
            let docente = usuarios.find(u => u.id === g.docenteId);
            if (docente && !contactosMap.has(`docente_${docente.id}`)) {
                contactosMap.set(`docente_${docente.id}`, { 
                    id: `docente_${docente.id}`, 
                    nombre: `${docente.nombre} (Docente)`, 
                    tipo: "docente", 
                    realId: docente.id,
                    avatar: getAvatarUrl(docente.id)
                });
            }
        }
        contactosMap.set(`grupo_${g.id}`, { 
            id: `grupo_${g.id}`, 
            nombre: `📢 ${g.nombre} (Grupo)`, 
            tipo: "grupo", 
            grupoId: g.id, 
            esGrupo: true,
            avatar: getGrupoAvatarUrl(g.id)
        });
    });
    document.getElementById("listaChats").innerHTML = Array.from(contactosMap.values()).map(c => `<div class="chat-card" onclick="abrirChat('${c.id}', '${escapeHtml(c.nombre)}', ${c.esGrupo || false}, ${c.grupoId || null}, '${c.tipo === 'docente' ? c.realId : null}')">
        <img src="${c.avatar}" class="chat-avatar-list" onerror="this.src='${DEFAULT_AVATAR}'">
        <div class="card-info-flex">
            <div class="grupo-nombre">${escapeHtml(c.nombre)}</div>
            <div style="font-size:11px; color:#64748b">${c.esGrupo ? "Grupo" : "Docente"}</div>
        </div>
    </div>`).join("") || '<div class="empty-message"><i class="fa-regular fa-comment"></i><p>No hay conversaciones disponibles</p></div>';
}

let chatActual = { id: null, nombre: "", esGrupo: false, grupoId: null, contactoId: null };

function abrirChat(id, nombre, esGrupo, grupoId, contactoId) {
    chatActual = { id, nombre, esGrupo, grupoId, contactoId: contactoId || (id.startsWith('docente_') ? parseInt(id.split('_')[1]) : null) };
    document.getElementById("chatTitulo").innerHTML = `<i class="fa-regular fa-comment"></i> Chat con ${escapeHtml(nombre)}`;
    
    let mensajesChat;
    if (esGrupo) mensajesChat = mensajes.filter(m => m.grupoId === grupoId);
    else mensajesChat = mensajes.filter(m => (m.deId === usuarioActual.id && m.paraId === chatActual.contactoId) || (m.deId === chatActual.contactoId && m.paraId === usuarioActual.id));
    mensajesChat.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    let html = mensajesChat.map(m => {
        let esPropio = m.deId === usuarioActual.id;
        let usuario = usuarios.find(u => u.id === m.deId);
        let nombreUsuario = usuario?.nombre || "Desconocido";
        let rolUsuario = usuario?.rol === "estudiante" ? " (Estudiante)" : (usuario?.rol === "docente" ? " (Docente)" : "");
        let nombreMostrar = esPropio ? 'Tú' : `${nombreUsuario}${rolUsuario}`;
        let avatarUrl = getAvatarUrl(m.deId);
        return `<div class="chat-mensaje" style="flex-direction: ${esPropio ? 'row-reverse' : 'row'}">
                    <img src="${avatarUrl}" class="chat-avatar" onerror="this.src='${DEFAULT_AVATAR}'">
                    <div class="chat-burbuja ${esPropio ? 'chat-burbuja-propio' : ''}">
                        <div class="chat-nombre">${escapeHtml(nombreMostrar)}</div>
                        <div class="chat-texto" style="${esPropio ? 'background:#2563eb; color:white' : 'background:#e2e8f0'}">${escapeHtml(m.texto)}</div>
                        <div class="chat-hora">${new Date(m.fecha).toLocaleTimeString()}</div>
                    </div>
                </div>`;
    }).join("");
    
    document.getElementById("chatMensajesArea").innerHTML = html || '<div style="text-align:center; padding:40px; color:#94a3b8">No hay mensajes aún. ¡Envía el primero!</div>';
    document.getElementById("modalChatOverlay").style.display = "flex";
    
    if (!esGrupo && chatActual.contactoId) {
        mensajes.filter(m => m.deId === chatActual.contactoId && m.paraId === usuarioActual.id).forEach(m => { m.leido = true; });
    }
    guardarTodo();
    setTimeout(() => { document.getElementById("chatMensajesArea").scrollTop = document.getElementById("chatMensajesArea").scrollHeight; }, 100);
}

function enviarMensaje() {
    let texto = document.getElementById("mensajeTexto").value.trim();
    if (!texto || !chatActual.id) return;
    let nuevoMensaje = { id: Date.now(), deId: usuarioActual.id, texto, fecha: new Date().toISOString(), leido: false };
    if (chatActual.esGrupo) { nuevoMensaje.grupoId = chatActual.grupoId; nuevoMensaje.esGrupo = true; }
    else nuevoMensaje.paraId = chatActual.contactoId;
    mensajes.push(nuevoMensaje);
    guardarTodo();
    document.getElementById("mensajeTexto").value = "";
    abrirChat(chatActual.id, chatActual.nombre, chatActual.esGrupo, chatActual.grupoId, chatActual.contactoId);
    mostrarToast("Mensaje enviado", "success");
}

function cerrarModalChat() { document.getElementById("modalChatOverlay").style.display = "none"; chatActual = { id: null, nombre: "", esGrupo: false, grupoId: null, contactoId: null }; }

function cambiarAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            avatares[usuarioActual.id] = e.target.result;
            guardarTodo();
            document.getElementById("avatarImg").src = e.target.result;
            renderizarChats();
            renderizarClases();
            mostrarToast("Foto de perfil actualizada", "success");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function marcarEntregada(trabajoId) {
    if (!entregas.some(e => e.trabajoId === trabajoId && e.estudianteId === usuarioActual.id)) {
        entregas.push({ id: Date.now(), trabajoId, estudianteId: usuarioActual.id, fecha: new Date().toISOString() });
        guardarTodo();
        renderizarTareas();
        mostrarToast("¡Tarea entregada!", "success");
    }
}

function unirseAClase() {
    let codigo = document.getElementById("codigoClase").value.trim().toUpperCase();
    if (!codigo || codigo.length !== 6) { mostrarToast("Código inválido", "error"); return; }
    let grupo = grupos.find(g => g.codigo === codigo);
    if (!grupo) { mostrarToast("Código no encontrado", "error"); return; }
    if (matriculas.some(m => m.estudianteId === usuarioActual.id && m.grupoId === grupo.id)) {
        mostrarToast("Ya estás en esta clase", "error");
        cerrarModalUnirse();
        return;
    }
    matriculas.push({ id: Date.now(), estudianteId: usuarioActual.id, grupoId: grupo.id, fecha: new Date().toISOString() });
    if (!grupo.estudiantes) grupo.estudiantes = [];
    if (!grupo.estudiantes.includes(usuarioActual.id)) grupo.estudiantes.push(usuarioActual.id);
    guardarTodo();
    mostrarToast(`Unido a "${grupo.nombre}"`, "success");
    cerrarModalUnirse();
    renderizarClases();
    renderizarTareas();
    renderizarChats();
}

function cambiarSeccion(sectionId) {
    document.querySelectorAll(".dashboard").forEach(sec => sec.classList.remove("active-section"));
    document.getElementById(sectionId).classList.add("active-section");
    document.querySelectorAll(".menu a, .bottom-nav a").forEach(link => { link.classList.toggle("active", link.getAttribute("data-section") === sectionId); });
    if (window.innerWidth <= 768) cerrarSidebar();
    if (sectionId === "chat") renderizarChats();
    if (sectionId === "notas") renderizarNotas();
}

function toggleSidebar() { document.getElementById("mainSidebar").classList.add("mobile-open"); document.getElementById("sidebarOverlay").classList.add("active"); }
function cerrarSidebar() { document.getElementById("mainSidebar").classList.remove("mobile-open"); document.getElementById("sidebarOverlay").classList.remove("active"); }
function cerrarSesion() { localStorage.removeItem("usuarioActual"); localStorage.removeItem("sesionActiva"); window.location.href = "auth/login.html"; }
function abrirModalUnirse() { document.getElementById("modalUnirseOverlay").style.display = "flex"; document.getElementById("codigoClase").value = ""; }
function cerrarModalUnirse() { document.getElementById("modalUnirseOverlay").style.display = "none"; }
function escapeHtml(str) { if (!str) return ""; return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : (m === '<' ? '&lt;' : '&gt;')); }

function cargarPerfil() {
    let hora = new Date().getHours();
    let saludo = hora < 12 ? "Buenos días" : (hora < 18 ? "Buenas tardes" : "Buenas noches");
    document.getElementById("saludoEstudiante").innerHTML = `${saludo}, ${usuarioActual.nombre}`;
    document.getElementById("perfilNombre").innerText = usuarioActual.nombre;
    document.getElementById("perfilEmail").innerText = usuarioActual.correo || usuarioActual.email || "No disponible";
    document.getElementById("perfilInstituto").innerText = usuarioActual.instituto || "No especificado";
    document.getElementById("perfilFecha").innerText = usuarioActual.fechaRegistro || "2024";
    if (avatares[usuarioActual.id]) document.getElementById("avatarImg").src = avatares[usuarioActual.id];
    else document.getElementById("avatarImg").src = DEFAULT_AVATAR;
}

document.querySelectorAll(".menu a, .bottom-nav a").forEach(link => {
    link.addEventListener("click", (e) => { e.preventDefault(); let sec = link.getAttribute("data-section"); if (sec) cambiarSeccion(sec); });
});
document.getElementById("buscarGeneral")?.addEventListener("input", (e) => {
    let txt = e.target.value.toLowerCase();
    document.querySelectorAll(".tarea-card, .grupo-card, .chat-card").forEach(c => { c.style.display = c.innerText.toLowerCase().includes(txt) ? "flex" : "none"; });
});

cargarPerfil();
renderizarClases();
renderizarTareas();
renderizarChats();