// ============================================================
// DEAD CITY // OUTBREAK
// 3D ZOMBIE SURVIVAL
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x101820);

scene.fog = new THREE.FogExp2(
    0x101820,
    0.012
);


// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 8);


// ============================================================
// RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

document.body.appendChild(renderer.domElement);


// ============================================================
// LIGHTING
// ============================================================

// Main moon light

const moon = new THREE.DirectionalLight(
    0xb8c9ff,
    2.2
);

moon.position.set(
    -100,
    150,
    80
);

moon.castShadow = true;

moon.shadow.mapSize.width = 2048;
moon.shadow.mapSize.height = 2048;

moon.shadow.camera.left = -150;
moon.shadow.camera.right = 150;
moon.shadow.camera.top = 150;
moon.shadow.camera.bottom = -150;

scene.add(moon);


// Soft ambient light

const ambient = new THREE.HemisphereLight(
    0x8aa4c8,
    0x152015,
    1.6
);

scene.add(ambient);


// ============================================================
// WORLD
// ============================================================

const worldSize = 220;


// Ground

const groundGeometry = new THREE.PlaneGeometry(
    worldSize,
    worldSize
);

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x18251b,
    roughness: 1
});

const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


// ============================================================
// ROAD
// ============================================================

function createRoad(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const geometry = new THREE.PlaneGeometry(
        width,
        length
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x202326,
        roughness: 0.95
    });

    const road = new THREE.Mesh(
        geometry,
        material
    );

    road.rotation.x = -Math.PI / 2;
    road.rotation.z = rotation;

    road.position.set(
        x,
        0.012,
        z
    );

    road.receiveShadow = true;

    scene.add(road);

    // Road markings

    for (
        let i = -length / 2;
        i < length / 2;
        i += 7
    ) {

        const lineGeometry =
            new THREE.PlaneGeometry(
                .25,
                3
            );

        const lineMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x7d7658
            });

        const line = new THREE.Mesh(
            lineGeometry,
            lineMaterial
        );

        line.rotation.x = -Math.PI / 2;

        line.position.set(
            x,
            .025,
            z + i
        );

        scene.add(line);
    }
}


createRoad(0, 0, 14, 220);
createRoad(0, 0, 220, 14, Math.PI / 2);


// ============================================================
// BUILDINGS
// ============================================================

const buildings = [];

function createBuilding(x, z) {

    const width =
        10 + Math.random() * 8;

    const depth =
        10 + Math.random() * 8;

    const height =
        8 + Math.random() * 18;

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: new THREE.Color(
                0.09 + Math.random() * .08,
                0.095 + Math.random() * .08,
                0.1 + Math.random() * .08
            ),

            roughness: .95
        });

    const building =
        new THREE.Mesh(
            geometry,
            material
        );

    building.position.set(
        x,
        height / 2,
        z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    scene.add(building);

    buildings.push(building);


    // Windows

    const rows =
        Math.floor(height / 3);

    const cols = 3;

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (Math.random() < .45)
                continue;

            const windowGeometry =
                new THREE.BoxGeometry(
                    1.1,
                    1.3,
                    .08
                );

            const windowMaterial =
                new THREE.MeshStandardMaterial({
                    color:
                        Math.random() < .2
                        ? 0xb48b45
                        : 0x202a2a,

                    emissive:
                        Math.random() < .2
                        ? 0x6b4218
                        : 0x000000,

                    emissiveIntensity: .5
                });

            const window =
                new THREE.Mesh(
                    windowGeometry,
                    windowMaterial
                );

            window.position.set(
                x - width / 2 +
                    2 +
                    c * 2.7,

                2 +
                    r * 3,

                z - depth / 2 - .05
            );

            scene.add(window);
        }
    }
}


// ============================================================
// CITY GENERATION
// ============================================================

