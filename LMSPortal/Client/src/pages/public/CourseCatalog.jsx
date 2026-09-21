import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import NeuralBackground from '../../components/NeuralBackground';

const FLAGSHIP_COURSES = [
  {
    dbSlug: 'neural-networks-quantum-computing',
    title: 'Neural Networks & Quantum Computing',
    description: 'Architect qubit entanglement algorithms, tensor contractions, and deep quantum neural models.',
    category: 'AI & Machine Learning',
    quickTag: 'Quantum Computing',
    badge: 'QUANTUM AI',
    badgeColor: 'text-tertiary',
    dotColor: 'bg-tertiary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Elena Vance',
    role: 'Stanford AI Fellow',
    avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra',
    rating: '4.9',
    reviews: '1.8k',
    duration: '8 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '36 Modules',
    students: '14.2k',
    price: 299,
    priceNote: 'or Pro Pass',
    thumbnail: 'https://lh3.googleusercontent.com/aida/AEtjO1WA2QKYp56ULqNkaQsEyA_BrM7NhSYMMRbB1cumOw8P6J20BtEcRCdKwa8jKQxBlJfEPm_IU4IaaQHZgBXej05hv3_lIy3KW4w8kpq6VCRFrjnWdlQn6QysZel6NtUjwF-hVBe_lyngLokFEddb25zZjWTOOMMac3ezWM3CNTeRGvDp9TCIETH1XLEP3oXvM6gQozcVKO7RHuLI7FBJjNp1O2SVAHQUsBnweNw8Fq6uUn79eaNmBo2P_Q',
  },
  {
    dbSlug: 'cyber-defense-cryptographic-security',
    title: 'Cyber Defense & Cryptographic Security',
    description: 'Elliptic curve primitives, zero-trust perimeter telemetry, and live red/blue offensive simulations.',
    category: 'Cybersecurity & Crypto',
    quickTag: 'Cryptographic Security',
    badge: 'CYBER DEFENSE',
    badgeColor: 'text-secondary',
    dotColor: 'bg-secondary',
    level: 'Intermediate Specialist',
    levelPill: 'INTERMEDIATE',
    levelBg: 'bg-tertiary-container/90 text-on-tertiary',
    instructor: 'Marcus Lin, CISSP',
    role: 'Senior Infosec Director',
    initials: 'ML',
    rating: '4.8',
    reviews: '2.4k',
    duration: '6 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '28 Modules',
    students: '18.9k',
    price: 349,
    priceNote: 'Cert Included',
    thumbnail: 'https://lh3.googleusercontent.com/aida/AEtjO1XYCe-7hewjg1pRJFnH9kPGFyCutNx1YjEDZtE2lSvxJjrODTuCXAt0m7JctLKSZiffmtPsmSmnTawNY5R6-5-Ob_zXUWtguj0SYlClTV0mZA5SqHfWWk7Il1tikydFuvQH-XzQpjMURJXhUIgZ1LywSg3zxl-xMx27C1xLmd2Ncol9BponR6DujBGDLrVQtWNGYAbtek_r0rG6nM9b5Gpp3YnFhqZ943oWET02FpMMv0IyuCHyV4TBHw',
  },
  {
    dbSlug: 'cloud-architecture-kubernetes-clusters',
    title: 'Cloud Architecture & Kubernetes Clusters',
    description: 'Multi-cloud mesh routing, eBPF telemetry, GitOps pipelines with ArgoCD and Helm.',
    category: 'Cloud Architecture & DevOps',
    quickTag: 'Cloud & K8s',
    badge: 'CLOUD & K8S',
    badgeColor: 'text-primary',
    dotColor: 'bg-primary',
    level: 'Advanced Masterclass',
    levelPill: 'EXPERT LEVEL',
    levelBg: 'bg-primary-container text-on-primary-container',
    instructor: 'Sora Takahashi',
    role: 'Cloud Native Architect',
    initials: 'ST',
    rating: '4.95',
    reviews: '3.1k',
    duration: '10 Weeks',
    durationGroup: '8–12 Weeks',
    modules: '42 Modules',
    students: '22.7k',
    price: 389,
    priceNote: 'GPU Lab Ready',
    thumbnail: 'https://lh3.googleusercontent.com/aida/AEtjO1UWJi_zvxl4FfMeH_m39u_FwWebA47JcZAWq80ocm3nI_Twk4jReqfo0BSo1CBwV6i3e2WmpYXQItoWGA_HrU8kzPhKoQU3JrnZCXoFR33L0blbIrGtDW_OLc9GPUqM1fvaw3wBZd7n7DrAQK48DL_odRTdI0lv-mdODSAs9fbJAAVBlnzdwafOdIshLxz9mlUIw2m2U7ttWO4SG9tUo3YmwnDt6m93tXgrl_HWSYRFgnWFU94AnOUB4Q',
  },
  {
    dbSlug: 'zero-knowledge-proofs-rust',
    title: 'Zero-Knowledge Proofs in Rust',
    description: 'Build zk-SNARKs and Plonk verifiers from mathematical scratch using Rust memory safety.',
    category: 'Systems & Rust',
    quickTag: 'Rust Systems',
    badge: 'RUST & ZK',
    badgeColor: 'text-primary-container',
    dotColor: 'bg-primary-container',
    level: 'Research Fellow Cohort',
    levelPill: 'FELLOW',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Aris Thorne',
    role: 'Cryptography Lead',
    initials: 'AT',
    rating: '4.88',
    reviews: '920',
    duration: '8 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '32 Modules',
    students: '6.4k',
    price: 420,
    priceNote: 'Pro Pass',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzdA1VT7Ut6NwesWmle9fiWMlK2JKW-SJWMf1JJRnIbsPbPxboQ1CC6cMFYM1Dhl-ibnZMHrmlWAiYFRtNjpuuvfW4KGbVRY8cZ66R6-S65AAP4LEZaBUGsM6fxmUVJlV1Q2p8Y_EEp3Md35y7z-JFckma-QKIXAJX0weNFk-WDTlF5SxCkddADczx_ogfEiDvPfdfCWM8ujWR9M7f0aRdY8aF-ezu35dO_viRsFEFrbN_tsU36dU',
  },
  {
    dbSlug: 'autonomous-vector-databases-rag',
    title: 'Autonomous Vector Databases & RAG',
    description: 'HNSW indexing, sparse-dense hybrid search algorithms, and high-throughput embedding stores.',
    category: 'Data Engineering',
    quickTag: 'Neural Networks',
    badge: 'DATA PIPELINES',
    badgeColor: 'text-tertiary',
    dotColor: 'bg-tertiary',
    level: 'Intermediate Specialist',
    levelPill: 'INTERMEDIATE',
    levelBg: 'bg-surface-container-high text-on-surface',
    instructor: 'Dr. Elena Vance',
    role: 'Stanford AI Fellow',
    avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra',
    rating: '4.92',
    reviews: '1.1k',
    duration: '5 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '24 Modules',
    students: '11.5k',
    price: 275,
    priceNote: 'or Pro Pass',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBteN_zWY4HqAi96FB218I_VwbooWHZi5Tr4WnI9TKO85xEmxZbX7Iqc4E-8fW3JjgqLCFgrSevqRisDsqJ4rom-m-7T7pfTo62Gj6ge3FQwNuxzUqpa2pmUE9ktzeeayy74_ena7bQ8uGWhW5hDikiqa7QDrnOpJ6LGdGtFsAWBhuLonJ4r56RFSQnPLXjxvX0rKv-_R7as8i5aI5C_mLa_pQmRp1ONUwmft4NEpskioqhlbG0dPs',
  },
  {
    dbSlug: 'deep-reinforcement-learning-robotics',
    title: 'Deep Reinforcement Learning in Robotics',
    description: 'PPO, SAC policies, and Isaac Sim physics rendering for sim-to-real robotic control systems.',
    category: 'Autonomous Robotics',
    quickTag: 'Neural Networks',
    badge: 'ROBOTICS & RL',
    badgeColor: 'text-secondary',
    dotColor: 'bg-secondary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Prof. Kimberly Chen',
    role: 'Robotics Lab Chair',
    initials: 'KC',
    rating: '4.89',
    reviews: '780',
    duration: '12 Weeks',
    durationGroup: '12+ Weeks',
    modules: '48 Modules',
    students: '8.2k',
    price: 499,
    priceNote: 'Sim-Lab Pass',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzFOyzBOQXg17RqjjDkP55EuSVunK4scV8qXZsnI6Ok5LpCMe1EqiLmfTbUkOR53ONbH0Bs5yqnL_m0TAO-8ge4LL9c-azklzlegnHsG8ziY2f9iMICBCzSQed4i_f9BRgn1yahZznodRtYcz500Sqv-H3l46j_WPGEq6EjXNXoVoQcAUApaKhsTH_7aymZjB45Bq4hqNiEIn_2Om2LRKS5yBVVB2kGEMUXfYiUJ4dV4TiEn5s0Ig',
  },
  {
    dbSlug: 'distributed-systems-consensus',
    title: 'Distributed Systems & Consensus',
    description: 'Raft consensus, Paxos protocol mechanics, gossip replication, and split-brain recovery techniques.',
    category: 'Cloud Architecture & DevOps',
    quickTag: 'Cloud & K8s',
    badge: 'SYSTEMS',
    badgeColor: 'text-primary',
    dotColor: 'bg-primary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Sora Takahashi',
    role: 'Distributed Engines',
    initials: 'ST',
    rating: '4.94',
    reviews: '1.5k',
    duration: '7 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '30 Modules',
    students: '13.8k',
    price: 310,
    priceNote: 'or Pro Pass',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIsRE0jaXh87Y4YGXLnC8Ndvz0LFUF9pA6rbDzkirxQNUHAbBv1hAjZ35s6pfErygIhxGy1iZiP6AtliRttXv9kA6cY1f9PHzrs7v3Il0DtW76G2-iFdzbklzlJYBeu1pzATSQYGVe5Z2edt17HE9dF140U_hEXRMYn-mFeXD9LRZpv9Zdo7CrHWm8woWh2Tsr9RpPqlUMPKhrGUxcu5dB0UZf34m1kbsM2lcdcZkqyIDpIa2pqNY',
  },
  {
    dbSlug: 'applied-homomorphic-encryption',
    title: 'Applied Homomorphic Encryption',
    description: 'Execute computation over ciphertext with CKKS and BGV schemes for privacy-preserving AI inference.',
    category: 'Cybersecurity & Crypto',
    quickTag: 'Cryptographic Security',
    badge: 'ENCRYPTION',
    badgeColor: 'text-secondary',
    dotColor: 'bg-secondary',
    level: 'Research Fellow Cohort',
    levelPill: 'FELLOW',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Aris Thorne',
    role: 'Cryptography Lead',
    initials: 'AT',
    rating: '4.87',
    reviews: '640',
    duration: '6 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '26 Modules',
    students: '4.1k',
    price: 450,
    priceNote: 'Pro Pass',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC843NkS3ZEvM_A64fOKW1x96r2ygKLu6FmfpxF0yK2beFmphvFUFr1FFcALi3glMf9HkSFO7srHScMp4Q-ChWCcTglRuuSxdhYOqy0d_MSmO2PfkBp5mTlm414oayfVMaVgybTNfYhTQH36PdJ9ZWS3RaNbjRm1_aXEx0XZxg8F2RMz3i5A25_uMy1sr7RzXCDINcUAUclonfSfxwDPaP4-G6cGJycb_Bmo7QRRF8fKRFfqXYWC4s',
  },
  {
    dbSlug: 'gpu-kernel-dev-triton-cuda',
    title: 'GPU Kernel Dev with Triton & CUDA',
    description: 'Master block-level SRAM memory tiling, fused matrix multiplications, and custom FlashAttention kernels.',
    category: 'Systems & Rust',
    quickTag: 'Rust Systems',
    badge: 'GPU SYSTEMS',
    badgeColor: 'text-primary',
    dotColor: 'bg-primary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Elena Vance',
    role: 'Hardware Acceleration',
    avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra',
    rating: '4.97',
    reviews: '2.1k',
    duration: '9 Weeks',
    durationGroup: '8–12 Weeks',
    modules: '38 Modules',
    students: '16.3k',
    price: 380,
    priceNote: 'A100 Sandbox',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAFkToc3XrOqA6euujepn29KxKAwOjpnzW2ybhjoV6sXZp-Pp2aR384xLwQI63WMoKTfEqDhDfJG8Qq_81Qdwg-J1irjjWA8ZA2l-pOXBerE9Zm93TbAyBXrprhdX1x9gu8YALM3KEnY1yjzZl3saSLYhfO8OmXkrI-BPNmJNdAlozG_bdSFbtmaEE2fuqfERW66nfgpUS6T2pts1UkfA6fSoTMPcvlp8UwsrVoPCHA0bIMewfvKQ',
  },
  {
    dbSlug: 'ebpf-linux-observability-telemetry',
    title: 'eBPF Linux Observability & Telemetry',
    description: 'Build kernel-space tracepoints, packet filtering with XDP, and zero-overhead observability daemons.',
    category: 'Cloud Architecture & DevOps',
    quickTag: 'Cloud & K8s',
    badge: 'KERNEL OPS',
    badgeColor: 'text-tertiary',
    dotColor: 'bg-tertiary',
    level: 'Intermediate Specialist',
    levelPill: 'INTERMEDIATE',
    levelBg: 'bg-tertiary-container/90 text-on-tertiary',
    instructor: 'Sora Takahashi',
    role: 'Linux Kernel Engineer',
    initials: 'ST',
    rating: '4.86',
    reviews: '1.3k',
    duration: '6 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '25 Modules',
    students: '10.1k',
    price: 260,
    priceNote: 'Live Lab',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjjH6rvWVawLLJqRCFqtoOTCL7pzxI0CFWJ1DRBauA1t-Rzmye5bKLXfJUBNw2bZShoFEViaDPif9QVWIHmUiThzsPabU9keYWgCCcDs3_qf_wbQR_KnCuId5chUZAYQZHT2kd0ds1I9Gd2hSv1BhT0IsrxZsKi0QQjQq2Sx40eAs6c-HMdaohebQnSOTwlg_zNxz86oOP0loqUs4prGYE83g2YhYR50m6WLqdNMIdHq2m1HY64Ps',
  },
  {
    dbSlug: 'llm-fine-tuning-lora-awq',
    title: 'LLM Fine-Tuning, LoRA & AWQ',
    description: 'Parameter-efficient fine-tuning with QLoRA, 4-bit AWQ weight quantization, and vLLM serving.',
    category: 'AI & Machine Learning',
    quickTag: 'Neural Networks',
    badge: 'LLM ENG',
    badgeColor: 'text-secondary',
    dotColor: 'bg-secondary',
    level: 'Advanced Masterclass',
    levelPill: 'ADVANCED',
    levelBg: 'bg-secondary-container/90 text-on-secondary-container',
    instructor: 'Dr. Elena Vance',
    role: 'Stanford AI Fellow',
    avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra',
    rating: '4.96',
    reviews: '3.8k',
    duration: '7 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '34 Modules',
    students: '28.4k',
    price: 340,
    priceNote: 'or Pro Pass',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXQX6y6ZN7SHJwv2xi_9NgYgJDzT-DBvMnOfL_zxMRnFxOOBUx28QBVz7iFOHM0mWs96pwmYJMnjyEwlOJrbZq02OQQHPO_CgKh9ymznuWQCc3YjFyhgDj-0dlPtHW4WtbARQAnkmUaic_aGIUw8UyqIJB0UWWDeigCqbE3Fno5T_ApnTk9iCqpO5drG6w6iyxVABQmTz_YdIBdcC_JuRxA5f3UtWjbYYkZa666lBu3Q9oW_uq8qo',
  },
  {
    dbSlug: 'zero-trust-identity-spiffe-spire',
    title: 'Zero-Trust Identity & SPIFFE/SPIRE',
    description: 'Continuous cryptographic attestation, mutual TLS, OIDC federations and dynamic microsegmentation.',
    category: 'Cybersecurity & Crypto',
    quickTag: 'Cryptographic Security',
    badge: 'IDENTITY & SEC',
    badgeColor: 'text-primary-container',
    dotColor: 'bg-primary-container',
    level: 'Intermediate Specialist',
    levelPill: 'INTERMEDIATE',
    levelBg: 'bg-primary-container text-on-primary-container',
    instructor: 'Marcus Lin, CISSP',
    role: 'Senior Infosec Director',
    initials: 'ML',
    rating: '4.84',
    reviews: '1.7k',
    duration: '5 Weeks',
    durationGroup: '4–8 Weeks',
    modules: '22 Modules',
    students: '12.3k',
    price: 290,
    priceNote: 'or Pro Pass',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQfiUdA6Pdy_1stct5iam3CJ5c9N1Iov5kWqWLGbW9V74J1hVRt-Bjh3HytBcvxkw_BEAsvYbA2Nm2WybxYqQh1zXYLUA1llu1OHFObpxsFAXse5PyMxoGAa6j9ZFoais_hGrBbehOan2qg7bDUPeuNUdz8yR8uEPJHrJmFqlwIhwQ6Xd2dzeH9HDulA_4yBS9RWNBSSitCBbnKIF8mkOAuHWkyQMtasa6o3MmWi-czzVpe5QfwlI',
  },
];

