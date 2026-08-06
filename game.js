import * as THREE from "three";

import {
    PointerLockControls
} from
"three/addons/controls/PointerLockControls.js";


/* =========================================================
   BASIC SETUP
========================================================= */

const canvas =
    document.createElement("canvas");

const scene =
    new THREE.Scene();


/* BRIGHTER SKY */

scene.background =
    new THREE.Color(0x35444b);


/* LESS FOG */

scene.fog =
    new THREE.FogExp2(
        0x35444b,
        0.0018
    );


/* CAMERA */

const camera =
    new THREE.PerspectiveCamera(
        75,
        innerWidth / innerHeight,
        0.05,
        1500
    );

camera.position.set(
    0,
    1.7,
    0
);


/*
IMPORTANT:
The camera must be part of the scene
because the weapon and flashlight
are attached to it.
*/

scene.add(camera);


/* RENDERER */

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        powerPreference:
            "high-performance"
    });

renderer.setSize(
    innerWidth,
    innerHeight
);

renderer.setPixelRatio(
    Math.min(devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.35;

document.body.appendChild(
    renderer.domElement
);


/* CONTROLS */

const controls =
    new PointerLockControls(
        camera,
        document.body
    );


/* CLOCK */

const clock =
    new THREE.Clock();


/* =========================================================
   GAME VARIABLES
========================================================= */

let gameStarted = false;

let gameDead = false;

let gamePaused = false;

let health = 100;

let magazine = 30;

let reserveAmmo = 150;

let currentWave = 1;

let killCount = 0;

let fireCooldown = 0;

let reloadTimer = 0;

let gameTime = 0;

let flashlightEnabled = true;


/* OBJECT ARRAYS */

const zombies = [];

const buildings = [];

const particles = [];

const lamps = [];

const cars = [];


/* KEYS */

const keys = {};


/* =========================================================
   HELPERS
========================================================= */

function random(min, max) {

    return min +
        Math.random() *
        (max - min);
}


function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


function material(
    color,
    roughness = .8,
    metalness = 0
) {

    return new THREE.MeshStandardMaterial({

        color: color,

        roughness: roughness,

        metalness: metalness

    });
}


/* =========================================================
   RESIZE
========================================================= */

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

        renderer.setPixelRatio(
            Math.min(devicePixelRatio, 2)
        );
    }
);


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        keys[
            event.key.toLowerCase()
        ] = true;


        if(
            event.key.toLowerCase()
            === "r"
        ) {

            reload();
        }


        if(
            event.key.toLowerCase()
            === "f"
        ) {

            flashlightEnabled =
                !flashlightEnabled;

            flashlight.visible =
                flashlightEnabled;
        }


        if(
            event.key === "Escape" &&
            gameStarted &&
            !gameDead
        ) {

            togglePause();
        }
    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] = false;
    }
);


/* =========================================================
   MOUSE
========================================================= */

window.addEventListener(
    "mousedown",
    event => {

        if(
            event.button !== 0
        )
            return;

        if(
            !gameStarted ||
            gameDead ||
            gamePaused
        )
            return;

        shoot();
    }
);


/* =========================================================
   LIGHTING
========================================================= */


/* GLOBAL LIGHT */

const hemisphere =
    new THREE.HemisphereLight(
        0xd9e9ef,
        0x35402f,
        3.2
    );

scene.add(
    hemisphere
);


/* SUN */

const sunlight =
    new THREE.DirectionalLight(
        0xffffff,
        4
    );

sunlight.position.set(
    -200,
    300,
    -150
);

sunlight.castShadow = true;

sunlight.shadow.mapSize.set(
    2048,
    2048
);

sunlight.shadow.camera.left =
    -500;

sunlight.shadow.camera.right =
    500;

sunlight.shadow.camera.top =
    500;

sunlight.shadow.camera.bottom =
    -500;

sunlight.shadow.camera.far =
    800;

scene.add(
    sunlight
);


/* =========================================================
   FLASHLIGHT
========================================================= */

