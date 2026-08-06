// ============================================================
// DEAD CITY // OUTBREAK
// NYC ZOMBIE SURVIVAL
// ============================================================


const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x080e13);

scene.fog =
    new THREE.FogExp2(
        0x080e13,
        0.009
    );


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        72,
        innerWidth / innerHeight,
        .1,
        1000
    );


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    innerWidth,
    innerHeight
);

renderer.setPixelRatio(
    Math.min(
        devicePixelRatio,
        2
    )
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.15;

document.body.appendChild(
    renderer.domElement
);


// ============================================================
// LIGHTING
// ============================================================

const moon =
    new THREE.DirectionalLight(
        0xb8c9ff,
        2.7
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


const ambient =
    new THREE.HemisphereLight(
        0x9bb5d5,
        0x162016,
        1.8
    );

scene.add(ambient);


// ============================================================
// GAME DATA
// ============================================================

const player = {

    position:
        new THREE.Vector3(
            0,
            1.8,
            10
        ),

    health: 100,

    speed: 7,

    sprint: 12,

    coins: 0,

    kills: 0,

    alive: true
};


// ============================================================
// WEAPONS
// ============================================================

const weapons = [

    {
        id: "pistol",

        name: "M9 PISTOL",

        category: "rapid",

        damage: 50,

        fireRate: 380,

        magazine: 12,

        reserve: 120,

        price: 0,

        unlocked: true
    },

    {
        id: "smg",

        name: "VECTOR SMG",

        category: "rapid",

        damage: 25,

        fireRate: 90,

        magazine: 30,

        reserve: 180,

        price: 15,

        unlocked: false
    },

    {
        id: "ar",

        name: "M4A1",

        category: "rapid",

        damage: 42,

        fireRate: 120,

        magazine: 30,

        reserve: 180,

        price: 35,

        unlocked: false
    },

    {
        id: "shotgun",

        name: "M870 SHOTGUN",

        category: "heavy",

        damage: 120,

        fireRate: 750,

        magazine: 6,

        reserve: 60,

        price: 25,

        unlocked: false
    },

    {
        id: "lmg",

        name: "M249 LMG",

        category: "heavy",

        damage: 35,

        fireRate: 105,

        magazine: 75,

        reserve: 300,

        price: 75,

        unlocked: false
    },

    {
        id: "sniper",

        name: "M24 PRECISION",

        category: "precision",

        damage: 250,

        fireRate: 1100,

        magazine: 5,

        reserve: 40,

        price: 50,

        unlocked: false
    }

];


let currentWeapon =
    weapons[0];

let ammo =
    currentWeapon.magazine;

let reserve =
    currentWeapon.reserve;

let lastShot = 0;


// ============================================================
// CITY
// ============================================================

const worldSize = 240;


const ground =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            worldSize,
            worldSize
        ),

        new THREE.MeshStandardMaterial({
            color: 0x141b19,
            roughness: .95
        })
    );

ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


// ============================================================
// ROADS
// ============================================================

function road(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const r =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                width,
                length
            ),

            new THREE.MeshStandardMaterial({
                color: 0x202428,
                roughness: .9
            })
        );

    r.rotation.x =
        -Math.PI / 2;

    r.rotation.z =
        rotation;

    r.position.set(
        x,
        .02,
        z
    );

    r.receiveShadow = true;

    scene.add(r);
}


road(
    0,
    0,
    18,
    240
);

road(
    0,
    0,
    240,
    18,
    Math.PI / 2
);

road(
    55,
    0,
    12,
    240
);

road(
    -55,
    0,
    12,
    240
);

road(
    0,
    55,
    240,
    12,
    Math.PI / 2
);

road(
    0,
    -55,
    240,
    12,
    Math.PI / 2
);


// ============================================================
// NYC BUILDINGS
// ============================================================

const buildings = [];


