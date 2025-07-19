// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 150);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 55;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('visualizer'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);

// Add glowing core
const coreGeometry = new THREE.TorusKnotGeometry(3, 1, 128, 16);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

// Create point light that pulses
const pulseLight = new THREE.PointLight(0xff00ff, 1.5, 100);
pulseLight.position.set(0, 0, 0);
scene.add(pulseLight);

// Nodes
const nodes = [];
const nodeCount = 50;
const nodeGeometry = new THREE.SphereGeometry(0.6, 12, 12);

for (let i = 0; i < nodeCount; i++) {
    const color = new THREE.Color(`hsl(${Math.random() * 360}, 100%, 70%)`);
    const material = new THREE.MeshBasicMaterial({ color });
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
    scene.add(node);
    nodes.push(node);
}

// Connection lines
const connections = [];
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });

for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < 0.06) {
            const points = [nodes[i].position.clone(), nodes[j].position.clone()];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial.clone());
            scene.add(line);
            connections.push({ line, i, j });
        }
    }
}

// Animate
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    let t = clock.getElapsedTime();

    // Rotate the core
    core.rotation.x += 0.002;
    core.rotation.y += 0.004;

    // Pulse the light
    pulseLight.intensity = 1.5 + Math.sin(t * 3) * 0.5;

    // Gently move nodes like floating particles
    nodes.forEach((node, i) => {
        node.position.x += 0.01 * Math.sin(t + i);
        node.position.y += 0.01 * Math.cos(t + i);
    });

    // Update lines
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
