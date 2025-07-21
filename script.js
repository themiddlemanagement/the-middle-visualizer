// FULL UPGRADE WITH TOOLTIP, INTERACTIVITY, AND REALISTIC MYCELIUM BACKGROUND

// 🧱 Core Imports and Setup
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// 🌌 Scene Initialization
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 120);

// 🎥 Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 60;

// 🖥️ Renderer Configuration
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('visualizer'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
document.body.appendChild(renderer.domElement);

// 🕹️ Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.zoomSpeed = 0.6;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3; // slowed down rotation

// 🏷️ Tooltip Label
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.color = '#fff';
tooltip.style.background = 'rgba(0,0,0,0.6)';
tooltip.style.padding = '4px 8px';
tooltip.style.fontSize = '12px';
tooltip.style.borderRadius = '4px';
tooltip.style.pointerEvents = 'none';
tooltip.style.display = 'none';
tooltip.style.zIndex = '10';
document.body.appendChild(tooltip);

// 🧠 Realistic Mycelium-Like Background Nodes
const myceliumGroup = new THREE.Group();
scene.add(myceliumGroup);
const myceliumLines = [];
const myceliumPoints = [];

for (let i = 0; i < 150; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    myceliumPoints.push(new THREE.Vector3(x, y, z));
}

for (let i = 0; i < myceliumPoints.length; i++) {
    const p1 = myceliumPoints[i];
    for (let j = i + 1; j < myceliumPoints.length; j++) {
        const p2 = myceliumPoints[j];
        if (p1.distanceTo(p2) < 15) {
            const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            const material = new THREE.LineBasicMaterial({
                color: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`),
                transparent: true,
                opacity: 0.3
            });
            const line = new THREE.Line(geometry, material);
            line.userData.pulseSpeed = Math.random() * 2 + 1;
            line.userData.pulseOffset = Math.random() * Math.PI * 2;
            myceliumGroup.add(line);
            myceliumLines.push(line);
        }
    }
}

// 🌀 Central Torus Core
const coreGeometry = new THREE.TorusKnotGeometry(3, 1, 80, 8);
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core);

// 🔠 Node Definitions (AI, Human, Sensor)
const nodeTypes = [
    { label: "AI", baseHue: 300, floatSpeed: 0.01, pulseSpeed: 2.5, behavior: "spin" },
    { label: "Human", baseHue: 180, floatSpeed: 0.008, pulseSpeed: 3.2, behavior: "shimmer" },
    { label: "Sensor", baseHue: 60, floatSpeed: 0.006, pulseSpeed: 4.1, behavior: "blink" }
];

// 🌐 Node Initialization
const nodes = [], nodeCount = 20;
const nodeGeometry = new THREE.IcosahedronGeometry(0.6, 0);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredNode = null;

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
        behavior: type.behavior,
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

// 🔗 Connections Between Nodes
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

// ⏱️ Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    controls.update();

    // 🌈 Mycelium Glow Pulses (reverse motion)
    myceliumLines.forEach(line => {
        const h = (360 - ((t * 10 + line.userData.pulseOffset * 60) % 360));
        const opacity = 0.2 + 0.1 * Math.sin(-t * line.userData.pulseSpeed + line.userData.pulseOffset);
        line.material.color.setHSL(h / 360, 1, 0.5);
        line.material.opacity = opacity;
    });

    // 🎡 Core Torus Motion + Color Hue Shift
    const hue = (t * 15) % 360;
    coreMaterial.color.setHSL(hue / 360, 1, 0.6);
    core.rotation.x = 0.2 * Math.sin(t * 0.7);
    core.rotation.y = 0.3 * Math.cos(t * 0.5);
    core.rotation.z = 0.15 * Math.sin(t * 1.2 + Math.PI / 4);

    // 🔁 Node Orbits + Visuals
    nodes.forEach((group, index) => {
        const { floatSpeed, pulseSpeed, baseHue, behavior, tOffset } = group.userData;
        const baseRadius = 20;
        const modRadius = baseRadius + 5 * Math.sin(t * 0.5 + tOffset);
        const a = t * floatSpeed + tOffset;
        const b = t * floatSpeed * 1.5 + tOffset;

        group.position.x = modRadius * Math.sin(a) * Math.cos(b);
        group.position.y = modRadius * Math.sin(a) * Math.sin(b);
        group.position.z = modRadius * Math.cos(a);

        const pulse = 1 + 0.15 * Math.sin(t * pulseSpeed + tOffset);
        group.scale.set(pulse, pulse, pulse);

        const hue = (baseHue + t * 60 + index * 5) % 360;
        group.children[1].material.color.setHSL(hue / 360, 1, 0.6);

        if (behavior === "spin") {
            group.rotation.y += 0.01;
        } else if (behavior === "shimmer") {
            group.children[1].material.opacity = 0.7 + 0.2 * Math.sin(t * 4 + tOffset);
        } else if (behavior === "blink") {
            group.visible = Math.sin(t * 3 + tOffset) > 0;
        }
    });

    // 📡 Data Pulses on Connections
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

    // 🏷️ Tooltip Label on Hover
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(nodes.map(n => n.children[0]));
    if (intersects.length > 0) {
        const node = intersects[0].object.parent;
        const { type } = node.userData;
        tooltip.innerText = `Node Type: ${type}`;
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
        tooltip.style.display = 'block';
    } else {
        tooltip.style.display = 'none';
    }

    renderer.render(scene, camera);
}

animate();

// 🔁 Responsive Canvas Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 🖱️ Pointer Tracking
document.addEventListener('pointermove', event => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

