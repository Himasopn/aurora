// script.js (module)
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.152.2/examples/jsm/renderers/CSS2DRenderer.js';

const container = document.getElementById('container');
const infoName = document.getElementById('selected');
const desc = document.getElementById('desc');

// scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f6f8);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 60, 120);

// WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Label renderer (CSS2D)
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(labelRenderer.domElement);

// lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
hemi.position.set(0, 200, 0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(100, 100, 100);
scene.add(dir);

// Controls
const controls = new OrbitControls(camera, labelRenderer.domElement);
controls.minDistance = 30;
controls.maxDistance = 300;
controls.target.set(0, 20, 0);
controls.update();

// Ground plane
const groundGeo = new THREE.PlaneGeometry(600, 400);
const groundMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotateX(-Math.PI/2);
ground.position.y = 0;
scene.add(ground);

// Helper function to make labels
function makeLabel(text) {
  const div = document.createElement('div');
  div.className = 'label';
  div.textContent = text;
  return new CSS2DObject(div);
}

// Materials (simple colors)
const matBody = new THREE.MeshStandardMaterial({ color: 0x8AB6D6, metalness:0.1, roughness:0.7 });
const matWet = new THREE.MeshStandardMaterial({ color: 0xFFD8A8 });
const matDry = new THREE.MeshStandardMaterial({ color: 0xC7E6A8 });
const matRec = new THREE.MeshStandardMaterial({ color: 0xB8D0FF });
const matConveyor = new THREE.MeshStandardMaterial({ color: 0x7D7D7D });
const matGate = new THREE.MeshStandardMaterial({ color: 0xFF6B6B });
const matCamera = new THREE.MeshStandardMaterial({ color: 0x333333 });

// Main bin body (outer shell)
const outerGeo = new THREE.BoxGeometry(60, 40, 40);
const outer = new THREE.Mesh(outerGeo, matBody);
outer.position.set(0, 20, 0);
scene.add(outer);
const outerLabel = makeLabel('Main Bin Body');
outerLabel.position.set(0, 25, 0);
outer.add(outerLabel);

// Top opening (simulated by a small inset)
const topHoleGeo = new THREE.BoxGeometry(20, 1, 16);
const topHoleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness:0.2 });
const topHole = new THREE.Mesh(topHoleGeo, topHoleMat);
topHole.position.set(0, 40.5, -4);
scene.add(topHole);
const topHoleLabel = makeLabel('Waste Input Slot');
topHoleLabel.position.set(0, 42, -4);
topHole.add(topHoleLabel);

// Inside three compartments (visible from front cutout)
// We'll create three smaller boxes and position them inside the outer shell
const compWidth = 17;
const compDepth = 34;
const compHeight = 30;
const gap = 2;
const startX = -compWidth - gap;
const wet = new THREE.Mesh(new THREE.BoxGeometry(compWidth, compHeight, compDepth), matWet);
const dry = new THREE.Mesh(new THREE.BoxGeometry(compWidth, compHeight, compDepth), matDry);
const rec = new THREE.Mesh(new THREE.BoxGeometry(compWidth, compHeight, compDepth), matRec);

wet.position.set(startX, compHeight/2 + 5, 0);
dry.position.set(0, compHeight/2 + 5, 0);
rec.position.set(-startX, compHeight/2 + 5, 0);
scene.add(wet, dry, rec);

wet.add(makeLabel('Wet (Organic) Bin'));
dry.add(makeLabel('Dry (Paper) Bin'));
rec.add(makeLabel('Recyclable Bin'));

// Conveyor tray in front of slot
const conv = new THREE.Mesh(new THREE.BoxGeometry(28, 2, 10), matConveyor);
conv.position.set(0, 38, 18);
scene.add(conv);
conv.add(makeLabel('Conveyor / Tray'));

// Small moving platform to simulate object placement
const platformMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
const platform = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 8), platformMat);
platform.position.set(0, 39.4, 18);
scene.add(platform);
platform.userData.pickable = true;
platform.add(makeLabel('Placement Platform'));

// Camera sensor (small cube near top slot)
const cam = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 2), matCamera);
cam.position.set(8, 40.5, -4);
scene.add(cam);
cam.add(makeLabel('Camera Sensor'));

