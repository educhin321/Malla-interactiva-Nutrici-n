// script.js - Malla interactiva mejorada
// Requisitos: cursos.json en el mismo directorio, jsPDF y Firebase SDKs cargados en HTML.

// -------------------- UTILIDADES --------------------
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

/* Estado global */
let mapaCursos = {};
let estado = JSON.parse(localStorage.getItem('estadoCursos')) || {};
let firebaseConfigured = false;
let firestore = null;

// SVG para líneas
const svg = document.getElementById('linesSvg');

// DOM
const topRow = document.getElementById('topRow');
const bottomRow = document.getElementById('bottomRow');
const detalleContenido = document.getElementById('detalleContenido');
const searchInput = document.getElementById('searchInput');
const toggleThemeBtn = document.getElementById('toggleTheme');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const saveCloudBtn = document.getElementById('saveCloudBtn');
const loadCloudBtn = document.getElementById('loadCloudBtn');

// -------------------- CARGA DE CURSOS --------------------
async function cargarCursos() {
  try {
    const res = await fetch('cursos.json', {cache: "no-store"});
    if (!res.ok) throw new Error('No se encontró cursos.json');
    mapaCursos = await res.json();
    renderAll();
  } catch (e) {
    document.getElementById('mallaWrapper').innerHTML = `<p class="error">Error cargando cursos.json: ${e.message}</p>`;
    console.error(e);
  }
}

// -------------------- HELPERS DE ESTADO --------------------
function estaAprobado(nombre) {
  return estado[nombre] === true;
}
function guardarLocal() {
  localStorage.setItem('estadoCursos', JSON.stringify(estado));
}

// calcula cuántos cursos dependen directamente de cada curso
function calcularDependientes(map) {
  const depCount = {};
  Object.keys(map).forEach(ciclo => {
    Object.keys(map[ciclo]).forEach(curso => depCount[curso] = 0);
  });
  Object.keys(map).forEach(ciclo => {
    Object.keys(map[ciclo]).forEach(curso => {
      const prereqs = map[ciclo][curso] || [];
      prereqs.forEach(p => { if (depCount[p] !== undefined) depCount[p]++ });
    });
  });
  return depCount;
}

// -------------------- RENDER --------------------
function renderAll() {
  topRow.innerHTML = '';
  bottomRow.innerHTML = '';
  svg.innerHTML = '';

  // decide filas: ciclos 0-5 top, 6-10 bottom
  const order = Object.keys(mapaCursos).sort((a,b)=> {
    const na = parseInt(a.replace(/\D/g,'')) || (a.toLowerCase().includes('0')?0:0);
    const nb = parseInt(b.replace(/\D/g,'')) || 0;
    return na - nb;
  });

  const top = order.filter(c => {
    const n = parseInt(c.replace(/\D/g,'')) || 0;
    return n <= 5;
  });
  const bottom = order.filter(c => {
    const n = parseInt(c.replace(/\D/g,'')) || 0;
    return n >= 6;
  });

  const depCounts = calcularDependientes(mapaCursos);

  function crearCol(ciclo) {
    const col = document.createElement('div');
    col.className = 'col-ciclo';
    const header = document.createElement('div');
    header.className = 'ciclo-header';
    header.textContent = ciclo;
    col.appendChild(header);

    const lista = document.createElement('div');
    lista.className = 'lista-cursos';

    Object.keys(mapaCursos[ciclo]).forEach(nombreCurso => {
      const prereqs = mapaCursos[ciclo][nombreCurso] || [];
      const aprobado = estaAprobado(nombreCurso);
      const desbloqueado = prereqs.every(p => estaAprobado(p));
      const cursoBtn = document.createElement('button');
      cursoBtn.className = 'curso';
      cursoBtn.type = 'button';
      cursoBtn.dataset.nombre = nombreCurso;

      // color por dependientes
      const dep = depCounts[nombreCurso] || 0;
      const depClass = dep >= 4 ? 'dep-4' : `dep-${dep}`;
      cursoBtn.classList.add(depClass);

      if (aprobado) cursoBtn.classList.add('aprobado');
      else if (!desbloqueado) cursoBtn.classList.add('bloqueado');
      else cursoBtn.classList.add('pendiente');

      const title = document.createElement('div');
      title.className = 'curso-nombre';
      title.textContent = nombreCurso;
      cursoBtn.appendChild(title);

      if (prereqs.length > 0) {
        const badge = document.createElement('div');
        badge.className = 'curso-prereq';
        const faltantes = prereqs.filter(p => !estaAprobado(p));
        badge.textContent = faltantes.length === 0 ? 'Prer. OK' : `${faltantes.length} prereq`;
        cursoBtn.appendChild(badge);
      }

      if (dep > 0) {
        const db = document.createElement('div');
        db.className = 'dependientes-badge';
        db.textContent = dep;
        cursoBtn.appendChild(db);
      }

      // eventos
      cursoBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        if (!desbloqueado && !aprobado) {
          cursoBtn.classList.add('shake');
          setTimeout(()=>cursoBtn.classList.remove('shake'),350);
          return;
        }
        estado[nombreCurso] = !aprobado;
        if (estado[nombreCurso] === false) delete estado[nombreCurso];
        guardarLocal();
        renderAll();
        mostrarDetalle(nombreCurso,prereqs);
      });

      cursoBtn.addEventListener('mouseenter', ()=> mostrarDetalle(nombreCurso,prereqs));
      cursoBtn.addEventListener('focus', ()=> mostrarDetalle(nombreCurso,prereqs));

      lista.appendChild(cursoBtn);
    });

    col.appendChild(lista);
    return col;
  }

  top.forEach(c => topRow.appendChild(crearCol(c)));
  bottom.forEach(c => bottomRow.appendChild(crearCol(c)));

  // después de renderizar, dibujar líneas
  requestAnimationFrame(drawLines);
}

