import * as THREE from 'three'

const LANES = [-1.45, 1.45]
const LANE_NAMES = ['izquierda', 'derecha']
const LANE_LEFT = 0
const LANE_RIGHT = 1
const SEGMENT_LEN = 6
const SEGMENT_COUNT = 30
const BALL_R = 0.4
const PATH_WIDTH = 5.2
const SPAWN_INTERVAL = 2.8
const REACTION_TIME = 1.55
const MIN_OBSTACLE_GAP = 3.2

function noise2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function makeTexture(draw, size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  draw(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function dirtPathTexture() {
  return makeTexture((ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, 0, s)
    g.addColorStop(0, '#e8b86d')
    g.addColorStop(1, '#c9924a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const n = noise2(x * 0.04, y * 0.09)
      ctx.fillStyle = `rgba(${95 + n * 70},${68 + n * 45},${28 + n * 24},${0.18 + n * 0.35})`
      ctx.fillRect(x, y, 2 + n * 4, 3 + n * 9)
    }
    ctx.strokeStyle = 'rgba(50,28,12,0.2)'
    ctx.lineWidth = 3
    for (let x = 24; x < s; x += 46) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + 10, s)
      ctx.stroke()
    }
  })
}

function barkTexture() {
  return makeTexture((ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, s, 0)
    g.addColorStop(0, '#c87840')
    g.addColorStop(0.45, '#f0a060')
    g.addColorStop(1, '#b06830')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = 'rgba(20,10,5,0.35)'
    for (let i = 0; i < 36; i++) {
      const x = (i / 36) * s
      ctx.beginPath()
      ctx.moveTo(x + Math.sin(i * 0.8) * 5, 0)
      ctx.lineTo(x + Math.cos(i * 0.45) * 8, s)
      ctx.stroke()
    }
  })
}

function leafTexture() {
  return makeTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s * 0.45, s * 0.4, s * 0.05, s * 0.5, s * 0.5, s * 0.65)
    g.addColorStop(0, '#b8f070')
    g.addColorStop(0.5, '#6dd84a')
    g.addColorStop(1, '#3aad3a')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const w = 8 + Math.random() * 24
      const h = 4 + Math.random() * 11
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((Math.random() - 0.5) * 1.8)
      ctx.fillStyle = `rgba(${55 + Math.random() * 35},${95 + Math.random() * 85},${35 + Math.random() * 20},0.24)`
      ctx.fillRect(-w * 0.5, -h * 0.5, w, h)
      ctx.restore()
    }
  })
}

function ruinStoneTexture() {
  return makeTexture((ctx, s) => {
    ctx.fillStyle = '#d4c8a8'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * s
      const y = Math.random() * s
      const n = noise2(x * 0.07, y * 0.07)
      const shade = 76 + Math.floor(n * 55)
      ctx.fillStyle = `rgba(${shade},${shade + 6},${shade - 8},${0.15 + n * 0.35})`
      ctx.fillRect(x, y, 2 + n * 4, 2 + n * 4)
    }
    ctx.strokeStyle = 'rgba(28,30,22,0.24)'
    ctx.lineWidth = 2
    for (let y = 26; y < s; y += 42) {
      ctx.beginPath()
      ctx.moveTo(0, y + Math.sin(y * 0.08) * 6)
      ctx.lineTo(s, y + Math.cos(y * 0.04) * 6)
      ctx.stroke()
    }
  })
}

function vineTexture() {
  return makeTexture((ctx, s) => {
    ctx.clearRect(0, 0, s, s)
    ctx.strokeStyle = '#2e5f2d'
    ctx.lineWidth = 14
    ctx.beginPath()
    ctx.moveTo(s * 0.28, 0)
    ctx.bezierCurveTo(s * 0.5, s * 0.2, s * 0.15, s * 0.6, s * 0.42, s)
    ctx.stroke()
    ctx.strokeStyle = '#4f8b37'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(s * 0.62, 0)
    ctx.bezierCurveTo(s * 0.78, s * 0.28, s * 0.55, s * 0.58, s * 0.7, s)
    ctx.stroke()
  })
}

function idolTexture() {
  return makeTexture((ctx, s) => {
    const g = ctx.createRadialGradient(s * 0.35, s * 0.3, s * 0.04, s * 0.5, s * 0.5, s * 0.65)
    g.addColorStop(0, '#fff4a0')
    g.addColorStop(0.45, '#ff9f6b')
    g.addColorStop(1, '#ff6b9d')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    for (let i = 0; i < 18; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * 14)
      ctx.lineTo(s, i * 14 + 12)
      ctx.stroke()
    }
  })
}

