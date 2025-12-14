import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function Modelo3DCard({
    modelPath = "/modelos/modelo.glb",
    titulo = "Mi Modelo",
    descripcion = "Descripción del modelo",
}) {
    const containerRef = useRef(null);
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const modelRef = useRef(null);
    const mixerRef = useRef(null);
    const animationIdRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  if (!mountRef.current) return;

  /* ================= ESCENA ================= */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  sceneRef.current = scene;

  /* ================= CÁMARA ================= */
  const width = mountRef.current.clientWidth;
  const height = mountRef.current.clientHeight;

  const camera = new THREE.PerspectiveCamera(
    40,          // FOV realista (clave)
    width / height,
    0.5,
    50
  );
camera.position.set(0, 6, 6);   // altura + distancia iguales ≈ 45°
camera.lookAt(0, 0, 0);
  /* ================= RENDERER ================= */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;

  rendererRef.current = renderer;
  mountRef.current.appendChild(renderer.domElement);

  /* ================= LUCES ================= */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const keyLight = new THREE.DirectionalLight(0xffffff, 1);
  keyLight.position.set(5, 6, 4);
  keyLight.intensity = 1.2;
  scene.add(keyLight);
  
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-4, 2, 4);
  fillLight.intensity = 0.35;
  scene.add(fillLight);
  
  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(0, 4, -5);
  backLight.intensity = 0.5;
  scene.add(backLight);

  /* ================= CARGAR MODELO ================= */
  const loader = new GLTFLoader();

  loader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;

      /* ---- Centrar modelo ---- */
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      /* ---- Escalar ---- */
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;
      model.scale.setScalar(scale);

      /* ---- Ligera inclinación tipo producto ---- */
model.rotation.x = -0.1;
      model.rotation.y = 0.15;

      scene.add(model);
      modelRef.current = model;

      /* ---- Animaciones ---- */
      if (gltf.animations?.length) {
        const mixer = new THREE.AnimationMixer(model);
        mixerRef.current = mixer;

        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      }

      setIsLoading(false);
      animate();
    },
    undefined,
    (err) => {
      console.error("Error cargando modelo:", err);
      setIsLoading(false);
    }
  );

  /* ================= HOVER ================= */
  const onEnter = () => setIsHovering(true);
  const onLeave = () => setIsHovering(false);

  containerRef.current.addEventListener("mouseenter", onEnter);
  containerRef.current.addEventListener("mouseleave", onLeave);

  /* ================= ANIMACIÓN ================= */
  const clock = new THREE.Clock();

  function animate() {
    animationIdRef.current = requestAnimationFrame(animate);

    if (modelRef.current && isHovering) {
      modelRef.current.rotation.y += 0.01;
    }

    if (mixerRef.current) {
      mixerRef.current.update(clock.getDelta());
    }

    renderer.render(scene, camera);
  }

  /* ================= RESIZE ================= */
  const handleResize = () => {
    if (!mountRef.current) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  window.addEventListener("resize", handleResize);

  /* ================= CLEANUP ================= */
  return () => {
    window.removeEventListener("resize", handleResize);
    containerRef.current.removeEventListener("mouseenter", onEnter);
    containerRef.current.removeEventListener("mouseleave", onLeave);

    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);

    if (renderer.domElement.parentNode === mountRef.current) {
      mountRef.current.removeChild(renderer.domElement);
    }

    renderer.dispose();
  };
}, [modelPath, isHovering]);


    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "#0a0a0a",
                border: "1px solid #1e1e2e",
                transition: "all 0.3s ease",
                cursor: "pointer",
                transform: isHovering ? "translateY(-8px)" : "translateY(0)",
                boxShadow: isHovering
                    ? "0 20px 40px rgba(255, 255, 255, 0.1)"
                    : "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
        >
            {/* Contenedor del canvas */}
            <div
                ref={mountRef}
                style={{
                    width: "100%",
                    height: "280px",
                    position: "relative",
                    backgroundColor:
                        "#0a0a0a",
                }}
            >
                {isLoading && (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: "#00d100",
                            fontSize: "14px",
                            fontFamily: "monospace",
                            zIndex: 10,
                        }}
                    >
                        Cargando modelo...
                    </div>
                )}
            </div>

            {/* Info del modelo */}
            <div
                style={{
                    padding: "20px",
                    background: "#0a0a0a",
                }}
            >
                <h3
                    style={{
                        margin: "0 0 8px 0",
                        color: "#ffffff",
                        fontSize: "16px",
                        fontWeight: "600",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                >
                    {titulo}
                </h3>
                <p
                    style={{
                        margin: "0",
                        color: "#888888",
                        fontSize: "13px",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        lineHeight: "1.4",
                    }}
                >
                    {descripcion}
                </p>
            </div>
        </div>
    );
}
