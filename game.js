// ============================================================
// DEAD CITY // OUTBREAK
// 3D ZOMBIE SURVIVAL
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x070b12);
scene.fog = new THREE.FogExp2(0x070b12, 0.018);


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

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.getElementById("game").appendChild(renderer.domElement);


// ============================================================
// LIGHTING
// ============================================================

const ambient = new THREE.AmbientLight(0x7d8da8, 1.4);
scene.add(ambient);

const moon = new THREE.DirectionalLight(0xa9c5ff, 2.5);

moon.position.set(
    -30,
    50,
    -20
);

moon.castShadow = true;

moon.shadow.mapSize.width = 2048;
moon.shadow.mapSize.height = 2048;

scene.add(moon);


// ============================================================
// GAME VARIABLES
// ============================================================

let health = 100;
let coins = 0;

let wave = 1;
let kills = 0;

let zombies = [];

let gameOver = false;

let ammo = 30;
let reserveAmmo = 150;

const magazineSize = 30;

let reloading = false;

let lastShot = 0;

const fireRate = 110;


// ============================================================
// PLAYER
// ============================================================

const player = {
    position: new THREE.Vector3(0, 1.7, 8),
    speed: 6,
    sprintSpeed: 10
};


// ============================================================
// FLOOR
// ============================================================

const floorGeometry =
    new THREE.PlaneGeometry(200, 200);

const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111720,
        roughness: 0.95
    });

const floor =
    new THREE.Mesh(
        floorGeometry,
        floorMaterial
    );

floor.rotation.x = -Math.PI / 2;

floor.receiveShadow = true;

scene.add(floor);


// ============================================================
// CITY
// ============================================================

function createBuilding(x, z, width, depth, height) {

    const buildingGeometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const buildingMaterial =
        new THREE.MeshStandardMaterial({
            color: new THREE.Color(
                0.05 + Math.random() * 0.08,
                0.06 + Math.random() * 0.08,
                0.09 + Math.random() * 0.1
            ),
            roughness: 0.85
        });

    const building =
        new THREE.Mesh(
            buildingGeometry,
            buildingMaterial
        );

    building.position.set(
        x,
        height / 2,
        z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    scene.add(building);


    // Windows

    const rows = Math.floor(height / 3);

    const columns = Math.floor(width / 2.5);

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < columns; c++) {

            if (Math.random() > 0.65)
                continue;

            const windowGeometry =
                new THREE.BoxGeometry(
                    0.45,
                    0.7,
                    0.04
                );

            const windowMaterial =
                new THREE.MeshStandardMaterial({
                    color:
                        Math.random() > 0.45
                            ? 0xffc95c
                            : 0x20252b,

                    emissive:
                        Math.random() > 0.45
                            ? 0x8a5c15
                            : 0x000000,

                    emissiveIntensity: 1.2
                });

            const window =
                new THREE.Mesh(
                    windowGeometry,
                    windowMaterial
                );

            window.position.set(
                x -
                width / 2 +
                1.2 +
                c * 2.5,

                1.7 +
                r * 3,

                z -
                depth / 2 -
                0.03
            );

            scene.add(window);
        }
    }
}


// Create city blocks

for (let x = -60; x <= 60; x += 18) {

    for (let z = -60; z <= 60; z += 18) {

        // Leave roads open

        if (
            Math.abs(x) < 10 ||
            Math.abs(z) < 10
        ) {
            continue;
        }

        createBuilding(
            x + (Math.random() - 0.5) * 4,
            z + (Math.random() - 0.5) * 4,
            12 + Math.random() * 5,
            12 + Math.random() * 5,
            8 + Math.random() * 22
        );
    }
}


// ============================================================
// STREET LIGHTS
// ============================================================

function createStreetLight(x, z) {

    const poleGeometry =
        new THREE.CylinderGeometry(
            0.06,
            0.08,
            5,
            8
        );

    const poleMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x22262b,
            metalness: 0.8,
            roughness: 0.3
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

    scene.add(pole);


    const bulb =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.16,
                12,
                12
            ),

            new THREE.MeshBasicMaterial({
                color: 0xffd98a
            })
        );

    bulb.position.set(
        x,
        5,
        z
    );

    scene.add(bulb);


    const light =
        new THREE.PointLight(
            0xffc66d,
            2,
            12
        );

    light.position.set(
        x,
        5,
        z
    );

    scene.add(light);
}


