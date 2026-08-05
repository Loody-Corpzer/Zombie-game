const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

/* =====================================================
   GAME STATE
===================================================== */

let gameStarted = false;
let gameOver = false;

let gameTime = 0;
let wave = 0;
let kills = 0;

let xp = 0;
let level = 1;
let coins = 0;

let selectedCharacter = "scout";

const WORLD = 5000;

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


/* =====================================================
   PLAYER
===================================================== */

const player = {
    x: WORLD / 2,
    y: WORLD / 2,

    radius: 18,

    health: 100,
    maxHealth: 100,

    stamina: 100,
    signal: 100,

    ammo: 12,
    maxAmmo: 12,
    reserve: 60,

    speed: 3.2,
    damage: 1,

    weapon: 0,
    angle: 0
};


/* =====================================================
   CHARACTERS
===================================================== */

const characters = {
    scout: {
        speed: 4.2,
        health: 80,
        damage: 1,
        ammo: 12
    },

    soldier: {
        speed: 3.2,
        health: 110,
        damage: 2,
        ammo: 12
    },

    tank: {
        speed: 2.3,
        health: 160,
        damage: 3,
        ammo: 10
    }
};


/* =====================================================
   WEAPONS
===================================================== */

const weapons = [
    {
        name: "PISTOL",
        damage: 1,
        fireRate: 12,
        maxAmmo: 12,
        spread: 0,
        pellets: 1
    },

    {
        name: "SMG",
        damage: 1,
        fireRate: 5,
        maxAmmo: 30,
        spread: 0.08,
        pellets: 1
    },

    {
        name: "SHOTGUN",
        damage: 2,
        fireRate: 35,
        maxAmmo: 6,
        spread: 0.3,
        pellets: 7
    }
];


/* =====================================================
   WORLD
===================================================== */

let buildings = [];
let doors = [];
let crates = [];

let zombies = [];
let bullets = [];
let particles = [];
let loot = [];

let shootCooldown = 0;


/* =====================================================
   CITY GENERATION
===================================================== */

function generateCity() {

    buildings = [];
    doors = [];
    crates = [];

    const grid = 350;

    for (let x = 100; x < WORLD - 300; x += grid) {

        for (let y = 100; y < WORLD - 300; y += grid) {

            if (Math.random() < 0.72) {

                const w = 150 + Math.random() * 120;
                const h = 150 + Math.random() * 120;

                const building = {
                    x: x + Math.random() * 80,
                    y: y + Math.random() * 80,
                    w: w,
                    h: h
                };

                buildings.push(building);

                doors.push({
                    x: building.x + building.w / 2,
                    y: building.y + building.h,
                    open: false,
                    building: building
                });
            }
        }
    }

    for (let i = 0; i < 80; i++) {

        crates.push({
            x: Math.random() * WORLD,
            y: Math.random() * WORLD,
            searched: false
        });
    }
}

generateCity();


/* =====================================================
   INPUT
===================================================== */

document.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;

    const key = event.key.toLowerCase();

    if (key === "r") reload();
    if (key === "e") interact();
    if (key === "f") radio();
    if (key === "q") upgrade();

    if (key === "1") switchWeapon(0);
    if (key === "2") switchWeapon(1);
    if (key === "3") switchWeapon(2);
});


document.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


canvas.addEventListener("mousemove", (event) => {

    mouse.x = event.clientX;
    mouse.y = event.clientY;

    const crosshair =
        document.getElementById("crosshair");

    if (crosshair) {
        crosshair.style.left = mouse.x + "px";
        crosshair.style.top = mouse.y + "px";
    }
});


canvas.addEventListener("mousedown", () => {
    mouse.down = true;
});


canvas.addEventListener("mouseup", () => {
    mouse.down = false;
});


/* =====================================================
   CHARACTER SELECTION
===================================================== */

document.querySelectorAll(".character").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".character")
            .forEach(button => {
                button.classList.remove("selected");
            });

        button.classList.add("selected");

        selectedCharacter =
            button.dataset.character;
    });

});


