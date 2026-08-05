const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

/* =========================================================
   GAME
========================================================= */

const WORLD = 5000;

let gameStarted = true;
let gameOver = false;

let wave = 0;
let kills = 0;
let level = 1;
let xp = 0;
let coins = 0;
let gameTime = 0;

let zombies = [];
let bullets = [];
let particles = [];
let loot = [];

let buildings = [];
let doors = [];
let crates = [];
let cars = [];
let trash = [];
let trees = [];
let rubble = [];
let barriers = [];
let streetLights = [];

let shootCooldown = 0;
let messageTimer = 0;

const keys = {};

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    down: false
};

const camera = {
    x: 0,
    y: 0
};


/* =========================================================
   PLAYER
========================================================= */

const player = {
    x: WORLD / 2,
    y: WORLD / 2,

    radius: 17,

    health: 100,
    maxHealth: 100,

    stamina: 100,
    signal: 100,

    ammo: 12,
    maxAmmo: 12,
    reserve: 48,

    speed: 3.2,
    damage: 1,

    weapon: 0,
    angle: 0
};


/* =========================================================
   WEAPONS
========================================================= */

const weapons = [
    {
        name: "PISTOL",
        damage: 2,
        fireRate: 14,
        ammo: 12,
        spread: 0.015,
        pellets: 1
    },

    {
        name: "SMG",
        damage: 1,
        fireRate: 5,
        ammo: 30,
        spread: 0.09,
        pellets: 1
    },

    {
        name: "SHOTGUN",
        damage: 3,
        fireRate: 38,
        ammo: 6,
        spread: 0.38,
        pellets: 7
    }
];


/* =========================================================
   ZOMBIE TYPES
========================================================= */

const zombieTypes = {

    walker: {
        speed: 0.75,
        health: 4,
        damage: 5,
        radius: 18
    },

    runner: {
        speed: 1.65,
        health: 3,
        damage: 7,
        radius: 14
    },

    tank: {
        speed: 0.45,
        health: 25,
        damage: 15,
        radius: 30
    },

    boss: {
        speed: 0.55,
        health: 130,
        damage: 25,
        radius: 48
    }
};


/* =========================================================
   INPUT
========================================================= */

document.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    const key = e.key.toLowerCase();

    if (key === "r") reload();
    if (key === "e") interact();
    if (key === "f") radio();
    if (key === "q") upgrade();

    if (key === "1") switchWeapon(0);
    if (key === "2") switchWeapon(1);
    if (key === "3") switchWeapon(2);
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", e => {

    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

canvas.addEventListener("mousedown", () => {
    mouse.down = true;
});

canvas.addEventListener("mouseup", () => {
    mouse.down = false;
});


/* =========================================================
   CITY GENERATOR
========================================================= */

function generateCity() {

    buildings = [];
    doors = [];
    crates = [];
    cars = [];
    trash = [];
    trees = [];
    rubble = [];
    barriers = [];
    streetLights = [];

    const block = 500;

    /* BUILDINGS */

    for (let x = 80; x < WORLD - 400; x += block) {

        for (let y = 80; y < WORLD - 400; y += block) {

            if (Math.random() < 0.82) {

                const building = {

                    x: x + 30 + Math.random() * 55,

                    y: y + 30 + Math.random() * 55,

                    w: 180 + Math.random() * 150,

                    h: 180 + Math.random() * 150,

                    floors:
                        2 + Math.floor(Math.random() * 4),

                    type:
                        Math.floor(Math.random() * 3)
                };

                buildings.push(building);

                doors.push({

                    x:
                        building.x +
                        building.w / 2,

                    y:
                        building.y +
                        building.h,

                    open: false
                });


                /* RUBBLE AROUND BUILDINGS */

                for (let i = 0; i < 10; i++) {

                    rubble.push({

                        x:
                            building.x +
                            Math.random() * building.w,

                        y:
                            building.y +
                            Math.random() * building.h,

                        size:
                            3 + Math.random() * 10
                    });
                }
            }


            /* STREETLIGHTS */

            streetLights.push({

                x: x - 35,

                y: y + 220,

                broken:
                    Math.random() < 0.45
            });
        }
    }


    /* CARS */

    for (let i = 0; i < 55; i++) {

        cars.push({

            x:
                Math.random() * WORLD,

            y:
                Math.random() * WORLD,

            width:
                48 + Math.random() * 15,

            height:
                23 + Math.random() * 8,

            angle:
                Math.random() * Math.PI * 2,

            damaged:
                Math.random() < 0.7
        });
    }


    /* TRASH */

    for (let i = 0; i < 250; i++) {

        trash.push({

            x:
                Math.random() * WORLD,

            y:
                Math.random() * WORLD,

            size:
                2 + Math.random() * 8
        });
    }


    /* TREES */

    for (let i = 0; i < 80; i++) {

        trees.push({

            x:
                Math.random() * WORLD,

            y:
                Math.random() * WORLD,

            size:
                12 + Math.random() * 22
        });
    }


    /* BARRIERS */

    for (let i = 0; i < 40; i++) {

        barriers.push({

            x:
                Math.random() * WORLD,

            y:
                Math.random() * WORLD,

            angle:
                Math.random() * Math.PI
        });
    }


    /* CRATES */

    for (let i = 0; i < 90; i++) {

        crates.push({

            x:
                Math.random() * WORLD,

            y:
                Math.random() * WORLD,

            searched: false
        });
    }
}

