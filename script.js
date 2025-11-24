// script.js - colorizado por ciclo + por rama (versión final decorada)
// NOTA: Si despliegas en GitHub Pages cambia el href del PDF en index.html a "./INFOSIL.pdf"

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let mapaCursos = {};
let estado = JSON.parse(localStorage.getItem('estadoCursos') || '{}');

// ----------------------
// Ramas / clasificación (usé la propuesta A)
const ramas = {
  "rama-ciencias": [
    "BIOLOGÍA","QUÍMICA GENERAL","QUÍMICA ORGÁNICA","BIOQUÍMICA APLICADA A LA NUTRICIÓN",
    "BIOQUÍMICA ALIMENTARIA","BROMATOLOGÍA DE LOS ALIMENTOS","MICROBIOLOGÍA Y PARASITOLOGÍA APLICADA A LA NUTRICIÓN",
    "FISIOPATOLOGÍA DE LA NUTRICIÓN","TOXICOLOGÍA ALIMENTARIA","FOOD TECHNOLOGY"
  ],
  "rama-nutricion": [
    "INTRODUCCIÓN A LA NUTRICIÓN Y VIDA SALUDABLE","FUNDAMENTOS DE LA SALUD: MACRO Y MICRONUTRIENTES",
    "NUTRICIÓN EN ETAPAS FISIOLÓGICAS","VALORACIÓN NUTRICIONAL EN ETAPAS DE LA VIDA",
    "DIETÉTICA Y PROGRAMACIÓN DE DIETAS","DIETOTERAPIA DEL NIÑO Y DEL ADULTO",
    "NUTRICIÓN CLÍNICA","NUTRICIÓN CLÍNICA II","NUTRICIÓN CLÍNICA III","NUTRICIÓN CLÍNICA IV",
    "SOPORTE NUTRICIONAL","ALIMENTOS FUNCIONALES Y NUTRACEÚTICOS","NUTRICIÓN EN EL EJERCICIO Y DEPORTE",
    "SUPLEMENTACIÓN NUTRICIONAL EN DEPORTISTAS"
  ],
  "rama-publica": [
    "SITUACIÓN ALIMENTARIA Y NUTRICIONAL","EPIDEMIOLOGÍA NUTRICIONAL","NUTRICIÓN PÚBLICA",
    "DISEÑO DE PROGRAMAS Y POLÍTICAS EN NUTRICIÓN PÚBLICA","PRÁCTICAS PRE-PROFESIONALES EN LA COMUNIDAD",
    "EVALUACIÓN Y DIAGNÓSTICO EN NUTRICIÓN PÚBLICA"
  ],
  "rama-gestion": [
    "ADMINISTRACIÓN PARA LOS NEGOCIOS","MARKETING","GESTIÓN EN SERVICIOS Y NEGOCIOS DE ALIMENTACIÓN Y NUTRICIÓN",
    "OPORTUNIDADES DE NEGOCIOS","FUNDAMENTOS CONTABLES Y FINANCIEROS","PRINCIPIOS DE ECONOMÍA"
  ],
  "rama-comunicacion": [
    "LENGUAJE Y COMUNICACIÓN I","LENGUAJE Y COMUNICACIÓN II","COMUNICACIÓN CIENTÍFICA",
    "EDUCACIÓN Y COMUNICACIÓN EFECTIVA EN NUTRICIÓN","PSICOLOGÍA APLICADA A LA NUTRICIÓN",
    "ÉTICA Y CIUDADANÍA","FUNDAMENTOS DEL LIDERAZGO SOSTENIBLE"
  ],
  "rama-deporte": [
    "EVALUACIÓN NUTRICIONAL EN DEPORTISTAS","TRATAMIENTO DEL EJERCICIO SALUDABLE",
    "PLANIFICACIÓN Y DISEÑO DE DIETAS EN DEPORTISTAS","COACHING EN LA NUTRICIÓN DEPORTIVA"
  ],
  "rama-electivo": [
    "REALIDAD NACIONAL Y GLOBALIZACIÓN","FUNDAMENTOS EN COMPETENCIAS DIGITALES",
    "ANTROPOLOGÍA NUTRICIONAL","PRIMEROS AUXILIOS EN SALUD","INTERACCIÓN FÁRMACO NUTRIENTE",
    "TÉCNICAS DE COMPORTAMIENTO","NEUROCIENCIAS APLICADAS A LA NUTRICIÓN","NUTRICIÓN FUNCIONAL E INVESTIGACIÓN"
  ]
};

// create reverse map course->rama for quick lookup
const cursoARama = {};
Object.entries(ramas).forEach(([rama, arr]) => arr.forEach(c => cursoARama[c] = rama));

// ---------------------- DOM refs
const topRow = $("#topRow");
const bottomRow = $("#bottomRow");
const detalleContenido = $("#detalleContenido");
const searchInput = $("#searchInput");
const filterBranch = $("#filterBranch");
const toggleThemeBtn = $("#toggleTheme");
const resetBtn = $("#resetBtn");
const exportBtn = $("#exportBtn");
const exportPdfBtn = $("#exportPdfBtn");