const flashlight =
    new THREE.SpotLight(
        0xffffff,
        40,
        90,
        Math.PI / 7,
        .45,
        1
    );

flashlight.position.set(
    0,
    1.5,
    0
);

flashlight.castShadow = true;

flashlight.shadow.mapSize.set(
    1024,
    1024
);


const flashlightTarget =
    new THREE.Object3D();

flashlightTarget.position.set(
    0,
    1.2,
    -30
);

camera.add(
    flashlight
);

camera.add(
    flashlightTarget
);

flashlight.target =
    flashlightTarget;


/* =========================================================
   GROUND
========================================================= */

function createGround() {

    const ground =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                1200,
                1200
            ),

            material(
                0x465247,
                1,
                0
            )
        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.receiveShadow =
        true;


    scene.add(
        ground
    );


    /*
       Roads
    */

    for(
        let x = -520;
        x <= 520;
        x += 80
    ) {

        createRoad(
            x,
            0,
            34,
            1200
        );
    }


    for(
        let z = -520;
        z <= 520;
        z += 80
    ) {

        createRoad(
            0,
            z,
            1200,
            34
        );
    }
}


function createRoad(
    x,
    z,
    width,
    depth
) {

    const road =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                width,
                depth
            ),

            material(
                0x252b2d,
                1
            )
        );


    road.rotation.x =
        -Math.PI / 2;


    road.position.set(
        x,
        .02,
        z
    );


    road.receiveShadow =
        true;


    scene.add(
        road
    );


    /*
       Road markings
    */

    if(width > depth) {

        for(
            let i = -width / 2;
            i < width / 2;
            i += 12
        ) {

            const line =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        6,
                        .03,
                        .15
                    ),

                    material(
                        0xc7c7a5,
                        1
                    )
                );


            line.position.set(
                x + i,
                .05,
                z
            );


            scene.add(
                line
            );
        }
    }
}


/* =========================================================
   BUILDINGS
========================================================= */

function createBuilding(
    x,
    z,
    width,
    depth,
    height
) {

    const group =
        new THREE.Group();


    /* BUILDING */

    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),

            material(
                0x4b5050,
                .9
            )
        );


    body.position.y =
        height / 2;


    body.castShadow = true;

    body.receiveShadow = true;


    group.add(
        body
    );


    /* ROOF */

    const roof =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                width + .8,
                .4,
                depth + .8
            ),

            material(
                0x25292a,
                1
            )
        );


    roof.position.y =
        height + .2;


    roof.castShadow =
        true;


    group.add(
        roof
    );


    /* WINDOWS */

    for(
        let y = 3;
        y < height - 1;
        y += 4
    ) {

        for(
            let xx = -width / 2 + 2;
            xx < width / 2 - 1;
            xx += 4
        ) {

            if(
                Math.random() < .13
            )
                continue;


            const window =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        1.3,
                        1.5,
                        .08
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            Math.random() < .2
                                ? 0x101516
                                : 0x65767a,

                        roughness: .3,

                        metalness: .1,

                        emissive:
                            Math.random() < .08
                                ? 0xff8a30
                                : 0x000000,

                        emissiveIntensity:
                            2
                    })
                );


            window.position.set(
                xx,
                y,
                depth / 2 + .05
            );


            group.add(
                window
            );
        }
    }


    /* SIDE WINDOWS */

    for(
        let y = 3;
        y < height - 1;
        y += 4
    ) {

        for(
            let zz = -depth / 2 + 2;
            zz < depth / 2 - 1;
            zz += 4
        ) {

            if(
                Math.random() < .25
            )
                continue;


            const window =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        .08,
                        1.5,
                        1.3
                    ),

                    material(
                        0x65767a,
                        .3
                    )
                );


            window.position.set(
                width / 2 + .05,
                y,
                zz
            );


            group.add(
                window
            );
        }
    }


    group.position.set(
        x,
        0,
        z
    );


    scene.add(
        group
    );


    buildings.push({
        x,
        z,
        width,
        depth,
        height
    });
}


