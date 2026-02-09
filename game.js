let scene, camera, renderer, snowmen = [], currentQ, score = 0;

function init() {
    scene = new THREE.Scene();
    // Ночная атмосфера как на твоем скриншоте
    scene.background = new THREE.Color(0x0d1a19);
    scene.fog = new THREE.FogExp2(0x0d1a19, 0.15);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Мистический свет (зеленоватый и лунный)
    const moonLight = new THREE.DirectionalLight(0x4ade80, 0.8);
    moonLight.position.set(2, 5, 5);
    scene.add(moonLight, new THREE.AmbientLight(0x1a2f2c, 0.5));

    createMap();
    nextRound();
    animate();
}

function createMap() {
    // Темная "островная" земля
    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(20, 32), 
        new THREE.MeshStandardMaterial({color: 0x162623})
    );
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    // Магический падающий снег
    const points = [];
    for(let i=0; i<1000; i++) points.push(new THREE.Vector3(Math.random()*20-10, Math.random()*10, Math.random()*20-10));
    const snowGeo = new THREE.BufferGeometry().setFromPoints(points);
    const snowMat = new THREE.PointsMaterial({color: 0x4ade80, size: 0.05, transparent: true, opacity: 0.6});
    this.snowSystem = new THREE.Points(snowGeo, snowMat);
    scene.add(this.snowSystem);
}

function createTeenSnowman(x, text, id) {
    const group = new THREE.Group();
    const snowMat = new THREE.MeshStandardMaterial({color: 0xd1fae5});
    
    // Дерзкая поза: голова сильно наклонена
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.6), snowMat);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.4), snowMat);
    h.position.set(0, 1.2, 0.25); 
    group.add(b, h);

    // УСТАЛЫЕ ВЕКИ (Темные, дерзкие)
    const eyelidGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const darkMat = new THREE.MeshStandardMaterial({color: 0x064e3b});
    const e1 = new THREE.Mesh(eyelidGeo, darkMat);
    e1.scale.y = 0.3; e1.position.set(-0.15, 1.35, 0.55);
    const e2 = e1.clone(); e2.position.set(0.15, 1.35, 0.55);
    group.add(e1, e2);

    // Стилизованная табличка (как на твоем дизайне)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256; canvas.height = 100;
    ctx.fillStyle = '#064e3b'; 
    ctx.roundRect ? ctx.roundRect(0, 0, 256, 100, 20) : ctx.rect(0,0,256,100); 
    ctx.fill();
    ctx.fillStyle = '#4ade80'; ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center';
    ctx.fillText(text, 128, 60);
    
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(canvas)}));
    sprite.position.y = 2.3; sprite.scale.set(1.8, 0.7, 1);
    group.add(sprite);

    group.position.set(x, 0, -5);
    group.userData = {id: id};
    scene.add(group);
    return group;
}

// ... (остальной кодRaycaster и анимации остается как в прошлом ответе)
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
            document.getElementById('score-board').innerText = "PUAN: " + score;
            nextRound();
        } else {
            new TWEEN.Tween(obj.rotation).to({z: 0.3}, 100).repeat(3).yoyo(true).start();
        }
    }
});

function nextRound() {
    currentQ = (score > 40) ? SnowAI.generateQuestion() : gameData.getQuestion();
    document.getElementById('qText').innerText = currentQ.q;
    snowmen.forEach(s => scene.remove(s));
    snowmen = [createTeenSnowman(-2.5, currentQ.a[0], 0), createTeenSnowman(0, currentQ.a[1], 1), createTeenSnowman(2.5, currentQ.a[2], 2)];
}

function animate(t) {
    requestAnimationFrame(animate);
    TWEEN.update(t);
    if(this.snowSystem) this.snowSystem.position.y -= 0.01;
    if(this.snowSystem && this.snowSystem.position.y < -5) this.snowSystem.position.y = 5;
    renderer.render(scene, camera);
}
init();