function createBuilding(
    x,
    z,
    type = "tower"
) {

    let width;
    let depth;
    let height;

    if (type === "brownstone") {

        width =
            7 + Math.random() * 3;

        depth =
            10 + Math.random() * 4;

        height =
            8 + Math.random() * 4;

    } else {

        width =
            12 + Math.random() * 12;

        depth =
            12 + Math.random() * 12;

        height =
            15 + Math.random() * 40;
    }


    const material =
        new THREE.MeshStandardMaterial({

            color:
                type === "brownstone"
                    ? 0x3d3030
                    : 0x252c35,

            roughness: .86,

            metalness: .08
        });


    const building =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),

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
        Math.floor(
            height / 3
        );

    const cols =
        Math.floor(
            width / 2.8
        );


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let col = 0;
            col < cols;
            col++
        ) {

            if (
                Math.random() < .25
            )
                continue;


            const lit =
                Math.random() < .13;


            const windowMat =
                new THREE.MeshStandardMaterial({

                    color:
                        lit
                            ? 0xd49d50
                            : 0x141b20,

                    emissive:
                        lit
                            ? 0x6d4315
                            : 0x000000,

                    emissiveIntensity:
                        lit ? .7 : 0
                });


            const w =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        1.0,
                        1.25,
                        .08
                    ),

                    windowMat
                );


            w.position.set(

                x -
                    width / 2 +
                    1.5 +
                    col * 2.5,

                2 +
                    row * 3,

                z -
                    depth / 2 -
                    .05
            );


            scene.add(w);
        }
    }


    // Rooftop water tank

    if (
        height > 30 &&
        Math.random() < .45
    ) {

        const tank =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    2,
                    2,
                    3,
                    16
                ),

                new THREE.MeshStandardMaterial({
                    color: 0x16191b,
                    roughness: .9
                })
            );


        tank.position.set(
            x,
            height + 2,
            z
        );

        tank.castShadow = true;

        scene.add(tank);
    }
}


// ============================================================
// CITY GRID
// ============================================================

for (
    let x = -105;
    x <= 105;
    x += 27
) {

    for (
        let z = -105;
        z <= 105;
        z += 27
    ) {

        // keep streets open

        if (
            Math.abs(x) < 14 ||
            Math.abs(z) < 14
        ) {
            continue;
        }


        const type =
            Math.random() < .35
                ? "brownstone"
                : "tower";


        createBuilding(
            x + Math.random() * 5 - 2.5,
            z + Math.random() * 5 - 2.5,
            type
        );
    }
}


// ============================================================
// STREET LIGHTS
// ============================================================

function streetLight(
    x,
    z
) {

    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .09,
                .12,
                5,
                8
            ),

            new THREE.MeshStandardMaterial({
                color: 0x34383b
            })
        );


    pole.position.set(
        x,
        2.5,
        z
    );

    pole.castShadow = true;

    scene.add(pole);


    const light =
        new THREE.PointLight(
            0xffb65a,
            3,
            18
        );

    light.position.set(
        x,
        5,
        z
    );

    scene.add(light);


    const bulb =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .16,
                8,
                8
            ),

            new THREE.MeshBasicMaterial({
                color: 0xffc873
            })
        );


    bulb.position.copy(
        light.position
    );

    scene.add(bulb);
}


for (
    let i = -105;
    i <= 105;
    i += 18
) {

    streetLight(
        8,
        i
    );

    streetLight(
        -8,
        i
    );
}


// ============================================================
// ZOMBIES
// ============================================================

const zombies = [];


function createZombie() {

    const zombie =
        new THREE.Group();


    zombie.userData.zombie =
        true;

    zombie.userData.health =
        100;


    // torso

    const torso =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                .85,
                1.35,
                .5
            ),

            new THREE.MeshStandardMaterial({
                color: 0x303d35,
                roughness: 1
            })
        );


    torso.position.y =
        1.2;

    torso.castShadow = true;

    zombie.add(torso);


    // neck

    const neck =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .15,
                .15,
                .25,
                8
            ),

            new THREE.MeshStandardMaterial({
                color: 0x526056
            })
        );


    neck.position.y =
        1.95;

    zombie.add(neck);


    // head

    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .4,
                16,
                16
            ),

            new THREE.MeshStandardMaterial({
                color: 0x68776a,
                roughness: .95
            })
        );


    head.position.y =
        2.28;

    head.castShadow = true;

    zombie.add(head);


    // eyes

    for (
        const side of [-1, 1]
    ) {

        const eye =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .065,
                    8,
                    8
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xff2525
                })
            );


        eye.position.set(
            side * .14,
            2.32,
            -.35
        );

        zombie.add(eye);
    }


    // arms

    for (
        const side of [-1, 1]
    ) {

        const arm =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    .25,
                    1.35,
                    .27
                ),

                new THREE.MeshStandardMaterial({
                    color: 0x344239
                })
            );


        arm.position.set(
            side * .62,
            1.2,
            0
        );


        arm.rotation.z =
            side * -.3;


        arm.castShadow = true;

        zombie.add(arm);
    }


    // legs

    for (
        const side of [-1, 1]
    ) {

        const leg =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    .3,
                    1.05,
                    .34
                ),

                new THREE.MeshStandardMaterial({
                    color: 0x20282a
                })
            );


        leg.position.set(
            side * .23,
            .35,
            0
        );


        leg.castShadow = true;

        zombie.add(leg);
    }


    // spawn

    const angle =
        Math.random() *
        Math.PI * 2;


    const distance =
        45 +
        Math.random() * 60;


    zombie.position.set(

        player.position.x +
            Math.cos(angle) *
            distance,

        0,

        player.position.z +
            Math.sin(angle) *
            distance
    );


    scene.add(zombie);

    zombies.push(zombie);
}


