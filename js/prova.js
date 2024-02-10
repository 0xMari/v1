import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import vertShader from '../public/src/Shader/vertex.js';
import fragShader from '../public/src/Shader/fragment.js';
import Time from './Time.js'
import Microphone from './Mic.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass';
import { RenderPass } from 'three/addons/postprocessing/RenderPass';
// import { OutputPass } from 'three/addons/postprocessing/OutputPass';



const scene = new THREE.Scene();
scene.background = null;

const container = document.getElementById('prova');


const camera = new THREE.PerspectiveCamera(50, (container.offsetWidth / container.offsetHeight), 0.1, 15);
camera.position.z = 7;
camera.lookAt(0,0,0);

const axesHelper = new THREE.AxesHelper( 5 );
//axesHelper.setColors(THREE.Color('#ff0000'), THREE.Color('#00ff00'), THREE.Color('#0000ff'));
scene.add( axesHelper );


const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(container.clientWidth, container.clientHeight);


const controls = new OrbitControls(camera, renderer.domElement);

// const ambientLight = new THREE.AmbientLight( 0xffffff, 100);
// ambientLight.position.set(0,2,0);
// scene.add( ambientLight );

// const directionalLight = new THREE.DirectionalLight( 0x00ffff,100);
// directionalLight.position.set(1,0,5);
// scene.add(directionalLight);

const time = new Time();
let offset;

const mic = new Microphone();

const variations = {};
variations.volume = {};
variations.volume.target = 0;
variations.volume.current = 0;
variations.volume.inEase = 0.1;
variations.volume.outEase = 0.01;


const geometry = new THREE.SphereGeometry(1 , 256, 256);

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


offset = {};
offset.spherical = new THREE.Spherical( 1, Math.random() * Math.PI , Math.random() * Math.PI * 2 );
offset.direction = new THREE.Vector3();
offset.direction.setFromSpherical(offset.spherical);


const mat = new THREE.ShaderMaterial({
    uniforms: 
    {
        uTime : {value : 0 },
        uDistortionFrequency : {value : 1.5 },
        uDistortionStrenght : {value : 0.6 },
        uDisplacementFrequency : {value : 2 },
        uDisplacementStrenght : {value : 0.033 },
        uLightAColor: {value : new THREE.Color('#f8a3f8') },
        uLightAPosition: {value : new THREE.Vector3(1, 1, 0)},
        uLightAIntensity : {value : 1 },
        uLightBColor : {value : new THREE.Color('#60aad6')},
        uLightBPosition: {value : new THREE.Vector3(-1, -1, 0)},
        uLightBIntensity : {value : 1},
        uSubdivision : { value : new THREE.Vector2(geometry.parameters.widthSegments , geometry.parameters.heightSegments)},
        uFresnelOffset: {value : 0 },
        uFresnelMultiplier: {value : 1.2},
        uFresnelPower: {value : 3.5 },
        uOffset: {value : new THREE.Vector3() },

        
    },
    defines : 
    {
        USE_TANGENT: '',
    },
    vertexShader: vertShader ,
    fragmentShader: fragShader
});




const mesh = new THREE.Mesh(geometry, mat);
mesh.position.set(0,0,0);

scene.add(mesh);

// post-process


const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
// resolution, strength, radius, threshold
const bloom = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 0.3 , 0.2 , 0);
bloom.enabled = true;

bloom.tintColor = {};
bloom.tintColor.value = '#4100ff';
bloom.tintColor.instance = new THREE.Color(bloom.tintColor.value);

bloom.compositeMaterial.uniforms.uTintColor = {value : bloom.tintColor.instance};
bloom.compositeMaterial.uniforms.uTintStrenght = {value : 0.0};

bloom.compositeMaterial.fragmentShader = `
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
uniform vec3 uTintColor; //vec3(1.0, 0.2, 0.8)
uniform float uTintStrenght; //0.2

float lerpBloomFactor(const in float factor) {
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, bloomRadius);
}

void main() {
    vec4 color = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
        lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
        lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
        lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
        lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );

    color.rgb = mix(color.rgb, uTintColor , uTintStrenght ); //tint all over the scene
    gl_FragColor = vec4(color.rgb, 0.0);
}`


composer.addPass(bloom);

// const outputPass = new OutputPass();

// composer.addPass(outputPass);

function update(){

    // audio variation on distortion strenght
    variations.volume.target = mic.volume;
    
    const easing = variations.volume.target > variations.volume.current ? variations.volume.inEase : variations.volume.outEase;
    variations.volume.current += (variations.volume.target - variations.volume.current) * easing;

    mat.uniforms.uDisplacementStrenght.value = Math.max(0.03, variations.volume.current); 



    const offsetTime = time.elapsed * 0.3;
    offset.spherical.phi = (( (Math.sin(offsetTime * 0.001)) * (Math.sin(offsetTime * 0.00321)) )* 0.5 + 0.5 ) * Math.PI;
    offset.spherical.theta = (( (Math.sin(offsetTime * 0.0001)) * (Math.sin(offsetTime * 0.000321)) )* 0.5 + 0.5 ) * Math.PI * 2;
    offset.direction.setFromSpherical(offset.spherical);
    offset.direction.multiplyScalar(0.01);

    mat.uniforms.uOffset.value.add(offset.direction);
    mat.uniforms.uTime.value += time.delta * 0.0002;

    

}

// animation

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Call the update function
    mic.update();

    update();
    
    
    renderer.render(scene, camera);
    composer.render();
    
}

animate();


container.appendChild(renderer.domElement);