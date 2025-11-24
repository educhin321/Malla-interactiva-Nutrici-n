// ============================================
// script.js — COMPLETO
// ============================================

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let mapaCursos = {};
let estado = JSON.parse(localStorage.getItem("estadoCursos") || "{}");

const ramas = {
  "rama-ciencias":[
    "BIOLOGÍA","QUÍMICA GENERAL","QUÍMICA ORGÁNICA",
    "BIOQUÍMICA APLICADA A LA NUTRICIÓN","BIOQUÍMICA ALIMENTARIA",
    "BROMATOLOGÍA DE LOS ALIMENTOS",
    "MICROBIOLOGÍA Y PARASITOLOGÍA APLICADA A LA NUTRICIÓN",
    "FISIOPATOLOGÍA DE LA NUTRICIÓN","TOXICOLOGÍA ALIMENTARIA",
    "FOOD TECHNOLOGY"
  ],
  "rama-nutricion":[
    "INTRODUCCIÓN A LA NUTRICIÓN Y VIDA SALUDABLE",
    "FUNDAMENTOS DE LA SALUD: MACRO Y MICRONUTRIENTES",
    "NUTRICIÓN EN ETAPAS FISIOLÓGICAS",
    "VALORACIÓN NUTRICIONAL EN ETAPAS DE LA VIDA",
    "DIETÉTICA Y PROGRAMACIÓN DE DIETAS",
    "DIETOTERAPIA DEL NIÑO Y DEL ADULTO",
    "NUTRICIÓN CLÍNICA",
    "NUTRICIÓN CLÍNICA II",
    "NUTRICIÓN CLÍNICA III",
    "NUTRICIÓN CLÍNICA IV",
    "SOPORTE NUTRICIONAL",
    "ALIMENTOS FUNCIONALES Y NUTRACEÚTICOS",
    "NUTRICIÓN EN EL EJERCICIO Y DEPORTE",
    "SUPLEMENTACIÓN NUTRICIONAL EN DEPORTISTAS"
  ],
  "rama-publica":[
    "SITUACIÓN ALIMENTARIA Y NUTRICIONAL",
    "EPIDEMIOLOGÍA NUTRICIONAL",
    "NUTRICIÓN PÚBLICA",
    "DISEÑO DE PROGRAMAS Y POLÍTICAS EN NUTRICIÓN PÚBLICA",
    "PRÁCTICAS PRE-PROFESIONALES EN LA COMUNIDAD",
    "EVALUACIÓN Y DIAGNÓSTICO EN NUTRICIÓN PÚBLICA"
  ],
  "rama-gestion":[
    "ADMINISTRACIÓN PARA LOS NEGOCIOS",
    "MARKETING",
    "GESTIÓN EN SERVICIOS Y NEGOCIOS DE ALIMENTACIÓN Y NUTRICIÓN",
    "OPORTUNIDADES DE NEGOCIOS",
    "FUNDAMENTOS CONTABLES Y FINANCIEROS",
    "PRINCIPIOS DE ECONOMÍA"
  ],
  "rama-comunicacion":[
    "LENGUAJE Y COMUNICACIÓN I",
    "LENGUAJE Y COMUNICACIÓN II",
    "COMUNICACIÓN CIENTÍFICA",
    "EDUCACIÓN Y COMUNICACIÓN EFECTIVA EN NUTRICIÓN",
    "PSICOLOGÍA APLICADA A LA NUTRICIÓN",
    "ÉTICA Y CIUDADANÍA",
    "FUNDAMENTOS DEL LIDERAZGO SOSTENIBLE"
  ],
  "rama-deporte":[
    "EVALUACIÓN NUTRICIONAL EN DEPORTISTAS",
    "TRATAMIENTO DEL EJERCICIO SALUDABLE",
    "PLANIFICACIÓN Y DISEÑO DE DIETAS EN DEPORTISTAS",
    "COACHING EN LA NUTRICIÓN DEPORTIVA"
  ],
  "rama-electivo":[
    "REALIDAD NACIONAL Y GLOBALIZACIÓN",
    "FUNDAMENTOS EN COMPETENCIAS DIGITALES",
    "ANTROPOLOGÍA NUTRICIONAL",
    "PRIMEROS AUXILIOS EN SALUD",
    "INTERACCIÓN FÁRMACO NUTRIENTE",
    "TÉCNICAS DE COMPORTAMIENTO",
    "NEUROCIENCIAS APLICADAS A LA NUTRICIÓN",
    "NUTRICIÓN FUNCIONAL E INVESTIGACIÓN"
  ],
  "rama-ingles":[
    "ENGLISH I","ENGLISH II","ENGLISH III","ENGLISH IV"
  ]
};

