// Scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('visualizer') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Central torus knot (data core)
const coreGeometry = new THREE.TorusKnotGeometry(5, 1.5, 200, 32);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

// Floating nodes
const nodes = [];
const nodeCount = 40;
const nodeGeometry = new THREE.SphereGeometry(0.8, 16, 16);
const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });

for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    node.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 80
    );
    scene.add(node);
    nodes.push(node);
}

// Connection lines
const connections = [];
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });

for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < 0.07) {
            const points = [nodes[i].position.clone(), nodes[j].position.clone()];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial.clone());
            scene.add(line);
            connections.push({ line, i, j });
        }
    }
}

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Rotate core
    core.rotation.x += 0.005;
    core.rotation.y += 0.007;

    // Move nodes slowly (simulate data shifting)
    nodes.forEach(node => {
        node.position.x += 0.01 * (Math.random() - 0.5);
        node.position.y += 0.01 * (Math.random() - 0.5);
        node.position.z += 0.01 * (Math.random() - 0.5);
    });

    // Update line connections
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

