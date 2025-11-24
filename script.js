// script.js - versión sin líneas entre cursos

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let mapaCursos = {};
let estado = JSON.parse(localStorage.getItem("estadoCursos") || "{}");

// DOM
const topRow = $("#topRow");
const bottomRow = $("#bottomRow");
const detalleContenido = $("#detalleContenido");

// Controles
const searchInput = $("#searchInput");
const toggleThemeBtn = $("#toggleTheme");
const resetBtn = $("#resetBtn");
const exportBtn = $("#exportBtn");
const exportPdfBtn = $("#exportPdfBtn");

// Nube (Firebase)
const saveCloudBtn = $("#saveCloudBtn");
const loadCloudBtn = $("#loadCloudBtn");
let firestore = null;
let firebaseConfigured = false;

// ----------------------------
// Cargar cursos
// ----------------------------
async function cargarCursos() {
  try {
    const res = await fetch("cursos.json", { cache: "no-store" });
    mapaCursos = await res.json();
    renderAll();
  } catch (e) {
    console.error("Error cargando cursos.json", e);
    $("#mallaWrapper").innerHTML = `<p>Error cargando cursos.json</p>`;
  }
}

// ----------------------------
// Helpers
// ----------------------------
const estaAprobado = c => estado[c] === true;
const guardarLocal = () =>
  localStorage.setItem("estadoCursos", JSON.stringify(estado));

function calcularDependientes(map) {
  const dep = {};
  Object.keys(map).forEach(ciclo =>
    Object.keys(map[ciclo]).forEach(c => (dep[c] = 0))
  );

  Object.keys(map).forEach(ciclo => {
    Object.keys(map[ciclo]).forEach(cur => {
      mapaCursos[ciclo][cur].forEach(pr => {
        if (dep[pr] != null) dep[pr]++;
      });
    });
  });

  return dep;
}

// ----------------------------
// Render
// ----------------------------
function renderAll() {
  topRow.innerHTML = "";
  bottomRow.innerHTML = "";

  const orden = Object.keys(mapaCursos).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, "")) || 0;
    const nb = parseInt(b.replace(/\D/g, "")) || 0;
    return na - nb;
  });

  const arrTop = orden.filter(x => parseInt(x.replace(/\D/g, "")) <= 5);
  const arrBot = orden.filter(x => parseInt(x.replace(/\D/g, "")) >= 6);

  const depCounts = calcularDependientes(mapaCursos);

  const crearCol = ciclo => {
    const col = document.createElement("div");
    col.className = "col-ciclo";

    const header = document.createElement("div");
    header.className = "ciclo-header";
    header.textContent = ciclo;
    col.appendChild(header);

    const lista = document.createElement("div");
    lista.className = "lista-cursos";

    Object.keys(mapaCursos[ciclo]).forEach(curso => {
      const prereq = mapaCursos[ciclo][curso];
      const aprobado = estaAprobado(curso);
      const desbloq = prereq.every(p => estaAprobado(p));

      const btn = document.createElement("button");
      btn.className = "curso";
      btn.dataset.nombre = curso;

      const dep = depCounts[curso] || 0;
      btn.classList.add(dep >= 4 ? "dep-4" : `dep-${dep}`);

      if (aprobado) btn.classList.add("aprobado");
      else if (!desbloq) btn.classList.add("bloqueado");
      else btn.classList.add("pendiente");

      const title = document.createElement("div");
      title.className = "curso-nombre";
      title.textContent = curso;
      btn.appendChild(title);

      if (prereq.length > 0) {
        const badge = document.createElement("div");
        badge.className = "curso-prereq";
        badge.textContent = prereq.every(p => estaAprobado(p))
          ? "Prer. OK"
          : `${prereq.filter(p => !estaAprobado(p)).length} prereq`;
        btn.appendChild(badge);
      }

      if (dep > 0) {
        const b2 = document.createElement("div");
        b2.className = "dependientes-badge";
        b2.textContent = dep;
        btn.appendChild(b2);
      }

      btn.addEventListener("click", () => {
        if (!aprobado && !desbloq) return;

        estado[curso] = !aprobado;
        if (!estado[curso]) delete estado[curso];

        guardarLocal();
        renderAll();
        mostrarDetalle(curso, prereq);
      });

      btn.addEventListener("mouseenter", () => mostrarDetalle(curso, prereq));

      lista.appendChild(btn);
    });

    col.appendChild(lista);
    return col;
  };

  arrTop.forEach(c => topRow.appendChild(crearCol(c)));
  arrBot.forEach(c => bottomRow.appendChild(crearCol(c)));
}