const CATEGORIES = [
  { name: 'AI & Machine Learning', count: 64 },
  { name: 'Cybersecurity & Crypto', count: 42 },
  { name: 'Cloud Architecture & DevOps', count: 38 },
  { name: 'Quantum Computing', count: 19 },
  { name: 'Systems & Rust', count: 27 },
  { name: 'Data Engineering', count: 31 },
  { name: 'Autonomous Robotics', count: 16 },
];

const DIFFICULTY_LEVELS = [
  { name: 'All Levels', count: 248 },
  { name: 'Beginner Foundations', count: 35 },
  { name: 'Intermediate Specialist', count: 98 },
  { name: 'Advanced Masterclass', count: 82 },
  { name: 'Research Fellow Cohort', count: 33 },
];

const DURATION_OPTIONS = [
  { label: '< 4 Weeks', count: '45 courses', key: '< 4 Weeks' },
  { label: '4–8 Weeks', count: '112 courses', key: '4–8 Weeks' },
  { label: '8–12 Weeks', count: '68 courses', key: '8–12 Weeks' },
  { label: '12+ Weeks', count: '23 bootcamps', key: '12+ Weeks' },
];

const INSTRUCTORS = [
  {
    name: 'Dr. Elena Vance',
    count: 12,
    avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra',
  },
  {
    name: 'Marcus Lin, CISSP',
    count: 8,
    initials: 'ML',
    bg: 'bg-secondary-container text-secondary',
  },
  {
    name: 'Sora Takahashi',
    count: 14,
    initials: 'ST',
    bg: 'bg-tertiary-container text-on-tertiary',
  },
];