/* =========================================================
   CARS
========================================================= */

function createCar(
    x,
    z
) {

    const group =
        new THREE.Group();


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                5,
                1.1,
                2.2
            ),

            material(
                0x303638,
                .65,
                .2
            )
        );


    body.position.y =
        .75;


    body.castShadow =
        true;


    group.add(
        body
    );


    const cabin =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.6,
                .85,
                1.8
            ),

            material(
                0x182326,
                .2,
                .1
            )
        );


    cabin.position.y =
        1.55;


    group.add(
        cabin
    );


    /* WHEELS */

    for(
        const side of [-1, 1]
    ) {

        for(
            const front of [-1, 1]
        ) {

            const wheel =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        .45,
                        .45,
                        .3,
                        14
                    ),

                    material(
                        0x090909,
                        1
                    )
                );


            wheel.rotation.z =
                Math.PI / 2;


            wheel.position.set(
                front * 1.55,
                .45,
                side * 1.08
            );


            group.add(
                wheel
            );
        }
    }


    group.position.set(
        x,
        0,
        z
    );


    group.rotation.y =
        random(
            0,
            Math.PI
        );


    scene.add(
        group
    );


    cars.push(
        group
    );
}


/* =========================================================
   STREET LIGHTS
========================================================= */

function createStreetLight(
    x,
    z
) {

    const group =
        new THREE.Group();


    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                .1,
                .17,
                8,
                10
            ),

            material(
                0x34393a,
                .7,
                .4
            )
        );


    pole.position.y =
        4;


    pole.castShadow =
        true;


    group.add(
        pole
    );


    const bulb =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .25,
                12,
                12
            ),

            new THREE.MeshStandardMaterial({

                color: 0xffd27d,

                emissive:
                    0xff8b20,

                emissiveIntensity:
                    5
            })
        );


    bulb.position.y =
        8;


    group.add(
        bulb
    );


    const light =
        new THREE.PointLight(
            0xffaa55,
            3,
            30
        );


    light.position.y =
        8;


    light.castShadow =
        true;


    group.add(
        light
    );


    group.position.set(
        x,
        0,
        z
    );


    scene.add(
        group
    );
}


/* =========================================================
   CITY GENERATION
========================================================= */

function createCity() {

    createGround();


    /*
       Buildings
    */

    for(
        let x = -480;
        x <= 480;
        x += 80
    ) {

        for(
            let z = -480;
            z <= 480;
            z += 80
        ) {

            /*
               Keep spawn area open
            */

            if(
                Math.abs(x) < 120 &&
                Math.abs(z) < 120
            ) {

                continue;
            }


            if(
                Math.random() < .8
            ) {

                createBuilding(

                    x + random(-10,10),

                    z + random(-10,10),

                    random(30,55),

                    random(30,55),

                    random(12,45)

                );
            }
        }
    }


    /*
       Cars
    */

    for(
        let i = 0;
        i < 50;
        i++
    ) {

        createCar(
            random(-500,500),
            random(-500,500)
        );
    }


    /*
       Street lamps
    */

    for(
        let i = -440;
        i <= 440;
        i += 80
    ) {

        createStreetLight(
            i,
            -18
        );

        createStreetLight(
            -18,
            i
        );
    }


    /*
       Smoke / dust
    */

    createDust();
}


/* =========================================================
   DUST
========================================================= */