for (let x = -90; x <= 90; x += 25) {

    for (let z = -90; z <= 90; z += 25) {

        // Keep roads open

        if (
            Math.abs(x) < 12 ||
            Math.abs(z) < 12
        ) {
            continue;
        }

        createBuilding(
            x + (Math.random() * 5 - 2.5),
            z + (Math.random() * 5 - 2.5)
        );
    }
}


// ============================================================
// STREET LIGHTS
// ============================================================

function createStreetLight(x, z) {

    const poleGeometry =
        new THREE.CylinderGeometry(
            .08,
            .12,
            5,
            8
        );

    const poleMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x333536
        });

    const pole =
        new THREE.Mesh(
            poleGeometry,
            poleMaterial
        );

    pole.position.set(
        x,
        2.5,
        z
    );

    pole.castShadow = true;

    scene.add(pole);


    const lamp =
        new THREE.PointLight(
            0xffb45a,
            3,
            15
        );

    lamp.position.set(
        x,
        5,
        z
    );

    scene.add(lamp);


    const bulbGeometry =
        new THREE.SphereGeometry(
            .15,
            8,
            8
        );

    const bulbMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffc875
        });

    const bulb =
        new THREE.Mesh(
            bulbGeometry,
            bulbMaterial
        );

    bulb.position.copy(lamp.position);

    scene.add(bulb);
}


for (
    let i = -90;
    i <= 90;
    i += 18
) {

    createStreetLight(
        8,
        i
    );

    createStreetLight(
        -8,
        i
    );
}


// ============================================================
// PLAYER
// ============================================================

const player = {

    position: new THREE.Vector3(
        0,
        1.8,
        8
    ),

    health: 100,

    speed: 7,

    sprint: 12,

    ammo: 30,

    reserve: 150,

    kills: 0,

    alive: true
};


camera.position.copy(
    player.position
);


// ============================================================
// INPUT
// ============================================================

const keys = {};

window.addEventListener(
    "keydown",
    e => {

        keys[e.code] = true;

        if (
            e.code === "KeyR"
        ) {
            reload();
        }
    }
);


window.addEventListener(
    "keyup",
    e => {
        keys[e.code] = false;
    }
);


// ============================================================
// MOUSE LOOK
// ============================================================

let yaw = 0;
let pitch = 0;

document.body.addEventListener(
    "click",
    () => {

        if (
            player.alive
        ) {

            document.body.requestPointerLock();
        }
    }
);


document.addEventListener(
    "mousemove",
    e => {

        if (
            document.pointerLockElement !==
            document.body
        ) {
            return;
        }

        yaw -= e.movementX * .002;
        pitch -= e.movementY * .002;

        pitch = Math.max(
            -1.3,
            Math.min(1.3, pitch)
        );
    }
);


// ============================================================
// SHOOTING
// ============================================================

let shooting = false;

window.addEventListener(
    "mousedown",
    e => {

        if (
            e.button === 0
        ) {

            shooting = true;
            shoot();
        }
    }
);


window.addEventListener(
    "mouseup",
    e => {

        if (
            e.button === 0
        ) {
            shooting = false;
        }
    }
);


function shoot() {

    if (!player.alive)
        return;

    if (player.ammo <= 0) {

        reload();

        return;
    }

    player.ammo--;

    updateHUD();


    // Raycast from crosshair

    const raycaster =
        new THREE.Raycaster();

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );


    const objects = [];

    zombies.forEach(
        zombie => {

            zombie.children.forEach(
                child => objects.push(child)
            );
        }
    );


    const hits =
        raycaster.intersectObjects(
            objects,
            true
        );


    if (hits.length > 0) {

        let target =
            hits[0].object;

        while (
            target.parent &&
            !target.userData.zombie
        ) {
            target = target.parent;
        }


        if (
            target.userData.zombie
        ) {

            damageZombie(target);
        }
    }


    // Gun flash

    showMessage("");


    if (player.ammo <= 0) {

        setTimeout(
            reload,
            200
        );
    }
}


