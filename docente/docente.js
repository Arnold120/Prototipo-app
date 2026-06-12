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

console.log("=== DOCENTE INICIADO ===");
console.log("ID Docente:", usuarioActual.id);
console.log("Nombre Docente:", usuarioActual.nombre);
console.log("Mensajes existentes:", mensajes.length);

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

function renderizarGrupos() {
    let misGrupos = grupos.filter(g => g.docenteId === usuarioActual.id);
    const fn = (g) => `<div class="grupo-card"><div><div class="grupo-nombre"><i class="fa-solid fa-chalkboard"></i> ${escapeHtml(g.nombre)}</div><div class="grupo-desc">${escapeHtml(g.descripcion || "Sin descripción")}</div><div class="grupo-footer"><span><i class="fa-solid fa-user-graduate"></i> ${g.estudiantes?.length || 0} estudiantes</span><span class="codigo-clase" onclick="copiarCodigo('${g.codigo}')">📋 ${g.codigo}</span><button class="btn-eliminar" onclick="eliminarGrupo(${g.id})">Eliminar</button></div></div></div>`;
    document.getElementById("listaGruposRecientes").innerHTML = misGrupos.length ? misGrupos.slice(0, 3).map(fn).join("") : '<div class="empty-message">No hay grupos</div>';
    document.getElementById("listaGruposCompleta").innerHTML = misGrupos.length ? misGrupos.map(fn).join("") : '<div class="empty-message">No hay grupos creados</div>';
    actualizarContadores();
}

function renderizarTrabajos() {
    let misTrabajos = trabajos.filter(t => t.docenteId === usuarioActual.id);
    document.getElementById("listaTrabajos").innerHTML = misTrabajos.length ? misTrabajos.map(t => `<div class="trabajo-card"><div><div class="trabajo-titulo">${escapeHtml(t.titulo)}</div><div class="trabajo-desc">${escapeHtml(t.descripcion)}</div><div class="trabajo-footer"><span>${t.fechaEntrega || "Sin fecha"}</span><button class="btn-eliminar" onclick="eliminarTrabajo(${t.id})">Eliminar</button></div></div></div>`).join("") : '<div class="empty-message">No hay trabajos</div>';
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
    document.getElementById("listaEntregas").innerHTML = misEntregas.length ? misEntregas.map(e => `<div class="entrega-card"><div><strong>${escapeHtml(e.estudianteNombre)}</strong> - ${escapeHtml(e.trabajoNombre)}<br>Entregado: ${new Date(e.fecha).toLocaleDateString()}<br><input type="number" id="nota-${e.id}" placeholder="Nota" value="${e.nota || ''}" step="0.1" min="0" max="10"><button onclick="calificarEntrega(${e.id})">Calificar</button></div></div>`).join("") : '<div class="empty-message">No hay entregas</div>';
}

function calificarEntrega(entregaId) {
    let entrega = entregas.find(e => e.id === entregaId);
    let notaInput = document.getElementById(`nota-${entregaId}`);
    let nota = parseFloat(notaInput.value);
    if (isNaN(nota)) nota = 0;
    entrega.nota = Math.min(10, Math.max(0, nota));
    guardarTodo();
    mostrarToast("Nota guardada", "success");
    renderizarEntregas();
}

