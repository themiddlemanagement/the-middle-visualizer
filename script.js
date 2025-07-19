// Scene, camera, and renderer
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 120);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 45;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('visualizer'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);

// Torus Knot (data core)
const coreGeometry = new THREE.TorusKnotGeometry(3, 1, 80, 8);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

// Nodes (Akira-inspired style)
const nodes = [];
const nodeCount = 20;
const nodeGeometry = new THREE.IcosahedronGeometry(0.7, 0); // angular and minimal

for (let i = 0; i < nodeCount; i++) {
    // Dark inner core
    const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const core = new THREE.Mesh(nodeGeometry, coreMaterial);

    // Neon glow shell
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(`hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`),
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });

    const glow = new THREE.Mesh(nodeGeometry.clone(), glowMaterial);
    glow.scale.set(1.4, 1.4, 1.4);

    // Combine into a group
    const group = new THREE.Group();
    group.add(core);
    group.add(glow);

    group.position.set(
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 70
    );

    scene.add(group);
    nodes.push(group);
}


// Fewer connections
const connections = [];
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });

for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < 0.03) {
            const points = [nodes[i].position.clone(), nodes[j].position.clone()];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial.clone());
            scene.add(line);
            connections.push({ line, i, j });
        }
    }
}

// Animation
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    let t = clock.getElapsedTime();

    // Core rotation
    core.rotation.x += 0.003;
    core.rotation.y += 0.005;

    // Gentle node float
    nodes.forEach((node, i) => {
        const offset = i * 0.1;
        node.position.x += 0.005 * Math.sin(t + offset);
        node.position.y += 0.005 * Math.cos(t + offset);
    });

    // Update connection lines
    connections.forEach(conn => {
        const p1 = nodes[conn.i].position;
        const p2 = nodes[conn.j].position;
        const positions = new Float32Array([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]);
        conn.line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        conn.line.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

