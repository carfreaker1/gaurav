import { useEffect, useRef, useState, Component } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Volume2, VolumeX, Menu, X } from 'lucide-react';
import music from '../../songs/Ashke.mp3';

export function Reveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .85, delay, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}
export function MagneticLink({ children, href, className = '', ...props }) {
  const ref = useRef();
  const reduced = useReducedMotion();
  const move = (e) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const box = ref.current.getBoundingClientRect();
    ref.current.style.transform = 'translate(' + (e.clientX - box.left - box.width / 2) * .12 + 'px,' + (e.clientY - box.top - box.height / 2) * .15 + 'px)';
  };
  return <a ref={ref} href={href} className={'button ' + className} onPointerMove={move} onPointerLeave={() => { ref.current.style.transform = ''; }} {...props}>{children}<ArrowUpRight size={17}/></a>;
}
export function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-20% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const escape = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, []);
  return <header className="navigation"><a className="wordmark" href="#home" aria-label="Gaurav home">G<span>.</span></a>
    <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Main navigation" id="navigation-links">{['Home', 'Lifestyle', 'Moments', 'Instagram', 'Message'].map(item => <a className={active === item.toLowerCase() ? 'active' : ''} key={item} href={'#' + item.toLowerCase()} onClick={() => setOpen(false)}>{item}</a>)}</nav>
    <span className="nav-edition"><i/> THE PERSONAL EDITION</span><button className="menu-toggle icon-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="navigation-links" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
  </header>;
}
export function SoundToggle() {
  const audio = useRef();
  const stopWaiting = useRef(() => {});
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const track = new Audio(music);
    audio.current = track;
    track.preload = 'auto';
    track.loop = true;
    track.muted = false;
    track.volume = .35;
    let disposed = false;
    const seekToIntro = () => { track.currentTime = 27; };
    track.addEventListener('loadedmetadata', seekToIntro, { once: true });
    const started = () => { if (!disposed) { setPlaying(true); setError(false); stopWaiting.current(); } };
    const paused = () => { if (!disposed) setPlaying(false); };
    track.addEventListener('playing', started);
    track.addEventListener('pause', paused);
    const attempt = () => {
      if (disposed) return;
      track.muted = false;
      track.play().catch(reason => {
        if (!disposed && reason.name !== 'NotAllowedError' && reason.name !== 'AbortError') setError(true);
      });
    };
    const firstInteraction = event => {
      if (event.target instanceof Element && event.target.closest('.sound-toggle')) return;
      if (event.type === 'keydown' && (event.repeat || event.ctrlKey || event.metaKey || event.altKey)) return;
      attempt();
    };
    stopWaiting.current = () => {
      document.removeEventListener('pointerdown', firstInteraction);
      document.removeEventListener('keydown', firstInteraction);
    };
    document.addEventListener('pointerdown', firstInteraction);
    document.addEventListener('keydown', firstInteraction);
    attempt();
    return () => {
      disposed = true;
      stopWaiting.current();
      track.removeEventListener('loadedmetadata', seekToIntro);
      track.removeEventListener('playing', started);
      track.removeEventListener('pause', paused);
      track.pause();
      track.removeAttribute('src');
      track.load();
      audio.current = null;
    };
  }, []);
  async function toggle() {
    const track = audio.current;
    if (!track) return;
    stopWaiting.current();
    if (!track.paused) track.pause();
    else {
      track.muted = false;
      try { await track.play(); setError(false); } catch { setError(true); }
    }
  }
  return <div className="sound-wrap"><button className="sound-toggle" onClick={toggle} aria-pressed={playing}>{playing ? <Volume2 size={14}/> : <VolumeX size={14}/>}<span>SOUND {playing ? 'ON' : 'OFF'}</span><span className={'equalizer ' + (playing ? 'playing' : '')}><i/><i/><i/><i/></span></button>{error && <span role="status">Audio unavailable. Try again.</span>}</div>;
}

export function LoadingScreen({ ready }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => { if (ready) { setProgress(100); return; } const id = setInterval(() => setProgress(p => Math.min(90, p + (90 - p) * .18)), 120); return () => clearInterval(id); }, [ready]);
  return <div className={ready ? "loader loader-ready" : "loader"} role="status"><span className="wordmark">G<span>.</span></span><div className="loader-bottom"><p>INITIALIZING EXPERIENCE <span>{Math.round(progress).toString().padStart(2, '0')}%</span></p><div className="loader-track"><div style={{ width: progress + '%' }}/></div><small>A LIFE IN MOTION / THE PERSONAL EDITION</small></div></div>;
}
export class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