const QUICK_SELECT_OPTIONS = [
  { label: 'All Courses (248)', value: 'All' },
  { label: 'Quantum Computing (19)', value: 'Quantum Computing' },
  { label: 'Cryptographic Security (42)', value: 'Cryptographic Security' },
  { label: 'Cloud & K8s (38)', value: 'Cloud & K8s' },
  { label: 'Neural Networks (64)', value: 'Neural Networks' },
  { label: 'Rust Systems (27)', value: 'Rust Systems' },
];

const CourseCatalog = ({ embedded = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isEmbedded = embedded || location.pathname.startsWith('/student');

  // States
  const [activeState, setActiveState] = useState('catalog'); // 'catalog', 'skeleton', 'empty', 'error'
  const [viewLayout, setViewLayout] = useState('grid'); // 'grid' or 'list'
  const [dbCourseMap, setDbCourseMap] = useState({});

  // Filter criteria
  const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');
  const [selectedQuickTag, setSelectedQuickTag] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState(['AI & Machine Learning', 'Cybersecurity & Crypto']);
  const [selectedLevel, setSelectedLevel] = useState('Intermediate Specialist');
  const [selectedDuration, setSelectedDuration] = useState('4–8 Weeks');
  const [maxPrice, setMaxPrice] = useState(800);
  const [pricingAccess, setPricingAccess] = useState(['pro']); // 'free', 'pro', 'enterprise'
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [sortBy, setSortBy] = useState('Most Popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Fetch real database courses to map to detail links
  useEffect(() => {
    let isMounted = true;
    API.get('/courses', { params: { limit: 50 } })
      .then((res) => {
        if (!isMounted) return;
        const list = res.data.courses || [];
        const map = {};
        list.forEach((c) => {
          if (c.slug) map[c.slug] = c._id;
          if (c.title) map[c.title.toLowerCase().trim()] = c._id;
        });
        setDbCourseMap(map);
      })
      .catch((err) => {
        console.warn('Could not fetch DB course slugs, using fallback links:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('course-search-input');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle category
  const toggleCategory = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  // Toggle instructor
  const toggleInstructor = (instName) => {
    setSelectedInstructors((prev) =>
      prev.includes(instName) ? prev.filter((i) => i !== instName) : [...prev, instName]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedLevel('All Levels');
    setSelectedDuration('');
    setSelectedInstructors([]);
    setSelectedQuickTag('All');
    setSearchQuery('');
    setMaxPrice(800);
  };

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let list = [...FLAGSHIP_COURSES];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.badge.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    // Quick tag
    if (selectedQuickTag !== 'All') {
      list = list.filter(
        (c) => c.quickTag === selectedQuickTag || c.category.toLowerCase().includes(selectedQuickTag.toLowerCase())
      );
    }

    // Categories
    if (selectedCategories.length > 0) {
      list = list.filter((c) => selectedCategories.includes(c.category));
    }

    // Level
    if (selectedLevel && selectedLevel !== 'All Levels') {
      list = list.filter((c) => c.level === selectedLevel || c.levelPill === selectedLevel);
    }

    // Duration
    if (selectedDuration) {
      list = list.filter((c) => c.durationGroup === selectedDuration);
    }

    // Instructors
    if (selectedInstructors.length > 0) {
      list = list.filter((c) => selectedInstructors.includes(c.instructor));
    }

    // Price
    list = list.filter((c) => c.price <= maxPrice);

    // Sorting
    if (sortBy === 'Most Popular') {
      list.sort((a, b) => parseFloat(b.students) - parseFloat(a.students));
    } else if (sortBy === 'Highest Rated') {
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sortBy === 'Title A–Z') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Shortest Duration') {
      list.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    }

    return list;
  }, [
    searchQuery,
    selectedQuickTag,
    selectedCategories,
    selectedLevel,
    selectedDuration,
    selectedInstructors,
    maxPrice,
    sortBy,
  ]);

  const activeFiltersCount =
    selectedCategories.length +
    (selectedLevel !== 'All Levels' ? 1 : 0) +
    (selectedDuration ? 1 : 0) +
    selectedInstructors.length +
    (searchQuery.trim() ? 1 : 0);

  // Helper to resolve link
  const getCourseDetailPath = (course) => {
    const idFromSlug = dbCourseMap[course.dbSlug];
    const idFromTitle = dbCourseMap[course.title.toLowerCase().trim()];
    const validId = idFromSlug || idFromTitle || Object.values(dbCourseMap)[0];
    return validId ? `/course/${validId}` : `/login`;
  };

  const dashboardPath = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'instructor'
    ? '/instructor/dashboard'
    : '/student/dashboard';

  return (
    <div className={`bg-background text-on-surface antialiased min-h-screen flex flex-col font-body-md selection:bg-primary-container selection:text-on-primary-container ${isEmbedded ? 'w-full' : ''}`}>
      {/* ================= FIXED TOP HEADER ================= */}
      {!isEmbedded && (
        <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_1px_16px_rgba(0,0,0,0.4)]">
        <div className="h-16 w-full px-gutter flex items-center justify-between gap-space-md">
          {/* Brand Logo & Version */}
          <div className="flex items-center gap-space-lg shrink-0">
            <Link to="/" className="flex items-center gap-space-sm group">
              <img
                alt="NOVA LMS Logo"
                className="h-8 w-auto object-contain rounded-md group-hover:scale-105 transition-transform"
                src="/assets/nova-logo.png"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://lh3.googleusercontent.com/aida/AEtjO1UgC3VTGpx9ax-r_6UpM35x8ax2iPF16pw-6-9F4A6rxNge9kMA45erC8H2iSBnyIy4xWEYwjhF9kdDro5CqtIjuKgMuwlLKS3cSbv-zeJ8-0U7T1fFSfFwgf7O0zSJfkCvo4x9ljzn45d17ujEfI92ox2cjYqT6y8xAefFjuqQBiOnY0w-EXB5FDtL6-jmJFUZVPigoqkbzdOf6LBjqJLorwHllR2p6rJaisk60SMmxcTsI_chQfBKOA';
                }}
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface leading-none">
                  NOVA <span className="text-primary font-code-md text-body-sm font-normal">/ StudyPilot</span>
                </span>
              </div>
              <span className="hidden lg:inline-flex items-center px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-md text-label-sm uppercase tracking-wider ml-1">
                v2.4.8-RELEASE
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-space-xs p-1 rounded-xl bg-surface-container-low">
              <Link
                to="/courses"
                className="px-space-md py-1.5 transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-[0_0_16px_rgba(128,131,255,0.3)]"
              >
                Courses
              </Link>
              <a
                href="#categories"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalog-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-space-md py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:text-on-surface hover:bg-surface-container-high"
              >
                Categories
              </a>
              <Link
                to="/courses"
                className="px-space-md py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:text-on-surface hover:bg-surface-container-high"
              >
                Learning Paths
              </Link>
              <Link
                to={isAuthenticated ? dashboardPath : '/login'}
                className="px-space-md py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:text-on-surface hover:bg-surface-container-high"
              >
                Dashboard
              </Link>
              <Link
                to="/about"
                className="px-space-md py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:text-on-surface hover:bg-surface-container-high"
              >
                Docs
              </Link>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-space-md shrink-0">
            {/* Search Box Trigger */}
            <div
              onClick={() => document.getElementById('course-search-input')?.focus()}
              className="hidden md:flex items-center bg-surface-container-low rounded-lg px-space-sm py-1.5 gap-space-sm w-56 lg:w-72 shadow-inner cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-base">search</span>
              <span className="text-on-surface-variant font-body-sm text-body-sm flex-1 truncate">
                {searchQuery || 'Search modules, syntax...'}
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest font-code-md text-label-sm text-on-surface-variant uppercase">
                ⌘K
              </kbd>
            </div>

            {/* Notification Bell */}
            <div className="relative flex items-center justify-center">
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
              </Link>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#4cd7f6]"></span>
            </div>

            {/* Telemetry Shard Pill */}
            <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-code-md text-label-sm text-tertiary tracking-wide">US-EAST-1 Active</span>
            </div>

            {/* Profile Avatar / Login */}
            {isAuthenticated && user ? (
              <Link to={dashboardPath} className="flex items-center gap-space-sm pl-space-xs">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="font-label-md text-label-md text-on-surface leading-tight">{user.name}</span>
                  <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wide capitalize">
                    {user.role || 'Fellow'}
                  </span>
                </div>
                <img
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shadow-[0_0_12px_rgba(192,193,255,0.2)] border border-primary/30"
                  src={
                    user.avatar ||
                    'https://lh3.googleusercontent.com/aida/AEtjO1XbByWEm7GAGBdpGAqxfzCMFkFqyPMDwXR31XzQcAW_7qE0SHGe5KcOzSHZWxcw0LmYVlhtAk7GuWXJwOamtyOO7hYD8eHnfRtALEC4NQ1hJFLBj_d4fWul7LXFbzSQShCNhrcpZZIXAoIGb-LhcSZTC2vvOtdLVJ1flthUBrMubmy1MxwpgQOLAqaQFAgYcT03ym4nj3WiibxwIVLJYhXutQRm9XkDKIunk7iDXjozViMs0zGMJ1ra'
                  }
                />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-on-surface-variant font-label-md text-label-md hover:text-on-surface transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-md hover:bg-primary hover:text-on-primary transition-all"
                >
                  Join Fellow
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className={`w-full bg-surface min-h-screen flex-1 ${isEmbedded ? 'pt-4' : 'pt-16'}`}>
        <div className="flex flex-col w-full text-on-surface">
          {/* Ambient Glow Orbs & 3D Neural Synapse Graph */}
          <div className="relative w-full overflow-hidden">
            <NeuralBackground
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              opacity={0.45}
              nodeCount={45}
              maxLines={110}
              sphereRadius={9}
            />
            <div className="absolute -top-32 left-1/4 w-[600px] h-[350px] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -top-24 right-1/4 w-[450px] h-[300px] bg-tertiary/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* PAGE HEADER SECTION */}
            <div className="relative z-10 w-full px-gutter pt-8 pb-6 max-w-[1680px] mx-auto flex flex-col gap-6">
              {/* Breadcrumbs & Telemetry Badges */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 font-code-md text-label-sm text-on-surface-variant">
                  <Link to={isEmbedded ? "/student/dashboard" : "/"} className="text-primary hover:underline cursor-pointer">
                    ACADEMY
                  </Link>
                  <span>/</span>
                  <span className="text-on-surface">EXPLORE COURSES</span>
                  <span>/</span>
                  <span className="text-tertiary">CATALOG DISCOVERY</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">248 Verified Courses</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">18 Specialization Tracks</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">100% Containerized GPU Labs</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest shadow-inner font-code-md text-label-sm text-outline">
                    <span className="material-symbols-outlined text-sm text-tertiary">update</span>
                    <span>Curriculum updated 12m ago</span>
                  </div>
                </div>
              </div>

              {/* Main Title & Cluster Telemetry Box */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="font-headline-hero text-headline-hero text-on-surface tracking-tight leading-none">
                    Explore Courses
                  </h1>
                  <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                    Build practical, battle-tested skills from expert-led courses engineered with live cloud environments and zero-trust sandboxes.
                  </p>
                </div>
                <div className="hidden lg:flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-3 shadow-inner">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined text-xl">terminal</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold">Virtual GPU Cluster</span>
                      <span className="font-code-md text-label-sm text-tertiary">1,024 Nodes Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Large Cyber-Glow Search Field & Instant Filter Tag Pills */}
              <div className="relative w-full rounded-2xl bg-surface-container-low p-2 shadow-2xl">
                <div className="relative flex items-center w-full bg-surface-container-lowest rounded-xl px-4 py-2.5 shadow-inner">
                  <span className="material-symbols-outlined text-primary text-2xl mr-3">search</span>
                  <input
                    id="course-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, skills or instructors..."
                    className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
                  />
                  <div className="flex items-center gap-2 ml-2">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant font-code-md text-label-sm shadow-sm hover:text-on-surface"
                      >
                        CLEAR
                      </button>
                    )}
                    <kbd className="hidden sm:inline-block px-2 py-1 rounded bg-surface-container text-on-surface-variant font-code-md text-label-sm shadow-sm">
                      ⌘K
                    </kbd>
                  </div>
                </div>

                {/* Instant Filter Tag Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-1 px-1 text-nowrap scrollbar-none">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mr-1">
                    Quick Select:
                  </span>
                  {QUICK_SELECT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedQuickTag(opt.value);
                        if (opt.value === 'All') {
                          setSelectedCategories([]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${
                        selectedQuickTag === opt.value
                          ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN 2-COLUMN DISCOVERY WORKSPACE */}
          <div className="w-full px-gutter max-w-[1680px] mx-auto pb-16">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* ================= LEFT COLUMN: FILTER SIDEBAR ================= */}
              <aside id="catalog-sidebar" className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20 z-10 flex flex-col gap-5">
                <div className="w-full bg-surface-container-low rounded-2xl p-5 shadow-xl flex flex-col gap-6">
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between pb-3 bg-surface-container-low border-b border-surface-container-high">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">tune</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">Filter Criteria</span>
                    </div>
                    {activeFiltersCount > 0 && (
                      <button onClick={clearAllFilters} className="font-label-sm text-label-sm text-tertiary hover:underline">
                        Clear All ({activeFiltersCount})
                      </button>
                    )}
                  </div>

                  {/* Filter Group 1: Category */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between cursor-pointer">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold tracking-wide">Category</span>
                      <span className="material-symbols-outlined text-outline text-base">expand_less</span>
                    </div>
                    <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant pl-0.5">
                      {CATEGORIES.map((cat) => {
                        const isChecked = selectedCategories.includes(cat.name);
                        return (
                          <label
                            key={cat.name}
                            onClick={() => toggleCategory(cat.name)}
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-primary-container text-on-primary-container'
                                    : 'bg-surface-container-highest group-hover:bg-surface-container'
                                }`}
                              >
                                {isChecked && <span className="material-symbols-outlined text-xs font-bold">check</span>}
                              </div>
                              <span
                                className={`transition-colors ${
                                  isChecked ? 'text-on-surface font-medium' : 'text-on-surface-variant group-hover:text-on-surface'
                                }`}
                              >
                                {cat.name}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-surface-container font-code-md text-label-sm text-outline">
                              {cat.count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-surface-container-high"></div>

                  {/* Filter Group 2: Difficulty Level */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between cursor-pointer">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold tracking-wide">
                        Difficulty Level
                      </span>
                      <span className="material-symbols-outlined text-outline text-base">expand_less</span>
                    </div>
                    <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
                      {DIFFICULTY_LEVELS.map((lvl) => {
                        const isChecked = selectedLevel === lvl.name;
                        return (
                          <label
                            key={lvl.name}
                            onClick={() => setSelectedLevel(lvl.name)}
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-primary-container text-on-primary-container'
                                    : 'bg-surface-container-highest group-hover:bg-surface-container'
                                }`}
                              >
                                {isChecked && <span className="material-symbols-outlined text-xs font-bold">check</span>}
                              </div>
                              <span
                                className={`transition-colors ${
                                  isChecked ? 'text-on-surface font-medium' : 'text-on-surface-variant group-hover:text-on-surface'
                                }`}
                              >
                                {lvl.name}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-surface-container font-code-md text-label-sm text-outline">
                              {lvl.count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-surface-container-high"></div>

                  {/* Filter Group 3: Duration */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between cursor-pointer">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold tracking-wide">Duration</span>
                      <span className="material-symbols-outlined text-outline text-base">expand_less</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {DURATION_OPTIONS.map((d) => {
                        const isActive = selectedDuration === d.key;
                        return (
                          <div
                            key={d.key}
                            onClick={() => setSelectedDuration(isActive ? '' : d.key)}
                            className={`p-2.5 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center ${
                              isActive
                                ? 'bg-primary-container text-on-primary-container shadow-md font-bold'
                                : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                            }`}
                          >
                            <span className="font-label-sm text-label-sm font-semibold">{d.label}</span>
                            <span className={`font-code-md text-label-sm ${isActive ? 'opacity-90' : 'text-outline'}`}>
                              {d.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-surface-container-high"></div>

                  {/* Filter Group 4: Pricing & Access Slider */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold tracking-wide">
                        Pricing &amp; Access
                      </span>
                      <span className="font-code-md text-label-sm text-tertiary">$0 – ${maxPrice}</span>
                    </div>
                    <div className="relative w-full my-2">
                      <input
                        type="range"
                        min="0"
                        max="800"
                        step="25"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                      <label
                        onClick={() =>
                          setPricingAccess((p) => (p.includes('free') ? p.filter((x) => x !== 'free') : [...p, 'free']))
                        }
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                            pricingAccess.includes('free')
                              ? 'bg-primary-container text-on-primary-container'
                              : 'bg-surface-container-highest'
                          }`}
                        >
                          {pricingAccess.includes('free') && (
                            <span className="material-symbols-outlined text-xs font-bold">check</span>
                          )}
                        </div>
                        <span>Free Open Courseware (24)</span>
                      </label>
                      <label
                        onClick={() =>
                          setPricingAccess((p) => (p.includes('pro') ? p.filter((x) => x !== 'pro') : [...p, 'pro']))
                        }
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                            pricingAccess.includes('pro')
                              ? 'bg-primary-container text-on-primary-container'
                              : 'bg-surface-container-highest'
                          }`}
                        >
                          {pricingAccess.includes('pro') && (
                            <span className="material-symbols-outlined text-xs font-bold">check</span>
                          )}
                        </div>
                        <span className="text-on-surface">Included in Pro Pass (154)</span>
                      </label>
                      <label
                        onClick={() =>
                          setPricingAccess((p) =>
                            p.includes('enterprise') ? p.filter((x) => x !== 'enterprise') : [...p, 'enterprise']
                          )
                        }
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                            pricingAccess.includes('enterprise')
                              ? 'bg-primary-container text-on-primary-container'
                              : 'bg-surface-container-highest'
                          }`}
                        >
                          {pricingAccess.includes('enterprise') && (
                            <span className="material-symbols-outlined text-xs font-bold">check</span>
                          )}
                        </div>
                        <span>Enterprise Cohort Grant (70)</span>
                      </label>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-surface-container-high"></div>

                  {/* Filter Group 5: Lead Instructors */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold tracking-wide">
                        Fellows &amp; Authors
                      </span>
                      <span className="material-symbols-outlined text-outline text-base">expand_less</span>
                    </div>
                    <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
                      {INSTRUCTORS.map((inst) => {
                        const isChecked = selectedInstructors.includes(inst.name);
                        return (
                          <label
                            key={inst.name}
                            onClick={() => toggleInstructor(inst.name)}
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <div className="flex items-center gap-2">
                              {inst.avatar ? (
                                <img alt={inst.name} className="w-5 h-5 rounded-full object-cover" src={inst.avatar} />
                              ) : (
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center font-code-md text-[10px] font-bold ${
                                    inst.bg || 'bg-surface-container-highest text-primary'
                                  }`}
                                >
                                  {inst.initials}
                                </div>
                              )}
                              <span
                                className={`transition-colors ${
                                  isChecked ? 'text-primary font-semibold' : 'group-hover:text-on-surface'
                                }`}
                              >
                                {inst.name}
                              </span>
                            </div>
                            <span className="font-code-md text-label-sm text-outline">{inst.count}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </aside>

              {/* ================= RIGHT COLUMN: MAIN COURSE BROWSER ================= */}
              <div className="flex-1 min-w-0 flex flex-col gap-6">
                {/* STATE PREVIEW SWITCHER BAR */}
                <div className="w-full bg-surface-container-low rounded-xl p-2 flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-1.5 font-code-md text-label-sm text-outline px-2">
                    <span className="material-symbols-outlined text-base text-tertiary">developer_mode</span>
                    <span>VIEW STATE SWITCHER:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1" id="state-tabs">
                    <button
                      id="btn-state-catalog"
                      onClick={() => setActiveState('catalog')}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                        activeState === 'catalog'
                          ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      Live Catalog ({filteredCourses.length})
                    </button>
                    <button
                      id="btn-state-skeleton"
                      onClick={() => setActiveState('skeleton')}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                        activeState === 'skeleton'
                          ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      Skeleton Loading
                    </button>
                    <button
                      id="btn-state-empty"
                      onClick={() => setActiveState('empty')}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                        activeState === 'empty'
                          ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      Empty State
                    </button>
                    <button
                      id="btn-state-error"
                      onClick={() => setActiveState('error')}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                        activeState === 'error'
                          ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      Network Error State
                    </button>
                  </div>
                </div>

                {/* TOOLBAR: Results Count, Active Tags, Sort & View Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low/60 rounded-xl p-4 shadow-sm">
                  {/* Left: Count & Active Badges */}
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface">
                        Showing 1–{Math.min(filteredCourses.length, 12)}
                      </span>
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        of {filteredCourses.length > 0 ? 148 : 0} matching courses
                      </span>
                    </div>

                    {/* Active Filter Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {selectedLevel && selectedLevel !== 'All Levels' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary font-label-sm text-label-sm">
                          {selectedLevel}
                          <span
                            onClick={() => setSelectedLevel('All Levels')}
                            className="material-symbols-outlined text-xs cursor-pointer hover:text-on-surface"
                          >
                            close
                          </span>
                        </span>
                      )}
                      {selectedCategories.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm"
                        >
                          {c}
                          <span
                            onClick={() => toggleCategory(c)}
                            className="material-symbols-outlined text-xs cursor-pointer hover:text-on-surface"
                          >
                            close
                          </span>
                        </span>
                      ))}
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm">
                          Query: "{searchQuery}"
                          <span
                            onClick={() => setSearchQuery('')}
                            className="material-symbols-outlined text-xs cursor-pointer hover:text-on-surface"
                          >
                            close
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Sort Dropdown & Layout Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Sort dropdown */}
                    <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-1.5 shadow-inner">
                      <span className="font-label-sm text-label-sm text-outline">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer"
                      >
                        <option className="bg-surface-container text-on-surface">Most Popular</option>
                        <option className="bg-surface-container text-on-surface">Newest Release</option>
                        <option className="bg-surface-container text-on-surface">Highest Rated</option>
                        <option className="bg-surface-container text-on-surface">Shortest Duration</option>
                        <option className="bg-surface-container text-on-surface">Title A–Z</option>
                      </select>
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center bg-surface-container rounded-lg p-1 shadow-inner">
                      <button
                        onClick={() => setViewLayout('grid')}
                        className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                          viewLayout === 'grid'
                            ? 'bg-primary-container text-on-primary-container shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                        }`}
                        title="4-Column Grid"
                      >
                        <span className="material-symbols-outlined text-lg">grid_view</span>
                      </button>
                      <button
                        onClick={() => setViewLayout('list')}
                        className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                          viewLayout === 'list'
                            ? 'bg-primary-container text-on-primary-container shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                        }`}
                        title="List View"
                      >
                        <span className="material-symbols-outlined text-lg">view_list</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================= VIEW 1: LIVE 4-COLUMN CATALOG ================= */}
                {activeState === 'catalog' && (
                  <div id="view-catalog" className="w-full">
                    {filteredCourses.length === 0 ? (
                      /* Fallback to Empty State if filters yield 0 results */
                      <div className="w-full rounded-2xl bg-surface-container-low p-12 flex flex-col items-center justify-center text-center shadow-xl">
                        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-75"></div>
                          <div className="w-28 h-28 rounded-full bg-surface-container-high flex items-center justify-center shadow-inner">
                            <span className="material-symbols-outlined text-5xl text-outline">radar</span>
                          </div>
                          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-tertiary shadow-[0_0_10px_#4cd7f6]"></div>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-on-surface">No matching courses found</h3>
                        <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant max-w-md">
                          We couldn’t find any academic curriculum matching your criteria. Try adjusting your filters or search keywords.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                          <button
                            onClick={clearAllFilters}
                            className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:bg-primary hover:text-on-primary transition-all shadow-md"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      </div>
                    ) : viewLayout === 'grid' ? (
                      /* 4-Column Grid */
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((c, idx) => (
                          <div
                            key={c.title + idx}
                            className="group relative bg-surface-container-low rounded-2xl overflow-hidden shadow-xl hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(99,102,241,0.25)] transition-all duration-300 flex flex-col"
                          >
                            {/* Thumbnail Banner */}
                            <div className="relative h-44 w-full overflow-hidden bg-surface-container-lowest">
                              <img
                                alt={c.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={c.thumbnail}
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-black/30"></div>

                              {/* Category Badge */}
                              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center gap-1.5 font-code-md text-label-sm shadow-md">
                                <span className={`w-1.5 h-1.5 rounded-full ${c.dotColor || 'bg-primary'}`}></span>
                                <span className={c.badgeColor || 'text-primary'}>{c.badge}</span>
                              </div>

                              {/* Difficulty Pill */}
                              <div
                                className={`absolute top-3 right-3 px-2 py-0.5 rounded-md font-label-sm text-label-sm font-semibold ${
                                  c.levelBg || 'bg-primary-container text-on-primary-container'
                                }`}
                              >
                                {c.levelPill}
                              </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                              <div>
                                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                  {c.title}
                                </h3>
                                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                                  {c.description}
                                </p>
                              </div>

                              {/* Instructor info */}
                              <div className="flex items-center gap-2 pt-1">
                                {c.avatar ? (
                                  <img
                                    alt={c.instructor}
                                    className="w-7 h-7 rounded-full object-cover shadow-sm"
                                    src={c.avatar}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-code-md text-xs font-bold shadow-sm">
                                    {c.initials || 'ST'}
                                  </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                  <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                                    {c.instructor}
                                  </span>
                                  <span className="font-label-sm text-label-sm text-outline truncate">{c.role}</span>
                                </div>
                              </div>

                              {/* Course Stats Grid */}
                              <div className="grid grid-cols-2 gap-2 pt-2 bg-surface-container-lowest/50 rounded-xl p-2.5 font-code-md text-label-sm text-on-surface-variant">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm text-primary">star</span>
                                  <span className="text-on-surface font-semibold">{c.rating}</span>
                                  <span className="text-outline">({c.reviews})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm text-tertiary">schedule</span>
                                  <span>{c.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm text-secondary">menu_book</span>
                                  <span>{c.modules}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-sm text-outline">group</span>
                                  <span>{c.students}</span>
                                </div>
                              </div>

                              {/* Pricing & Action Row */}
                              <div className="flex items-center justify-between pt-2">
                                <div>
                                  <span className="font-code-md text-headline-sm text-on-surface font-bold">
                                    ${c.price}
                                  </span>
                                  <span className="font-label-sm text-label-sm text-tertiary block leading-none">
                                    {c.priceNote}
                                  </span>
                                </div>
                                <Link
                                  to={getCourseDetailPath(c)}
                                  className="px-3.5 py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-tertiary group-hover:text-on-primary transition-all duration-300 shadow-md flex items-center gap-1"
                                >
                                  <span>Enroll</span>
                                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* List View */
                      <div className="flex flex-col gap-4">
                        {filteredCourses.map((c, idx) => (
                          <div
                            key={c.title + idx}
                            className="group relative bg-surface-container-low rounded-2xl overflow-hidden shadow-xl hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(99,102,241,0.2)] transition-all duration-300 flex flex-col md:flex-row items-stretch"
                          >
                            <div className="relative md:w-64 shrink-0 h-48 md:h-auto overflow-hidden bg-surface-container-lowest">
                              <img
                                alt={c.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={c.thumbnail}
                                loading="lazy"
                              />
                              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center gap-1.5 font-code-md text-label-sm">
                                <span className={`w-1.5 h-1.5 rounded-full ${c.dotColor || 'bg-primary'}`}></span>
                                <span className={c.badgeColor || 'text-primary'}>{c.badge}</span>
                              </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                                    {c.title}
                                  </h3>
                                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                                    {c.description}
                                  </p>
                                </div>
                                <span className="font-code-md text-headline-md text-on-surface font-bold text-right shrink-0">
                                  ${c.price}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-surface-container-high/60">
                                <div className="flex items-center gap-4 text-on-surface-variant font-code-md text-label-sm">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-primary">star</span>
                                    <strong className="text-on-surface">{c.rating}</strong> ({c.reviews})
                                  </span>
                                  <span>•</span>
                                  <span>{c.duration}</span>
                                  <span>•</span>
                                  <span>{c.modules}</span>
                                  <span>•</span>
                                  <span>{c.students} Fellows</span>
                                </div>
                                <Link
                                  to={getCourseDetailPath(c)}
                                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold flex items-center gap-1 shadow-md hover:bg-primary transition-all"
                                >
                                  <span>Enroll Module</span>
                                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ================= VIEW 2: SKELETON LOADING STATE ================= */}
                {activeState === 'skeleton' && (
                  <div id="view-skeleton" className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-surface-container-low rounded-2xl overflow-hidden p-4 flex flex-col gap-4 animate-pulse"
                        >
                          <div className="w-full h-44 rounded-xl bg-surface-container-high"></div>
                          <div className="h-6 w-3/4 rounded bg-surface-container-high"></div>
                          <div className="h-4 w-full rounded bg-surface-container"></div>
                          <div className="h-4 w-2/3 rounded bg-surface-container"></div>
                          <div className="flex items-center gap-3 pt-2">
                            <div className="w-8 h-8 rounded-full bg-surface-container-high"></div>
                            <div className="flex-1 flex flex-col gap-1.5">
                              <div className="h-3 w-1/2 rounded bg-surface-container-high"></div>
                              <div className="h-2.5 w-1/3 rounded bg-surface-container"></div>
                            </div>
                          </div>
                          <div className="h-14 w-full rounded-xl bg-surface-container"></div>
                          <div className="flex justify-between items-center pt-2">
                            <div className="h-6 w-16 rounded bg-surface-container-high"></div>
                            <div className="h-9 w-24 rounded-xl bg-surface-container-high"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ================= VIEW 3: EMPTY / NO RESULTS STATE ================= */}
                {activeState === 'empty' && (
                  <div id="view-empty" className="w-full">
                    <div className="w-full rounded-2xl bg-surface-container-low p-12 flex flex-col items-center justify-center text-center shadow-xl">
                      {/* Cyber Radar Empty Illustration */}
                      <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-75"></div>
                        <div className="w-28 h-28 rounded-full bg-surface-container-high flex items-center justify-center shadow-inner">
                          <span className="material-symbols-outlined text-5xl text-outline">radar</span>
                        </div>
                        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-tertiary shadow-[0_0_10px_#4cd7f6]"></div>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">No matching courses found</h3>
                      <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant max-w-md">
                        We couldn’t find any academic curriculum matching your criteria. Try adjusting your filters or search keywords like "Quantum", "Security", or "Cloud".
                      </p>
                      <div className="flex items-center gap-3 mt-6">
                        <button
                          onClick={() => {
                            clearAllFilters();
                            setActiveState('catalog');
                          }}
                          className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:bg-primary hover:text-on-primary transition-all shadow-md"
                        >
                          Reset All Filters
                        </button>
                        <button
                          onClick={() => {
                            clearAllFilters();
                            setActiveState('catalog');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all"
                        >
                          Browse Popular Tracks
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= VIEW 4: ERROR / RECONNECT STATE ================= */}
                {activeState === 'error' && (
                  <div id="view-error" className="w-full">
                    <div className="w-full rounded-2xl bg-surface-container-low p-8 shadow-xl flex flex-col gap-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-error-container/30 text-on-error-container">
                        <span className="material-symbols-outlined text-3xl text-error">wifi_off</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <span className="font-headline-sm text-headline-sm text-error font-bold">
                            ERR_LMS_INDEX_SYNC_TIMEOUT
                          </span>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                            Telemetry handshake with shard <code className="font-code-md text-tertiary">nova-edge-cluster-04</code> timed out after 3,000ms. Course index cache may be temporarily degraded.
                          </p>
                        </div>
                      </div>

                      {/* Diagnostic stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-code-md text-label-sm">
                        <div className="p-3 rounded-lg bg-surface-container">
                          <span className="text-outline block">Status Code:</span>
                          <span className="text-error font-bold">504 Gateway Timeout</span>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-container">
                          <span className="text-outline block">Active Region:</span>
                          <span className="text-on-surface">US-EAST-1 (Degraded)</span>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-container">
                          <span className="text-outline block">Fallback Mirror:</span>
                          <span className="text-tertiary font-bold">Ready (EU-CENTRAL-1)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <button
                          onClick={() => setActiveState('catalog')}
                          className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-md hover:bg-primary transition-all flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">refresh</span>
                          <span>Retry Index Connection</span>
                        </button>
                        <span className="font-body-sm text-body-sm text-outline">Auto-retry in 8 seconds...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= PAGINATION CONTROLS ================= */}
                <div className="w-full rounded-2xl bg-surface-container-low p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Showing <span className="font-semibold text-on-surface">1</span> to{' '}
                    <span className="font-semibold text-on-surface">{Math.min(filteredCourses.length, itemsPerPage)}</span>{' '}
                    of <span className="font-semibold text-on-surface">148</span> items
                  </div>

                  {/* Page buttons */}
                  <div className="flex items-center gap-1.5 font-label-md text-label-md">
                    <button
                      aria-label="Previous Page"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                        currentPage === 1
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      1
                    </button>
                    <button
                      onClick={() => setCurrentPage(2)}
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                        currentPage === 2
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      2
                    </button>
                    <button
                      onClick={() => setCurrentPage(3)}
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                        currentPage === 3
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      3
                    </button>
                    <button
                      onClick={() => setCurrentPage(4)}
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                        currentPage === 4
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      4
                    </button>
                    <span className="text-outline px-1">...</span>
                    <button
                      onClick={() => setCurrentPage(13)}
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all ${
                        currentPage === 13
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      13
                    </button>
                    <button
                      aria-label="Next Page"
                      onClick={() => setCurrentPage((p) => Math.min(13, p + 1))}
                      className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>

                  {/* Per-page selection */}
                  <div className="flex items-center gap-2">
                    <span className="font-body-sm text-body-sm text-outline">Items per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-surface-container rounded-lg px-2.5 py-1 text-on-surface font-label-sm text-label-sm focus:outline-none cursor-pointer"
                    >
                      <option value="12">12</option>
                      <option value="24">24</option>
                      <option value="48">48</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      {!isEmbedded && (
        <footer className="w-full bg-surface-container-lowest py-space-xl shadow-[0_-1px_16px_rgba(0,0,0,0.5)] border-t border-surface-container-high/40">
          <div className="w-full px-gutter max-w-[1680px] mx-auto flex flex-col gap-space-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-space-lg">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
                    NOVA <span className="text-primary font-code-md text-body-sm font-normal">/ StudyPilot</span>
                  </span>
                  <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-tertiary font-code-md text-label-sm">
                    TLS 1.3 VERIFIED
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">
                  Autonomous cyber-academic workspace and high-throughput interactive learning catalog engineered for research fellows and technical engineers.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-space-md font-label-md text-label-md text-on-surface-variant">
                <Link to="/courses" className="hover:text-on-surface transition-colors">
                  Curriculum
                </Link>
                <a
                  href="#catalog-sidebar"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('catalog-sidebar')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-on-surface transition-colors"
                >
                  Disciplines
                </a>
                <Link to="/courses" className="hover:text-on-surface transition-colors">
                  Pathways
                </Link>
                <Link to="/about" className="hover:text-on-surface transition-colors">
                  API Engine
                </Link>
                <Link to="/contact" className="hover:text-on-surface transition-colors">
                  Academic Integrity
                </Link>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-space-sm pt-space-md bg-surface-container-low/40 rounded-xl px-space-md py-space-sm">
              <div className="flex items-center gap-space-sm text-on-surface-variant font-code-md text-label-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-tertiary"></span>
                <span>Cluster: nova-prod-cluster-04</span>
                <span className="text-outline-variant">•</span>
                <span>Latency: 14ms</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                © 2025 NOVA LMS / StudyPilot Academic Foundation. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default CourseCatalog;
