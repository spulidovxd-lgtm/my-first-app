
// =============================================
// CONTADOR DE EVENTOS - COLEGIO BOLÍVAR
// SISTEMA DE JUGADORES Y LEADERBOARD
// =============================================

// VARIABLES PRINCIPALES

let clicks = 0;
let inicio = null;
let modo = "total";
let duracion = 10;

let tiempoTranscurrido = 0;

let partidaPreparada = false;
let partidaIniciada = false;
let partidaFinalizada = false;

let intervalo = null;
let nombreActual = "";

let categoriaRanking = 10;

const STORAGE_KEY = "colegioBolivarLeaderboard";
const MAX_RECORDS = 10;


// =============================================
// ELEMENTOS HTML
// =============================================

const contador = document.getElementById("contador");
const timer = document.getElementById("timer");
const timerStatus = document.getElementById("timerStatus");

const boton = document.getElementById("clickBtn");
const resetBtn = document.getElementById("resetBtn");
const startBtn = document.getElementById("startBtn");

const nombreJugador = document.getElementById("nombreJugador");
const playerStatus = document.getElementById("playerStatus");

const totalBtn = document.getElementById("totalBtn");
const cpsBtn = document.getElementById("cpsBtn");

const modoLabel = document.getElementById("modoLabel");
const unidad = document.getElementById("unidad");

const tituloEvento = document.getElementById("tituloEvento");
const tituloPrincipal = document.getElementById("tituloPrincipal");

const durationBtns = document.querySelectorAll(".duration-btn");

const resultado = document.getElementById("resultado");
const resultadoTitulo = document.getElementById("resultadoTitulo");
const resultadoTexto = document.getElementById("resultadoTexto");

const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboard = document.getElementById("leaderboard");
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
const leaderboardBody = document.getElementById("leaderboardBody");

const rankingBtns = document.querySelectorAll(".ranking-btn");


// =============================================
// BASE DE DATOS LOCAL
// =============================================

// Crear categorías independientes

function crearRankingVacio() {
    return {
        "10": [],
        "20": [],
        "30": []
    };
}

// Recuperar datos guardados

function obtenerRankings() {

    const rankingVacio = crearRankingVacio();

    try {

        const datos = localStorage.getItem(STORAGE_KEY);

        if (!datos) {
            return rankingVacio;
        }

        const guardados = JSON.parse(datos);

        ["10", "20", "30"].forEach(function(categoria) {

            if (Array.isArray(guardados[categoria])) {

                rankingVacio[categoria] = guardados[categoria]
                    .filter(function(registro) {
                        return (
                            typeof registro.name === "string" &&
                            Number.isFinite(registro.clicks) &&
                            registro.clicks >= 0 &&
                            Number.isFinite(registro.cps)
                        );
                    })
                    .sort(function(a, b) {
                        return b.clicks - a.clicks;
                    })
                    .slice(0, MAX_RECORDS);
            }

        });

        return rankingVacio;

    } catch (error) {

        console.error("Error al recuperar el ranking:", error);

        return rankingVacio;
    }
}

let rankings = obtenerRankings();


// =============================================
// GUARDAR RANKINGS
// =============================================

function guardarRankings() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(rankings)
        );

        return true;

    } catch (error) {

        console.error("No se pudieron guardar los resultados:", error);

        playerStatus.textContent =
            "No se pudo guardar el resultado en este navegador.";

        return false;
    }
}


// =============================================
// CAMBIAR TÍTULO DEL EVENTO
// =============================================

tituloEvento.addEventListener("input", function() {

    tituloPrincipal.textContent =
        tituloEvento.value.trim() || "Colegio Bolívar";

});


// =============================================
// REGISTRAR JUGADOR
// =============================================

startBtn.addEventListener("click", function() {

    const nombre = nombreJugador.value.trim();

    if (!nombre) {

        playerStatus.textContent =
            "Por favor, escribe tu nombre antes de comenzar.";

        nombreJugador.focus();

        return;
    }

    if (partidaPreparada || partidaIniciada) {
        return;
    }

    nombreActual = nombre.substring(0, 20);

    nombreJugador.value = nombreActual;

    partidaPreparada = true;

    // Bloquear el registro y la duración

    nombreJugador.disabled = true;
    startBtn.disabled = true;

    durationBtns.forEach(function(btn) {
        btn.disabled = true;
    });

    // Habilitar el contador

    boton.disabled = false;

    playerStatus.textContent =
        "Jugador registrado: " + nombreActual;

    timerStatus.textContent =
        "Presiona Registrar Click para comenzar.";

});