for (let i = -50; i <= 50; i += 12) {

    createStreetLight(
        i,
        -9
    );

    createStreetLight(
        i,
        9
    );
}


// ============================================================
// PLAYER HUD
// ============================================================

const hud =
    document.createElement("div");

hud.style.position = "fixed";
hud.style.left = "25px";
hud.style.bottom = "25px";
hud.style.color = "white";
hud.style.fontFamily = "Arial, sans-serif";
hud.style.fontWeight = "bold";
hud.style.fontSize = "18px";
hud.style.zIndex = "20";
hud.style.textShadow = "0 2px 5px black";

document.body.appendChild(hud);


const topHud =
    document.createElement("div");

topHud.style.position = "fixed";
topHud.style.top = "25px";
topHud.style.left = "25px";
topHud.style.color = "white";
topHud.style.fontFamily = "Arial, sans-serif";
topHud.style.fontWeight = "bold";
topHud.style.fontSize = "20px";
topHud.style.zIndex = "20";
topHud.style.textShadow = "0 2px 5px black";

document.body.appendChild(topHud);


function updateHUD() {

    hud.innerHTML = `
        ❤️ HEALTH: ${Math.max(0, Math.floor(health))}
        <br>
        🪙 COINS: ${coins}
        <br><br>
        🔫 M4A1
        <br>
        ${ammo} / ${reserveAmmo}
    `;


    topHud.innerHTML = `
        DEAD CITY
        &nbsp;&nbsp;&nbsp;
        WAVE ${wave}
        &nbsp;&nbsp;&nbsp;
        HOSTILES ${zombies.length}
        &nbsp;&nbsp;&nbsp;
        KILLS ${kills}
    `;
}

updateHUD();


// ============================================================
// CROSSHAIR
// ============================================================

const crosshair =
    document.createElement("div");

crosshair.innerHTML = "+";

crosshair.style.position = "fixed";
crosshair.style.left = "50%";
crosshair.style.top = "50%";
crosshair.style.transform = "translate(-50%, -50%)";
crosshair.style.fontSize = "32px";
crosshair.style.color = "white";
crosshair.style.pointerEvents = "none";
crosshair.style.zIndex = "30";

document.body.appendChild(crosshair);


// ============================================================
// ZOMBIE HEALTH BAR
// ============================================================

function createHealthBar(zombie) {

    const bar =
        document.createElement("div");

    bar.style.position = "fixed";
    bar.style.width = "55px";
    bar.style.height = "7px";
    bar.style.background = "#252525";
    bar.style.border = "1px solid #000";
    bar.style.borderRadius = "3px";
    bar.style.pointerEvents = "none";
    bar.style.zIndex = "15";

    const fill =
        document.createElement("div");

    fill.style.height = "100%";
    fill.style.width = "100%";
    fill.style.background = "#e53935";

    bar.appendChild(fill);

    document.body.appendChild(bar);

    zombie.userData.healthBar = bar;
    zombie.userData.healthFill = fill;
}


// ============================================================
// UPDATE ZOMBIE HEALTH BARS
// ============================================================

function updateHealthBar(zombie) {

    if (!zombie.userData.healthBar)
        return;

    const pos =
        zombie.position.clone();

    pos.y += 2.4;

    pos.project(camera);


    const x =
        (pos.x * 0.5 + 0.5)
        * window.innerWidth;

    const y =
        (-pos.y * 0.5 + 0.5)
        * window.innerHeight;


    zombie.userData.healthBar.style.left =
        `${x - 27}px`;

    zombie.userData.healthBar.style.top =
        `${y}px`;


    const percentage =
        Math.max(
            0,
            zombie.userData.health /
            zombie.userData.maxHealth
        );


    zombie.userData.healthFill.style.width =
        `${percentage * 100}%`;


    if (pos.z > 1) {

        zombie.userData.healthBar.style.display =
            "none";

    } else {

        zombie.userData.healthBar.style.display =
            "block";
    }
}


