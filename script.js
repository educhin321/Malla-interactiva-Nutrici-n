const grid = document.getElementById("grid");

// Tamaño de la malla
const filas = 10;
const columnas = 10;

// Crear celdas dinámicamente
for (let i = 0; i < filas * columnas; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    // Interactividad: cambiar color al hacer clic
    cell.addEventListener("click", () => {
        cell.classList.toggle("active");
    });

    grid.appendChild(cell);
}