function reload() {

    if (
        player.ammo >= 30 ||
        player.reserve <= 0
    ) {
        return;
    }

    const needed =
        30 - player.ammo;

    const amount =
        Math.min(
            needed,
            player.reserve
        );

    player.ammo += amount;
    player.reserve -= amount;

    updateHUD();
}


// ============================================================
// ZOMBIES
// ============================================================

const zombies = [];

function createZombie() {

    const zombie =
        new THREE.Group();

    zombie.userData.zombie = true;

    zombie.userData.health = 100;


    // Body

    const bodyGeometry =
        new THREE.BoxGeometry(
            .8,
            1.3,
            .45
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x303d31,
            roughness: 1
        });

    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

    body.position.y = 1.15;

    body.castShadow = true;

    zombie.add(body);


    // Head

    const headGeometry =
        new THREE.SphereGeometry(
            .38,
            12,
            12
        );

    const headMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x64705d,
            roughness: 1
        });

    const head =
        new THREE.Mesh(
            headGeometry,
            headMaterial
        );

    head.position.y = 2.05;

    head.castShadow = true;

    zombie.add(head);


    // Eyes

    const eyeGeometry =
        new THREE.SphereGeometry(
            .055,
            6,
            6
        );

    const eyeMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff2222
        });


    const eye1 =
        new THREE.Mesh(
            eyeGeometry,
            eyeMaterial
        );

    eye1.position.set(
        -.13,
        2.08,
        -.34
    );


    const eye2 =
        eye1.clone();

    eye2.position.x =
        .13;

    zombie.add(
        eye1,
        eye2
    );


    // Arms

    for (
        const side of [-1, 1]
    ) {

        const arm =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .25,
                    1.25,
                    .25
                ),

                bodyMaterial
            );

        arm.position.set(
            side * .58,
            1.2,
            -.05
        );

        arm.rotation.z =
            side * -.25;

        arm.castShadow = true;

        zombie.add(arm);
    }


    // Legs

    for (
        const side of [-1, 1]
    ) {

        const leg =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .28,
                    1,
                    .3
                ),

                bodyMaterial
            );

        leg.position.set(
            side * .22,
            .35,
            0
        );

        leg.castShadow = true;

        zombie.add(leg);
    }


    // Spawn

    const angle =
        Math.random() *
        Math.PI * 2;

    const distance =
        45 +
        Math.random() * 45;

    zombie.position.set(
        player.position.x +
            Math.cos(angle) * distance,

        0,

        player.position.z +
            Math.sin(angle) * distance
    );


    scene.add(zombie);

    zombies.push(zombie);
}


// ============================================================
// DAMAGE ZOMBIE
// ============================================================

function damageZombie(zombie) {

    zombie.userData.health -= 50;


    if (
        zombie.userData.health <= 0
    ) {

        scene.remove(zombie);

        const index =
            zombies.indexOf(zombie);

        if (index !== -1) {

            zombies.splice(
                index,
                1
            );
        }

        player.kills++;

        updateHUD();


        if (
            zombies.length === 0
        ) {

            setTimeout(
                startWave,
                1500
            );
        }
    }
}


// ============================================================
// PLAYER DAMAGE
// ============================================================

let lastDamage = 0;

function damagePlayer(amount) {

    const now =
        performance.now();

    if (
        now - lastDamage < 500
    ) {
        return;
    }

    lastDamage = now;

    player.health -= amount;

    player.health =
        Math.max(
            0,
            player.health
        );

    updateHUD();


    if (
        player.health <= 0
    ) {

        die();
    }
}


// ============================================================
// DEATH / RESPAWN
// ============================================================

function die() {

    player.alive = false;

    document.exitPointerLock();

    document.getElementById(
        "deathStats"
    ).textContent =
        `KILLS: ${player.kills}`;

    document.getElementById(
        "deathScreen"
    ).style.display = "flex";
}


document.getElementById(
    "respawn"
).addEventListener(
    "click",
    respawn
);


