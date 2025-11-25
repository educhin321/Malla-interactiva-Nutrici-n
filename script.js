// ============================================
// script.js — COMPLETO Y COMPATIBLE
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
  .forEach(([r,list]) => list.forEach(c => cursoARama[c]=r));

const topRow = $("#topRow");
const bottomRow = $("#bottomRow");
const detalleContenido = $("#detalleContenido");

function estaAprobado(c){ return estado[c] === true; }
function guardarLocal(){ localStorage.setItem("estadoCursos",JSON.stringify(estado)); }

function calcularDependientes(map){
  const dep={};
  Object.keys(map).forEach(ciclo=>{
    Object.keys(map[ciclo]).forEach(n=>dep[n]=0);
  });
  Object.keys(map).forEach(ciclo=>{
    Object.keys(map[ciclo]).forEach(c=>{
      (map[ciclo][c]||[]).forEach(p=>dep[p]++);
    });
  });
  return dep;
}

function renderAll(){
  topRow.innerHTML=""; bottomRow.innerHTML="";
  const ciclos = Object.keys(mapaCursos)
    .sort((a,b)=>(parseInt(a.replace(/\D/g,''))||0)-(parseInt(b.replace(/\D/g,''))||0));

  const topC = ciclos.filter(c => (parseInt(c.replace(/\D/g,''))||0) <= 5);
  const botC = ciclos.filter(c => (parseInt(c.replace(/\D/g,''))||0) >= 6);

  const depCounts = calcularDependientes(mapaCursos);

  function col(ciclo){
    const box=document.createElement("div");
    box.className="col-ciclo"; box.dataset.cycle=ciclo;

    const header=document.createElement("div");
    header.className="ciclo-header";
    header.textContent=ciclo;
    box.appendChild(header);

    const list=document.createElement("div");
    list.className="lista-cursos";

    Object.keys(mapaCursos[ciclo]).forEach(nombre=>{
      const prereqs=mapaCursos[ciclo][nombre]||[];
      const aprobado=estaAprobado(nombre);
      const desbloqueado=prereqs.every(p=>estaAprobado(p));

      const btn=document.createElement("button");
      btn.className="curso";

      if(aprobado) btn.classList.add("aprobado");
      else if(desbloqueado) btn.classList.add("desbloqueado");

      btn.dataset.nombre=nombre;

      const title=document.createElement("div");
      title.className="curso-nombre";
      title.textContent=nombre;
      btn.appendChild(title);

      btn.addEventListener("click",()=>{
        if(!desbloqueado && !aprobado) return;
        estado[nombre]=!aprobado;
        if(!estado[nombre]) delete estado[nombre];
        guardarLocal();
        renderAll();
      });

      btn.addEventListener("mouseenter",()=>{
        mostrarDetalle(nombre,prereqs);
      });

      list.appendChild(btn);
    });

    box.appendChild(list);
    return box;
  }

  topC.forEach(c=>topRow.appendChild(col(c)));
  botC.forEach(c=>bottomRow.appendChild(col(c)));
}

function mostrarDetalle(nombre, prereqs){
  detalleContenido.innerHTML=`
    <h3>${nombre}</h3>
    <p><strong>Prerrequisitos:</strong></p>
    <ul>${prereqs.map(p=>`<li>${p}</li>`).join("")}</ul>
  `;
}

function cargar(){
  fetch("cursos.json")
    .then(r=>r.json())
    .then(j=>{ mapaCursos=j; renderAll(); });
}

cargar();