/* =====================================================
   START GAME
===================================================== */

const startButton =
    document.getElementById("startButton");

if (startButton) {

    startButton.addEventListener("click", () => {
        startGame();
    });

}


function startGame() {

    const character =
        characters[selectedCharacter];

    player.speed = character.speed;

    player.maxHealth = character.health;
    player.health = character.health;

    player.damage = character.damage;

    player.maxAmmo = character.ammo;
    player.ammo = character.ammo;

    player.reserve = 60;

    player.x = WORLD / 2;
    player.y = WORLD / 2;

    gameStarted = true;
    gameOver = false;

    document.getElementById("menu").style.display = "none";

    nextWave();
}


/* =====================================================
   ZOMBIE TYPES
===================================================== */

const zombieTypes = {

    walker: {
        speed: 0.7,
        health: 3,
        damage: 5,
        radius: 17
    },

    runner: {
        speed: 1.7,
        health: 2,
        damage: 5,
        radius: 13
    },

    tank: {
        speed: 0.45,
        health: 15,
        damage: 15,
        radius: 29
    },

    boss: {
        speed: 0.6,
        health: 100,
        damage: 25,
        radius: 50
    }

};


/* =====================================================
   SPAWN ZOMBIE
===================================================== */

function spawnZombie(type = "walker") {

    const data = zombieTypes[type];

    const angle =
        Math.random() * Math.PI * 2;

    const distance =
        800 + Math.random() * 900;

    zombies.push({

        x:
            player.x +
            Math.cos(angle) * distance,

        y:
            player.y +
            Math.sin(angle) * distance,

        type: type,

        radius: data.radius,

        speed: data.speed,

        health: data.health,

        maxHealth: data.health,

        damage: data.damage,

        attackCooldown: 0,

        animation: Math.random() * 10
    });
}


/* =====================================================
   WAVES
===================================================== */

function nextWave() {

    wave++;

    showMessage("WAVE " + wave);

    const amount = 6 + wave * 3;

    for (let i = 0; i < amount; i++) {

        let type = "walker";

        const random = Math.random();

        if (wave >= 3 && random < 0.18) {
            type = "runner";
        }

        if (wave >= 5 && random < 0.10) {
            type = "tank";
        }

        spawnZombie(type);
    }

    if (wave % 5 === 0) {

        spawnZombie("boss");

        showMessage("⚠ BOSS INCOMING");
    }
}


/* =====================================================
   WEAPONS
===================================================== */

function switchWeapon(index) {

    if (!weapons[index]) return;

    player.weapon = index;

    const weapon = weapons[index];

    player.maxAmmo = weapon.maxAmmo;

    player.ammo =
        Math.min(player.ammo, player.maxAmmo);

    showMessage(weapon.name);
}


function shoot() {

    if (shootCooldown > 0) return;

    const weapon = weapons[player.weapon];

    if (player.ammo <= 0) {

        showMessage("PRESS R TO RELOAD");

        return;
    }

    player.ammo--;

    shootCooldown = weapon.fireRate;

    const worldX =
        mouse.x + camera.x;

    const worldY =
        mouse.y + camera.y;

    const baseAngle =
        Math.atan2(
            worldY - player.y,
            worldX - player.x
        );

    for (let i = 0; i < weapon.pellets; i++) {

        const angle =
            baseAngle +
            (Math.random() - 0.5) *
            weapon.spread;

        bullets.push({

            x: player.x,
            y: player.y,

            dx: Math.cos(angle) * 17,
            dy: Math.sin(angle) * 17,

            damage:
                weapon.damage *
                player.damage,

            life: 60
        });
    }

    makeNoise(900);
}


function reload() {

    if (player.ammo >= player.maxAmmo) return;

    if (player.reserve <= 0) {

        showMessage("NO AMMO");

        return;
    }

    const needed =
        player.maxAmmo - player.ammo;

    const amount =
        Math.min(
            needed,
            player.reserve
        );

    player.ammo += amount;
    player.reserve -= amount;

    showMessage("RELOADED");
}


