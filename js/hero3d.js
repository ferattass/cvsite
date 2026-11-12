/* =============================================================
   Ferat Taş — Portfolio
   3D Hero scene (Three.js, module)
   -------------------------------------------------------------
   Premium iridescent glass gem: MeshPhysicalMaterial + env
   reflections (PMREM/RoomEnvironment), a fresnel rim-glow shell,
   an orbiting ring and a two-tone particle field.
   If assets/head.glb exists it loads that instead (animated
   avatar: plays an idle clip + the head bone follows the cursor).
   Falls back to the static avatar when WebGL is missing or the
   user prefers reduced motion.
   ============================================================= */
import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "https://unpkg.com/three@0.160.0/examples/jsm/environments/RoomEnvironment.js";

(function () {
  "use strict";

  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hasWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  const host = document.querySelector(".hero__visual");
  if (!host || reduceMotion || !hasWebGL()) return;

  /* ---------- Theme palette ---------- */
  function themeColors() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { a: 0x9a8bff, b: 0xc77dff, glow: 0xb794f6, spark: 0x7afcff, env: 1.0, exposure: 1.15, glowI: 1.0 }
      : { a: 0x5b4bf5, b: 0x8b5cf6, glow: 0x7c3aed, spark: 0x22d3ee, env: 1.4, exposure: 1.0, glowI: 0.5 };
  }
  let colors = themeColors();

  /* ---------- Mount ---------- */
  const mount = document.createElement("div");
  mount.className = "hero3d";
  mount.setAttribute("aria-hidden", "true");
  host.prepend(mount);

  // Cap by viewport so the canvas can never blow the layout wider than the
  // screen (was locking to 460px on phones and pushing all hero text off-screen).
  const SIZE = () => {
    const vw = window.innerWidth || document.documentElement.clientWidth || 360;
    const small = vw < 760;
    const cap = small ? Math.min(vw - 48, 300) : Math.min(vw - 40, 460);
    return Math.max(200, Math.min(host.clientWidth || cap, cap));
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 6.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // keep canvas transparent (needed for transmission)
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = colors.exposure;
  mount.appendChild(renderer.domElement);

  /* ---------- Environment (reflections) ---------- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const group = new THREE.Group();
  scene.add(group);

  /* ---------- Lights ---------- */
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const key = new THREE.PointLight(colors.a, 70, 60);
  key.position.set(5, 6, 6);
  scene.add(key);
  const rim = new THREE.PointLight(colors.b, 55, 60);
  rim.position.set(-6, -4, 3);
  scene.add(rim);

  /* ---------- The gem ---------- */
  let gem, gemWire, glowShell, ringMesh, near, far;
  let modelRoot = null, mixer = null, headBone = null;
  const clock = new THREE.Clock();

  function fresnelMat(hex) {
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(hex) }, uPower: { value: 2.6 }, uIntensity: { value: 0.9 } },
      vertexShader: `
        varying vec3 vN; varying vec3 vP;
        void main(){
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vP = wp.xyz; vN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        varying vec3 vN; varying vec3 vP;
        uniform vec3 uColor; uniform float uPower; uniform float uIntensity;
        void main(){
          vec3 V = normalize(cameraPosition - vP);
          float f = pow(1.0 - abs(dot(V, vN)), uPower) * uIntensity;
          gl_FragColor = vec4(uColor, f);
        }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
    });
  }

  function particleLayer(count, radius, size, hexA, hexB, opacity) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cA = new THREE.Color(hexA), cB = new THREE.Color(hexB), tmp = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = radius + Math.random() * radius * 0.9;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
      tmp.copy(cA).lerp(cB, Math.random());
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    return new THREE.Points(g, m);
  }

  function buildGem() {
    gem = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6, 1),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0, roughness: 0.06,
        transmission: 0.92, ior: 1.7, thickness: 1.2,
        attenuationColor: new THREE.Color(colors.a), attenuationDistance: 1.6,
        iridescence: 1.0, iridescenceIOR: 1.6, iridescenceThicknessRange: [120, 460],
        clearcoat: 1.0, clearcoatRoughness: 0.16,
        envMapIntensity: colors.env, flatShading: true,
      })
    );
    group.add(gem);

    gemWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.66, 3),
      new THREE.MeshBasicMaterial({ color: colors.glow, wireframe: true, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    group.add(gemWire);

    glowShell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.95, 2), fresnelMat(colors.glow));
    group.add(glowShell);

    ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.012, 12, 160),
      new THREE.MeshBasicMaterial({ color: colors.b, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    ringMesh.rotation.x = Math.PI / 2.3;
    scene.add(ringMesh);

    near = particleLayer(380, 2.6, 0.055, colors.glow, colors.spark, 0.9);
    far = particleLayer(520, 4.2, 0.03, colors.a, colors.b, 0.55);
    scene.add(near); scene.add(far);
  }

  function tryLoadModel() {
    new GLTFLoader().load(
      "assets/head.glb",
      (gltf) => {
        modelRoot = gltf.scene;
        const box = new THREE.Box3().setFromObject(modelRoot);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        modelRoot.position.sub(center);
        modelRoot.scale.setScalar(3.4 / (Math.max(size.x, size.y, size.z) || 1));
        group.add(modelRoot);

        if (gltf.animations && gltf.animations.length) {
          mixer = new THREE.AnimationMixer(modelRoot);
          const clip = gltf.animations.find((c) => /idle|breath|stand/i.test(c.name)) || gltf.animations[0];
          mixer.clipAction(clip).play();
        }
        modelRoot.traverse((o) => {
          if (o.isBone && !headBone && /head/i.test(o.name)) headBone = o;
          if (o.isMesh) o.frustumCulled = false;
        });

        [gem, gemWire, glowShell].forEach((m) => m && group.remove(m));
      },
      undefined,
      () => {} // no model — the gem stays
    );
  }

  buildGem();
  tryLoadModel();

  const avatar = host.querySelector(".avatar-card");
  if (avatar) avatar.style.display = "none";

  /* ---------- Resize ---------- */
  function resize() {
    const s = SIZE();
    renderer.setSize(s, s, false);
    renderer.domElement.style.width = s + "px";
    renderer.domElement.style.height = s + "px";
    camera.aspect = 1; camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(host);
  window.addEventListener("resize", resize, { passive: true });

  /* ---------- Pointer parallax ---------- */
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ---------- Theme reactivity ---------- */
  function recolor() {
    colors = themeColors();
    renderer.toneMappingExposure = colors.exposure;
    key.color.setHex(colors.a); rim.color.setHex(colors.b);
    if (gem) { gem.material.attenuationColor.setHex(colors.a); gem.material.envMapIntensity = colors.env; }
    if (gemWire) gemWire.material.color.setHex(colors.glow);
    if (glowShell) glowShell.material.uniforms.uColor.value.setHex(colors.glow);
    if (ringMesh) ringMesh.material.color.setHex(colors.b);
    if (near) { scene.remove(near); near.geometry.dispose(); near.material.dispose(); }
    if (far) { scene.remove(far); far.geometry.dispose(); far.material.dispose(); }
    near = particleLayer(380, 2.6, 0.055, colors.glow, colors.spark, 0.9);
    far = particleLayer(520, 4.2, 0.03, colors.a, colors.b, 0.55);
    scene.add(near); scene.add(far);
  }
  new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------- Visibility pause ---------- */
  let visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((ents) => ents.forEach((en) => (visible = en.isIntersecting)), { threshold: 0.05 }).observe(host);
  }

  /* ---------- Animate ---------- */
  let t = 0;
  function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    t += 0.01;
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);
    cur.x += (target.x - cur.x) * 0.05;
    cur.y += (target.y - cur.y) * 0.05;

    if (modelRoot) {
      // avatar: head follows the cursor, gentle idle sway
      if (headBone) {
        headBone.rotation.y += (cur.x * 0.55 - headBone.rotation.y) * 0.1;
        headBone.rotation.x += (cur.y * 0.35 - headBone.rotation.x) * 0.1;
      }
      group.position.y = Math.sin(t * 1.3) * 0.05;
      group.rotation.y = cur.x * 0.35 + Math.sin(t * 0.35) * 0.12;
      group.rotation.x = cur.y * 0.18;
    } else {
      group.rotation.y = t * 0.32 + cur.x * 0.5;
      group.rotation.x = Math.sin(t * 0.5) * 0.12 + cur.y * 0.35;
      group.scale.setScalar(1 + Math.sin(t * 1.2) * 0.015);
      if (gemWire) gemWire.rotation.y = -t * 0.25;
      if (glowShell) glowShell.material.uniforms.uIntensity.value = (0.8 + Math.sin(t * 1.6) * 0.25) * colors.glowI;
    }
    if (ringMesh) { ringMesh.rotation.z = t * 0.45; ringMesh.rotation.y = Math.sin(t * 0.3) * 0.35; }
    if (near) near.rotation.y = t * 0.05;
    if (far) { far.rotation.y = -t * 0.03; far.rotation.x = t * 0.02; }
    key.intensity = 62 + Math.sin(t * 1.5) * 14;

    renderer.render(scene, camera);
  }
  loop();
})();
