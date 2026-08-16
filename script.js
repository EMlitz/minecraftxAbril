/* =========================================================
   MUNDO 3D - UN MUNDO PARA TI ❤️
   Script completo
   ========================================================= */

const WORLD = {
    width: 70,
    depth: 180,
    playerHeight: 1.7,
    moveSpeed: 0.11
};

/* =========================================================
   ✏️ TUS MENSAJES
   ========================================================= */

const SIGN_MESSAGES = [
    "ESCRIBE AQUÍ EL MENSAJE DEL CARTEL 1",
    "ESCRIBE AQUÍ EL MENSAJE DEL CARTEL 2",
    "ESCRIBE AQUÍ EL MENSAJE DEL CARTEL 3",
    "ESCRIBE AQUÍ EL MENSAJE DEL CARTEL 4"
];

const HOUSE_MESSAGE =
    "ESCRIBE AQUÍ EL MENSAJE FINAL DE LA CASITA";

/* =========================================================
   ELEMENTOS HTML
   ========================================================= */

const mainMenu = document.getElementById("main-menu");
const loadingScreen = document.getElementById("loading-screen");
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");
const loadingProgress = document.getElementById("loading-progress");
const loadingText = document.getElementById("loading-text");
const gameContainer = document.getElementById("game-container");
const joystickBase = document.getElementById("joystick-base");
const joystickStick = document.getElementById("joystick-stick");

/* =========================================================
   THREE.JS
   ========================================================= */

let scene;
let camera;
let renderer;
let animationStarted = false;
let playerRotation = 0;

const worldObjects = [];
const petals = [];
const signs = [];

let joystickActive = false;
let joystickX = 0;
let joystickY = 0;
let joystickPointerId = null;

let lookActive = false;
let lastTouchX = 0;

let activeMessage = null;
let messageTimer = null;
let house = null;
let houseTriggered = false;

/* =========================================================
   INICIO
   ========================================================= */

if (startButton) {
    startButton.addEventListener("click", () => {
        showScreen(loadingScreen);
        simulateLoading();
    });
}

function showScreen(screen) {
    if (!screen) return;

    document.querySelectorAll(".screen").forEach(element => {
        element.classList.remove("active");
    });

    screen.classList.add("active");
}

function simulateLoading() {
    let progress = 0;

    const messages = [
        "Preparando el mundo...",
        "Generando el terreno...",
        "Preparando el atardecer...",
        "Plantando tulipanes...",
        "Generando los cerezos...",
        "Construyendo el sendero...",
        "Colocando los carteles...",
        "Preparando algo especial...",
        "Casi listo..."
    ];

    const interval = setInterval(() => {
        progress += 2;

        if (loadingProgress) {
            loadingProgress.style.width = `${progress}%`;
        }

        const index = Math.min(
            Math.floor(progress / 12),
            messages.length - 1
        );

        if (loadingText) {
            loadingText.textContent = messages[index];
        }

        if (progress >= 100) {
            clearInterval(interval);

            setTimeout(() => {
                startWorld();
            }, 500);
        }
    }, 35);
}

function startWorld() {
    showScreen(gameScreen);

    if (!scene) {
        initializeThree();
    }
}

/* =========================================================
   INICIALIZAR THREE.JS
   ========================================================= */

function initializeThree() {
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xe99aa8);
    scene.fog = new THREE.Fog(0xe99aa8, 45, 175);

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.05,
        500
    );

    camera.position.set(
        0,
        WORLD.playerHeight,
        8
    );

    renderer = new THREE.WebGLRenderer({
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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    gameContainer.appendChild(renderer.domElement);

    createLights();
    createWorld();

    setupJoystick();
    setupTouchCamera();

    window.addEventListener(
        "resize",
        onWindowResize
    );

    animationStarted = true;
    animate();
}

/* =========================================================
   LUCES
   ========================================================= */

function createLights() {
    const ambientLight = new THREE.HemisphereLight(
        0xffd2d9,
        0x33263d,
        1.8
    );

    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(
        0xffb08a,
        3
    );

    sun.position.set(-40, 50, 60);
    sun.castShadow = true;

    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;

    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;

    scene.add(sun);

    const sunsetLight = new THREE.PointLight(
        0xff7f9d,
        2,
        120
    );

    sunsetLight.position.set(0, 15, 70);
    scene.add(sunsetLight);
}

/* =========================================================
   MUNDO
   ========================================================= */

function createWorld() {
    createGround();
    createPath();
    createMountains();
    createRomanticGarden();
    createSigns();
    createHouse();
}

/* =========================================================
   SUELO
   ========================================================= */

function createGround() {
    const geometry = new THREE.BoxGeometry(
        WORLD.width,
        1,
        WORLD.depth
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x6b8f62,
        roughness: 1
    });

    const ground = new THREE.Mesh(
        geometry,
        material
    );

    ground.position.set(0, -0.5, 0);
    ground.receiveShadow = true;

    scene.add(ground);
    worldObjects.push(ground);
}

/* =========================================================
   SENDERO
   ========================================================= */

function createPath() {
    const blockSize = 2;
    const pathWidth = 5;
    const pathLength = 160;

    const material = new THREE.MeshStandardMaterial({
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
            const geometry = new THREE.BoxGeometry(
                blockSize,
                0.35,
                blockSize
            );

            const block = new THREE.Mesh(
                geometry,
                material
            );

            block.position.set(x, 0.15, z);
            block.castShadow = true;
            block.receiveShadow = true;

            scene.add(block);
            worldObjects.push(block);
        }
    }
}

/* =========================================================
   MONTAÑAS
   ========================================================= */