/* =====================================================
   NOISE
===================================================== */

function makeNoise(range) {

    zombies.forEach(zombie => {

        const distance =
            Math.hypot(
                zombie.x - player.x,
                zombie.y - player.y
            );

        if (distance < range) {
            zombie.speed += 0.15;
        }
    });
}


/* =====================================================
   RADIO
===================================================== */

function radio() {

    if (player.signal < 25) {

        showMessage("SIGNAL TOO WEAK");

        return;
    }

    player.signal -= 25;

    loot.push({

        x:
            player.x +
            (Math.random() - 0.5) * 1500,

        y:
            player.y +
            (Math.random() - 0.5) * 1500,

        type: "supply"
    });

    makeNoise(1300);

    showMessage("📡 SUPPLY DROP FOUND");
}


/* =====================================================
   INTERACTION
===================================================== */

function interact() {

    /* CRATES */

    for (const crate of crates) {

        if (crate.searched) continue;

        const distance =
            Math.hypot(
                player.x - crate.x,
                player.y - crate.y
            );

        if (distance < 70) {

            crate.searched = true;

            const random = Math.random();

            if (random < 0.4) {

                player.reserve += 20;

                showMessage("+20 AMMO");

            } else if (random < 0.7) {

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


    /* DOORS */

    for (const door of doors) {

        const distance =
            Math.hypot(
                player.x - door.x,
                player.y - door.y
            );

        if (distance < 80) {

            door.open = !door.open;

            showMessage(
                door.open
                    ? "DOOR OPEN"
                    : "DOOR CLOSED"
            );

            return;
        }
    }


    /* LOOT */

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

            showMessage("📦 SUPPLIES COLLECTED");

            return;
        }
    }
}


/* =====================================================
   UPGRADE
===================================================== */

function upgrade() {

    const cost = level * 50;

    if (coins < cost) {

        showMessage(
            "NEED " + cost + " COINS"
        );

        return;
    }

    coins -= cost;

    player.damage++;

    player.maxHealth += 5;

    player.health = player.maxHealth;

    showMessage("🔧 UPGRADE COMPLETE");
}


/* =====================================================
   XP
===================================================== */

function gainXP(amount) {

    xp += amount;

    const needed = level * 100;

    if (xp >= needed) {

        xp -= needed;

        level++;

        player.maxHealth += 10;

        player.health = player.maxHealth;

        showMessage(
            "⭐ LEVEL " + level
        );
    }
}


/* =====================================================
   KILL ZOMBIE
===================================================== */

function killZombie(zombie) {

    const index = zombies.indexOf(zombie);

    if (index === -1) return;

    zombies.splice(index, 1);

    kills++;

    const reward =
        zombie.type === "boss"
            ? 250
            : 10;

    coins += reward;

    gainXP(
        zombie.type === "boss"
            ? 200
            : 25
    );

    createParticles(
        zombie.x,
        zombie.y
    );

    if (Math.random() < 0.3) {

        loot.push({

            x: zombie.x,
            y: zombie.y,

            type: "drop"
        });
    }
}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if (!gameStarted || gameOver) return;

    gameTime++;

    if (shootCooldown > 0) {
        shootCooldown--;
    }


    /* MOVEMENT */

    let dx = 0;
    let dy = 0;

    if (keys["w"]) dy--;
    if (keys["s"]) dy++;
    if (keys["a"]) dx--;
    if (keys["d"]) dx++;


    const moving =
        dx !== 0 || dy !== 0;

    const sprint =
        keys["shift"] &&
        moving &&
        player.stamina > 0;


    const speed =
        sprint
            ? player.speed * 1.8
            : player.speed;


    if (sprint) {

        player.stamina -= 0.9;

    } else {

        player.stamina += 0.4;
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
            mouse.y + camera.y - player.y,
            mouse.x + camera.x - player.x
        );


    if (mouse.down) {
        shoot();
    }


    /* CAMERA */

    camera.x =
        player.x -
        canvas.width / 2;

    camera.y =
        player.y -
        canvas.height / 2;


    /* BULLETS */

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        bullet.life--;

        let hit = false;

        for (const zombie of [...zombies]) {

            const distance =
                Math.hypot(
                    bullet.x - zombie.x,
                    bullet.y - zombie.y
                );

            if (
                distance <
                zombie.radius + 5
            ) {

                zombie.health -= bullet.damage;

                createParticles(
                    bullet.x,
                    bullet.y
                );

                if (zombie.health <= 0) {
                    killZombie(zombie);
                }

                bullets.splice(i, 1);

                hit = true;

                break;
            }
        }

        if (!hit && bullet.life <= 0) {
            bullets.splice(i, 1);
        }
    }


    /* ZOMBIES */

    for (const zombie of zombies) {

        const dx =
            player.x - zombie.x;

        const dy =
            player.y - zombie.y;

        const distance =
            Math.hypot(dx, dy);


        let speed = zombie.speed;

        if (isNight()) {
            speed *= 1.4;
        }


        zombie.animation += 0.1;


        if (distance > 45) {

            zombie.x +=
                (dx / distance) *
                speed;

            zombie.y +=
                (dy / distance) *
                speed;
        }


        if (distance < 50) {

            if (zombie.attackCooldown <= 0) {

                player.health -= zombie.damage;

                zombie.attackCooldown = 50;

                showMessage("⚠ ZOMBIE ATTACK");
            }
        }

        zombie.attackCooldown--;
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

        const particle = particles[i];

        particle.x += particle.dx;
        particle.y += particle.dy;

        particle.life--;

        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }


    /* NEXT WAVE */

    if (zombies.length === 0) {
        nextWave();
    }


    /* DEATH */

    if (player.health <= 0) {
        endGame();
    }


    updateUI();


    /* AUTOSAVE */

    if (gameTime % 600 === 0) {
        saveGame();
    }
}


