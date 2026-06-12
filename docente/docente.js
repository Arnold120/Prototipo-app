// ==================== CONFIGURACIÓN DE IMÁGENES PREDETERMINADAS ====================
const DEFAULT_AVATAR = "../images/avatar.png";
const DEFAULT_GROUP_AVATAR = "../images/avatar.png";

let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
if (!usuarioActual || usuarioActual.rol !== "docente") window.location.href = "../auth/login.html";

let grupos = JSON.parse(localStorage.getItem("gruposDocente")) || [];
let trabajos = JSON.parse(localStorage.getItem("trabajosDocente")) || [];
let entregas = JSON.parse(localStorage.getItem("entregasEstudiante")) || [];
let mensajes = JSON.parse(localStorage.getItem("mensajesEduClass")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuariosEduClass")) || [];
let avatares = JSON.parse(localStorage.getItem("avataresUsuarios")) || {};
let grupoAvatares = JSON.parse(localStorage.getItem("grupoAvatares")) || {};

if (!usuarios.find(u => u.id === usuarioActual.id)) usuarios.push(usuarioActual);

function guardarTodo() {
    localStorage.setItem("gruposDocente", JSON.stringify(grupos));
    localStorage.setItem("trabajosDocente", JSON.stringify(trabajos));
    localStorage.setItem("entregasEstudiante", JSON.stringify(entregas));
    localStorage.setItem("mensajesEduClass", JSON.stringify(mensajes));
    localStorage.setItem("usuariosEduClass", JSON.stringify(usuarios));
    localStorage.setItem("avataresUsuarios", JSON.stringify(avatares));
    localStorage.setItem("grupoAvatares", JSON.stringify(grupoAvatares));
}

function generarCodigo() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }

function mostrarToast(texto, tipo) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast-mensaje"; document.body.appendChild(t); }
    t.innerHTML = `<i class="fa-solid fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${texto}`;
    t.className = `toast-mensaje ${tipo} show`;
    setTimeout(() => t.classList.remove("show"), 2500);
}

function actualizarContadores() {
    let misGrupos = grupos.filter(g => g.docenteId === usuarioActual.id);
    let misTrabajos = trabajos.filter(t => t.docenteId === usuarioActual.id);
    let estudiantesSet = new Set();
    misGrupos.forEach(g => { g.estudiantes?.forEach(e => estudiantesSet.add(e)); });
    let misMensajes = mensajes.filter(m => m.paraId === usuarioActual.id && !m.leido);
    document.getElementById("totalGrupos").innerText = misGrupos.length;
    document.getElementById("totalTrabajos").innerText = misTrabajos.length;
    document.getElementById("totalEstudiantes").innerText = estudiantesSet.size;
    document.getElementById("totalMensajes").innerText = misMensajes.length;
}

function getAvatarUrl(userId) { return avatares[userId] || DEFAULT_AVATAR; }
function getGrupoAvatarUrl(grupoId) { return grupoAvatares[grupoId] || DEFAULT_GROUP_AVATAR; }

