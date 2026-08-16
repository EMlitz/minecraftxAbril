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
   
   createRomanticGarden();

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

   animatePetals();


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
   🌸 CEREZOS
   ========================================================= */

function createCherryTree(x, z, scale = 1) {

    const tree = new THREE.Group();

    /* -----------------------------
       TRONCO
       ----------------------------- */

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.35 * scale,
            0.5 * scale,
            4 * scale,
            6
        );

    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x5b3b35,
            roughness: 1
        });

    const trunk =
        new THREE.Mesh(
            trunkGeometry,
            trunkMaterial
        );

    trunk.position.y =
        2 * scale;

    trunk.castShadow = true;
    trunk.receiveShadow = true;

    tree.add(trunk);


    /* -----------------------------
       RAMAS
       ----------------------------- */

    const branchMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x68443d,
            roughness: 1
        });


    for (let i = 0; i < 4; i++) {

        const branchGeometry =
            new THREE.CylinderGeometry(
                0.16 * scale,
                0.25 * scale,
                2.2 * scale,
                5
            );

        const branch =
            new THREE.Mesh(
                branchGeometry,
                branchMaterial
            );


        const angle =
            (Math.PI * 2 / 4) * i;


        branch.position.set(

            Math.cos(angle) *
                1.1 * scale,

            3.2 * scale,

            Math.sin(angle) *
                1.1 * scale

        );


        branch.rotation.z =
            Math.cos(angle) * 0.7;

        branch.rotation.x =
            Math.sin(angle) * 0.7;


        branch.castShadow = true;

        tree.add(branch);

    }


    /* -----------------------------
       FLORES DE CEREZO
       ----------------------------- */

    const flowerMaterials = [

        new THREE.MeshStandardMaterial({
            color: 0xffb7d1
        }),

        new THREE.MeshStandardMaterial({
            color: 0xff8fb5
        }),

        new THREE.MeshStandardMaterial({
            color: 0xffd2df
        })

    ];


    /*
       Varias "nubes" de flores alrededor
       de las ramas.
    */

    for (let i = 0; i < 18; i++) {

        const flowerGeometry =
            new THREE.IcosahedronGeometry(
                (0.65 + Math.random() * 0.45) *
                scale,
                1
            );


        const flower =
            new THREE.Mesh(
                flowerGeometry,

                flowerMaterials[
                    Math.floor(
                        Math.random() *
                        flowerMaterials.length
                    )
                ]
            );


        const angle =
            Math.random() *
            Math.PI * 2;


        const radius =
            Math.random() *
            2.4 * scale;


        flower.position.set(

            Math.cos(angle) *
                radius,

            (4 + Math.random() * 2.2) *
                scale,

            Math.sin(angle) *
                radius

        );


        flower.scale.y =
            0.75;


        flower.castShadow = true;


        tree.add(flower);

    }


    tree.position.set(
        x,
        0,
        z
    );


    scene.add(tree);

    worldObjects.push(tree);

}


/* =========================================================
   🌸 CREAR CEREZOS DEL CAMINO
   ========================================================= */

function createCherryTrees() {

    const positions = [

        // Lado izquierdo
        [-10, -65, 1.1],
        [-12, -45, 0.9],
        [-10, -25, 1.2],
        [-12, -5, 1.0],
        [-10, 18, 1.1],
        [-12, 40, 0.95],
        [-10, 62, 1.15],

        // Lado derecho
        [10, -55, 1.0],
        [12, -35, 1.15],
        [10, -15, 0.9],
        [12, 8, 1.1],
        [10, 30, 1.0],
        [12, 52, 1.2],
        [10, 72, 0.95]

    ];


    positions.forEach(position => {

        createCherryTree(
            position[0],
            position[1],
            position[2]
        );

    });

}


/* =========================================================
   🌷 TULIPANES
   ========================================================= */

