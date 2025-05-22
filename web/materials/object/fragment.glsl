uniform vec3 uObjectColorLight;
uniform vec3 uObjectColorDark;
uniform vec3 uFogColor;
uniform float uRoughness;
uniform vec3 uCameraPosition;
uniform vec3 uSunPosition;
uniform float uSunIntensity;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    float lightIntensity = uSunIntensity;
    float lightDistance = length(uSunPosition - vPosition);
    vec3 lightDirection = normalize(uSunPosition - vPosition);

    vec3 viewDirection = normalize(uCameraPosition - vPosition);
    float viewDistance = length(uCameraPosition - vPosition);

    vec3 halfVector = normalize(lightDirection + viewDirection);

    float specularFactor = pow(uRoughness + (1.0 - uRoughness) * dot(vNormal, halfVector), 2.0);
    float lightAngleFactor = dot(vNormal, lightDirection);
    float lightDistanceFactor = pow(max(lightDistance, 0.00000001), -2.0);

    float depth = max(-vPosition.y, 0.0);
    float cameraAltitude = max(uCameraPosition.y, 0.0);
    float fogDistance = viewDistance * (depth / max(depth + cameraAltitude, 0.00000001));
    float fogFactor = clamp(1.0 - pow(1.8, -max(fogDistance, 0.00000001)), 0.0, 1.0);

    float lightness = specularFactor * lightAngleFactor * lightDistanceFactor * lightIntensity;

    vec3 color = mix(mix(uObjectColorDark, uObjectColorLight, lightness), uFogColor, fogFactor);

    gl_FragColor = vec4(color, 1.0);
}
