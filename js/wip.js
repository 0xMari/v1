import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



import { addPass, useCamera, useGui, useRenderSize, useRenderer, useScene, useTick } from './init.js'


const startApp = () => {

    const scene = useScene();
    // scene.background = new THREE.Color(0xffbe98);
    const container = document.getElementById('wip');
    const camera = useCamera();
    const renderer = useRenderer();
    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enabled = true;
    controls.enabled = false;

    const { width, height } = useRenderSize()

    const testGeo = new THREE.PlaneGeometry(25,10);
    const testMat = new THREE.MeshBasicMaterial( {color: 0xFFDBff, side: THREE.DoubleSide, map: setupTexturePlane(),} );
    const testPlane = new THREE.Mesh( testGeo, testMat );
    testPlane.position.z = -10;
    testPlane.position.y = 0;


    function setupLights(){
        // Add light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        scene.add(directionalLight);
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
    };


    function setupTexture(){
        const textureLoader = new THREE.TextureLoader();
        let textureEquirec;
        textureEquirec = textureLoader.load( '../imgs/holo2.jpg' );
        textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
        textureEquirec.colorSpace = THREE.SRGBColorSpace;
        
        
        const hdr = new RGBELoader().load( '../imgs/sepulchral_chapel_rotunda_2k.hdr' , function(){
            hdr.mapping = THREE.EquirectangularReflectionMapping;
        });

        return textureEquirec;
    };

    function setupTexturePlane(){
        const textureLoader = new THREE.TextureLoader();
        let textureEquirec;
        textureEquirec = textureLoader.load( '../imgs/holo.jpg' );
        textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
        textureEquirec.colorSpace = THREE.SRGBColorSpace;
        
        
        const hdr = new RGBELoader().load( '../imgs/sepulchral_chapel_rotunda_2k.hdr' , function(){
            hdr.mapping = THREE.EquirectangularReflectionMapping;
        });

        return textureEquirec;
    };

    const group = new THREE.Group();

    const geometry = new THREE.TorusGeometry(1, 0.25, 128, 64); 

    const material = new THREE.MeshPhysicalMaterial({
        transmission: 1,
        thickness: 0.15,
        roughness: 0,
        ior: 2.33,
        
        iridescence: 1,
        iridescenceIOR: 1.8,
        

        envMap: setupTexture(),
        
        
    });
    
    
    const material2 = new THREE.MeshPhysicalMaterial({
        // transmission: 1,
        // thickness: 1.2,
        roughness: 0,
        ior: 2.33,
        color: 0xB091F2,
        // iridescence: 1,
        // iridescenceIOR: 1.8,
        

        envMap: setupTexture(),
        
        
    });

    const toro = new THREE.Mesh(geometry, material);
    group.add(toro);

    toro.position.x = 0;
    toro.position.y = 0;
    toro.position.z = 0;
    // toro.rotation.x = -Math.PI/3;
    // toro.rotation.y = -Math.PI/10;
    toro.rotation.x = Math.PI/2;

    const loader = new GLTFLoader();
    loader.load("../public/src/bubbletext.glb", (gltf) => {
        const text = gltf.scene;
        text.position.x = 0.04;
        text.position.z = -5;
        console.log(text.position);
        text.scale.x = 1.4;
        text.scale.y = 0.88;  
        // text.position.y= - 3;
        // text.rotation.y = 3 * Math.PI / 4  ;
        // text.position.x = 0;
        // text.position.z = 0;

        text.traverse( ( child ) => {
            if ( child instanceof THREE.Mesh ) {
                child.material = material2
                //console.log(child.material)
                child.castShadow = true;
                child.receiveShadow = true
            }
        })
    
    
    
        scene.add(text);
    
    });

    const matText = new THREE.MeshPhysicalMaterial({
        color: 0x821bf7,
        roughness: 0,
    });

    const loader2 = new GLTFLoader();
    loader2.load("../public/src/torustest1.glb", (gltf) => {
        const torus = gltf.scene.children[0];
        torus.position.x = 0;
        torus.position.z = 0;
        torus.scale.x = torus.scale.y = torus.scale.z = 0.65;
        // torus.scale.x = 1.4;
        // torus.scale.y = 0.88;  
        // torus.position.y= - 3;
        // torus.rotation.y = 3 * Math.PI / 4  ;
        // torus.position.x = 0;
        // torus.position.z = 0;

        torus.traverse( ( child ) => {
            if ( child instanceof THREE.Mesh ) {
                child.material = matText
                //console.log(child.material)
                child.castShadow = true;
                child.receiveShadow = true
            }
        })
        group.add(torus);
        //scene.add(torus);
    
    });

    group.rotation.x = -Math.PI/3;
    group.rotation.y = -Math.PI/10;

    function animate() {
        requestAnimationFrame(() => animate());

        group.rotation.x += 0.001;
        group.rotation.y -= 0.005;
        
    };

    const renderTargetParameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        stencilBuffer: false,
    }

    // postprocessing
    //addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4))

    useTick(({ timestamp, timeDiff }) => {
        const time = timestamp / 5000
    })


    function init(){
        setupLights();
        scene.add(group);
        //scene.add(testPlane);

        animate();
        
    }

    init();


    container.appendChild(renderer.domElement);

}

export default startApp;