function createTulip(x, z) {

    const tulip =
        new THREE.Group();


    /* -----------------------------
       TALLO
       ----------------------------- */

    const stemGeometry =
        new THREE.CylinderGeometry(
            0.045,
            0.06,
            0.8,
            5
        );


    const stemMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4f8a50
        });


    const stem =
        new THREE.Mesh(
            stemGeometry,
            stemMaterial
        );


    stem.position.y =
        0.4;


    tulip.add(stem);


    /* -----------------------------
       FLOR
       ----------------------------- */

    const flowerGeometry =
        new THREE.SphereGeometry(
            0.18,
            8,
            6
        );


    const flowerMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xff82b0
        });


    const flower =
        new THREE.Mesh(
            flowerGeometry,
            flowerMaterial
        );


    flower.scale.set(
        0.8,
        1.2,
        0.8
    );


    flower.position.y =
        0.9;


    tulip.add(flower);


    /* -----------------------------
       HOJAS
       ----------------------------- */

    const leafMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x5d9b59
        });


    for (let i = 0; i < 2; i++) {

        const leafGeometry =
            new THREE.SphereGeometry(
                0.12,
                6,
                4
            );


        const leaf =
            new THREE.Mesh(
                leafGeometry,
                leafMaterial
            );


        leaf.scale.set(
            2,
            0.5,
            0.7
        );


        leaf.position.set(

            i === 0 ? -0.12 : 0.12,

            0.45,

            0

        );


        leaf.rotation.z =
            i === 0
                ? -0.5
                : 0.5;


        tulip.add(leaf);

    }


    tulip.position.set(
        x,
        0,
        z
    );


    scene.add(tulip);

}


/* =========================================================
   🌷 CREAR MUCHOS TULIPANES
   ========================================================= */

function createTulipGarden() {

    for (let z = -78; z < 82; z += 4) {

        /*
           Evitamos que los tulipanes estén
           directamente encima del camino.
        */

        const leftX =
            -6.5 -
            Math.random() * 3;


        const rightX =
            6.5 +
            Math.random() * 3;


        createTulip(
            leftX,
            z + Math.random() * 2 - 1
        );


        createTulip(
            rightX,
            z + Math.random() * 2 - 1
        );


        /*
           Alguno extra para que el jardín
           se vea menos uniforme.
        */

        if (Math.random() > 0.45) {

            createTulip(
                leftX - Math.random() * 2,
                z + 1
            );

        }


        if (Math.random() > 0.45) {

            createTulip(
                rightX + Math.random() * 2,
                z - 1
            );

        }

    }

}


/* =========================================================
   🍃 PÉTALOS DE CEREZO
   ========================================================= */

const petals = [];


function createCherryPetals() {

    const petalMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xffb6ce,

            transparent: true,

            opacity: 0.9

        });


    for (let i = 0; i < 100; i++) {

        const geometry =
            new THREE.PlaneGeometry(
                0.12,
                0.12
            );


        const petal =
            new THREE.Mesh(
                geometry,
                petalMaterial
            );


        petal.position.set(

            (Math.random() - 0.5) * 30,

            3 + Math.random() * 12,

            (Math.random() - 0.5) * 150

        );


        petal.rotation.set(

            Math.random() * Math.PI,

            Math.random() * Math.PI,

            Math.random() * Math.PI

        );


        petal.userData = {

            speed:
                0.003 +
                Math.random() * 0.008,

            drift:
                (Math.random() - 0.5) *
                0.01,

            rotation:
                (Math.random() - 0.5) *
                0.02

        };


        scene.add(petal);

        petals.push(petal);

    }

}


/* =========================================================
   🍃 ANIMAR PÉTALOS
   ========================================================= */

function animatePetals() {

    petals.forEach(petal => {

        petal.position.y -=
            petal.userData.speed;


        petal.position.x +=
            petal.userData.drift;


        petal.rotation.x +=
            petal.userData.rotation;


        petal.rotation.z +=
            petal.userData.rotation;


        /*
           Cuando llega al suelo,
           vuelve a aparecer arriba.
        */

        if (petal.position.y < 0) {

            petal.position.y =
                10 + Math.random() * 10;

            petal.position.x =
                (Math.random() - 0.5) * 30;

            petal.position.z =
                camera.position.z +
                (Math.random() - 0.5) * 80;

        }

    });

}


/* =========================================================
   🌸 ACTIVAR DECORACIÓN
   ========================================================= */

function createRomanticGarden() {

    createCherryTrees();

    createTulipGarden();

    createCherryPetals();

}

/* =========================================================
   FIN
   ========================================================= */
