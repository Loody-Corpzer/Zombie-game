```javascript
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

window.addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});


/* =========================
   GAME
========================= */

let gameOver = false;
let gameTime = 0;
let wave = 1;
let kills = 0;
let xp = 0;
let level = 1;
let coins = 0;

let keys = {};

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    down: false
};


/* =========================
   WORLD
========================= */

const WORLD = 4000;

const camera = {
    x: 0,
    y: 0
};

const buildings = [];
const crates = [];
const zombies = [];
const bullets = [];
const particles = [];
const loot = [];


/* =========================
   PLAYER
========================= */

const player = {

    x: WORLD / 2,
    y: WORLD / 2,

    radius: 18,

    speed: 3.2,

    health: 100,
    maxHealth: 100,

    ammo: 12,
    maxAmmo: 12,

    reserve: 60,

    stamina: 100,

    signal: 100,

    damage: 1,

    fireRate: 12,

    angle: 0

};


/* =========================
   CONTROLS
========================= */

document.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "r") {
        reload();
    }

    if (e.key.toLowerCase() === "f") {
        radio();
    }

    if (e.key.toLowerCase() === "e") {
        interact();
    }

    if (e.key.toLowerCase() === "q") {
        upgradeWeapon();
    }

});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", e => {

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const crosshair =
        document.getElementById("crosshair");

    crosshair.style.left = mouse.x + "px";
    crosshair.style.top = mouse.y + "px";

});

canvas.addEventListener("mousedown", () => {
    mouse.down = true;
});

canvas.addEventListener("mouseup", () => {
    mouse.down = false;
});


/* =========================
   BUILDINGS
========================= */

for (let i = 0; i < 70; i++) {

    const w = 100 + Math.random() * 250;
    const h = 100 + Math.random() * 250;

    buildings.push({
        x: Math.random() * (WORLD - w),
        y: Math.random() * (WORLD - h),
        w,
        h
    });

}


/* =========================
   CRATES
========================= */

for (let i = 0; i < 40; i++) {

    crates.push({
        x: Math.random() * WORLD,
        y: Math.random() * WORLD,
        searched: false
    });

}


/* =========================
   ZOMBIE TYPES
========================= */

const zombieTypes = {

    normal: {
        speed: 0.8,
        health: 3,
        damage: 5,
        radius: 17
    },

    runner: {
        speed: 1.8,
        health: 2,
        damage: 4,
        radius: 13
    },

    tank: {
        speed: 0.45,
        health: 12,
        damage: 12,
        radius: 28
    },

    boss: {
        speed: 0.65,
        health: 60,
        damage: 20,
        radius: 45
    }

};


/* =========================
   SPAWN ZOMBIE
========================= */

function spawnZombie(type = "normal") {

    const angle =
        Math.random() * Math.PI * 2;

    const distance =
        700 + Math.random() * 1000;

    const data = zombieTypes[type];

    zombies.push({

        x: player.x + Math.cos(angle) * distance,
        y: player.y + Math.sin(angle) * distance,

        type,

        radius: data.radius,

        speed:
            data.speed +
            Math.random() * 0.3,

        health:
            data.health,

        maxHealth:
            data.health,

        damage:
            data.damage,

        attackCooldown: 0

    });

}


/* =========================
   WAVES
========================= */

function startWave() {

    wave++;

    showMessage("WAVE " + wave);

    let amount = 5 + wave * 2;

    for (let i = 0; i < amount; i++) {

        let type = "normal";

        const random = Math.random();

        if (wave >= 3 && random < .15) {
            type = "runner";
        }

        if (wave >= 5 && random < .10) {
            type = "tank";
        }

        spawnZombie(type);

    }

    if (wave % 5 === 0) {

        spawnZombie("boss");

        showMessage("⚠ BOSS DETECTED");

    }

}


/* Initial zombies */

for (let i = 0; i < 12; i++) {
    spawnZombie();
}


/* =========================
   SHOOTING
========================= */

let shootCooldown = 0;

function shoot() {

    if (shootCooldown > 0) return;

    if (player.ammo <= 0) {

        showMessage("NO AMMO — R TO RELOAD");

        return;
    }

    player.ammo--;

    shootCooldown =
        Math.max(4, player.fireRate);

    const worldX =
        mouse.x + camera.x;

    const worldY =
        mouse.y + camera.y;

    const angle =
        Math.atan2(
            worldY - player.y,
            worldX - player.x
        );

    bullets.push({

        x: player.x,
        y: player.y,

        dx: Math.cos(angle) * 16,
        dy: Math.sin(angle) * 16,

        life: 60

    });

    /* Gunshot noise */

    attractZombies(800);

}


/* =========================
   RELOAD
========================= */

function reload() {

    if (player.ammo === player.maxAmmo) {
        return;
    }

    if (player.reserve <= 0) {
        return;
    }

    const needed =
        player.maxAmmo - player.ammo;

    const amount =
        Math.min(needed, player.reserve);

    player.ammo += amount;
    player.reserve -= amount;

    showMessage("RELOADED");

}


/* =========================
   RADIO
========================= */

function radio() {

    if (player.signal < 25) {

        showMessage("SIGNAL TOO LOW");

        return;
    }

    player.signal -= 25;

    const x =
        player.x +
        (Math.random() - .5) * 1200;

    const y =
        player.y +
        (Math.random() - .5) * 1200;

    loot.push({

        x,
        y,

        type: "supply",

        amount: 1

    });

    showMessage("📡 SUPPLY DROP LOCATED");

    attractZombies(1200);

}


/* =========================
   INTERACTION
========================= */

function interact() {

    /* Crates */

    for (const crate of crates) {

        if (crate.searched) continue;

        const distance =
            Math.hypot(
                player.x - crate.x,
                player.y - crate.y
            );

        if (distance < 70) {

            crate.searched = true;

            const roll = Math.random();

            if (roll < .4) {

                player.reserve += 15;

                showMessage("+15 AMMO");

            } else if (roll < .7) {

                player.health =
                    Math.min(
                        player.maxHealth,
                        player.health + 20
                    );

                showMessage("+20 HEALTH");

            } else {

                coins += 20;

                showMessage("+20 COINS");

            }

            return;
        }

    }


    /* Loot */

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

            coins += 30;

            loot.splice(i, 1);

            showMessage("📦 SUPPLY COLLECTED");

            return;
        }

    }

}


/* =========================
   WEAPON UPGRADE
========================= */

function upgradeWeapon() {

    const cost = level * 50;

    if (coins < cost) {

        showMessage(
            "NEED " + cost + " COINS"
        );

        return;
    }

    coins -= cost;

    player.damage++;

    player.fireRate =
        Math.max(
            4,
            player.fireRate - 1
        );

    showMessage("🔧 WEAPON UPGRADED");

}


/* =========================
   ZOMBIE ATTRACT
========================= */

function attractZombies(range) {

    for (const zombie of zombies) {

        const distance =
            Math.hypot(
                zombie.x - player.x,
                zombie.y - player.y
            );

        if (distance < range) {

            zombie.speed += .15;

        }

    }

}


/* =========================
   XP
========================= */

function addXP(amount) {

    xp += amount;

    const needed =
        level * 100;

    if (xp >= needed) {

        xp -= needed;

        level++;

        player.maxHealth += 5;
        player.health = player.maxHealth;

        player.maxAmmo += 1;

        showMessage(
            "⭐ LEVEL " + level
        );

    }

}


/* =========================
   BULLET HIT
========================= */

function damageZombie(zombie) {

    zombie.health -= player.damage;

    for (let i = 0; i < 5; i++) {

        particles.push({

            x: zombie.x,
            y: zombie.y,

            dx:
                (Math.random() - .5) * 4,

            dy:
                (Math.random() - .5) * 4,

            life: 20

        });

    }

    if (zombie.health <= 0) {

        const index =
            zombies.indexOf(zombie);

        zombies.splice(index, 1);

        kills++;

        coins +=
            zombie.type === "boss"
                ? 100
                : 5;

        addXP(
            zombie.type === "boss"
                ? 100
                : 20
        );

        if (Math.random() < .25) {

            loot.push({

                x: zombie.x,
                y: zombie.y,

                type: "drop",

                amount: 1

            });

        }

    }

}


/* =========================
   UPDATE
========================= */

function update() {

    if (gameOver) return;

    gameTime++;

    if (shootCooldown > 0) {
        shootCooldown--;
    }


    /* PLAYER */

    let dx = 0;
    let dy = 0;

    if (keys["w"]) dy--;
    if (keys["s"]) dy++;
    if (keys["a"]) dx--;
    if (keys["d"]) dx++;

    const moving =
        dx !== 0 ||
        dy !== 0;

    const sprinting =
        keys["shift"] &&
        moving &&
        player.stamina > 0;

    let speed =
        sprinting
            ? 6
            : player.speed;


    if (sprinting) {

        player.stamina -= .8;

    } else {

        player.stamina += .4;

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

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet = bullets[i];

        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        bullet.life--;

        let hit = false;

        for (const zombie of zombies) {

            const distance =
                Math.hypot(
                    bullet.x - zombie.x,
                    bullet.y - zombie.y
                );

            if (
                distance <
                zombie.radius + 5
            ) {

                damageZombie(zombie);

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
            player.x - zombie.x;

        const dy =
            player.y - zombie.y;

        const distance =
            Math.hypot(dx, dy);

        let speed =
            zombie.speed;


        /* Night makes everything harder */

        if (isNight()) {
            speed *= 1.4;
        }


        if (distance > 40) {

            zombie.x +=
                dx / distance *
                speed;

            zombie.y +=
                dy / distance *
                speed;

        }


        if (distance < 45) {

            if (
                zombie.attackCooldown <= 0
            ) {

                player.health -=
                    zombie.damage;

                zombie.attackCooldown =
                    45;

                showMessage(
                    "⚠ YOU ARE BEING ATTACKED"
                );

            }

        }

        zombie.attackCooldown--;

    }


    /* SIGNAL */

    player.signal += .015;

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

        const p = particles[i];

        p.x += p.dx;
        p.y += p.dy;

        p.life--;

        if (p.life <= 0) {

            particles.splice(i, 1);

        }

    }


    /* NEW WAVE */

    if (zombies.length === 0) {

        startWave();

    }


    if (player.health <= 0) {

        endGame();

    }


    updateUI();

}


/* =========================
   DAY / NIGHT
========================= */

function isNight() {

    return Math.floor(
        gameTime / 1800
    ) % 2 === 1;

}


/* =========================
   DRAW
========================= */

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

    ctx.fillStyle = "#183518";

    ctx.fillRect(
        0,
        0,
        WORLD,
        WORLD
    );


    /* GRID */

    ctx.strokeStyle =
        "rgba(255,255,255,.025)";

    for (
        let x = 0;
        x < WORLD;
        x += 100
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD);

        ctx.stroke();

    }

    for (
        let y = 0;
        y < WORLD;
        y += 100
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(WORLD, y);

        ctx.stroke();

    }


    /* BUILDINGS */

    for (const building of buildings) {

        ctx.fillStyle = "#242424";

        ctx.fillRect(
            building.x,
            building.y,
            building.w,
            building.h
        );

        ctx.strokeStyle = "#555";

        ctx.strokeRect(
            building.x,
            building.y,
            building.w,
            building.h
        );

    }


    /* CRATES */

    for (const crate of crates) {

        if (crate.searched) continue;

        ctx.fillStyle = "#a8792f";

        ctx.fillRect(
            crate.x - 15,
            crate.y - 15,
            30,
            30
        );

    }


    /* LOOT */

    for (const item of loot) {

        ctx.fillStyle = "#55ddff";

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

        let color = "#557a46";

        if (zombie.type === "runner") {
            color = "#d4a13b";
        }

        if (zombie.type === "tank") {
            color = "#704545";
        }

        if (zombie.type === "boss") {
            color = "#9b2525";
        }

        ctx.fillStyle = color;

        ctx.beginPath();

        ctx.arc(
            zombie.x,
            zombie.y,
            zombie.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* Health bar */

        if (
            zombie.type === "tank" ||
            zombie.type === "boss"
        ) {

            const width =
                zombie.radius * 2;

            ctx.fillStyle = "#111";

            ctx.fillRect(
                zombie.x - zombie.radius,
                zombie.y -
                    zombie.radius -
                    10,
                width,
                5
            );

            ctx.fillStyle = "#e33";

            ctx.fillRect(
                zombie.x - zombie.radius,
                zombie.y -
                    zombie.radius -
                    10,
                width *
                    (zombie.health /
                        zombie.maxHealth),
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

    ctx.rotate(
        player.angle
    );

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


    /* Gun */

    ctx.fillStyle = "#111";

    ctx.fillRect(
        5,
        -4,
        30,
        8
    );

    ctx.restore();


    /* PARTICLES */

    ctx.fillStyle = "#ddd";

    for (const p of particles) {

        ctx.fillRect(
            p.x,
            p.y,
            3,
            3
        );

    }


    ctx.restore();


    /* NIGHT */

    if (isNight()) {

        ctx.fillStyle =
            "rgba(3,5,30,.75)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /* FLASHLIGHT */

        const gradient =
            ctx.createRadialGradient(
                mouse.x,
                mouse.y,
                20,
                mouse.x,
                mouse.y,
                330
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,.25)"
        );

        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }


    drawMinimap();

}


/* =========================
   MINIMAP
========================= */

function drawMinimap() {

    const size = 150;

    const x =
        canvas.width -
        size -
        20;

    const y = 20;

    ctx.fillStyle =
        "rgba(0,0,0,.65)";

    ctx.fillRect(
        x,
        y,
        size,
        size
    );


    /* Player */

    const px =
        x +
        player.x / WORLD * size;

    const py =
        y +
        player.y / WORLD * size;

    ctx.fillStyle = "#4da3ff";

    ctx.fillRect(
        px - 3,
        py - 3,
        6,
        6
    );


    /* Zombies */

    ctx.fillStyle = "#e33";

    for (const zombie of zombies) {

        const zx =
            x +
            zombie.x / WORLD * size;

        const zy =
            y +
            zombie.y / WORLD * size;

        ctx.fillRect(
            zx - 2,
            zy - 2,
            4,
            4
        );

    }

}


/* =========================
   UI
========================= */

function updateUI() {

    document.getElementById(
        "health"
    ).textContent =
        Math.max(
            0,
            Math.floor(player.health)
        );

    document.getElementById(
        "ammo"
    ).textContent =
        player.ammo;

    document.getElementById(
        "reserve"
    ).textContent =
        player.reserve;

    document.getElementById(
        "signal"
    ).textContent =
        Math.floor(player.signal);

    document.getElementById(
        "stamina"
    ).textContent =
        Math.floor(player.stamina);

}


/* =========================
   MESSAGE
========================= */

let messageTimer;

function showMessage(text) {

    const message =
        document.getElementById(
            "message"
        );

    message.textContent = text;

    clearTimeout(messageTimer);

    messageTimer =
        setTimeout(() => {

            message.textContent = "";

        }, 1800);

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    gameOver = true;

    document.getElementById(
        "gameOver"
    ).style.display = "flex";

    document.getElementById(
        "finalScore"
    ).textContent =
        Math.floor(gameTime / 60);

}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );

}

gameLoop();
```
