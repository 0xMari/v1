import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils';


const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 3;
camera.lookAt(0,0,0);

const container = document.getElementById('prova');

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(container.clientWidth, container.clientHeight);


const controls = new OrbitControls(camera, renderer.domElement);
//controls.enabled = true;




const ambientLight = new THREE.AmbientLight( 0xffffff, 100);
ambientLight.position.set(0,2,0);
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0x00ffff, 50);
directionalLight.position.set(10,-10,-10);
scene.add(directionalLight);



const geometry = new THREE.SphereGeometry(1.2 , 64);


const material = new THREE.MeshPhysicalMaterial({
    color: 0x4287f5,
    specularColor: 0xffffff,
    transparent: true,
    opacity: 0.2,
    emissive: 0xc646c8,
    transmission: 1,
    thickness: 1,
    roughness: 0,
    metalness: 0.5,
    reflectivity: 0.5,
    ior: 2.3,
    // wireframe: true,
    iridescence: 1,
    iridescenceIOR: 1.0,

});


const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0,0,0);

scene.add(mesh);

const geometry2 = new THREE.SphereGeometry(0.15);

const material2 = new THREE.MeshPhysicalMaterial({
    color: 0xf252c5,
    roughness: 1,
    opacity:1,
    ior: 0.5,
    reflectivity:0.5,
});

const mesh2 = new THREE.Mesh(geometry2, material2);
mesh2.position.set(0,0,0);

scene.add(mesh2);

const geometry3 = new THREE.TorusKnotGeometry(0.65, 0.15, 64, 8, 2, 3);
const material3 = new THREE.MeshPhysicalMaterial({
    color: 0x211c1f,
    roughness:0,
    opacity:1,
    ior: 0.5,
    reflectivity: 0,
    metalness: 0
});

const mesh3 = new THREE.Mesh(geometry3, material3);
mesh3.position.set(0,0,0);

scene.add(mesh3);



renderer.render(scene, camera);

container.appendChild(renderer.domElement);