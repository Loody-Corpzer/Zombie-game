
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

window.addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});


/* =========================
   GAME SETTINGS
========================= */

const WORLD = 3000;

let gameOver = false;

let keys = {};

let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    down: false
};

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "r") reload();

    if (e.key.toLowerCase() === "f") radio();

    if (e.key.toLowerCase() === "e") searchCrate();
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    document.getElementById("crosshair").style.left = mouse.x + "px";
    document.getElementById("crosshair").style.top = mouse.y + "px";
});

canvas.addEventListener("mousedown", () => {
    mouse.down = true;
});

canvas.addEventListener("mouseup", () => {
    mouse.down = false;
});


/* =========================
   PLAYER
========================= */

const player = {
    x: WORLD / 2,
    y: WORLD / 2,

    radius: 18,

    speed: 3,

    health: 100,

    ammo: 12,
    maxAmmo: 12,

    reserve: 48,

    stamina: 100,

    signal: 100,

    angle: 0
};


/* =========================
   CAMERA
========================= */

const camera = {
    x: 0,
    y: 0
};


/* =========================
   WORLD
========================= */

let buildings = [];

let crates = [];

let zombies = [];

let bullets = [];

let particles = [];


/* =========================
   GENERATE BUILDINGS
========================= */

for (let i = 0; i < 45; i++) {

    let w = 100 + Math.random() * 220;
    let h = 100 + Math.random() * 220;

    let x = Math.random() * (WORLD - w);
    let y = Math.random() * (WORLD - h);

    buildings.push({
        x,
        y,
        w,
        h
    });
}


/* =========================
   CRATES
========================= */

for (let i = 0; i < 25; i++) {

    crates.push({
        x: Math.random() * WORLD,
        y: Math.random() * WORLD,

        searched: false
    });
}


/* =========================
   ZOMBIES
========================= */

function spawnZombie() {

    let angle = Math.random() * Math.PI * 2;

    let distance = 500 + Math.random() * 900;

    zombies.push({
        x: player.x + Math.cos(angle) * distance,
        y: player.y + Math.sin(angle) * distance,

        radius: 17,

        speed: 0.7 + Math.random() * 0.5,

        health: 3,

        attackCooldown: 0
    });
}


for (let i = 0; i < 15; i++) {
    spawnZombie();
}


/* =========================
   DAY / NIGHT
========================= */

let time = 0;

function isNight() {

    return Math.floor(time / 20) % 2 === 1;

}


/* =========================
   SHOOTING
========================= */

let shootCooldown = 0;

function shoot() {

    if (shootCooldown > 0) return;

    if (player.ammo <= 0) {

        showMessage("OUT OF AMMO — PRESS R");

        return;
    }

    player.ammo--;

    shootCooldown = 12;

    let worldMouseX = mouse.x + camera.x;
    let worldMouseY = mouse.y + camera.y;

    let angle = Math.atan2(
        worldMouseY - player.y,
        worldMouseX - player.x
    );

    bullets.push({

        x: player.x,
        y: player.y,

        dx: Math.cos(angle) * 14,
        dy: Math.sin(angle) * 14,

        life: 60
    });

    // shooting makes noise
    attractZombies(600);

}


function reload() {

    if (player.ammo === player.maxAmmo) return;

    if (player.reserve <= 0) return;

    let needed = player.maxAmmo - player.ammo;

    let amount = Math.min(needed, player.reserve);

    player.ammo += amount;

    player.reserve -= amount;

    showMessage("RELOADED");

}


/* =========================
   RADIO
========================= */

function radio() {

    if (player.signal < 20) {

        showMessage("SIGNAL TOO WEAK");

        return;
    }

    player.signal -= 20;

    let crate = crates[Math.floor(Math.random() * crates.length)];

    crate.x = player.x + (Math.random() - .5) * 900;
    crate.y = player.y + (Math.random() - .5) * 900;

    showMessage("📡 SUPPLY DROP DETECTED");

    // radio attracts zombies
    attractZombies(1000);
}


