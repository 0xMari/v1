const fragment = `


varying vec3 vNormal;
varying float vPerlinStrenght;
varying vec3 vColor;

void main(){

    float temp = vPerlinStrenght + 0.5;
    temp *= 0.5;

    // gl_FragColor = vec4 (temp, temp, temp, 1.0);
    gl_FragColor = vec4 (vColor, 1.0);
}
`;

export default fragment;