/* =========================================
   MUNDO DE AMOR - SCRIPT PRINCIPAL
   ========================================= */


/* =========================================
   ELEMENTOS
   ========================================= */

const mainMenu = document.getElementById("main-menu");
const loadingScreen = document.getElementById("loading-screen");
const gameScreen = document.getElementById("game-screen");
const questionScreen = document.getElementById("question-screen");
const finalScreen = document.getElementById("final-screen");

const startButton = document.getElementById("start-button");

const loadingProgress =
    document.getElementById("loading-progress");

const loadingText =
    document.getElementById("loading-text");

const continueButton =
    document.getElementById("continue-button");

const yesButton =
    document.getElementById("yes-button");

const noButton =
    document.getElementById("no-button");

const noMessage =
    document.getElementById("no-message");

const interactButton =
    document.getElementById("interact-button");

const interactionHint =
    document.getElementById("interaction-hint");

const signMessage =
    document.getElementById("sign-message");

const signMessageText =
    document.getElementById("sign-message-text");

const houseMessage =
    document.getElementById("house-message");

const houseMessageText =
    document.getElementById("house-message-text");

const heartsContainer =
    document.getElementById("hearts-container");

const fireworksContainer =
    document.getElementById("fireworks-container");


/* =========================================
   CONFIGURACIÓN
   ========================================= */

/*
    ==========================================
    AQUÍ PUEDES ESCRIBIR TUS MENSAJES
    ==========================================

    De momento dejamos cuatro carteles.

    Cuando hagamos el mundo 3D, cada uno
    estará colocado físicamente en el camino.
*/

const SIGN_MESSAGES = [

    // CARTEL 1
    "ESCRIBE AQUÍ EL MENSAJE DEL CARTEL 1",

    // CARTEL 2
    "ESCRIBE AQUÍ EL MENSAJE DEL CARTEL 2",

    // CARTEL 3
    "ESCRIBE AQUÍ EL MENSAJE DEL CARTEL 3",

    // CARTEL 4
    "ESCRIBE AQUÍ EL MENSAJE DEL CARTEL 4"

];


/*
    ==========================================
    MENSAJE DE LA CASITA
    ==========================================

    ESCRIBE AQUÍ EL MENSAJE QUE QUIERAS
    QUE ELLA LEA CUANDO LLEGUE A LA CASITA.
*/

const HOUSE_MESSAGE =
    "ESCRIBE AQUÍ EL MENSAJE DE LA CASITA";


/* =========================================
   ESTADO DEL JUEGO
   ========================================= */

let currentSign = 0;

let noAttempts = 0;


/* =========================================
   FUNCIÓN PARA CAMBIAR DE PANTALLA
   ========================================= */

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(element => {

            element.classList.remove("active");

        });

    screen.classList.add("active");
}


/* =========================================
   INICIAR JUEGO
   ========================================= */

startButton.addEventListener("click", startGame);


function startGame() {

    showScreen(loadingScreen);

    simulateLoading();

}


/* =========================================
   PANTALLA DE CARGA
   ========================================= */

function simulateLoading() {

    let progress = 0;

    const loadingMessages = [

        "Preparando el mundo...",

        "Generando los árboles de cerezo...",

        "Plantando tulipanes rosados...",

        "Preparando el atardecer...",

        "Construyendo el camino...",

        "Colocando algunos secretos...",

        "Preparando la casita...",

        "Casi listo..."

    ];

    const interval =
        setInterval(() => {

            progress += 2;

            loadingProgress.style.width =
                `${progress}%`;

            const messageIndex =
                Math.min(
                    Math.floor(progress / 13),
                    loadingMessages.length - 1
                );

            loadingText.textContent =
                loadingMessages[messageIndex];


            if (progress >= 100) {

                clearInterval(interval);

                setTimeout(() => {

                    startWorld();

                }, 700);

            }

        }, 60);

}


/* =========================================
   COMENZAR EL MUNDO
   ========================================= */

function startWorld() {

    showScreen(gameScreen);

    /*
        AQUÍ, EN LA SIGUIENTE PARTE,
        VAMOS A CREAR EL MUNDO 3D.

        Tendremos:

        - Cámara en primera persona
        - Sendero
        - Bloques
        - Cerezos
        - Tulipanes
        - Atardecer
        - Cascada
        - Puente
        - Cuatro carteles
        - Casita
        - Joystick táctil
        - Movimiento
    */

    console.log("Mundo iniciado.");

}


/* =========================================
   MOSTRAR CARTEL
   ========================================= */

function showSign(number) {

    if (
        number < 0 ||
        number >= SIGN_MESSAGES.length
    ) {
        return;
    }

    currentSign = number;

    signMessageText.textContent =
        SIGN_MESSAGES[number];

    signMessage.classList.add("visible");

    /*
        El mensaje desaparecerá automáticamente
        después de 3 segundos.
    */

    setTimeout(() => {

        signMessage.classList.remove("visible");

    }, 3000);

}


/* =========================================
   MOSTRAR CASITA
   ========================================= */

function showHouseMessage() {

    houseMessageText.textContent =
        HOUSE_MESSAGE;

    houseMessage.classList.add("visible");

}