/* =========================
   SEARCH CRATE
========================= */

function searchCrate() {

    for (let crate of crates) {

        let distance = Math.hypot(
            player.x - crate.x,
            player.y - crate.y
        );

        if (distance < 70 && !crate.searched) {

            crate.searched = true;

            let reward = Math.random();

            if (reward < .4) {

                player.reserve += 12;

                showMessage("+12 AMMO");

            } else if (reward < .7) {

                player.health = Math.min(
                    100,
                    player.health + 25
                );

                showMessage("+25 HEALTH");

            } else {

                player.signal = Math.min(
                    100,
                    player.signal + 40
                );

                showMessage("+40 SIGNAL");

            }

            return;
        }
    }

}


/* =========================
   ZOMBIE AI
========================= */

function attractZombies(range) {

    for (let zombie of zombies) {

        let distance = Math.hypot(
            zombie.x - player.x,
            zombie.y - player.y
        );

        if (distance < range) {

            zombie.speed += 0.2;

        }
    }
}


/* =========================
   PARTICLES
========================= */

function particle(x, y) {

    particles.push({

        x,
        y,

        dx: (Math.random() - .5) * 4,
        dy: (Math.random() - .5) * 4,

        life: 20
    });

}


/* =========================
   COLLISION
========================= */

function circleRectCollision(circle, rect) {

    let closestX = Math.max(
        rect.x,
        Math.min(circle.x, rect.x + rect.w)
    );

    let closestY = Math.max(
        rect.y,
        Math.min(circle.y, rect.y + rect.h)
    );

    let dx = circle.x - closestX;
    let dy = circle.y - closestY;

    return dx * dx + dy * dy <
        circle.radius * circle.radius;
}


/* =========================
   UPDATE
========================= */