// -------------------- LÍNEAS ENTRE PRERREQUISITOS --------------------
function getCenterRect(el) {
  const r = el.getBoundingClientRect();
  const svgR = svg.getBoundingClientRect();
  return {
    x: r.left + r.width/2 - svgR.left + svg.scrollLeft,
    y: r.top + r.height/2 - svgR.top + svg.scrollTop,
    elRect: r
  };
}

function clearSvg() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function drawLines() {
  clearSvg();
  // map nombre -> element
  const cursoElems = {};
  $$('.curso').forEach(el => cursoElems[el.dataset.nombre] = el);

  // for each course, draw line from prereq -> curso
  Object.keys(mapaCursos).forEach(ciclo => {
    Object.keys(mapaCursos[ciclo]).forEach(curso => {
      const prereqs = mapaCursos[ciclo][curso] || [];
      prereqs.forEach(pr => {
        const fromEl = cursoElems[pr];
        const toEl = cursoElems[curso];
        if (!fromEl || !toEl) return;
        // compute centers
        const a = getCenterRect(fromEl);
        const b = getCenterRect(toEl);
        // create path (curved)
        const path = document.createElementNS('http://www.w3.org/2000/svg','path');
        const dx = Math.abs(b.x - a.x);
        const dir = b.x >= a.x ? 1 : -1;
        const cp1x = a.x + dx*0.35*dir;
        const cp1y = a.y;
        const cp2x = b.x - dx*0.35*dir;
        const cp2y = b.y;
        const d = `M ${a.x} ${a.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${b.x} ${b.y}`;
        path.setAttribute('d', d);

        // color & thickness based on estado
        const both = (estado[pr] === true) && (estado[curso] === true);
        const one = (estado[pr] === true) && !(estado[curso] === true);
        const none = !(estado[pr] === true);

        let stroke = '#9ca3af'; // default gris
        if (both) stroke = '#34d399';
        else if (one) stroke = '#60a5fa';
        else stroke = '#f87171';

        path.setAttribute('stroke', stroke);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-width', both ? '3' : '2');
        path.setAttribute('opacity', '0.95');
        // draw animated stroke
        path.style.strokeDasharray = path.getTotalLength();
        path.style.strokeDashoffset = path.getTotalLength();
        svg.appendChild(path);
        // trigger draw
        requestAnimationFrame(()=> {
          path.style.transition = 'stroke-dashoffset 520ms ease-out';
          path.style.strokeDashoffset = '0';
        });
      });
    });
  });
}

// redraw on resize & scroll to keep lines in sync
window.addEventListener('resize', ()=> {
  requestAnimationFrame(drawLines);
});
document.getElementById('mallaWrapper').addEventListener('scroll', ()=> requestAnimationFrame(drawLines));

// -------------------- DETALLE --------------------
function mostrarDetalle(nombre, prereqs) {
  const aprobado = estaAprobado(nombre);
  const prereqHtml = (prereqs && prereqs.length>0) ? `<ul>${prereqs.map(p=>`<li>${p} ${estaAprobado(p)?'✓':'✗'}</li>`).join('')}</ul>` : '<em>Sin prerrequisitos</em>';
  detalleContenido.innerHTML = `
    <h3>${nombre}</h3>
    <p><strong>Estado:</strong> ${aprobado?'<span class="estado aprobado">Aprobado</span>':'<span class="estado pendiente">Pendiente</span>'}</p>
    <p><strong>Prerrequisitos:</strong></p>
    ${prereqHtml}
  `;
}

