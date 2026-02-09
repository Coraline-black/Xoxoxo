const WORKER =
  "https://yellow-darkness-537f.damp-glade-283e.workers.dev/";

let scene, camera, renderer, controls;
let snowmen = [];
let current;

const keys = {};

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcfe9ff);

  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.PointerLockControls(camera, document.body);

  document.getElementById("startBtn").onclick = () => {
    document.getElementById("start").style.display = "none";
    controls.lock();
    loadQuestion();
  };

  document.addEventListener("keydown", e => keys[e.code] = true);
  document.addEventListener("keyup", e => keys[e.code] = false);
  document.addEventListener("click", shoot);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  const sun = new THREE.DirectionalLight(0xffffff, 0.5);
  sun.position.set(5, 10, 5);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  animate();
}

function move() {
  const s = 0.08;
  if (keys["KeyW"]) controls.moveForward(s);
  if (keys["KeyS"]) controls.moveForward(-s);
  if (keys["KeyA"]) controls.moveRight(-s);
  if (keys["KeyD"]) controls.moveRight(s);
}

function createSnowman(word, x) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  head.position.y = 0.9;

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.3, 8),
    new THREE.MeshStandardMaterial({ color: 0xff8c00 })
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.9, 0.45);

  g.add(body, head, nose);
  g.position.set(x, 0.6, -5);
  g.userData.word = word;

  scene.add(g);
  snowmen.push(g);
}

async function loadQuestion() {
  snowmen.forEach(s => scene.remove(s));
  snowmen = [];

  const res = await fetch(WORKER);
  current = await res.json();

  document.getElementById("question").innerHTML =
    `<span>${current.sentence}</span>`;

  const opts = current.options.sort(() => Math.random() - 0.5);
  createSnowman(opts[0], -2);
  createSnowman(opts[1], 0);
  createSnowman(opts[2], 2);
}

function shoot() {
  if (!current) return;

  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0, 0), camera);

  const hits = ray.intersectObjects(snowmen, true);
  if (!hits.length) return;

  const sm = hits[0].object.parent;

  alert(sm.userData.word === current.correct ? "✅ Верно!" : "❌ Неверно");
  loadQuestion();
}

function animate() {
  requestAnimationFrame(animate);
  move();
  renderer.render(scene, camera);
}

window.onresize = () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
};