/* =========================================
   CONTINUAR DESDE LA CASITA
   ========================================= */

continueButton.addEventListener(
    "click",
    () => {

        houseMessage.classList.remove("visible");

        setTimeout(() => {

            showScreen(questionScreen);

        }, 500);

    }
);


/* =========================================
   RESPUESTA "SÍ"
   ========================================= */

yesButton.addEventListener(
    "click",
    acceptLove
);


function acceptLove() {

    showScreen(finalScreen);

    createHearts();

    createFireworks();

}


/* =========================================
   RESPUESTA "NO"
   ========================================= */

noButton.addEventListener(
    "click",
    rejectLove
);


function rejectLove() {

    noAttempts++;


    if (noAttempts === 1) {

        noMessage.textContent =
            "¿Segura? 🥺";

        moveNoButton();

    }


    else if (noAttempts === 2) {

        noMessage.textContent =
            "¿De verdad? 😭";

        moveNoButton();

    }


    else {

        /*
            TERCER INTENTO

            Aquí NO impedimos la decisión.
            Simplemente mostramos el mensaje
            y dejamos que la elección sea respetada.
        */

        noMessage.textContent =
            "Está bien... entiendo tu decisión ❤️";

        noButton.disabled = true;

        noButton.style.opacity = "0.6";

    }

}


/* =========================================
   MOVER BOTÓN NO
   ========================================= */

function moveNoButton() {

    const container =
        document.querySelector(".question-house");

    const maxX = 80;
    const maxY = 60;

    const randomX =
        Math.random() * (maxX * 2) - maxX;

    const randomY =
        Math.random() * (maxY * 2) - maxY;

    noButton.style.transform =
        `translate(${randomX}px, ${randomY}px)`;

}


/* =========================================
   CORAZONES
   ========================================= */

function createHearts() {

    const heartTypes = [
        "❤️",
        "💗",
        "💖",
        "💕",
        "💓"
    ];

    for (let i = 0; i < 40; i++) {

        setTimeout(() => {

            const heart =
                document.createElement("div");

            heart.className =
                "floating-heart";

            heart.textContent =
                heartTypes[
                    Math.floor(
                        Math.random() *
                        heartTypes.length
                    )
                ];

            heart.style.left =
                `${Math.random() * 100}%`;

            heart.style.fontSize =
                `${20 + Math.random() * 30}px`;

            heart.style.animationDuration =
                `${3 + Math.random() * 4}s`;

            heartsContainer.appendChild(heart);


            setTimeout(() => {

                heart.remove();

            }, 7000);

        }, i * 100);

    }

}


/* =========================================
   FUEGOS ARTIFICIALES
   ========================================= */

function createFireworks() {

    /*
        En la siguiente versión vamos a sustituir
        esto por un sistema de partículas mucho
        más bonito.

        Por ahora generamos explosiones simples.
    */

    for (let i = 0; i < 15; i++) {

        setTimeout(() => {

            createFirework();

        }, i * 400);

    }

}


function createFirework() {

    const firework =
        document.createElement("div");

    firework.style.position =
        "absolute";

    firework.style.left =
        `${20 + Math.random() * 60}%`;

    firework.style.top =
        `${10 + Math.random() * 50}%`;

    firework.style.width =
        "8px";

    firework.style.height =
        "8px";

    firework.style.borderRadius =
        "50%";

    firework.style.background =
        "#fff";

    firework.style.boxShadow = `
        0 0 15px #fff,
        20px 0 10px #ff6b9d,
        -20px 0 10px #ffcc66,
        0 20px 10px #ff7eb3,
        0 -20px 10px #fff,
        15px 15px 10px #ff9ac2,
        -15px -15px 10px #ffd166,
        15px -15px 10px #fff,
        -15px 15px 10px #ff8fab
    `;

    firework.style.zIndex = "10";

    fireworksContainer.appendChild(firework);


    setTimeout(() => {

        firework.remove();

    }, 1000);

}


/* =========================================
   PREPARAR INTERACCIÓN
   ========================================= */

/*
    Esta función será utilizada por el
    mundo 3D cuando ella esté cerca
    de un cartel.
*/

function enableInteraction() {

    interactButton.classList.add("visible");

    interactionHint.classList.add("visible");

}


/* =========================================
   OCULTAR INTERACCIÓN
   ========================================= */

function disableInteraction() {

    interactButton.classList.remove("visible");

    interactionHint.classList.remove("visible");

}


/* =========================================
   BOTÓN INTERACTUAR
   ========================================= */

interactButton.addEventListener(
    "click",
    () => {

        /*
            Más adelante aquí detectaremos
            automáticamente qué objeto está
            delante de ella.

            Por ahora simplemente mostramos
            el cartel correspondiente.
        */

        showSign(currentSign);

    }
);


/* =========================================
   EVITAR ZOOM ACCIDENTAL EN CELULAR
   ========================================= */

document.addEventListener(
    "gesturestart",
    event => {

        event.preventDefault();

    }
);


/* =========================================
   DEBUG
   ========================================= */

console.log(
    "❤️ Mundo de amor cargado correctamente."
);