function update() {

    if (gameOver) return;

    time += 1 / 60;

    if (shootCooldown > 0) shootCooldown--;

    /* PLAYER MOVEMENT */

    let dx = 0;
    let dy = 0;

    if (keys["w"]) dy--;
    if (keys["s"]) dy++;
    if (keys["a"]) dx--;
    if (keys["d"]) dx++;

    let moving = dx !== 0 || dy !== 0;

    let sprinting =
        keys["shift"] &&
        player.stamina > 0 &&
        moving;

    let speed = sprinting ? 6 : player.speed;

    if (sprinting) {

        player.stamina -= .7;

    } else {

        player.stamina += .35;

    }

    player.stamina = Math.max(
        0,
        Math.min(100, player.stamina)
    );

    if (moving) {

        let length = Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        player.x += dx * speed;
        player.y += dy * speed;

    }

    player.x = Math.max(
        20,
        Math.min(WORLD - 20, player.x)
    );

    player.y = Math.max(
        20,
        Math.min(WORLD - 20, player.y)
    );


    /* AIM */

    player.angle = Math.atan2(
        mouse.y + camera.y - player.y,
        mouse.x + camera.x - player.x
    );


    /* SHOOT */

    if (mouse.down) shoot();


    /* CAMERA */

    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;


    /* BULLETS */

    for (let i = bullets.length - 1; i >= 0; i--) {

        let bullet = bullets[i];

        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        bullet.life--;

        let removed = false;

        for (let zombie of zombies) {

            let distance = Math.hypot(
                bullet.x - zombie.x,
                bullet.y - zombie.y
            );

            if (distance < zombie.radius + 5) {

                zombie.health--;

                particle(bullet.x, bullet.y);

                bullets.splice(i, 1);

                removed = true;

                if (zombie.health <= 0) {

                    let index = zombies.indexOf(zombie);

                    zombies.splice(index, 1);

                    setTimeout(spawnZombie, 1000);

                }

                break;
            }
        }

        if (!removed && bullet.life <= 0) {

            bullets.splice(i, 1);

        }

    }


    /* ZOMBIES */

    for (let zombie of zombies) {

        let dx = player.x - zombie.x;
        let dy = player.y - zombie.y;

        let distance = Math.hypot(dx, dy);

        let speed = zombie.speed;

        if (isNight()) {
            speed *= 1.5;
        }

        if (distance > 35) {

            zombie.x += dx / distance * speed;
            zombie.y += dy / distance * speed;

        }

        if (distance < 40) {

            if (zombie.attackCooldown <= 0) {

                player.health -= isNight() ? 8 : 5;

                zombie.attackCooldown = 50;

                showMessage("A ZOMBIE GOT YOU!");

            }

        }

        zombie.attackCooldown--;

    }


    /* SIGNAL RECHARGE */

    player.signal += .01;

    player.signal = Math.min(
        100,
        player.signal
    );


    /* PARTICLES */

    for (let i = particles.length - 1; i >= 0; i--) {

        let p = particles[i];

        p.x += p.dx;
        p.y += p.dy;

        p.life--;

        if (p.life <= 0) {

            particles.splice(i, 1);

        }
    }


    /* GAME OVER */

    if (player.health <= 0) {

        endGame();

    }


    /* UI */

    document.getElementById("health").textContent =
        Math.max(0, Math.floor(player.health));

    document.getElementById("ammo").textContent =
        player.ammo;

    document.getElementById("reserve").textContent =
        player.reserve;

    document.getElementById("signal").textContent =
        Math.floor(player.signal);

    document.getElementById("stamina").textContent =
        Math.floor(player.stamina);

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

    ctx.fillStyle = "#1c351c";

    ctx.fillRect(
        0,
        0,
        WORLD,
        WORLD
    );


    /* ROAD GRID */

    ctx.strokeStyle = "rgba(255,255,255,.035)";
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

    for (let building of buildings) {

        ctx.fillStyle = "#202020";

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

    }


    /* CRATES */

    for (let crate of crates) {

        if (crate.searched) continue;

        ctx.fillStyle = "#b58b35";

        ctx.fillRect(
            crate.x - 15,
            crate.y - 15,
            30,
            30
        );

        ctx.strokeStyle = "#e5c56b";

        ctx.strokeRect(
            crate.x - 15,
            crate.y - 15,
            30,
            30
        );

    }


    /* BULLETS */

    ctx.fillStyle = "#fff";

    for (let bullet of bullets) {

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

    for (let zombie of zombies) {

        ctx.fillStyle =
            isNight() ? "#713b8f" : "#557a46";

        ctx.beginPath();

        ctx.arc(
            zombie.x,
            zombie.y,
            zombie.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // eyes

        ctx.fillStyle = "#fff";

        ctx.beginPath();

        ctx.arc(
            zombie.x - 5,
            zombie.y - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            zombie.x + 5,
            zombie.y - 4,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    /* PLAYER */

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    ctx.rotate(player.angle);

    ctx.fillStyle = "#4ea3ff";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // weapon

    ctx.fillStyle = "#222";

    ctx.fillRect(
        5,
        -4,
        25,
        8
    );

    ctx.restore();


    /* PARTICLES */

    for (let p of particles) {

        ctx.fillStyle = "#ddd";

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
            "rgba(5,5,30,.72)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        /* FLASHLIGHT */

        let gradient = ctx.createRadialGradient(
            mouse.x,
            mouse.y,
            40,
            mouse.x,
            mouse.y,
            280
        );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,.20)"
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


    /* NIGHT/DAY MESSAGE */

    ctx.fillStyle = "white";

    ctx.font = "bold 14px Arial";

    ctx.fillText(
        isNight() ? "🌙 NIGHT" : "☀ DAY",
        20,
        30
    );

}


/* =========================
   MESSAGE
========================= */

let messageTimer;

function showMessage(text) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {

        message.textContent = "";

    }, 1500);

}


/* =========================
   GAME OVER
========================= */

function endGame() {

    gameOver = true;

    document.getElementById("gameOver").style.display =
        "flex";

    document.getElementById("finalScore").textContent =
        Math.floor(time);

}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(gameLoop);

}

gameLoop();
