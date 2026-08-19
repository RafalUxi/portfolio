import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { lenis } from './scroll.js';

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

//import './cursorlaser.js';
import './cursor.js';
import './ui.js';
import './backstar.js';
import './startLoader.js';

//zmiennie 'inne'
let scrollY = 0;

// Wirtualny ekran gry (w pamięci)
const gameCanvas = document.createElement('canvas');
gameCanvas.width = 256;
gameCanvas.height = 256;
const ctx = gameCanvas.getContext('2d');

// Tworzymy teksturę Three.js OD RAZU
const gameTexture = new THREE.CanvasTexture(gameCanvas);
gameTexture.minFilter = THREE.NearestFilter; // Pixel art - brak rozmycia
gameTexture.magFilter = THREE.NearestFilter;
gameTexture.colorSpace = THREE.SRGBColorSpace;
gameTexture.flipY = false; // Naprawa orientacji tekstury dla modeli GLTF

// Zmienne gry
const bgImg = new Image();
let currentImg = null;

const gameState = {
playerX: 125,
playerY: 50,
width: 12,
height: 17,
velocityY: 0,
velocityX: 0,
isGrounded: false,
charge: 0,
isCharging: false,
keys: { space: false,
    right: false,
    left: false
  },
TimerWalk: 0,
TimerWalkRight: 0,
TimerWalkLeft: 0,
};

const sprites = {
    idle: [],
    left: [],
    right: []
};

for(let i = 1; i <= 2; i++) {
    const Img = new Image();
    Img.src = `./idle/idle${i}.png`;
    sprites.idle.push(Img);
}

for(let i = 1; i <= 2; i++) {
    const Img = new Image();
    Img.src = `./lewo/lewo${i}.png`;
    sprites.left.push(Img);
}

for(let i = 1; i <= 2; i++) {
    const Img = new Image();
    Img.src = `./prawo/prawo${i}.png`;
    sprites.right.push(Img);
}
currentImg = sprites.idle[0];

let currentleavel = 1;
let platforms = [];

//hitbox1
function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

function loadLevel(numberoflvl) {
switch(numberoflvl) {
case 1:
platforms = [
{ x: 0, y: 239, w: 256, h: 16 }, // podloga
{ x: 173, y: 186, w: 48, h: 10 }, // 1
{ x: 182, y: 107, w: 48, h: 10 }, // 2
{ x: 58, y: 68, w: 48, h: 10 }, // 3
];
bgImg.src = './BC1.png';
break;
case 2:
platforms = [
{ x: 127, y: 242, w: 129, h: 14 }, // 1

{ x: 198, y: 174, w: 13, h: 7 }, // 2

{ x: 211, y: 173, w: 5, h: 7, slide: -1 }, // 3
{ x: 216, y: 171, w: 5, h: 7, slide: -1 }, // 4
{ x: 221, y: 169, w: 5, h: 7, slide: -1}, // 5
{ x: 226, y: 167, w: 3, h: 7, slide: -1 }, // 6
{ x: 229, y: 166, w: 4, h: 7, slide: -1 }, // 7
{ x: 233, y: 164, w: 3, h: 7, slide: -1 }, // 8
{ x: 236, y: 162, w: 2, h: 7, slide: -1 }, // 9
{ x: 238, y: 161, w: 8, h: 8, slide: 0 }, // 10

{ x: 120, y: 116, w: 48, h: 7, slide: 0 }, // platforma 1
{ x: 0, y: 131, w: 62, h: 15, slide: 0 }, // 12


{ x: 30, y: 74, w: 5, h: 28, slide: 1 }, //domek
{ x: 34, y: 75, w: 2, h: 27, slide: 1}, //x
{ x: 36, y: 76, w: 1, h: 26, slide: 1}, //x
{ x: 37, y: 78, w: 3, h: 24, slide: 1}, //x
{ x: 39, y: 80, w: 3, h: 22, slide: 1}, //x
{ x: 42, y: 83, w: 3, h: 19, slide: 1}, //x
{ x: 44, y: 87, w: 6, h: 15, slide: 1}, //x
{ x: 49, y: 90, w: 6, h: 12, slide: 1}, //x
{ x: 51, y: 96, w: 4, h: 6, slide: 1}, //
{ x: 55, y: 93, w: 3, h: 9, slide: 1}, //x
{ x: 58, y: 95, w: 3, h: 7, slide: 1}, //x

{ x: 120, y: 65, w: 48, h: 7, slide: 0 }, // platforma 2

{ x: 110, y: 30, w: 48, h: 7, slide: 0 }, // platforma 3

];
bgImg.src = './BC2.png';
break;
case 3:
platforms = [
    { x: 170, y: 241, w: 86, h: 14,  slide: 0 },
    { x: 192, y: 182, w: 10, h: 59,  slide: 0 },
    { x: 171, y: 173, w: 86, h: 9,  slide: 0 },
    { x: 101, y: 204, w: 6, h: 21,  slide: 0 },
];

bgImg.src = './BC3  .png';
break;
default:
    console.log("Brak poziomu");
    break;
}}
loadLevel(currentleavel);




