uniform vec3 uColorLight;
uniform vec3 uColorDark;

varying vec3 vPosition;

void main() {
    float scale = 0.1;
    float altitude = max(vPosition.y, 0.0) * scale;
    float depth = max(-vPosition.y, 0.0) * scale;

    float factor = 0.0;
    if (vPosition.y < 0.0) {
        factor = 1.0 - clamp(depth * 4.0, 0.0, 1.0);
    } else {
        factor = clamp(pow(2.0, -altitude), 0.0, 1.0);
    }

    vec3 color = mix(uColorDark, uColorLight, factor);

    gl_FragColor = vec4(color, 1.0);
}
