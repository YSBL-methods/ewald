const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const sphere_radius = 50;
const segments = 32;
const phi_start = Math.PI / 2;
const phi_length = Math.PI / 2;
const theta_start = 0;
const theta_length = Math.PI / 2;
const sphere_geometry = new THREE.SphereGeometry(
    sphere_radius, segments, segments,
    phi_start, phi_length, theta_start, theta_length);
const sphere_material = new THREE.MeshBasicMaterial({
    color: 0xb2d3c2, transparent: true, opacity: 0.5, side: THREE.DoubleSide
});
const sphere = new THREE.Mesh(sphere_geometry, sphere_material);
scene.add(sphere);

const min = 0;
const max = 50;
const spacing = 3;
for (let x = min; x <= max; x += spacing) {
    for (let y = min; y <= max; y += spacing) {
        for (let z = min; z <= max; z += spacing) {
            const dist = Math.sqrt(x * x + y * y + z * z);
            const on_sphere = (dist > sphere_radius - 1 && dist < sphere_radius + 1);
            const radius = on_sphere ? 0.3 : 0.05;
            const colour = on_sphere ? 0x0e1505 : 0x466d1d;
            const point_geometry = new THREE.SphereGeometry(radius, 8, 8);
            const point_material = new THREE.MeshBasicMaterial({ color: colour });
            const point = new THREE.Mesh(point_geometry, point_material);
            point.position.set(x, y, z);
            scene.add(point);
        }
    }
}

const degrees = 90;
const ratio = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(degrees, ratio, near, far);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(60, 60, 60);
camera.lookAt(25, 25, 25);
controls.target = new THREE.Vector3(25, 25, 25);
controls.update();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