// ============================================================
// SHOOTING
// ============================================================

function shoot() {

    if (!player.alive)
        return;


    const now =
        performance.now();


    if (
        now - lastShot <
        currentWeapon.fireRate
    )
        return;


    if (
        ammo <= 0
    ) {

        reload();

        return;
    }


    lastShot = now;

    ammo--;


    const ray =
        new THREE.Raycaster();


    ray.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );


    const targets = [];


    zombies.forEach(
        z => {

            z.traverse(
                object => {

                    if (
                        object.isMesh
                    )
                        targets.push(
                            object
                        );
                }
            );
        }
    );


    const hits =
        ray.intersectObjects(
            targets,
            true
        );


    if (
        hits.length
    ) {

        let target =
            hits[0].object;


        while (
            target.parent &&
            !target.userData.zombie
        ) {

            target =
                target.parent;
        }


        if (
            target.userData.zombie
        ) {

            target.userData.health -=
                currentWeapon.damage;


            if (
                target.userData.health <= 0
            ) {

                killZombie(target);
            }
        }
    }


    updateHUD();
}


window.addEventListener(
    "mousedown",
    e => {

        if (
            e.button === 0
        )
            shoot();
    }
);


// ============================================================
// KILL ZOMBIE + COINS
// ============================================================

function killZombie(
    zombie
) {

    scene.remove(zombie);


    const index =
        zombies.indexOf(zombie);


    if (
        index !== -1
    )
        zombies.splice(
            index,
            1
        );


    player.kills++;


    // 1–2 coins

    const reward =
        Math.floor(
            Math.random() * 2
        ) + 1;


    player.coins += reward;


    showMessage(
        `+${reward} 🪙`
    );


    updateHUD();


    if (
        zombies.length === 0
    ) {

        setTimeout(
            () => {

                wave++;

                startWave();

            },
            1500
        );
    }
}


// ============================================================
// RELOAD
// ============================================================

function reload() {

    if (
        ammo >= currentWeapon.magazine ||
        reserve <= 0
    )
        return;


    const needed =
        currentWeapon.magazine -
        ammo;


    const amount =
        Math.min(
            needed,
            reserve
        );


    ammo += amount;

    reserve -= amount;


    updateHUD();
}


// ============================================================
// PLAYER DAMAGE
// ============================================================

let lastDamage = 0;


function damagePlayer(
    amount
) {

    const now =
        performance.now();


    if (
        now - lastDamage <
        600
    )
        return;


    lastDamage =
        now;


    player.health -=
        amount;


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
// ZOMBIE AI
// ============================================================

function updateZombies(
    delta
) {

    if (!player.alive)
        return;


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
                distance > 2.2
            ) {

                zombie.position.add(
                    direction.multiplyScalar(
                        (1.05 +
                            wave * .05) *
                        delta
                    )
                );


                zombie.lookAt(
                    player.position.x,
                    0,
                    player.position.z
                );

            } else {

                damagePlayer(
                    8
                );
            }
        }
    );
}


// ============================================================
// MOVEMENT
// ============================================================

const keys = {};

let yaw = 0;
let pitch = 0;


