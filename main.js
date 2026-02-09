let scene, camera, renderer, controls;
let snowmen = [];
let currentQuestion = null;

const workerURL = "https://YOUR-WORKER.workers.dev/game-ai";

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcfe9ff);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.PointerLockControls(camera, document.body);

  document.getElementById("startBtn").onclick = () => {
    controls.lock();
    document.getElementById("start").style.display = "none";
    loadQuestion();
  };

  camera.position.y = 1.6;

  // Свет
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // Пол (снег)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  window.addEventListener("click", throwSnowball);
  window.addEventListener("resize", onResize);

  animate();
}

function createSnowman(text, x) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  head.position.y = 0.9;

  group.add(body);
  group.add(head);

  group.position.set(x, 0.6, -5);
  group.userData.word = text;

  scene.add(group);
  snowmen.push(group);
}

async function loadQuestion() {
  snowmen.forEach(s => scene.remove(s));
  snowmen = [];

  const res = await fetch(workerURL);
  currentQuestion = await res.json();

  document.getElementById("question").innerText =
    currentQuestion.sentence;

  const options = shuffle(currentQuestion.options);

  createSnowman(options[0], -2);
  createSnowman(options[1], 0);
  createSnowman(options[2], 2);
}

function throwSnowball() {
  if (!currentQuestion) return;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

  const hits = raycaster.intersectObjects(snowmen, true);
  if (hits.length > 0) {
    const snowman = hits[0].object.parent;
    checkAnswer(snowman.userData.word);
  }
}

function checkAnswer(word) {
  if (word === currentQuestion.correct) {
    alert("✅ Правильно!");
  } else {
    alert("❌ Неправильно");
  }
  loadQuestion();
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
