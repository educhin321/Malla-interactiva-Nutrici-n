const $ = s => document.querySelector(s);
let mapaCursos = {};
let estado = JSON.parse(localStorage.getItem("estadoCursos") || "{}");

function estaAprobado(c){ return estado[c] === true; }
function guardar(){ localStorage.setItem("estadoCursos", JSON.stringify(estado)); }

const topRow = document.getElementById("topRow");
const bottomRow = document.getElementById("bottomRow");
const detalleContenido = document.getElementById("detalleContenido");

function renderAll(){
  topRow.innerHTML="";
  bottomRow.innerHTML="";

  const ciclos = Object.keys(mapaCursos)
    .sort((a,b)=>parseInt(a.replace(/\D/g,'')) - parseInt(b.replace(/\D/g,'')));

  ciclos.forEach(ciclo=>{
    const numero = parseInt(ciclo.replace(/\D/g,'')||0);

    const column = document.createElement("div");
    column.className="col-ciclo";
    column.dataset.cycle = ciclo;

    const header = document.createElement("div");
    header.className="ciclo-header";
    header.textContent = ciclo;
    column.appendChild(header);

    const cursos = mapaCursos[ciclo];

    Object.keys(cursos).forEach(nombre=>{
      const prereqs = cursos[nombre];
      const desbloq = prereqs.every(p=>estaAprobado(p));
      const aprobado = estaAprobado(nombre);

      const btn = document.createElement("button");
      btn.className="curso";

      if(aprobado) btn.classList.add("aprobado");
      else if(desbloq) btn.classList.add("desbloqueado");

      btn.textContent = nombre;

      btn.onclick = ()=>{
        if(!desbloq && !aprobado) return;

        estado[nombre] = !aprobado;
        if(!estado[nombre]) delete estado[nombre];

        guardar();
        renderAll();
      };

      btn.onmouseenter = ()=>{
        detalleContenido.innerHTML = `
          <h2>Detalle del Curso</h2>
          <h3>${nombre}</h3>
          <p><strong>Prerrequisitos:</strong></p>
          <ul>${prereqs.length ? prereqs.map(p=>`<li>${p}</li>`).join("") : "<li>Ninguno</li>"}</ul>
          <br>
          <p><strong>Leyenda</strong></p>
          <ul>
            <li><strong>Gris:</strong> Bloque bloqueado</li>
            <li><strong>Verde Claro:</strong> Bloque desbloqueado</li>
            <li><strong>Verde Oscuro:</strong> Curso aprobado</li>
          </ul>
        `;
      };

      column.appendChild(btn);
    });

    if(numero <= 5) topRow.appendChild(column);
    else bottomRow.appendChild(column);
  });
}

fetch("cursos.json")
  .then(r=>r.json())
  .then(j=>{
    mapaCursos=j;
    renderAll();
  });
