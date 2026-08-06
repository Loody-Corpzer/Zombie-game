import * as THREE from "three";
import { PointerLockControls } from
"three/addons/controls/PointerLockControls.js";

const $ = id => document.getElementById(id);

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x10151a);

scene.fog = new THREE.FogExp2(
    0x10151a,
    0.0055
);

const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.05,
    1600
);

camera.position.set(0,1.7,0);

const renderer = new THREE.WebGLRenderer({
    antialias:true,
    powerPreference:"high-performance"
});

renderer.setSize(innerWidth,innerHeight);

renderer.setPixelRatio(
    Math.min(devicePixelRatio,2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.15;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

const controls =
    new PointerLockControls(
        camera,
        document.body
    );

const clock = new THREE.Clock();

let started = false;
let dead = false;
let paused = false;

let hp = 100;

let mag = 30;
let reserve = 150;

let wave = 1;
let kills = 0;

let time = 0;

let reloadTime = 0;
let shotCD = 0;

let flashlightOn = true;

const keys = {};
const zombies = [];
const buildings = [];
const particles = [];
const lights = [];

const mat = (
    c,
    r = .8,
    m = 0
) =>
new THREE.MeshStandardMaterial({
    color:c,
    roughness:r,
    metalness:m
});

const rnd = (a,b) =>
    a + Math.random() * (b-a);

addEventListener(
    "resize",
    () => {

        camera.aspect =
            innerWidth / innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            innerWidth,
            innerHeight
        );

        renderer.setPixelRatio(
            Math.min(devicePixelRatio,2)
        );
    }
);

addEventListener(
    "keydown",
    e => {

        keys[e.key.toLowerCase()] = true;

        if(e.key.toLowerCase() === "r")
            reload();

        if(e.key.toLowerCase() === "f"){

            flashlightOn = !flashlightOn;

            flash.visible =
                flashlightOn;
        }

        if(
            e.key === "Escape" &&
            started &&
            !dead
        ){
            togglePause();
        }
    }
);

addEventListener(
    "keyup",
    e => {
        keys[e.key.toLowerCase()] = false;
    }
);

addEventListener(
    "mousedown",
    e => {

        if(
            started &&
            !dead &&
            !paused &&
            e.button === 0
        ){
            shoot();
        }
    }
);


/* LIGHTING */

const hemi =
    new THREE.HemisphereLight(
        0x9eafbd,
        0x151915,
        1.3
    );

scene.add(hemi);

const sun =
    new THREE.DirectionalLight(
        0xd9e3e8,
        2.1
    );

sun.position.set(
    -180,
    250,
    -120
);

sun.castShadow = true;

sun.shadow.mapSize.set(
    2048,
    2048
);

sun.shadow.camera.left = -400;
sun.shadow.camera.right = 400;
sun.shadow.camera.top = 400;
sun.shadow.camera.bottom = -400;

sun.shadow.camera.far = 700;

scene.add(sun);


/* FLASHLIGHT */

const flash =
    new THREE.SpotLight(
        0xffffff,
        30,
        75,
        Math.PI / 8,
        .4,
        1
    );

flash.position.set(
    0,
    1.6,
    0
);

flash.castShadow = true;

flash.shadow.mapSize.set(
    1024,
    1024
);

const ft = new THREE.Object3D();

ft.position.set(
    0,
    1.4,
    -20
);

camera.add(
    flash,
    ft
);

flash.target = ft;


/* CITY */

function ground(){

    const g =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1200,
                1200
            ),
            mat(
                0x202522,
                1
            )
        );

    g.rotation.x =
        -Math.PI / 2;

    g.receiveShadow = true;

    scene.add(g);

    for(
        let x=-520;
        x<=520;
        x+=80
    ){

        road(
            x,
            0,
            34,
            1200
        );
    }

    for(
        let z=-520;
        z<=520;
        z+=80
    ){

        road(
            0,
            z,
            1200,
            34
        );
    }
}

