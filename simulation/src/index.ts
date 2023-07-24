import * as THREE from 'three';
import ModelRenderer from './loader/ModelRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { io } from 'socket.io-client';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let ambientLight = new THREE.AmbientLight(new THREE.Color('hsl(0, 0%, 100%)'), 0.75);
scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer();
const modelRenderer = new ModelRenderer(scene);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const OC = new OrbitControls(camera, renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(0, 0, 0);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.x = 10;
camera.position.z = 10;
camera.position.y = 10;

modelRenderer.loadModelFromFile('./models/ROBOT_L1.json', './models/ROBOT_L1.glb');
modelRenderer.loadModelFromFile('./models/ROBOT_L2.json', './models/ROBOT_L1.glb');
modelRenderer.loadModelFromFile('./models/ROBOT_L3.json', './models/ROBOT_L1.glb');

const ioClient = io();
ioClient.on('update', (data) => {
    for (const { name, rotation, position } of data) {
        const model = modelRenderer.getComponentByName(name);
        model?.setRotation(rotation);
        model?.setTranslation(position);
    }
});

function animate() {
    renderer.render(scene, camera);

    modelRenderer.render();
    const model = modelRenderer.getComponentByName('l1');
    const model2 = modelRenderer.getComponentByName('l2');
    const model3 = modelRenderer.getComponentByName('l3');
    // if (model?.getModel()?.isLoaded()) return;

    // model?.setRotation({ x: model.getRotation().x + 0.01 });
    // model2?.setRotation({ y: model2?.getRotation().y + 0.01 });
    // model3?.setRotation({ x: model3?.getRotation().x - 0.01 });
    // model?.setRotation({ y: model.getRotation().y + 0.01 });
    // model?.setRotation({ z: model.getRotation().z + 0.01 });
    requestAnimationFrame(animate);
}
animate();
