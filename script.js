// ===========================================================
//  SCRIPT PRINCIPAL DE LA MALLA INTERACTIVA
//  Funciones:
//  • Carga cursos.json
//  • Renderiza columnas por ciclo
//  • Maneja estados (aprobado/bloqueado)
//  • Guarda progreso en localStorage
//  • Desbloquea cursos automáticamente
//  • Panel lateral con detalle del curso
// ===========================================================

(async function () {
  const mallaContainer = document.getElementById('mallaContainer');
  const detalleContenido = document.getElementById('detalleContenido');
  const resetBtn = document.getElementById('resetBtn');
  const exportBtn = document.getElementById('exportBtn');

  // Estado persistente
  let estado = JSON.parse(localStorage.getItem('estadoCursos')) || {};

  function estaAprobado(nombre) {
    return estado[nombre] === true;
  }

  function guardar() {
    localStorage.setItem('estadoCursos', JSON.stringify(estado));
  }

  // Resetear estado
  resetBtn.addEventListener('click', () => {
    if (!confirm('¿Deseas resetear todos los cursos (quitar aprobados)?')) return;
    estado = {};
    guardar();
    render(mapaCursos);
  });

  // Exportar progreso
  exportBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(estado, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "estadoCursos.json");
    dlAnchor.click();
  });

  // Cargar cursos.json
  let mapaCursos = {};
  try {
    const res = await fetch('cursos.json', { cache: "no-store" });
    if (!res.ok) throw new Error('No se pudo cargar cursos.json');
    mapaCursos = await res.json();
  } catch (error) {
    mallaContainer.innerHTML =
      `<p class="error">Error cargando cursos.json: ${error.message}</p>`;
    return;
  }

  // Verificar prerrequisitos
  function prerrequisitosCumplidos(prereqs) {
    if (!prereqs || prereqs.length === 0) return true;
    return prereqs.every(p => estaAprobado(p));
  }

  // Render principal
  function render(mapa) {
    mallaContainer.innerHTML = '';

    const ciclos = Object.keys(mapa).sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return na - nb;
    });

    ciclos.forEach(ciclo => {
      const col = document.createElement('div');
      col.className = 'col-ciclo';

      const header = document.createElement('div');
      header.className = 'ciclo-header';
      header.textContent = ciclo;
      col.appendChild(header);

      const lista = document.createElement('div');
      lista.className = 'lista-cursos';

      Object.keys(mapa[ciclo]).forEach(nombreCurso => {
        const prereqs = mapa[ciclo][nombreCurso];
        const aprobado = estaAprobado(nombreCurso);
        const desbloqueado = prerrequisitosCumplidos(prereqs);

        const card = document.createElement('button');
        card.className = 'curso';
        card.setAttribute('type', 'button');
        card.dataset.nombre = nombreCurso;

        card.classList.toggle('aprobado', aprobado);
        card.classList.toggle('bloqueado', !desbloqueado && !aprobado);

        const title = document.createElement('div');
        title.className = 'curso-nombre';
        title.textContent = nombreCurso;
        card.appendChild(title);

        if (prereqs.length > 0) {
          const badge = document.createElement('div');
          badge.className = 'curso-prereq';
          const faltantes = prereqs.filter(p => !estaAprobado(p));
          badge.textContent = faltantes.length === 0
            ? 'Prer. OK'
            : `${faltantes.length} prereq`;
          card.appendChild(badge);
        }

        // Click: aprobar si está desbloqueado
        card.addEventListener('click', () => {
          if (!desbloqueado && !aprobado) {
            card.classList.add('shake');
            setTimeout(() => card.classList.remove('shake'), 350);
            return;
          }

          estado[nombreCurso] = !aprobado;
          if (estado[nombreCurso] === false) delete estado[nombreCurso];

          guardar();
          render(mapaCursos);
          mostrarDetalle(nombreCurso, prereqs);
        });

        // Mostrar detalle
        card.addEventListener('mouseenter', () =>
          mostrarDetalle(nombreCurso, prereqs)
        );
        card.addEventListener('focus', () =>
          mostrarDetalle(nombreCurso, prereqs)
        );

        lista.appendChild(card);
      });

      col.appendChild(lista);
      mallaContainer.appendChild(col);
    });
  }

  // Panel lateral de detalles
  function mostrarDetalle(nombre, prereqs) {
    const aprobado = estaAprobado(nombre);
    const prereqHtml =
      (prereqs && prereqs.length > 0)
        ? `<ul>${prereqs
            .map(p => `<li>${p} ${estaAprobado(p) ? '✓' : '✗'}</li>`)
            .join('')}</ul>`
        : '<em>Sin prerrequisitos</em>';

    detalleContenido.innerHTML = `
      <h3>${nombre}</h3>
      <p><strong>Estado:</strong> ${
        aprobado
          ? '<span class="estado aprobado">Aprobado</span>'
          : '<span class="estado pendiente">Pendiente</span>'
      }</p>
      <p><strong>Prerrequisitos:</strong></p>
      ${prereqHtml}
    `;
  }

  // Render inicial
  render(mapaCursos);

  // Mostrar detalle de curso aprobado si existe
  const aprobados = Object.keys(estado || {}).filter(k => estado[k]);
  if (aprobados.length > 0) {
    const curso = aprobados[0];
    const prereqs = (() => {
      for (let ciclo in mapaCursos) {
        if (mapaCursos[ciclo][curso]) return mapaCursos[ciclo][curso];
      }
      return [];
    })();
    mostrarDetalle(curso, prereqs);
  }
})();
