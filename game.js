let scene, camera, renderer, currentQuestion, snowmen = [], score = 0;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaedefc);
    scene.fog = new THREE.Fog(0xaedefc, 2, 25);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Свет
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(5, 10, 5);
    scene.add(sun, new THREE.AmbientLight(0xffffff, 0.4));

    // Дизайн карты: Снег и здания
    createEnvironment();
    
    // Руки героя (вид от 1 лица)
    createHands();

    camera.position.set(0, 1.6, 3);
    
    nextRound();
    animate();
}

function createEnvironment() {
    // Земля
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({color: 0xffffff}));
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    // Здания (простые мультяшные кубы)
    for(let i=0; i<10; i++) {
        const h = 2 + Math.random() * 5;
        const b = new THREE.Mesh(new THREE.BoxGeometry(2, h, 2), new THREE.MeshStandardMaterial({color: 0xbbdefb}));
        b.position.set(Math.random()*20-10, h/2, -Math.random()*15-5);
        scene.add(b);
    }

    // Падающий снег (частицы)
    const snowGeo = new THREE.BufferGeometry();
    const snowCoords = [];
    for(let i=0; i<1000; i++) {
        snowCoords.push(Math.random()*20-10, Math.random()*10, Math.random()*20-10);
    }
    snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(snowCoords, 3));
    const snowPoints = new THREE.Points(snowGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.1}));
    scene.add(snowPoints);
    this.snowLayer = snowPoints;
}

function createHands() {
    const handMat = new THREE.MeshStandardMaterial({color: 0x5d4037});
    const handL = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.4), handMat);
    handL.position.set(-0.5, 0.8, 2);
    handL.rotation.x = Math.PI/3;
    camera.add(handL);
    scene.add(camera);
}

function createDerzkiySnowman(x, text, id) {
    const group = new THREE.Group();
    const snowMat = new THREE.MeshStandardMaterial({color: 0xfaffff, roughness: 1});
    
    // Дерзкая осанка
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), snowMat);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), snowMat);
    head.position.y = 1.3; head.position.z = 0.1;
    group.add(body, head);

    // Уставшие веки (Твоя просьба)
    const eyeMat = new THREE.MeshStandardMaterial({color: 0x222222});
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
    eye.scale.y = 0.3; // Прищуренный взгляд
    
    const e1 = eye.clone(); e1.position.set(-0.15, 1.4, 0.45);
    const e2 = eye.clone(); e2.position.set(0.15, 1.4, 0.45);
    group.add(e1, e2);

    // Нос
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2), new THREE.MeshStandardMaterial({color: "orange"}));
    nose.position.set(0, 1.3, 0.5); nose.rotation.x = Math.PI/2;
    group.add(nose);

    // Табличка
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256; canvas.height = 64;
    ctx.fillStyle = 'white'; ctx.fillRect(0,0,256,64);
    ctx.fillStyle = 'black'; ctx.font = '32px Arial'; ctx.textAlign = 'center';
    ctx.fillText(text, 128, 45);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(canvas)}));
    sprite.position.y = 2; sprite.scale.set(1.5, 0.4, 1);
    group.add(sprite);

    group.position.set(x, 0, -3);
    group.userData = {id: id};
    scene.add(group);
    return group;
}

function nextRound() {
    currentQuestion = gameData.getRandomQuestion();
    document.getElementById('qText').innerText = currentQuestion.q;
    snowmen.forEach(s => scene.remove(s));
    snowmen = [];
    const pos = [-2, 0, 2];
    currentQuestion.a.forEach((txt, i) => {
        snowmen.push(createDerzkiySnowman(pos[i], txt, i));
    });
}

window.addEventListener('pointerdown', (e) => {
    const mouse = new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(snowmen, true);

    if(hits.length > 0) {
        let obj = hits[0].object;
        while(obj.parent !== scene) obj = obj.parent;
        
        if(obj.userData.id === currentQuestion.ok) {
            score += 10;
            document.getElementById('score').innerText = "Puan: " + score;
            nextRound();
        } else {
            new TWEEN.Tween(obj.rotation).to({z: 0.2}, 100).repeat(3).yoyo(true).start();
        }
    }
});

function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
    if(this.snowLayer) this.snowLayer.position.y -= 0.01;
    if(this.snowLayer && this.snowLayer.position.y < -5) this.snowLayer.position.y = 0;
    renderer.render(scene, camera);
}

init();