function createDust() {

    const geometry =
        new THREE.BufferGeometry();


    const positions =
        new Float32Array(
            4000 * 3
        );


    for(
        let i = 0;
        i < positions.length;
        i += 3
    ) {

        positions[i] =
            random(-600,600);

        positions[i+1] =
            random(0,80);

        positions[i+2] =
            random(-600,600);
    }


    geometry.setAttribute(

        "position",

        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const particles =
        new THREE.Points(

            geometry,

            new THREE.PointsMaterial({

                color: 0xd4d8d5,

                size: .12,

                transparent: true,

                opacity: .18,

                depthWrite: false
            })
        );


    scene.add(
        particles
    );
}


/* =========================================================
   PLAYER WEAPON
========================================================= */

const weapon =
    new THREE.Group();


camera.add(
    weapon
);


/* BODY */

const gunBody =
    new THREE.Mesh(

        new THREE.BoxGeometry(
            .32,
            .25,
            1.4
        ),

        material(
            0x171a1b,
            .3,
            .8
        )
    );


gunBody.position.set(
    .38,
    -.3,
    -.95
);


weapon.add(
    gunBody
);


/* BARREL */

const gunBarrel =
    new THREE.Mesh(

        new THREE.CylinderGeometry(
            .055,
            .07,
            .8,
            16
        ),

        material(
            0x080909,
            .2,
            .8
        )
    );


gunBarrel.rotation.x =
    Math.PI / 2;


gunBarrel.position.set(
    .38,
    -.3,
    -1.85
);


weapon.add(
    gunBarrel
);


/* GRIP */

const gunGrip =
    new THREE.Mesh(

        new THREE.BoxGeometry(
            .2,
            .55,
            .25
        ),

        material(
            0x111313,
            .8
        )
    );


gunGrip.position.set(
    .38,
    -.58,
    -.72
);


gunGrip.rotation.x =
    -.2;


weapon.add(
    gunGrip
);


/* MUZZLE LIGHT */

const muzzleLight =
    new THREE.PointLight(
        0xffa52e,
        0,
        5
    );


muzzleLight.position.set(
    .38,
    -.3,
    -2.15
);


camera.add(
    muzzleLight
);


/* =========================================================
   ZOMBIES
========================================================= */

function createZombie() {

    const group =
        new THREE.Group();


    const skin =
        material(
            0x647a5c,
            .95
        );


    /* BODY */

    const body =
        new THREE.Mesh(

            new THREE.CapsuleGeometry(
                .42,
                1.05,
                6,
                12
            ),

            skin
        );


    body.position.y =
        1.05;


    body.castShadow =
        true;


    group.add(
        body
    );


    /* HEAD */

    const head =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .38,
                16,
                12
            ),

            skin
        );


    head.position.y =
        1.95;


    head.castShadow =
        true;


    group.add(
        head
    );


    /* EYES */

    const eyeMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff2222
        });


    for(
        const x of [-.13,.13]
    ) {

        const eye =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .05,
                    8,
                    8
                ),

                eyeMaterial
            );


        eye.position.set(
            x,
            2,
            -.34
        );


        group.add(
            eye
        );
    }


    /* ARMS */

    for(
        const side of [-1,1]
    ) {

        const arm =
            new THREE.Mesh(

                new THREE.CapsuleGeometry(
                    .12,
                    .7,
                    5,
                    8
                ),

                skin
            );


        arm.position.set(
            side * .55,
            1.15,
            0
        );


        arm.rotation.z =
            -side * .45;


        group.add(
            arm
        );
    }


    const zombieData = {

        group,

        health:
            100 +
            currentWave * 15,

        speed:
            random(1.2,1.8) +
            currentWave * .04,

        attackTimer: 0,

        walkTime:
            random(0,10)
    };


    /*
       Give every zombie part access
       to its zombie data.
    */

    group.traverse(
        object => {

            object.userData.zombie =
                zombieData;
        }
    );


    scene.add(
        group
    );


    return zombieData;
}


/* =========================================================
   SPAWN ZOMBIES
========================================================= */

function spawnZombie() {

    const zombie =
        createZombie();


    const angle =
        random(
            0,
            Math.PI * 2
        );


    const distance =
        random(
            70,
            130
        );


    zombie.group.position.set(

        camera.position.x +
        Math.cos(angle) *
        distance,

        0,

        camera.position.z +
        Math.sin(angle) *
        distance

    );


    zombies.push(
        zombie
    );
}


function startWave() {

    const number =
        5 +
        currentWave * 2;


    for(
        let i = 0;
        i < number;
        i++
    ) {

        setTimeout(
            spawnZombie,
            i * 220
        );
    }


    notify(
        "WAVE " +
        currentWave
    );
}


