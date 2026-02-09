let scene, camera, renderer, snowmen = [], currentQ, score = 0;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaedefc);
    scene.fog = new THREE.Fog(0xaedefc, 2, 25);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Освещение (Мягкое мультяшное)
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

    createMap();
    createHands();
    nextRound();
    animate();
}

function createMap() {
    // Земля
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({color: 0xffffff}));
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    // Падающий снег
    const points = [];
    for(let i=0; i<1500; i++) points.push(new THREE.Vector3(Math.random()*20-10, Math.random()*10, Math.random()*20-10));
    const snowGeo = new THREE.BufferGeometry().setFromPoints(points);
    const snowMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.05});
    this.snowSystem = new THREE.Points(snowGeo, snowMat);
    scene.add(this.snowSystem);
}

function createHands() {
    const hand = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.5), new THREE.MeshStandardMaterial({color: 0x5d4037}));
    hand.position.set(0.5, -0.5, -0.5);
    hand.rotation.x = Math.PI/4;
    camera.add(hand);
    scene.add(camera);
}

function createTeenSnowman(x, text, id) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({color: 0xfaffff});
    
    // Тело и Голова (Дерзкий наклон вперед)
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.6), mat);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.4), mat);
    h.position.set(0, 1.3, 0.2); 
    group.add(b, h);

    // УСТАЛЫЕ ВЕКИ (Твоя просьба)
    const eyelidGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const darkMat = new THREE.MeshStandardMaterial({color: 0x333333});
    const e1 = new THREE.Mesh(eyelidGeo, darkMat);
    e1.scale.y = 0.3; e1.position.set(-0.15, 1.45, 0.5);
    const e2 = e1.clone(); e2.position.set(0.15, 1.45, 0.5);
    group.add(e1, e2);

    // Текст
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256; canvas.height = 100;
    ctx.fillStyle = 'white'; ctx.fillRect(0,0,256,100);
    ctx.fillStyle = '#01579b'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center';
    ctx.fillText(text, 128, 65);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(canvas)}));
    sprite.position.y = 2.2; sprite.scale.set(1.5, 0.6, 1);
    group.add(sprite);

    group.position.set(x, 0, -4);
    group.userData = {id: id};
    scene.add(group);
    return group;
}

function nextRound() {
    // ИИ выбирает: вопрос из учебника или свой
    currentQ = (score > 40) ? SnowAI.generateQuestion() : gameData.getQuestion();
    document.getElementById('qText').innerText = currentQ.q;
    
    snowmen.forEach(s => scene.remove(s));
    snowmen = [createTeenSnowman(-2.2, currentQ.a[0], 0), createTeenSnowman(0, currentQ.a[1], 1), createTeenSnowman(2.2, currentQ.a[2], 2)];
}

window.addEventListener('pointerdown', (e) => {
    const m = new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(m, camera);
    const hits = ray.intersectObjects(snowmen, true);

    if(hits.length > 0) {
        let obj = hits[0].object;
        while(obj.parent !== scene) obj = obj.parent;
        
        if(obj.userData.id === currentQ.ok) {
            score += 10;
            document.getElementById('score-board').innerText = "Puan: " + score;
            nextRound();
        } else {
            new TWEEN.Tween(obj.rotation).to({z: 0.3}, 100).repeat(3).yoyo(true).start();
        }
    }
});

function animate(t) {
    requestAnimationFrame(animate);
    TWEEN.update(t);
    if(this.snowSystem) {
        this.snowSystem.position.y -= 0.02;
        if(this.snowSystem.position.y < -5) this.snowSystem.position.y = 5;
    }
    renderer.render(scene, camera);
}
init();
