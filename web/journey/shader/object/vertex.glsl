varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vFogDepth;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    vWorldPosition = worldPosition.xyz;
    vNormal = normal;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