/* =========================================================
   SHOOTING
========================================================= */

function shoot() {

    if(
        fireCooldown > 0
    )
        return;


    if(
        reloadTimer > 0
    )
        return;


    if(
        magazine <= 0
    ) {

        notify(
            "PRESS R TO RELOAD"
        );

        return;
    }


    magazine--;

    fireCooldown =
        .11;


    /*
       Muzzle flash
    */

    muzzleLight.intensity =
        18;


    setTimeout(
        () => {

            muzzleLight.intensity =
                0;

        },
        50
    );


    /*
       Weapon recoil
    */

    weapon.position.z =
        .08;


    setTimeout(
        () => {

            weapon.position.z =
                0;

        },
        70
    );


    /*
       Raycast
    */

    const raycaster =
        new THREE.Raycaster();


    raycaster.setFromCamera(

        new THREE.Vector2(
            0,
            0
        ),

        camera
    );


    const objects =
        zombies.map(
            zombie =>
                zombie.group
        );


    const hits =
        raycaster.intersectObjects(
            objects,
            true
        );


    if(
        hits.length > 0
    ) {

        const hit =
            hits[0];


        const zombie =
            hit.object
                .userData
                .zombie;


        if(zombie) {

            zombie.health -=
                40;


            createHitEffect(
                hit.point,
                true
            );


            if(
                zombie.health <= 0
            ) {

                killZombie(
                    zombie
                );
            }
        }
    }
}


/* =========================================================
   RELOAD
========================================================= */

function reload() {

    if(
        reloadTimer > 0
    )
        return;


    if(
        magazine >= 30
    )
        return;


    if(
        reserveAmmo <= 0
    )
        return;


    reloadTimer =
        1.2;


    notify(
        "RELOADING..."
    );


    setTimeout(
        () => {

            const needed =
                30 -
                magazine;


            const amount =
                Math.min(
                    needed,
                    reserveAmmo
                );


            magazine +=
                amount;

            reserveAmmo -=
                amount;

            reloadTimer =
                0;

        },
        1200
    );
}


/* =========================================================
   KILL ZOMBIE
========================================================= */

function killZombie(
    zombie
) {

    const index =
        zombies.indexOf(
            zombie
        );


    if(index === -1)
        return;


    scene.remove(
        zombie.group
    );


    zombies.splice(
        index,
        1
    );


    killCount++;


    if(
        zombies.length === 0
    ) {

        currentWave++;


        setTimeout(
            startWave,
            1500
        );
    }
}


/* =========================================================
   DAMAGE PLAYER
========================================================= */

function damagePlayer(
    amount
) {

    if(gameDead)
        return;


    health -= amount;


    /*
       Screen flash
    */

    document.body.style.filter =
        "brightness(1.5)";


    setTimeout(
        () => {

            document.body.style.filter =
                "";

        },
        80
    );


    if(
        health <= 0
    ) {

        playerDeath();
    }
}


/* =========================================================
   PLAYER DEATH
========================================================= */

function playerDeath() {

    gameDead = true;


    controls.unlock();


    document.getElementById(
        "deathStats"
    ).textContent =
        "WAVE " +
        currentWave +
        "  •  KILLS " +
        killCount;


    document.getElementById(
        "death"
    ).style.display =
        "flex";
}


/* =========================================================
   RESPAWN
========================================================= */

function respawn() {

    /*
       Remove zombies
    */

    for(
        const zombie of zombies
    ) {

        scene.remove(
            zombie.group
        );
    }


    zombies.length = 0;


    /*
       Reset player
    */

    health = 100;

    magazine = 30;

    reserveAmmo = 150;

    currentWave = 1;

    killCount = 0;


    camera.position.set(
        0,
        1.7,
        0
    );


    gameDead = false;


    document.getElementById(
        "death"
    ).style.display =
        "none";


    controls.lock();


    startWave();
}


/* =========================================================
   MOVEMENT
========================================================= */

