uniform float uHeight;
uniform vec3 uColor;
uniform float uPositionY;

varying vec3 vPosition;

vec3 map(vec3 a, vec3 b, float value) {
  return a * value + b * (1. - value);
}

void main() {
  float coloredDepth = 0.2;
  float y = (vPosition.y + uPositionY) / uHeight + 0.5;
  float value = pow(max(0.0, y -1. + coloredDepth) / coloredDepth, 2.);

  vec3 color = map(uColor, vec3(1., 1., 1.), value);


  gl_FragColor = vec4( color.xyz, 1. );
}