function cambiarGrupoAvatar(grupoId, input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            grupoAvatares[grupoId] = e.target.result;
            guardarTodo();
            renderizarGrupos();
            renderizarChats();
            mostrarToast("Foto de grupo actualizada", "success");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function renderizarGrupos() {
    let misGrupos = grupos.filter(g => g.docenteId === usuarioActual.id);
    const fn = (g) => {
        const grupoAvatar = getGrupoAvatarUrl(g.id);
        return `<div class="grupo-card">
                    <div class="grupo-avatar-wrapper">
                        <img src="${grupoAvatar}" class="chat-avatar-list" onclick="event.stopPropagation();document.getElementById('grupoAvatarInput_${g.id}').click()" onerror="this.src='${DEFAULT_GROUP_AVATAR}'">
                        <div class="avatar-edit-icon-small" onclick="event.stopPropagation();document.getElementById('grupoAvatarInput_${g.id}').click()"><i class="fa-solid fa-camera"></i></div>
                        <input type="file" id="grupoAvatarInput_${g.id}" accept="image/*" style="display:none" onchange="cambiarGrupoAvatar(${g.id}, this)">
                    </div>
                    <div class="card-info-flex">
                        <div class="grupo-nombre"><i class="fa-solid fa-chalkboard"></i> ${escapeHtml(g.nombre)}</div>
                        <div class="grupo-desc">${escapeHtml(g.descripcion || "Sin descripción")}</div>
                        <div class="grupo-footer" style="margin-top:8px;">
                            <span><i class="fa-solid fa-user-graduate"></i> ${g.estudiantes?.length || 0} estudiantes</span>
                            <span class="codigo-clase" onclick="copiarCodigo('${g.codigo}')">📋 ${g.codigo}</span>
                            <button class="btn-eliminar" onclick="eliminarGrupo(${g.id})"><i class="fa-solid fa-trash"></i> Eliminar</button>
                        </div>
                    </div>
                </div>`;
    };
    document.getElementById("listaGruposRecientes").innerHTML = misGrupos.length ? misGrupos.slice(0, 3).map(fn).join("") : '<div class="empty-message"><i class="fa-regular fa-folder-open"></i><p>No hay grupos</p></div>';
    document.getElementById("listaGruposCompleta").innerHTML = misGrupos.length ? misGrupos.map(fn).join("") : '<div class="empty-message"><i class="fa-regular fa-folder-open"></i><p>No hay grupos creados</p></div>';
    actualizarContadores();
}

function renderizarTrabajos() {
    let misTrabajos = trabajos.filter(t => t.docenteId === usuarioActual.id);
    document.getElementById("listaTrabajos").innerHTML = misTrabajos.length ? misTrabajos.map(t => `<div class="trabajo-card"><div class="card-info-flex"><div class="trabajo-titulo"><i class="fa-solid fa-file-alt"></i> ${escapeHtml(t.titulo)}</div><div class="trabajo-desc">${escapeHtml(t.descripcion)}</div><div class="trabajo-footer"><span><i class="fa-regular fa-calendar"></i> ${t.fechaEntrega || "Sin fecha"}</span><button class="btn-eliminar" onclick="eliminarTrabajo(${t.id})"><i class="fa-solid fa-trash"></i> Eliminar</button></div></div></div>`).join("") : '<div class="empty-message"><i class="fa-regular fa-file"></i><p>No hay trabajos</p></div>';
    actualizarContadores();
}

function renderizarEntregas() {
    let misTrabajos = trabajos.filter(t => t.docenteId === usuarioActual.id);
    let misEntregas = entregas.filter(e => misTrabajos.some(t => t.id === e.trabajoId));
    misEntregas = misEntregas.map(e => {
        let trabajo = trabajos.find(t => t.id === e.trabajoId);
        let estudiante = usuarios.find(u => u.id === e.estudianteId);
        return { ...e, trabajoNombre: trabajo?.titulo || "Sin título", estudianteNombre: estudiante?.nombre || "Desconocido" };
    });
    document.getElementById("listaEntregas").innerHTML = misEntregas.length ? misEntregas.map(e => `<div class="entrega-card"><div class="card-info-flex"><div><strong>${escapeHtml(e.estudianteNombre)}</strong> - ${escapeHtml(e.trabajoNombre)}</div><div class="trabajo-desc">Entregado: ${new Date(e.fecha).toLocaleDateString()}</div><div class="grupo-footer"><input type="number" id="nota-${e.id}" class="nota-input" placeholder="Nota" value="${e.nota || ''}" step="0.1" min="0" max="10"><button class="btn-eliminar" style="background:#2563eb; color:white; padding:6px 12px; border-radius:10px;" onclick="calificarEntrega(${e.id})"><i class="fa-solid fa-save"></i> Calificar</button></div></div></div>`).join("") : '<div class="empty-message"><i class="fa-regular fa-clock"></i><p>No hay entregas de estudiantes</p></div>';
}

function calificarEntrega(entregaId) {
    let entrega = entregas.find(e => e.id === entregaId);
    let notaInput = document.getElementById(`nota-${entregaId}`);
    let nota = parseFloat(notaInput.value);
    if (isNaN(nota)) nota = 0;
    entrega.nota = Math.min(10, Math.max(0, nota));
    guardarTodo();
    mostrarToast("Nota guardada correctamente", "success");
    renderizarEntregas();
}

function renderizarChats() {
    let contactosMap = new Map();
    grupos.filter(g => g.docenteId === usuarioActual.id).forEach(g => {
        if (g.estudiantes) g.estudiantes.forEach(eId => {
            let estudiante = usuarios.find(u => u.id === eId);
            if (estudiante && !contactosMap.has(eId)) {
                contactosMap.set(eId, { 
                    id: eId,
                    nombre: estudiante.nombre,
                    nombreMostrar: `${estudiante.nombre} (Estudiante)`,
                    tipo: "estudiante",
                    avatar: getAvatarUrl(eId)
                });
            }
        });
    });
    grupos.filter(g => g.docenteId === usuarioActual.id).forEach(g => {
        contactosMap.set(`grupo_${g.id}`, { 
            id: `grupo_${g.id}`, 
            nombre: g.nombre,
            nombreMostrar: `📢 ${g.nombre} (Grupo)`,
            tipo: "grupo", 
            grupoId: g.id, 
            esGrupo: true,
            avatar: getGrupoAvatarUrl(g.id)
        });
    });
    
    document.getElementById("listaChats").innerHTML = Array.from(contactosMap.values()).map(c => {
        const tipoTexto = c.tipo === "estudiante" ? "Estudiante" : "Grupo";
        return `<div class="chat-card" onclick="abrirChat('${c.id}', '${escapeHtml(c.nombreMostrar)}', ${c.esGrupo || false}, ${c.grupoId || null})">
                    <img src="${c.avatar}" class="chat-avatar-list" onerror="this.src='${DEFAULT_AVATAR}'">
                    <div class="card-info-flex">
                        <div class="grupo-nombre">${escapeHtml(c.nombreMostrar)}</div>
                        <div style="font-size:12px; color:#64748b">${tipoTexto}</div>
                    </div>
                </div>`;
    }).join("") || '<div class="empty-message"><i class="fa-regular fa-comment"></i><p>No hay conversaciones disponibles</p></div>';
}

let chatActual = { id: null, nombre: "", esGrupo: false, grupoId: null };

function abrirChat(id, nombre, esGrupo, grupoId) {
    chatActual = { id, nombre, esGrupo, grupoId };
    document.getElementById("chatTitulo").innerHTML = `<i class="fa-regular fa-comment"></i> Chat con ${escapeHtml(nombre)}`;
    
    let mensajesChat = mensajes.filter(m => {
        if (esGrupo) return m.grupoId === grupoId;
        return (m.deId === usuarioActual.id && m.paraId === parseInt(id)) || (m.deId === parseInt(id) && m.paraId === usuarioActual.id);
    });
    mensajesChat.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    let html = mensajesChat.map(m => {
        let esPropio = m.deId === usuarioActual.id;
        let usuario = usuarios.find(u => u.id === m.deId);
        let nombreUsuario = usuario?.nombre || "Desconocido";
        let rolUsuario = usuario?.rol === "estudiante" ? " (Estudiante)" : (usuario?.rol === "docente" ? " (Docente)" : "");
        let nombreMostrarEnChat = esPropio ? 'Tú' : `${nombreUsuario}${rolUsuario}`;
        let avatarUrl = getAvatarUrl(m.deId);
        return `<div class="chat-mensaje" style="flex-direction: ${esPropio ? 'row-reverse' : 'row'}">
                    <img src="${avatarUrl}" class="chat-avatar" onerror="this.src='${DEFAULT_AVATAR}'">
                    <div class="chat-burbuja ${esPropio ? 'chat-burbuja-propio' : ''}">
                        <div class="chat-nombre">${escapeHtml(nombreMostrarEnChat)}</div>
                        <div class="chat-texto" style="${esPropio ? 'background:#2563eb; color:white' : 'background:#e2e8f0'}">${escapeHtml(m.texto)}</div>
                        <div class="chat-hora">${new Date(m.fecha).toLocaleTimeString()}</div>
                    </div>
                </div>`;
    }).join("");
    
    document.getElementById("chatMensajesArea").innerHTML = html || '<div style="text-align:center; padding:40px; color:#94a3b8">No hay mensajes aún. ¡Envía el primero!</div>';
    document.getElementById("modalChatOverlay").style.display = "flex";
    
    mensajes.filter(m => m.paraId === usuarioActual.id && !m.leido).forEach(m => { m.leido = true; });
    guardarTodo();
    setTimeout(() => { document.getElementById("chatMensajesArea").scrollTop = document.getElementById("chatMensajesArea").scrollHeight; }, 100);
}

function enviarMensaje() {
    let texto = document.getElementById("mensajeTexto").value.trim();
    if (!texto || !chatActual.id) return;
    
    let nuevoMensaje = { id: Date.now(), deId: usuarioActual.id, texto, fecha: new Date().toISOString(), leido: false };
    if (chatActual.esGrupo) {
        nuevoMensaje.grupoId = chatActual.grupoId;
        nuevoMensaje.esGrupo = true;
    } else {
        nuevoMensaje.paraId = parseInt(chatActual.id);
    }
    mensajes.push(nuevoMensaje);
    guardarTodo();
    document.getElementById("mensajeTexto").value = "";
    abrirChat(chatActual.id, chatActual.nombre, chatActual.esGrupo, chatActual.grupoId);
}

function cerrarModalChat() { document.getElementById("modalChatOverlay").style.display = "none"; chatActual = { id: null, nombre: "", esGrupo: false, grupoId: null }; }

function renderizarEstudiantes() {
    let misGrupos = grupos.filter(g => g.docenteId === usuarioActual.id);
    let estudiantesSet = new Map();
    misGrupos.forEach(g => { (g.estudiantes || []).forEach(eId => { let est = usuarios.find(u => u.id === eId); if (est) estudiantesSet.set(est.id, est); }); });
    let lista = Array.from(estudiantesSet.values());
    document.getElementById("listaEstudiantes").innerHTML = lista.length ? lista.map(e => `<div class="grupo-card"><img src="${getAvatarUrl(e.id)}" class="chat-avatar-list" onerror="this.src='${DEFAULT_AVATAR}'"><div class="card-info-flex"><div class="grupo-nombre">${escapeHtml(e.nombre)}</div><div class="grupo-desc">${escapeHtml(e.correo || e.email)}</div><div class="grupo-footer"><button class="btn-eliminar" style="background:#2563eb; color:white; padding:6px 12px; border-radius:10px;" onclick="abrirChat('${e.id}', '${escapeHtml(e.nombre)} (Estudiante)', false, null)"><i class="fa-regular fa-comment"></i> Mensaje</button></div></div></div>`).join("") : '<div class="empty-message"><i class="fa-regular fa-user"></i><p>No hay estudiantes</p></div>';
    document.getElementById("buscarEstudiante")?.addEventListener("input", (e) => { let txt = e.target.value.toLowerCase(); document.querySelectorAll("#listaEstudiantes .grupo-card").forEach(c => c.style.display = c.innerText.toLowerCase().includes(txt) ? "flex" : "none"); });
}

function cambiarAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            avatares[usuarioActual.id] = e.target.result;
            guardarTodo();
            document.getElementById("avatarImg").src = e.target.result;
            renderizarChats();
            renderizarEstudiantes();
            mostrarToast("Foto de perfil actualizada", "success");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function crearGrupo() {
    let nombre = document.getElementById("nombreGrupo").value.trim();
    if (!nombre) { mostrarToast("Nombre requerido", "error"); return; }
    let codigo = generarCodigo();
    while (grupos.some(g => g.codigo === codigo)) codigo = generarCodigo();
    grupos.push({ id: Date.now(), nombre, descripcion: document.getElementById("descGrupo").value, codigo, docenteId: usuarioActual.id, instituto: usuarioActual.instituto, estudiantes: [] });
    guardarTodo();
    renderizarGrupos();
    renderizarChats();
    cerrarModalGrupo();
    mostrarToast(`Grupo "${nombre}" creado. Código: ${codigo}`, "success");
}

function eliminarGrupo(id) { if (confirm("¿Eliminar este grupo?")) { grupos = grupos.filter(g => g.id !== id); trabajos = trabajos.filter(t => t.grupoId !== id); guardarTodo(); renderizarGrupos(); renderizarTrabajos(); renderizarEstudiantes(); renderizarChats(); mostrarToast("Grupo eliminado", "success"); } }

function asignarTrabajo() {
    let grupoId = document.getElementById("trabajoGrupo").value;
    if (!grupoId) { mostrarToast("Selecciona un grupo", "error"); return; }
    let titulo = document.getElementById("tituloTrabajo").value.trim();
    if (!titulo) { mostrarToast("Título requerido", "error"); return; }
    let grupo = grupos.find(g => g.id == grupoId);
    trabajos.push({ id: Date.now(), titulo, descripcion: document.getElementById("descripcionTrabajo").value, fechaEntrega: document.getElementById("fechaEntrega").value, grupoId: parseInt(grupoId), grupoNombre: grupo.nombre, docenteId: usuarioActual.id });
    guardarTodo();
    renderizarTrabajos();
    cerrarModalTrabajo();
    mostrarToast("Trabajo asignado", "success");
}

function eliminarTrabajo(id) { if (confirm("¿Eliminar trabajo?")) { trabajos = trabajos.filter(t => t.id !== id); guardarTodo(); renderizarTrabajos(); } }
function copiarCodigo(codigo) { navigator.clipboard.writeText(codigo); mostrarToast(`Código ${codigo} copiado`, "success"); }

function cambiarSeccion(sectionId) {
    document.querySelectorAll(".dashboard").forEach(sec => sec.classList.remove("active-section"));
    document.getElementById(sectionId).classList.add("active-section");
    document.querySelectorAll(".menu a, .bottom-nav a").forEach(link => { link.classList.toggle("active", link.getAttribute("data-section") === sectionId); });
    if (window.innerWidth <= 768) cerrarSidebar();
    if (sectionId === "chat") renderizarChats();
    if (sectionId === "entregas") renderizarEntregas();
}

function toggleSidebar() { document.getElementById("mainSidebar").classList.add("open"); document.getElementById("overlay").style.display = "block"; }
function cerrarSidebar() { document.getElementById("mainSidebar").classList.remove("open"); document.getElementById("overlay").style.display = "none"; }
function cerrarSesion() { localStorage.removeItem("usuarioActual"); localStorage.removeItem("sesionActiva"); window.location.href = "../auth/login.html"; }
function abrirModalGrupo() { document.getElementById("modalGrupoOverlay").style.display = "flex"; }
function cerrarModalGrupo() { document.getElementById("modalGrupoOverlay").style.display = "none"; document.getElementById("nombreGrupo").value = ""; document.getElementById("descGrupo").value = ""; }
function abrirModalTrabajo() { let select = document.getElementById("trabajoGrupo"); select.innerHTML = '<option value="">Seleccionar grupo</option>' + grupos.filter(g => g.docenteId === usuarioActual.id).map(g => `<option value="${g.id}">${escapeHtml(g.nombre)}</option>`).join(""); document.getElementById("modalTrabajoOverlay").style.display = "flex"; document.getElementById("tituloTrabajo").value = ""; document.getElementById("descripcionTrabajo").value = ""; document.getElementById("fechaEntrega").value = ""; }
function cerrarModalTrabajo() { document.getElementById("modalTrabajoOverlay").style.display = "none"; }
function escapeHtml(str) { return str?.replace(/[&<>]/g, function(m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; }) || ""; }

function cargarPerfil() {
    document.getElementById("nombreDocente").innerText = usuarioActual.nombre.split(" ")[0];
    document.getElementById("perfilNombre").innerText = usuarioActual.nombre;
    document.getElementById("perfilEmail").innerText = usuarioActual.correo || usuarioActual.email || "No disponible";
    document.getElementById("perfilInstituto").innerText = usuarioActual.instituto || "No especificado";
    document.getElementById("perfilFecha").innerText = usuarioActual.fechaRegistro || "2024";
    if (avatares[usuarioActual.id]) document.getElementById("avatarImg").src = avatares[usuarioActual.id];
    else document.getElementById("avatarImg").src = DEFAULT_AVATAR;
}

document.querySelectorAll(".menu a, .bottom-nav a").forEach(link => { link.addEventListener("click", (e) => { e.preventDefault(); let sec = link.getAttribute("data-section"); if (sec) cambiarSeccion(sec); }); });
document.getElementById("overlay")?.addEventListener("click", cerrarSidebar);
document.getElementById("buscarGeneral")?.addEventListener("input", (e) => { let txt = e.target.value.toLowerCase(); document.querySelectorAll(".grupo-card, .trabajo-card, .entrega-card").forEach(c => c.style.display = c.innerText.toLowerCase().includes(txt) ? "flex" : "none"); });

cargarPerfil(); renderizarGrupos(); renderizarTrabajos(); renderizarEstudiantes(); renderizarChats();
