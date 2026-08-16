/* =========================================================
   MUNDO 3D - UN MUNDO PARA TI ❤️
   Primera versión:
   - Three.js
   - Terreno de bloques
   - Atardecer
   - Sendero
   - Cámara en primera persona
   - Joystick táctil
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const WORLD = {
    width: 70,
    depth: 180,

    playerHeight: 1.7,

    moveSpeed: 0.08,

    gravity: 0.015,

    groundHeight: 0
};


/* =========================================================
   ELEMENTOS HTML
   ========================================================= */

const mainMenu = document.getElementById("main-menu");
const loadingScreen = document.getElementById("loading-screen");
const gameScreen = document.getElementById("game-screen");

const startButton = document.getElementById("start-button");

const loadingProgress =
    document.getElementById("loading-progress");

const loadingText =
    document.getElementById("loading-text");

const gameContainer =
    document.getElementById("game-container");

const joystickBase =
    document.getElementById("joystick-base");

const joystickStick =
    document.getElementById("joystick-stick");


/* =========================================================
   VARIABLES THREE.JS
   ========================================================= */

let scene;
let camera;
let renderer;

let clock;

let player;

let worldObjects = [];

let animationStarted = false;


/* =========================================================
   JOYSTICK
   ========================================================= */

let joystickActive = false;

let joystickX = 0;
let joystickY = 0;

let joystickPointerId = null;


/* =========================================================
   MOVIMIENTO DEL JUGADOR
   ========================================================= */

const velocity = new THREE.Vector3();

let playerRotation = 0;


/* =========================================================
   INICIAR
   ========================================================= */

startButton.addEventListener("click", () => {

    showScreen(loadingScreen);

    simulateLoading();

});


/* =========================================================
   CAMBIAR PANTALLA
   ========================================================= */

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(element => {

            element.classList.remove("active");

        });

    screen.classList.add("active");

}


/* =========================================================
   CARGA
   ========================================================= */

function simulateLoading() {

    let progress = 0;

    const messages = [

        "Preparando el mundo...",

        "Generando el terreno...",

        "Preparando el atardecer...",

        "Plantando flores...",

        "Generando los árboles...",

        "Construyendo el camino...",

        "Preparando la aventura...",

        "Casi listo..."

    ];

    const interval = setInterval(() => {

        progress += 2;

        loadingProgress.style.width =
            `${progress}%`;

        const index =
            Math.min(
                Math.floor(progress / 13),
                messages.length - 1
            );

        loadingText.textContent =
            messages[index];


        if (progress >= 100) {

            clearInterval(interval);

            setTimeout(() => {

                startWorld();

            }, 500);

        }

    }, 40);

}


/* =========================================================
   CREAR MUNDO
   ========================================================= */

function startWorld() {

    showScreen(gameScreen);

    if (!scene) {

        initializeThree();

    }

}


/* =========================================================
   THREE.JS
   ========================================================= */

function initializeThree() {

    /* -----------------------------------------
       ESCENA
       ----------------------------------------- */

    scene = new THREE.Scene();


    /* -----------------------------------------
       CIELO
       ----------------------------------------- */

    scene.background =
        new THREE.Color(0xe99aa8);


    /* -----------------------------------------
       CÁMARA
       ----------------------------------------- */

    camera = new THREE.PerspectiveCamera(

        70,

        window.innerWidth /
        window.innerHeight,

        0.05,

        500

    );


    camera.position.set(

        0,

        WORLD.playerHeight,

        8

    );


    /* -----------------------------------------
       RENDERER
       ----------------------------------------- */

    renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            powerPreference: "high-performance"

        });


    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.5)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    gameContainer.appendChild(
        renderer.domElement
    );


    /* -----------------------------------------
       RELOJ
       ----------------------------------------- */

    clock = new THREE.Clock();


    /* -----------------------------------------
       LUCES
       ----------------------------------------- */

    createLights();


    /* -----------------------------------------
       TERRENO
       ----------------------------------------- */

    createWorld();


    /* -----------------------------------------
       JUGADOR
       ----------------------------------------- */

    player = {

        position:
            camera.position,

        velocity:
            velocity

    };


    /* -----------------------------------------
       CONTROLES
       ----------------------------------------- */

    setupJoystick();

    setupTouchCamera();


    /* -----------------------------------------
       RESIZE
       ----------------------------------------- */

    window.addEventListener(
        "resize",
        onWindowResize
    );


    /* -----------------------------------------
       LOOP
       ----------------------------------------- */

    animationStarted = true;

    animate();

}