// ========== FUNCIONES DE CHAT CORREGIDAS PARA DOCENTE ==========
function renderizarChats() {
    console.log("=== RENDERIZANDO CHATS ===");
    let contactosMap = new Map();
    
    // Agregar estudiantes (usando ID numérico)
    grupos.filter(g => g.docenteId === usuarioActual.id).forEach(g => {
        if (g.estudiantes) g.estudiantes.forEach(eId => {
            let estudiante = usuarios.find(u => u.id === eId);
            if (estudiante && !contactosMap.has(estudiante.id)) {
                console.log("Agregando estudiante al chat:", estudiante.id, estudiante.nombre);
                contactosMap.set(estudiante.id, { 
                    id: estudiante.id,
                    nombre: `${estudiante.nombre} (Estudiante)`,
                    tipo: "estudiante",
                    avatar: getAvatarUrl(estudiante.id)
                });
            }
        });
    });
    
    // Agregar grupos
    grupos.filter(g => g.docenteId === usuarioActual.id).forEach(g => {
        contactosMap.set(`grupo_${g.id}`, { 
            id: `grupo_${g.id}`, 
            nombre: `📢 ${g.nombre} (Grupo)`,
            tipo: "grupo", 
            grupoId: g.id, 
            esGrupo: true,
            avatar: getGrupoAvatarUrl(g.id)
        });
    });
    
    let chatsHTML = Array.from(contactosMap.values()).map(c => `
        <div class="chat-card" onclick="abrirChat('${c.id}', '${escapeHtml(c.nombre)}', ${c.esGrupo || false}, ${c.grupoId || null})">
            <img src="${c.avatar}" class="chat-avatar-list" onerror="this.src='${DEFAULT_AVATAR}'">
            <div class="card-info-flex">
                <div class="grupo-nombre">${escapeHtml(c.nombre)}</div>
                <div style="font-size:12px; color:#64748b">${c.tipo === "estudiante" ? "Estudiante" : "Grupo"}</div>
            </div>
        </div>
    `).join("");
    
    document.getElementById("listaChats").innerHTML = chatsHTML || '<div class="empty-message">No hay conversaciones</div>';
}

let chatActual = { id: null, nombre: "", esGrupo: false, grupoId: null };

function abrirChat(id, nombre, esGrupo, grupoId) {
    console.log("=== ABRIENDO CHAT ===");
    console.log("ID recibido:", id, "Tipo:", typeof id);
    console.log("esGrupo:", esGrupo);
    
    chatActual = { id: id.toString(), nombre, esGrupo, grupoId };
    document.getElementById("chatTitulo").innerHTML = `<i class="fa-regular fa-comment"></i> Chat con ${escapeHtml(nombre)}`;
    
    let mensajesChat = [];
    if (esGrupo) {
        mensajesChat = mensajes.filter(m => m.grupoId === grupoId);
        console.log("Mensajes de grupo encontrados:", mensajesChat.length);
    } else {
        const idNumero = parseInt(id);
        console.log("ID convertido a número:", idNumero);
        mensajesChat = mensajes.filter(m => 
            (m.deId === usuarioActual.id && m.paraId === idNumero) || 
            (m.deId === idNumero && m.paraId === usuarioActual.id)
        );
        console.log("Mensajes encontrados:", mensajesChat.length);
        mensajesChat.forEach(m => console.log("Mensaje:", m));
    }
    mensajesChat.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    let html = mensajesChat.map(m => {
        let esPropio = m.deId === usuarioActual.id;
        let usuario = usuarios.find(u => u.id === m.deId);
        let nombreUsuario = usuario?.nombre || "Desconocido";
        let avatarUrl = getAvatarUrl(m.deId);
        return `<div class="chat-mensaje" style="flex-direction: ${esPropio ? 'row-reverse' : 'row'}">
                    <img src="${avatarUrl}" class="chat-avatar" onerror="this.src='${DEFAULT_AVATAR}'">
                    <div class="chat-burbuja ${esPropio ? 'chat-burbuja-propio' : ''}">
                        <div class="chat-nombre">${esPropio ? 'Tú' : escapeHtml(nombreUsuario)}</div>
                        <div class="chat-texto">${escapeHtml(m.texto)}</div>
                        <div class="chat-hora">${new Date(m.fecha).toLocaleTimeString()}</div>
                    </div>
                </div>`;
    }).join("");
    
    document.getElementById("chatMensajesArea").innerHTML = html || '<div style="text-align:center; padding:40px;">No hay mensajes aún</div>';
    document.getElementById("modalChatOverlay").style.display = "flex";
    
    // Marcar mensajes como leídos
    if (!esGrupo) {
        const idNumero = parseInt(id);
        let marcados = 0;
        mensajes.forEach(m => {
            if (m.deId === idNumero && m.paraId === usuarioActual.id && !m.leido) {
                m.leido = true;
                marcados++;
            }
        });
        if (marcados > 0) {
            guardarTodo();
            actualizarContadores();
            console.log("Mensajes marcados como leídos:", marcados);
        }
    }
    
    setTimeout(() => { 
        const area = document.getElementById("chatMensajesArea");
        if (area) area.scrollTop = area.scrollHeight; 
    }, 100);
}