generateCity();


/* =========================================================
   START WAVE
========================================================= */

function nextWave() {

    wave++;

    showMessage("WAVE " + wave);

    const amount =
        5 + wave * 3;

    for (let i = 0; i < amount; i++) {

        let type = "walker";

        const r = Math.random();

        if (wave >= 3 && r < 0.18) {
            type = "runner";
        }

        if (wave >= 5 && r < 0.08) {
            type = "tank";
        }

        spawnZombie(type);
    }


    if (wave % 5 === 0) {

        spawnZombie("boss");

        showMessage("⚠ BOSS WAVE");
    }
}


/* =========================================================
   SPAWN ZOMBIE
========================================================= */

function spawnZombie(type = "walker") {

    const data = zombieTypes[type];

    const angle =
        Math.random() * Math.PI * 2;

    const distance =
        700 + Math.random() * 900;

    zombies.push({

        x:
            player.x +
            Math.cos(angle) *
            distance,

        y:
            player.y +
            Math.sin(angle) *
            distance,

        type,

        radius: data.radius,

        speed: data.speed,

        health: data.health,

        maxHealth: data.health,

        damage: data.damage,

        attackCooldown: 0,

        animation:
            Math.random() * 10
    });
}


/* =========================================================
   WEAPONS
========================================================= */

function switchWeapon(index) {

    if (!weapons[index]) return;

    player.weapon = index;

    const weapon = weapons[index];

    player.maxAmmo = weapon.ammo;

    player.ammo =
        Math.min(
            player.ammo,
            player.maxAmmo
        );

    showMessage(weapon.name);
}


function shoot() {

    if (shootCooldown > 0) return;

    const weapon =
        weapons[player.weapon];

    if (player.ammo <= 0) {

        showMessage("RELOAD!");

        return;
    }

    player.ammo--;

    shootCooldown =
        weapon.fireRate;

    const targetX =
        mouse.x + camera.x;

    const targetY =
        mouse.y + camera.y;

    const baseAngle =
        Math.atan2(
            targetY - player.y,
            targetX - player.x
        );


    for (
        let i = 0;
        i < weapon.pellets;
        i++
    ) {

        const angle =
            baseAngle +
            (Math.random() - 0.5) *
            weapon.spread;

        bullets.push({

            x: player.x,

            y: player.y,

            dx:
                Math.cos(angle) * 18,

            dy:
                Math.sin(angle) * 18,

            damage:
                weapon.damage *
                player.damage,

            life: 60
        });
    }


    /* MUZZLE FLASH */

    createMuzzleFlash();

    makeNoise(
        player.weapon === 2
            ? 1200
            : 800
    );
}


function reload() {

    if (
        player.ammo >=
        player.maxAmmo
    ) return;

    if (player.reserve <= 0) {

        showMessage("NO AMMO");

        return;
    }

    const needed =
        player.maxAmmo -
        player.ammo;

    const amount =
        Math.min(
            needed,
            player.reserve
        );

    player.ammo += amount;

    player.reserve -= amount;

    showMessage("RELOADED");
}