window.addEventListener(
    "keydown",
    e => {

        keys[e.code] = true;


        if (
            e.code === "KeyR"
        )
            reload();


        if (
            e.code === "KeyM"
        )
            toggleMap();


        if (
            e.code === "KeyB"
        )
            toggleArmory();


        // weapon numbers

        if (
            e.code >= "Digit1" &&
            e.code <= "Digit6"
        ) {

            const index =
                Number(
                    e.code.replace(
                        "Digit",
                        ""
                    )
                ) - 1;


            if (
                weapons[index] &&
                weapons[index].unlocked
            ) {

                equipWeapon(
                    weapons[index]
                );
            }
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

document.body.addEventListener(
    "click",
    () => {

        if (
            player.alive &&
            !document.getElementById(
                "armory"
            ).style.display
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
        )
            return;


        yaw -=
            e.movementX *
            .002;


        pitch -=
            e.movementY *
            .002;


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

function updatePlayer(
    delta
) {

    if (
        !player.alive
    )
        return;


    const direction =
        new THREE.Vector3();


    if (
        keys["KeyW"]
    )
        direction.z -= 1;


    if (
        keys["KeyS"]
    )
        direction.z += 1;


    if (
        keys["KeyA"]
    )
        direction.x -= 1;


    if (
        keys["KeyD"]
    )
        direction.x += 1;


    if (
        direction.length() > 0
    ) {

        direction.normalize();


        const speed =
            keys["ShiftLeft"] ||
            keys["ShiftRight"]
                ? player.sprint
                : player.speed;


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


    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -110,
            110
        );


    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -110,
            110
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
// WAVES
// ============================================================

let wave = 1;


function startWave() {

    const count =
        5 + wave * 2;


    showMessage(
        `WAVE ${wave}`
    );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        setTimeout(
            createZombie,
            i * 250
        );
    }
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
        ammo;


    document.getElementById(
        "reserveText"
    ).textContent =
        reserve;


    document.getElementById(
        "weaponName"
    ).textContent =
        currentWeapon.name;


    document.getElementById(
        "hostiles"
    ).textContent =
        zombies.length;


    document.getElementById(
        "kills"
    ).textContent =
        player.kills;


    document.getElementById(
        "coins"
    ).textContent =
        player.coins;


    document.getElementById(
        "wave"
    ).textContent =
        wave;


    document.getElementById(
        "shopCoins"
    ).textContent =
        player.coins;
}


function showMessage(
    text
) {

    const message =
        document.getElementById(
            "message"
        );


    message.textContent =
        text;


    setTimeout(
        () => {

            if (
                message.textContent ===
                text
            )
                message.textContent = "";

        },
        1300
    );
}


// ============================================================
// ARMORY
// ============================================================

let selectedCategory =
    "all";


function renderArmory() {

    const list =
        document.getElementById(
            "weaponList"
        );


    list.innerHTML = "";


    weapons
        .filter(
            weapon =>
                selectedCategory ===
                    "all" ||
                weapon.category ===
                    selectedCategory
        )
        .forEach(
            weapon => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "weaponCard" +
                    (
                        weapon.unlocked
                            ? ""
                            : " locked"
                    );


                const status =
                    weapon.unlocked
                        ? `<div class="unlocked">
                            ✓ UNLOCKED
                           </div>`
                        : `<div class="unlocked">
                            🔒 LOCKED
                           </div>`;


                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "buyButton";


                if (
                    weapon.unlocked
                ) {

                    button.textContent =
                        currentWeapon.id ===
                        weapon.id
                            ? "EQUIPPED"
                            : "EQUIP";

                } else {

                    button.textContent =
                        `🪙 ${weapon.price}`;
                }


                if (
                    weapon.unlocked
                ) {

                    button.onclick =
                        () => {

                            equipWeapon(
                                weapon
                            );

                            renderArmory();
                        };

                } else {

                    button.onclick =
                        () => {

                            buyWeapon(
                                weapon
                            );

                            renderArmory();
                        };


                    if (
                        player.coins <
                        weapon.price
                    )
                        button.disabled =
                            true;
                }


                card.innerHTML = `

                    <h2>
                        ${weapon.name}
                    </h2>

                    <div class="weaponType">
                        ${weapon.category.toUpperCase()}
                    </div>

                    <div class="stats">

                        <span>
                            DAMAGE:
                            ${weapon.damage}
                        </span>

                        <span>
                            MAG:
                            ${weapon.magazine}
                        </span>

                        <span>
                            FIRE:
                            ${weapon.fireRate}ms
                        </span>

                        <span>
                            RESERVE:
                            ${weapon.reserve}
                        </span>

                    </div>

                    ${status}

                `;


                card.appendChild(
                    button
                );


                list.appendChild(
                    card
                );
            }
        );
}


function buyWeapon(
    weapon
) {

    if (
        weapon.unlocked
    )
        return;


    if (
        player.coins <
        weapon.price
    ) {

        showMessage(
            "NOT ENOUGH COINS"
        );

        return;
    }


    player.coins -=
        weapon.price;


    weapon.unlocked =
        true;


    showMessage(
        `${weapon.name} UNLOCKED`
    );


    updateHUD();
}


function equipWeapon(
    weapon
) {

    if (
        !weapon.unlocked
    )
        return;


    currentWeapon =
        weapon;


    ammo =
        weapon.magazine;


    reserve =
        weapon.reserve;


    updateHUD();


    showMessage(
        `${weapon.name} EQUIPPED`
    );
}


function toggleArmory() {

    const armory =
        document.getElementById(
            "armory"
        );


    const isOpen =
        armory.style.display ===
        "block";


    if (
        isOpen
    ) {

        armory.style.display =
            "none";

    } else {

        document.exitPointerLock();

        armory.style.display =
            "block";

        renderArmory();
    }
}


document.querySelectorAll(
    ".category"
).forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                document.querySelectorAll(
                    ".category"
                ).forEach(
                    b =>
                        b.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                selectedCategory =
                    button.dataset.category;


                renderArmory();
            }
        );
    }
);


// ============================================================
// MAP
// ============================================================

const mapCanvas =
    document.getElementById(
        "mapCanvas"
    );


const mapCtx =
    mapCanvas.getContext(
        "2d"
    );


function drawMap() {

    mapCanvas.width =
        900;

    mapCanvas.height =
        700;


    const w =
        mapCanvas.width;

    const h =
        mapCanvas.height;


    mapCtx.fillStyle =
        "#10181b";

    mapCtx.fillRect(
        0,
        0,
        w,
        h
    );


    // streets

    mapCtx.strokeStyle =
        "#303b40";

    mapCtx.lineWidth =
        15;


    for (
        let i = 60;
        i < w;
        i += 100
    ) {

        mapCtx.beginPath();

        mapCtx.moveTo(
            i,
            0
        );

        mapCtx.lineTo(
            i,
            h
        );

        mapCtx.stroke();


        mapCtx.beginPath();

        mapCtx.moveTo(
            0,
            i
        );

        mapCtx.lineTo(
            w,
            i
        );

        mapCtx.stroke();
    }


    // buildings

    mapCtx.fillStyle =
        "#1d272b";


    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const x =
            Math.random() *
            w;


        const y =
            Math.random() *
            h;


        mapCtx.fillRect(
            x,
            y,
            25 + Math.random() * 30,
            20 + Math.random() * 30
        );
    }


    // zombies

    zombies.forEach(
        zombie => {

            const x =
                w / 2 +
                zombie.position.x *
                3;


            const y =
                h / 2 +
                zombie.position.z *
                3;


            mapCtx.fillStyle =
                "#e63b3b";


            mapCtx.beginPath();

            mapCtx.arc(
                x,
                y,
                5,
                0,
                Math.PI * 2
            );

            mapCtx.fill();
        }
    );


    // player

    const px =
        w / 2 +
        player.position.x *
        3;


    const py =
        h / 2 +
        player.position.z *
        3;


    mapCtx.fillStyle =
        "#55a9ff";


    mapCtx.beginPath();

    mapCtx.arc(
        px,
        py,
        8,
        0,
        Math.PI * 2
    );

    mapCtx.fill();


    mapCtx.strokeStyle =
        "#55a9ff";

    mapCtx.lineWidth =
        2;

    mapCtx.stroke();
}