// populate filterBranch select
Object.keys(ramas).forEach(r => {
  const opt = document.createElement("option");
  opt.value = r;
  opt.textContent = r.replace("rama-","").replace("-"," ").toUpperCase();
  filterBranch.appendChild(opt);
});

// ---------------------- Helpers
const estaAprobado = c => estado[c] === true;
const guardarLocal = () => localStorage.setItem('estadoCursos', JSON.stringify(estado));

// calcula dependientes
function calcularDependientes(map) {
  const dep = {};
  Object.keys(map).forEach(ciclo => Object.keys(map[ciclo]).forEach(c => dep[c] = 0));
  Object.keys(map).forEach(ciclo => {
    Object.keys(map[ciclo]).forEach(curso => {
      (map[ciclo][curso] || []).forEach(p => { if (dep[p] != null) dep[p]++ });
    });
  });
  return dep;
}

// ---------------------- Render
function renderAll() {
  topRow.innerHTML = "";
  bottomRow.innerHTML = "";

  const ciclos = Object.keys(mapaCursos).sort((a,b) => {
    const na = parseInt(a.replace(/\D/g,'')) || 0;
    const nb = parseInt(b.replace(/\D/g,'')) || 0;
    return na - nb;
  });

  const topC = ciclos.filter(c => (parseInt(c.replace(/\D/g,'')) || 0) <= 5);
  const bottomC = ciclos.filter(c => (parseInt(c.replace(/\D/g,'')) || 0) >= 6);

  const depCounts = calcularDependientes(mapaCursos);

  function crearCol(ciclo) {
    const col = document.createElement("div");
    col.className = "col-ciclo";
    col.dataset.cycle = ciclo;

    const header = document.createElement("div");
    header.className = "ciclo-header";
    header.textContent = ciclo;
    col.appendChild(header);

    const lista = document.createElement("div");
    lista.className = "lista-cursos";

    Object.keys(mapaCursos[ciclo]).forEach(nombreCurso => {
      const prereqs = mapaCursos[ciclo][nombreCurso] || [];
      const aprobado = estaAprobado(nombreCurso);
      const desbloqueado = prereqs.every(p => estaAprobado(p));
      const btn = document.createElement("button");
      btn.className = "curso";

      // rama class
      const rama = cursoARama[nombreCurso] || "rama-electivo";
      btn.classList.add(rama);

      // estado classes
      if (aprobado) btn.classList.add("aprobado");
      else if (!desbloqueado) btn.classList.add("bloqueado");
      else btn.classList.add("pendiente");

      btn.dataset.nombre = nombreCurso;

      const title = document.createElement("div");
      title.className = "curso-nombre";
      title.textContent = nombreCurso;
      btn.appendChild(title);

      if (prereqs.length > 0) {
        const meta = document.createElement("div");
        meta.className = "curso-meta curso-prereq";
        meta.textContent = `${prereqs.filter(p => !estaAprobado(p)).length} prereq`;
        btn.appendChild(meta);
      }

      // dependientes badge
      const dep = depCounts[nombreCurso] || 0;
      if (dep > 0) {
        const db = document.createElement("div");
        db.className = "dependientes-badge";
        db.textContent = dep;
        btn.appendChild(db);
      }

      // click
      btn.addEventListener("click", () => {
        if (!desbloqueado && !aprobado) return;
        estado[nombreCurso] = !aprobado;
        if (!estado[nombreCurso]) delete estado[nombreCurso];
        guardarLocal();
        renderAll();
        mostrarDetalle(nombreCurso, prereqs);
      });

      btn.addEventListener("mouseenter", () => mostrarDetalle(nombreCurso, prereqs));

      lista.appendChild(btn);
    });

    col.appendChild(lista);
    return col;
  }

  topC.forEach(c => topRow.appendChild(crearCol(c)));
  bottomC.forEach(c => bottomRow.appendChild(crearCol(c)));

  renderLegend();
}

// ---------------------- Detalle
function mostrarDetalle(nombre, prereqs) {
  const aprobado = estaAprobado(nombre);
  const rama = cursoARama[nombre] ? cursoARama[nombre].replace("rama-","").toUpperCase() : "ELECTIVO";
  const prereqHtml = (prereqs && prereqs.length>0) ? `<ul>${prereqs.map(p=>`<li>${p} ${estaAprobado(p)?'✓':'✗'}</li>`).join('')}</ul>` : '<em>Sin prerrequisitos</em>';

  detalleContenido.innerHTML = `
    <h3>${nombre}</h3>
    <p><strong>Rama:</strong> ${rama}</p>
    <p><strong>Estado:</strong> ${aprobado ? '<span style="color:#059669;font-weight:700">Aprobado</span>' : 'Pendiente'}</p>
    <p><strong>Prerrequisitos:</strong></p>
    ${prereqHtml}
  `;
}

// ---------------------- Buscador / filtro
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  $$('.curso').forEach(c => {
    const match = c.dataset.nombre.toLowerCase().includes(q);
    c.style.display = match ? '' : 'none';
  });
});