function road(
    x,
    z,
    w,
    d
){

    const r =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                w,
                d
            ),
            mat(
                0x151819,
                1
            )
        );

    r.rotation.x =
        -Math.PI / 2;

    r.position.set(
        x,
        .015,
        z
    );

    r.receiveShadow = true;

    scene.add(r);

    if(w > d){

        const l =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    w,
                    .18
                ),
                mat(
                    0x77736a
                )
            );

        l.rotation.x =
            -Math.PI / 2;

        l.position.set(
            x,
            .03,
            z
        );

        scene.add(l);
    }
}


function building(
    x,
    z,
    w,
    d,
    h
){

    const g =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                w,
                h,
                d
            ),
            mat(
                new THREE.Color()
                    .setHSL(
                        .58,
                        .07,
                        rnd(.13,.23)
                    ),
                .9
            )
        );

    body.position.y =
        h / 2;

    body.castShadow =
        body.receiveShadow = true;

    g.add(body);


    for(
        let y=2.5;
        y<h-1;
        y+=3.5
    ){

        for(
            let xx=-w/2+2;
            xx<w/2-1;
            xx+=4
        ){

            if(Math.random()<.16)
                continue;

            const win =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1.3,
                        1.5,
                        .08
                    ),
                    mat(
                        Math.random()<.12
                            ? 0x111516
                            : 0x293d45,
                        .25,
                        .1
                    )
                );

            win.position.set(
                xx,
                y,
                d/2+.05
            );

            g.add(win);

            if(Math.random()<.22){

                const glow =
                    new THREE.PointLight(
                        0xffb85b,
                        1.5,
                        7
                    );

                glow.position.set(
                    xx,
                    y,
                    d/2+.4
                );

                g.add(glow);
            }
        }
    }


    const roof =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                w+.5,
                .35,
                d+.5
            ),
            mat(
                0x0d0f10,
                1
            )
        );

    roof.position.y =
        h + .18;

    roof.castShadow = true;

    g.add(roof);

    g.position.set(
        x,
        0,
        z
    );

    scene.add(g);

    buildings.push({
        x,
        z,
        w,
        d
    });
}


function city(){

    ground();

    for(
        let x=-480;
        x<=480;
        x+=80
    ){

        for(
            let z=-480;
            z<=480;
            z+=80
        ){

            if(
                Math.abs(x)<100 &&
                Math.abs(z)<100
            )
                continue;

            if(Math.random()<.76){

                building(
                    x+rnd(-12,12),
                    z+rnd(-12,12),
                    rnd(28,54),
                    rnd(28,54),
                    rnd(10,42)
                );
            }
        }
    }


    for(let i=0;i<45;i++){

        car(
            rnd(-480,480),
            rnd(-480,480)
        );
    }


    for(
        let i=-440;
        i<=440;
        i+=80
    ){

        lamp(i,-20);
        lamp(-20,i);
    }

    dust();
}


function car(x,z){

    const g =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                4.8,
                1.05,
                2.1
            ),
            mat(
                new THREE.Color()
                    .setHSL(
                        Math.random(),
                        .12,
                        .18
                    ),
                .8,
                .15
            )
        );

    body.position.y=.75;
    body.castShadow=true;

    g.add(body);


    const glass =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.4,
                .85,
                1.7
            ),
            mat(
                0x11191c,
                .25,
                .1
            )
        );

    glass.position.y=1.6;

    g.add(glass);


    for(
        const s of [-1,1]
    ){

        for(
            const f of [-1,1]
        ){

            const w =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        .45,
                        .45,
                        .3,
                        14
                    ),
                    mat(
                        0x050505,
                        1
                    )
                );

            w.rotation.z =
                Math.PI/2;

            w.position.set(
                f*1.55,
                .45,
                s*1.05
            );

            g.add(w);
        }
    }


    g.position.set(
        x,
        0,
        z
    );

    g.rotation.y =
        rnd(0,Math.PI);

    scene.add(g);
}