/* =========================================================
   MUZZLE FLASH
========================================================= */

function createMuzzleFlash() {

    const weapon =
        weapons[player.weapon];

    const x =
        player.x +
        Math.cos(player.angle) * 35;

    const y =
        player.y +
        Math.sin(player.angle) * 35;

    for (let i = 0; i < 7; i++) {

        particles.push({

            x,
            y,

            dx:
                Math.cos(player.angle) *
                (4 + Math.random() * 7),

            dy:
                Math.sin(player.angle) *
                (4 + Math.random() * 7),

            life: 8,

            size:
                3 + Math.random() * 5,

            muzzle: true
        });
    }
}


/* =========================================================
   NOISE
========================================================= */

function makeNoise(range) {

    for (const zombie of zombies) {

        const d =
            Math.hypot(
                zombie.x - player.x,
                zombie.y - player.y
            );

        if (d < range) {

            zombie.speed += 0.12;
        }
    }
}


/* =========================================================
   RADIO
========================================================= */

function radio() {

    if (player.signal < 25) {

        showMessage("SIGNAL TOO WEAK");

        return;
    }

    player.signal -= 25;

    loot.push({

        x:
            player.x +
            (Math.random() - 0.5) *
            1500,

        y:
            player.y +
            (Math.random() - 0.5) *
            1500,

        type: "supply"
    });

    makeNoise(1300);

    showMessage("📡 SUPPLY DROP DETECTED");
}


/* =========================================================
   INTERACTION
========================================================= */

function interact() {

    for (const crate of crates) {

        if (crate.searched) continue;

        const distance =
            Math.hypot(
                player.x - crate.x,
                player.y - crate.y
            );

        if (distance < 70) {

            crate.searched = true;

            const r = Math.random();

            if (r < 0.4) {

                player.reserve += 20;

                showMessage("+20 AMMO");

            } else if (r < 0.7) {

                player.health =
                    Math.min(
                        player.maxHealth,
                        player.health + 25
                    );

                showMessage("+25 HEALTH");

            } else {

                coins += 30;

                showMessage("+30 COINS");
            }

            return;
        }
    }


    for (let i = loot.length - 1; i >= 0; i--) {

        const item = loot[i];

        const distance =
            Math.hypot(
                player.x - item.x,
                player.y - item.y
            );

        if (distance < 70) {

            player.reserve += 30;

            player.health =
                Math.min(
                    player.maxHealth,
                    player.health + 20
                );

            coins += 50;

            loot.splice(i, 1);

            showMessage("SUPPLIES COLLECTED");

            return;
        }
    }
}


/* =========================================================
   UPGRADE
========================================================= */

function upgrade() {

    const cost =
        level * 50;

    if (coins < cost) {

        showMessage(
            "NEED " +
            cost +
            " COINS"
        );

        return;
    }

    coins -= cost;

    player.damage++;

    player.maxHealth += 10;

    player.health =
        player.maxHealth;

    showMessage("UPGRADE COMPLETE");
}


/* =========================================================
   XP
========================================================= */

function gainXP(amount) {

    xp += amount;

    const needed =
        level * 100;

    if (xp >= needed) {

        xp -= needed;

        level++;

        player.maxHealth += 10;

        player.health =
            player.maxHealth;

        showMessage(
            "LEVEL " +
            level
        );
    }
}


/* =========================================================
   KILL
========================================================= */

function killZombie(zombie) {

    const index =
        zombies.indexOf(zombie);

    if (index === -1) return;

    zombies.splice(index, 1);

    kills++;

    if (zombie.type === "boss") {

        coins += 250;

        gainXP(200);

    } else {

        coins += 10;

        gainXP(25);
    }


    createDeathParticles(
        zombie.x,
        zombie.y
    );


    if (Math.random() < 0.25) {

        loot.push({

            x: zombie.x,

            y: zombie.y,

            type: "drop"
        });
    }
}


/* =========================================================
   DEATH PARTICLES
========================================================= */