function createMountains() {
    const material = new THREE.MeshStandardMaterial({
        color: 0x5c526b,
        roughness: 1
    });

    for (const side of [-1, 1]) {
        for (let i = 0; i < 15; i++) {
            const height = 8 + Math.random() * 15;
            const width = 8 + Math.random() * 15;

            const geometry = new THREE.ConeGeometry(
                width,
                height,
                6
            );

            const mountain = new THREE.Mesh(
                geometry,
                material
            );

            mountain.position.set(
                side * (25 + Math.random() * 8),
                height / 2 - 0.2,
                -70 + Math.random() * 150
            );

            mountain.rotation.y =
                Math.random() * Math.PI;

            mountain.castShadow = true;
            mountain.receiveShadow = true;

            scene.add(mountain);
        }
    }
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
       🌸 FLORES DE CEREZO
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
       🌷 FLOR
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
   🌷 CREAR JARDÍN DE TULIPANES
   ========================================================= */

function createTulipGarden() {

    for (let z = -78; z < 82; z += 4) {

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

function createCherryPetals() {

    const petalMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xffb6ce,

            transparent: true,

            opacity: 0.9,

            side: THREE.DoubleSide

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
   🪧 CARTEL INTERACTIVO
   ========================================================= */

function createSign(x, z, index) {

    const group =
        new THREE.Group();


    /* -----------------------------
       POSTE
       ----------------------------- */

    const woodMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x704b32,
            roughness: 1
        });


    const postGeometry =
        new THREE.BoxGeometry(
            0.18,
            1.8,
            0.18
        );


    const post =
        new THREE.Mesh(
            postGeometry,
            woodMaterial
        );


    post.position.y =
        0.9;


    post.castShadow = true;


    group.add(post);


    /* -----------------------------
       TABLA
       ----------------------------- */

    const boardGeometry =
        new THREE.BoxGeometry(
            1.8,
            1.0,
            0.16
        );


    const board =
        new THREE.Mesh(
            boardGeometry,
            woodMaterial
        );


    board.position.y =
        1.55;


    board.castShadow = true;


    group.add(board);


    /* -----------------------------
       POSICIÓN
       ----------------------------- */

    group.position.set(
        x,
        0,
        z
    );


    scene.add(group);


    signs.push({

        object: group,

        position:
            new THREE.Vector3(
                x,
                1.4,
                z
            ),

        message:
            SIGN_MESSAGES[index],

        index: index,

        opened: false

    });

}


/* =========================================================
   🪧 CREAR LOS 4 CARTELES
   ========================================================= */

function createSigns() {

    const positions = [

        [-6.4, -50],

        [6.4, -22],

        [-6.4, 12],

        [6.4, 45]

    ];


    positions.forEach(
        (position, index) => {

            createSign(
                position[0],
                position[1],
                index
            );

        }
    );

}


/* =========================================================
   💬 INTERFAZ DE MENSAJES
   ========================================================= */

function createMessageUI() {

    if (
        document.getElementById(
            "world-message-ui"
        )
    ) {
        return;
    }


    /* -----------------------------
       ESTILOS
       ----------------------------- */

    const style =
        document.createElement(
            "style"
        );


    style.id =
        "world-message-style";


    style.textContent = `

        #world-message-ui {

            position: fixed;

            inset: 0;

            z-index: 9999;

            display: none;

            align-items: center;

            justify-content: center;

            padding: 25px;

            box-sizing: border-box;

            background:
                rgba(20, 8, 20, .42);

            pointer-events: auto;

        }


        #world-message-box {

            width:
                min(90vw, 430px);

            padding:
                24px 22px;

            border-radius:
                18px;

            background:
                rgba(255, 240, 247, .97);

            color:
                #4a3040;

            text-align:
                center;

            box-shadow:
                0 12px 45px
                rgba(0,0,0,.35);

            font-family:
                Arial, sans-serif;

            animation:
                messagePop .25s ease;

        }


        #world-message-title {

            margin:
                0 0 12px;

            font-size:
                22px;

        }


        #world-message-text {

            margin:
                0;

            font-size:
                18px;

            line-height:
                1.5;

        }


        #world-message-close {

            margin-top:
                18px;

            padding:
                10px 20px;

            border:
                0;

            border-radius:
                12px;

            background:
                #e887ad;

            color:
                white;

            font-size:
                16px;

            cursor:
                pointer;

        }


        #sign-interaction {

            position:
                fixed;

            left:
                50%;

            bottom:
                17%;

            transform:
                translateX(-50%);

            z-index:
                9998;

            display:
                none;

            padding:
                11px 18px;

            border:
                0;

            border-radius:
                14px;

            background:
                rgba(40,25,35,.88);

            color:
                white;

            font-size:
                16px;

            cursor:
                pointer;

        }


        @keyframes messagePop {

            from {

                opacity:
                    0;

                transform:
                    scale(.9);

            }

            to {

                opacity:
                    1;

                transform:
                    scale(1);

            }

        }

    `;


    document.head.appendChild(
        style
    );


    /* -----------------------------
       VENTANA DEL MENSAJE
       ----------------------------- */

    const ui =
        document.createElement(
            "div"
        );


    ui.id =
        "world-message-ui";


    ui.innerHTML = `

        <div
            id="world-message-box"
        >

            <h2
                id="world-message-title"
            >
                🪧 Un mensaje para ti
            </h2>


            <p
                id="world-message-text"
            ></p>


            <button
                id="world-message-close"
            >
                Continuar ❤️
            </button>

        </div>

    `;


    document.body.appendChild(
        ui
    );


    /* -----------------------------
       BOTÓN DEL CARTEL
       ----------------------------- */

    const interaction =
        document.createElement(
            "button"
        );


    interaction.id =
        "sign-interaction";


    interaction.textContent =
        "🪧 Leer cartel";


    document.body.appendChild(
        interaction
    );


    /* -----------------------------
       EVENTOS
       ----------------------------- */

    document
        .getElementById(
            "world-message-close"
        )
        .addEventListener(
            "click",
            closeMessage
        );


    interaction.addEventListener(
        "click",
        interactWithNearestObject
    );

}


/* =========================================================
   💬 MOSTRAR MENSAJE
   ========================================================= */

function showMessage(
    title,
    message,
    duration = 3000
) {

    createMessageUI();


    const ui =
        document.getElementById(
            "world-message-ui"
        );


    const titleElement =
        document.getElementById(
            "world-message-title"
        );


    const textElement =
        document.getElementById(
            "world-message-text"
        );


    titleElement.textContent =
        title;


    textElement.textContent =
        message;


    ui.style.display =
        "flex";


    clearTimeout(
        messageTimer
    );


    messageTimer =
        setTimeout(() => {

            closeMessage();

        }, duration);

}


/* =========================================================
   ❌ CERRAR MENSAJE
   ========================================================= */

function closeMessage() {

    const ui =
        document.getElementById(
            "world-message-ui"
        );


    if (ui) {

        ui.style.display =
            "none";

    }


    clearTimeout(
        messageTimer
    );


    activeMessage =
        null;

}


/* =========================================================
   🪧 BUSCAR CARTEL MÁS CERCANO
   ========================================================= */

function getNearestSign() {

    if (
        !camera ||
        signs.length === 0
    ) {

        return null;

    }


    let nearest =
        null;


    let nearestDistance =
        Infinity;


    signs.forEach(
        sign => {

            const distance =
                camera.position.distanceTo(
                    sign.position
                );


            if (
                distance <
                    nearestDistance &&
                distance <
                    4
            ) {

                nearest =
                    sign;

                nearestDistance =
                    distance;

            }

        }
    );


    return nearest;

}


/* =========================================================
   🪧 ACTUALIZAR BOTÓN DEL CARTEL
   ========================================================= */

function updateSignInteraction() {

    const button =
        document.getElementById(
            "sign-interaction"
        );


    if (!button) {
        return;
    }


    const sign =
        getNearestSign();


    if (
        sign &&
        !activeMessage
    ) {

        button.style.display =
            "block";


        button.textContent =
            `🪧 Leer cartel ${sign.index + 1}`;

    }

    else {

        button.style.display =
            "none";

    }

}


/* =========================================================
   🪧 LEER CARTEL
   ========================================================= */

function interactWithNearestObject() {

    const sign =
        getNearestSign();


    if (!sign) {
        return;
    }


    activeMessage =
        sign;


    showMessage(

        `🪧 Cartel ${sign.index + 1}`,

        sign.message,

        3000

    );

}


/* =========================================================
   🏠 CASITA
   ========================================================= */

/* =========================================================
   🏡 CASITA / PARQUE ROMÁNTICO FINAL
   ========================================================= */

function createHouse() {

    house = new THREE.Group();

    /* =====================================================
       🎨 MATERIALES
       ===================================================== */

    const woodMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x70452f,
            roughness: 0.9
        });

    const darkWoodMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4b2c28,
            roughness: 1
        });

    const pinkWoodMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xb94f68,
            roughness: 0.9
        });

    const leafMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x315c35,
            roughness: 1
        });

    const leafLightMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x477a43,
            roughness: 1
        });

    const pinkFlowerMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xff82ae
        });

    const whiteFlowerMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffdbe7
        });

    const lanternMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffd59a,
            emissive: 0xff8c55,
            emissiveIntensity: 1.4
        });

    const stoneMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x806b61,
            roughness: 1
        });

    const lightPinkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xffa8c1,
            roughness: 0.8
        });

    const redMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xa9364f,
            roughness: 0.8
        });


    /* =====================================================
       🏡 PISO DEL PARQUE
       ===================================================== */

    const floorSize = 15;
    const tileSize = 1.5;

    for (
        let x = -floorSize / 2;
        x < floorSize / 2;
        x += tileSize
    ) {

        for (
            let z = -floorSize / 2;
            z < floorSize / 2;
            z += tileSize
        ) {

            const tile =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        tileSize,
                        0.22,
                        tileSize
                    ),

                    (
                        Math.round(x / tileSize) +
                        Math.round(z / tileSize)
                    ) % 2 === 0
                        ? lightPinkMaterial
                        : redMaterial

                );

            tile.position.set(
                x,
                0.11,
                z
            );

            tile.receiveShadow = true;

            house.add(tile);

        }

    }


    /* =====================================================
       🚪 PEQUEÑA ESTRUCTURA DE LA CASA
       ===================================================== */

    const backWall =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                10,
                4.8,
                0.5
            ),

            darkWoodMaterial

        );

    backWall.position.set(
        0,
        2.4,
        -5.2
    );

    backWall.castShadow = true;

    house.add(backWall);


    /* =====================================================
       🪵 POSTES DE LA CASA
       ===================================================== */

    const postPositions = [

        [-5, 0, -4.8],
        [5, 0, -4.8],
        [-5, 0, 4.8],
        [5, 0, 4.8]

    ];


    postPositions.forEach(
        position => {

            const post =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        0.55,
                        4.5,
                        0.55
                    ),

                    woodMaterial

                );

            post.position.set(
                position[0],
                2.25,
                position[2]
            );

            post.castShadow = true;

            house.add(post);

        }
    );


    /* =====================================================
       🌿 TECHO / PÉRGOLA
       ===================================================== */

    const roof =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                11,
                0.6,
                10
            ),

            darkWoodMaterial

        );

    roof.position.y = 5;

    roof.castShadow = true;

    house.add(roof);


    /* =====================================================
       🌿 VEGETACIÓN SOBRE EL TECHO
       ===================================================== */

    for (let i = 0; i < 35; i++) {

        const leaf =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.8 + Math.random() * 0.7,
                    0.35,
                    0.8 + Math.random() * 0.7
                ),

                Math.random() > 0.5
                    ? leafMaterial
                    : leafLightMaterial

            );

        leaf.position.set(

            (Math.random() - 0.5) * 10,

            5.35 + Math.random() * 0.35,

            (Math.random() - 0.5) * 8

        );

        leaf.rotation.y =
            Math.random() * Math.PI;

        house.add(leaf);

    }


    /* =====================================================
       ❤️ CORAZÓN GIGANTE
       ===================================================== */

    const heartGroup =
        new THREE.Group();


    const heartMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0xb52f48,

            emissive:
                0x5c1020,

            emissiveIntensity:
                0.45

        });


    /*
     * Dos partes superiores
     */

    const heartLeft =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.4,
                2.4,
                0.7
            ),

            heartMaterial

        );


    const heartRight =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.4,
                2.4,
                0.7
            ),

            heartMaterial

        );


    heartLeft.position.set(
        -1.45,
        1.15,
        0
    );


    heartRight.position.set(
        1.45,
        1.15,
        0
    );


    heartGroup.add(
        heartLeft
    );

    heartGroup.add(
        heartRight
    );


    /*
     * Parte inferior del corazón
     */

    const heartBottom =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                4.3,
                2.5,
                0.7
            ),

            heartMaterial

        );


    heartBottom.position.set(
        0,
        -0.35,
        0
    );


    heartBottom.rotation.z =
        Math.PI / 4;


    heartBottom.scale.x =
        0.85;


    heartGroup.add(
        heartBottom
    );


    /*
     * Corazón situado
     * sobre la parte trasera
     */

    heartGroup.position.set(
       0,
       6.5,
       -4.7
   );
   
   heartGroup.rotation.y = Math.PI;


    heartGroup.scale.set(
        1.35,
        1.35,
        1
    );


    house.add(
        heartGroup
    );


    /* =====================================================
       ✨ LUZ DEL CORAZÓN
       ===================================================== */

    const heartLight =
        new THREE.PointLight(
            0xff5577,
            2,
            14
        );

    heartLight.position.set(
        0,
        6.5,
        -4
    );

    house.add(
        heartLight
    );


    /* =====================================================
       🪑 BANCOS
       ===================================================== */

    function createBench(x, z) {

        const bench =
            new THREE.Group();


        const seat =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    3,
                    0.35,
                    0.8
                ),

                woodMaterial

            );


        seat.position.y =
            1.15;


        bench.add(
            seat
        );


        /*
         * Respaldo
         */

        const back =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    3,
                    1.2,
                    0.3
                ),

                woodMaterial

            );


        back.position.set(
            0,
            1.7,
            -0.25
        );


        bench.add(
            back
        );


        /*
         * Patas
         */

        for (
            const px of [-1.1, 1.1]
        ) {

            const leg =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        0.3,
                        1.1,
                        0.5
                    ),

                    darkWoodMaterial

                );

            leg.position.set(
                px,
                0.55,
                0
            );

            bench.add(
                leg
            );

        }


        bench.position.set(
            x,
            0,
            z
        );


        house.add(
            bench
        );

    }


    createBench(
        -3.8,
        1.3
    );


    createBench(
        3.8,
        1.3
    );


    /* =====================================================
       🌸 MESA CENTRAL
       ===================================================== */

    const tableTop =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.2,
                0.3,
                1.4
            ),

            woodMaterial

        );


    tableTop.position.set(
        0,
        1.25,
        1.3
    );


    house.add(
        tableTop
    );


    const tableLeg =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.35,
                1.2,
                0.35
            ),

            darkWoodMaterial

        );


    tableLeg.position.set(
        0,
        0.65,
        1.3
    );


    house.add(
        tableLeg
    );


    /* =====================================================
       🕯️ LUZ SOBRE LA MESA
       ===================================================== */

    const tableLight =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.18,
                8,
                8
            ),

            lanternMaterial

        );


    tableLight.position.set(
        0,
        1.65,
        1.3
    );


    house.add(
        tableLight
    );


    const tablePointLight =
        new THREE.PointLight(
            0xffb36b,
            1.2,
            8
        );


    tablePointLight.position.set(
        0,
        1.8,
        1.3
    );


    house.add(
        tablePointLight
    );


    /* =====================================================
       🏮 FAROLES
       ===================================================== */

    function createLantern(x, z) {

        const pole =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.09,
                    0.12,
                    1.5,
                    6
                ),

                darkWoodMaterial

            );


        pole.position.set(
            x,
            0.75,
            z
        );


        house.add(
            pole
        );


        const lamp =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.42,
                    0.55,
                    0.42
                ),

                lanternMaterial

            );


        lamp.position.set(
            x,
            1.65,
            z
        );


        house.add(
            lamp
        );


        const light =
            new THREE.PointLight(
                0xffaa66,
                1.5,
                6
            );


        light.position.set(
            x,
            1.65,
            z
        );


        house.add(
            light
        );

    }


    createLantern(
        -5.8,
        4
    );

    createLantern(
        5.8,
        4
    );

    createLantern(
        -5.8,
        -1
    );

    createLantern(
        5.8,
        -1
    );


    /* =====================================================
       🌿 ARBUSTOS
       ===================================================== */

    function createBush(
        x,
        z,
        scale = 1
    ) {

        const bush =
            new THREE.Group();


        for (let i = 0; i < 5; i++) {

            const leaf =
                new THREE.Mesh(

                    new THREE.IcosahedronGeometry(
                        0.75 * scale,
                        1
                    ),

                    Math.random() > 0.5
                        ? leafMaterial
                        : leafLightMaterial

                );


            leaf.position.set(

                (Math.random() - 0.5) *
                1.5 *
                scale,

                0.55 +
                Math.random() *
                0.7 *
                scale,

                (Math.random() - 0.5) *
                1.2 *
                scale

            );


            bush.add(
                leaf
            );

        }


        bush.position.set(
            x,
            0,
            z
        );


        house.add(
            bush
        );

    }


    createBush(
        -6.2,
        -3.5,
        1.2
    );

    createBush(
        6.2,
        -3.5,
        1.2
    );

    createBush(
        -6.5,
        2.5,
        1
    );

    createBush(
        6.5,
        2.5,
        1
    );


    /* =====================================================
       🌷 FLORES ALREDEDOR
       ===================================================== */

    function createParkFlower(
        x,
        z,
        colorMaterial
    ) {

        const stem =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.035,
                    0.045,
                    0.6,
                    5
                ),

                leafLightMaterial

            );


        stem.position.set(
            x,
            0.3,
            z
        );


        house.add(
            stem
        );


        const flower =
            new THREE.Mesh(

                new THREE.IcosahedronGeometry(
                    0.18,
                    1
                ),

                colorMaterial

            );


        flower.position.set(
            x,
            0.7,
            z
        );


        house.add(
            flower
        );

    }


    for (let i = 0; i < 28; i++) {

        const side =
            Math.random() > 0.5
                ? -1
                : 1;


        const x =
            side *
            (
                6.5 +
                Math.random() * 2.2
            );


        const z =
            -5 +
            Math.random() * 10;


        createParkFlower(

            x,
            z,

            Math.random() > 0.45
                ? pinkFlowerMaterial
                : whiteFlowerMaterial

        );

    }


    /* =====================================================
       🌹 FLORES DELANTE
       ===================================================== */

    for (let i = 0; i < 18; i++) {

        const x =
            -5 +
            Math.random() * 10;

        const z =
            4.5 +
            Math.random() * 3;

        createParkFlower(

            x,
            z,

            Math.random() > 0.5
                ? pinkFlowerMaterial
                : whiteFlowerMaterial

        );

    }


    /* =====================================================
       🪨 CAMINO DE ENTRADA
       ===================================================== */

    for (
        let z = 7;
        z < 25;
        z += 1.6
    ) {

        const stone =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    2.4,
                    0.18,
                    1.3
                ),

                stoneMaterial

            );


        stone.position.set(

            (Math.random() - 0.5) *
            1.5,

            0.09,

            z

        );


        stone.rotation.y =
            (Math.random() - 0.5) *
            0.25;


        stone.receiveShadow = true;


        house.add(
            stone
        );

    }


    /* =====================================================
       🪧 CARTEL FINAL
       ===================================================== */

    const signPost =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.18,
                1.7,
                0.18
            ),

            woodMaterial

        );


    signPost.position.set(
        7.2,
        0.85,
        5
    );


    house.add(
        signPost
    );


    const signBoard =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.8,
                1.4,
                0.18
            ),

            pinkWoodMaterial

        );


    signBoard.position.set(
        7.2,
        1.6,
        5
    );


    signBoard.rotation.y =
        -0.2;


    house.add(
        signBoard
    );


    /* =====================================================
       📍 UBICACIÓN FINAL
       ===================================================== */

    house.position.set(
        0,
        0,
        -70
    );


    scene.add(
        house
    );

}

