let scene, camera, renderer, controls;
let snowmen = [];
let currentQuestion;

const WORKER_URL = "https://ТВОЙ-WORKER.workers.dev/game-ai";

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

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
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

  // Здания
  for (let i = 0; i < 8; i++) {
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0xdfefff })
    );
    house.position.set(Math.random()*20-10, 1, Math.random()*-20);
    scene.add(house);
  }

  // Падающий снег
  createSnow();

  window.addEventListener("click", shoot);
  animate();
}

function createSnow() {
  const geo = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i < 800; i++) {
    points.push(
      Math.random()*40-20,
      Math.random()*20,
      Math.random()*40-20
    );
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
  const snow = new THREE.Points(geo, mat);
  scene.add(snow);

  snow.tick = () => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      p.array[i*3+1] -= 0.03;
      if (p.array[i*3+1] < 0) p.array[i*3+1] = 20;
    }
    p.needsUpdate = true;
  };
  scene.userData.snow = snow;
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

  // Глаза
  const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
  const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
  eye1.position.set(-0.1, 0.95, 0.35);
  eye2.position.set(0.1, 0.95, 0.35);

  // Нос
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.3, 8),
    new THREE.MeshStandardMaterial({ color: 0xff8c00 })
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.9, 0.45);

  group.add(body, head, eye1, eye2, nose);
  group.position.set(x, 0.6, -5);
  group.userData.word = word;

  // Сугроб
  const mound = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xf0f8ff })
  );
  mound.position.y = -0.2;
  group.add(mound);

  scene.add(group);
  snowmen.push(group);
}

async function loadQuestion() {
  snowmen.forEach(s => scene.remove(s));
  snowmen = [];

  const res = await fetch(WORKER_URL);
  currentQuestion = await res.json();

  document.getElementById("question").innerText =
    currentQuestion.sentence;

  const opts = currentQuestion.options.sort(() => Math.random() - 0.5);
  createSnowman(opts[0], -2);
  createSnowman(opts[1], 0);
  createSnowman(opts[2], 2);
}

function shoot() {
  if (!currentQuestion) return;

  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0,0), camera);
  const hit = ray.intersectObjects(snowmen, true);

  if (hit.length) {
    const s = hit[0].object.parent;
    alert(s.userData.word === currentQuestion.correct ? "✅ Верно!" : "❌ Неверно");
    loadQuestion();
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (scene.userData.snow) scene.userData.snow.tick();
  renderer.render(scene, camera);
}
