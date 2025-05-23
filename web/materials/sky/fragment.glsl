uniform vec3 uSkyColorLight;
uniform vec3 uSkyColorDark;
uniform vec3 uFogColor;
uniform vec3 uCameraPosition;

varying vec3 vPosition;

void main() {
    vec3 color = mix(
      mix(
        uSkyColorDark, uSkyColorLight, 
        clamp(mix(vPosition.y * 0.4 + 1.0, 1.0 / (1.0 + 0.004 * vPosition.y * vPosition.y), step(0.0, vPosition.y)), 0.0, 1.0)
      ), uFogColor,
      clamp(-uCameraPosition.y, 0.0, 1.0)
    );

    gl_FragColor = vec4(color, 1.0);
}
