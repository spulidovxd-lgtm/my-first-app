
// =====================================
// VARIABLES PRINCIPALES
// =====================================

let clicks = 0;
let inicio = null;
let modo = "total";

let duracion = 10;
let tiempoTranscurrido = 0;

let partidaIniciada = false;
let partidaFinalizada = false;

let intervalo = null;

// =====================================
// ELEMENTOS HTML
// =====================================

const contador = document.getElementById("contador");
const timer = document.getElementById("timer");
const timerStatus = document.getElementById("timerStatus");

const boton = document.getElementById("clickBtn");
const resetBtn = document.getElementById("resetBtn");

const totalBtn = document.getElementById("totalBtn");
const cpsBtn = document.getElementById("cpsBtn");

const modoLabel = document.getElementById("modoLabel");
const unidad = document.getElementById("unidad");

const tituloEvento = document.getElementById("tituloEvento");
const tituloPrincipal = document.getElementById("tituloPrincipal");

const durationBtns = document.querySelectorAll(".duration-btn");

const resultado = document.getElementById("resultado");
const resultadoTexto = document.getElementById("resultadoTexto");

// =====================================
// CAMBIAR TÍTULO EN TIEMPO REAL
// =====================================

tituloEvento.addEventListener("input", function () {
    tituloPrincipal.textContent =
        tituloEvento.value.trim() || "Colegio Bolívar";
});

// =====================================
// SELECCIONAR DURACIÓN
// =====================================

durationBtns.forEach(function (btn) {

    btn.addEventListener("click", function () {

        if (partidaIniciada || partidaFinalizada) {
            return;
        }

        duracion = Number(btn.dataset.duration);

        durationBtns.forEach(function (b) {
            b.classList.remove("active");
        });

        btn.classList.add("active");

        actualizarTimer();

    });

});

// =====================================
// CAMBIAR MODO DE CONTADOR
// =====================================

totalBtn.addEventListener("click", function () {

    modo = "total";

    totalBtn.classList.add("active");
    cpsBtn.classList.remove("active");

    modoLabel.textContent = "Clicks registrados";
    unidad.textContent = "clicks";

    actualizarContador();

});

cpsBtn.addEventListener("click", function () {

    modo = "cps";

    cpsBtn.classList.add("active");
    totalBtn.classList.remove("active");

    modoLabel.textContent = "Velocidad de clicks";
    unidad.textContent = "clicks por segundo";

    actualizarContador();

});

// =====================================
// REGISTRAR CLICKS
// =====================================

boton.addEventListener("click", function () {

    if (partidaFinalizada) {
        return;
    }

    // Iniciar el cronómetro con el primer click
    if (!partidaIniciada) {

        partidaIniciada = true;
        inicio = performance.now();

        timerStatus.textContent = "¡Partida en curso!";

        // Bloquear selección de duración
        durationBtns.forEach(function (btn) {
            btn.disabled = true;
        });

        // Actualizar cronómetro
        intervalo = setInterval(actualizarTimer, 10);

    }

    // Verificar que todavía exista tiempo
    const ahora = performance.now();

    if (ahora - inicio >= duracion * 1000) {
        finalizarPartida();
        return;
    }

    clicks++;

    actualizarContador();

    // Animación del contador
    contador.style.transform = "scale(1.12)";

    setTimeout(function () {
        contador.style.transform = "scale(1)";
    }, 100);

});

// =====================================
// ACTUALIZAR TEMPORIZADOR
// =====================================

function actualizarTimer() {

    if (!partidaIniciada || partidaFinalizada) {
        return;
    }

    const ahora = performance.now();

    tiempoTranscurrido = Math.min(
        (ahora - inicio) / 1000,
        duracion
    );

    timer.textContent = tiempoTranscurrido.toFixed(3) + " s";

    // Finalizar al alcanzar la duración
    if (tiempoTranscurrido >= duracion) {
        finalizarPartida();
    }

}

// =====================================
// ACTUALIZAR CONTADOR
// =====================================

function actualizarContador() {

    if (modo === "total") {

        contador.textContent = clicks;

    } else {

        if (clicks === 0 || tiempoTranscurrido <= 0) {

            contador.textContent = "0.00";

        } else {

            const cps = clicks / tiempoTranscurrido;

            contador.textContent = cps.toFixed(2);

        }

    }

}

// =====================================
// FINALIZAR PARTIDA
// =====================================

function finalizarPartida() {

    if (partidaFinalizada) {
        return;
    }

    partidaFinalizada = true;
    partidaIniciada = false;

    tiempoTranscurrido = duracion;

    clearInterval(intervalo);

    // Mostrar tiempo final
    timer.textContent = duracion.toFixed(3) + " s";

    timerStatus.textContent = "¡Tiempo terminado!";

    // Deshabilitar botón de clicks
    boton.disabled = true;

    boton.textContent = "Partida finalizada";

    // Actualizar el contador final
    actualizarContador();

    // Mostrar resultado
    resultado.hidden = false;

    const cpsFinal = (clicks / duracion).toFixed(2);

    resultadoTexto.textContent =
        "¡Lograste " + clicks + " clicks en " +
        duracion + " segundos! Tu promedio fue de " +
        cpsFinal + " CPS.";

}

// =====================================
// REINICIAR PARTIDA
// =====================================

resetBtn.addEventListener("click", function () {

    clearInterval(intervalo);

    clicks = 0;
    inicio = null;
    tiempoTranscurrido = 0;

    partidaIniciada = false;
    partidaFinalizada = false;

    // Restaurar botones
    boton.disabled = false;
    boton.textContent = "+ Registrar Click";

    // Habilitar selección de duración
    durationBtns.forEach(function (btn) {
        btn.disabled = false;
    });

    // Restaurar temporizador
    timerStatus.textContent = "Esperando primer click...";

    // Ocultar resultado
    resultado.hidden = true;

    // Actualizar interfaz
    actualizarTimer();
    actualizarContador();

});

// =====================================
// ESTADO INICIAL
// =====================================

actualizarTimer();
actualizarContador();
