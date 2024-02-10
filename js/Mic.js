export default class Microphone{

    constructor(){

        this.ready = false;
        this.volume = 0;

        navigator.mediaDevices
            .getUserMedia({ audio : true, video: false})
            .then((_stream) => {

                this.stream = _stream
                // console.log('mic');
                // console.log(_stream);

                this.init()
                this.update();

            })
        

        // const pcmData = new Float32Array(analyserNode.fftSize);
        // const onFrame = () => {
        //     analyserNode.getFloatTimeDomainData(pcmData);
        //     let sumSquares = 0.0;
        //     for (const amplitude of pcmData) {sumSquares += amplitude * amplitude ; }
        //     volumeMeterEl.value = Math.sqrt(sumSquares / pcmData.lenght);
        //     window.requestAnimationFrame(onFrame)
        // };

        // window.requestAnimationFrame(onFrame);
        
    }

    init(){
        this.audioContext = new AudioContext();
        
        this.mediaStreamSourceNode = this.audioContext.createMediaStreamSource(this.stream);
        
        
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 128;
        
        this.mediaStreamSourceNode.connect(this.analyserNode);
        
        this.pcmData = new Float32Array(this.analyserNode.fftSize);
        console.log(this.analyserNode.fftSize);
        
        this.ready = true;
    }

    update(){

        if(!this.ready)
            return

        this.analyserNode.getFloatTimeDomainData(this.pcmData);
        console.log(this.pcmData);

        let sumSquares = 0.0;
        for (const amplitude of this.pcmData) {
            sumSquares += amplitude * amplitude
        }
        this.volume = Math.sqrt(sumSquares / this.pcmData.lenght);
        console.log(volume);
    }
}