/* =========================================================
   LUCES
   ========================================================= */

function createLights() {

    /* Luz ambiental */

    const ambientLight =
        new THREE.HemisphereLight(

            0xffd2d9,

            0x33263d,

            1.8

        );

    scene.add(ambientLight);


    /* Sol del atardecer */

    const sun =
        new THREE.DirectionalLight(

            0xffb08a,

            3

        );


    sun.position.set(

        -40,
        50,
        60

    );


    sun.castShadow = true;


    sun.shadow.mapSize.width = 1024;

    sun.shadow.mapSize.height = 1024;


    sun.shadow.camera.left = -80;

    sun.shadow.camera.right = 80;

    sun.shadow.camera.top = 100;

    sun.shadow.camera.bottom = -100;


    scene.add(sun);


    /* Luz cálida delante */

    const sunsetLight =
        new THREE.PointLight(

            0xff7f9d,

            2,

            120

        );


    sunsetLight.position.set(

        0,
        15,
        70

    );


    scene.add(sunsetLight);

}


/* =========================================================
   CREAR MUNDO
   ========================================================= */

function createWorld() {

    createGround();

    createPath();

    createMountains();

}


/* =========================================================
   SUELO
   ========================================================= */

function createGround() {

    const groundGeometry =
        new THREE.BoxGeometry(

            WORLD.width,
            1,
            WORLD.depth

        );


    const groundMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x6b8f62,

            roughness: 1

        });


    const ground =
        new THREE.Mesh(

            groundGeometry,
            groundMaterial

        );


    ground.position.set(

        0,
        -0.5,
        0

    );


    ground.receiveShadow = true;


    scene.add(ground);

    worldObjects.push(ground);

}


/* =========================================================
   CAMINO
   ========================================================= */

function createPath() {

    const blockSize = 2;

    const pathWidth = 5;

    const pathLength = 160;


    const pathMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x8a765d,

            roughness: 1

        });


    for (
        let z = -pathLength / 2;
        z < pathLength / 2;
        z += blockSize
    ) {

        for (
            let x = -pathWidth;
            x <= pathWidth;
            x += blockSize
        ) {

            const geometry =
                new THREE.BoxGeometry(

                    blockSize,
                    0.35,
                    blockSize

                );


            const block =
                new THREE.Mesh(

                    geometry,
                    pathMaterial

                );


            block.position.set(

                x,
                0.15,
                z

            );


            block.receiveShadow = true;

            block.castShadow = true;


            scene.add(block);

            worldObjects.push(block);

        }

    }

}


/* =========================================================
   MONTAÑAS
   ========================================================= */

function createMountains() {

    const mountainMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x5c526b,

            roughness: 1

        });


    /* Lado izquierdo */

    for (let i = 0; i < 15; i++) {

        const height =
            8 + Math.random() * 15;

        const width =
            8 + Math.random() * 15;


        const geometry =
            new THREE.ConeGeometry(

                width,
                height,
                6

            );


        const mountain =
            new THREE.Mesh(

                geometry,
                mountainMaterial

            );


        mountain.position.set(

            -25 + Math.random() * 8,

            height / 2 - 0.2,

            -70 + Math.random() * 150

        );


        mountain.rotation.y =
            Math.random() * Math.PI;


        mountain.receiveShadow = true;

        mountain.castShadow = true;


        scene.add(mountain);

    }


    /* Lado derecho */

    for (let i = 0; i < 15; i++) {

        const height =
            8 + Math.random() * 15;

        const width =
            8 + Math.random() * 15;


        const geometry =
            new THREE.ConeGeometry(

                width,
                height,
                6

            );


        const mountain =
            new THREE.Mesh(

                geometry,
                mountainMaterial

            );


        mountain.position.set(

            25 + Math.random() * 8,

            height / 2 - 0.2,

            -70 + Math.random() * 150

        );


        mountain.rotation.y =
            Math.random() * Math.PI;


        mountain.receiveShadow = true;

        mountain.castShadow = true;


        scene.add(mountain);

    }

}


/* =========================================================
   JOYSTICK
   ========================================================= */

function setupJoystick() {

    joystickBase.addEventListener(
        "pointerdown",
        joystickStart
    );

    window.addEventListener(
        "pointermove",
        joystickMove
    );

    window.addEventListener(
        "pointerup",
        joystickEnd
    );

    window.addEventListener(
        "pointercancel",
        joystickEnd
    );

}