// ----------------------------
// Detalle
// ----------------------------
function mostrarDetalle(nombre, prereqs) {
  const aprobado = estaAprobado(nombre);
  const lista =
    prereqs.length > 0
      ? `<ul>${prereqs
          .map(p => `<li>${p}: ${estaAprobado(p) ? "✓" : "✗"}</li>`)
          .join("")}</ul>`
      : "<em>Sin prerrequisitos</em>";

  detalleContenido.innerHTML = `
    <h3>${nombre}</h3>
    <p><strong>Estado:</strong> ${
      aprobado ? "Aprobado" : "Pendiente"
    }</p>
    <p><strong>Prerrequisitos:</strong></p>
    ${lista}
  `;
}

// ----------------------------
// Buscador
// ----------------------------
searchInput.addEventListener("input", e => {
  const q = e.target.value.toLowerCase().trim();

  $$(".col-ciclo").forEach(col => {
    let visible = false;
    col.querySelectorAll(".curso").forEach(cur => {
      const match = cur.dataset.nombre.toLowerCase().includes(q);
      cur.style.display = match ? "" : "none";
      if (match) visible = true;
    });
    col.style.display = visible ? "" : "none";
  });
});

// ----------------------------
// Dark Mode
// ----------------------------
function setTheme(dark) {
  document.body.classList.toggle("dark", dark);
  localStorage.setItem("mallaThemeDark", dark);
}
toggleThemeBtn.addEventListener("click", () =>
  setTheme(!document.body.classList.contains("dark"))
);
setTheme(localStorage.getItem("mallaThemeDark") === "true");

// ----------------------------
// Reset
// ----------------------------
resetBtn.addEventListener("click", () => {
  if (!confirm("¿Resetear todo?")) return;
  estado = {};
  guardarLocal();
  renderAll();
});

// ----------------------------
// Export JSON
// ----------------------------
exportBtn.addEventListener("click", () => {
  const url =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(estado, null, 2));
  const a = document.createElement("a");
  a.href = url;
  a.download = "estadoCursos.json";
  a.click();
});

// ----------------------------
// Export PDF
// ----------------------------
exportPdfBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;
  doc.text("Malla - Estado Actual", 14, y); 
  y += 10;

  Object.keys(mapaCursos).forEach(ciclo => {
    doc.text(ciclo, 14, y);
    y += 8;

    Object.keys(mapaCursos[ciclo]).forEach(curso => {
      doc.text(
        `- ${curso} (${estaAprobado(curso) ? "Aprobado" : "Pendiente"})`,
        18,
        y
      );
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 5;
  });

  doc.save("malla.pdf");
});

// ----------------------------
// Firebase (Opcional)
// ----------------------------
function firebaseInit() {
  try {
    const cfg = {
      // INCLUYE TU CONFIG SI QUIERES USAR FIREBASE
    };
    if (!cfg.projectId) return;

    firebase.initializeApp(cfg);
    firestore = firebase.firestore();
    firebaseConfigured = true;
  } catch (e) {
    console.error("Firebase error:", e);
  }
}
firebaseInit();

saveCloudBtn.addEventListener("click", async () => {
  if (!firebaseConfigured) return alert("Firebase no configurado");
  await firestore.collection("mallas").doc("user1").set({
    estado,
    updated: Date.now()
  });
  alert("Guardado en la nube.");
});

loadCloudBtn.addEventListener("click", async () => {
  if (!firebaseConfigured) return alert("Firebase no configurado");
  const d = await firestore.collection("mallas").doc("user1").get();
  if (!d.exists) return alert("No hay datos en nube.");
  estado = d.data().estado || {};
  guardarLocal();
  renderAll();
  alert("Cargado.");
});

// ----------------------------
// Inicializar
// ----------------------------
cargarCursos();
