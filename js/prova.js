import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = null
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 3;
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(container.clientWidth, container.clientHeight);


const controls = new OrbitControls(camera, renderer.domElement);
//controls.enabled = true;


const container = document.getElementById('prova');


// const ambientLight = new THREE.AmbientLight( 0xffffff, 1000);
// ambientLight.position.set(0,2,0);
// scene.add( ambientLight );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

const geometry = new THREE.SphereGeometry();

const material = new THREE.MeshPhysicalMaterial({
    color: 0x4287f5,
    specularColor: 0xffffff,
    transmission: 1,
    thickness: 1,
    roughness: 0,
    iridescence: 1,
    iridescenceIOR: 1.0,

});


const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0,0,0);

scene.add(mesh);

renderer.render(scene, camera);

container.appendChild(renderer.domElement);