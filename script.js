const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('visualizer') });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.TorusKnotGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true });
const knot = new THREE.Mesh(geometry, material);
scene.add(knot);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    knot.rotation.x += 0.01;
    knot.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

