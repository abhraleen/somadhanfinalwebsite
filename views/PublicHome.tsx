
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import WritingText from '../components/WritingText';
import { useToast } from '../hooks/useToast';
import { Link } from 'react-router-dom';
import { SERVICES, OWNER_WHATSAPP } from '../constants';
import { ServiceType, ServiceDefinition } from '../types';
import { useEnquiries } from '../hooks/useEnquiries';
import { translations } from '../translations';
import { useApp } from '../App';
import Reveal from '../components/Reveal';
import ResolutionFlow from '../components/ResolutionFlow';
// Removed react text animations for a static hero
import PremiumAurora from '../components/PremiumAurora';
import '../components/HeroReveal.css';

const IntroOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { language } = useApp();
  const t = translations[language];
  const [phase, setPhase] = useState(1);
  const brand = t.brand.toUpperCase();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.innerWidth < 768;
    const fadeIn = reduceMotion ? 600 : (isSmall ? 900 : 1400);
    const hold = reduceMotion ? 200 : (isSmall ? 300 : 400);
    const fadeOut = reduceMotion ? 600 : (isSmall ? 800 : 900);
    const total = fadeIn + hold + fadeOut;
    const id = window.setTimeout(() => {
      setPhase(2);
      onComplete();
    }, total);
    return () => window.clearTimeout(id);
  }, [onComplete, t.brand]);

  return (
    <div className={`intro-overlay fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center ${phase === 2 ? 'opacity-0 pointer-events-none' : 'opacity-0'}`}>
      <h1 className="intro-brand text-5xl md:text-9xl font-black italic tracking-tighter text-white cinematic-text">
        {brand}
      </h1>
    </div>
  );
};