// Obsługa klawiatury
window.addEventListener('keydown', (e) => {
if (e.code === 'Space') {
gameState.keys.space = true;
if(gameState.isGrounded) {
gameState.isCharging = true;      // Rozpocznij ładowanie skoku
gameState.velocityX = 0;        // Reset poziomej prędkości
}
}

if(e.code === 'ArrowRight') gameState.keys.right = true;
if(e.code === 'ArrowLeft') gameState.keys.left = true;
});

window.addEventListener('keyup', (e) => {
if (e.code === 'Space') {
gameState.keys.space = false;

if(gameState.isCharging){
gameState.isCharging = false;

//nadac predkość poziomą na podstawie naładowania 
gameState.velocityY = -gameState.charge * 0.7;

let dir = 0;
if(gameState.keys.right) dir = 1;
if(gameState.keys.left) dir = -1;

gameState.velocityX = dir * (gameState.charge * 0.2);
gameState.charge = 0;
gameState.isGrounded = false;
}
}
if(e.code === 'ArrowRight') gameState.keys.right = false;
if(e.code === 'ArrowLeft') gameState.keys.left = false;
});


// Funkcja aktualizująca logikę gry 2D
const updateGame2D = () => {
// jump
if (gameState.isCharging && gameState.isGrounded) {
if (gameState.charge < 9) gameState.charge += 0.17;
}

// move
if(gameState.isGrounded && !gameState.isCharging) {
gameState.velocityX = 0;
if(gameState.keys.right) gameState.velocityX = 0.8;
if(gameState.keys.left) gameState.velocityX = -0.8;
}
gameState.playerX += gameState.velocityX;

if(gameState.playerX < 0) {
gameState.playerX = 0;
gameState.velocityX *= -0.5; 
}
else if(gameState.playerX + gameState.width > gameCanvas.width) {
gameState.playerX = gameCanvas.width - gameState.width;
gameState.velocityX = -gameState.velocityX * 0.5;
}
 
 // hitbox x
for (let p of platforms) {
if (rectIntersect(gameState.playerX, gameState.playerY, gameState.width, gameState.height, p.x, p.y, p.w, p.h)) {
// Kolizja w poziomie - Odbicie (Wall Bonk)
if (gameState.velocityX > 0) {
gameState.playerX = p.x - gameState.width;
gameState.velocityX = -gameState.velocityX * 0.5; // Odbij się z połową siły
} else if (gameState.velocityX < 0) {
gameState.playerX = p.x + p.w;
gameState.velocityX = -gameState.velocityX * 0.5;
}
}
}

// move y + hitbox y
gameState.velocityY += 0.2; // Grawitacja
gameState.playerY += gameState.velocityY;
gameState.isGrounded = false;


// Kolizje z platformami
for (let p of platforms) {
if (rectIntersect(gameState.playerX, gameState.playerY, gameState.width, gameState.height, p.x, p.y, p.w, p.h)) {

// Kolizja w pionie
if (gameState.velocityY > 0) {
// Lądowanie
gameState.playerY = p.y - gameState.height;
gameState.velocityY = 0;
gameState.isGrounded = true;

if(p.slide) {
gameState.playerX += p.slide * 1; 
gameState.isCharging = false;
gameState.charge = 0;
}else if (!gameState.keys.left && !gameState.keys.right) {
gameState.velocityX = 0;
}

// Zatrzymanie poślizgu przy lądowaniu (jeśli nie trzymamy strzałek)
if(!gameState.keys.left && !gameState.keys.right) {
gameState.velocityX = 0;
}
} else if (gameState.velocityY < 0) {
// Uderzenie głową
gameState.playerY = p.y + p.h;
gameState.velocityY = 0;
}
}
}

// Zmiana poziomu
if(gameState.playerY < -gameState.height) {
currentleavel += 1;
loadLevel(currentleavel);
gameState.playerY = gameCanvas.height - gameState.height - 5;
}
if(gameState.playerY > gameCanvas.height) {
currentleavel -= 1;
loadLevel(currentleavel);
gameState.playerY = 0;
}



// Rysowanie
ctx.fillStyle = '#222';
ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

if (bgImg.complete && bgImg.naturalWidth !== 0) {
ctx.drawImage(bgImg, 0, 0, gameCanvas.width, gameCanvas.height);
}


if(gameState.keys.left === false && gameState.keys.right === false && gameState.isGrounded && !gameState.isCharging) {
    gameState.TimerWalk ++;
    gameState.TimerWalkRight = 0;
    gameState.TimerWalkLeft = 0;

    if(gameState.TimerWalk > 60){
        currentImg = sprites.idle[1];
        if(gameState.TimerWalk > 120) gameState.TimerWalk = 0;
    }else {
        currentImg = sprites.idle[0];
    }
}
if(gameState.keys.left && !gameState.keys.right && gameState.isGrounded && !gameState.isCharging) {
    gameState.TimerWalkLeft ++;
    gameState.TimerWalk = 0;
    gameState.TimerWalkRight = 0;

    if(gameState.TimerWalkLeft > 16){
        currentImg = sprites.left[1];
        if(gameState.TimerWalkLeft > 32) gameState.TimerWalkLeft = 0;
    }else {
        currentImg = sprites.left[0];
    }
}
if(gameState.keys.right && !gameState.keys.left && gameState.isGrounded && !gameState.isCharging) {
    gameState.TimerWalkRight ++;
    gameState.TimerWalk = 0;
    gameState.TimerWalkLeft = 0;

    if(gameState.TimerWalkRight > 16){
        currentImg = sprites.right[1];
        if(gameState.TimerWalkRight > 32) gameState.TimerWalkRight = 0;
    }else {
        currentImg = sprites.right[0];
    }
}

if(gameState.isGrounded && gameState.isCharging) {
        currentImg = sprites.idle[0];
}

if(!gameState.isGrounded) {
    if(gameState.velocityX > 0 ) {
        currentImg = sprites.right[0];
    }else if(gameState.velocityX < 0 ) {
        currentImg = sprites.left[0];
    }
}


if (currentImg && currentImg.complete) {
    ctx.drawImage(currentImg, gameState.playerX, gameState.playerY, gameState.width, gameState.height);
}else {
    ctx.fillStyle = '#ff00ff'; 
    ctx.fillRect(gameState.playerX, gameState.playerY, gameState.width, gameState.height);
}

};


