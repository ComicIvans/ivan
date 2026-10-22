<!--
  Adapted from the Aurora background of Vue Bits
  (https://github.com/DavidHDev/vue-bits). This file is distributed under the
  upstream license quoted at the top of the script block, not under the MIT
  License of the rest of this repository. The notice is a /*! */ comment so
  that it also ships in the built JavaScript.
-->

<template>
  <div ref="ctnDom" class="aurora-container" aria-hidden="true" />
</template>

<script setup lang="ts">
/*!
 * Aurora background, adapted from Vue Bits (https://github.com/DavidHDev/vue-bits).
 * This component is distributed under the upstream license below, not under
 * the MIT License of the rest of this repository.
 *
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2025 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software as part of
 * an application, website, or product, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * Commons Clause Restriction
 *
 * You may use this Software, including for any commercial purpose, so long as
 * you do not sell, sublicense, or redistribute the components themselves-whether
 * alone, in a bundle, template, or as a ported version.
 *
 * No Warranty
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Runs a single fullscreen-triangle OGL shader; rendering pauses while
// the element is off-screen or the tab is hidden to save GPU/battery. Mount it
// behind <ClientOnly> and never for reduced-motion users.
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { auroraColorStops } from '~~/shared/constants/theme'

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \\
  int index = 0;                                            \\
  for (int i = 0; i < 2; i++) {                               \\
     ColorStop currentColor = colors[i];                    \\
     bool isInBetween = currentColor.position <= factor;    \\
     index = int(mix(float(index), float(i), float(isInBetween))); \\
  }                                                         \\
  ColorStop currentColor = colors[index];                   \\
  ColorStop nextColor = colors[index + 1];                  \\
  float range = nextColor.position - currentColor.position; \\
  float lerpFactor = (factor - currentColor.position) / range; \\
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \\
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`

interface AuroraProps {
  colorStops?: string[]
  amplitude?: number
  blend?: number
  speed?: number
}

const props = withDefaults(defineProps<AuroraProps>(), {
  colorStops: () => [...auroraColorStops.light],
  amplitude: 1.0,
  blend: 0.5,
  speed: 1.0,
})

const ctnDom = ref<HTMLDivElement | null>(null)

let animateId = 0
let renderer: InstanceType<typeof Renderer> | null = null
let program: InstanceType<typeof Program> | null = null
let mesh: InstanceType<typeof Mesh> | null = null
let resizeHandler: (() => void) | null = null
let visibilityHandler: (() => void) | null = null
let intersectionObserver: IntersectionObserver | null = null
let inViewport = true

// Converted once per colour change (e.g. a colour mode switch), not per frame.
const colorStopValues = computed(() =>
  props.colorStops.map((hex) => {
    const c = new Color(hex)
    return [c.r, c.g, c.b]
  })
)

const startLoop = () => {
  if (animateId) return
  const update = (t: number) => {
    animateId = requestAnimationFrame(update)
    if (!program || !renderer || !mesh) return
    program.uniforms.uTime.value = t * 0.01 * props.speed * 0.1
    program.uniforms.uAmplitude.value = props.amplitude
    program.uniforms.uBlend.value = props.blend
    program.uniforms.uColorStops.value = colorStopValues.value
    renderer.render({ scene: mesh })
  }
  animateId = requestAnimationFrame(update)
}

const stopLoop = () => {
  if (!animateId) return
  cancelAnimationFrame(animateId)
  animateId = 0
}

const syncLoop = () => {
  if (inViewport && !document.hidden) startLoop()
  else stopLoop()
}

onMounted(() => {
  const ctn = ctnDom.value
  if (!ctn) return

  renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true })
  const gl = renderer.gl
  gl.clearColor(0, 0, 0, 0)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.canvas.style.backgroundColor = 'transparent'

  resizeHandler = () => {
    if (!ctn || !renderer) return
    renderer.setSize(ctn.offsetWidth, ctn.offsetHeight)
    if (program) {
      program.uniforms.uResolution.value = [ctn.offsetWidth, ctn.offsetHeight]
    }
  }
  window.addEventListener('resize', resizeHandler)

  const geometry = new Triangle(gl)
  if (geometry.attributes.uv) {
    delete geometry.attributes.uv
  }

  program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: props.amplitude },
      uColorStops: { value: colorStopValues.value },
      uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
      uBlend: { value: props.blend },
    },
  })

  mesh = new Mesh(gl, { geometry, program })
  ctn.appendChild(gl.canvas)

  intersectionObserver = new IntersectionObserver((entries) => {
    inViewport = entries.some((entry) => entry.isIntersecting)
    syncLoop()
  })
  intersectionObserver.observe(ctn)

  visibilityHandler = syncLoop
  document.addEventListener('visibilitychange', visibilityHandler)

  resizeHandler()
  syncLoop()
})

onUnmounted(() => {
  stopLoop()
  intersectionObserver?.disconnect()
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler)
  if (renderer) {
    const ctn = ctnDom.value
    const canvas = renderer.gl.canvas
    if (ctn && canvas.parentNode === ctn) {
      ctn.removeChild(canvas)
    }
    renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
  renderer = null
  program = null
  mesh = null
})
</script>

<style scoped>
.aurora-container {
  width: 100%;
  height: 100%;
}

.aurora-container :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