filterBranch.addEventListener('change', (e) => {
  const val = e.target.value;
  $$('.curso').forEach(c => {
    if (!val) { c.style.display = ''; return; }
    c.style.display = c.classList.contains(val) ? '' : 'none';
  });
});

// ---------------------- Theme
function setTheme(d) {
  document.body.classList.toggle('dark', !!d);
  localStorage.setItem('mallaThemeDark', !!d);
}
toggleThemeBtn.addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));
setTheme(localStorage.getItem('mallaThemeDark') === 'true');

// ---------------------- Reset / Export
resetBtn.addEventListener('click', () => {
  if (!confirm('Resetear todos los cursos?')) return;
  estado = {};
  guardarLocal();
  renderAll();
});

exportBtn.addEventListener('click', () => {
  const data = JSON.stringify(estado, null, 2);
  const a = document.createElement('a');
  a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
  a.download = 'estadoCursos.json';
  a.click();
});

// Exportar PDF con jsPDF (lista legible)
exportPdfBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFontSize(14);
  doc.text('Malla INFOSIL - Estado', 40, 50);
  let y = 80;
  Object.keys(mapaCursos).forEach(ciclo => {
    doc.setFontSize(12);
    doc.text(ciclo, 40, y); y += 18;
    Object.keys(mapaCursos[ciclo]).forEach(curso => {
      const estadoTxt = estaAprobado(curso) ? 'Aprobado' : 'Pendiente';
      doc.setFontSize(10);
      doc.text(`- ${curso} [${estadoTxt}]`, 60, y); y += 14;
      if (y > 740) { doc.addPage(); y = 40; }
    });
    y += 8;
  });
  doc.save('malla_estado.pdf');
});

// ---------------------- Legend render
function renderLegend() {
  const cyclesContainer = $("#legendCycles");
  const branchesContainer = $("#legendBranches");
  cyclesContainer.innerHTML = '';
  branchesContainer.innerHTML = '';

  // cycles legend (we'll show cycle headers color sample)
  const cycles = Object.keys(mapaCursos).sort((a,b)=> {
    const na = parseInt(a.replace(/\D/g,''))||0; const nb = parseInt(b.replace(/\D/g,''))||0; return na-nb;
  });
  cycles.forEach(ciclo => {
    const item = document.createElement('div'); item.className='item';
    const sw = document.createElement('div'); sw.className='swatch';
    // compute header background from computed style by creating temp col
    const temp = document.createElement('div'); temp.className='col-ciclo'; temp.style.display='none';
    temp.dataset.cycle = ciclo; document.body.appendChild(temp);
    const headerBg = getComputedStyle(temp).background || '';
    document.body.removeChild(temp);
    sw.style.background = headerBg || '#ddd';
    const label = document.createElement('div'); label.textContent = ciclo;
    item.appendChild(sw); item.appendChild(label);
    cyclesContainer.appendChild(item);
  });

  // branches legend
  Object.keys(ramas).forEach(r => {
    const item = document.createElement('div'); item.className='item';
    const sw = document.createElement('div'); sw.className='swatch';
    // small map of class to color
    sw.style.background = getBranchColor(r);
    const label = document.createElement('div'); label.textContent = r.replace('rama-','').toUpperCase();
    item.appendChild(sw); item.appendChild(label);
    branchesContainer.appendChild(item);
  });
}

// mapping rama->swatch color (should match CSS borders)
function getBranchColor(rama) {
  switch(rama) {
    case 'rama-ciencias': return 'linear-gradient(180deg,#ebf8ff,#dbeafe)'; // azul
    case 'rama-nutricion': return 'linear-gradient(180deg,#ecfdf5,#dcfce7)'; // verde
    case 'rama-publica': return 'linear-gradient(180deg,#faf5ff,#f3e8ff)'; // morado
    case 'rama-gestion': return 'linear-gradient(180deg,#fff7ed,#fff1e6)'; // naranja
    case 'rama-comunicacion': return 'linear-gradient(180deg,#fffbeb,#fef3c7)'; // amarillo
    case 'rama-deporte': return 'linear-gradient(180deg,#fff1f2,#ffe4e6)'; // rojo
    default: return 'linear-gradient(180deg,#f8fafc,#f1f5f9)'; // electivo gris
  }
}

// ---------------------- Firebase (opcional, placeholder)
function firebaseInit() {
  try {
    const cfg = {
      // pega tu firebaseConfig aquí si quieres usar nube
      // projectId: "tu_project_id"
    };
    if (!cfg.projectId) return;
    firebase.initializeApp(cfg);
    window.firestore = firebase.firestore();
  } catch (e) { console.warn('Firebase no configurado'); }
}
firebaseInit();

// ---------------------- Cargar cursos.json
async function cargar() {
  try {
    const res = await fetch('cursos.json', {cache: "no-store"});
    mapaCursos = await res.json();
    renderAll();
    // Fill branch select with nicer labels (after render)
    Object.keys(ramas).forEach(r => {
      const label = r.replace('rama-','').toUpperCase();
      // already populated, keep order
    });
  } catch (e) {
    console.error('Error cargando cursos.json', e);
    $("#mallaArea").innerHTML = "<p>Error cargando cursos.json</p>";
  }
}
cargar();
