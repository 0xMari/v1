import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
// import fragment from './shader/fragment.glsl';
// import fragment from './output.glsl';
// import vertex from './shader/vertex.glsl';
import * as dat from 'dat.gui';
// import gsap from 'gsap';
import brush from './imgs/brush.png';
import bg from './imgs/holo.jpg';

export default class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();
        this.scene2 = new THREE.Scene();


        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        

        this.renderer = new THREE.WebGLRenderer();
        console.log(this.renderer);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.001, 1000);


        this.baseTexture = new THREE.WebGLRenderTarget (
        // new THREE.WebGL3DRenderTarget(
            this.width, this.height, {
                minFilter: THREE.LinearFilter,
                maxFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat

            })


        var frustumSize = this.height;
        var aspect = this.width / this.height ;
        this.camera = new THREE.OrthographicCamera (
            frustumSize * aspect / -2, 
            frustumSize * aspect / 2, 
            frustumSize / 2,
            frustumSize / -2,
            -1000, 1000 )

        this.camera.position.set(0,0,2);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false;
        this.time = 0;
        this.mouse = new THREE.Vector2(0,0);
        this.prevMouse = new THREE.Vector2(0,0);
        this.currentWave = 0;

        this.isPlaying = true;
        this.mouseEvents()
        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();

        
    }

    settings(){
        let that = this;
        this.settings = {
            progress: 0,
        };
        this.gui = new dat.GUI();
        this.gui.add(this,this.settings, "progress", 0, 1, 0.01);
    }


    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;


        this.imageAspect = 853/1280;
        let a1; let a2;
        if(this.height/this.width>this.imageAspect){
            a1 = (this.width/this.height) * this.imageAspect ;
            a2 = 1;
        } else {
            a1 = 1;
            a2 = (this.height/this.width) / this.imageAspect ;
        }

        this.material.uniforms.resolution.value.x = this.width;
        this.material.uniforms.resolution.value.y = this.height;
        this.material.uniforms.resolution.value.z = a1 ;
        this.material.uniforms.resolution.value.w = a2 ;

        this.camera.updateProjectionMatrix();

    }


    mouseEvents(){
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX - this.width/2;
            this.mouse.y = this.height/2 - e.clientY;
            // console.log(this.mouseEvents.x);
        } )
        
    }



    addObjects() {
        let that = this;
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0. },
                uDisplacement: { value: null },
                uTexture: { value: new THREE.TextureLoader().load(bg) },
                resolution: { value: new THREE.Vector4() },
            },

            // vertexShader: vertex,
            // fragmentShader: fragment,
            vertexShader: `
            uniform float time;
            uniform float progress;
            uniform vec4 resolution;
            varying vec2 vUv;
            uniform sampler2D texture1;

            const float pi = 3.1415925;

            void main() {
                vUv = uv;
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_Position = projectionMatrix * mvPosition;
            }
            `,
            fragmentShader: `
            uniform float time;
            uniform float progress;
            uniform sampler2D uTexture;
            uniform sampler2D uDisplacement;
            uniform vec4 resolution;
            varying vec2 vUv;
            varying vec3 vPosition;
            float PI = 3.141592653589793238;
            void main(){
                
                vec4 displacement = texture2D(uDisplacement, vUv);
                float theta = displacement.r *2.*PI;

                vec2 dir = vec2(sin(theta), cos(theta));
                
                vec2 uv = vUv + dir*displacement.r*0.1;

                vec4 color = texture2D( uTexture, uv);
                
                gl_FragColor = color;
                // gl_FragColor = displacement;

            }
            ` 
        });

        this.max = 100;

        // this.material1 = new THREE.MeshBasicMaterial({
        //     // color: 0xff0000,
        //     map: new THREE.TextureLoader().load(brush),
        //     transparent: true,
        // })

        this.geometry = new THREE.PlaneGeometry(20,20,1,1);
        this.geometryFullScreen = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
        this.meshes = []


        for (let i = 0; i < this.max; i++) {
            let m = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(brush),
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false
            })

            let mesh = new THREE.Mesh(
                this.geometry, m 
            )

            mesh.visible = false;

            mesh.rotation.z = 2*Math.PI*Math.random();

            this.scene.add(mesh);

            this.meshes.push(mesh)
        }


        this.quad = new THREE.Mesh(this.geometryFullScreen, this.material);
        this.scene2.add(this.quad);
    }

    stop(){
        this.isPlaying = false;
    }

    play() {
        if(!this.isPlaying){
            this.isPlaying = true;
            this.render()
        }
    }
    setNewWave(x,y,index){
        let m = this.meshes[index];
        m.visible = true;
        m.position.x = x;
        m.position.y = y;
        m.scale.x = m.scale.y = 2;
        m.material.opacity = 0.5;


    }


    tracMousePos(){
        if(Math.abs(this.mouse.x - this.prevMouse.x) < 4 && Math.abs(this.mouse.y - this.prevMouse.y) < 4 ){
            // do nothing
        } else {
            this.setNewWave(this.mouse.x, this.mouse.y, this.currentWave)
            this.currentWave = (this.currentWave + 1) % this.max ;
            

            // console.log(this.currentWave)

        }

        this.prevMouse.x = this.mouse.x;
        this.prevMouse.y = this.mouse.y;

    }

    render(){
        this.tracMousePos()
        if(!this.isPlaying) return;
        this.time += 0.05;
        this.material.uniforms.time.value = this.time;
        requestAnimationFrame(this.render.bind(this));
        this.renderer.setRenderTarget(this.baseTexture);
        this.renderer.render(this.scene, this.camera);
        this.material.uniforms.uDisplacement.value = this.baseTexture.texture;
        this.renderer.setRenderTarget(null);
        this.renderer.clear();
        this.renderer.render(this.scene2, this.camera);

        this.meshes.forEach(mesh => {
            // mesh.position.x = this.mouse.x;
            // mesh.position.y = this.mouse.y;
            if (mesh.visible){
                mesh.rotation.z += 0.02;
                mesh.material.opacity *=0.96;
                mesh.scale.x = 0.982*mesh.scale.x + 0.108;
                mesh.scale.y = 0.982*mesh.scale.y + 0.108;
                if(mesh.material.opacity < 0.002) {mesh.visible=false};
            }
            
        })
    }

}

new Sketch({
    dom: document.getElementById("pippo")
});