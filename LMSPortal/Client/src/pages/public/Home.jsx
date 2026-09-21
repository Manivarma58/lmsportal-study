import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFeaturedCourses, fetchCategories } from '../../store/slices/courseSlice';
import * as THREE from 'three';
import { toast } from 'sonner';
import NeuralBackground from '../../components/NeuralBackground';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featuredCourses } = useSelector((state) => state.courses);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const heroThreeContainerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchFeaturedCourses());
    dispatch(fetchCategories());
  }, [dispatch]);

  // -------------------------------------------------------------
  // Hero 3D Educational Environment (Three.js Light-Calibrated)
  // -------------------------------------------------------------
  useEffect(() => {
    const containerEl = heroThreeContainerRef.current;
    if (!containerEl) return;

    const width = containerEl.clientWidth || 600;
    const height = containerEl.clientHeight || 540;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.1, 8.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    containerEl.innerHTML = '';
    containerEl.appendChild(renderer.domElement);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 1.4);
    dirLight1.position.set(6, 9, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.0);
    dirLight2.position.set(-6, -3, 4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x8b5cf6, 1.8, 20);
    pointLight.position.set(0, 1, 4);
    scene.add(pointLight);

    // Master Hero Group
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // Light-calibrated Materials
    const enamelMat = new THREE.MeshPhongMaterial({ color: 0xf8fafc, emissive: 0xe2e8f0, shininess: 90 });
    const blueWireMat = new THREE.MeshBasicMaterial({ color: 0x2563eb, wireframe: true, transparent: true, opacity: 0.65 });
    const screenGlassMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xf1f5f9, shininess: 95, transparent: true, opacity: 0.92 });
    const gemPurpleMat = new THREE.MeshPhongMaterial({ color: 0x8b5cf6, emissive: 0x6d28d9, shininess: 90, transparent: true, opacity: 0.85 });
    const gemCyanMat = new THREE.MeshPhongMaterial({ color: 0x06b6d4, emissive: 0x0891b2, shininess: 90, transparent: true, opacity: 0.85 });

    // 1. Central 3D Laptop
    const laptopGroup = new THREE.Group();
    heroGroup.add(laptopGroup);

    // Laptop Base & wireframe
    const baseGeo = new THREE.BoxGeometry(3.6, 0.14, 2.4);
    const baseMesh = new THREE.Mesh(baseGeo, enamelMat);
    baseMesh.position.set(0, -0.6, 0);
    laptopGroup.add(baseMesh);

    const baseWire = new THREE.Mesh(baseGeo, blueWireMat);
    baseWire.position.copy(baseMesh.position);
    laptopGroup.add(baseWire);

    // Trackpad
    const padGeo = new THREE.PlaneGeometry(1.0, 0.65);
    const padMesh = new THREE.Mesh(padGeo, blueWireMat);
    padMesh.rotation.x = -Math.PI / 2;
    padMesh.position.set(0, -0.52, 0.6);
    laptopGroup.add(padMesh);

    // Screen Lid
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, -0.53, -1.15);
    lidGroup.rotation.x = -0.28;
    laptopGroup.add(lidGroup);

    const lidGeo = new THREE.BoxGeometry(3.6, 2.4, 0.08);
    const lidMesh = new THREE.Mesh(lidGeo, enamelMat);
    lidMesh.position.set(0, 1.2, 0);
    lidGroup.add(lidMesh);

    const lidWire = new THREE.Mesh(lidGeo, blueWireMat);
    lidWire.position.set(0, 1.2, 0);
    lidGroup.add(lidWire);

    const displayGeo = new THREE.PlaneGeometry(3.4, 2.2);
    const displayMesh = new THREE.Mesh(displayGeo, screenGlassMat);
    displayMesh.position.set(0, 1.2, 0.045);
    lidGroup.add(displayMesh);

    // Code Snippet lines on laptop screen (Clean Light IDE vibe)
    const codeLinesGroup = new THREE.Group();
    lidGroup.add(codeLinesGroup);
    for (let i = 0; i < 8; i++) {
      const lineW = 1.0 + (i % 3) * 0.45;
      const lineGeo = new THREE.PlaneGeometry(lineW, 0.045);
      const lineMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x2563eb : 0x7c3aed, transparent: true, opacity: 0.85 });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(-0.65 + (lineW - 1.2) / 2, 1.8 - i * 0.16, 0.05);
      codeLinesGroup.add(lineMesh);
    }

    // 2. Floating Futuristic Books
    const createBook = (x, y, z, rotX, rotY, rotZ, coverColor) => {
      const bookGroup = new THREE.Group();
      bookGroup.position.set(x, y, z);
      bookGroup.rotation.set(rotX, rotY, rotZ);

      const coverMat = new THREE.MeshPhongMaterial({ color: coverColor, shininess: 85 });
      const pagesMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, opacity: 0.85, transparent: true });

      const coverGeo = new THREE.BoxGeometry(1.2, 1.6, 0.22);
      const coverMesh = new THREE.Mesh(coverGeo, coverMat);
      bookGroup.add(coverMesh);

      const pagesGeo = new THREE.BoxGeometry(1.15, 1.55, 0.18);
      const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
      pagesMesh.position.set(0.04, 0, 0);
      bookGroup.add(pagesMesh);

      const edgeWire = new THREE.Mesh(coverGeo, blueWireMat);
      bookGroup.add(edgeWire);

      heroGroup.add(bookGroup);
      return bookGroup;
    };

    const book1 = createBook(-2.8, -0.4, 1.1, 0.4, 0.5, -0.2, 0x4f46e5);
    const book2 = createBook(-3.1, 1.3, -0.5, -0.3, 0.7, 0.3, 0x0284c7);
    const book3 = createBook(3.2, -0.2, 0.8, 0.3, -0.6, 0.2, 0x9333ea);

    // 3. Floating Course Cards & Code Snippet Panels
    const createCourseCard = (x, y, z, rotY, titleColor, accentColor) => {
      const cardGroup = new THREE.Group();
      cardGroup.position.set(x, y, z);
      cardGroup.rotation.y = rotY;

      const cardGeo = new THREE.PlaneGeometry(1.7, 1.1);
      const cardMesh = new THREE.Mesh(cardGeo, new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xf8fafc,
        transparent: true,
        opacity: 0.94,
        shininess: 90
      }));
      cardGroup.add(cardMesh);

      const wireMesh = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ color: accentColor, wireframe: true, transparent: true, opacity: 0.65 }));
      cardGroup.add(wireMesh);

      const barBackGeo = new THREE.PlaneGeometry(1.3, 0.07);
      const barBack = new THREE.Mesh(barBackGeo, new THREE.MeshBasicMaterial({ color: 0xe2e8f0 }));
      barBack.position.set(0, -0.32, 0.01);
      cardGroup.add(barBack);

      const barFillGeo = new THREE.PlaneGeometry(0.9, 0.07);
      const barFill = new THREE.Mesh(barFillGeo, new THREE.MeshBasicMaterial({ color: titleColor }));
      barFill.position.set(-0.2, -0.32, 0.02);
      cardGroup.add(barFill);

      const tagGeo = new THREE.PlaneGeometry(0.5, 0.12);
      const tagMesh = new THREE.Mesh(tagGeo, new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.75 }));
      tagMesh.position.set(-0.45, 0.32, 0.01);
      cardGroup.add(tagMesh);

      heroGroup.add(cardGroup);
      return cardGroup;
    };

    const card1 = createCourseCard(2.8, 1.4, 0.6, -0.45, 0x2563eb, 0x3b82f6);
    const card2 = createCourseCard(-2.4, 1.8, 0.9, 0.42, 0x7c3aed, 0xa855f7);
    const card3 = createCourseCard(2.4, -1.2, 1.2, -0.3, 0x059669, 0x10b981);

    // 4. Floating Geometric Objects
    const geo1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), gemPurpleMat);
    geo1.position.set(-1.8, -1.3, 1.8);
    heroGroup.add(geo1);

    const geo2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), gemCyanMat);
    geo2.position.set(2.0, 2.2, -0.6);
    heroGroup.add(geo2);

    const ringGeo = new THREE.TorusGeometry(3.6, 0.018, 8, 64);
    const ringMesh1 = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.45 }));
    ringMesh1.rotation.x = Math.PI / 3;
    heroGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(2.8, 0.014, 8, 64);
    const ringMesh2 = new THREE.Mesh(ringGeo2, new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.4 }));
    ringMesh2.rotation.x = -Math.PI / 4;
    ringMesh2.rotation.y = Math.PI / 6;
    heroGroup.add(ringMesh2);

    // 5. Clean Ambient Particle Field
    const particlesCount = 280;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = (Math.random() - 0.5) * 14;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.035, transparent: true, opacity: 0.55 });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    heroGroup.rotation.y = -0.25;
    heroGroup.rotation.x = 0.08;
    heroGroup.position.y = -0.1;

    let targetX = -0.25;
    let targetY = 0.08;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = -0.25 + normX * 0.35;
      targetY = 0.08 - normY * 0.22;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!heroThreeContainerRef.current) return;
      const w = heroThreeContainerRef.current.clientWidth;
      const h = heroThreeContainerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      laptopGroup.position.y = Math.sin(t * 1.5) * 0.08;
      book1.position.y = -0.4 + Math.sin(t * 1.8) * 0.09;
      book1.rotation.y += 0.003;
      book2.position.y = 1.3 + Math.cos(t * 1.6) * 0.1;
      book2.rotation.z += 0.002;
      book3.position.y = -0.2 + Math.sin(t * 2.0) * 0.08;

      card1.position.y = 1.4 + Math.cos(t * 1.7) * 0.09;
      card2.position.y = 1.8 + Math.sin(t * 1.4) * 0.08;
      card3.position.y = -1.2 + Math.sin(t * 1.9) * 0.07;

      geo1.rotation.x += 0.01;
      geo1.rotation.y += 0.012;
      geo2.rotation.y += 0.014;
      geo2.rotation.z += 0.008;

      ringMesh1.rotation.z += 0.003;
      ringMesh2.rotation.z -= 0.0035;
      particleSystem.rotation.y = t * 0.015;

      heroGroup.rotation.y += (targetX - heroGroup.rotation.y) * 0.06;
      heroGroup.rotation.x += (targetY - heroGroup.rotation.x) * 0.06;

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

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Subscribed to the Cyber-Academic Dispatch!');
    setNewsletterEmail('');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  // 4 Featured Industry & Research Courses
  const featuredCoursesList = [
    {
      id: 'course-llm-fine-tuning',
      title: 'Advanced LLM Fine-Tuning & Agentic Architectures',
      category: 'DEEP LEARNING',
      categorySlug: 'ai',
      level: 'ADVANCED',
      rating: '4.98',
      learners: '3,420',
      duration: '12 Weeks • 48 Labs',
      progress: 42,
      instructor: {
        name: 'Dr. Sarah Chen',
        role: 'AI Lead at DeepScale',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiZ_NCv5INw6ZMgNhKo_yA1K5I9-4RzPskx5-vVzQy69aMavBQnexZnNxZxPadySM8bByLz0DMKdV9G8TTjiix9aYowQ769_l84Cn4sDDepYDhQbSODVsaKX0exg60XuGMrmlNtp0x4ptIOKBynGXIiEXo3iBe5E_Kwfi7ZcihOnFvgrWYISxf6vVaE0jZwYKpf6XjUWb-zwsliv672nY4VFpgibMRvvrGKHj5B7KB6rYdBxBRvT58',
      },
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHY2uGqghKUHcLLzJYh8xbgZHfd4rTQMGqdHrMzn6s13rRaO1GfOzUlNyyt-qIYlBeINSzJVFIlN7V24kkox01HOko_CKHun4TFQnLO6TOgfPWmo2eVGpPsV0LEWigDuGvpUkkX-UT95CWs5ak5jPedenBAmtLOolKs5TY68CFrGGeS6LUNemRnzPTjJqz1-DXyDPJNZ8G-LoyAVv4u7hEsbwfEEYOE6dkW9iZye8eJeWrvpO4VU4m',
      fallbackImage: '/assets/course-quantum.jpg',
    },
    {
      id: 'course-cloud-kubernetes',
      title: 'Cloud Infrastructure & Distributed Kubernetes',
      category: 'CLOUD ARCHITECTURE',
      categorySlug: 'cloud',
      level: 'ADVANCED',
      rating: '4.95',
      learners: '2,810',
      duration: '10 Weeks • 36 Labs',
      progressStatus: 'Cohort Starting Nov 15',
      progressWidth: '15%',
      instructor: {
        name: 'Alex Rivera',
        role: 'Principal Architect at CloudMesh',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnZbzoATgDsAm1z-s13L25-D3WuDrsdyVdx0A3pSfoeWaYlX7Z7XcmTHksj6b_UqjC9-bP4qGgEY0ta-TTiTwP1V2mlhQNZt8n26mxxaS_ZqSS4Ag_wPlXtub5oEqeUCDdo9PCeem2eYKE5cH7iBgbtwVsBivlGAZt391bX8_jRattwXRyGJbVuv4Fwr09pyH6gWomTlJwtEADde3_56lQ8q00GNzwdqNymBI0Jen_at4L_0GmZc9V',
      },
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPetx5TUJLKfdZLIkbe9R6efAdhsGB6LPPlYW1lvm0l8tUVxxvcQevHc7xfpOo2T6Mrg1FnoYOE3VjD78FS7VnMlUqHQI9Ecy0wgoswkHmzUYoJ6EZzc3Tlm_49tEWELGdX70tAj2QGFXHh_RORyl4hFtJiH8-JDmh_xUwb7cZ_QpHIKB56JH_1ZQQ02JzfEM0qxenFZfbVvAfjJo9tNAMLQxm_9otfHIwi8uZ7iauJdFCo44gg4X5',
      fallbackImage: '/assets/course-cloud.jpg',
    },
    {
      id: 'course-cyber-defense',
      title: 'Zero-Trust Cyber Defense & Penetration Testing',
      category: 'CYBER DEFENSE',
      categorySlug: 'security',
      level: 'INTERMEDIATE',
      rating: '4.99',
      learners: '4,190',
      duration: '8 Weeks • 52 Labs',
      progressStatus: 'Enrolled (88% spots filled)',
      progressWidth: '88%',
      instructor: {
        name: 'Marcus Vance',
        role: 'Chief Security Fellow',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFUfy9CJ4KGoYg5ZM6an_7yKFUM8shNMpAE320axNnMLvuefM_ne6IWfhKQrUkxmWfPQyGf-d1BB2sYCpr3zflOqvIkZmFHn2sLvIv3VR9ze3_2gEqBUryXlCzwPrrv8iUXf3lSHvwEJQu1PoyX8KuAEqca-sNH7Vt6RmYHwGBOdKuuuTnO3mE6o27RrtP7UB8WTxVkRUlCMh9SJ4a11VmYzSGwnqyasr4oJq91G1hgp5-_w3GUg4s',
      },
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpW8hEWoa_a9ARkLfsnLm0Kw0Svjrj8dKALKHr4TNkfDE9pPdSk7nI-sqM_u8cIxJQcQNh11Gmshz20Dnb1CmKKuKHszve84q1lXjgwDP7-H83ALeKaxBOt3NsS4LolBMUzzTEh_mWs_yX0HopfIFNiNMgH3q45ktBSslNhKavABmYiMuag-d5fUP92z8ouWXCPw6FpwLX0ubRodvvDYJUuTCJxid2miAlxaJLwba-vhamOX-_J6Wa',
      fallbackImage: '/assets/course-cyber.jpg',
    },
    {
      id: 'course-embedded-rust',
      title: 'Autonomous Systems & Embedded WebGL Shaders',
      category: 'EMBEDDED RUST',
      categorySlug: 'systems',
      level: 'ADVANCED',
      rating: '4.92',
      learners: '1,640',
      duration: '14 Weeks • 60 Labs',
      progressStatus: 'Self-Paced Active',
      progressWidth: '20%',
      instructor: {
        name: 'Elena Rostov',
        role: 'Graphics Engineer',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOBR1gasA7tuRT3tiFuOzyezzhqP43WmDNqqh9CxluwPwm0Jw4L4nBz7OsT_cPfzwuVBNDsNDeKudXSR3t3K_KT5EkoDdjUhj1wZc1WvViSZg9fwPn137zteccwzqCiiMn1icS3qbFv_xIBJReG6VTzuKSW9wuj8-HMqddxyTbGPa3sxtfY4CdT-CaNHnQiPptMMbd6RSJGub4EgwbW91atW1y9YytOW67ZU6Ty1v4zqAfFiyUQQ1A',
      },
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAciwX-okBh4ymJZHa4hquSO4Od5UFMnOJNHmUYMvMj6XGJtB4BPkDTJyoWwTGzLxA8nDmtzEgA6oY5GNxvHctXHA0Z-N0PBytty2ufNOqiREcC09uJ-SsSC_GgQw7FJyE_19USN32xwinBiVT4A_4UiHPx26i2IRWSZJpS9g5mrsu5qtgZ1-0uTPbxdfHUQf3ocoKYmwKyHoWaTBq0iruan4KoqGKM-SNIL0AI0UWMD2TZOGL6kJiM',
      fallbackImage: '/assets/course-embedded.jpg',
    },
  ];

  const filteredCourses = activeCategoryFilter === 'all'
    ? featuredCoursesList
    : featuredCoursesList.filter((c) => c.categorySlug === activeCategoryFilter);

  // 7 Specialized Disciplines
  const disciplines = [
    {
      slug: 'development',
      title: 'Development',
      desc: 'Fullstack, Rust, Go, Distributed Microservices, High-throughput systems.',
      count: '48 Courses',
      icon: 'terminal',
      color: 'text-primary bg-primary-fixed',
    },
    {
      slug: 'data-science',
      title: 'Data Science',
      desc: 'Big Data, Pandas, Statistical Inference, Time-series analysis & telemetry.',
      count: '36 Courses',
      icon: 'analytics',
      color: 'text-secondary bg-secondary-fixed',
    },
    {
      slug: 'ai-ml',
      title: 'AI & Machine Learning',
      desc: 'LLMs, Diffusion Models, Transformers, PyTorch, Agentic frameworks.',
      count: '54 Courses',
      icon: 'neurology',
      color: 'text-tertiary bg-tertiary-fixed',
    },
    {
      slug: 'cloud',
      title: 'Cloud Computing',
      desc: 'AWS, GCP, Multi-region Terraform, Serverless runtimes & Kubernetes.',
      count: '42 Courses',
      icon: 'cloud_sync',
      color: 'text-primary bg-primary-fixed',
    },
    {
      slug: 'security',
      title: 'Cybersecurity',
      desc: 'Zero-Trust architecture, Reverse Engineering, Cryptography & Threat ops.',
      count: '30 Courses',
      icon: 'security',
      color: 'text-secondary bg-secondary-fixed',
    },
    {
      slug: 'business',
      title: 'Business & Strategy',
      desc: 'Product Strategy, Tech Leadership, SaaS Financial Models & Executive Ops.',
      count: '25 Courses',
      icon: 'business_center',
      color: 'text-on-surface bg-surface-container-highest',
    },
    {
      slug: 'design',
      title: 'Design & Spatial Systems',
      desc: 'Design Systems architecture, Three.js shaders, WebXR, and human-computer interaction heuristics.',
      count: '29 Courses',
      icon: 'polyline',
      color: 'text-tertiary bg-tertiary-fixed',
      spanCol: true,
    },
  ];

  // 6 Proven Milestones (Timeline)
  const timelineSteps = [
    { num: '01', title: 'Choose a course', desc: 'Discover domain-curated roadmaps tailored to your specific career goal.' },
    { num: '02', title: 'Enroll', desc: 'Instant sandbox initialization with zero local environment setup friction.' },
    { num: '03', title: 'Learn', desc: 'Digest high-density video lectures, interactive transcripts & architecture trees.' },
    { num: '04', title: 'Practice', desc: 'Write and execute code inside live in-browser cloud clusters and terminal sandboxes.' },
    { num: '05', title: 'Complete', desc: 'Submit peer-reviewed capstone projects evaluated by industry mentors.' },
    { num: '06', title: 'Earn certificate', desc: 'Receive an accredited verification credential recognized by top tier companies.' },
  ];

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* ============================================================ */}
      {/* FIXED TOP NAVIGATION HEADER (PROMINENT & FULL-WIDTH)        */}
      {/* ============================================================ */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]">
        <div className="h-20 w-full px-6 sm:px-10 lg:px-16 xl:px-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105">
                <span className="material-symbols-outlined text-white text-[22px]">deployed_code</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900">NOVA</span>
                  <span className="text-xl font-bold tracking-tight text-blue-600">LMS</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 px-1.5 py-0.5 bg-blue-50 rounded border border-blue-200 font-semibold">
                  EDUCATION_OS v4.8
                </span>
              </div>
            </Link>
          </div>

          {/* Central Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/90 shadow-inner">
            <Link to="/courses" className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all">
              Courses
            </Link>
            <a href="#instructors" className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all">
              Instructors
            </a>
            <a href="#categories" className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all">
              Categories
            </a>
            <Link to="/about" className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all">
              About
            </Link>
            <a href="#pricing" className="px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all">
              Pricing
            </a>
          </nav>

          {/* Right User / CTA Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <Link
                to={getDashboardPath()}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-md shadow-indigo-500/25 active:scale-98 transition-all flex items-center gap-2"
              >
                <span>Dashboard ({user.role})</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-md shadow-indigo-500/25 active:scale-98 hover:scale-[1.02] transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm"
            >
              Get Started
            </Link>
            <button
              aria-label="Open Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-6 py-5 space-y-3 shadow-xl">
            <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-800 font-semibold">
              Courses
            </Link>
            <a href="#instructors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-800 font-semibold">
              Instructors
            </a>
            <a href="#categories" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-800 font-semibold">
              Categories
            </a>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-800 font-semibold">
              About
            </Link>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-800 font-semibold">
              Pricing
            </a>
            <div className="pt-3 border-t border-slate-200 flex gap-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-1/2 py-2 text-center rounded-xl bg-slate-100 text-slate-800 font-semibold">
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-1/2 py-2 text-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/* MAIN CONTENT                                                 */}
      {/* ============================================================ */}
      <main className="w-full pt-20 bg-background">
        <div className="flex flex-col w-full">
          {/* ========================================================= */}
          {/* 1. HERO SECTION WITH 3D EDUCATIONAL ENVIRONMENT           */}
          {/* ========================================================= */}
          <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface via-surface-container-low/40 to-background pb-space-xl">
            {/* Live 3D Kinetic Neural Knowledge Cloud Background */}
            <NeuralBackground
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              opacity={0.7}
              nodeCount={55}
              maxLines={160}
              sphereRadius={12}
            />

            {/* Subtle blueprint & dot grid ambient vector */}
            <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern height="32" id="hero-dot-grid" patternUnits="userSpaceOnUse" width="32">
                    <circle cx="2" cy="2" fill="#004ac6" opacity="0.18" r="1.2"></circle>
                    <path d="M 32 0 L 0 0 0 32" fill="none" opacity="0.07" stroke="#2563eb" strokeWidth="0.5"></path>
                  </pattern>
                </defs>
                <rect fill="url(#hero-dot-grid)" height="100%" width="100%"></rect>
              </svg>
            </div>

            {/* Ambient luminous glows */}
            <div className="absolute top-16 left-1/4 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none"></div>
            <div className="absolute top-48 right-10 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-20 pt-8 lg:pt-14 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-center">
                {/* Left Column: Content */}
                <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start gap-6">
                  {/* Trust Badge Pill */}
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-slate-200">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                      ⚡ TRUSTED BY 10,000+ RESEARCHERS &amp; ENGINEERS
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      SYS::STABLE
                    </span>
                  </div>

                  {/* Main Headline (Prominent, High-impact) */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                    Learn Skills That<br />
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Move You Forward.
                    </span>
                  </h1>

                  {/* Supporting Copy */}
                  <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed">
                    NOVA LMS provides structured technical courses, verified expert instructors, live interactive progress telemetry, and career-focused learning designed for modern engineers and academics.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      to="/courses"
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:scale-98 transition-all duration-200"
                    >
                      <span>Explore Courses</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </Link>
                    <button
                      onClick={() => navigate('/courses')}
                      className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl font-bold text-base text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:shadow-md transition-all duration-200 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-blue-600 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_circle
                      </span>
                      <span>Start Learning</span>
                    </button>
                  </div>

                  {/* Trust Stats Bar */}
                  <div className="w-full grid grid-cols-3 gap-4 pt-6 mt-4 bg-white/90 border border-slate-200 p-5 rounded-2xl shadow-sm">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">98.4%</span>
                        <span className="text-xs text-emerald-600 font-bold">↑ +4.2%</span>
                      </div>
                      <span className="text-xs uppercase font-mono tracking-wider text-slate-500 mt-1">
                        Course Completion
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">450+</span>
                        <span className="text-xs text-blue-600 font-bold">ACTIVE</span>
                      </div>
                      <span className="text-xs uppercase font-mono tracking-wider text-slate-500 mt-1">
                        Interactive Labs
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">4.9/5</span>
                        <span className="material-symbols-outlined text-amber-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      </div>
                      <span className="text-xs uppercase font-mono tracking-wider text-slate-500 mt-1">
                        Satisfaction
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Hero 3D Canvas + Ambient Telemetry HUD */}
                <div className="lg:col-span-6 xl:col-span-6 relative w-full flex items-center justify-center">
                  <div className="relative w-full rounded-2xl p-2 bg-gradient-to-b from-white via-slate-50 to-white shadow-xl border border-slate-200">
                    {/* Floating HUD Badge Top-Left */}
                    <div className="absolute -top-3 left-6 z-20 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-md border border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                      <span className="text-[11px] font-mono font-bold uppercase text-blue-600">ACTIVE_RUNTIME: v4.8</span>
                    </div>

                    {/* Floating HUD Badge Top-Right */}
                    <div className="absolute -top-3 right-6 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-md border border-slate-200">
                      <span className="material-symbols-outlined text-indigo-600 text-[16px]">spatial_audio_off</span>
                      <span className="text-[11px] font-mono font-bold uppercase text-indigo-600">INTERACTIVE 3D HUD</span>
                    </div>

                    {/* 3D Educational Environment Container */}
                    <div className="relative w-full h-[520px] xl:h-[600px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-white">
                      <div ref={heroThreeContainerRef} className="w-full h-full bg-transparent" style={{ display: 'block' }} />

                      {/* In-canvas subtle HUD overlay metrics */}
                      <div className="absolute bottom-4 left-4 right-4 z-10 p-3.5 rounded-xl bg-white/95 backdrop-blur-md shadow-sm border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold text-slate-900">SANDBOX_NODE::HYPERVISOR</span>
                            <span className="text-[11px] font-mono text-slate-500">Latency: 9ms // Memory: 1.2GB/8GB</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
                          READY
                        </span>
                      </div>
                    </div>

                    {/* Floating HUD Bottom Badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white shadow-md border border-slate-200">
                      <span className="material-symbols-outlined text-blue-600 text-[16px]">touch_app</span>
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-700">PARALLAX ROTATION ENABLED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 2. COURSE PREVIEW SECTION (CURATED PATHS)                 */}
          {/* ========================================================= */}
          <section className="w-full py-space-xl bg-surface" id="courses">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-md bg-primary-fixed/60">
                    <span className="material-symbols-outlined text-primary text-[14px]">auto_stories</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">CURATED PATHS</span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                    Featured Industry &amp; Research Courses
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Hands-on curriculum engineered with real-world projects and interactive sandbox environments.
                  </p>
                </div>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1.5 font-headline-sm text-body-sm text-primary hover:text-primary-container transition-colors group"
                >
                  <span>Explore All 240+ Courses</span>
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>
              </div>

              {/* Course Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pb-10">
                {[
                  { id: 'all', label: 'All Courses' },
                  { id: 'ai', label: 'AI & Neural Systems' },
                  { id: 'cloud', label: 'Cloud & DevOps' },
                  { id: 'security', label: 'Cybersecurity' },
                  { id: 'systems', label: 'Web3 & Systems' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategoryFilter(tab.id)}
                    className={`px-4 py-2 rounded-lg font-headline-sm text-body-sm transition-all cursor-pointer ${
                      activeCategoryFilter === tab.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 4 Featured Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    className="group flex flex-col rounded-2xl bg-surface-container-lowest shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-200/80"
                  >
                    <div className="relative w-full h-48 overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={c.title}
                        src={c.image}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = c.fallbackImage;
                        }}
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-surface-container-lowest/90 backdrop-blur-md">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">{c.category}</span>
                      </div>
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-surface-container-high/90 text-on-surface font-label-sm text-label-sm font-semibold">
                        {c.level}
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-5 gap-3">
                      <div className="flex items-center gap-1 text-amber-500 font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span>{c.rating}</span>
                        <span className="text-on-surface-variant font-normal">({c.learners} learners)</span>
                      </div>

                      <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {c.title}
                      </h3>

                      {/* Instructor Info */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <img
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          alt={c.instructor.name}
                          src={c.instructor.avatar}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/instructor-elena.jpg';
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-body-sm text-on-surface">{c.instructor.name}</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{c.instructor.role}</span>
                        </div>
                      </div>

                      {/* Progress or Cohort Status */}
                      <div className="pt-2 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant">
                          <span>Status</span>
                          <span className="font-bold text-primary">{c.progress ? `${c.progress}% Complete` : c.progressStatus}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-primary to-tertiary"
                            style={{ width: c.progress ? `${c.progress}%` : c.progressWidth || '25%' }}
                          ></div>
                        </div>
                      </div>

                      {/* Card Footer Metrics & Action */}
                      <div className="mt-auto pt-3 flex items-center justify-between border-t border-surface-container-high">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{c.duration}</span>
                        <Link
                          to="/courses"
                          className="inline-flex items-center gap-1 font-headline-sm text-body-sm text-primary hover:text-primary-container font-semibold"
                        >
                          <span>Enroll Now</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 3. CATEGORIES SECTION (7 CATEGORIES BENTO GRID)           */}
          {/* ========================================================= */}
          <section className="w-full py-space-xl bg-surface-container-low/60" id="categories">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">
              <div className="flex flex-col items-center text-center gap-3 pb-12">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary-fixed/50">
                  <span className="material-symbols-outlined text-secondary text-[14px]">grid_view</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">EXPLORE DISCIPLINES</span>
                </div>
                <h2 className="font-display-lg text-headline-xl lg:text-display-lg text-on-surface tracking-tight">
                  Master the Frontiers of Technology
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Curated specialized tracks aligned with current engineering industry demands and technical research standards.
                </p>
              </div>

              {/* 7 Category Cards Grid (Bento style dynamic flow) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {disciplines.map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/courses?category=${encodeURIComponent(cat.slug)}`)}
                    className={`group p-6 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-lg hover:bg-surface-container-lowest/95 transition-all flex flex-col justify-between gap-4 border border-slate-200/80 cursor-pointer ${
                      cat.spanCol ? 'sm:col-span-2 md:col-span-3 lg:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${cat.color}`}>
                        <span className="material-symbols-outlined text-[26px]">{cat.icon}</span>
                      </div>
                      <span className="font-label-sm text-label-sm font-semibold px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                        {cat.count}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{cat.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 font-label-md text-label-md text-primary font-semibold">
                      <span>Explore Track</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. WHY NOVA LMS (THE NOVA ADVANTAGE - 6 FEATURES)         */}
          {/* ========================================================= */}
          <section className="w-full py-space-xl bg-surface" id="why-nova">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">
              <div className="flex flex-col items-center text-center gap-3 pb-14">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary-fixed/50">
                  <span className="material-symbols-outlined text-primary text-[14px]">bolt</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">THE NOVA ADVANTAGE</span>
                </div>
                <h2 className="font-display-lg text-headline-xl lg:text-display-lg text-on-surface tracking-tight">
                  Built for Serious Learners and Teams
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                  We eliminated static slides and toy code. NOVA LMS couples high-density pedagogical research with immediate live infrastructure execution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-4 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[26px]">pace</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Learn at your own pace</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Lifelong course access, downloadable offline material, asynchronous progress checkpointing, and adaptive video speed with interactive code transcripts.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:shadow-tertiary/5 transition-all duration-300 flex flex-col gap-4 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[26px]">school</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Expert instructors</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Taught exclusively by senior staff engineers, open-source maintainers, and university researchers vetted through double-blind peer reviews.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 flex flex-col gap-4 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[26px]">integration_instructions</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Practical projects</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Production-grade GitHub repositories, isolated Kubernetes environments, zero toy examples. Build software meant to survive stress tests.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-4 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[26px]">monitoring</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Progress tracking</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Real-time competency heatmaps, code complexity telemetry, and peer percentile ranking to accurately diagnose learning bottlenecks.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:shadow-tertiary/5 transition-all duration-300 flex flex-col gap-4 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[26px]">rule</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Automated assessments</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Automated code grading engine executes unit, memory, and concurrency tests instantly with clear diagnostic stack traces.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 flex flex-col gap-4 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[26px]">verified</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Industry certificates</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Cryptographically signed verification hashes, direct one-click LinkedIn badge integration, and verified employer lookup portals.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. HOW IT WORKS (CONNECTED 6-STEP ANIMATED TIMELINE)      */}
          {/* ========================================================= */}
          <section className="w-full py-space-xl bg-surface-container-low/40" id="timeline">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">
              <div className="flex flex-col items-center text-center gap-3 pb-16">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-tertiary-fixed/50">
                  <span className="material-symbols-outlined text-tertiary text-[14px]">route</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-bold">YOUR LEARNING JOURNEY</span>
                </div>
                <h2 className="font-display-lg text-headline-xl lg:text-display-lg text-on-surface tracking-tight">
                  A Proven Path from Fundamentals to Mastery
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Six standardized milestones designed to transition passive viewers into active production engineers.
                </p>
              </div>

              {/* Connected 6-step timeline container */}
              <div className="relative">
                <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-1 -translate-y-1/2 bg-gradient-to-r from-primary via-primary-container to-tertiary z-0 opacity-40 rounded-full"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
                  {timelineSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface-container-lowest shadow-md hover:-translate-y-1 transition-transform border border-slate-200/80"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
                        {step.num}
                      </div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">STEP {step.num}</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{step.title}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 6. INSTRUCTOR SECTION (SPLIT LAYOUT)                      */}
          {/* ========================================================= */}
          <section className="w-full py-space-xl bg-surface" id="instructors">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left: Dynamic visual presentation */}
                <div className="lg:col-span-6 relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-surface-container-high border border-slate-200">
                    <img
                      className="w-full h-[480px] object-cover"
                      alt="High-tech university studio lab with an educator presenting software architecture diagrams"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6rD7er50ZRd7LRPydm_L4HXNN24MrEfeBCDU9I2xWa6opW_M1r9ndbq0Jw0bX8kQhi-KlM0oFjgypmRmHZX7-k0OW71DgzEw-dMa7UcerO1jPuHYn7un__1s0-YsmpH4IGnC0XTEJaI5NLw_H9FOydd2FcA6g2-z03Mxk6-kn_htyfjzw4aieLeH6XUA4XuJbIN03evf4JifNXxrmeWWBD_2OV66YSij-MQ0muvpliCcrTQ3Rnpk1"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/instructor-elena.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent"></div>

                    {/* Floating Live Stat Overlay 1 */}
                    <div className="absolute top-6 left-6 p-3.5 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-lg flex items-center gap-3 border border-slate-200">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined text-[22px]">payments</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">$1.2M+</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Paid to Instructors</span>
                      </div>
                    </div>

                    {/* Floating Live Stat Overlay 2 */}
                    <div className="absolute top-6 right-6 p-3.5 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-lg flex items-center gap-3 border border-slate-200">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">public</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">40+</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Countries Represented</span>
                      </div>
                    </div>

                    {/* Instructor Highlight Card Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-surface-container-lowest/95 backdrop-blur-md shadow-xl flex items-center justify-between border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-tertiary p-0.5">
                          <div className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-body-md text-on-surface">Top 1% Industry Faculty</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Vetted through multi-stage technical reviews</span>
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-bold">
                        NOW HIRING
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Text Content & Benefits Checklist */}
                <div className="lg:col-span-6 flex flex-col items-start gap-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary-fixed/50">
                    <span className="material-symbols-outlined text-secondary text-[14px]">cast_for_education</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">TEACH ON NOVA LMS</span>
                  </div>
                  <h2 className="font-display-lg text-headline-xl lg:text-display-lg text-on-surface tracking-tight leading-tight">
                    Share what you know.
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                    Join an elite community of educators and tech pioneers. We provide full studio production assistance, automated curriculum sandbox tools, and market-leading royalty splits.
                  </p>

                  <div className="flex flex-col gap-3.5 w-full pt-2">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </div>
                      <span className="font-body-md text-body-md text-on-surface">
                        Dedicated curriculum designers and video production engineers to assist your recording workflow.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </div>
                      <span className="font-body-md text-body-md text-on-surface">
                        Live Q&amp;A tooling and interactive student coding terminals hosted directly on our global edge network.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </div>
                      <span className="font-body-md text-body-md text-on-surface">
                        Transparent revenue share up to 80% on cohort enrollments with monthly automated settlements.
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Link
                      to="/register?role=instructor"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-headline-sm text-body-md text-on-primary bg-primary hover:bg-primary-container shadow-lg shadow-primary/25 transition-all"
                    >
                      <span>Become an Instructor</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                    <Link
                      to="/about"
                      className="inline-flex items-center gap-2 px-5 py-3.5 rounded-lg font-headline-sm text-body-md text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors"
                    >
                      <span>Read Creator Guide</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 7. TESTIMONIALS SECTION (PROVEN OUTCOMES)                 */}
          {/* ========================================================= */}
          <section className="w-full py-space-xl bg-surface-container-low/40">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">
              <div className="flex flex-col items-center text-center gap-3 pb-14">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary-fixed/50">
                  <span className="material-symbols-outlined text-primary text-[14px]">reviews</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">PROVEN OUTCOMES</span>
                </div>
                <h2 className="font-display-lg text-headline-xl lg:text-display-lg text-on-surface tracking-tight">
                  Trusted by Developers Worldwide
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Hear how engineering leaders leverage NOVA LMS to upskill teams and break through technical ceilings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-md flex flex-col justify-between gap-6 hover:shadow-xl transition-all border border-slate-200/80">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                      “The hands-on sandbox environments and advanced LLM courses on NOVA gave me the exact production architectures our team needed. Unmatched pedagogical rigor.”
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5 pt-4 border-t border-surface-container-high">
                    <img
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      alt="Portrait of David Zhao"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDADfav8zg1iV_6WYySV_aiEzrIZcsdCgrsRsPCpjcXWlA4nRmBLR_H3jnCt7271oyXIrzv0hLrifSNnrbFlAStDZklDPNzg3ETU2lXfTUixaufJLWuwbUy4s6Aj201qxhEcXfTkjFCAVsJFSkY1XpWnpQD-_LlEbmsnpK4CYBc6uzzAX4iNpA8Tt0QAOf3C8EYjYiiqCHve2qlr_3qb1CQx1844cXQ73UIOc5nHLEfgW43-clKYM5n"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/instructor-elena.jpg';
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-body-md text-on-surface font-semibold">David Zhao</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Senior ML Engineer at Anthropic</span>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-md flex flex-col justify-between gap-6 hover:shadow-xl transition-all border border-slate-200/80">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                      “NOVA LMS is the first learning platform that treats engineering education with professional tooling. The live telemetry and project assessments are leagues ahead of old video-only platforms.”
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5 pt-4 border-t border-surface-container-high">
                    <img
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      alt="Portrait of Maria Lindqvist"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYAUyO2EMY3q2Q9A8NjE-PgHa1QIkJLRjjZLLOcDHCZvbeDt_qGuMGKrD5HjMLIIzFNnmbFLmE2F-ko_gn57XXwx8FDgiQnY9JAv_y4ULU-3-dj1INBamExz_CP8zaWnSY842oJXGwra2syYgelHQmgy8v-dDfOmY7Fv_e4DKL6XAH889LmLdMLWxgdAYj71Rvtd5_jZa3J55-c3sg83aJPYIeZC7g954d8zGpkfOUDO3HElJD8zdJ"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/instructor-elena.jpg';
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-body-md text-on-surface font-semibold">Maria Lindqvist</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Lead Cloud Architect at Ericsson</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-md flex flex-col justify-between gap-6 hover:shadow-xl transition-all border border-slate-200/80">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <p className="font-body-md text-body-md text-on-surface italic leading-relaxed">
                      “The hands-on reverse engineering and zero-trust labs were pure gold. Within 3 months I transitioned into a principal security engineering role.”
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5 pt-4 border-t border-surface-container-high">
                    <img
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      alt="Portrait of Karan Patel"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMundAtw5jj3vVA-Bq8djW-YtIp3LyISfn7PTth5VqLN4MP_hj6xqmm6CG5uI18TAOSIxsxXD-KFgJg1VIEjNQrq8gO5YoPYnp7LUTT6nkL4ds9_uyN9PtSFe_yC9XJ1N993iqGpU9OSuHHBmSp2qruCWoR87vDjBfXyT8ydhBkz0VK1En_7ALRMb7XbBFYIUNY7HiLktxN1y8LO7XYQ9bgGxahhhK6ZygeoiYysfDcgnfIKMh_duR"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/instructor-elena.jpg';
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-body-md text-on-surface font-semibold">Karan Patel</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Security Researcher at FalconSec</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 8. FINAL CTA SECTION                                      */}
          {/* ========================================================= */}
          <section className="w-full py-space-xl bg-surface" id="pricing">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-fixed/40 via-surface-container-high to-tertiary-fixed/30 p-8 md:p-16 shadow-lg text-center flex flex-col items-center border border-slate-200/90">
                <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary-container/10 blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-tertiary-container/10 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-container-lowest/80 shadow-sm backdrop-blur-md border border-slate-200/80">
                    <span className="material-symbols-outlined text-primary text-[14px]">rocket_launch</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">START YOUR ACCELERATION</span>
                  </div>

                  <h2 className="font-display-lg text-headline-xl lg:text-display-lg text-on-surface tracking-tight">
                    Your next skill starts here.
                  </h2>

                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Join over 10,000 engineers, scientists, and architects accelerating their careers with NOVA LMS.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link
                      to="/courses"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-headline-sm text-body-md text-on-primary bg-gradient-to-r from-primary-container to-tertiary shadow-lg shadow-primary-container/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <span>Explore Courses</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-7 py-4 rounded-lg font-headline-sm text-body-md text-on-surface bg-surface-container-lowest shadow-sm hover:bg-surface-container-lowest/90 transition-all border border-slate-200/80"
                    >
                      <span>Create Account</span>
                    </Link>
                  </div>

                  <p className="font-label-sm text-label-sm text-on-surface-variant pt-2">
                    No credit card required for trial access • Instant workspace provisioning
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ============================================================ */}
      {/* SITE FOOTER                                                  */}
      {/* ============================================================ */}
      <footer className="w-full bg-gradient-to-b from-surface-container-lowest via-surface-container-low to-surface-container shadow-[0_-1px_10px_rgba(0,0,0,0.02)] pt-space-xl pb-space-lg border-t border-slate-200">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl pb-space-xl border-b border-surface-container-highest/60">
            {/* Brand column */}
            <div className="lg:col-span-4 flex flex-col gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center shadow-[0_0_14px_-2px_rgba(37,99,235,0.3)]">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">deployed_code</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">NOVA</span>
                  <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold">LMS</span>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Next-generation learning management and interactive engineering workspace.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-space-xs mt-space-sm max-w-md">
                <div className="relative flex-1">
                  <input
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm shadow-[0_1px_4px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-primary-container/40 border border-slate-200"
                    placeholder="Enter your academic or corporate email"
                    required
                    type="email"
                  />
                </div>
                <button
                  className="h-11 px-5 rounded-lg bg-primary-container text-on-primary font-headline-sm text-body-sm shadow-[0_0_14px_-2px_rgba(37,99,235,0.3)] hover:bg-primary transition-colors cursor-pointer"
                  type="submit"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-space-lg">
              <div className="flex flex-col gap-space-sm">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold">Product</span>
                <ul className="flex flex-col gap-space-xs">
                  <li onClick={() => navigate('/courses')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Courses</li>
                  <li onClick={() => navigate('/courses')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Interactive Labs</li>
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Enterprise</li>
                  <li onClick={() => navigate('/verify/demo')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Certifications</li>
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">LMS Kernel</li>
                </ul>
              </div>

              <div className="flex flex-col gap-space-sm">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold">Company</span>
                <ul className="flex flex-col gap-space-xs">
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">About Us</li>
                  <li onClick={() => navigate('/contact')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Careers</li>
                  <li onClick={() => navigate('/contact')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Press</li>
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Research Papers</li>
                </ul>
              </div>

              <div className="flex flex-col gap-space-sm">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold">Resources</span>
                <ul className="flex flex-col gap-space-xs">
                  <li onClick={() => navigate('/courses')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Documentation</li>
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">System Status</li>
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">API Reference</li>
                  <li onClick={() => navigate('/contact')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Community</li>
                </ul>
              </div>

              <div className="flex flex-col gap-space-sm">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold">Support</span>
                <ul className="flex flex-col gap-space-xs">
                  <li onClick={() => navigate('/contact')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Help Center</li>
                  <li onClick={() => navigate('/contact')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Contact Advisor</li>
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Security / SOC2</li>
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">SLA</li>
                </ul>
              </div>

              <div className="flex flex-col gap-space-sm">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-semibold">Legal</span>
                <ul className="flex flex-col gap-space-xs">
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Privacy Policy</li>
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Terms of Service</li>
                  <li onClick={() => navigate('/about')} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface cursor-pointer">Compliance</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-space-md">
              <span className="font-body-sm text-body-sm text-on-surface-variant">© 2025 NOVA LMS Architecture Inc. All rights reserved.</span>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container-high font-label-sm text-label-sm text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                <span>SYS.STATUS: ALL SYSTEMS OPERATIONAL // LATENCY: 14MS</span>
              </div>
            </div>

            <div className="flex items-center gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline mr-2">Connect</span>
              <a
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                title="Code Repository"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
              </a>
              <a
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                title="Transmission Feed"
              >
                <span className="material-symbols-outlined text-[18px]">rss_feed</span>
              </a>
              <a
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                title="Neural Forum"
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
              </a>
              <a
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                title="Professional Network"
              >
                <span className="material-symbols-outlined text-[18px]">hub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;