function toggleMap() {

    const map =
        document.getElementById(
            "mapScreen"
        );


    const open =
        map.style.display ===
        "block";


    if (
        open
    ) {

        map.style.display =
            "none";

    } else {

        document.exitPointerLock();

        drawMap();

        map.style.display =
            "block";
    }
}


// ============================================================
// DEATH / RESPAWN
// ============================================================

function die() {

    player.alive =
        false;


    document.exitPointerLock();


    document.getElementById(
        "deathKills"
    ).textContent =
        player.kills;


    document.getElementById(
        "deathCoins"
    ).textContent =
        player.coins;


    document.getElementById(
        "deathScreen"
    ).style.display =
        "flex";
}


document.getElementById(
    "respawn"
).onclick =
    respawn;


function respawn() {

    zombies.forEach(
        zombie =>
            scene.remove(
                zombie
            )
    );


    zombies.length = 0;


    player.position.set(
        0,
        1.8,
        10
    );


    player.health =
        100;


    player.alive =
        true;


    player.kills =
        0;


    ammo =
        currentWeapon.magazine;


    reserve =
        currentWeapon.reserve;


    document.getElementById(
        "deathScreen"
    ).style.display =
        "none";


    wave =
        1;


    startWave();

    updateHUD();
}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            innerWidth /
            innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            innerWidth,
            innerHeight
        );
    }
);


// ============================================================
// GAME LOOP
// ============================================================

let lastTime =
    performance.now();


function animate() {

    requestAnimationFrame(
        animate
    );


    const now =
        performance.now();


    const delta =
        Math.min(
            (now - lastTime) /
                1000,
            .05
        );


    lastTime =
        now;


    updatePlayer(delta);

    updateZombies(delta);


    renderer.render(
        scene,
        camera
    );
}


// ============================================================
// START
// ============================================================

camera.position.copy(
    player.position
);


startWave();

updateHUD();

animate();
