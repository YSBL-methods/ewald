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

function scale(value, min, max, min_scale, max_scale) {
    if (value < min) return min_scale;
    if (value > max) return max_scale;
    const fraction = (value - min) / (max - min);
    return min_scale + fraction * (max_scale - min_scale);
}

const min = 0;
const max = 50;
const spacing = 3;
for (let x = min; x <= max; x += spacing) {
    for (let y = min; y <= max; y += spacing) {
        for (let z = min; z <= max; z += spacing) {
            const dist = Math.abs(Math.sqrt(x * x + y * y + z * z) - sphere_radius);
            const radius = scale(dist, 0, 1, 0.3, 0.05);
            const r = scale(dist, 0, 1, 14, 70);
            const g = scale(dist, 0, 1, 21, 109);
            const b = scale(dist, 0, 1, 5, 29);
            const colour = new THREE.Color(r / 255, g / 255, b / 255);
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