/* =========================================================
   🏠 DETECTAR CASITA
   ========================================================= */

function updateHouse() {

    if (
        !house ||
        houseTriggered ||
        !camera
    ) {
        return;
    }

    const distance =
        camera.position.distanceTo(
            house.position
        );

    if (distance < 7) {

        houseTriggered =
            true;

        showMessage(
            "🏠 Un mensaje para ti ❤️",
            HOUSE_MESSAGE,
            4500
        );

        setTimeout(() => {

            showProposal();

        }, 4600);

    }
}

/* =========================================================
   🎮 CONFIGURAR JOYSTICK
   ========================================================= */

function setupJoystick() {

    if (!joystickBase) {
        return;
    }


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
   🎮 INICIAR JOYSTICK
   ========================================================= */

function joystickStart(event) {

    joystickActive =
        true;


    joystickPointerId =
        event.pointerId;


    if (
        joystickBase.setPointerCapture
    ) {

        joystickBase.setPointerCapture(
            event.pointerId
        );

    }


    updateJoystick(

        event.clientX,

        event.clientY

    );

}


/* =========================================================
   🎮 MOVER JOYSTICK
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
   🎮 ACTUALIZAR POSICIÓN JOYSTICK
   ========================================================= */

function updateJoystick(
    clientX,
    clientY
) {

    if (
        !joystickBase ||
        !joystickStick
    ) {
        return;
    }


    const rect =
        joystickBase.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    let dx =
        clientX -
        centerX;


    let dy =
        clientY -
        centerY;


    const maxDistance =
        45;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance >
        maxDistance
    ) {

        dx =
            dx /
            distance *
            maxDistance;


        dy =
            dy /
            distance *
            maxDistance;

    }


    joystickStick.style.transform =

        `translate(
            calc(-50% + ${dx}px),
            calc(-50% + ${dy}px)
        )`;


    joystickX =
        dx /
        maxDistance;


    joystickY =
        dy /
        maxDistance;

}


