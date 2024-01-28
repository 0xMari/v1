import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// import sfera from '../src/sfera3.gltf';
const scene = new THREE.Scene();
let mixer, clock;
clock = new THREE.Clock;
// scene.environment.set('./src/holo.webp');
scene.background = null //new THREE.Color('transparent')
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.position.set(10, 0, 0);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({ alpha: true });
const controls = new OrbitControls(camera, renderer.domElement);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const container = document.getElementById('sphere3d')

renderer.setSize(container.offsetWidth, container.offsetHeight);

const ambientLight = new THREE.AmbientLight( 0xffffff, 1);
ambientLight.position.set(0,2,0);
scene.add( ambientLight );

const dirLight = new THREE.DirectionalLight( 0xffc4fa, 30 );
dirLight.position.set( 10, 10, 10 );
scene.add( dirLight );

const options = {
    transmission: 1,
    thickness: 1,
    roughness: 0,
};






// glass material
const material = new THREE.MeshPhysicalMaterial({
    transmission: options.transmission,
    thickness: options.thickness,
    roughness: options.roughness,
  });



// Load the 3D model
const loader = new GLTFLoader();
loader.load('./src/basta1.gltf', (gltf) => {
    const model = gltf.scene;
    // const palla = model.children.find((mesh) => mesh.name === "Sphere.001");
    // const geo = palla.geometry.clone();
    

    // const mesh = new THREE.Mesh(geo, material);
    // scene.add(mesh);

    scene.add(model);
    
    mixer = new THREE.AnimationMixer( model );
        
    gltf.animations.forEach( ( clip ) => {
        
        mixer.clipAction( clip ).play();
        
    } );
});



// Render the scene
const animate = () => {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
  
    if ( mixer ) mixer.update( delta );

    renderer.render(scene, camera);
    
};

animate();
document.getElementById('sphere3d').appendChild(renderer.domElement);