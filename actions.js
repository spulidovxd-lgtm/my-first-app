// Variables principales
let clicks = 0;
let inicio = null;
let modo = "total";

// Elementos HTML
const contador = document.getElementById("contador");

const boton = document.getElementById("clickBtn");
const resetBtn = document.getElementById("resetBtn");

const totalBtn = document.getElementById("totalBtn");
const cpsBtn = document.getElementById("cpsBtn");

const modoLabel = document.getElementById("modoLabel");
const unidad = document.getElementById("unidad");

const tituloEvento = document.getElementById("tituloEvento");
const tituloPrincipal = document.getElementById("tituloPrincipal");

// Cambiar el título en tiempo real
tituloEvento.addEventListener("input", function () {
    tituloPrincipal.textContent =
        tituloEvento.value.trim() || "Colegio Bolívar";
});

// Alternar a clicks totales
totalBtn.addEventListener("click", function () {
    modo = "total";

    totalBtn.classList.add("active");
    cpsBtn.classList.remove("active");

    modoLabel.textContent = "Clicks registrados";
    unidad.textContent = "clicks";

    actualizarContador();
});

// Alternar a CPS
cpsBtn.addEventListener("click", function () {
    modo = "cps";

    cpsBtn.classList.add("active");
    totalBtn.classList.remove("active");

    modoLabel.textContent = "Velocidad de clicks";
    unidad.textContent = "clicks por segundo";

    actualizarContador();
});

// Registrar clicks
boton.addEventListener("click", function () {

    if (inicio === null) {
        inicio = Date.now();
    }

    clicks++;

    actualizarContador();

    contador.style.transform = "scale(1.12)";

    setTimeout(function () {
        contador.style.transform = "scale(1)";
    }, 100);
});

// Actualizar el contador según el modo seleccionado
function actualizarContador() {

    if (modo === "total") {
        contador.textContent = clicks;
    } 

    else {
        if (clicks === 0 || inicio === null) {
            contador.textContent = "0.00";
        } 

        else {
            const segundos = (Date.now() - inicio) / 1000;

            const cps = segundos > 0
                ? clicks / segundos
                : 0;

            contador.textContent = cps.toFixed(2);
        }
    }
}

// Reiniciar contador
resetBtn.addEventListener("click", function () {

    clicks = 0;
    inicio = null;

    actualizarContador();
});