/* =========================================================
   🎮 SOLTAR JOYSTICK
   ========================================================= */

function joystickEnd() {

    joystickActive =
        false;


    joystickPointerId =
        null;


    joystickX =
        0;


    joystickY =
        0;


    if (joystickStick) {

        joystickStick.style.transform =

            "translate(-50%, -50%)";

    }

}


/* =========================================================
   👀 CÁMARA TÁCTIL
   ========================================================= */

function setupTouchCamera() {

    renderer.domElement.addEventListener(

        "pointerdown",

        event => {

            /*
             * La parte izquierda de la pantalla
             * queda reservada para el joystick.
             */

            if (
                event.clientX <
                window.innerWidth *
                0.35
            ) {

                return;

            }


            lookActive =
                true;


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

                difference *
                0.004;


            camera.rotation.y =

                playerRotation;

        }

    );


    window.addEventListener(

        "pointerup",

        () => {

            lookActive =
                false;

        }

    );

}


/* =========================================================
   🚶 MOVIMIENTO DEL JUGADOR
   ========================================================= */

function updatePlayer() {

    if (!camera) {
        return;
    }


    /*
     * Dirección hacia adelante.
     */

    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    forward.applyAxisAngle(

        new THREE.Vector3(
            0,
            1,
            0
        ),

        playerRotation

    );


    /*
     * Dirección lateral.
     */

    const right =
        new THREE.Vector3(
            1,
            0,
            0
        );


    right.applyAxisAngle(

        new THREE.Vector3(
            0,
            1,
            0
        ),

        playerRotation

    );


    /*
     * Movimiento final.
     */

    const movement =
        new THREE.Vector3();


    movement.addScaledVector(

        forward,

        -joystickY *
        WORLD.moveSpeed

    );


    movement.addScaledVector(

        right,

        joystickX *
        WORLD.moveSpeed

    );


    camera.position.add(
        movement
    );


    /*
     * Limitar al jugador
     * dentro del mundo.
     */

    const limitX =
        WORLD.width / 2 -
        2;


    const limitZ =
        WORLD.depth / 2 -
        2;


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
     * Mantener altura
     * de los ojos.
     */

    camera.position.y =

        WORLD.playerHeight;

}