const cursoARama = {};
Object.entries(ramas)
  .forEach(([r, list]) => list.forEach(c => cursoARama[c] = r));

const topRow = $("#topRow");
const bottomRow = $("#bottomRow");
const detalleContenido = $("#detalleContenido");
const searchInput = $("#searchInput");
const filterBranch = $("#filterBranch");
const toggleThemeBtn = $("#toggleTheme");
const resetBtn = $("#resetBtn");
const exportBtn = $("#exportBtn");
const exportPdfBtn = $("#exportPdfBtn");

Object.keys(ramas).forEach(r => {
  const opt = document.createElement("option");
  opt.value = r;
  opt.textContent = r.replace("rama-","").toUpperCase();
  filterBranch.appendChild(opt);
});

const estaAprobado = c => estado[c] === true;
const guardarLocal = () =>
  localStorage.setItem("estadoCursos", JSON.stringify(estado));

function calcularDependientes(map){
  const dep = {};
  Object.keys(map).forEach(c => {
    Object.keys(map[c]).forEach(nombre => dep[nombre] = 0);
  });
  Object.keys(map).forEach(c => {
    Object.keys(map[c]).forEach(cur => {
      (map[c][cur] || []).forEach(p => { dep[p]++; });
    });
  });
  return dep;
}

function renderAll(){
  topRow.innerHTML = "";
  bottomRow.innerHTML = "";

  const ciclos = Object.keys(mapaCursos)
    .sort((a,b)=>(parseInt(a.replace(/\D/g,''))||0)-(parseInt(b.replace(/\D/g,''))||0));

  const topC = ciclos.filter(c => (parseInt(c.replace(/\D/g,''))||0) <= 5);
  const botC = ciclos.filter(c => (parseInt(c.replace(/\D/g,''))||0) >= 6);

  const depCounts = calcularDependientes(mapaCursos);

  function col(ciclo){
    const box = document.createElement("div");
    box.className = "col-ciclo";
    box.dataset.cycle = ciclo;

    const header = document.createElement("div");
    header.className = "ciclo-header";
    header.textContent = ciclo;
    box.appendChild(header);

    const list = document.createElement("div");
    list.className = "lista-cursos";

    Object.keys(mapaCursos[ciclo]).forEach(nombre => {
      const prereqs = mapaCursos[ciclo][nombre] || [];
      const aprobado = estaAprobado(nombre);
      const desbloqueado = prereqs.every(p => estaAprobado(p));

      const btn = document.createElement("button");
      btn.className = "curso";

      const rama = cursoARama[nombre] || "rama-electivo";
      btn.classList.add(rama);

      if (aprobado){
        btn.classList.add("aprobado");
      } else if (desbloqueado){
        btn.classList.add("desbloqueado");
      }

      btn.dataset.nombre = nombre;

      const title = document.createElement("div");
      title.className = "curso-nombre";
      title.textContent = nombre;
      btn.appendChild(title);

      if (prereqs.length > 0){
        const m = document.createElement("div");
        m.className = "curso-meta curso-prereq";
        m.textContent = `${prereqs.filter(p=>!estaAprobado(p)).length} prereq`;
        btn.appendChild(m);
      }

      const dep = depCounts[nombre] || 0;
      if (dep > 0){
        const d = document.createElement("div");
        d.className = "dependientes-badge";
        d.textContent = dep;
        btn.appendChild(d);
      }

      btn.addEventListener("click",()=>{
        if (!desbloqueado && !aprobado) return;
        estado[nombre] = !aprobado;
        if (!estado[nombre]) delete estado[nombre];
        guardarLocal(); renderAll();
        mostrarDetalle(nombre,prereqs);
      });

      btn.addEventListener("mouseenter",()=>mostrarDetalle(nombre,prereqs));

      list.appendChild(btn);
    });

    box.appendChild(list);
    return box;
  }

  topC.forEach(c=>topRow.appendChild(col(c)));
  botC.forEach(c=>bottomRow.appendChild(col(c)));

  renderLegend();
}

