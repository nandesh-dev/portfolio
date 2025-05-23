uniform vec3 uColorLight;
uniform vec3 uColorDark;

varying vec3 vPosition;

void main() {
    vec3 color = mix(
      uColorDark, uColorLight, 
      clamp(mix(vPosition.y * 0.4 + 1.0, 1.0 / (1.0 + 0.004 * vPosition.y * vPosition.y), step(0.0, vPosition.y)), 0.0, 1.0)
    );

    gl_FragColor = vec4(color, 1.0);
}