function lamp(x,z){

    const g =
        new THREE.Group();

    const p =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .1,
                .16,
                8,
                10
            ),
            mat(
                0x202223,
                .7,
                .5
            )
        );

    p.position.y=4;

    g.add(p);


    const bulb =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .25,
                10,
                10
            ),
            new THREE.MeshStandardMaterial({
                color:0xffd17c,
                emissive:0xff8a20,
                emissiveIntensity:4
            })
        );

    bulb.position.y=8;

    g.add(bulb);


    const l =
        new THREE.PointLight(
            0xffad55,
            2.4,
            28
        );

    l.position.y=8;

    g.add(l);

    g.position.set(
        x,
        0,
        z
    );

    scene.add(g);

    lights.push(l);
}


function dust(){

    const geo =
        new THREE.BufferGeometry();

    const pos =
        new Float32Array(
            3500*3
        );

    for(
        let i=0;
        i<pos.length;
        i+=3
    ){

        pos[i] =
            rnd(-600,600);

        pos[i+1] =
            rnd(0,90);

        pos[i+2] =
            rnd(-600,600);
    }

    geo.setAttribute(
        "position",
        new THREE.BufferAttribute(
            pos,
            3
        )
    );

    scene.add(
        new THREE.Points(
            geo,
            new THREE.PointsMaterial({
                color:0xc8d0d0,
                size:.1,
                transparent:true,
                opacity:.2,
                depthWrite:false
            })
        )
    );
}


/* WEAPON */

const weapon =
    new THREE.Group();

camera.add(weapon);


const gun =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            .3,
            .24,
            1.25
        ),
        mat(
            0x111314,
            .25,
            .8
        )
    );

gun.position.set(
    .38,
    -.3,
    -.9
);

weapon.add(gun);


const barrel =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            .045,
            .06,
            .75,
            16
        ),
        mat(
            0x050606,
            .2,
            .8
        )
    );

barrel.rotation.x =
    Math.PI/2;

barrel.position.set(
    .38,
    -.29,
    -1.7
);

weapon.add(barrel);


const grip =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            .2,
            .55,
            .24
        ),
        mat(
            0x111313,
            .7
        )
    );

grip.position.set(
    .38,
    -.58,
    -.7
);

grip.rotation.x=-.18;

weapon.add(grip);


const muzzle =
    new THREE.PointLight(
        0xffa43d,
        0,
        4
    );

muzzle.position.set(
    .38,
    -.29,
    -2.05
);

camera.add(muzzle);


/* ZOMBIES */

function zombie(){

    const g =
        new THREE.Group();

    const skin =
        mat(
            0x566b55,
            .95
        );

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

    body.position.y=1.05;
    body.castShadow=true;

    g.add(body);


    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .37,
                16,
                12
            ),
            skin
        );

    head.position.y=1.95;
    head.castShadow=true;

    g.add(head);


    const eyes =
        new THREE.MeshBasicMaterial({
            color:0xff2424
        });


    for(
        const x of [-.13,.13]
    ){

        const e =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    .045,
                    8,
                    8
                ),
                eyes
            );

        e.position.set(
            x,
            2,
            -.33
        );

        g.add(e);
    }


    for(
        const s of [-1,1]
    ){

        const a =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    .12,
                    .7,
                    4,
                    8
                ),
                skin
            );

        a.position.set(
            s*.55,
            1.15,
            0
        );

        a.rotation.z =
            -s*.45;

        g.add(a);
    }


    const z = {
        body:g,
        hp:100+wave*15,
        speed:rnd(1.3,1.8)+wave*.03,
        attack:0,
        phase:rnd(0,6)
    };


    g.traverse(
        o => o.userData.zombie=z
    );

    scene.add(g);

    return z;
}


function spawn(){

    const a =
        rnd(0,Math.PI*2);

    const d =
        rnd(70,140);

    const z =
        zombie();

    z.body.position.set(
        camera.position.x+
        Math.cos(a)*d,
        0,
        camera.position.z+
        Math.sin(a)*d
    );

    zombies.push(z);
}