function createDeathParticles(x, y) {

    for (let i = 0; i < 12; i++) {

        particles.push({

            x,
            y,

            dx:
                (Math.random() - 0.5) *
                7,

            dy:
                (Math.random() - 0.5) *
                7,

            life:
                20 + Math.random() * 20,

            size:
                2 + Math.random() * 5
        });
    }
}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (!gameStarted || gameOver)
        return;

    gameTime++;


    if (shootCooldown > 0)
        shootCooldown--;


    /* MOVEMENT */

    let dx = 0;
    let dy = 0;

    if (keys["w"]) dy--;
    if (keys["s"]) dy++;
    if (keys["a"]) dx--;
    if (keys["d"]) dx++;


    const moving =
        dx !== 0 ||
        dy !== 0;

    const sprint =
        keys["shift"] &&
        moving &&
        player.stamina > 0;


    let speed =
        player.speed;

    if (sprint) {

        speed *= 1.8;

        player.stamina -= 0.8;

    } else {

        player.stamina += 0.35;
    }


    player.stamina =
        Math.max(
            0,
            Math.min(
                100,
                player.stamina
            )
        );


    if (moving) {

        const length =
            Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        player.x += dx * speed;
        player.y += dy * speed;
    }


    player.x =
        Math.max(
            20,
            Math.min(
                WORLD - 20,
                player.x
            )
        );

    player.y =
        Math.max(
            20,
            Math.min(
                WORLD - 20,
                player.y
            )
        );


    /* AIM */

    player.angle =
        Math.atan2(
            mouse.y +
            camera.y -
            player.y,

            mouse.x +
            camera.x -
            player.x
        );


    if (mouse.down)
        shoot();


    /* CAMERA */

    camera.x =
        player.x -
        canvas.width / 2;

    camera.y =
        player.y -
        canvas.height / 2;


    camera.x =
        Math.max(
            0,
            Math.min(
                WORLD -
                canvas.width,
                camera.x
            )
        );

    camera.y =
        Math.max(
            0,
            Math.min(
                WORLD -
                canvas.height,
                camera.y
            )
        );


    /* BULLETS */

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        bullet.life--;

        let hit = false;


        for (
            const zombie
            of [...zombies]
        ) {

            const d =
                Math.hypot(
                    bullet.x -
                    zombie.x,

                    bullet.y -
                    zombie.y
                );

            if (
                d <
                zombie.radius + 5
            ) {

                zombie.health -=
                    bullet.damage;

                createHitParticles(
                    bullet.x,
                    bullet.y
                );


                if (
                    zombie.health <= 0
                ) {

                    killZombie(zombie);
                }


                bullets.splice(i, 1);

                hit = true;

                break;
            }
        }


        if (
            !hit &&
            bullet.life <= 0
        ) {

            bullets.splice(i, 1);
        }
    }


    /* ZOMBIES */

    for (const zombie of zombies) {

        const dx =
            player.x -
            zombie.x;

        const dy =
            player.y -
            zombie.y;

        const distance =
            Math.hypot(dx, dy);


        let speed =
            zombie.speed;


        if (isNight())
            speed *= 1.35;


        zombie.animation += 0.12;


        if (distance > 48) {

            zombie.x +=
                dx / distance *
                speed;

            zombie.y +=
                dy / distance *
                speed;
        }


        if (
            distance < 52 &&
            zombie.attackCooldown <= 0
        ) {

            player.health -=
                zombie.damage;

            zombie.attackCooldown =
                55;

            showMessage(
                "ZOMBIE ATTACK!"
            );
        }


        if (
            zombie.attackCooldown > 0
        ) {

            zombie.attackCooldown--;
        }
    }


    /* SIGNAL */

    player.signal += 0.01;

    player.signal =
        Math.min(
            100,
            player.signal
        );


    /* PARTICLES */

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];

        p.x += p.dx;
        p.y += p.dy;

        p.life--;

        if (p.life <= 0) {

            particles.splice(i, 1);
        }
    }


    /* WAVE */

    if (
        zombies.length === 0
    ) {

        nextWave();
    }


    /* DEATH */

    if (player.health <= 0) {

        player.health = 0;

        gameOver = true;

        showMessage("YOU DIED");
    }


    updateUI();
}


/* =========================================================
   PARTICLES
========================================================= */