function heightAt(p) {
  return (
    Math.sin(p * 0.045) * 2.6 +
    Math.sin(p * 0.018 + 1.1) * 3.1 +
    Math.sin(p * 0.11) * 0.55
  )
}

function slopeAt(p) {
  return (
    Math.cos(p * 0.045) * 2.6 * 0.045 +
    Math.cos(p * 0.018 + 1.1) * 3.1 * 0.018 +
    Math.cos(p * 0.11) * 0.55 * 0.11
  )
}

function bendAt(p) {
  return Math.sin(p * 0.034) * 6.4 + Math.sin(p * 0.08) * 1.9
}

function bendDeriv(p) {
  return Math.cos(p * 0.034) * 6.4 * 0.034 + Math.cos(p * 0.08) * 1.9 * 0.08
}

function yawAt(p) {
  return Math.atan(bendDeriv(p))
}

function makePalmTree(matBark, matLeaf) {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.2, 10), matBark)
  trunk.position.y = 1.05
  trunk.castShadow = true
  g.add(trunk)
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.6, 5), matLeaf)
    leaf.position.set(Math.cos((i / 5) * Math.PI * 2) * 0.18, 2.22, Math.sin((i / 5) * Math.PI * 2) * 0.18)
    leaf.rotation.z = Math.PI * 0.5
    leaf.rotation.y = (i / 5) * Math.PI * 2
    leaf.rotation.x = Math.PI * 0.12
    g.add(leaf)
  }
  return g
}

function makeBush(matLeaf) {
  const g = new THREE.Group()
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.4 + i * 0.06, 12, 10), matLeaf)
    puff.position.set((i - 1) * 0.28, 0.28 + i * 0.1, (Math.random() - 0.5) * 0.25)
    puff.scale.set(1 + Math.random() * 0.25, 0.8 + Math.random() * 0.2, 1)
    g.add(puff)
  }
  return g
}

function makeSegment(materials) {
  const g = new THREE.Group()

  const floor = new THREE.Mesh(new THREE.BoxGeometry(PATH_WIDTH, 0.24, SEGMENT_LEN), materials.path)
  floor.position.y = -0.12
  floor.receiveShadow = true
  g.add(floor)

  const rimL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, SEGMENT_LEN), materials.ruin)
  rimL.position.set(-(PATH_WIDTH * 0.5 + 0.2), 0.04, 0)
  rimL.castShadow = true
  rimL.receiveShadow = true
  g.add(rimL)

  const rimR = rimL.clone()
  rimR.position.x *= -1
  g.add(rimR)

  const cliffL = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.7, SEGMENT_LEN), materials.ruinDark)
  cliffL.position.set(-3.65, 0.7, 0)
  cliffL.castShadow = true
  cliffL.receiveShadow = true
  g.add(cliffL)

  const cliffR = cliffL.clone()
  cliffR.position.x *= -1
  g.add(cliffR)

  const arch = new THREE.Group()
  arch.name = 'arch'
  const postGeo = new THREE.BoxGeometry(0.42, 2.2, 0.42)
  const postL = new THREE.Mesh(postGeo, materials.ruin)
  postL.position.set(-2.8, 0.96, 0)
  postL.castShadow = true
  arch.add(postL)
  const postR = postL.clone()
  postR.position.x *= -1
  arch.add(postR)
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.4, 0.55), materials.ruin)
  lintel.position.set(0, 2.08, 0)
  lintel.castShadow = true
  arch.add(lintel)
  const vine = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.9), materials.vine)
  vine.position.set(1.8, 1.4, 0.12)
  arch.add(vine)
  g.add(arch)

  const leftTree = makePalmTree(materials.bark, materials.leaf)
  leftTree.name = 'leftTree'
  leftTree.position.set(-5.2, 0, -0.8)
  g.add(leftTree)

  const rightTree = makePalmTree(materials.bark, materials.leaf)
  rightTree.name = 'rightTree'
  rightTree.position.set(5.1, 0, 0.7)
  g.add(rightTree)

  const bushL = makeBush(materials.leaf)
  bushL.name = 'bushL'
  bushL.position.set(-4.4, 0, 0.6)
  g.add(bushL)

  const bushR = makeBush(materials.leaf)
  bushR.name = 'bushR'
  bushR.position.set(4.3, 0, -0.4)
  g.add(bushR)

  return g
}