// Servo gate (thin panel under the slot) — we'll rotate this to "direct" waste
const gate = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 9), matGate);
gate.position.set(0, 36.5, 11); // in front of conveyor
scene.add(gate);
gate.add(makeLabel('Servo Gate (Directs waste)'));

// LED indicators (small spheres)
const ledGeo = new THREE.SphereGeometry(0.6, 12, 8);
const ledWet = new THREE.Mesh(ledGeo, new THREE.MeshStandardMaterial({ color: 0xff8c42 }));
ledWet.position.set(-8, 33, -18);
scene.add(ledWet);
ledWet.add(makeLabel('Wet LED'));

const ledDry = new THREE.Mesh(ledGeo, new THREE.MeshStandardMaterial({ color: 0x76d275 }));
ledDry.position.set(0, 33, -18);
scene.add(ledDry);
ledDry.add(makeLabel('Dry LED'));

const ledRec = new THREE.Mesh(ledGeo, new THREE.MeshStandardMaterial({ color: 0x7da2ff }));
ledRec.position.set(8, 33, -18);
scene.add(ledRec);
ledRec.add(makeLabel('Recyclable LED'));

// Set object names (for click detection)
outer.name = 'Main Bin Body';
topHole.name = 'Waste Input Slot';
wet.name = 'Wet (Organic) Bin';
dry.name = 'Dry (Paper) Bin';
rec.name = 'Recyclable Bin';
conv.name = 'Conveyor / Tray';
platform.name = 'Placement Platform';
cam.name = 'Camera Sensor';
gate.name = 'Servo Gate';
ledWet.name = 'Wet LED';
ledDry.name = 'Dry LED';
ledRec.name = 'Recyclable LED';

// raycaster for clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const pickables = [outer, topHole, wet, dry, rec, conv, platform, cam, gate, ledWet, ledDry, ledRec];

function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pickables, true);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    selectObject(obj);
  }
}

function selectObject(obj) {
  // find topmost parent that has a name we set (some labels are children)
  let target = obj;
  while (target && !target.name) {
    target = target.parent;
  }
  if (!target) return;
  // highlight by temporarily changing emissive or scale
  infoName.textContent = target.name;
  desc.textContent = getDescriptionFor(target.name);

  // animate gate if gate selected (toggle)
  if (target === gate) {
    rotateGate();
  }
  // simple highlight: scale up and then back
  target.scale.set(1.03, 1.03, 1.03);
  setTimeout(()=> { target.scale.set(1,1,1); }, 300);
}

function getDescriptionFor(name) {
  const map = {
    'Main Bin Body': 'Outer shell — holds three internal compartments. Use recycled material in real product.',
    'Waste Input Slot': 'Top opening where user places waste. Camera scans from here.',
    'Wet (Organic) Bin': 'For food and organic waste (compostable).',
    'Dry (Paper) Bin': 'For paper, wrappers, dry trash.',
    'Recyclable Bin': 'For plastics, bottles, cans to be recycled.',
    'Conveyor / Tray': 'Place waste here — conveyor moves items under camera for detection.',
    'Placement Platform': 'Start position where item is placed for scanning.',
    'Camera Sensor': 'Simulated camera module — AI would analyze images here.',
    'Servo Gate': 'Gate rotates to direct the item into the correct compartment.',
    'Wet LED': 'Indicator LED for wet category.',
    'Dry LED': 'Indicator LED for dry category.',
    'Recyclable LED': 'Indicator LED for recyclable category.'
  };
  return map[name] || 'Part of the model.';
}

// Gate rotation (simulate actuation)
let gateOpen = false;
function rotateGate() {
  const from = gate.rotation.x;
  const to = gateOpen ? 0 : -Math.PI/3;
  gateOpen = !gateOpen;
  const start = performance.now();
  const dur = 400;
  const initial = from;
  function anim(t) {
    const p = Math.min(1, (t - start) / dur);
    gate.rotation.x = initial + (to - initial) * easeOutCubic(p);
    if (p < 1) requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

// animate object movement (simple demo to move platform in & out)
let platformDir = 1;
setInterval(() => {
  platform.position.z += 0.4 * platformDir;
  if (platform.position.z > 26) platformDir = -1;
  if (platform.position.z < 12) platformDir = 1;
}, 60);

// render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

// handle resize
window.addEventListener('resize', onWindowResize);
window.addEventListener('pointerdown', onPointerDown);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}