function createHitParticles(x, y) {

    for (let i = 0; i < 5; i++) {

        particles.push({

            x,
            y,

            dx:
                (Math.random() - 0.5) *
                5,

            dy:
                (Math.random() - 0.5) *
                5,

            life: 15,

            size:
                2 + Math.random() * 3
        });
    }
}


/* =========================================================
   DAY / NIGHT
========================================================= */

function isNight() {

    return (
        Math.floor(
            gameTime / 1800
        ) % 2
    ) === 1;
}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.save();

    ctx.translate(
        -camera.x,
        -camera.y
    );


    /* GROUND */

    ctx.fillStyle = "#162a19";

    ctx.fillRect(
        0,
        0,
        WORLD,
        WORLD
    );


    /* ROADS */

    ctx.fillStyle = "#25282a";


    for (
        let x = 0;
        x < WORLD;
        x += 500
    ) {

        ctx.fillRect(
            x - 75,
            0,
            150,
            WORLD
        );
    }


    for (
        let y = 0;
        y < WORLD;
        y += 500
    ) {

        ctx.fillRect(
            0,
            y - 75,
            WORLD,
            150
        );
    }


    /* ROAD EDGES */

    ctx.strokeStyle =
        "#414447";

    ctx.lineWidth = 4;

    ctx.setLineDash([30, 35]);


    for (
        let x = 0;
        x < WORLD;
        x += 500
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            WORLD
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y < WORLD;
        y += 500
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            WORLD,
            y
        );

        ctx.stroke();
    }


    ctx.setLineDash([]);


    /* RUBBLE */

    for (const r of rubble) {

        ctx.fillStyle =
            "#55585a";

        ctx.fillRect(
            r.x,
            r.y,
            r.size,
            r.size
        );
    }


    /* TREES */

    for (const tree of trees) {

        ctx.strokeStyle =
            "#29231c";

        ctx.lineWidth = 6;

        ctx.beginPath();

        ctx.moveTo(
            tree.x,
            tree.y +
            tree.size
        );

        ctx.lineTo(
            tree.x,
            tree.y -
            tree.size
        );

        ctx.stroke();


        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            tree.x,
            tree.y
        );

        ctx.lineTo(
            tree.x -
            tree.size,
            tree.y -
            tree.size / 2
        );

        ctx.moveTo(
            tree.x,
            tree.y
        );

        ctx.lineTo(
            tree.x +
            tree.size,
            tree.y -
            tree.size / 2
        );

        ctx.stroke();
    }


    /* CARS */

    for (const car of cars) {

        ctx.save();

        ctx.translate(
            car.x,
            car.y
        );

        ctx.rotate(
            car.angle
        );


        /* SHADOW */

        ctx.fillStyle =
            "rgba(0,0,0,0.5)";

        ctx.fillRect(
            -28,
            -14,
            56,
            28
        );


        /* BODY */

        ctx.fillStyle =
            car.damaged
                ? "#45484a"
                : "#666a6c";

        ctx.fillRect(
            -25,
            -10,
            50,
            20
        );


        /* WINDOWS */

        ctx.fillStyle =
            "#101619";

        ctx.fillRect(
            -13,
            -7,
            11,
            14
        );

        ctx.fillRect(
            2,
            -7,
            11,
            14
        );


        /* WHEELS */

        ctx.fillStyle =
            "#0b0b0b";

        ctx.fillRect(
            -21,
            -14,
            10,
            6
        );

        ctx.fillRect(
            11,
            -14,
            10,
            6
        );

        ctx.fillRect(
            -21,
            8,
            10,
            6
        );

        ctx.fillRect(
            11,
            8,
            10,
            6
        );


        /* BROKEN LIGHT */

        if (car.damaged) {

            ctx.fillStyle =
                "#282828";

            ctx.fillRect(
                19,
                -6,
                6,
                5
            );
        }


        ctx.restore();
    }


    /* BARRIERS */

    for (const b of barriers) {

        ctx.save();

        ctx.translate(
            b.x,
            b.y
        );

        ctx.rotate(
            b.angle
        );

        ctx.fillStyle =
            "#8b6235";

        ctx.fillRect(
            -28,
            -5,
            56,
            10
        );

        ctx.fillStyle =
            "#bcbcbc";

        ctx.fillRect(
            -23,
            -8,
            5,
            16
        );

        ctx.fillRect(
            18,
            -8,
            5,
            16
        );

        ctx.restore();
    }


    /* BUILDINGS */

    for (const b of buildings) {

        /* SHADOW */

        ctx.fillStyle =
            "rgba(0,0,0,0.5)";

        ctx.fillRect(
            b.x + 12,
            b.y + 15,
            b.w,
            b.h
        );


        /* BODY */

        let buildingColor =
            "#292b2d";

        if (b.type === 1)
            buildingColor = "#303234";

        if (b.type === 2)
            buildingColor = "#252729";

        ctx.fillStyle =
            buildingColor;

        ctx.fillRect(
            b.x,
            b.y,
            b.w,
            b.h
        );


        /* EDGE */

        ctx.strokeStyle =
            "#505356";

        ctx.lineWidth = 5;

        ctx.strokeRect(
            b.x,
            b.y,
            b.w,
            b.h
        );


        /* WINDOWS */

        for (
            let row = 0;
            row < b.floors;
            row++
        ) {

            for (
                let col = 0;
                col <
                Math.floor(
                    b.w / 45
                );
                col++
            ) {

                const wx =
                    b.x +
                    20 +
                    col * 45;

                const wy =
                    b.y +
                    22 +
                    row * 42;


                /* WINDOW */

                ctx.fillStyle =
                    "#111719";

                ctx.fillRect(
                    wx,
                    wy,
                    22,
                    27
                );


                /* BROKEN GLASS */

                ctx.strokeStyle =
                    Math.random() <
                    0.35
                        ? "#777"
                        : "#333";

                ctx.lineWidth = 2;

                ctx.beginPath();

                ctx.moveTo(
                    wx + 3,
                    wy + 3
                );

                ctx.lineTo(
                    wx + 18,
                    wy + 23
                );

                ctx.stroke();
            }
        }


        /* GRAFFITI */

        ctx.font =
            "bold 13px Arial";

        ctx.fillStyle =
            "#555";

        ctx.fillText(
            b.type === 0
                ? "HELP"
                : b.type === 1
                    ? "RUN"
                    : "NO HOPE",
            b.x + 15,
            b.y + b.h - 20
        );
    }


    /* DOORS */

    for (const door of doors) {

        ctx.fillStyle =
            "#85552f";

        ctx.fillRect(
            door.x - 18,
            door.y - 7,
            36,
            14
        );
    }


    /* CRATES */

    for (const crate of crates) {

        if (crate.searched)
            continue;

        ctx.fillStyle =
            "#9b7137";

        ctx.fillRect(
            crate.x - 12,
            crate.y - 12,
            24,
            24
        );

        ctx.strokeStyle =
            "#4d351e";

        ctx.strokeRect(
            crate.x - 12,
            crate.y - 12,
            24,
            24
        );
    }


    /* TRASH */

    for (const t of trash) {

        ctx.fillStyle =
            "#45484a";

        ctx.beginPath();

        ctx.arc(
            t.x,
            t.y,
            t.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* STREETLIGHTS */

    for (const light of streetLights) {

        ctx.strokeStyle =
            "#303234";

        ctx.lineWidth = 5;

        ctx.beginPath();

        ctx.moveTo(
            light.x,
            light.y
        );

        ctx.lineTo(
            light.x,
            light.y - 45
        );

        ctx.stroke();


        ctx.fillStyle =
            light.broken
                ? "#333"
                : "#d7d7a0";

        ctx.beginPath();

        ctx.arc(
            light.x,
            light.y - 48,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();


        if (
            !light.broken &&
            isNight()
        ) {

            const glow =
                ctx.createRadialGradient(
                    light.x,
                    light.y - 48,
                    5,
                    light.x,
                    light.y - 48,
                    80
                );

            glow.addColorStop(
                0,
                "rgba(255,240,160,0.22)"
            );

            glow.addColorStop(
                1,
                "rgba(255,240,160,0)"
            );

            ctx.fillStyle =
                glow;

            ctx.beginPath();

            ctx.arc(
                light.x,
                light.y - 48,
                80,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }


    /* LOOT */

    for (const item of loot) {

        const pulse =
            10 +
            Math.sin(gameTime * 0.1) *
            3;

        ctx.fillStyle =
            "#3edbff";

        ctx.beginPath();

        ctx.arc(
            item.x,
            item.y,
            pulse,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle =
            "#d9ffff";

        ctx.beginPath();

        ctx.arc(
            item.x,
            item.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* BULLETS */

    for (const bullet of bullets) {

        ctx.fillStyle =
            "#fff4a3";

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* ZOMBIES */

    for (const z of zombies) {

        const bounce =
            Math.sin(
                z.animation
            ) * 2;


        let bodyColor =
            "#617e51";

        if (z.type === "runner")
            bodyColor = "#8c7547";

        if (z.type === "tank")
            bodyColor = "#684b4b";

        if (z.type === "boss")
            bodyColor = "#873e3e";


        /* SHADOW */

        ctx.fillStyle =
            "rgba(0,0,0,0.45)";

        ctx.beginPath();

        ctx.ellipse(
            z.x,
            z.y + z.radius,
            z.radius,
            z.radius / 3,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* BODY */

        ctx.fillStyle =
            bodyColor;

        ctx.beginPath();

        ctx.arc(
            z.x,
            z.y + bounce,
            z.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* HEAD */

        ctx.fillStyle =
            "#78915f";

        ctx.beginPath();

        ctx.arc(
            z.x,
            z.y -
            z.radius * 0.55 +
            bounce,
            z.radius * 0.65,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* EYES */

        ctx.fillStyle =
            "#e7e7d0";

        ctx.beginPath();

        ctx.arc(
            z.x -
            z.radius * 0.22,

            z.y -
            z.radius * 0.62 +
            bounce,

            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            z.x +
            z.radius * 0.22,

            z.y -
            z.radius * 0.62 +
            bounce,

            3,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* BOSS RING */

        if (z.type === "boss") {

            ctx.strokeStyle =
                "rgba(255,50,50,0.6)";

            ctx.lineWidth = 4;

            ctx.beginPath();

            ctx.arc(
                z.x,
                z.y,
                z.radius + 8,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }


        /* HEALTH BAR */

        if (
            z.type === "tank" ||
            z.type === "boss"
        ) {

            const barWidth =
                z.radius * 2;

            ctx.fillStyle =
                "#111";

            ctx.fillRect(
                z.x -
                z.radius,

                z.y -
                z.radius -
                15,

                barWidth,
                6
            );

            ctx.fillStyle =
                "#d93636";

            ctx.fillRect(
                z.x -
                z.radius,

                z.y -
                z.radius -
                15,

                barWidth *
                (
                    z.health /
                    z.maxHealth
                ),

                6
            );
        }
    }


    /* PLAYER SHADOW */

    ctx.fillStyle =
        "rgba(0,0,0,0.5)";

    ctx.beginPath();

    ctx.ellipse(
        player.x,
        player.y + 18,
        20,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* PLAYER */

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    ctx.rotate(
        player.angle
    );


    /* BODY */

    ctx.fillStyle =
        "#3d91df";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* ARM */

    ctx.fillStyle =
        "#d0a27c";

    ctx.fillRect(
        8,
        -8,
        15,
        7
    );


    /* GUN */

    ctx.fillStyle =
        "#151515";

    let gunLength = 34;

    if (player.weapon === 1)
        gunLength = 40;

    if (player.weapon === 2)
        gunLength = 45;

    ctx.fillRect(
        10,
        -4,
        gunLength,
        8
    );


    ctx.restore();


    /* PARTICLES */

    for (const p of particles) {

        ctx.fillStyle =
            p.muzzle
                ? "#fff0a0"
                : "#d0d0d0";

        ctx.globalAlpha =
            Math.max(
                0,
                p.life / 20
            );

        ctx.fillRect(
            p.x,
            p.y,
            p.size || 3,
            p.size || 3
        );

        ctx.globalAlpha = 1;
    }


    ctx.restore();


    /* NIGHT OVERLAY */

    if (isNight()) {

        ctx.fillStyle =
            "rgba(3,7,20,0.78)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /* FLASHLIGHT */

        const lightX =
            mouse.x;

        const lightY =
            mouse.y;


        const gradient =
            ctx.createRadialGradient(
                lightX,
                lightY,
                30,

                lightX,
                lightY,
                380
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,230,0.30)"
        );

        gradient.addColorStop(
            0.35,
            "rgba(255,255,230,0.12)"
        );

        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );


        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }


    /* FOG */

    const fog =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    fog.addColorStop(
        0,
        "rgba(200,220,220,0.03)"
    );

    fog.addColorStop(
        1,
        "rgba(0,0,0,0.16)"
    );

    ctx.fillStyle =
        fog;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawMinimap();

    drawCrosshair();
}


/* =========================================================
   MINIMAP
========================================================= */

function drawMinimap() {

    const size = 160;

    const x =
        canvas.width -
        size -
        20;

    const y = 20;


    ctx.fillStyle =
        "rgba(0,0,0,0.75)";

    ctx.fillRect(
        x,
        y,
        size,
        size
    );


    ctx.strokeStyle =
        "rgba(255,255,255,0.2)";

    ctx.strokeRect(
        x,
        y,
        size,
        size
    );


    /* BUILDINGS */

    ctx.fillStyle =
        "#5c5c5c";

    for (const b of buildings) {

        ctx.fillRect(

            x +
            b.x /
            WORLD *
            size,

            y +
            b.y /
            WORLD *
            size,

            Math.max(
                2,
                b.w /
                WORLD *
                size
            ),

            Math.max(
                2,
                b.h /
                WORLD *
                size
            )
        );
    }


    /* ZOMBIES */

    ctx.fillStyle =
        "#e54848";

    for (const z of zombies) {

        ctx.fillRect(

            x +
            z.x /
            WORLD *
            size -
            2,

            y +
            z.y /
            WORLD *
            size -
            2,

            4,
            4
        );
    }


    /* PLAYER */

    ctx.fillStyle =
        "#4aa3ff";

    ctx.beginPath();

    ctx.arc(

        x +
        player.x /
        WORLD *
        size,

        y +
        player.y /
        WORLD *
        size,

        4,

        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* =========================================================
   CROSSHAIR
========================================================= */

function drawCrosshair() {

    ctx.strokeStyle =
        "rgba(255,255,255,0.9)";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        mouse.x,
        mouse.y,
        10,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        mouse.x - 16,
        mouse.y
    );

    ctx.lineTo(
        mouse.x - 7,
        mouse.y
    );

    ctx.moveTo(
        mouse.x + 7,
        mouse.y
    );

    ctx.lineTo(
        mouse.x + 16,
        mouse.y
    );

    ctx.moveTo(
        mouse.x,
        mouse.y - 16
    );

    ctx.lineTo(
        mouse.x,
        mouse.y - 7
    );

    ctx.moveTo(
        mouse.x,
        mouse.y + 7
    );

    ctx.lineTo(
        mouse.x,
        mouse.y + 16
    );

    ctx.stroke();
}


/* =========================================================
   UI
========================================================= */

function updateUI() {

    const health =
        document.getElementById("health");

    const ammo =
        document.getElementById("ammo");

    const reserve =
        document.getElementById("reserve");

    const stamina =
        document.getElementById("stamina");

    const signal =
        document.getElementById("signal");

    const levelElement =
        document.getElementById("level");

    const coinsElement =
        document.getElementById("coins");

    const weaponElement =
        document.getElementById("weapon");

    const mission =
        document.getElementById("mission");


    if (health)
        health.textContent =
            Math.floor(
                player.health
            );

    if (ammo)
        ammo.textContent =
            player.ammo;

    if (reserve)
        reserve.textContent =
            player.reserve;

    if (stamina)
        stamina.textContent =
            Math.floor(
                player.stamina
            );

    if (signal)
        signal.textContent =
            Math.floor(
                player.signal
            );

    if (levelElement)
        levelElement.textContent =
            level;

    if (coinsElement)
        coinsElement.textContent =
            coins;

    if (weaponElement)
        weaponElement.textContent =
            weapons[
                player.weapon
            ].name;

    if (mission)
        mission.textContent =
            "WAVE " +
            wave +
            " • KILLS " +
            kills;
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text) {

    const element =
        document.getElementById(
            "message"
        );

    if (!element) return;

    element.textContent =
        text;

    messageTimer = 120;
}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   START
========================================================= */

nextWave();

updateUI();

gameLoop();