function makeObstacleDefs(materials) {
  return [
    {
      kind: 'tree',
      baseHeight: 0,
      clearance: 1.7,
      jumpable: false,
      weight: 0.55,
      build() {
        const g = new THREE.Group()
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 1.8, 10), materials.bark)
        trunk.position.y = 0.9
        trunk.castShadow = true
        g.add(trunk)
        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 12), materials.leaf)
        crown.position.y = 1.95
        crown.scale.set(1, 0.9, 1)
        g.add(crown)
        return g
      },
    },
    {
      kind: 'ball',
      baseHeight: 0.48,
      clearance: 0.72,
      jumpable: true,
      weight: 0.45,
      build() {
        const g = new THREE.Group()
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 16), materials.idol)
        core.name = 'core'
        core.castShadow = true
        g.add(core)
        return g
      },
    },
  ]
}

function pickWeightedDef(defs) {
  const total = defs.reduce((sum, def) => sum + def.weight, 0)
  let roll = Math.random() * total
  for (const def of defs) {
    roll -= def.weight
    if (roll <= 0) return def
  }
  return defs[0]
}

export function createGame(canvas, hooks = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x7ec8f0)
  scene.fog = new THREE.Fog(0x9ed8f8, 18, 72)

  const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 90)

  scene.add(new THREE.HemisphereLight(0xfff6c8, 0x7ecf6a, 1.35))
  const sun = new THREE.DirectionalLight(0xfff0b0, 1.45)
  sun.position.set(5, 12, 4)
  sun.castShadow = true
  scene.add(sun)

  const canopyGlow = new THREE.PointLight(0xffe080, 0.65, 32)
  scene.add(canopyGlow)

  const texPath = dirtPathTexture()
  texPath.repeat.set(1.8, 6.5)
  const texBark = barkTexture()
  const texLeaf = leafTexture()
  const texRuin = ruinStoneTexture()
  texRuin.repeat.set(1.4, 3.4)
  const texVine = vineTexture()
  const texIdol = idolTexture()

  const materials = {
    path: new THREE.MeshStandardMaterial({ map: texPath, roughness: 1, metalness: 0 }),
    bark: new THREE.MeshStandardMaterial({ map: texBark, roughness: 0.92, metalness: 0.02 }),
    leaf: new THREE.MeshStandardMaterial({
      map: texLeaf,
      color: 0xf0ffd8,
      roughness: 0.82,
      metalness: 0.01,
    }),
    ruin: new THREE.MeshStandardMaterial({ map: texRuin, color: 0xfff0c8, roughness: 0.9, metalness: 0.03 }),
    ruinDark: new THREE.MeshStandardMaterial({
      map: texRuin,
      color: 0xf5d898,
      roughness: 0.92,
      metalness: 0.02,
    }),
    vine: new THREE.MeshStandardMaterial({
      map: texVine,
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
      roughness: 1,
    }),
    idol: new THREE.MeshStandardMaterial({ map: texIdol, roughness: 0.28, metalness: 0.12 }),
    player: new THREE.MeshStandardMaterial({ color: 0xff7eb3, roughness: 0.22, metalness: 0.1 }),
  }

  const track = new THREE.Group()
  scene.add(track)

  const segments = []
  let pathDistance = 0

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const seg = makeSegment(materials)
    seg.userData.pathPos = -8 + i * SEGMENT_LEN
    segments.push(seg)
    track.add(seg)
  }

  function placeSegments() {
    while (segments.length && pathDistance - segments[0].userData.pathPos > 12) {
      const seg = segments.shift()
      const last = segments[segments.length - 1]
      seg.userData.pathPos = last.userData.pathPos + SEGMENT_LEN
      segments.push(seg)
    }

    for (const seg of segments) {
      const p = seg.userData.pathPos
      const visualZ = pathDistance - p
      const yaw = yawAt(p)
      seg.position.set(bendAt(p), heightAt(p), visualZ)
      seg.rotation.set(Math.atan(slopeAt(p)) * 0.92, yaw, 0, 'YXZ')

      const arch = seg.getObjectByName('arch')
      if (arch) arch.visible = Math.floor(p / SEGMENT_LEN) % 4 === 0

      const leftTree = seg.getObjectByName('leftTree')
      const rightTree = seg.getObjectByName('rightTree')
      const bushL = seg.getObjectByName('bushL')
      const bushR = seg.getObjectByName('bushR')
      const sway = Math.sin(p * 0.07) * 0.12
      if (leftTree) {
        leftTree.position.z = -0.8 + Math.sin(p * 0.08) * 0.7
        leftTree.rotation.z = -0.08 + sway
      }
      if (rightTree) {
        rightTree.position.z = 0.8 + Math.cos(p * 0.06) * 0.7
        rightTree.rotation.z = 0.08 - sway
      }
      if (bushL) bushL.scale.setScalar(0.9 + noise2(p * 0.02, 1) * 0.5)
      if (bushR) bushR.scale.setScalar(0.9 + noise2(p * 0.02, 2) * 0.5)
    }
  }
  placeSegments()

  const ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 24, 18), materials.player)
  ball.castShadow = true
  scene.add(ball)

  const obstacleDefs = makeObstacleDefs(materials)
  const obstaclePools = Object.fromEntries(obstacleDefs.map((def) => [def.kind, []]))
  const obstacles = []
  let elapsedRun = 0
  let nextSpawnAt = SPAWN_INTERVAL + 1.2

  function acquireObstacle(def) {
    const pooled = obstaclePools[def.kind].pop()
    const mesh = pooled ?? def.build()
    mesh.visible = true
    mesh.userData.def = def
    scene.add(mesh)
    return mesh
  }

  function releaseObstacle(obstacle) {
    scene.remove(obstacle)
    obstacle.visible = false
    obstaclePools[obstacle.userData.def.kind].push(obstacle)
  }

  function otherLane(l) {
    return l === LANE_LEFT ? LANE_RIGHT : LANE_LEFT
  }

  function obstacleLead(obstacle) {
    return obstacle.userData.pathPos - pathDistance
  }

  function hasObstacleTooClose(minLead) {
    return obstacles.some((obstacle) => {
      const lead = obstacleLead(obstacle)
      return lead > 0 && lead < minLead
    })
  }

  function chooseSpawnLane() {
    // Solo izq/der: siempre deja libre el carril opuesto al obstáculo.
    // La mayoría va en tu carril para obligarte a cambiar; nunca bloquea los dos lados a la vez.
    if (Math.random() < 0.72) return lane
    return otherLane(lane)
  }

  function spawnObstacle() {
    const minLead = speed * MIN_OBSTACLE_GAP
    if (hasObstacleTooClose(minLead)) return

    const def = pickWeightedDef(obstacleDefs)
    const obstacle = acquireObstacle(def)
    obstacle.userData.lane = chooseSpawnLane()
    obstacle.userData.pathPos = pathDistance + Math.max(11, speed * REACTION_TIME)
    obstacle.userData.phase = Math.random() * Math.PI * 2
    obstacle.userData.spin = 0
    obstacles.push(obstacle)
  }

  function syncObstacle(obstacle, dt) {
    const p = obstacle.userData.pathPos
    const yaw = yawAt(p)
    const localX = LANES[obstacle.userData.lane]
    const c = Math.cos(yaw)
    const s = Math.sin(yaw)
    const def = obstacle.userData.def
    const floorY = heightAt(p)
    obstacle.position.set(
      bendAt(p) + localX * c,
      floorY + def.baseHeight,
      pathDistance - p - localX * s * 0.15,
    )
    obstacle.rotation.set(Math.atan(slopeAt(p)) * 0.86, yaw, 0, 'YXZ')

    if (def.kind === 'ball') {
      const core = obstacle.getObjectByName('core')
      if (core) {
        obstacle.userData.spin += dt * speed * 2.5
        core.rotation.x = -obstacle.userData.spin
        core.rotation.z = Math.sin(elapsedRun * 5 + obstacle.userData.phase) * 0.18
      }
      obstacle.position.y += Math.abs(Math.sin(elapsedRun * 4 + obstacle.userData.phase)) * 0.08
    }

    if (def.kind === 'tree') {
      obstacle.rotation.z = Math.sin(elapsedRun * 2 + obstacle.userData.phase) * 0.05
    }
  }

  let lane = LANE_LEFT
  let targetLaneX = LANES[LANE_LEFT]
  let yVel = 0
  let airborneY = 0
  let onGround = true
  let running = false
  let dead = false
  let speed = 8
  let attention = 50
  let wantJump = false
  let lastTime = performance.now()
  let spin = 0

  function setAttention(value) {
    attention = Math.max(0, Math.min(100, value))
    lane = attention < 50 ? LANE_LEFT : LANE_RIGHT
    targetLaneX = LANES[lane]
    hooks.onLane?.(lane, LANE_NAMES[lane])
  }

  function nudgeLane(dir) {
    lane = dir < 0 ? LANE_LEFT : LANE_RIGHT
    targetLaneX = LANES[lane]
    hooks.onLane?.(lane, LANE_NAMES[lane])
  }

  function requestJump() {
    wantJump = true
  }

  function clearObstacles() {
    while (obstacles.length) {
      releaseObstacle(obstacles.pop())
    }
  }

  function reset() {
    dead = false
    running = true
    pathDistance = 0
    speed = 8
    lane = LANE_LEFT
    targetLaneX = LANES[LANE_LEFT]
    airborneY = 0
    yVel = 0
    onGround = true
    elapsedRun = 0
    nextSpawnAt = SPAWN_INTERVAL + 1.2
    ball.userData.laneX = LANES[LANE_LEFT]
    camera.up.set(0, 1, 0)
    for (let i = 0; i < segments.length; i++) {
      segments[i].userData.pathPos = -8 + i * SEGMENT_LEN
    }
    placeSegments()
    clearObstacles()
    ball.position.set(bendAt(0), heightAt(0) + BALL_R, 0)
    hooks.onScore?.(0)
    hooks.onLane?.(lane, LANE_NAMES[lane])
  }

  function die() {
    if (dead) return
    dead = true
    running = false
    hooks.onGameOver?.(Math.floor(pathDistance))
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', resize)

  function update(dt) {
    if (!running || dead) return

    elapsedRun += dt
    pathDistance += speed * dt
    speed = Math.min(11, 8 + pathDistance * 0.0035)
    hooks.onScore?.(Math.floor(pathDistance))
    placeSegments()

    while (elapsedRun >= nextSpawnAt) {
      spawnObstacle()
      nextSpawnAt += SPAWN_INTERVAL
    }

    const yaw = yawAt(pathDistance)
    const centerX = bendAt(pathDistance)
    const floorY = heightAt(pathDistance)

    const laneX = THREE.MathUtils.damp(ball.userData.laneX ?? LANES[LANE_LEFT], targetLaneX, 20, dt)
    ball.userData.laneX = laneX

    if (wantJump && onGround) {
      yVel = 8.9
      onGround = false
    }
    wantJump = false

    if (!onGround) {
      yVel -= 25 * dt
      airborneY += yVel * dt
      if (airborneY <= 0) {
        airborneY = 0
        yVel = 0
        onGround = true
      }
    }

    const worldX = centerX + laneX * Math.cos(yaw)
    ball.position.x = worldX
    ball.position.y = floorY + BALL_R + airborneY
    ball.position.z = 0

    spin += speed * dt * 2.4
    ball.rotation.x = -spin
    ball.rotation.y = yaw

    canopyGlow.position.set(worldX, ball.position.y + 3.5, -4)

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i]
      syncObstacle(obstacle, dt)

      if (pathDistance - obstacle.userData.pathPos > 7.5) {
        obstacles.splice(i, 1)
        releaseObstacle(obstacle)
        continue
      }

      const near = obstacle.position.z > -0.45 && obstacle.position.z < 0.55
      const sameLane = obstacle.userData.lane === lane
      const cleared = airborneY > obstacle.userData.def.clearance
      if (sameLane && near && !cleared) die()
    }

    const camYaw = yawAt(pathDistance - 1.4)
    const camBend = bendAt(pathDistance - 1.4)
    const camHeight = heightAt(pathDistance - 1.4)
    const lookDist = 9
    const targetCamX = camBend + Math.sin(camYaw) * 0.65 + laneX * 0.38
    const targetCamY = camHeight + 2.2 + Math.max(0, airborneY * 0.18)
    const targetCamZ = 5.8

    camera.position.x += (targetCamX - camera.position.x) * 0.12
    camera.position.y += (targetCamY - camera.position.y) * 0.14
    camera.position.z += (targetCamZ - camera.position.z) * 0.12

    const lookX = centerX - Math.sin(yaw) * lookDist * 0.3 + laneX * 0.2
    const lookY = floorY + 0.65 + slopeAt(pathDistance) * 3.2
    const lookZ = -lookDist
    camera.up.set(Math.sin(-yaw * 0.35), Math.cos(-yaw * 0.35), 0).normalize()
    camera.lookAt(lookX, lookY, lookZ)
  }

  function frame(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    update(dt)
    renderer.render(scene, camera)
    requestAnimationFrame(frame)
  }
  frame()

  return {
    start: reset,
    setAttention,
    nudgeLane,
    requestJump,
    getAttention: () => attention,
    isRunning: () => running && !dead,
  }
}
