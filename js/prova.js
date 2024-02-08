import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils';
import vertShader from '../public/src/Shader/vertex.js';
import fragShader from '../public/src/Shader/fragment.js';
import Time from './Time.js'

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 15);
camera.position.z = 5;
camera.lookAt(0,0,0);

const container = document.getElementById('prova');

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(container.clientWidth, container.clientHeight);


// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enabled = true;


const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight( 0xffffff, 100);
ambientLight.position.set(0,2,0);
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight( 0x00ffff,100);
directionalLight.position.set(1,0,5);
scene.add(directionalLight);

const time = new Time();


const geometry = new THREE.SphereGeometry(1 , 512, 512);

geometry.computeTangents();


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
    wireframe: true,
    iridescence: 1,
    iridescenceIOR: 1.0,

});


const mat = new THREE.ShaderMaterial({
    uniforms: 
    {
        uTime : {value : 0 },
        uDistortionFrequency : {value : 2.0},
        uDistortionStrenght : {value : 1.0},
        uDisplacementFrequency : {value : 2.0},
        uDisplacementStrenght : {value : 0.2},
        
    },
    defines : 
    {
        USE_TANGENT: '',
    },
    vertexShader: vertShader ,
    fragmentShader: fragShader
});

function updateTime(){
    mat.uniforms.uTime.value += time.delta * 0.0001;
}


const mesh = new THREE.Mesh(geometry, mat);
mesh.position.set(0,0,0);

scene.add(mesh);

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Call the update function
    updateTime();
    renderer.render(scene, camera);
}
animate();




container.appendChild(renderer.domElement);