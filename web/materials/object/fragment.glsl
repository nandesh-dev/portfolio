uniform vec3 uObjectColorLight;
uniform vec3 uObjectColorDark;
uniform vec3 uFogColor;
uniform float uRoughness;
uniform vec3 uCameraPosition;
uniform vec3 uSunPosition;
uniform float uSunIntensity;

varying vec3 vPosition;
varying vec3 vNormal;

float specularFactor(vec3 lightDirection, vec3 viewDirection) {
  float s = uRoughness * dot(vNormal, normalize(lightDirection + viewDirection)) + 1.0 - uRoughness;
  return s * s;
}

float lightAngleFactor(vec3 lightDirection) {
  float a = dot(vNormal, lightDirection) * 0.5 + 0.5;
  return a / (0.3 * a + 0.7);
}

float lightDistanceFactor(float lightDistance) {
  return 1.0 / (0.00000001 + lightDistance * lightDistance);
}

float fogFactor(float viewDistance) {
    float f = dot(
      vec3(step(0.0, vPosition.y) * step(0.0, uCameraPosition.y), step(vPosition.y, 0.0) * step(uCameraPosition.y, 0.0), step(uCameraPosition.y * vPosition.y, 0.0)), 
      vec3(0.0, 1.0, abs(min(vPosition.y, uCameraPosition.y) / (vPosition.y - uCameraPosition.y)))
    ) * viewDistance * 2.0;

    return clamp(1.0 - 1.0 / (1.0 + 0.75 * f + 0.2 * f * f + 0.1 * f * f * f * f), 0.0, 1.0);
}

void main() {
    float lightDistance = length(uSunPosition - vPosition);
    vec3 lightDirection = normalize(uSunPosition - vPosition);

    vec3 viewDirection = normalize(uCameraPosition - vPosition);
    float viewDistance = length(uCameraPosition - vPosition);

    vec3 color = mix(
      mix(uObjectColorDark, uObjectColorLight, clamp(specularFactor(lightDirection, viewDirection) * lightAngleFactor(lightDirection) * lightDistanceFactor(lightDistance) * uSunIntensity, 0.0, 1.0)),
      uFogColor,
      fogFactor(viewDistance)
    );

    gl_FragColor = vec4(color, 1.0);
}