// -------------------------------------------------------------------
// 2. SCENA 3D I KAMERA
// -------------------------------------------------------------------
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-6, 0, 5);
scene.add(camera);


// Światła (Wymagane dla modelu)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);

const defaultCameraPos =  new THREE.Vector3(-2, 1, 5);
const defaultCameraLookAt = new THREE.Vector3(-2, 1, 0);

const zoomedCameraPos = new THREE.Vector3(-0.8, 1, 3);
const zoomedLookAt = new THREE.Vector3(0.1, 1, 0);
const currentLookAt = new THREE.Vector3(0, 0, 0);

let targetPosition = defaultCameraPos.clone();
let targetLookAt = defaultCameraLookAt.clone();

let isZoomed = false;

let tvMesh = null;

const raytracer = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Obsługa kliknięcia w telewizor
window.addEventListener('click', (event) => {
mouse.x = (event.clientX / sizes.width) * 2 - 1;
mouse.y = -(event.clientY / sizes.height) * 2 + 1;

raytracer.setFromCamera(mouse, camera); // strzela promieniem z kamery

if(tvMesh){
const intersects = raytracer.intersectObject(tvMesh, true); // zwarca trablice 

if(intersects.length > 0){ // kliknieto w obiekt

if(!isZoomed){   // nie zumujemy 
    targetPosition.copy(zoomedCameraPos);
    targetLookAt.copy(zoomedLookAt);
    isZoomed = true;
}else{ // klikniecie w telewizor po przyblizeniu 
    targetPosition.copy(defaultCameraPos);
    targetLookAt.copy(defaultCameraLookAt);
    isZoomed = false;
}}else{ // tutaj klikamy w tlo
    targetPosition.copy(defaultCameraPos);
    targetLookAt.copy(defaultCameraLookAt);
    isZoomed = false;
}}
});