// ============================================================
// ZOMBIE TYPES
// ============================================================

const zombieTypes = {

    walker: {

        name: "WALKER",

        health: 100,

        speed: 1.3,

        damage: 8,

        scale: 1,

        color: 0x6f7772
    },


    runner: {

        name: "RUNNER",

        health: 70,

        speed: 3.0,

        damage: 6,

        scale: 0.95,

        color: 0x8a7770
    },


    tank: {

        name: "TANK",

        health: 250,

        speed: 0.7,

        damage: 15,

        scale: 1.35,

        color: 0x515b55
    }

};


// ============================================================
// LOAD ZOMBIE MODEL
// ============================================================

const loader =
    new THREE.GLTFLoader();


function spawnZombie(typeName) {

    const type =
        zombieTypes[typeName];

    loader.load(

        "assets/zombie.glb",

        function(gltf) {

            const zombie =
                gltf.scene.clone(true);


            // Random spawn around player

            const angle =
                Math.random() *
                Math.PI * 2;

            const distance =
                30 + Math.random() * 30;


            zombie.position.set(

                player.position.x +
                Math.cos(angle) * distance,

                0,

                player.position.z +
                Math.sin(angle) * distance
            );


            zombie.scale.setScalar(
                type.scale
            );


            zombie.userData.type =
                typeName;

            zombie.userData.health =
                type.health;

            zombie.userData.maxHealth =
                type.health;

            zombie.userData.speed =
                type.speed;

            zombie.userData.damage =
                type.damage;

            zombie.userData.lastAttack =
                0;

            zombie.userData.mixer = null;


            zombie.traverse(object => {

                if (object.isMesh) {

                    object.castShadow = true;
                    object.receiveShadow = true;

                }

            });


            // Animations

            if (gltf.animations.length > 0) {

                const mixer =
                    new THREE.AnimationMixer(
                        zombie
                    );

                const action =
                    mixer.clipAction(
                        gltf.animations[0]
                    );

                action.play();

                zombie.userData.mixer =
                    mixer;
            }


            scene.add(zombie);

            zombies.push(zombie);

            createHealthBar(zombie);

            updateHUD();
        },

        undefined,

        function(error) {

            console.error(
                "Zombie model error:",
                error
            );
        }
    );
}


// ============================================================
// START WAVE
// ============================================================

function startWave() {

    const amount =
        5 + wave * 2;


    for (let i = 0; i < amount; i++) {

        let type = "walker";


        const random =
            Math.random();


        if (wave >= 2 && random > 0.7) {

            type = "runner";

        }


        if (
            wave >= 4 &&
            random > 0.9
        ) {

            type = "tank";

        }


        setTimeout(() => {

            if (!gameOver) {

                spawnZombie(type);

            }

        }, i * 700);
    }
}


startWave();


// ============================================================
// ZOMBIE DAMAGE
// ============================================================

function damageZombie(zombie, damage) {

    if (!zombie)
        return;

    if (zombie.userData.dead)
        return;


    zombie.userData.health -= damage;


    // Flash model when hit

    zombie.traverse(object => {

        if (
            object.isMesh &&
            object.material
        ) {

            const old =
                object.material.emissive;

            object.material.emissive =
                new THREE.Color(0x661111);

            setTimeout(() => {

                if (object.material) {

                    object.material.emissive =
                        old || new THREE.Color(0x000000);
                }

            }, 80);
        }
    });


    if (
        zombie.userData.health <= 0
    ) {

        killZombie(zombie);

    }
}


// ============================================================
// KILL ZOMBIE
// ============================================================