function respawn() {

    // Remove zombies

    zombies.forEach(
        zombie => scene.remove(zombie)
    );

    zombies.length = 0;


    player.health = 100;

    player.ammo = 30;

    player.reserve = 150;

    player.kills = 0;

    player.alive = true;


    player.position.set(
        0,
        1.8,
        8
    );

    camera.position.copy(
        player.position
    );


    document.getElementById(
        "deathScreen"
    ).style.display = "none";


    wave = 1;

    startWave();

    updateHUD();
}


// ============================================================
// WAVES
// ============================================================

let wave = 1;

function startWave() {

    const amount =
        5 + wave * 2;


    showMessage(
        `WAVE ${wave}`
    );


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        setTimeout(
            createZombie,
            i * 300
        );
    }


    updateHUD();
}


// ============================================================
// PLAYER MOVEMENT
// ============================================================

function updatePlayer(delta) {

    if (
        !player.alive
    ) {
        return;
    }


    const direction =
        new THREE.Vector3();


    if (
        keys["KeyW"]
    ) {
        direction.z -= 1;
    }

    if (
        keys["KeyS"]
    ) {
        direction.z += 1;
    }

    if (
        keys["KeyA"]
    ) {
        direction.x -= 1;
    }

    if (
        keys["KeyD"]
    ) {
        direction.x += 1;
    }


    if (
        direction.length() > 0
    ) {

        direction.normalize();


        const speed =
            keys["ShiftLeft"] ||
            keys["ShiftRight"]
            ? player.sprint
            : player.speed;


        // Rotate movement based on camera

        direction.applyAxisAngle(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            yaw
        );


        player.position.add(
            direction.multiplyScalar(
                speed * delta
            )
        );
    }


    // Keep player inside city

    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -105,
            105
        );

    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -105,
            105
        );


    camera.position.copy(
        player.position
    );


    camera.rotation.order =
        "YXZ";

    camera.rotation.y =
        yaw;

    camera.rotation.x =
        pitch;
}


// ============================================================
// ZOMBIE AI
// ============================================================

function updateZombies(delta) {

    if (
        !player.alive
    ) {
        return;
    }


    zombies.forEach(
        zombie => {

            const direction =
                new THREE.Vector3()
                    .subVectors(
                        player.position,
                        zombie.position
                    );

            const distance =
                direction.length();


            direction.y = 0;

            direction.normalize();


            if (
                distance > 2
            ) {

                zombie.position.add(
                    direction.multiplyScalar(
                        (1.1 + wave * .05) *
                        delta
                    )
                );

                zombie.lookAt(
                    player.position.x,
                    zombie.position.y,
                    player.position.z
                );

            } else {

                damagePlayer(
                    10
                );
            }
        }
    );
}


// ============================================================
// HUD
// ============================================================

function updateHUD() {

    document.getElementById(
        "healthText"
    ).textContent =
        player.health;

    document.getElementById(
        "healthBar"
    ).style.width =
        player.health + "%";


    document.getElementById(
        "ammoText"
    ).textContent =
        player.ammo;


    document.getElementById(
        "hostiles"
    ).textContent =
        zombies.length;


    document.getElementById(
        "kills"
    ).textContent =
        player.kills;


    document.getElementById(
        "wave"
    ).textContent =
        wave;
}


function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );

    message.textContent = text;

    setTimeout(
        () => {
            message.textContent = "";
        },
        1500
    );
}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


// ============================================================
// GAME LOOP
// ============================================================

let previousTime =
    performance.now();


function animate() {

    requestAnimationFrame(
        animate
    );


    const currentTime =
        performance.now();


    const delta =
        Math.min(
            (currentTime - previousTime) /
                1000,
            .05
        );


    previousTime =
        currentTime;


    updatePlayer(delta);

    updateZombies(delta);

    updateHUD();


    renderer.render(
        scene,
        camera
    );
}


// ============================================================
// START
// ============================================================

startWave();

updateHUD();

animate();