// -------------------- BUSCADOR --------------------
searchInput.addEventListener('input', (e)=> {
  const q = (e.target.value || '').toLowerCase().trim();
  $$('.col-ciclo').forEach(col => {
    let anyVisible = false;
    $$(col).forEach; // noop to satisfy linters
    $$('.curso', col); // noop
    Array.from(col.querySelectorAll('.curso')).forEach(c => {
      const name = c.dataset.nombre.toLowerCase();
      const match = name.includes(q);
      c.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    // hide entire column if no match
    col.style.display = anyVisible ? '' : 'none';
  });
  requestAnimationFrame(drawLines);
});

// -------------------- THEME --------------------
function setTheme(dark) {
  document.body.classList.toggle('dark', !!dark);
  localStorage.setItem('mallaThemeDark', !!dark);
}
toggleThemeBtn.addEventListener('click', ()=> {
  const isDark = !document.body.classList.contains('dark');
  setTheme(isDark);
});
setTheme(localStorage.getItem('mallaThemeDark') === 'true');

// -------------------- RESET & EXPORT --------------------
resetBtn.addEventListener('click', ()=> {
  if (!confirm('¿Deseas resetear todos los cursos (quitar aprobados)?')) return;
  estado = {};
  guardarLocal();
  renderAll();
});

exportBtn.addEventListener('click', ()=> {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(estado,null,2));
  const a = document.createElement('a'); a.href = dataStr; a.download = 'estadoCursos.json'; a.click();
});

// -------------------- EXPORTAR A PDF (jsPDF) --------------------
exportPdfBtn.addEventListener('click', async ()=> {
  // crea una imagen de la malla (simple): vamos a clonar el wrapper y renderizarlo en canvas usando SVG2PNG no disponible;
  // usamos jsPDF con texto básico: lista de cursos con su estado.
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:'pt',format:'a4'});
  doc.setFontSize(14);
  doc.text('Malla completada - INFOSIL', 40, 50);
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

// -------------------- FIREBASE (GUARDAR/CARGAR NUBE) --------------------
/*
  INSTRUCCIONES:
  1) Ve a console.firebase.google.com y crea un proyecto (si no tienes uno).
  2) Habilita Firestore (modo en pruebas o con reglas seguras).
  3) Copia tu firebaseConfig (objeto) y pégalo en la variable `firebaseConfig` abajo.
  4) Opcional: cambia `userId` por tu UID (o deja 'default_user').
*/

const firebaseInit = () => {
  try {
    // ----------------------------
    // Pega tu firebaseConfig aquí:
    // ----------------------------
    const firebaseConfig = {
      // apiKey: "TU_API_KEY",
      // authDomain: "TU_PROYECTO.firebaseapp.com",
      // projectId: "TU_PROYECTO",
      // storageBucket: "TU_PROYECTO.appspot.com",
      // messagingSenderId: "SENDER_ID",
      // appId: "APP_ID"
    };
    // si no hay projectId asumimos no configurado
    if (!firebaseConfig || !firebaseConfig.projectId) {
      firebaseConfigured = false;
      console.info('Firebase no configurado. Para usar la nube pega tu firebaseConfig en script.js.');
      return;
    }
    // init
    const app = firebase.initializeApp(firebaseConfig);
    firestore = firebase.firestore();
    firebaseConfigured = true;
    console.info('Firebase inicializado (Firestore).');
  } catch (e) {
    console.error('Error inicializando Firebase:', e);
    firebaseConfigured = false;
  }
};
firebaseInit();

saveCloudBtn.addEventListener('click', async ()=> {
  if (!firebaseConfigured) return alert('Firebase no está configurado. Pegá tu firebaseConfig en script.js.');
  try {
    const userId = 'default_user';
    await firestore.collection('mallas').doc(userId).set({ estado, updatedAt: Date.now() });
    alert('Guardado en la nube correctamente.');
  } catch (e) {
    console.error(e);
    alert('Error guardando en la nube: ' + e.message);
  }
});
loadCloudBtn.addEventListener('click', async ()=> {
  if (!firebaseConfigured) return alert('Firebase no está configurado. Pegá tu firebaseConfig en script.js.');
  try {
    const userId = 'default_user';
    const doc = await firestore.collection('mallas').doc(userId).get();
    if (!doc.exists) return alert('No se encontró estado en la nube.');
    estado = doc.data().estado || {};
    guardarLocal();
    renderAll();
    alert('Estado cargado desde la nube.');
  } catch (e) {
    console.error(e);
    alert('Error cargando desde la nube: ' + e.message);
  }
});

// -------------------- INICIALIZACIÓN --------------------
cargarCursos();
