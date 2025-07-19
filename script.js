const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 120);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 45;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('visualizer'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);

// Torus Knot (core hub)
const coreGeometry = new THREE.TorusKnotGeometry(3, 1, 80, 8);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

// Node categories
const nodeTypes = [
    { label: "AI", baseHue: 300, floatSpeed: 0.01, pulseSpeed: 2.5 },
    { label: "Human", baseHue: 180, floatSpeed: 0.008, pulseSpeed: 3.2 },
    { label: "Sensor", baseHue: 60, floatSpeed: 0.006, pulseSpeed: 4.1 }
];

const nodes = [];
const ghostClones = [];
const nodeCount = 20;
const nodeGeometry = new THREE.IcosahedronGeometry(0.6, 0);

for (let i = 0; i < nodeCount; i++) {
    const type = nodeTypes[i % nodeTypes.length];

    const coreMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const core = new THREE.Mesh(nodeGeometry, coreMat);

    const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(`hsl(${type.baseHue}, 100%, 60%)`),
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
        baseHue: type.baseHue,
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

// Connections with dynamic geometry
const connections = [];
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });

for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < 0.035) {
            const points = [nodes[i].position.clone(), nodes[j].position.clone()];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial.clone());
            line.userData = { pulseOffset: Math.random() * Math.PI * 2 };
            scene.add(line);
            connections.push({ line, i, j });
        }
    }
}

// Background animation
let bgShift = 0;
const styleEl = document.createElement('style');
styleEl.innerHTML = `
  body, html {
    background: radial-gradient(circle at center, #0d001c, #000000);
    animation: bgFlow 12s ease-in-out infinite alternate;
  }
  @keyframes bgFlow {
    0% { background-position: 50% 50%; filter: hue-rotate(0deg); }
    100% { background-position: 51% 49%; filter: hue-rotate(360deg); }
  }
`;
document.head.appendChild(styleEl);

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Rotate central core
    core.rotation.x += 0.003;
    core.rotation.y += 0.005;

    // Update each node
    nodes.forEach((group, index) => {
        const { floatSpeed, pulseSpeed, baseHue, tOffset } = group.userData;

        // Pulse scale
        const pulse = 1 + 0.15 * Math.sin(t * pulseSpeed + tOffset);
        group.scale.set(pulse, pulse, pulse);

        // Float in space
        group.position.x += floatSpeed * Math.sin(t + tOffset);
        group.position.y += floatSpeed * Math.cos(t + tOffset);

        // Animate glow color (psychedelic hue shift)
        const hue = (baseHue + t * 60 + index * 5) % 360;
        group.children[1].material.color.setHSL(hue / 360, 1, 0.6);

        // Ghost trails
        if (Math.random() < 0.015) {
            const ghost = group.clone();
            ghost.traverse(child => {
                if (child.material) {
                    child.material = child.material.clone();
                    child.material.opacity = 0.15;
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
        ghost.userData.life -= 0.015;
        ghost.traverse(child => {
            if (child.material) child.material.opacity *= 0.95;
        });
        if (ghost.userData.life <= 0) {
            scene.remove(ghost);
            ghostClones.splice(i, 1);
        }
    }

    // Update connection lines with subtle pulsation
    connections.forEach(conn => {
        const p1 = nodes[conn.i].position;
        const p2 = nodes[conn.j].position;

        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const offset = Math.sin(t * 2 + conn.line.userData.pulseOffset) * 0.2;

        const p1_mod = p1.clone().addScaledVector(mid.clone().sub(p1).normalize(), offset);
        const p2_mod = p2.clone().addScaledVector(mid.clone().sub(p2).normalize(), offset);

        const positions = new Float32Array([p1_mod.x, p1_mod.y, p1_mod.z, p2_mod.x, p2_mod.y, p2_mod.z]);
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