function updateMovement(
    delta
) {

    if(
        !gameStarted ||
        gameDead ||
        gamePaused ||
        !controls.isLocked
    )
        return;


    const speed =
        keys.shift
            ? 11
            : 6.5;


    if(keys.w) {

        controls.moveForward(
            speed * delta
        );
    }


    if(keys.s) {

        controls.moveForward(
            -speed * delta
        );
    }


    if(keys.a) {

        controls.moveRight(
            -speed * delta
        );
    }


    if(keys.d) {

        controls.moveRight(
            speed * delta
        );
    }


    camera.position.y =
        1.7;


    /*
       City boundary
    */

    camera.position.x =
        clamp(
            camera.position.x,
            -570,
            570
        );


    camera.position.z =
        clamp(
            camera.position.z,
            -570,
            570
        );
}


/* =========================================================
   ZOMBIE AI
========================================================= */

function updateZombies(
    delta
) {

    if(
        gameDead ||
        gamePaused
    )
        return;


    for(
        const zombie of [...zombies]
    ) {

        const position =
            zombie.group.position;


        const dx =
            camera.position.x -
            position.x;


        const dz =
            camera.position.z -
            position.z;


        const distance =
            Math.hypot(
                dx,
                dz
            );


        /*
           Move toward player
        */

        if(
            distance > 1.8
        ) {

            position.x +=
                (dx / distance) *
                zombie.speed *
                delta;


            position.z +=
                (dz / distance) *
                zombie.speed *
                delta;
        }


        /*
           Face player
        */

        zombie.group.lookAt(
            camera.position.x,
            0,
            camera.position.z
        );


        /*
           Walking animation
        */

        zombie.walkTime +=
            delta * 8;


        zombie.group.position.y =
            Math.abs(
                Math.sin(
                    zombie.walkTime
                )
            ) * .04;


        /*
           Attack
        */

        if(
            distance < 2.3
        ) {

            zombie.attackTimer -=
                delta;


            if(
                zombie.attackTimer <= 0
            ) {

                damagePlayer(
                    6 +
                    currentWave * .5
                );


                zombie.attackTimer =
                    1;
            }
        }
    }
}


/* =========================================================
   HIT PARTICLES
========================================================= */

function createHitEffect(
    position,
    blood = false
) {

    for(
        let i = 0;
        i < 10;
        i++
    ) {

        const particle =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .025,
                    5,
                    5
                ),

                new THREE.MeshBasicMaterial({

                    color:
                        blood
                            ? 0x8d2525
                            : 0xffbd55
                })
            );


        particle.position.copy(
            position
        );


        particle.userData.life =
            .35;


        particle.userData.velocity =
            new THREE.Vector3(

                random(-1,1),

                random(.2,1.5),

                random(-1,1)

            );


        scene.add(
            particle
        );


        particles.push(
            particle
        );
    }
}


/* =========================================================
   UPDATE PARTICLES
========================================================= */

