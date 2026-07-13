<template>
  <div class="particle-background">
    <canvas ref="canvas" class="particle-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useDark } from '@vueuse/core'

const canvas = ref(null)
let ctx = null
let width = 0
let height = 0
let particles = []
let animationId = null

const isDark = useDark({ selector: 'html' })

// Class for stardust particles floating horizontally (PS3 stardust style)
class StardustParticle {
  constructor() {
    this.reset(true)
  }

  reset(randomX = false) {
    this.x = randomX ? Math.random() * width : -10
    this.y = Math.random() * height
    this.size = Math.random() * 1.5 + 0.6
    this.speed = Math.random() * 0.15 + 0.08
    this.opacity = Math.random() * 0.4 + 0.1
    this.floatOffset = Math.random() * Math.PI * 2
  }

  update(time) {
    this.x += this.speed
    this.y += Math.sin(time * 0.4 + this.floatOffset) * 0.08
    if (this.x > width + 10) {
      this.reset(false)
    }
  }

  draw() {
    if (!ctx) return
    ctx.save()
    ctx.fillStyle = isDark.value ? 'rgba(255, 255, 255, ' : 'rgba(79, 70, 229, '
    ctx.globalAlpha = this.opacity
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// Draw a smooth PS3 XMB style waving ribbon/wave
function drawWave(baseY, amplitude, frequency, speed, offset, strokeColor, fillColor) {
  if (!ctx) return

  const time = Date.now() * 0.001
  ctx.save()

  ctx.beginPath()
  const points = []
  const step = 25
  for (let x = -20; x <= width + step; x += step) {
    // Primary sine wave + secondary cosine wave for organic double-bends
    const wave1 = Math.sin(x * frequency + time * speed + offset) * amplitude
    const wave2 = Math.cos(x * (frequency * 0.45) - time * (speed * 0.25) + offset * 1.3) * (amplitude * 0.35)
    const y = baseY + wave1 + wave2
    points.push({ x, y })
  }

  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const xc = (p1.x + p2.x) / 2
    const yc = (p1.y + p2.y) / 2
    ctx.quadraticCurveTo(p1.x, p1.y, xc, yc)
  }

  // Draw glowing ribbon top line
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1.8
  if (isDark.value) {
    ctx.shadowBlur = 12
    ctx.shadowColor = strokeColor
  }
  ctx.stroke()
  ctx.shadowBlur = 0 // turn off shadow for gradient fill

  // Draw gradient fill area under the wave down to the bottom
  ctx.lineTo(width + 40, height)
  ctx.lineTo(-40, height)
  ctx.closePath()

  const grad = ctx.createLinearGradient(0, baseY - amplitude, 0, height)
  grad.addColorStop(0, fillColor)
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.fill()

  ctx.restore()
}

// Draw shifting background radial gradient
function drawBackgroundGradient() {
  if (!ctx) return

  const time = Date.now() * 0.0004

  // Shifting center coordinates in orbit
  const cx = width / 2 + Math.sin(time * 0.4) * (width * 0.25)
  const cy = height / 2 + Math.cos(time * 0.25) * (height * 0.18)

  const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height))

  if (isDark.value) {
    grad.addColorStop(0, '#0a1128')     // Royal Indigo deep blue
    grad.addColorStop(0.5, '#040612')   // Deep navy slate
    grad.addColorStop(1, '#010206')     // Almost pitch black
  } else {
    grad.addColorStop(0, '#ecfdf5')     // Soft mint
    grad.addColorStop(0.5, '#e0f2fe')   // Soft sky blue
    grad.addColorStop(1, '#f8fafc')     // Crisp slate white
  }

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)
}

function resize() {
  if (!canvas.value) return

  width = canvas.value.width = canvas.value.offsetWidth
  height = canvas.value.height = canvas.value.offsetHeight

  initParticles()
}

function initParticles() {
  particles = []
  const count = Math.min(30, Math.floor((width * height) / 50000))
  for (let i = 0; i < count; i++) {
    particles.push(new StardustParticle())
  }
}

function animate() {
  if (!ctx) return

  // 1. Draw shifting background gradient
  drawBackgroundGradient()

  const time = Date.now() * 0.001

  // 2. Draw 3 distinct overlapping aurora wave ribbons with composite blending
  if (isDark.value) {
    ctx.globalCompositeOperation = 'screen'
  }

  // Wave 1: Emerald/Teal wave
  const stroke1 = isDark.value ? 'rgba(52, 211, 153, 0.45)' : 'rgba(5, 150, 105, 0.25)'
  const fill1 = isDark.value ? 'rgba(16, 185, 129, 0.08)' : 'rgba(209, 250, 229, 0.15)'
  drawWave(height * 0.42, 60, 0.0016, 0.18, 0, stroke1, fill1)

  // Wave 2: Indigo/Purple wave
  const stroke2 = isDark.value ? 'rgba(129, 140, 248, 0.4)' : 'rgba(79, 70, 229, 0.2)'
  const fill2 = isDark.value ? 'rgba(79, 70, 229, 0.06)' : 'rgba(224, 231, 255, 0.12)'
  drawWave(height * 0.50, 80, 0.001, -0.12, Math.PI * 0.5, stroke2, fill2)

  // Wave 3: Cyan/Electric wave
  const stroke3 = isDark.value ? 'rgba(34, 211, 238, 0.4)' : 'rgba(2, 132, 199, 0.2)'
  const fill3 = isDark.value ? 'rgba(6, 182, 212, 0.06)' : 'rgba(224, 242, 254, 0.12)'
  drawWave(height * 0.46, 45, 0.0022, 0.22, Math.PI, stroke3, fill3)

  ctx.globalCompositeOperation = 'source-over'

  // 3. Update and Draw floating stardust particles
  particles.forEach(p => {
    p.update(time)
    p.draw()
  })

  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    resize()
    animate()

    window.addEventListener('resize', resize)
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.particle-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1; /* Rendered above the parent container solid background, but below forms (z-10) */
  pointer-events: none;
}

.particle-canvas {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}
</style>