// =============================================
// SELECCIONAR DURACIÓN
// =============================================

durationBtns.forEach(function(btn) {

    btn.addEventListener("click", function() {

        if (partidaPreparada || partidaIniciada) {
            return;
        }

        duracion = Number(btn.dataset.duration);

        durationBtns.forEach(function(b) {
            b.classList.remove("active");
        });

        btn.classList.add("active");

        actualizarTimer();

    });

});


// =============================================
// ALTERNAR ENTRE MODOS
// =============================================

totalBtn.addEventListener("click", function() {

    modo = "total";

    totalBtn.classList.add("active");
    cpsBtn.classList.remove("active");

    modoLabel.textContent = "Clicks registrados";
    unidad.textContent = "clicks";

    actualizarContador();

});

cpsBtn.addEventListener("click", function() {

    modo = "cps";

    cpsBtn.classList.add("active");
    totalBtn.classList.remove("active");

    modoLabel.textContent = "Velocidad de clicks";
    unidad.textContent = "clicks por segundo";

    actualizarContador();

});


// =============================================
// REGISTRAR CLICKS
// =============================================

boton.addEventListener("click", function() {

    if (!partidaPreparada || partidaFinalizada) {
        return;
    }

    // Iniciar cronómetro con el primer click

    if (!partidaIniciada) {

        partidaIniciada = true;

        inicio = performance.now();

        timerStatus.textContent = "¡Partida en curso!";

        intervalo = setInterval(actualizarTimer, 10);

    }

    // Comprobar que el tiempo no haya terminado

    const ahora = performance.now();

    if (ahora - inicio >= duracion * 1000) {

        finalizarPartida();

        return;
    }

    clicks++;

    actualizarContador();

    // Animación

    contador.style.transform = "scale(1.12)";

    setTimeout(function() {

        contador.style.transform = "scale(1)";

    }, 100);

});


// =============================================
// TEMPORIZADOR
// =============================================

function actualizarTimer() {

    if (!partidaIniciada) {

        timer.textContent = "0.000 s";

        return;
    }

    if (partidaFinalizada) {
        return;
    }

    const ahora = performance.now();

    tiempoTranscurrido = Math.min(
        (ahora - inicio) / 1000,
        duracion
    );

    timer.textContent =
        tiempoTranscurrido.toFixed(3) + " s";

    actualizarContador();

    if (tiempoTranscurrido >= duracion) {

        finalizarPartida();

    }

}


// =============================================
// ACTUALIZAR CONTADOR
// =============================================

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


// =============================================
// COMPROBAR Y GUARDAR NUEVO RÉCORD
// =============================================

function guardarResultado() {

    const categoria = String(duracion);

    const cpsFinal = clicks / duracion;

    const nuevoResultado = {
        name: nombreActual,
        clicks: clicks,
        cps: Number(cpsFinal.toFixed(2)),
        date: new Date().toISOString()
    };

    const rankingActual = rankings[categoria];

    // Comprobar si entra en el Top 10

    const entraEnRanking =
        rankingActual.length < MAX_RECORDS ||
        clicks > rankingActual[rankingActual.length - 1].clicks;

    if (!entraEnRanking) {

        return false;
    }

    // Añadir el resultado

    rankingActual.push(nuevoResultado);

    // Ordenar de mayor a menor cantidad de clicks

    rankingActual.sort(function(a, b) {

        return b.clicks - a.clicks;

    });

    // Conservar únicamente los mejores 10

    rankings[categoria] = rankingActual.slice(0, MAX_RECORDS);

    // Guardar en localStorage

    const guardado = guardarRankings();

    return guardado;

}


