let scene, camera, renderer, controls;
let snowmen = [];
let currentQuestion = null;

const WORKER_URL =
  "https://yellow-darkness-537f.damp-glade-283e.workers.dev/game-ai";

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
    controls.lock();
    document.getElementById("start").style.display = "none";
    loadQuestion();
  };

  document.addEventListener("keydown", e => keys[e.code] = true);
  document.addEventListener("keyup", e => keys[e.code] = false);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const sun = new THREE.DirectionalLight(0xffffff, 0.6);
  sun.position.set(5, 10, 5);
  scene.add(sun);

  // Земля
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Простые здания
  for (let i = 0; i < 6; i++) {
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0xdfefff })
    );
    house.position.set(Math.random() * 20 - 10, 1, -10 - Math.random() * 10);
    scene.add(house);
  }

  // Клик = бросок
  window.addEventListener("click", shoot);
  window.addEventListener("resize", onResize);

  animate();
}

function movePlayer() {
  const speed = 0.08;
  if (keys["KeyW"]) controls.moveForward(speed);
  if (keys["KeyS"]) controls.moveForward(-speed);
  if (keys["KeyA"]) controls.moveRight(-speed);
  if (keys["KeyD"]) controls.moveRight(speed);
}

function createSnowman(word, x) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  head.position.y = 0.9;

  const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
  const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
  eye1.position.set(-0.1, 0.95, 0.35);
  eye2.position.set(0.1, 0.95, 0.35);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.3, 8),
    new THREE.MeshStandardMaterial({ color: 0xff8c00 })
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.9, 0.45);

  group.add(body, head, eye1, eye2, nose);
  group.position.set(x, 0.6, -5);
  group.userData.word = word;

  scene.add(group);
  snowmen.push(group);
}

async function loadQuestion() {
  snowmen.forEach(s => scene.remove(s));
  snowmen = [];

  try {
    const res = await fetch(WORKER_URL);
    currentQuestion = await res.json();

    document.getElementById("question").innerText =
      currentQuestion.sentence;

    const opts = currentQuestion.options.sort(() => Math.random() - 0.5);
    createSnowman(opts[0], -2);
    createSnowman(opts[1], 0);
    createSnowman(opts[2], 2);

  } catch (e) {
    document.getElementById("question").innerText =
      "Ошибка загрузки ИИ";
    console.error(e);
  }
}

function shoot() {
  if (!currentQuestion) return;

  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = ray.intersectObjects(snowmen, true);

  if (hits.length) {
    const snowman = hits[0].object.parent;
    alert(
      snowman.userData.word === currentQuestion.correct
        ? "✅ Верно!"
        : "❌ Неверно"
    );
    loadQuestion();
  }
}

function animate() {
  requestAnimationFrame(animate);
  movePlayer();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
