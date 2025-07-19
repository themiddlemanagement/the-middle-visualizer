const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 120);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 45;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('visualizer'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);

// Core data knot
const coreGeometry = new THREE.TorusKnotGeometry(3, 1, 80, 8);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

// Node types
const nodeTypes = [
    { label: "AI", color: 0xff0044, floatSpeed: 0.01, pulseSpeed: 2.5 },
    { label: "Human", color: 0x00ffff, floatSpeed: 0.008, pulseSpeed: 3.2 },
    { label: "Sensor", color: 0xffff00, floatSpeed: 0.006, pulseSpeed: 4.1 }
];

const nodes = [];
const nodeCount = 20;
const ghostClones = [];

const nodeGeometry = new THREE.IcosahedronGeometry(0.6, 0);

for (let i = 0; i < nodeCount; i++) {
    const type = nodeTypes[i % nodeTypes.length];

    const coreMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const core = new THREE.Mesh(nodeGeometry, coreMat);

    const glowMat = new THREE.MeshBasicMaterial({
        color: type.color,
        wireframe: true,
        transparent: true,
        opacity: 0.85
    });
    const glow = new THREE.Mesh(nodeGeometry.clone(), glowMat);
    glow.scale.set(1.4, 1.4, 1.4);

    const group = new THREE.Group();
    group.add(core);
    group.add(glow);

    group.userData = {
        type: type.label,
        floatSpeed: type.floatSpeed,
        pulseSpeed: type.pulseSpeed,
        baseScale: 1,
        tOffset: Math.random() * 10
    };

    group.position.set(
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 70,
        (Math.random() - 0.5) * 70
    );

    scene.add(group);
    nodes.push(group);
}

// Light connections
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

// Animate
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    // Core rotation
    core.rotation.x += 0.003;
    core.rotation.y += 0.005;

    // Nodes: pulse and float
    nodes.forEach((group, index) => {
        const { floatSpeed, pulseSpeed, tOffset } = group.userData;

        // Float like data drifting
        group.position.x += floatSpeed * Math.sin(t + tOffset);
        group.position.y += floatSpeed * Math.cos(t + tOffset);

        // Pulse scale
        const pulse = 1 + 0.15 * Math.sin(t * pulseSpeed + tOffset);
        group.scale.set(pulse, pulse, pulse);

        // Trail ghost
        if (Math.random() < 0.01) {
            const ghost = group.clone();
            ghost.material = undefined;
            ghost.traverse(child => {
                if (child.material) {
                    child.material = child.material.clone();
                    child.material.opacity = 0.2;
                    child.material.transparent = true;
                }
            });
            ghost.position.copy(group.position);
            ghost.scale.copy(group.scale);
            ghost.userData.life = 1.0;
            scene.add(ghost);
            ghostClones.push(ghost);
        }
    });

    // Fade ghost trails
    for (let i = ghostClones.length - 1; i >= 0; i--) {
        const ghost = ghostClones[i];
        ghost.userData.life -= 0.02;
        ghost.traverse(child => {
            if (child.material) child.material.opacity *= 0.96;
        });
        if (ghost.userData.life <= 0) {
            scene.remove(ghost);
            ghostClones.splice(i, 1);
        }
    }

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