function enviarMensaje() {
    let texto = document.getElementById("mensajeTexto").value.trim();
    if (!texto || !chatActual.id) return;
    
    console.log("=== ENVIANDO MENSAJE ===");
    console.log("chatActual:", chatActual);
    
    let nuevoMensaje = { 
        id: Date.now(), 
        deId: usuarioActual.id, 
        texto, 
        fecha: new Date().toISOString(), 
        leido: false 
    };
    
    if (chatActual.esGrupo) {
        nuevoMensaje.grupoId = chatActual.grupoId;
        nuevoMensaje.esGrupo = true;
        console.log("Mensaje de grupo, grupoId:", chatActual.grupoId);
    } else {
        nuevoMensaje.paraId = parseInt(chatActual.id);
        console.log("Mensaje a estudiante, paraId:", nuevoMensaje.paraId);
    }
    
    mensajes.push(nuevoMensaje);
    guardarTodo();
    
    console.log("Mensaje guardado. Total mensajes:", mensajes.length);
    console.log("Último mensaje:", nuevoMensaje);
    
    document.getElementById("mensajeTexto").value = "";
    abrirChat(chatActual.id, chatActual.nombre, chatActual.esGrupo, chatActual.grupoId);
    mostrarToast("Mensaje enviado", "success");
    
    // Actualizar contador de mensajes no leídos
    actualizarContadores();
}

function cerrarModalChat() { 
    document.getElementById("modalChatOverlay").style.display = "none"; 
    chatActual = { id: null, nombre: "", esGrupo: false, grupoId: null };
}

// Función para sincronizar mensajes periódicamente
function sincronizarMensajes() {
    const nuevosMensajes = JSON.parse(localStorage.getItem("mensajesEduClass")) || [];
    if (nuevosMensajes.length !== mensajes.length) {
        console.log("Nuevos mensajes detectados. Actualizando...");
        mensajes.length = 0;
        mensajes.push(...nuevosMensajes);
        // Si el chat está abierto, recargar
        if (chatActual.id) {
            abrirChat(chatActual.id, chatActual.nombre, chatActual.esGrupo, chatActual.grupoId);
        }
        actualizarContadores();
        renderizarChats();
    }
}

// Sincronizar cada 2 segundos
setInterval(sincronizarMensajes, 2000);
// ========== FIN FUNCIONES DE CHAT ==========

function renderizarEstudiantes() {
    let misGrupos = grupos.filter(g => g.docenteId === usuarioActual.id);
    let estudiantesSet = new Map();
    misGrupos.forEach(g => { (g.estudiantes || []).forEach(eId => { let est = usuarios.find(u => u.id === eId); if (est) estudiantesSet.set(est.id, est); }); });
    let lista = Array.from(estudiantesSet.values());
    document.getElementById("listaEstudiantes").innerHTML = lista.length ? lista.map(e => `<div class="grupo-card"><img src="${getAvatarUrl(e.id)}" class="chat-avatar-list" onerror="this.src='${DEFAULT_AVATAR}'"><div><div class="grupo-nombre">${escapeHtml(e.nombre)}</div><div>${escapeHtml(e.correo || e.email)}</div><button class="btn-eliminar" style="background:#2563eb; color:white;" onclick="abrirChat('${e.id}', '${escapeHtml(e.nombre)} (Estudiante)', false, null)">Mensaje</button></div></div>`).join("") : '<div class="empty-message">No hay estudiantes</div>';
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
            mostrarToast("Foto actualizada", "success");
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

function eliminarGrupo(id) { if (confirm("¿Eliminar grupo?")) { grupos = grupos.filter(g => g.id !== id); trabajos = trabajos.filter(t => t.grupoId !== id); guardarTodo(); renderizarGrupos(); renderizarTrabajos(); renderizarEstudiantes(); renderizarChats(); mostrarToast("Grupo eliminado", "success"); } }

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

cargarPerfil(); 
renderizarGrupos(); 
renderizarTrabajos(); 
renderizarEstudiantes(); 
renderizarChats();

console.log("=== INICIALIZACIÓN COMPLETADA ===");
console.log("Grupos del docente:", grupos.filter(g => g.docenteId === usuarioActual.id).length);
console.log("Estudiantes totales:", document.querySelectorAll("#listaEstudiantes .grupo-card").length);