uniform float uHeight;
uniform vec3 uColor;

varying vec3 vPosition;

void main() {
  float y = 0.5 + vPosition.y / uHeight;
  float alpha = pow(y, 2.);

  gl_FragColor = vec4( uColor.xyz, alpha );
}