function updateParticles(
    delta
) {

    for(
        let i =
            particles.length - 1;

        i >= 0;

        i--
    ) {

        const particle =
            particles[i];


        particle.userData.life -=
            delta;


        particle.position.addScaledVector(

            particle.userData.velocity,

            delta

        );


        if(
            particle.userData.life <= 0
        ) {

            scene.remove(
                particle
            );


            particles.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    document.getElementById(
        "hpText"
    ).textContent =
        Math.max(
            0,
            Math.floor(health)
        );


    document.getElementById(
        "hpBar"
    ).style.width =
        clamp(
            health,
            0,
            100
        ) + "%";


    document.getElementById(
        "mag"
    ).textContent =
        magazine;


    document.getElementById(
        "reserve"
    ).textContent =
        reserveAmmo;


    document.getElementById(
        "wave"
    ).textContent =
        currentWave;


    document.getElementById(
        "hostiles"
    ).textContent =
        zombies.length;


    document.getElementById(
        "kills"
    ).textContent =
        killCount;
}


/* =========================================================
   NOTIFICATION
========================================================= */

let noticeTimeout;


function notify(
    message
) {

    const notice =
        document.getElementById(
            "notice"
        );


    notice.textContent =
        message;


    notice.style.opacity =
        "1";


    clearTimeout(
        noticeTimeout
    );


    noticeTimeout =
        setTimeout(
            () => {

                notice.style.opacity =
                    "0";

            },
            1300
        );
}


/* =========================================================
   MINIMAP
========================================================= */

function updateMinimap() {

    const map =
        document.getElementById(
            "map"
        );


    const ctx =
        map.getContext(
            "2d"
        );


    const scale =
        .18;


    ctx.clearRect(
        0,
        0,
        200,
        200
    );


    /* Background */

    ctx.fillStyle =
        "#11191b";

    ctx.fillRect(
        0,
        0,
        200,
        200
    );


    /* Buildings */

    ctx.fillStyle =
        "#59605f";


    for(
        const building of buildings
    ) {

        ctx.fillRect(

            (building.x + 500)
                * scale,

            (building.z + 500)
                * scale,

            building.width *
                scale,

            building.depth *
                scale
        );
    }


    /* Zombies */

    ctx.fillStyle =
        "#ff3030";


    for(
        const zombie of zombies
    ) {

        ctx.fillRect(

            (zombie.group.position.x + 500)
                * scale - 2,

            (zombie.group.position.z + 500)
                * scale - 2,

            5,
            5
        );
    }


    /* Player */

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();


    ctx.arc(

        (camera.position.x + 500)
            * scale,

        (camera.position.z + 500)
            * scale,

        4,

        0,

        Math.PI * 2

    );


    ctx.fill();
}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    gamePaused =
        !gamePaused;


    document.getElementById(
        "pause"
    ).style.display =
        gamePaused
            ? "flex"
            : "none";


    if(gamePaused) {

        controls.unlock();

    } else {

        controls.lock();
    }
}


/* =========================================================
   BUTTONS
========================================================= */

document.getElementById(
    "play"
).addEventListener(
    "click",
    () => {

        gameStarted =
            true;


        document.getElementById(
            "menu"
        ).style.display =
            "none";


        document.getElementById(
            "hud"
        ).style.display =
            "block";


        controls.lock();


        startWave();
    }
);


document.getElementById(
    "respawn"
).addEventListener(
    "click",
    respawn
);


/* =========================================================
   START CITY
========================================================= */

createCity();


/*
   Fake loading effect
*/

let loadingProgress = 0;


const loadingInterval =
    setInterval(
        () => {

            loadingProgress +=
                random(10,25);


            loadingProgress =
                Math.min(
                    100,
                    loadingProgress
                );


            document.getElementById(
                "loadBar"
            ).style.width =
                loadingProgress + "%";


            if(
                loadingProgress >= 100
            ) {

                clearInterval(
                    loadingInterval
                );


                document.getElementById(
                    "loadText"
                ).textContent =
                    "CITY READY";


                setTimeout(
                    () => {

                        document.getElementById(
                            "loading"
                        ).style.display =
                            "none";

                    },
                    500
                );
            }

        },
        150
    );


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    const delta =
        Math.min(
            clock.getDelta(),
            .05
        );


    gameTime +=
        delta;


    /*
       Shooting cooldown
    */

    if(
        fireCooldown > 0
    ) {

        fireCooldown -=
            delta;
    }


    /*
       Reload timer
    */

    if(
        reloadTimer > 0
    ) {

        reloadTimer -=
            delta;
    }


    updateMovement(
        delta
    );


    updateZombies(
        delta
    );


    updateParticles(
        delta
    );


    updateHUD();


    updateMinimap();


    /*
       Weapon movement
    */

    if(
        controls.isLocked &&
        (keys.w ||
        keys.a ||
        keys.s ||
        keys.d)
    ) {

        weapon.position.y =
            Math.sin(
                gameTime * 10
            ) * .012;

    } else {

        weapon.position.y = 0;
    }


    renderer.render(
        scene,
        camera
    );
}


gameLoop();