function spawnWave(){

    for(
        let i=0;
        i<5+wave*2;
        i++
    ){

        setTimeout(
            spawn,
            i*180
        );
    }
}


/* PARTICLES */

function hitFX(p,red=false){

    for(
        let i=0;
        i<8;
        i++
    ){

        const q =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    .025,
                    4,
                    4
                ),
                new THREE.MeshBasicMaterial({
                    color:red
                        ? 0x8d2222
                        : 0xffc15b
                })
            );

        q.position.copy(p);

        q.userData.life=.3;

        q.userData.v =
            new THREE.Vector3(
                rnd(-1,1),
                rnd(.2,1.5),
                rnd(-1,1)
            );

        scene.add(q);

        particles.push(q);
    }
}


/* SHOOTING */

function shoot(){

    if(
        shotCD>0 ||
        reloadTime>0
    )
        return;


    if(!mag){

        notify("RELOAD");

        return;
    }


    mag--;

    shotCD=.105;

    muzzle.intensity=14;

    setTimeout(
        () => muzzle.intensity=0,
        45
    );


    hitFX(
        muzzle.getWorldPosition(
            new THREE.Vector3()
        )
    );


    const ray =
        new THREE.Raycaster();

    ray.setFromCamera(
        new THREE.Vector2(0,0),
        camera
    );


    const hits =
        ray.intersectObjects(
            zombies.map(z=>z.body),
            true
        );


    if(hits.length){

        const z =
            hits[0]
                .object
                .userData
                .zombie;

        if(z){

            z.hp -= 38;

            hitFX(
                hits[0].point,
                true
            );

            if(z.hp<=0)
                kill(z);
        }
    }
}


/* RELOAD */

function reload(){

    if(
        reloadTime ||
        mag>=30 ||
        reserve<=0
    )
        return;


    reloadTime=1.1;

    notify("RELOADING...");


    setTimeout(
        () => {

            const n =
                Math.min(
                    30-mag,
                    reserve
                );

            mag+=n;

            reserve-=n;

            reloadTime=0;

        },
        1100
    );
}


/* KILL */

function kill(z){

    const i =
        zombies.indexOf(z);

    if(i<0)
        return;


    scene.remove(z.body);

    zombies.splice(i,1);

    kills++;


    if(!zombies.length){

        wave++;

        notify(
            "WAVE "+wave
        );

        setTimeout(
            spawnWave,
            1800
        );
    }
}


/* DAMAGE */

function hurt(n){

    if(dead)
        return;


    hp-=n;

    $("hud").style.filter =
        "brightness(1.6)";


    setTimeout(
        () => {
            $("hud").style.filter="";
        },
        100
    );


    if(hp<=0)
        die();
}


/* DEATH */

function die(){

    dead=true;

    controls.unlock();

    $("deathStats").textContent =
        `WAVE ${wave} · KILLS ${kills}`;

    $("death").style.display="flex";
}


function respawn(){

    for(
        const z of zombies
    )
        scene.remove(z.body);

    zombies.length=0;

    hp=100;

    mag=30;

    reserve=150;

    wave=1;

    kills=0;

    camera.position.set(
        0,
        1.7,
        0
    );

    dead=false;

    $("death").style.display="none";

    controls.lock();

    spawnWave();
}


/* MOVEMENT */

function move(dt){

    if(
        !started ||
        dead ||
        paused ||
        !controls.isLocked
    )
        return;


    const s =
        keys.shift
            ? 11
            : 6.5;


    if(keys.w)
        controls.moveForward(
            s*dt
        );

    if(keys.s)
        controls.moveForward(
            -s*dt
        );

    if(keys.a)
        controls.moveRight(
            -s*dt
        );

    if(keys.d)
        controls.moveRight(
            s*dt
        );


    camera.position.y=1.7;


    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -570,
            570
        );


    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -570,
            570
        );
}


/* ZOMBIE AI */

