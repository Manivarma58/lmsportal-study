import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * NeuralBackground Component
 * 3D Kinetic Neural Knowledge Cloud & Connected Synapse Graph
 * Represents student research clusters, interconnected learning nodes, and real-time data flows.
 */
const NeuralBackground = ({
  className = 'fixed inset-0 w-full h-full pointer-events-none -z-10',
  nodeCount = 55,
  maxLines = 160,
  maxDistance = 4.8,
  sphereRadius = 11,
  cameraZ = 26,
  opacity = 0.85,
  interactive = true,
  transparent = true,
  backgroundColor = null,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    if (backgroundColor) {
      scene.background = new THREE.Color(backgroundColor);
    }

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, cameraZ);

    const renderer = new THREE.WebGLRenderer({
      alpha: transparent,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const nodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.24, 16, 16);

    // Color palettes matching technical light theme
    const matIndigo = new THREE.MeshBasicMaterial({ color: 0x4f46e5 }); // Primary Indigo
    const matCyan = new THREE.MeshBasicMaterial({ color: 0x059669 });   // Emerald / Tech Cyan
    const matSlate = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });  // Slate 400
    const matBlue = new THREE.MeshBasicMaterial({ color: 0x2563eb });   // Blue 600

    const group = new THREE.Group();
    scene.add(group);

    for (let i = 0; i < nodeCount; i++) {
      let mat = matSlate;
      if (i % 4 === 0) mat = matCyan;
      else if (i % 3 === 0) mat = matIndigo;
      else if (i % 2 === 0) mat = matBlue;

      const m = new THREE.Mesh(nodeGeo, mat);

      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 5.5 + Math.random() * sphereRadius;

      m.position.x = r * Math.sin(phi) * Math.cos(theta);
      m.position.y = r * Math.sin(phi) * Math.sin(theta);
      m.position.z = r * Math.cos(phi);

      m.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        origin: m.position.clone(),
        maxDist: 3.0,
      };

      group.add(m);
      nodes.push(m);
    }

    // Dynamic line connections between proximate nodes
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.38,
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lineSegments);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      group.rotation.y = t * 0.05 + mouseX * 0.35;
      group.rotation.x = Math.sin(t * 0.03) * 0.18 + mouseY * 0.25;

      // Jiggle nodes gently
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.position.add(n.userData.velocity);
        if (n.position.distanceTo(n.userData.origin) > n.userData.maxDist) {
          n.userData.velocity.negate();
        }
      }

      // Recompute proximity lines
      let ptr = 0;
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (nodes[i].position.distanceTo(nodes[j].position) < maxDistance) {
            if (ptr < maxLines * 6) {
              linePositions[ptr++] = nodes[i].position.x;
              linePositions[ptr++] = nodes[i].position.y;
              linePositions[ptr++] = nodes[i].position.z;
              linePositions[ptr++] = nodes[j].position.x;
              linePositions[ptr++] = nodes[j].position.y;
              linePositions[ptr++] = nodes[j].position.z;
            }
          }
        }
      }
      for (let k = ptr; k < maxLines * 6; k++) {
        linePositions[k] = 0;
      }
      lineGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', onResize);

      // Clean up Three.js objects
      nodeGeo.dispose();
      matIndigo.dispose();
      matCyan.dispose();
      matSlate.dispose();
      matBlue.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [nodeCount, maxLines, maxDistance, sphereRadius, cameraZ, interactive, transparent, backgroundColor]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ opacity, display: 'block', overflow: 'hidden' }}
      aria-hidden="true"
    />
  );
};

export default NeuralBackground;
