varying vec3 vWorldPosition;
varying vec3 vNormal;

uniform vec3 uColor;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    value = clamp(value, inMin, inMax);
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

void main() {
    vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
    float brightness = map(dot(vNormal, lightDirection), 0.0, 1.0, 0.8, 1.0);
    vec3 primaryColor = uColor * brightness;

    float positionFactor = clamp(map(vWorldPosition.y, -0.8, 0.0, 0.0, 1.), 0.0, 1.0);
    float fogFactor = map(distance(cameraPosition, vWorldPosition) / 20., 0.0, 1.4, 1., 0.);

    float factor = positionFactor * fogFactor;

    vec3 color = mix(vec3(244.0, 245., 245.) / 255., primaryColor, factor);

    gl_FragColor = vec4(color, 1.0);
}