function updateZ(dt){

    if(dead || paused)
        return;


    for(
        const z of [...zombies]
    ){

        const p =
            z.body.position;

        const dx =
            camera.position.x-p.x;

        const dz =
            camera.position.z-p.z;

        const d =
            Math.hypot(dx,dz);


        if(d>1.8){

            p.x +=
                dx/d *
                z.speed *
                dt;

            p.z +=
                dz/d *
                z.speed *
                dt;
        }


        z.body.lookAt(
            camera.position.x,
            0,
            camera.position.z
        );


        z.phase += dt*8;

        z.body.position.y =
            Math.sin(
                z.phase
            )*.035;


        if(d<2.2){

            z.attack-=dt;

            if(z.attack<=0){

                hurt(
                    7+wave*.5
                );

                z.attack=1;
            }
        }
    }
}


/* PARTICLE UPDATE */

function updateP(dt){

    for(
        let i=particles.length-1;
        i>=0;
        i--
    ){

        const p =
            particles[i];

        p.userData.life-=dt;

        p.position.addScaledVector(
            p.userData.v,
            dt
        );


        if(
            p.userData.life<=0
        ){

            scene.remove(p);

            particles.splice(
                i,
                1
            );
        }
    }
}


/* HUD */

function updateUI(dt){

    $("hpBar").style.width =
        Math.max(0,hp)+"%";

    $("hpText").textContent =
        Math.max(
            0,
            Math.floor(hp)
        );

    $("mag").textContent=mag;

    $("reserve").textContent=
        reserve;

    $("wave").textContent=wave;

    $("hostiles").textContent=
        zombies.length;

    $("kills").textContent=
        kills;

    time+=dt;
}


/* NOTIFICATIONS */

let noticeTimer;

function notify(t){

    $("notice").textContent=t;

    $("notice").style.opacity=1;

    clearTimeout(
        noticeTimer
    );

    noticeTimer =
        setTimeout(
            () =>
                $("notice").style.opacity=0,
            1200
        );
}


/* MINIMAP */

function map(){

    const c=$("map");

    const x=c.getContext("2d");

    const scale=.18;

    x.fillStyle="#101515";

    x.fillRect(
        0,
        0,
        180,
        180
    );


    x.fillStyle="#4b5050";

    for(
        const b of buildings
    ){

        x.fillRect(
            (b.x+500)*scale,
            (b.z+500)*scale,
            b.w*scale,
            b.d*scale
        );
    }


    x.fillStyle="#d33";

    for(
        const z of zombies
    ){

        x.fillRect(
            (z.body.position.x+500)*scale-2,
            (z.body.position.z+500)*scale-2,
            4,
            4
        );
    }


    x.fillStyle="#fff";

    x.beginPath();

    x.arc(
        (camera.position.x+500)*scale,
        (camera.position.z+500)*scale,
        3,
        0,
        7
    );

    x.fill();
}


/* PAUSE */

function togglePause(){

    paused=!paused;

    $("pause").style.display =
        paused
            ? "flex"
            : "none";


    if(paused)
        controls.unlock();
    else
        controls.lock();
}


/* BUTTONS */

$("play").onclick=()=>{

    started=true;

    $("menu").style.display="none";

    $("hud").style.display="block";

    controls.lock();

    spawnWave();
};


$("respawn").onclick=respawn;


/* START CITY */

city();

$("loadBar").style.width="100%";

$("loadText").textContent=
    "CITY READY";

setTimeout(
    () =>
        $("loading").style.display="none",
    800
);


/* GAME LOOP */

function loop(){

    requestAnimationFrame(loop);

    const dt =
        Math.min(
            clock.getDelta(),
            .05
        );


    if(shotCD>0)
        shotCD-=dt;


    move(dt);

    updateZ(dt);

    updateP(dt);

    updateUI(dt);

    map();


    weapon.position.y =
        Math.sin(
            performance.now()*.006
        ) *
        (keys.w?.006:0);


    renderer.render(
        scene,
        camera
    );
}

loop();
