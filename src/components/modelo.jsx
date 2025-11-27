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

        // Escena
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0a);
        sceneRef.current = scene;

        // Cámara
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000,
        );
        camera.position.z = 4;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
        });
        renderer.setSize(
            mountRef.current.clientWidth,
            mountRef.current.clientHeight,
        );
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        // Luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Cargar modelo
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;

                // Centrar y escalar el modelo
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 1.5 / maxDim;
                model.scale.multiplyScalar(scale);

                scene.add(model);
                modelRef.current = model;

                // Configurar animaciones si las hay
                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(model);
                    mixerRef.current = mixer;

                    gltf.animations.forEach((clip) => {
                        const action = mixer.clipAction(clip);
                        action.clampWhenFinished = true;
                        action.play();
                    });
                }

                setIsLoading(false);
                animate();
            },
            undefined,
            (error) => {
                console.error("Error cargando el modelo:", error);
                setIsLoading(false);
            },
        );

        // Eventos de mouse
        containerRef.current.addEventListener("mouseenter", () => {
            setIsHovering(true);
        });

        containerRef.current.addEventListener("mouseleave", () => {
            setIsHovering(false);
        });

        // Loop de animación
        const clock = new THREE.Clock();
        function animate() {
            animationIdRef.current = requestAnimationFrame(animate);

            // Rotación al hover
            if (modelRef.current) {
                if (isHovering) {
                    modelRef.current.rotation.y += 0.03;
                }
            }

            // Actualizar mixer de animaciones
            if (mixerRef.current) {
                mixerRef.current.update(clock.getDelta());
            }

            renderer.render(scene, camera);
        }

        // Responsividad
        const handleResize = () => {
            if (mountRef.current) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            if (
                mountRef.current &&
                renderer.domElement.parentNode === mountRef.current
            ) {
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
                    background:
                        "linear-gradient(135deg, #1a1a2e 0%, #0f3a0f 100%)",
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