// 3. ŁADOWANIE MODELU TELEWIZORA

const gltfLoader = new GLTFLoader();

gltfLoader.load(
'./telewizor.glb',
(gltf) => {
const model = gltf.scene;

tvMesh =  model;

model.traverse((child) => {
if (child.isMesh && child.material) {
// Sprawdzamy nazwę materiału z Blendera
if (child.material.name === 'screen') {

// ZAMIAST TWORZYĆ NOWY MATERIAŁ, EDYTUJEMY ISTNIEJĄCY
// To zapobiega błędowi "refreshUniformsCommon"

// 1. Podpinamy teksturę gry
child.material.map = gameTexture;

// 2. Konfigurujemy świecenie (Emissive)
child.material.emissive = new THREE.Color(0xffffff);
child.material.emissiveMap = gameTexture;
child.material.emissiveIntensity = 1.0; // Moc świecenia

// 3. Usuwamy cieniowanie, żeby ekran był jasny i wyraźny
// (Parametry dla MeshStandardMaterial - domyślnego w GLTF)
child.material.roughness = 0.2; // Lekki połysk
child.material.metalness = 0.5;

// 4. KLUCZOWE: Informujemy Three.js, że materiał się zmienił
// Wymusza to przekompilowanie shadera pod nową teksturę
child.material.needsUpdate = true; 
}
}
});

model.scale.set(1, 1, 1);
model.position.x = 0;
model.position.y = 0;
model.position.z = 0;
model.rotation.y = Math.PI * 0.4;
scene.add(model);
},
(xhr) => {
console.log((xhr.loaded / xhr.total * 100) + '% loaded model');
},
(error) => {
console.error('Błąd ładowania modelu:', error);
}
);


// 5. RENDER LOOP

const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true, 
    alpha: true
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

const currentBasePos = defaultCameraPos.clone(); // Pozycja bazowa (bez scrolla)
const currentBaseLook = defaultCameraLookAt.clone();

const tick = () => {
const elapsedTime = clock.getElapsedTime();

updateGame2D();

if (gameTexture) {
gameTexture.needsUpdate = true;
}

currentBasePos.lerp(targetPosition, 0.05);
currentBaseLook.lerp(targetLookAt, 0.05);


const cameraOffSet = window.scrollY * 0.005; // Pobieramy bezpośrednio scroll


const finalCamPos = currentBasePos.clone();
const finalCamLook = currentBaseLook.clone();

finalCamPos.y -= cameraOffSet;
finalCamLook.y -= cameraOffSet;

camera.position.copy(finalCamPos);
camera.lookAt(finalCamLook);

renderer.render(scene, camera);
window.requestAnimationFrame(tick);
};

tick();

window.addEventListener('resize', () => {
sizes.width = window.innerWidth;
sizes.height = window.innerHeight;
camera.aspect = sizes.width / sizes.height;
camera.updateProjectionMatrix();
renderer.setSize(sizes.width, sizes.height);
});