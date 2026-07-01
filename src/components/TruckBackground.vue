<script setup>
import { onMounted, onUnmounted } from 'vue'

// 3D Scene elements
let canvas, ctx, animationId
let trucks = []
const mouse = { x: null, y: null }

// Colors
const colors = {
  truckBody: ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'],
  truckCabin: ['#1E40AF', '#4338CA', '#6D28D9', '#BE185D'],
  wheel: '#374151',
  ground: 'rgba(139, 92, 246, 0.1)',
  road: '#374151', // Dark asphalt
  roadMarking: '#F3F4F6', // White lines
  shadow: 'rgba(0, 0, 0, 0.25)'
}

// Simple 3D projection
const project3D = (x, y, z, centerX, centerY) => {
  // Perspective calculation
  const scale = 400 / (400 + z)
  return {
    x: centerX + (x - centerX) * scale,
    y: centerY + (y - centerY) * scale,
    scale: scale
  }
}

// Truck class with 3D perspective
class Truck {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight, true)
  }

  reset(canvasWidth, canvasHeight, initial = false) {
    // Random lane (z-depth) - clearly defined lanes
    const lane = Math.floor(Math.random() * 3) // 0, 1, 2
    this.z = 100 + (lane * 100)
    
    // Y position based on Z for ground perspective
    this.y = canvasHeight * 0.65 + (this.z * 0.15)
    
    // Start off-screen
    if (initial) {
      this.x = Math.random() * canvasWidth
    } else {
       // Start way off to the left
      this.x = -300 - Math.random() * 400
    }
    
    // Speed based on depth (parallax effect)
    this.speed = (0.8 + Math.random() * 0.5) * (300 / (this.z + 100))
    this.rotation = 0
    this.rotationSpeed = 0.01 + Math.random() * 0.02
    
    // Truck dimensions
    this.width = 130
    this.height = 55
    this.cabinWidth = 40
    
    // Color
    const colorIndex = Math.floor(Math.random() * colors.truckBody.length)
    this.bodyColor = colors.truckBody[colorIndex]
    this.cabinColor = colors.truckCabin[colorIndex]
    
    // Poles on truck
    this.poleCount = Math.floor(Math.random() * 3) + 2
  }

  update(canvasWidth, canvasHeight) {
    this.x += this.speed
    this.rotation += this.rotationSpeed
    
    // Reset when off screen (right side)
    if (this.x > canvasWidth + 200) {
      this.reset(canvasWidth, canvasHeight)
    }
  }

  draw(centerX, centerY) {
    const proj = project3D(this.x, this.y, this.z, centerX, centerY)
    const scale = proj.scale
    
    ctx.save()
    ctx.translate(proj.x, proj.y)
    ctx.scale(scale, scale)
    
    const trailerWidth = this.width - this.cabinWidth
    const trailerHeight = this.height
    const groundY = 20 // Ground level relative to truck
    const wheelRadius = 12
    const wheelY = groundY + 8
    
    // Shadow under truck - more realistic
    ctx.fillStyle = colors.shadow
    ctx.beginPath()
    ctx.ellipse(this.width / 2, groundY + 15, this.width * 0.6, 12, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // === TRAILER (left part) ===
    // Trailer bed frame
    ctx.fillStyle = '#1F2937'
    ctx.fillRect(0, groundY - 8, trailerWidth, 10)
    
    // Trailer bed/cargo area
    ctx.fillStyle = this.bodyColor
    ctx.beginPath()
    ctx.roundRect(2, -trailerHeight + 15, trailerWidth - 4, trailerHeight - 5, 3)
    ctx.fill()
    
    // Trailer side panel lines
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      const lineX = (trailerWidth / 4) * i
      ctx.beginPath()
      ctx.moveTo(lineX, -trailerHeight + 20)
      ctx.lineTo(lineX, groundY - 10)
      ctx.stroke()
    }
    
    // Trailer border highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(2, -trailerHeight + 15, trailerWidth - 4, trailerHeight - 5)
    
    // Poles on trailer
    this.drawPoles()
    
    // === CABIN (right part) ===
    // Cabin body
    ctx.fillStyle = this.cabinColor
    ctx.beginPath()
    ctx.roundRect(trailerWidth - 5, -trailerHeight + 5, this.cabinWidth + 5, trailerHeight + 15, [0, 8, 8, 0])
    ctx.fill()
    
    // Cabin roof
    ctx.fillStyle = this.cabinColor
    ctx.beginPath()
    ctx.roundRect(trailerWidth, -trailerHeight, this.cabinWidth - 5, 10, [5, 5, 0, 0])
    ctx.fill()
    
    // Windshield
    ctx.fillStyle = 'rgba(147, 197, 253, 0.85)'
    ctx.beginPath()
    ctx.roundRect(trailerWidth + 3, -trailerHeight + 8, this.cabinWidth - 8, 22, 3)
    ctx.fill()
    
    // Windshield reflection
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.beginPath()
    ctx.roundRect(trailerWidth + 5, -trailerHeight + 10, 8, 18, 2)
    ctx.fill()
    
    // Door line
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(trailerWidth + this.cabinWidth / 2, -trailerHeight + 32)
    ctx.lineTo(trailerWidth + this.cabinWidth / 2, groundY + 5)
    ctx.stroke()
    
    // Door handle
    ctx.fillStyle = '#9CA3AF'
    ctx.fillRect(trailerWidth + this.cabinWidth / 2 + 3, -5, 6, 3)
    
    // Headlight
    ctx.fillStyle = '#FEF3C7'
    ctx.beginPath()
    ctx.roundRect(this.width - 8, 0, 6, 10, 2)
    ctx.fill()
    
    // Front bumper
    ctx.fillStyle = '#4B5563'
    ctx.fillRect(this.width - 5, groundY - 3, 8, 8)
    
    // Fuel tank (under cabin)
    ctx.fillStyle = '#6B7280'
    ctx.beginPath()
    ctx.roundRect(trailerWidth + 5, groundY - 5, 20, 12, 4)
    ctx.fill()
    
    // === WHEELS - Simple: 2 rear + 1 cabin ===
    const wheel1X = 18                   // First rear wheel
    const wheel2X = 50                   // Second rear wheel
    const wheel3X = this.width - 20      // Cabin wheel
    
    // Fender dimensions (centered on wheel)
    const fenderWidth = wheelRadius * 2 + 8
    const fenderHeight = wheelRadius + 6
    const fenderTopY = wheelY - wheelRadius - 2
    
    // Draw fenders (behind wheels)
    ctx.fillStyle = '#374151'
    ctx.fillRect(wheel1X - fenderWidth/2, fenderTopY, fenderWidth, fenderHeight)
    ctx.fillRect(wheel2X - fenderWidth/2, fenderTopY, fenderWidth, fenderHeight)
    ctx.fillRect(wheel3X - fenderWidth/2, fenderTopY, fenderWidth, fenderHeight + 2)
    
    // Draw wheels
    this.drawWheel(wheel1X, wheelY, wheelRadius)
    this.drawWheel(wheel2X, wheelY, wheelRadius)
    this.drawWheel(wheel3X, wheelY, wheelRadius)
    
    ctx.restore()
  }

  drawWheel(x, y, radius) {
    // Ultra-simple 2D tire - just circles
    
    // Main tire (black)
    ctx.fillStyle = '#1F2937'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Inner rim (gray)
    ctx.fillStyle = '#9CA3AF'
    ctx.beginPath()
    ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2)
    ctx.fill()
    
    // Hub center (dark gray)
    ctx.fillStyle = '#4B5563'
    ctx.beginPath()
    ctx.arc(x, y, radius * 0.25, 0, Math.PI * 2)
    ctx.fill()
  }

  drawPoles() {
    const poleLength = this.width - this.cabinWidth - 20
    const poleRadius = 4
    
    for (let i = 0; i < this.poleCount; i++) {
      const offsetY = -this.height + 25 + (i * 10)
      
      // 3D rotation effect for poles
      const rotOffset = Math.sin(this.rotation + i * 0.5) * 3
      
      // Pole shadow on truck
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fillRect(5, offsetY + 2, poleLength, poleRadius)
      
      // Pole body (cylinder effect with gradient)
      const gradient = ctx.createLinearGradient(5, offsetY - poleRadius, 5, offsetY + poleRadius)
      gradient.addColorStop(0, '#A78BFA')
      gradient.addColorStop(0.5, '#C4B5FD')
      gradient.addColorStop(1, '#DDD6FE')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(5, offsetY - poleRadius + rotOffset, poleLength, poleRadius * 2, poleRadius)
      ctx.fill()
      
      // Pole end caps (circles to show 3D)
      ctx.fillStyle = '#C4B5FD'
      ctx.beginPath()
      ctx.arc(5, offsetY + rotOffset, poleRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(5 + poleLength, offsetY + rotOffset, poleRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

let time = 0

const init = () => {
  trucks = []
  
  // Create trucks - all start off-screen to the left with staggered positions
  const numTrucks = 5
  for (let i = 0; i < numTrucks; i++) {
    const truck = new Truck(canvas.width, canvas.height)
    // Start off-screen left with significant staggering to prevent bunching
    truck.x = -200 - (i * 350) - Math.random() * 300
    trucks.push(truck)
  }
}

const animate = () => {
  time += 0.016
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Background (Sky/Wall)
  ctx.fillStyle = 'rgba(249, 250, 251, 1)' // Light mode
  if (document.documentElement.classList.contains('dark')) {
    ctx.fillStyle = 'rgba(17, 24, 39, 1)' // Dark mode
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Update all trucks
  trucks.forEach(truck => {
    truck.update(canvas.width, canvas.height)
  })
  
  // Sort by z-depth (far = high z = draw first = behind)
  const sortedTrucks = [...trucks].sort((a, b) => b.z - a.z)
  
  // Draw trucks in order (far to near)
  sortedTrucks.forEach(truck => {
    truck.draw(centerX, centerY)
  })
  
  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    init()
  }
}

onMounted(() => {
  canvas = document.getElementById('particleCanvas')
  if (canvas) {
    ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    init()
    animate()
    
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <canvas id="particleCanvas" class="particle-canvas"></canvas>
</template>

<style scoped>
.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
