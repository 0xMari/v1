import * as THREE from 'three';
import { Water } from './Water.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export default class Sea{
    constructor(options){
        this.scene = this.createScene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.001, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.waterGeometry = new THREE.PlaneGeometry(60, 60, 20, 20);
        this.water = this.createWater();

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(this.width, this.height);

        this.container.appendChild(this.renderer.domElement);
        


        this.init()
    }

    init(){
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();

        this.scene.add(this.water);

        this.animate();
    }


    // Set up scene
    
    
    
    setupRenderer(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    setupCamera(){
        this.camera.position.set(0, 1, 10);

    }

    setupLights(){
        // Add light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.scene.add(directionalLight);
    }

    setupControls(){
        // Add controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
    }



    setupEventListeners(){
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    animate() {
        requestAnimationFrame(() => this.animate());
        // Update water material
        this.water.material.uniforms['time'].value += 1.0/(60.0*10.0);
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    };

    // Water
    
    createWater(){
        const water = new Water(this.waterGeometry, {
            waterColor: 0x0040ff,
            sunColor: 0xffffff,
            scale: 1,
            flowDirection: new THREE.Vector2(0, -10),
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( './imgs/water_0342normal.jpg', function(texture){
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            } ),
            distortionScale: 20,
            alpha: 0.75,
        });
        water.rotation.x = -Math.PI / 2;
        this.scene.add(water);

        return water;
    };

    createScene(){
        const scene = new THREE.Scene();
        scene.background= new THREE.Color(0xFFDBFF);
        //scene.fog = new THREE.Fog( 0x74ccf4, 7, 25 );

        return scene;
    };   

}


new Sea({
    dom: document.getElementById("sea")
});