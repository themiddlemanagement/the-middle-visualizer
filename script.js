// Scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 40;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('visualizer') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Nodes
const nodes = [];
const nodeCount = 40;
const geometry = new THREE.SphereGeometry(0.8, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 0x00ffcc });

for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(geometry, material.clone());
    node.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
    );
    scene.add(node);
    nodes.push(node);
}

// Lines (connections)
const connections = [];
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.5 });

for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < 0.08) {
            const points = [nodes[i].position, nodes[j].position];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial.clone());
            scene.add(line);
            connections.push(line);
        }
    }
}

// Animate
function animate() {
    requestAnimationFrame(animate);

    // Rotate each node slightly
    nodes.forEach(node => {
        node.position.x += 0.02 * (Math.random() - 0.5);
        node.position.y += 0.02 * (Math.random() - 0.5);
        node.position.z += 0.02 * (Math.random() - 0.5);
    });

    // Update line geometry
    connections.forEach(line => {
        const positions = line.geometry.attributes.position.array;
        positions[0] += 0.02 * (Math.random() - 0.5);
        positions[1] += 0.02 * (Math.random() - 0.5);
        positions[2] += 0.02 * (Math.random() - 0.5);
        positions[3] += 0.02 * (Math.random() - 0.5);
        positions[4] += 0.02 * (Math.random() - 0.5);
        positions[5] += 0.02 * (Math.random() - 0.5);
        line.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