/* =========================================================
   JOYSTICK - INICIO
   ========================================================= */

function joystickStart(event) {

    joystickActive = true;

    joystickPointerId =
        event.pointerId;

    joystickBase.setPointerCapture(
        event.pointerId
    );

    updateJoystick(
        event.clientX,
        event.clientY
    );

}


/* =========================================================
   JOYSTICK - MOVIMIENTO
   ========================================================= */

function joystickMove(event) {

    if (!joystickActive) {
        return;
    }

    if (
        event.pointerId !==
        joystickPointerId
    ) {
        return;
    }

    updateJoystick(
        event.clientX,
        event.clientY
    );

}


/* =========================================================
   CALCULAR JOYSTICK
   ========================================================= */

function updateJoystick(clientX, clientY) {

    const rect =
        joystickBase.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    let dx =
        clientX - centerX;


    let dy =
        clientY - centerY;


    const maxDistance =
        45;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance > maxDistance) {

        dx =
            dx / distance *
            maxDistance;

        dy =
            dy / distance *
            maxDistance;

    }


    joystickStick.style.transform =
        `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;


    joystickX =
        dx / maxDistance;


    joystickY =
        dy / maxDistance;

}


/* =========================================================
   JOYSTICK - TERMINAR
   ========================================================= */

function joystickEnd() {

    joystickActive = false;

    joystickPointerId = null;

    joystickX = 0;

    joystickY = 0;


    joystickStick.style.transform =
        "translate(-50%, -50%)";

}


/* =========================================================
   CÁMARA TÁCTIL
   ========================================================= */

let lookActive = false;

let lastTouchX = 0;

function setupTouchCamera() {

    renderer.domElement.addEventListener(
        "pointerdown",
        event => {

            /*
                No usamos el toque del joystick
                para girar la cámara.
            */

            if (
                event.clientX <
                window.innerWidth * 0.35
            ) {
                return;
            }


            lookActive = true;

            lastTouchX =
                event.clientX;

        }
    );


    renderer.domElement.addEventListener(
        "pointermove",
        event => {

            if (!lookActive) {
                return;
            }


            const difference =
                event.clientX -
                lastTouchX;


            lastTouchX =
                event.clientX;


            playerRotation -=
                difference * 0.004;


            camera.rotation.y =
                playerRotation;

        }
    );


    window.addEventListener(
        "pointerup",
        () => {

            lookActive = false;

        }
    );

}


/* =========================================================
   MOVIMIENTO
   ========================================================= */

function updatePlayer() {

    if (!camera) {
        return;
    }


    const speed =
        WORLD.moveSpeed;


    /*
        Dirección hacia adelante
    */

    const forward =
        new THREE.Vector3(

            0,
            0,
            -1

        );


    forward.applyAxisAngle(

        new THREE.Vector3(0, 1, 0),

        playerRotation

    );


    /*
        Dirección lateral
    */

    const right =
        new THREE.Vector3(

            1,
            0,
            0

        );


    right.applyAxisAngle(

        new THREE.Vector3(0, 1, 0),

        playerRotation

    );


    /*
        Movimiento
    */

    const movement =
        new THREE.Vector3();


    movement.addScaledVector(

        forward,

        -joystickY * speed

    );


    movement.addScaledVector(

        right,

        joystickX * speed

    );


    camera.position.add(
        movement
    );


    /*
        Límites del mundo
    */

    const limitX =
        WORLD.width / 2 - 2;


    const limitZ =
        WORLD.depth / 2 - 2;


    camera.position.x =
        THREE.MathUtils.clamp(

            camera.position.x,

            -limitX,
            limitX

        );


    camera.position.z =
        THREE.MathUtils.clamp(

            camera.position.z,

            -limitZ,
            limitZ

        );


    /*
        Altura del jugador
    */

    camera.position.y =
        WORLD.playerHeight;

}


/* =========================================================
   ANIMACIÓN
   ========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (!animationStarted) {
        return;
    }


    updatePlayer();


    renderer.render(
        scene,
        camera
    );

}


/* =========================================================
   RESIZE
   ========================================================= */

function onWindowResize() {

    if (!camera || !renderer) {
        return;
    }


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(

        window.innerWidth,
        window.innerHeight

    );

}


/* =========================================================
   FIN
   ========================================================= */