/* =========================================================
   🔄 BUCLE PRINCIPAL
   ========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (
        !animationStarted
    ) {
        return;
    }


    /*
     * Movimiento.
     */

    updatePlayer();


    /*
     * Pétalos cayendo.
     */

    animatePetals();


    /*
     * Comprobar carteles.
     */

    updateSignInteraction();


    /*
     * Comprobar llegada
     * a la casita.
     */

    updateHouse();


    /*
     * Renderizar.
     */

    renderer.render(

        scene,

        camera

    );

}


/* =========================================================
   📱 CAMBIO DE TAMAÑO
   ========================================================= */

function onWindowResize() {

    if (
        !camera ||
        !renderer
    ) {
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
   💗 DECLARACIÓN FINAL
   ========================================================= */

let proposalShown = false;
let noAttempts = 0;


/* =========================================================
   💗 MOSTRAR LA PREGUNTA
   ========================================================= */

function showProposal() {

    if (proposalShown) {
        return;
    }

    proposalShown = true;

    createProposalUI();

}


/* =========================================================
   💗 CREAR INTERFAZ DE DECLARACIÓN
   ========================================================= */

function createProposalUI() {

    if (
        document.getElementById(
            "proposal-ui"
        )
    ) {
        document.getElementById(
            "proposal-ui"
        ).style.display = "flex";

        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "proposal-style";


    style.textContent = `

        #proposal-ui {

            position: fixed;

            inset: 0;

            z-index: 10000;

            pointer-events: auto;

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 25px;

            box-sizing: border-box;

            background:
                linear-gradient(
                    rgba(35, 12, 28, .45),
                    rgba(20, 8, 25, .65)
                );

            font-family:
                Arial, sans-serif;

        }


        #proposal-box {

            width:
                min(90vw, 460px);

            padding:
                35px 25px;

            border-radius:
                25px;

            background:
                rgba(255, 239, 247, .97);

            color:
                #4a3040;

            text-align:
                center;

            box-shadow:
                0 15px 60px
                rgba(0,0,0,.4);

            animation:
                proposalAppear
                .6s ease;

        }


        #proposal-heart {

            font-size:
                55px;

            margin-bottom:
                10px;

            animation:
                heartBeat
                1.2s infinite;

        }


        #proposal-title {

            margin:
                0 0 12px;

            font-size:
                28px;

        }


        #proposal-text {

            margin:
                0 0 25px;

            font-size:
                18px;

            line-height:
                1.5;

        }


        #proposal-buttons {

            display:
                flex;

            justify-content:
                center;

            gap:
                15px;

        }


        .proposal-button {

            border:
                none;

            border-radius:
                15px;

            padding:
                13px 25px;

            font-size:
                18px;

            font-weight:
                bold;

            cursor:
                pointer;

            transition:
                transform .2s ease;

        }


        .proposal-button:hover {

            transform:
                scale(1.08);

        }


        #yes-button {

            background:
                #e875a5;

            color:
                white;

        }


        #no-button {

            background:
                #ddd0d6;

            color:
                #5b4651;

        }


        @keyframes proposalAppear {

            from {

                opacity:
                    0;

                transform:
                    scale(.8)
                    translateY(20px);

            }

            to {

                opacity:
                    1;

                transform:
                    scale(1)
                    translateY(0);

            }

        }


        @keyframes heartBeat {

            0%, 100% {

                transform:
                    scale(1);

            }

            50% {

                transform:
                    scale(1.15);

            }

        }

    `;


    document.head.appendChild(
        style
    );


    const proposal =
        document.createElement("div");


    proposal.id =
        "proposal-ui";


    proposal.innerHTML = `

        <div id="proposal-box">

            <div id="proposal-heart">
                💗
            </div>

            <h2 id="proposal-title">
                Tengo algo que preguntarte...
            </h2>

            <p id="proposal-text">
                ¿Quieres ser mi enamorada?
            </p>

            <div id="proposal-buttons">

                <button
                   id="yes-button"
                   class="proposal-button"
                   type="button"
                   onclick="acceptProposal()"
               >
                   Sí 💖
               </button>
               
               <button
                   id="no-button"
                   class="proposal-button"
                   type="button"
                   onclick="rejectProposal()"
               >
                   No 🥺
               </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        proposal
    );

}


/* =========================================================
   💖 SÍ
   ========================================================= */

function acceptProposal() {

    const proposal =
        document.getElementById(
            "proposal-ui"
        );

    if (proposal) {

        proposal.remove();

    }

    /*
     * Detenemos la interacción
     * con los carteles.
     */

    const signButton =
        document.getElementById(
            "sign-interaction"
        );

    if (signButton) {

        signButton.style.display =
            "none";

    }

    /*
     * Comienza la celebración.
     */

    createCelebration();

}


/* =========================================================
   🥺 NO
   ========================================================= */

function rejectProposal() {

    noAttempts++;

    const title =
        document.getElementById(
            "proposal-title"
        );

    const text =
        document.getElementById(
            "proposal-text"
        );

    const noButton =
        document.getElementById(
            "no-button"
        );

    const yesButton =
        document.getElementById(
            "yes-button"
        );


    if (noAttempts === 1) {

        title.textContent =
            "🥺 ¿Segura?";

        text.textContent =
            "Piénsalo un poquito más... ❤️";

        noButton.textContent =
            "Todavía no 🥺";

    }


    else if (noAttempts === 2) {

        title.textContent =
            "💗 ¿De verdad?";

        text.textContent =
            "Yo tenía muchas ganas de hacerte esta pregunta...";

        noButton.textContent =
            "No 😭";

    }


    else {

        title.textContent =
            "❤️ Está bien";

        text.textContent =
            "Entiendo tu decisión. Gracias por haber recorrido todo este pequeño mundo conmigo.";

        noButton.style.display =
            "none";

        yesButton.style.display =
            "none";

    }

}


/* =========================================================
   🎆 CELEBRACIÓN
   ========================================================= */

function createCelebration() {

    const celebration =
        document.createElement(
            "div"
        );


    celebration.id =
        "celebration-ui";


    celebration.innerHTML = `

        <div id="celebration-content">

            <div class="celebration-heart">
                ❤️
            </div>

            <h1>
                ¡SÍ!❤️
            </h1>

            <p>
                Me haces el hombre más feliz
                del mundo.
            </p>

        </div>

    `;


    document.body.appendChild(
        celebration
    );


    createCelebrationStyles();

    launchFireworks();

    createFloatingHearts();

}


/* =========================================================
   🎆 ESTILOS DE CELEBRACIÓN
   ========================================================= */

function createCelebrationStyles() {

    if (
        document.getElementById(
            "celebration-style"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "celebration-style";


    style.textContent = `

        #celebration-ui {

            position: fixed;

            inset: 0;

            z-index: 20000;

            display: flex;

            align-items: center;

            justify-content: center;

            overflow: hidden;

            background:
                rgba(20, 5, 18, .15);

            pointer-events:
                none;

        }


        #celebration-content {

            position:
                relative;

            z-index:
                20002;

            width:
                min(85vw, 500px);

            padding:
                35px 25px;

            border-radius:
                25px;

            text-align:
                center;

            background:
                rgba(255, 240, 247, .96);

            color:
                #4a3040;

            box-shadow:
                0 15px 60px
                rgba(0,0,0,.35);

            animation:
                celebrationPop
                .7s ease;

        }


        #celebration-content h1 {

            font-size:
                42px;

            margin:
                5px 0 15px;

        }


        #celebration-content p {

            font-size:
                21px;

            line-height:
                1.5;

            margin:
                0;

        }


        .celebration-heart {

            font-size:
                70px;

            animation:
                heartBeat
                1s infinite;

        }


        .floating-heart {

            position:
                fixed;

            z-index:
                20001;

            font-size:
                28px;

            pointer-events:
                none;

            animation:
                heartFloat
                3s linear
                forwards;

        }


        .firework-particle {

             position:
                 absolute;
         
             width:
                 8px;
         
             height:
                 8px;
         
             border-radius:
                 50%;
         
             z-index:
                 20003;
         
             pointer-events:
                 none;
         
             will-change:
                 transform,
                 opacity;
         
         }


        @keyframes celebrationPop {

            from {

                opacity:
                    0;

                transform:
                    scale(.5);

            }

            to {

                opacity:
                    1;

                transform:
                    scale(1);

            }

        }


        @keyframes heartFloat {

            from {

                transform:
                    translateY(0)
                    scale(.6);

                opacity:
                    1;

            }

            to {

                transform:
                    translateY(-100vh)
                    scale(1.5);

                opacity:
                    0;

            }

        }
   `;



    document.head.appendChild(
        style
    );

}

/* =========================================================
   🎆 FUEGOS ARTIFICIALES
   ========================================================= */

function launchFireworks() {

    /*
     * Lanzamos varias explosiones durante unos segundos.
     */

    const totalBursts = 24;

    for (
        let i = 0;
        i < totalBursts;
        i++
    ) {

        setTimeout(() => {

            createFireworkBurst();

        }, i * 300);

    }

}


/* =========================================================
   🎆 CREAR EXPLOSIÓN DE FUEGOS
   ========================================================= */

function createFireworkBurst() {

    /*
     * Creamos un punto central para la explosión.
     */

    const burst =
        document.createElement("div");


    burst.style.position =
        "fixed";


    /*
     * Evitamos colocar demasiados
     * fuegos justo encima de la tarjeta.
     */

    let centerX;
    let centerY;


    if (Math.random() < 0.5) {

        /*
         * Lado izquierdo.
         */

        centerX =
            8 +
            Math.random() * 25;

    } else {

        /*
         * Lado derecho.
         */

        centerX =
            67 +
            Math.random() * 25;

    }


    centerY =
        8 +
        Math.random() * 55;


    burst.style.left =
        centerX + "%";


    burst.style.top =
        centerY + "%";


    burst.style.width =
        "1px";


    burst.style.height =
        "1px";


    burst.style.zIndex =
        "20003";


    burst.style.pointerEvents =
        "none";


    document.body.appendChild(
        burst
    );


    /*
     * Colores románticos.
     */

    const colors = [

        "#ff1744",
        "#ff3d81",
        "#ff69b4",
        "#ff8fab",
        "#ffd166",
        "#ffffff",
        "#ffb3de",
        "#c77dff",
        "#7bdff2"

    ];


    /*
     * Cantidad de partículas.
     */

    const particleCount = 65;


    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );


        particle.className =
            "firework-particle";


        /*
         * Ángulo de cada partícula.
         */

        const angle =
            (
                Math.PI * 2
            ) *
            (
                i /
                particleCount
            );


        /*
         * Un poco de variación
         * para que no parezca
         * un círculo perfecto.
         */

        const angleVariation =
            (Math.random() - 0.5) *
            0.18;


        const finalAngle =
            angle +
            angleVariation;


        /*
         * Distancia de la partícula.
         */

        const distance =
            55 +
            Math.random() * 115;


        /*
         * Posición final.
         */

        const x =
            Math.cos(finalAngle) *
            distance;


        const y =
            Math.sin(finalAngle) *
            distance;


        /*
         * Tamaño aleatorio.
         */

        const size =
            4 +
            Math.random() * 6;


        particle.style.width =
            size + "px";


        particle.style.height =
            size + "px";


        /*
         * Color aleatorio.
         */

        const color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        particle.style.background =
            color;


        particle.style.borderRadius =
            "50%";


        particle.style.boxShadow =
            `
                0 0 5px ${color},
                0 0 12px ${color},
                0 0 22px ${color}
            `;


        /*
         * Posición inicial.
         */

        particle.style.position =
            "absolute";


        particle.style.left =
            "0";


        particle.style.top =
            "0";


        particle.style.transform =
            "translate(-50%, -50%) scale(1.4)";


        particle.style.opacity =
            "1";


        burst.appendChild(
            particle
        );


        /*
         * Animación de la partícula.
         */

        const animation =
            particle.animate(

                [

                    {
                        transform:
                            "translate(-50%, -50%) scale(1.4)",

                        opacity:
                            1

                    },

                    {
                        transform:
                            `translate(
                                calc(-50% + ${x * 0.45}px),
                                calc(-50% + ${y * 0.45}px)
                            )
                            scale(1)`,

                        opacity:
                            1

                    },

                    {
                        transform:
                            `translate(
                                calc(-50% + ${x}px),
                                calc(-50% + ${y}px)
                            )
                            scale(.05)`,

                        opacity:
                            0

                    }

                ],

                {

                    duration:
                        1200 +
                        Math.random() * 500,

                    easing:
                        "cubic-bezier(.12,.7,.25,1)",

                    fill:
                        "forwards"

                }

            );


        /*
         * Evitamos que quede
         * alguna animación pendiente.
         */

        animation.onfinish =
            () => {

                particle.remove();

            };

    }


    /* =====================================================
       ✨ DESTELLO CENTRAL
       ===================================================== */

    const flash =
        document.createElement(
            "div"
        );


    flash.style.position =
        "absolute";


    flash.style.left =
        "0";


    flash.style.top =
        "0";


    flash.style.width =
        "22px";


    flash.style.height =
        "22px";


    flash.style.borderRadius =
        "50%";


    flash.style.background =
        "#ffffff";


    flash.style.pointerEvents =
        "none";


    flash.style.boxShadow =
        `
            0 0 12px #ffffff,
            0 0 25px #ffb3de,
            0 0 45px #ff4f9a,
            0 0 70px #ff1744
        `;


    burst.appendChild(
        flash
    );


    /*
     * Animación del destello.
     */

    flash.animate(

        [

            {

                transform:
                    "translate(-50%, -50%) scale(.2)",

                opacity:
                    1

            },

            {

                transform:
                    "translate(-50%, -50%) scale(2.2)",

                opacity:
                    .7

            },

            {

                transform:
                    "translate(-50%, -50%) scale(4)",

                opacity:
                    0

            }

        ],

        {

            duration:
                550,

            easing:
                "ease-out",

            fill:
                "forwards"

        }

    );


    /* =====================================================
       ✨ SEGUNDO DESTELLO PEQUEÑO
       ===================================================== */

    setTimeout(() => {

        const secondFlash =
            document.createElement(
                "div"
            );


        secondFlash.style.position =
            "absolute";


        secondFlash.style.left =
            "0";


        secondFlash.style.top =
            "0";


        secondFlash.style.width =
            "8px";


        secondFlash.style.height =
            "8px";


        secondFlash.style.borderRadius =
            "50%";


        secondFlash.style.background =
            "#ffffff";


        secondFlash.style.boxShadow =
            `
                0 0 10px #ffffff,
                0 0 20px #ff69b4
            `;


        secondFlash.style.pointerEvents =
            "none";


        burst.appendChild(
            secondFlash
        );


        secondFlash.animate(

            [

                {

                    transform:
                        "translate(-50%, -50%) scale(.5)",

                    opacity:
                        1

                },

                {

                    transform:
                        "translate(-50%, -50%) scale(2)",

                    opacity:
                        0

                }

            ],

            {

                duration:
                    350,

                easing:
                    "ease-out",

                fill:
                    "forwards"

            }

        );

    }, 180);


    /*
     * Eliminamos completamente
     * la explosión después
     * de terminar.
     */

    setTimeout(() => {

        burst.remove();

    }, 2200);

}



/* =========================================================
   ❤️ CORAZONES FLOTANDO
   ========================================================= */

function createFloatingHearts() {

    for (
        let i = 0;
        i < 45;
        i++
    ) {

        setTimeout(
            () => {

                const heart =
                    document.createElement(
                        "div"
                    );


                heart.className =
                    "floating-heart";


                heart.textContent =
                    Math.random() > 0.3
                        ? "❤️"
                        : "💗";


                heart.style.left =
                    `${Math.random() * 100}%`;


                heart.style.top =
                    `${85 + Math.random() * 20}%`;


                heart.style.fontSize =
                    `${18 + Math.random() * 25}px`;


                heart.style.animationDuration =
                    `${2.5 + Math.random() * 2}s`;


                document.body.appendChild(
                    heart
                );


                setTimeout(
                    () => {

                        heart.remove();

                    },

                    5000

                );

            },

            i * 120

        );

    }

}


/* =========================================================
   ❤️ FIN DEL SCRIPT
   ========================================================= */