// =============================================
// FINALIZAR PARTIDA
// =============================================

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

    // Actualizar contador

    actualizarContador();

    // Calcular CPS final

    const cpsFinal = (clicks / duracion).toFixed(2);

    // Guardar resultado y comprobar récord

    const nuevoRecord = guardarResultado();

    // Mostrar resultado

    resultado.hidden = false;

    if (nuevoRecord) {

        resultadoTitulo.textContent = "🏆 ¡Nuevo récord!";

    } else {

        resultadoTitulo.textContent = "¡Partida finalizada!";

    }

    resultadoTexto.textContent =
        nombreActual +
        ", lograste " + clicks +
        " clicks en " + duracion +
        " segundos. Tu promedio fue de " +
        cpsFinal + " CPS.";

    // Mostrar leaderboard automáticamente

    mostrarLeaderboard();

}


// =============================================
// MOSTRAR LEADERBOARD
// =============================================

function mostrarLeaderboard() {

    leaderboard.hidden = false;

    actualizarLeaderboard();

}


// =============================================
// ACTUALIZAR TABLA DE POSICIONES
// =============================================

function actualizarLeaderboard() {

    const categoria = String(categoriaRanking);

    const resultados = rankings[categoria] || [];

    leaderboardBody.innerHTML = "";

    if (resultados.length === 0) {

        const fila = document.createElement("tr");

        const celda = document.createElement("td");

        celda.colSpan = 4;

        celda.className = "empty-ranking";

        celda.textContent =
            "Todavía no hay jugadores registrados.";

        fila.appendChild(celda);

        leaderboardBody.appendChild(fila);

        return;
    }

    resultados.forEach(function(registro, index) {

        const fila = document.createElement("tr");

        const posicion = document.createElement("td");
        const jugador = document.createElement("td");
        const totalClicks = document.createElement("td");
        const cps = document.createElement("td");

        // Posiciones especiales

        if (index === 0) {
            posicion.textContent = "🥇 1";
        } else if (index === 1) {
            posicion.textContent = "🥈 2";
        } else if (index === 2) {
            posicion.textContent = "🥉 3";
        } else {
            posicion.textContent = index + 1;
        }

        jugador.textContent = registro.name;
        totalClicks.textContent = registro.clicks;
        cps.textContent = Number(registro.cps).toFixed(2);

        fila.appendChild(posicion);
        fila.appendChild(jugador);
        fila.appendChild(totalClicks);
        fila.appendChild(cps);

        leaderboardBody.appendChild(fila);

    });

}


// =============================================
// CAMBIAR CATEGORÍA DEL LEADERBOARD
// =============================================

rankingBtns.forEach(function(btn) {

    btn.addEventListener("click", function() {

        categoriaRanking = Number(btn.dataset.ranking);

        rankingBtns.forEach(function(b) {

            b.classList.remove("active");

        });

        btn.classList.add("active");

        actualizarLeaderboard();

    });

});


// =============================================
// ABRIR Y CERRAR LEADERBOARD
// =============================================

leaderboardBtn.addEventListener("click", function() {

    leaderboard.hidden = !leaderboard.hidden;

    if (!leaderboard.hidden) {

        mostrarLeaderboard();

    }

});

closeLeaderboardBtn.addEventListener("click", function() {

    leaderboard.hidden = true;

});


// =============================================
// REINICIAR PARTIDA
// =============================================

resetBtn.addEventListener("click", function() {

    clearInterval(intervalo);

    // Reiniciar variables

    clicks = 0;
    inicio = null;
    tiempoTranscurrido = 0;

    partidaPreparada = false;
    partidaIniciada = false;
    partidaFinalizada = false;

    nombreActual = "";

    // Restaurar jugador

    nombreJugador.disabled = false;
    nombreJugador.value = "";

    startBtn.disabled = false;

    playerStatus.textContent =
        "Registra tu nombre para comenzar.";

    // Restaurar botón de clicks

    boton.disabled = true;
    boton.textContent = "+ Registrar Click";

    // Habilitar duración

    durationBtns.forEach(function(btn) {

        btn.disabled = false;

    });

    // Ocultar resultado

    resultado.hidden = true;

    // Restaurar temporizador

    timerStatus.textContent = "Esperando partida...";

    // Cerrar leaderboard

    leaderboard.hidden = true;

    // Restaurar contador

    actualizarTimer();
    actualizarContador();

    nombreJugador.focus();

});


// =============================================
// INICIALIZAR APLICACIÓN
// =============================================

actualizarTimer();
actualizarContador();
actualizarLeaderboard();