function killZombie(zombie) {

    if (zombie.userData.dead)
        return;


    zombie.userData.dead = true;


    // 1–2 coins

    const reward =
        Math.floor(
            Math.random() * 2
        ) + 1;


    coins += reward;

    kills++;


    // Remove health bar

    if (
        zombie.userData.healthBar
    ) {

        zombie.userData.healthBar.remove();

    }


    // Small defeat animation

    const startY =
        zombie.position.y;

    const startTime =
        performance.now();


    function fadeOut() {

        const elapsed =
            performance.now() -
            startTime;

        const progress =
            elapsed / 400;


        zombie.rotation.x =
            progress * 1.4;

        zombie.position.y =
            startY -
            progress * 0.3;


        if (progress < 1) {

            requestAnimationFrame(
                fadeOut
            );

        } else {

            scene.remove(zombie);


            const index =
                zombies.indexOf(zombie);


            if (index !== -1) {

                zombies.splice(
                    index,
                    1
                );

            }


            updateHUD();


            if (
                zombies.length === 0
            ) {

                wave++;

                setTimeout(
                    startWave,
                    2000
                );

            }
        }
    }


    fadeOut();
}


// ============================================================
// SHOOTING
// ============================================================

const raycaster =
    new THREE.Raycaster();


function shoot() {

    if (gameOver)
        return;

    if (reloading)
        return;


    const now =
        performance.now();


    if (
        now - lastShot <
        fireRate
    ) {

        return;
    }


    lastShot = now;


    if (ammo <= 0) {

        reload();

        return;
    }


    ammo--;

    updateHUD();


    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );


    const objects = [];


    zombies.forEach(zombie => {

        zombie.traverse(child => {

            if (child.isMesh) {

                objects.push(child);

            }

        });

    });


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
            !target.userData.health
        ) {

            target =
                target.parent;

        }


        if (
            target.userData &&
            target.userData.health
        ) {

            damageZombie(
                target,
                20
            );

        }
    }
}


// ============================================================
// RELOAD
// ============================================================

function reload() {

    if (reloading)
        return;

    if (ammo >= magazineSize)
        return;

    if (reserveAmmo <= 0)
        return;


    reloading = true;


    setTimeout(() => {

        const needed =
            magazineSize - ammo;

        const amount =
            Math.min(
                needed,
                reserveAmmo
            );


        ammo += amount;

        reserveAmmo -= amount;

        reloading = false;

        updateHUD();

    }, 1200);
}


// ============================================================
// INPUT
// ============================================================

const keys = {};


window.addEventListener(
    "keydown",
    event => {

        keys[event.key.toLowerCase()] =
            true;


        if (
            event.key.toLowerCase() === "r"
        ) {

            reload();

        }


        if (
            event.key.toLowerCase() === "m"
        ) {

            toggleMap();

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.key.toLowerCase()] =
            false;

    }
);


window.addEventListener(
    "mousedown",
    event => {

        if (event.button === 0) {

            shoot();

        }

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
            document.pointerLockElement !==
            document.body
        ) {

            document.body.requestPointerLock();

        }

    }
);


document.addEventListener(
    "mousemove",
    event => {

        if (
            document.pointerLockElement !==
            document.body
        ) {

            return;
        }


        yaw -=
            event.movementX *
            0.002;


        pitch -=
            event.movementY *
            0.002;


        pitch =
            Math.max(
                -1.3,
                Math.min(
                    1.3,
                    pitch
                )
            );
    }
);


// ============================================================
// PLAYER MOVEMENT
// ============================================================