function mostrarDetalle(nombre, prereqs){
  const aprobado = estaAprobado(nombre);
  const rama = cursoARama[nombre]?.replace("rama-","").toUpperCase() || "SIN RAMA";
  const list = prereqs?.length
    ? `<ul>${prereqs.map(p=>`<li>${p} ${estaAprobado(p)?'✓':'✗'}</li>`).join("")}</ul>`
    : `<em>Sin prerrequisitos</em>`;

  detalleContenido.innerHTML = `
    <h3>${nombre}</h3>
    <p><strong>Rama:</strong> ${rama}</p>
    <p><strong>Estado:</strong> ${aprobado ? 'Aprobado' : 'Pendiente'}</p>
    <p><strong>Prerrequisitos:</strong></p>${list}
  `;
}

searchInput.addEventListener("input", e =>{
  const q = e.target.value.toLowerCase().trim();
  $$(".curso").forEach(x=>{
    x.style.display = x.dataset.nombre.toLowerCase().includes(q) ? "" : "none";
  });
});

filterBranch.addEventListener("change", e=>{
  const v = e.target.value;
  $$(".curso").forEach(c=>{
    if (!v){ c.style.display = ""; return;}
    c.style.display = c.classList.contains(v) ? "" : "none";
  });
});

function setTheme(d){
  document.body.classList.toggle("dark", d);
  localStorage.setItem("themeDark", d);
}
toggleThemeBtn.addEventListener("click",()=>setTheme(!document.body.classList.contains("dark")));
setTheme(localStorage.getItem("themeDark")==="true");

resetBtn.addEventListener("click",()=>{
  if (!confirm("¿Resetear progreso?")) return;
  estado = {}; guardarLocal(); renderAll();
});

exportBtn.addEventListener("click",()=>{
  const blob = new Blob([JSON.stringify(estado,null,2)],{type:"application/json"});
  const a = document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="estadoCursos.json";
  a.click();
});

exportPdfBtn.addEventListener("click",()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Estado de Malla INFOSIL",20,20);
  let y=40;
  Object.keys(mapaCursos).forEach(c=>{
    doc.text(c,20,y); y+=14;
    Object.keys(mapaCursos[c]).forEach(cur=>{
      doc.text(`- ${cur}: ${estaAprobado(cur)?'Aprobado':'Pendiente'}`,28,y);
      y+=12; if (y>280){ doc.addPage(); y=20; }
    });
    y+=6;
  });
  doc.save("malla.pdf");
});

function renderLegend(){
  const C=$("#legendCycles");
  const B=$("#legendBranches");
  C.innerHTML=""; B.innerHTML="";

  // ramas
  Object.entries(ramas).forEach(([r,_])=>{
    const item=document.createElement("div");
    item.className="item";
    const sw=document.createElement("div");
    sw.className="swatch";
    sw.style.background=getColorRama(r);
    const t=document.createElement("div");
    t.textContent=r.replace("rama-","").toUpperCase();
    item.appendChild(sw); item.appendChild(t);
    B.appendChild(item);
  });
}

function getColorRama(r){
  const map = {
    "rama-ciencias":"#3B82F6",
    "rama-nutricion":"#22C55E",
    "rama-publica":"#A855F7",
    "rama-gestion":"#F97316",
    "rama-comunicacion":"#EAB308",
    "rama-deporte":"#EF4444",
    "rama-electivo":"#6B7280",
    "rama-ingles":"#FACC15"
  };
  return map[r] || "#CCC";
}

function cargar(){
  fetch("cursos.json")
    .then(r=>r.json())
    .then(j=>{ mapaCursos=j; renderAll(); });
}
cargar();