const PublicHome: React.FC = () => {
  const { language, setLanguage, theme, toggleTheme } = useApp();
  const t = translations[language];
  
  const [introDone, setIntroDone] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [landCondition, setLandCondition] = useState<'Old' | 'New' | ''>('');
  const [phone, setPhone] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [timeHour, setTimeHour] = useState<string>('');
  const [timeMinute, setTimeMinute] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { saveEnquiry } = useEnquiries();
  const flowRef = useRef<HTMLDivElement>(null);
  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  const { pushToast } = useToast();
  const [entered, setEntered] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [scrollParallax, setScrollParallax] = useState({ y: 0, scale: 0 });
  const [scrolled, setScrolled] = useState(false);
  // Slower landing on initial load (before intro overlay completes)
  const heroLandingDuration = introDone ? 1.2 : 1.8;
  const heroWordDuration = introDone ? 1.0 : 1.6;
  const heroWordDelay = introDone ? 0.10 : 0.18;
  const subtextDuration = introDone ? 1.0 : 1.4;
  
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const quickDates = () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const inTwoDays = new Date();
    inTwoDays.setDate(today.getDate() + 2);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return [
      { label: 'Today', value: fmt(today) },
      { label: 'Tomorrow', value: fmt(tomorrow) },
      { label: 'Day After', value: fmt(inTwoDays) },
    ];
  };
  const quickTimes = () => [
    { label: '10:00 AM', hour: 10, minute: 0, period: 'AM' },
    { label: '12:00 PM', hour: 12, minute: 0, period: 'PM' },
    { label: '3:00 PM', hour: 3, minute: 0, period: 'PM' },
    { label: '6:00 PM', hour: 6, minute: 0, period: 'PM' }
  ];

  useEffect(() => {
    if (timeHour !== '' && timeMinute !== '') {
      const hh = Math.min(Math.max(parseInt(timeHour, 10), 1), 12);
      const mm = Math.min(Math.max(parseInt(timeMinute, 10), 0), 59);
      const formatted = `${hh}:${String(mm).padStart(2, '0')} ${timePeriod}`;
      setPreferredTime(formatted);
    } else {
      setPreferredTime('');
    }
  }, [timeHour, timeMinute, timePeriod]);

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    revealRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [introDone]);

  // Page enter transition
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Header blur/glass on scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      const h = window.innerHeight || 800;
      const p = Math.min(Math.max(y / h, 0), 1);
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const factor = isMobile ? 6 : 12;
      setScrollParallax({ y: p * factor, scale: p * 0.01 });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pointer tilt for service cards (desktop only)
  const onCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    const maxDeg = 6; // subtle, premium
    const tiltY = nx * maxDeg; // rotateY with X movement
    const tiltX = -ny * maxDeg; // rotateX with Y movement
    target.style.setProperty('--tiltX', `${tiltX}deg`);
    target.style.setProperty('--tiltY', `${tiltY}deg`);
  };
  const onCardMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    target.style.setProperty('--tiltX', `0deg`);
    target.style.setProperty('--tiltY', `0deg`);
  };

  // Touch support for mobile: mimic hover/tilt with touch interactions
  const onCardTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.add('touch-active');
  };
  const onCardTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = target.getBoundingClientRect();
    const nx = (touch.clientX - rect.left) / rect.width - 0.5;
    const ny = (touch.clientY - rect.top) / rect.height - 0.5;
    const maxDeg = 6;
    const tiltY = nx * maxDeg;
    const tiltX = -ny * maxDeg;
    target.style.setProperty('--tiltX', `${tiltX}deg`);
    target.style.setProperty('--tiltY', `${tiltY}deg`);
  };
  const onCardTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('touch-active');
    target.style.setProperty('--tiltX', `0deg`);
    target.style.setProperty('--tiltY', `0deg`);
  };

  const handleServiceSelect = (service: ServiceDefinition) => {
    setSelectedService(service);
    if (service.options.length === 1 && !service.requiresLandLogic) {
      setSelectedOption(service.options[0]);
      setStep(2);
    } else {
      setStep(1);
    }
    setTimeout(() => {
      flowRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10 || !name || !address || !selectedService) return;
    if (selectedService.type === ServiceType.EVENT && (!notes || !notes.trim())) {
      // Require brief description for Any Event
      pushToast('Please add a brief description of the event.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const allowedCats = ['Repair', 'New', 'Buy', 'Sell'];
      const normalizedCategory = allowedCats.includes(selectedOption) ? selectedOption : 'New';
      const { synced } = await saveEnquiry({
        service: selectedService.type,
        category: normalizedCategory as any,
        landCondition: landCondition || undefined,
        phone,
        name,
        address,
        preferredDate: preferredDate || undefined,
        preferredTime: preferredTime || undefined,
        notes: notes || undefined,
      });

      if (synced) {
        setStep(4);
        pushToast(t.linkedEngaged, 'success');
      } else {
        pushToast('Submit failed. Please try again.', 'error');
        return;
      }
      const svc = t.services[selectedService.type as keyof typeof t.services];
      const cats = t.categories[(normalizedCategory || 'New') as keyof typeof t.categories];
      const land = landCondition ? t.categories[landCondition as keyof typeof t.categories] : '';
      const lines = [
        `${t.brand} • New Service Request`,
        '',
        `Client: ${name}`,
        `Phone: ${phone}`,
        `Service: ${svc}${cats ? ` (${cats})` : ''}${land ? ` • ${land}` : ''}`,
        `Location: ${address}`,
        `Preferred: ${preferredDate || 'N/A'} ${preferredTime || ''}`.trim(),
        notes ? `Notes: ${notes}` : undefined,
        '',
        'Please confirm availability and pricing.',
      ].filter(Boolean).join('\n');
      const url = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(lines)}`;
      window.open(url, '_blank', 'noopener');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep(0);
    setSelectedService(null);
    setSelectedOption('');
    setLandCondition('');
    setPhone('');
    setName('');
    setAddress('');
    setPreferredDate('');
    setPreferredTime('');
    setNotes('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progressPercentage = (step / 4) * 100;

  // Global keyboard shortcuts: Escape to go back/reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (step > 0 && step < 4) {
          setStep(prev => Math.max(0, prev - 1));
        } else if (step === 4) {
          resetFlow();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  return (
    <div className={`min-h-screen transition-colors duration-700 page-fade-in ${entered ? 'ready' : ''} ${theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-black'} ${language === 'bn' ? 'lang-bn' : ''}`}>
      {!introDone && <IntroOverlay onComplete={() => setIntroDone(true)} />}
      {/* Keyboard shortcuts handled via useEffect above */}

      {/* Background Cinematic Elements removed per request (orange blur blobs) */}

      {/* Dynamic Header */}
      <nav className={`p-6 md:p-10 flex justify-between items-center fixed top-0 w-full z-50 transition-all duration-500 ${introDone ? 'opacity-100' : 'opacity-0 translate-y--10'} ${scrolled ? (theme === 'dark' ? 'bg-black/40 backdrop-blur-md' : 'bg-white/60 backdrop-blur-md') : 'bg-transparent'} ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-black tracking-tighter ${language === 'bn' ? '' : 'uppercase italic'}`}>{t.brand}</div>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse hidden md:block"></div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className={`flex items-center p-1 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}`}>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-full transition-all duration-500 ${language === 'en' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white') : 'opacity-40 hover:opacity-100'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-4 py-2 rounded-full transition-all duration-500 ${language === 'bn' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white') : 'opacity-40 hover:opacity-100'}`}
            >
              বাংলা
            </button>
          </div>
          <button onClick={toggleTheme} className={`p-3 rounded-full border transition-all duration-500 backdrop-blur-md ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <Link to="/admin" className={`hidden sm:block text-[10px] uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-700 font-black backdrop-blur-md border ${theme === 'dark' ? 'bg-white/10 border-white/20 hover:bg-orange-500 hover:text-white' : 'bg-black/10 border-black/20 hover:bg-orange-500 hover:text-white'}`}>
            {t.businessAccess}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
          const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
          setParallax({ x, y });
        }}
        className={`h-screen px-8 md:px-24 relative overflow-hidden z-10 flex items-center`}
      >
        {/* Cinematic eye-opening reveal overlay */}
        <div className="hero-reveal" aria-hidden="true">
          <div className="hero-reveal__aperture"></div>
        </div>
        {/* Base black background */}
        <div className="absolute inset-0 z-0 bg-black" aria-hidden="true"></div>
        {/* Premium moving aurora overlay */}
        <PremiumAurora
          primaryColor="#ff9e73"
          secondaryColor="#ffd6b3"
          intensity={0.85}
          speed={15}
          angle={-24}
          mixBlendMode="screen"
        />
        <div className="w-full flex items-center justify-center">
          {language === 'en' ? (
            <Reveal className={`transition-all duration-500 ${introDone ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-sm'} text-center`}>
              <div className="max-w-5xl mx-auto">
                <Reveal staggerChildren>
                  <motion.h1
                    className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 hero-text-enter"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: heroLandingDuration }}
                  >
                    <WritingText
                      key={`hero-writing-${language}-${introDone ? 'intro' : 'pre'}`}
                      text={`${t.heroH1a} ${t.heroH1b}`}
                      spacing={8}
                      transition={{ type: 'tween', ease: 'easeOut', duration: heroWordDuration, delay: heroWordDelay }}
                    />
                  </motion.h1>
                  <div className="mb-10">
                    <span className="text-4xl md:text-5xl font-black text-orange-500 hero-brand-enter">{t.heroBrand}</span>
                  </div>
                  <motion.p
                    className="max-w-2xl mx-auto text-lg md:text-xl opacity-70 leading-relaxed mb-12"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'tween', ease: 'easeOut', duration: subtextDuration, delay: 0.08 }}
                  >
                    {t.heroDescExact}
                  </motion.p>
                  <button 
                    onClick={() => flowRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="group inline-flex items-center gap-6 btn-magnetic btn-premium parallax-layer mx-auto"
                    style={{ ['--parallax-y' as any]: `${scrollParallax.y * 0.4}px` }}
                  >
                    <div className={`w-20 h-20 flex items-center justify-center rounded-full transition-all duration-700 ${theme === 'dark' ? 'bg-white text-black shadow-white/5' : 'bg-black text-white shadow-black/5'} group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-12`}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </div>
                    <span className="text-sm uppercase tracking-[0.5em] font-black group-hover:text-orange-500 transition-colors duration-500">{t.heroCta}</span>
                  </button>
                </Reveal>
              </div>
            </Reveal>
          ) : (
            <Reveal className={`transition-all duration-500 ${introDone ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-sm'} text-center`}>
              <div className="text-center max-w-5xl mx-auto">
                <motion.h1
                  className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 hero-text-enter"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'tween', ease: 'easeOut', duration: heroLandingDuration }}
                >
                  {`${t.heroH1a} ${t.heroH1b}`}
                </motion.h1>
                <div className="mb-10">
                  <span className="text-4xl md:text-5xl font-black text-orange-500 hero-brand-enter">{t.heroBrand}</span>
                </div>
                <motion.p
                  className="max-w-2xl mx-auto text-lg md:text-xl opacity-70 leading-relaxed mb-12"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'tween', ease: 'easeOut', duration: subtextDuration, delay: 0.06 }}
                >
                  {t.heroDescExact}
                </motion.p>
                <button 
                  onClick={() => flowRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="group inline-flex items-center gap-6 btn-magnetic btn-premium parallax-layer mx-auto"
                  style={{ ['--parallax-y' as any]: `${scrollParallax.y * 0.4}px` }}
                >
                  <div className={`w-20 h-20 flex items-center justify-center rounded-full transition-all duration-700 ${theme === 'dark' ? 'bg-white text-black shadow-white/5' : 'bg-black text-white shadow-black/5'} group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-12`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                  </div>
                  <span className="text-sm uppercase tracking-[0.5em] font-black group-hover:text-orange-500 transition-colors duration-500">{t.heroCta}</span>
                </button>
              </div>
            </Reveal>
          )}
          {/* Side animation removed to center focus on hero text */}
        </div>
      </section>

      {/* Enquiry Flow Section */}
      <section ref={flowRef} className={`min-h-screen py-40 px-8 md:px-24 relative overflow-hidden transition-all duration-500 z-20 ${theme === 'dark' ? 'bg-[#111] text-white' : 'bg-[#F9FAFB] text-black'}`}>
        <div className="fixed top-0 left-0 h-1.5 bg-orange-500 transition-all duration-1000 z-[60]" style={{ width: `${progressPercentage}%` }}></div>
        {/* Floating Back Button */}
        {step > 0 && step < 4 && (
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            aria-label="Go back"
            className={`fixed bottom-6 left-6 z-[70] px-6 py-3 rounded-full border font-black uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 flex items-center gap-3 ${theme === 'dark' ? 'bg-black/70 text-white border-white/10 backdrop-blur-md' : 'bg-white/70 text-black border-black/10 backdrop-blur-md'} hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:translate-y-[-2px]`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
            Back
          </button>
        )}
        
        <div className="max-w-7xl mx-auto">
          <div className={`mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 pb-16 ${theme === 'dark' ? 'border-black/5' : 'border-white/5'}`}>
            <div className="animate__animated animate__fadeInLeft">
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>{t.step} {step + 1}/5</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                {step === 0 && t.identifyService}
                {step === 1 && t.specifyMode}
                {step === 2 && t.finalizeLink}
                {step === 3 && t.assetStatus}
                {step === 4 && t.systemLogged}
              </h2>
            </div>
            {step > 0 && step < 4 && (
              <button 
                onClick={() => setStep(prev => prev - 1)}
                className="group flex items-center gap-4 text-xs uppercase font-black tracking-[0.3em] opacity-30 hover:opacity-100 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
                </div>
                {t.previousStep}
              </button>
            )}
          </div>

          <div className="relative">
            {step === 0 && (
              <Reveal staggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 step-enter">
                {SERVICES.map((s, idx) => (
                  <button
                    key={s.type}
                    style={{ ['--stagger-index' as any]: idx }}
                    onMouseMove={onCardMouseMove}
                    onMouseLeave={onCardMouseLeave}
                    onTouchStart={onCardTouchStart}
                    onTouchMove={onCardTouchMove}
                    onTouchEnd={onCardTouchEnd}
                    onClick={() => handleServiceSelect(s)}
                    className={`group min-h-[260px] md:h-[320px] border flex flex-col items-start justify-end p-8 md:p-10 transition-all duration-700 relative overflow-hidden service-card ${theme === 'dark' ? 'bg-[#111] text-white border-white/10 hover:border-white/20' : 'bg-white text-black border-black/10 hover:border-black/20'}`}
                  >
                    <div className="absolute top-10 right-10 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:scale-125 group-hover:-rotate-12">
                      <span className="text-7xl font-black italic">{idx + 1}</span>
                    </div>
                    <div className="w-full svc-card-text flex flex-col items-start">
                      <div className={`svc-divider transition-all duration-700 group-hover:w-full ${theme === 'dark' ? 'bg-black/10' : 'bg-white/10'} group-hover:bg-orange-500`}></div>
                      <div className="svc-labels flex flex-col gap-1 mb-6">
                        <span className="svc-label service-card-meta text-[10px] uppercase font-black opacity-50">Protocol</span>
                        <span className="svc-label service-card-meta text-[10px] uppercase font-black opacity-40">Local</span>
                      </div>
                      <span className="svc-title service-card-title text-2xl md:text-3xl font-black uppercase italic">{t.services[s.type as keyof typeof t.services]}</span>
                    </div>
                    <div className={`absolute bottom-0 left-0 w-full h-0 transition-all duration-700 -z-10 ${theme === 'dark' ? 'bg-black/5' : 'bg-white/5' } group-hover:h-full`}></div>
                  </button>
                ))}
              </Reveal>
            )}

            {step === 1 && selectedService && (
              <Reveal staggerChildren className="flex flex-col gap-16 step-enter">
                <p className="text-3xl md:text-5xl font-black opacity-20 italic uppercase tracking-tighter">
                  {t.determineRequirement} {t.services[selectedService.type as keyof typeof t.services]}:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedService.options.map((opt, idx) => (
                    <button
                      key={opt}
                      style={{ ['--stagger-index' as any]: idx }}
                      onClick={() => {
                        setSelectedOption(opt);
                        if (selectedService.requiresLandLogic) {
                          setStep(3);
                        } else {
                          setStep(2);
                        }
                      }}
                      className={`group flex items-center justify-between px-12 py-16 text-4xl font-black uppercase italic transition-all duration-700 ${theme === 'dark' ? 'bg-black text-white hover:bg-orange-500' : 'bg-white text-black hover:bg-orange-500'} hover:translate-x-4`}
                    >
                      <span>{t.categories[opt as keyof typeof t.categories]}</span>
                      <svg className="w-10 h-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-6 transition-all duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                  ))}
                </div>
              </Reveal>
            )}

            {step === 3 && (
              <Reveal staggerChildren className="flex flex-col gap-16 step-enter">
                <p className="text-3xl md:text-5xl font-black opacity-20 italic uppercase tracking-tighter">
                  {t.propertyState}:
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {(['Old', 'New'] as const).map((cond, idx) => (
                    <button
                      key={cond}
                      style={{ ['--stagger-index' as any]: idx }}
                      onClick={() => {
                        setLandCondition(cond);
                        setStep(2);
                      }}
                      className={`px-12 py-20 text-5xl font-black uppercase italic transition-all duration-700 ${theme === 'dark' ? 'bg-black text-white hover:bg-orange-500' : 'bg-white text-black hover:bg-orange-500'} hover:-translate-y-4`}
                    >
                      {t.categories[cond as keyof typeof t.categories]}
                    </button>
                  ))}
                </div>
              </Reveal>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="max-w-5xl step-enter">
                <p className="text-3xl md:text-5xl font-black opacity-20 italic uppercase tracking-tighter mb-16">
                  {t.establishConnection}:
                </p>
                {/* Selection Summary */}
                {selectedService && (
                  <div className={`mb-10 p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${theme === 'dark' ? 'border-black/10 bg-black/5' : 'border-white/10 bg-white/5'}`}>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2">You have selected</p>
                      <p className="text-xl md:text-2xl font-black italic">
                        {t.services[selectedService.type as keyof typeof t.services]}
                        {selectedOption ? ` • ${t.categories[selectedOption as keyof typeof t.categories]}` : ''}
                        {landCondition ? ` • ${t.categories[landCondition as keyof typeof t.categories]}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className={`text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} hover:bg-orange-500 hover:text-white hover:border-orange-500`}
                    >
                      Change
                    </button>
                  </div>
                )}
                {/* Client Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-3 block">Client Name</label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className={`w-full bg-transparent border-b-4 text-xl md:text-2xl font-black py-4 md:py-5 focus:outline-none focus:border-orange-500 transition-all ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-3 block">Location / Address</label>
                    <input
                      required
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Apartment / Street / City"
                      className={`w-full bg-transparent border-b-4 text-xl md:text-2xl font-black py-4 md:py-5 focus:outline-none focus:border-orange-500 transition-all ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-3 block">Preferred Date</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {quickDates().map((d) => (
                          <button type="button" key={d.label} onClick={() => setPreferredDate(d.value)}
                            className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border ${theme === 'dark' ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} hover:bg-orange-500 hover:text-white`}
                          >{d.label}</button>
                        ))}
                      </div>
                      <input
                        type="date"
                        min={todayISO()}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className={`w-full bg-transparent border-b-4 text-xl md:text-2xl font-black py-4 md:py-5 focus:outline-none focus:border-orange-500 transition-all ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-3 block">Preferred Time</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2">
                        {quickTimes().map((t) => (
                          <button
                            type="button"
                            key={t.label}
                            onClick={() => {
                              setTimeHour(String(t.hour));
                              setTimeMinute(String(t.minute));
                              setTimePeriod(t.period as 'AM' | 'PM');
                            }}
                            className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border ${theme === 'dark' ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'} hover:bg-orange-500 hover:text-white`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2 block">Hour</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={12}
                            value={timeHour}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              if (raw === '') { setTimeHour(''); return; }
                              const num = parseInt(raw, 10);
                              if (num >= 1 && num <= 12) setTimeHour(String(num));
                            }}
                            placeholder="6"
                            className={`w-full bg-transparent border-b-4 text-xl md:text-2xl font-black py-4 md:py-5 focus:outline-none focus:border-orange-500 transition-all ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2 block">Minute</label>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={59}
                            value={timeMinute}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              if (raw === '') { setTimeMinute(''); return; }
                              const num = parseInt(raw, 10);
                              if (num >= 0 && num <= 59) setTimeMinute(String(num));
                            }}
                            placeholder="20"
                            className={`w-full bg-transparent border-b-4 text-xl font-black py-4 focus:outline-none focus:border-orange-500 transition-all ${theme === 'dark' ? 'border-black' : 'border-white'}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] uppercase font-black tracking-widest opacity-40">AM/PM</label>
                          <div className="flex gap-2">
                            <button type="button"
                              onClick={() => setTimePeriod('AM')}
                              className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg border ${timePeriod === 'AM' ? 'bg-orange-500 text-white border-orange-500' : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
                            >AM</button>
                            <button type="button"
                              onClick={() => setTimePeriod('PM')}
                              className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg border ${timePeriod === 'PM' ? 'bg-orange-500 text-white border-orange-500' : theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
                            >PM</button>
                          </div>
                        </div>
                      </div>
                      {timeHour !== '' && parseInt(timeHour, 10) > 12 && (
                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Invalid hour. Use 1-12 with AM/PM.</p>
                      )}
                      <p className="text-xs font-black uppercase tracking-[0.3em] opacity-30">Selected: {preferredTime || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Phone Field */}
                <div className="relative group overflow-hidden">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl md:text-3xl font-black opacity-20 group-focus-within:text-orange-500 group-focus-within:opacity-100 transition-all duration-700 uppercase">+91</span>
                  <input
                    required
                    autoFocus
                    type="tel"
                    placeholder="00000 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    inputMode="numeric"
                    className={`w-full bg-transparent border-b-[6px] text-3xl md:text-5xl font-black py-8 pl-20 md:pl-32 focus:outline-none focus:border-orange-500 transition-all duration-700 placeholder:opacity-30 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                  />
                  <div className="absolute bottom-0 left-0 h-4 bg-orange-500 transition-all duration-1000 w-0 group-focus-within:w-full"></div>
                </div>
                <div className="mt-10">
                  <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-3 block">
                    {selectedService?.type === ServiceType.EVENT ? 'Brief Description (required for Any Event)' : 'Notes (optional)'}
                  </label>
                  <textarea
                    required={selectedService?.type === ServiceType.EVENT}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={selectedService?.type === ServiceType.EVENT ? 'Brief description of the event' : 'Brief description of the work'}
                    rows={3}
                    className={`w-full bg-transparent border-b-4 text-xl md:text-2xl font-black py-4 md:py-5 focus:outline-none focus:border-orange-500 transition-all ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                  />
                  {selectedService?.type === ServiceType.EVENT && (!notes || !notes.trim()) && (
                    <p className="mt-2 text-[10px] text-red-500 font-black uppercase tracking-widest">This field is required for Any Event.</p>
                  )}
                </div>
                <div className="mt-20 flex flex-col md:flex-row items-center gap-12">
                  <button
                    disabled={phone.length < 10 || !name || !address || isSubmitting || (selectedService?.type === ServiceType.EVENT && (!notes || !notes.trim()))}
                    className={`w-full md:w-auto px-24 py-10 text-2xl font-black uppercase italic transition-all duration-700 flex items-center justify-center gap-6 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black'} hover:bg-orange-500 hover:text-white disabled:opacity-10 disabled:grayscale hover:scale-105 active:scale-95 btn-premium`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t.logging}
                      </>
                    ) : t.establishLink}
                  </button>
                  <p className="text-xs uppercase font-black tracking-[0.4em] opacity-30 max-w-sm leading-relaxed">
                    By submitting, you engage the resolution protocol. Amol and the response team will be alerted instantly via encrypted notification.
                  </p>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center justify-center text-center py-20 animate__animated animate__zoomIn">
                <div className="w-40 h-40 bg-orange-500 rounded-full flex items-center justify-center mb-12 shadow-2xl shadow-orange-500/40 relative">
                    <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20"></div>
                  <svg className="w-20 h-20 text-white animate__animated animate__bounceIn animate__delay-1s" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-6xl md:text-[10rem] font-black italic uppercase leading-[0.82] mb-12">
                  {t.linkedEngaged}
                </h3>
                <p className="text-xl md:text-3xl opacity-50 max-w-3xl mb-16 font-medium leading-relaxed">
                  {t.services[selectedService?.type as keyof typeof t.services]} — {t.serviceTicketActive}
                </p>
                <button
                  onClick={resetFlow}
                  className={`px-16 py-6 text-sm font-black uppercase tracking-[0.5em] transition-all duration-700 ${theme === 'dark' ? 'bg-black text-white hover:shadow-2xl' : 'bg-white text-black hover:shadow-2xl shadow-black/5'} hover:bg-orange-500 hover:text-white hover:scale-105 active:scale-95`}
                >
                  {t.terminateSession}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Authority Section with Reveal and alternating surface for contrast */}
      <section ref={(el) => { revealRefs.current[0] = el; }} className={`py-72 px-8 md:px-24 relative overflow-hidden reveal z-30 ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
        <div className="grid lg:grid-cols-2 gap-40 items-center max-w-7xl mx-auto">
          <div>
            <span className="text-orange-500 font-black uppercase tracking-[0.5em] text-xs block mb-10">{t.systemPillar}</span>
            <h2 className="text-7xl md:text-[10rem] font-black cinematic-text uppercase leading-[0.82] mb-16 italic">
              {t.absoluteControl}
            </h2>
            <div className="flex gap-6">
               <div className="w-20 h-1.5 bg-orange-500/50 mt-6"></div>
               <p className="text-2xl opacity-40 font-medium max-w-lg leading-relaxed">
                 {t.controlDesc}
               </p>
            </div>
          </div>
          <div className="grid gap-px bg-white/5 border border-white/10 shadow-2xl">
            {[
              { label: t.responsibility, value: t.zeroLiability, delay: '0s' },
              { label: t.efficiency, value: t.techPrecision, delay: '0.2s' },
              { label: t.integrity, value: t.absoluteAuthority, delay: '0.4s' }
            ].map(item => (
              <div key={item.label} className={`p-16 hover:bg-orange-500/10 transition-all duration-700 group cursor-default ${theme === 'dark' ? 'bg-[#111]' : 'bg-[#eee]'}`}>
                <h4 className="text-xs uppercase tracking-[0.6em] font-black text-orange-500 mb-6">{item.label}</h4>
                <p className="text-4xl font-black italic group-hover:translate-x-4 transition-all duration-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with Reveal */}
      <footer ref={(el) => { revealRefs.current[1] = el; }} className={`p-16 md:p-40 transition-colors duration-1000 reveal z-40 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#fafafa]'} flex flex-col md:flex-row justify-between items-start md:items-end gap-24`}>
        <div className="max-w-2xl">
          <div className="text-6xl font-black tracking-tighter uppercase italic mb-12 transform hover:scale-105 transition-transform duration-700 cursor-default">{t.brand}</div>
          <p className="opacity-20 text-base uppercase tracking-[0.4em] font-bold leading-[2] mb-16 hover-blink-white transition-opacity duration-300">
            {t.footerDesc}
          </p>
          <div className="flex gap-20">
            <div className="group cursor-default">
              <p className="text-[10px] uppercase font-black opacity-40 mb-3 group-hover:text-orange-500 transition-colors">{t.lead}</p>
              <p className="text-sm font-black uppercase tracking-widest">AMOL / COMMAND</p>
            </div>
            <div className="group cursor-default">
              <p className="text-[10px] uppercase font-black opacity-40 mb-3 group-hover:text-orange-500 transition-colors">{t.epoch}</p>
              <p className="text-sm font-black uppercase tracking-widest">2025 V1.0</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <Link to="/admin" className="inline-block text-sm font-black uppercase tracking-[0.6em] border-b-4 border-orange-500 pb-3 hover:border-black hover:tracking-[0.8em] transition-all duration-700">
            {t.businessAccess}
          </Link>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-10 mt-16 font-black">© {t.brand.toUpperCase()} RESOLUTIONS. {t.noChaos}</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;