function updatePlayer(delta) {

    const direction =
        new THREE.Vector3();


    if (keys["w"])
        direction.z -= 1;

    if (keys["s"])
        direction.z += 1;

    if (keys["a"])
        direction.x -= 1;

    if (keys["d"])
        direction.x += 1;


    if (
        direction.length() > 0
    ) {

        direction.normalize();


        const speed =
            keys["shift"]
                ? player.sprintSpeed
                : player.speed;


        direction.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            yaw
        );


        player.position.add(
            direction.multiplyScalar(
                speed * delta
            )
        );
    }


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

    zombies.forEach(zombie => {

        if (
            zombie.userData.dead
        )
            return;


        // Animation

        if (
            zombie.userData.mixer
        ) {

            zombie.userData.mixer.update(
                delta
            );

        }


        const target =
            player.position.clone();


        target.y = 0;


        const zombiePosition =
            zombie.position.clone();

        zombiePosition.y = 0;


        const distance =
            zombiePosition.distanceTo(
                target
            );


        // Chase

        if (distance > 1.7) {

            const direction =
                target.sub(
                    zombiePosition
                ).normalize();


            zombie.position.add(
                direction.multiplyScalar(
                    zombie.userData.speed *
                    delta
                )
            );


            zombie.lookAt(
                player.position.x,
                zombie.position.y,
                player.position.z
            );

        }


        // Attack

        if (distance < 2.2) {

            const now =
                performance.now();


            if (
                now -
                zombie.userData.lastAttack
                > 900
            ) {

                health -=
                    zombie.userData.damage;


                zombie.userData.lastAttack =
                    now;


                updateHUD();


                if (health <= 0) {

                    endGame();

                }

            }

        }


        updateHealthBar(
            zombie
        );
    });
}


// ============================================================
// MAP
// ============================================================

let mapOpen = false;


const map =
    document.createElement("div");


map.style.position = "fixed";
map.style.top = "50%";
map.style.left = "50%";
map.style.transform =
    "translate(-50%, -50%)";

map.style.width = "650px";
map.style.height = "500px";

map.style.background =
    "rgba(5,10,15,0.96)";

map.style.border =
    "2px solid white";

map.style.zIndex = "100";

map.style.display = "none";

map.style.color = "white";

map.innerHTML = `
    <div style="
        padding:15px;
        font-size:22px;
        font-weight:bold;
    ">
        CITY MAP — PRESS M TO CLOSE
    </div>

    <div id="mapArea" style="
        position:relative;
        width:100%;
        height:430px;
        background:
        repeating-linear-gradient(
            0deg,
            #101820 0px,
            #101820 38px,
            #202a32 40px
        );
        overflow:hidden;
    ">
        <div id="playerMarker" style="
            position:absolute;
            width:14px;
            height:14px;
            background:#00aaff;
            border-radius:50%;
        "></div>
    </div>
`;

document.body.appendChild(map);


function toggleMap() {

    mapOpen =
        !mapOpen;


    map.style.display =
        mapOpen
            ? "block"
            : "none";
}


function updateMap() {

    if (!mapOpen)
        return;


    const marker =
        document.getElementById(
            "playerMarker"
        );


    if (!marker)
        return;


    const x =
        50 +
        player.position.x *
        0.7;


    const y =
        50 +
        player.position.z *
        0.7;


    marker.style.left =
        `${x}%`;

    marker.style.top =
        `${y}%`;
}


// ============================================================
// GAME OVER
// ============================================================

function endGame() {

    gameOver = true;


    const screen =
        document.createElement("div");


    screen.style.position = "fixed";
    screen.style.inset = "0";

    screen.style.background =
        "rgba(0,0,0,0.9)";

    screen.style.zIndex = "200";

    screen.style.display =
        "flex";

    screen.style.flexDirection =
        "column";

    screen.style.alignItems =
        "center";

    screen.style.justifyContent =
        "center";

    screen.style.color =
        "white";

    screen.style.fontFamily =
        "Arial";


    screen.innerHTML = `

        <div style="
            font-size:60px;
            font-weight:bold;
        ">
            YOU DIED
        </div>

        <div style="
            margin-top:20px;
            font-size:24px;
        ">
            Wave ${wave}
            &nbsp; | &nbsp;
            Kills ${kills}
            &nbsp; | &nbsp;
            Coins ${coins}
        </div>

        <button id="restartButton" style="
            margin-top:30px;
            padding:15px 35px;
            font-size:20px;
            cursor:pointer;
        ">
            RESPAWN
        </button>
    `;


    document.body.appendChild(
        screen
    );


    document.getElementById(
        "restartButton"
    ).onclick = () => {

        location.reload();

    };
}


// ============================================================
// GAME LOOP
// ============================================================

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    if (!gameOver) {

        updatePlayer(delta);

        updateZombies(delta);

        updateMap();

    }


    renderer.render(
        scene,
        camera
    );
}


animate();


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