/* =====================================================
   PARTICLES
===================================================== */

function createParticles(x, y) {

    for (let i = 0; i < 5; i++) {

        particles.push({

            x: x,
            y: y,

            dx:
                (Math.random() - 0.5) * 5,

            dy:
                (Math.random() - 0.5) * 5,

            life: 20
        });
    }
}


/* =====================================================
   DAY / NIGHT
===================================================== */

function isNight() {

    return (
        Math.floor(gameTime / 1800) % 2
    ) === 1;
}


/* =====================================================
   DRAW
===================================================== */

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

    ctx.fillStyle = "#172d17";

    ctx.fillRect(
        0,
        0,
        WORLD,
        WORLD
    );


    /* GRID / ROADS */

    ctx.strokeStyle =
        "rgba(255,255,255,0.035)";

    ctx.lineWidth = 2;


    for (let x = 0; x < WORLD; x += 100) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD);

        ctx.stroke();
    }


    for (let y = 0; y < WORLD; y += 100) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(WORLD, y);

        ctx.stroke();
    }


    /* BUILDINGS */

    for (const building of buildings) {

        ctx.fillStyle = "#222";

        ctx.fillRect(
            building.x,
            building.y,
            building.w,
            building.h
        );

        ctx.strokeStyle = "#444";

        ctx.strokeRect(
            building.x,
            building.y,
            building.w,
            building.h
        );


        /* WINDOWS */

        ctx.fillStyle = "#59615a";

        for (
            let x = building.x + 25;
            x < building.x + building.w - 20;
            x += 45
        ) {

            ctx.fillRect(
                x,
                building.y + 25,
                15,
                20
            );
        }
    }


    /* DOORS */

    for (const door of doors) {

        ctx.fillStyle =
            door.open
                ? "#4c8a4c"
                : "#8a542f";

        ctx.fillRect(
            door.x - 18,
            door.y - 7,
            36,
            14
        );
    }


    /* CRATES */

    for (const crate of crates) {

        if (crate.searched) continue;

        ctx.fillStyle = "#b17e2f";

        ctx.fillRect(
            crate.x - 13,
            crate.y - 13,
            26,
            26
        );
    }


    /* LOOT */

    for (const item of loot) {

        ctx.fillStyle = "#48d7ff";

        ctx.beginPath();

        ctx.arc(
            item.x,
            item.y,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* BULLETS */

    ctx.fillStyle = "white";

    for (const bullet of bullets) {

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    /* ZOMBIES */

    for (const zombie of zombies) {

        let zombieColor = "#557848";

        if (zombie.type === "runner") {
            zombieColor = "#c29339";
        }

        if (zombie.type === "tank") {
            zombieColor = "#704747";
        }

        if (zombie.type === "boss") {
            zombieColor = "#a52222";
        }


        const bounce =
            Math.sin(zombie.animation) * 2;


        ctx.fillStyle = zombieColor;

        ctx.beginPath();

        ctx.arc(
            zombie.x,
            zombie.y + bounce,
            zombie.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* EYES */

        ctx.fillStyle = "#eee";

        ctx.fillRect(
            zombie.x - zombie.radius / 3,
            zombie.y - zombie.radius / 3,
            4,
            4
        );

        ctx.fillRect(
            zombie.x + zombie.radius / 5,
            zombie.y - zombie.radius / 3,
            4,
            4
        );


        /* HEALTH BAR */

        if (
            zombie.type === "boss" ||
            zombie.type === "tank"
        ) {

            ctx.fillStyle = "#111";

            ctx.fillRect(
                zombie.x - zombie.radius,
                zombie.y - zombie.radius - 10,
                zombie.radius * 2,
                5
            );

            ctx.fillStyle = "#e33";

            ctx.fillRect(
                zombie.x - zombie.radius,
                zombie.y - zombie.radius - 10,

                zombie.radius * 2 *
                (
                    zombie.health /
                    zombie.maxHealth
                ),

                5
            );
        }
    }


    /* PLAYER */

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    ctx.rotate(player.angle);


    ctx.fillStyle = "#4da3ff";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* GUN */

    ctx.fillStyle = "#111";

    ctx.fillRect(
        5,
        -4,
        32,
        8
    );

    ctx.restore();


    /* PARTICLES */

    ctx.fillStyle = "#ddd";

    for (const particle of particles) {

        ctx.fillRect(
            particle.x,
            particle.y,
            3,
            3
        );
    }


    ctx.restore();


    /* NIGHT */

    if (isNight()) {

        ctx.fillStyle =
            "rgba(3,5,25,0.78)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /* FLASHLIGHT */

        const light =
            ctx.createRadialGradient(
                mouse.x,
                mouse.y,
                30,
                mouse.x,
                mouse.y,
                350
            );

        light.addColorStop(
            0,
            "rgba(255,255,255,0.25)"
        );

        light.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        ctx.fillStyle = light;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }


    drawMinimap();
}


/* =====================================================
   MINIMAP
===================================================== */

function drawMinimap() {

    const size = 150;

    const x =
        canvas.width -
        size -
        20;

    const y = 20;


    ctx.fillStyle =
        "rgba(0,0,0,0.7)";

    ctx.fillRect(
        x,
        y,
        size,
        size
    );


    /* BUILDINGS */

    ctx.fillStyle = "#555";

    for (const building of buildings) {

        ctx.fillRect(

            x +
            building.x / WORLD * size,

            y +
            building.y / WORLD * size,

            building.w / WORLD * size,

            building.h / WORLD * size
        );
    }


    /* ZOMBIES */

    ctx.fillStyle = "#e33";

    for (const zombie of zombies) {

        ctx.fillRect(

            x +
            zombie.x / WORLD * size - 2,

            y +
            zombie.y / WORLD * size - 2,

            4,
            4
        );
    }


    /* PLAYER */

    ctx.fillStyle = "#4da3ff";

    ctx.fillRect(

        x +
        player.x / WORLD * size - 3,

        y +
        player.y / WORLD * size - 3,

        6,
        6
    );
}


/* =====================================================
   UI
===================================================== */

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


    if (health) {
        health.textContent =
            Math.max(
                0,
                Math.floor(player.health)
            );
    }

    if (ammo) {
        ammo.textContent = player.ammo;
    }

    if (reserve) {
        reserve.textContent = player.reserve;
    }

    if (stamina) {
        stamina.textContent =
            Math.floor(player.stamina);
    }

    if (signal) {
        signal.textContent =
            Math.floor(player.signal);
    }

    if (levelElement) {
        levelElement.textContent = level;
    }

    if (coinsElement) {
        coinsElement.textContent = coins;
    }

    if (weaponElement) {
        weaponElement.textContent =
            weapons[player.weapon].name;
    }

    if (mission) {
        mission.textContent =
            "WAVE " +
            wave +
            " • KILLS " +
            kills;
    }
}


/* =====================================================
   MESSAGE
===================================================== */

let messageTimer = null;

function showMessage(text) {

    const element =
        document.getElementById("message");

    if (!element) return;

    element.textContent = text;

    clearTimeout(messageTimer);

    messageTimer =
        setTimeout(() => {

            element.textContent = "";

        }, 1800);
}


/* =====================================================
   SAVE
===================================================== */

function saveGame() {

    const save = {

        player: {
            x: player.x,
            y: player.y,

            health: player.health,
            maxHealth: player.maxHealth,

            stamina: player.stamina,
            signal: player.signal,

            ammo: player.ammo,
            maxAmmo: player.maxAmmo,
            reserve: player.reserve,

            speed: player.speed,
            damage: player.damage,

            weapon: player.weapon
        },

        wave: wave,
        kills: kills,

        xp: xp,
        level: level,
        coins: coins,

        selectedCharacter:
            selectedCharacter
    };


    localStorage.setItem(
        "deadSignalSave",
        JSON.stringify(save)
    );

    showMessage("💾 GAME SAVED");
}


/* =====================================================
   LOAD
===================================================== */

function loadGame() {

    const saved =
        localStorage.getItem(
            "deadSignalSave"
        );


    if (!saved) {

        showMessage("NO SAVE FOUND");

        return;
    }


    try {

        const data =
            JSON.parse(saved);

        Object.assign(
            player,
            data.player
        );

        wave = data.wave || 0;
        kills = data.kills || 0;

        xp = data.xp || 0;
        level = data.level || 1;
        coins = data.coins || 0;

        selectedCharacter =
            data.selectedCharacter ||
            "scout";


        gameStarted = true;
        gameOver = false;

        document.getElementById(
            "menu"
        ).style.display = "none";


        zombies = [];

        nextWave();

        showMessage("💾 SAVE LOADED");

    } catch (error) {

        console.error(
            "Save file error:",
            error
        );

        showMessage(
            "SAVE FILE CORRUPTED"
        );
    }
}


/* =====================================================
   CONTINUE BUTTON
===================================================== */

const continueButton =
    document.getElementById(
        "continueButton"
    );

if (continueButton) {

    continueButton.addEventListener(
        "click",
        () => {
            loadGame();
        }
    );
}


/* =====================================================
   GAME OVER
===================================================== */

function endGame() {

    gameOver = true;

    const gameOverScreen =
        document.getElementById(
            "gameOver"
        );

    if (gameOverScreen) {

        gameOverScreen.style.display =
            "flex";
    }


    const finalWave =
        document.getElementById(
            "finalWave"
        );

    const finalKills =
        document.getElementById(
            "finalKills"
        );


    if (finalWave) {
        finalWave.textContent = wave;
    }

    if (finalKills) {
        finalKills.textContent = kills;
    }
}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );
}


gameLoop();

