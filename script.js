// script.js - Correcciones: click aprueba, estados: available/yellow, desbloqueado/green, aprobado/green dark

const $ = s => document.querySelector(s);
let mapaCursos = {};
let estado = JSON.parse(localStorage.getItem("estadoCursos") || "{}");

function estaAprobado(c){ return estado[c] === true; }
function guardar(){ localStorage.setItem("estadoCursos", JSON.stringify(estado)); }

const topRow = document.getElementById("topRow");
const bottomRow = document.getElementById("bottomRow");
const detalleContenido = document.getElementById("detalleContenido");

function renderAll(){
  topRow.innerHTML = "";
  bottomRow.innerHTML = "";

  const ciclos = Object.keys(mapaCursos)
    .sort((a,b)=>{
      const na = parseInt(a.replace(/\D/g,'')) || 0;
      const nb = parseInt(b.replace(/\D/g,'')) || 0;
      return na - nb;
    });

  // columns: 0-5 top, 6-10 bottom
  ciclos.forEach(ciclo=>{
    const numero = parseInt(ciclo.replace(/\D/g,'')) || 0;
    const column = document.createElement("div");
    column.className = "col-ciclo";
    column.dataset.cycle = ciclo;

    const header = document.createElement("div");
    header.className = "ciclo-header";
    header.textContent = ciclo;
    column.appendChild(header);

    const cursos = mapaCursos[ciclo] || {};
    Object.keys(cursos).forEach(nombre=>{
      const prereqs = cursos[nombre] || [];
      const desbloq = prereqs.length > 0 ? prereqs.every(p => estaAprobado(p)) : false;
      const availableByDefault = prereqs.length === 0;
      const aprobado = estaAprobado(nombre);

      const btn = document.createElement("button");
      btn.className = "curso";
      btn.dataset.nombre = nombre;

      // state classes order: aprobado > desbloqueado > available
      if (aprobado) btn.classList.add("aprobado");
      else if (desbloq) btn.classList.add("desbloqueado");
      else if (availableByDefault) btn.classList.add("available");

      btn.textContent = nombre;

      // click: allow toggle only if aprobado or desbloqueado or availableByDefault
      btn.onclick = () => {
        if (!aprobado && !desbloq && !availableByDefault) return;

        // toggle aprobado state
        estado[nombre] = !aprobado;
        if (!estado[nombre]) delete estado[nombre];

        guardar();
        renderAll();
      };

      btn.onmouseenter = () => {
        // Detalle EXACTO solicitado por el usuario
        detalleContenido.innerHTML = `
          <h2>Detalle del Curso</h2>
          <h3>${nombre}</h3>
          <p><strong>Prerrequisitos:</strong></p>
          <ul>${prereqs.length ? prereqs.map(p => `<li>${p}</li>`).join("") : "<li>Ninguno</li>"}</ul>
          <p><strong>Leyenda</strong></p>
          <ul>
            <li><strong>Gris (#A3A2A2):</strong> Bloque bloqueado</li>
            <li><strong>Amarillo (#F0F547):</strong> Disponible por ciclo (sin prerrequisitos)</li>
            <li><strong>Verde (#64FA64):</strong> Desbloqueado (prerrequisitos cumplidos)</li>
            <li><strong>Verde oscuro:</strong> Curso aprobado</li>
          </ul>
        `;
      };

      column.appendChild(btn);
    });

    if (numero <= 5) topRow.appendChild(column);
    else bottomRow.appendChild(column);
  });
}

// carga inicial
fetch("cursos.json")
  .then(r => r.json())
  .then(j => { mapaCursos = j; renderAll(); })
  .catch(e => {
    console.error("Error cargando cursos.json", e);
    document.getElementById("mallaArea").innerHTML = "<p>Error cargando cursos.json</p>";
  });
