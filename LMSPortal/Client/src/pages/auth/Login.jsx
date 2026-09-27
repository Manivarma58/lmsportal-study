import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import * as THREE from 'three';
import {
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: reduxLoading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Dynamic feedback / alert notification state
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const from = location.state?.from?.pathname;

  // -------------------------------------------------------------
  // LEFT PANEL: Interactive 3D Workstation (Three.js)
  // -------------------------------------------------------------
  useEffect(() => {
    const containerEl = leftCanvasRef.current;
    if (!containerEl) return;

    const width = containerEl.clientWidth || 800;
    const height = containerEl.clientHeight || 900;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.4, 7.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    containerEl.innerHTML = '';
    containerEl.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 1.2);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.8);
    dirLight2.position.set(-5, 4, 3);
    scene.add(dirLight2);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 1.5, 15);
    purpleLight.position.set(2, -2, 4);
    scene.add(purpleLight);

    const laptopGroup = new THREE.Group();
    scene.add(laptopGroup);

    const chassisMat = new THREE.MeshPhongMaterial({
      color: 0xf1f5f9,
      emissive: 0xe2e8f0,
      shininess: 90,
      transparent: true,
      opacity: 0.95,
    });

    const wireBlueMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });

    const glassScreenMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xf8fafc,
      shininess: 100,
      transparent: true,
      opacity: 0.92,
    });

    // Laptop Base
    const baseGeo = new THREE.BoxGeometry(3.6, 0.14, 2.5);
    const baseMesh = new THREE.Mesh(baseGeo, chassisMat);
    baseMesh.position.set(0, -0.4, 0);
    laptopGroup.add(baseMesh);

    const baseWire = new THREE.Mesh(baseGeo, wireBlueMat);
    baseWire.position.copy(baseMesh.position);
    laptopGroup.add(baseWire);

    // Trackpad
    const padGeo = new THREE.PlaneGeometry(1.0, 0.7);
    const padMesh = new THREE.Mesh(
      padGeo,
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.5 })
    );
    padMesh.rotation.x = -Math.PI / 2;
    padMesh.position.set(0, -0.32, 0.6);
    laptopGroup.add(padMesh);

    // Keyboard keys
    const keyGroup = new THREE.Group();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 10; c++) {
        const keyGeo = new THREE.BoxGeometry(0.24, 0.03, 0.22);
        const keyMesh = new THREE.Mesh(
          keyGeo,
          new THREE.MeshBasicMaterial({ color: 0x93c5fd, wireframe: true, transparent: true, opacity: 0.45 })
        );
        keyMesh.position.set(-1.35 + c * 0.3, -0.32, -0.7 + r * 0.3);
        keyGroup.add(keyMesh);
      }
    }
    laptopGroup.add(keyGroup);

    // Screen lid
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, -0.33, -1.2);
    lidGroup.rotation.x = -0.32;
    laptopGroup.add(lidGroup);

    const lidGeo = new THREE.BoxGeometry(3.6, 2.4, 0.08);
    const lidBack = new THREE.Mesh(lidGeo, chassisMat);
    lidBack.position.set(0, 1.2, 0);
    lidGroup.add(lidBack);

    const screenDisplayGeo = new THREE.PlaneGeometry(3.4, 2.2);
    const screenDisplay = new THREE.Mesh(screenDisplayGeo, glassScreenMat);
    screenDisplay.position.set(0, 1.2, 0.045);
    lidGroup.add(screenDisplay);

    const screenWire = new THREE.Mesh(lidGeo, wireBlueMat);
    screenWire.position.set(0, 1.2, 0);
    lidGroup.add(screenWire);

    // Code lines on screen
    const codeLineGroup = new THREE.Group();
    lidGroup.add(codeLineGroup);
    for (let i = 0; i < 9; i++) {
      const lineGeo = new THREE.PlaneGeometry(1.0 + (i % 3) * 0.4, 0.04);
      const lineMesh = new THREE.Mesh(
        lineGeo,
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x2563eb : 0x06b6d4,
          transparent: true,
          opacity: 0.6,
        })
      );
      lineMesh.position.set(-0.7, 1.8 - i * 0.16, 0.048);
      codeLineGroup.add(lineMesh);
    }

    // Holographic HUD cards
    const hudGeo1 = new THREE.PlaneGeometry(1.4, 0.95);
    const hudMat1 = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.45 });
    const hud1 = new THREE.Mesh(hudGeo1, hudMat1);
    hud1.position.set(-2.1, 1.3, 0.5);
    hud1.rotation.y = 0.42;
    laptopGroup.add(hud1);

    const hudGeo2 = new THREE.PlaneGeometry(1.3, 1.4);
    const hudMat2 = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.45 });
    const hud2 = new THREE.Mesh(hudGeo2, hudMat2);
    hud2.position.set(2.3, 1.0, 0.4);
    hud2.rotation.y = -0.45;
    laptopGroup.add(hud2);

    // Floating academic data nodes (spheres)
    const nodesGroup = new THREE.Group();
    laptopGroup.add(nodesGroup);
    const nodePositions = [
      [-0.7, 1.7, 0.3],
      [0.1, 1.9, 0.3],
      [0.7, 1.6, 0.3],
      [-0.3, 1.2, 0.3],
      [0.4, 1.1, 0.3],
      [0.8, 0.8, 0.3],
      [1.9, 1.7, 0.5],
      [2.4, 1.3, 0.5],
      [2.1, 0.7, 0.5],
    ];
    const sphereGeo = new THREE.SphereGeometry(0.048, 12, 12);
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0x2563eb, emissive: 0x38bdf8, shininess: 80 });
    nodePositions.forEach((pos) => {
      const node = new THREE.Mesh(sphereGeo, sphereMat);
      node.position.set(...pos);
      nodesGroup.add(node);
    });

    // Orbit rings
    const ringGeo1 = new THREE.TorusGeometry(3.3, 0.015, 8, 64);
    const ringMesh1 = new THREE.Mesh(
      ringGeo1,
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.45 })
    );
    ringMesh1.rotation.x = Math.PI / 3;
    laptopGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(2.5, 0.012, 8, 64);
    const ringMesh2 = new THREE.Mesh(
      ringGeo2,
      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.4 })
    );
    ringMesh2.rotation.x = -Math.PI / 4;
    ringMesh2.rotation.y = Math.PI / 5;
    laptopGroup.add(ringMesh2);

    // Particles
    const particlesCount = 280;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.032, transparent: true, opacity: 0.55 });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    laptopGroup.rotation.y = -0.36;
    laptopGroup.rotation.x = 0.1;
    laptopGroup.position.y = -0.15;

    let targetX = -0.36;
    let targetY = 0.1;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = -0.36 + normX * 0.26;
      targetY = 0.1 - normY * 0.18;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!leftCanvasRef.current) return;
      const w = leftCanvasRef.current.clientWidth;
      const h = leftCanvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      laptopGroup.position.y = -0.15 + Math.sin(elapsedTime * 1.4) * 0.08;
      ringMesh1.rotation.z += 0.003;
      ringMesh2.rotation.z -= 0.004;
      particleSystem.rotation.y = elapsedTime * 0.015;

      hud1.position.y = 1.3 + Math.cos(elapsedTime * 2) * 0.04;
      hud2.position.y = 1.0 + Math.sin(elapsedTime * 1.8) * 0.04;

      laptopGroup.rotation.y += (targetX - laptopGroup.rotation.y) * 0.05;
      laptopGroup.rotation.x += (targetY - laptopGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerEl && renderer.domElement) {
        containerEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  // -------------------------------------------------------------
  // RIGHT PANEL: Ambient 3D Geometric Ecosystem (Three.js)
  // -------------------------------------------------------------
  useEffect(() => {
    const containerEl = rightCanvasRef.current;
    if (!containerEl) return;

    const width = containerEl.clientWidth || 800;
    const height = containerEl.clientHeight || 900;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    containerEl.innerHTML = '';
    containerEl.appendChild(renderer.domElement);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambLight);

    const blueLight = new THREE.DirectionalLight(0x3b82f6, 1.4);
    blueLight.position.set(4, 6, 4);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 16);
    purpleLight.position.set(-3, -3, 3);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.5, 12);
    cyanLight.position.set(2, -4, 2);
    scene.add(cyanLight);

    const bgGroup = new THREE.Group();
    scene.add(bgGroup);

    // 1. Large 3D Wireframe Icosahedron (Top-Right)
    const icoGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const icoMat = new THREE.MeshPhongMaterial({
      color: 0x93c5fd,
      emissive: 0x2563eb,
      shininess: 80,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(3.4, 2.4, -1.8);
    bgGroup.add(icoMesh);

    // 2. Crystal Octahedron with soft translucent shell (Bottom-Left)
    const octGeo = new THREE.OctahedronGeometry(1.9, 0);
    const octMat = new THREE.MeshPhongMaterial({
      color: 0x60a5fa,
      emissive: 0xbfdbfe,
      shininess: 100,
      transparent: true,
      opacity: 0.22,
    });
    const octMesh = new THREE.Mesh(octGeo, octMat);
    octMesh.position.set(-3.5, -2.6, -1.2);
    bgGroup.add(octMesh);

    const octWireMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const octWire = new THREE.Mesh(octGeo, octWireMat);
    octMesh.add(octWire);

    // 3. Floating 3D Torus Rings
    const torusGeo = new THREE.TorusGeometry(3.6, 0.02, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.35,
    });
    const torus1 = new THREE.Mesh(torusGeo, torusMat);
    torus1.rotation.x = Math.PI / 3;
    torus1.rotation.y = Math.PI / 5;
    bgGroup.add(torus1);

    const torus2Geo = new THREE.TorusGeometry(2.8, 0.015, 16, 100);
    const torus2Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.3,
    });
    const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
    torus2.rotation.x = -Math.PI / 4;
    torus2.rotation.z = Math.PI / 6;
    bgGroup.add(torus2);

    // 4. Floating 3D Geometric Cubes
    const cubeGroup = new THREE.Group();
    bgGroup.add(cubeGroup);
    const cubeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const cubeMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const cubes = [];
    const cubePositions = [
      [-3.2, 3.0, -0.6],
      [3.3, -2.6, -0.8],
      [-2.6, -0.6, -2],
      [3.0, 0.6, -1.5],
    ];
    cubePositions.forEach((pos) => {
      const c = new THREE.Mesh(cubeGeo, cubeMat);
      c.position.set(...pos);
      cubeGroup.add(c);
      cubes.push(c);
    });

    // 5. 3D Floating Particle Constellation
    const particleCount = 200;
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 18;
      particlePos[i + 1] = (Math.random() - 0.5) * 16;
      particlePos[i + 2] = (Math.random() - 0.5) * 10;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.045,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    bgGroup.add(particleSystem);

    // Mouse tilt tracking
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotX = normY * 0.15;
      targetRotY = normX * 0.2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!rightCanvasRef.current) return;
      const w = rightCanvasRef.current.clientWidth;
      const h = rightCanvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      icoMesh.rotation.x = elapsedTime * 0.12;
      icoMesh.rotation.y = elapsedTime * 0.16;
      icoMesh.position.y = 2.4 + Math.sin(elapsedTime * 1.2) * 0.18;

      octMesh.rotation.x = -elapsedTime * 0.15;
      octMesh.rotation.z = elapsedTime * 0.1;
      octMesh.position.y = -2.6 + Math.cos(elapsedTime * 1.3) * 0.15;

      torus1.rotation.z += 0.003;
      torus2.rotation.z -= 0.004;

      cubes.forEach((c, idx) => {
        c.rotation.x += 0.008 * (idx + 1);
        c.rotation.y += 0.006 * (idx + 1);
      });

      particleSystem.rotation.y = elapsedTime * 0.02;

      bgGroup.rotation.x += (targetRotX - bgGroup.rotation.x) * 0.04;
      bgGroup.rotation.y += (targetRotY - bgGroup.rotation.y) * 0.04;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerEl && renderer.domElement) {
        containerEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailRegex.test(val.trim())) {
      setEmailError('');
    }
  };

  const redirectByRole = (user) => {
    if (from) {
      navigate(from, { replace: true });
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address (e.g. engineer@institution.edu).');
      setNotification({
        type: 'error',
        title: 'Validation Notice',
        message: 'Please provide a valid email address.',
      });
      return;
    }

    if (!password || password.length < 6) {
      setNotification({
        type: 'error',
        title: 'Security Policy Warning',
        message: 'Password credentials must meet security thresholds (minimum 6 characters).',
      });
      return;
    }

    setEmailError('');
    setNotification(null);
    setIsSubmitting(true);

    try {
      const result = await dispatch(loginUser({ email: trimmedEmail, password })).unwrap();
      setIsSuccess(true);
      setNotification({
        type: 'success',
        title: 'Workspace Synchronized',
        message: 'Identity confirmed. Allocating research workspace...',
      });
      toast.success(`Access Granted. Welcome back, ${result.user?.name || 'Researcher'}!`);

      setTimeout(() => {
        redirectByRole(result.user);
      }, 900);
    } catch (err) {
      setIsSubmitting(false);
      setIsSuccess(false);
      const errMsg = typeof err === 'string' ? err : 'Authentication sequence failed. Check credentials.';
      setNotification({
        type: 'error',
        title: 'Authentication Error',
        message: errMsg,
      });
      toast.error(errMsg);
    }
  };

  return (
    <div className="h-full min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      {/* Full Desktop Split Container */}
      <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 relative bg-white">
        {/* ======================================================== */}
        {/* LEFT PANEL: 3D INTERACTIVE WORKSTATION (LIGHT THEME)     */}
        {/* ======================================================== */}
        <section className="hidden lg:flex relative min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50/40 border-r border-slate-200/80 overflow-hidden flex-col justify-between p-6 lg:p-10">
          {/* Subtle Architectural Background Grid & Light Radial Glow */}
          <div className="absolute inset-0 blueprint-grid pointer-events-none opacity-70"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/25 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Bar / Terminal Header */}
          <header className="relative z-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl">
              <img
                src="/nova-icon.png"
                alt="Nova LMS Logo"
                className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-base text-slate-900">Nova</span>
                  <span className="font-extrabold tracking-tight text-base text-blue-600">LMS</span>
                </div>
                <p className="text-[11px] font-sans text-slate-500">Virtual Academy</p>
              </div>
            </Link>
          </header>

          {/* Center 3D Workstation Scene Layer */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div ref={leftCanvasRef} className="w-full h-full bg-transparent" style={{ display: 'block' }} />
          </div>
        </section>

        {/* ======================================================== */}
        {/* RIGHT PANEL: FULL-FIT AUTHENTICATION WITH 3D BACKGROUND   */}
        {/* ======================================================== */}
        <section className="relative min-h-screen w-full bg-slate-50/70 flex flex-col items-center justify-start lg:justify-center py-10 px-4 sm:px-8 lg:px-12 overflow-y-auto">
          {/* Dynamic Ambient Background Dots */}
          <div className="absolute inset-0 subtle-dots pointer-events-none opacity-50"></div>

          {/* Interactive 3D Background Layer (Right Panel) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div ref={rightCanvasRef} className="w-full h-full bg-transparent" style={{ display: 'block' }} />
          </div>

          {/* Floating Ambient Radial Glow Blobs for Depth */}
          <div className="absolute -top-24 -right-24 w-[460px] h-[460px] bg-gradient-to-br from-blue-200/40 to-indigo-200/30 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
          <div className="absolute -bottom-28 -left-20 w-[480px] h-[480px] bg-gradient-to-tr from-violet-200/35 via-sky-200/35 to-blue-200/25 rounded-full blur-3xl pointer-events-none animate-float-reverse"></div>
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-100/50 rounded-full blur-2xl pointer-events-none animate-pulse-subtle"></div>

          {/* Enlarged, High-Impact Auth Form Card */}
          <div className="relative z-10 w-full max-w-xl xl:max-w-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl shadow-blue-500/10 p-6 sm:p-10 lg:p-12 transition-all my-auto">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold">
              <img src="/nova-icon.png" alt="Nova LMS Logo" className="w-5 h-5 object-contain" />
              <span>Nova LMS</span>
            </div>

            {/* Heading */}
            <header className="mb-7">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 leading-tight">
                Welcome back
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Enter your academic credentials or single sign-on key to initialize your cloud research workspace.
              </p>
            </header>

            {/* Dynamic Status Notification Alert */}
            {notification && (
              <div
                className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm transition-all duration-300 ${
                  notification.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
                role="alert"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0">
                    {notification.type === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </span>
                  <div>
                    <h5 className="font-semibold">{notification.title}</h5>
                    <p className="text-xs mt-0.5 opacity-90">{notification.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form - Manual Entry */}
            <form className="space-y-5" onSubmit={handleLoginSubmit} autoComplete="off">
              {/* Email Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <span className="text-xs font-mono text-slate-500 tracking-wider">MANUAL CREDENTIAL</span>
                </div>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border ${
                      emailError ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300 focus:ring-blue-500'
                    } text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:border-blue-500 transition-colors shadow-sm`}
                  />
                </div>
                {emailError && <p className="text-xs text-rose-600 mt-1.5 font-medium">{emailError}</p>}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Quick Demo Fill Buttons for frictionless testing */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Demo Accounts:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('student@lms.com');
                    setPassword('Password123!');
                    setEmailError('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-mono text-[11px] font-semibold border border-blue-200 transition-colors cursor-pointer"
                >
                  Student (Jordan Lee)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('instructor@lms.com');
                    setPassword('Password123!');
                    setEmailError('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono text-[11px] font-semibold border border-purple-200 transition-colors cursor-pointer"
                >
                  Instructor (Prof. Alex)
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="submitBtn"
                  type="submit"
                  disabled={isSubmitting || reduxLoading}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 rounded-xl text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 ${
                    isSuccess
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600'
                  }`}
                >
                  {isSubmitting && !isSuccess ? (
                    <span className="flex items-center gap-2.5">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="font-mono text-sm">Authenticating...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footnote Links */}
            <div className="mt-8 text-center space-y-2 text-xs sm:text-sm">
              <p className="text-slate-600">
                Don't have an academic seat yet?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 ml-1"
                >
                  Create student account →
                </Link>
              </p>
              <p className="text-slate-500 text-xs">
                Enrolling via cohort grant or institutional campus license?{' '}
                <button
                  type="button"
                  onClick={() => toast.info('Lookup tool: Enter your institution domain (e.g., mit.edu, stanford.edu) to auto-map SAML endpoints.')}
                  className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Lookup university domain
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;