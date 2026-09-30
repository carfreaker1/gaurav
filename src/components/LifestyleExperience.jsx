import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowDown, ArrowUpRight, ArrowLeft, ArrowRight, Instagram, Play, X, RotateCcw } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content } from '../config';
import { MagneticLink, Reveal, SceneBoundary } from './ui';
import ScrollType from './ScrollType';
const SpatialScene=lazy(()=>import('./3d/SpatialScene'));
gsap.registerPlugin(ScrollTrigger);

function PhotoStage({ mode='hero', reduced, active=0, onSelect, onReady, motionState }) {
  const host=useRef();
  const inView=useInView(host,{margin:'150px'});
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  const loaded=useCallback(()=>{setReady(true);onReady?.();},[onReady]);
  const fail=useCallback(()=>{setFailed(true);setReady(false);onReady?.();},[onReady]);
  const item=mode==='hero'?{title:'GAURAV',image:content.portrait,subtitle:content.headline}:content.gallery[active];
  return <div className={'photo-stage '+mode+'-stage'} ref={host}>
    {(!ready||failed)&&<button className="stage-fallback" aria-label={'Open '+item.title.toLowerCase()+' photo'} onClick={()=>onSelect(item)}><img src={item.image} alt={'Gaurav — '+item.title}/></button>}
    {inView&&!failed&&<SceneBoundary onError={fail} fallback={null}><Suspense fallback={null}><SpatialScene mode={mode} reduced={reduced} active={active} onSelect={onSelect} onReady={loaded} motionState={motionState}/></Suspense></SceneBoundary>}
    <span className="stage-corner corner-tl"/><span className="stage-corner corner-br"/>
  </div>;
}

export function LifestyleHero({ reduced, onReady, onSelect }) {
  const host=useRef(),motionState=useRef({progress:0});
  useLayoutEffect(()=>{
    if(reduced)return;
    const context=gsap.context(()=>{
      gsap.to('.hero-name',{xPercent:-10,opacity:.2,ease:'none',scrollTrigger:{trigger:host.current,start:'top top',end:'bottom top',scrub:1}});
      ScrollTrigger.create({trigger:host.current,start:'top top',end:'bottom top',onUpdate:self=>{motionState.current.progress=self.progress;}});
    },host);
    return()=>context.revert();
  },[reduced]);
  return <section id="home" className="editorial-hero" ref={host}>
    <div className="hero-grain"/><div className="hero-orbit"/>
    <div className="hero-kicker"><span><i/> THE PERSONAL EDITION</span><span>EST. IN THE MOMENT / VOL. 01</span></div>
    <div className="hero-name" aria-hidden="true">{content.name.toUpperCase()}</div>
    <div className="editorial-heading"><motion.p initial={reduced?false:{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.8}}>A LIFE IN MOTION.</motion.p>
      <motion.h1 initial={reduced?false:{opacity:0,y:45}} animate={{opacity:1,y:0}} transition={{duration:1,delay:.2}}>{content.heroLines[0]}<br/><em>{content.heroLines[1]}</em><span className="hero-period">.</span></motion.h1>
      <p className="hero-description">{content.heroDescription}</p>
      <MagneticLink href="#moments">ENTER MY WORLD</MagneticLink>
      <a href={content.instagram.url} target="_blank" rel="noopener noreferrer" className="hero-handle">{content.instagram.handle}<ArrowUpRight size={14}/></a>
    </div>
    <PhotoStage reduced={reduced} onReady={onReady} onSelect={onSelect} motionState={motionState}/>
    <div className="hero-photo-label"><span>001 — {content.name.toUpperCase()}</span><span>MOVE AROUND. LOOK CLOSER.</span></div>
    <div className="editorial-hero-bottom"><a href="#lifestyle"><ArrowDown size={16}/> SCROLL INTO THE STORY</a><span>STYLE. DRIVE. EVERYTHING BETWEEN.</span><span>01 — 05</span></div>
  </section>;
}
export function LifestyleChapter({ reduced }) {
  return <section id="lifestyle" className="life-chapter">
    <div className="life-intro section-pad"><Reveal><span className="eyebrow">01 / THE WAY OF LIFE</span><h2>{content.lifestyleTitle[0]}<br/><em>{content.lifestyleTitle[1]}</em></h2></Reveal><Reveal><p>{content.introCopy}</p><span className="life-signature">{content.name} <ArrowUpRight size={29}/></span></Reveal></div>
    <ScrollType reduced={reduced}/>
    <div className="life-outro section-pad"><span>GOOD PEOPLE. OPEN ROADS. REAL MOMENTS.</span><span>KEEP COLLECTING THE GOOD STUFF. ↗</span></div>
  </section>;
}
export function SpatialGallery({ reduced, onSelect }) {
  const [active,setActive]=useState(0);
  const item=content.gallery[active];
  const pointer=useRef(null);
  const step=direction=>setActive(n=>(n+direction+content.gallery.length)%content.gallery.length);
  return <section id="moments" className="spatial-gallery section-pad">
    <Reveal className="collection-heading"><div><span className="eyebrow">02 / THE LIVING ARCHIVE</span><h2>{content.galleryTitle}<span>.</span></h2></div><p>A few frames.<br/>A whole lot of life.</p></Reveal>
    <div className="gallery-stage-wrap" onTouchStart={e=>{pointer.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(pointer.current!==null){const delta=e.changedTouches[0].clientX-pointer.current;if(Math.abs(delta)>55)step(delta<0?1:-1);pointer.current=null;}}}>
      <div className="gallery-giant-label" aria-hidden="true">{item.title}</div>
      <PhotoStage mode="gallery" reduced={reduced} active={active} onSelect={onSelect}/>
      <button className="gallery-prev icon-button" aria-label="Previous moment" onClick={()=>step(-1)}><ArrowLeft/></button>
      <button className="gallery-next icon-button" aria-label="Next moment" onClick={()=>step(1)}><ArrowRight/></button>
    </div>
    <div className="gallery-selection"><div><span className="eyebrow">0{active+1} / 05</span><h3>{item.title}</h3><p>{item.subtitle}</p></div><button className="button outlined" onClick={()=>onSelect(item)}>{item.video?'PLAY FILM':'VIEW MOMENT'}{item.video?<Play size={16}/>:<ArrowUpRight size={16}/>}</button></div>
    <div className="gallery-tabs" role="group" aria-label="Choose a moment">{content.gallery.map((frame,index)=><button key={frame.title} onClick={()=>setActive(index)} aria-pressed={index===active}><span>0{index+1}</span>{frame.title}<i/></button>)}</div>
    <p className="gallery-hint">SELECT A FRAME · USE THE ARROWS · SWIPE ON MOBILE</p>
  </section>;
}
export function BirthdayChapter({ calendar, onReplay }) {
  return <section className="annual-chapter section-pad">
    <div className="annual-top"><span className="eyebrow">A DATE WORTH KEEPING</span><span>EVERY YEAR. SAME ENERGY.</span></div>
    <Reveal><div className="annual-date"><span>30</span><div><span>SEPTEMBER</span><span>THE NEXT CHAPTER</span></div><span className="annual-star">✳</span></div></Reveal>
    <div className="annual-bottom"><p>{calendar.isBirthday?'Today is your day, Gaurav. Make it unforgettable.':'Some dates deserve their own moment. This one is yours.'}</p><button className="text-link" onClick={onReplay}>{calendar.isBirthday?'REPLAY BIRTHDAY MOMENT':'PREVIEW BIRTHDAY MOMENT'}<RotateCcw size={15}/></button></div>
  </section>;
}
export function BirthdayReveal({ open, onClose, year, reduced }) {
  const dialog=useRef();
  useEffect(()=>{
    const node=dialog.current;
    if(!open)return;
    const previous=document.activeElement;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    node.showModal();
    return()=>{node.close();document.body.style.overflow=overflow;if(previous instanceof HTMLElement)previous.focus();};
  },[open]);
  return <dialog ref={dialog} className="birthday-dialog" onCancel={e=>{e.preventDefault();onClose();}} aria-labelledby="annual-birthday-heading">
    {open&&<div className="birthday-reveal">
      <button autoFocus className="birthday-close icon-button" onClick={onClose} aria-label="Close birthday celebration"><X/></button>
      <div className="celebration-rings" aria-hidden="true"><i/><i/><i/></div>
      <motion.div initial={reduced?false:{opacity:0,x:-110,filter:'blur(12px)'}} animate={{opacity:1,x:0,filter:'blur(0px)'}} transition={{duration:.95,ease:[.16,1,.3,1]}}>
        <span className="eyebrow">30 SEPTEMBER / {year}</span>
        <h2 id="annual-birthday-heading">HAPPY BIRTHDAY<br/><span>{content.name.toUpperCase()}.</span></h2>
        <p>{content.birthdayWish}</p>
        <button className="button" onClick={onClose}>LET THE GOOD TIMES ROLL <ArrowUpRight size={17}/></button>
      </motion.div>
      <span className="birthday-reveal-credit">A LITTLE SOMETHING, FROM {content.creator.handle.toUpperCase()}</span>
    </div>}
  </dialog>;
}
export function InstagramChapter() {
  const host=useRef();
  const visible=useInView(host,{once:true,margin:'150px'});
  const [status,setStatus]=useState('waiting');
  useEffect(()=>{
    if(!visible)return;
    let live=true, loadedFrame;
    const node=host.current;
    const loaded=()=>{if(live)setStatus('loaded');};
    const observer=new MutationObserver(()=>{
      const frame=node.querySelector('iframe');
      if(frame&&frame!==loadedFrame){loadedFrame=frame;frame.title='Gaurav on Instagram';frame.addEventListener('load',loaded,{once:true});}
    });
    observer.observe(node,{childList:true,subtree:true});
    setStatus('loading');
    let script=document.getElementById('instagram-embed-script');
    const process=()=>{if(live)window.instgrm?.Embeds?.process();};
    const failed=()=>{if(live)setStatus('fallback');};
    if(!script){script=document.createElement('script');script.id='instagram-embed-script';script.src='https://www.instagram.com/embed.js';script.async=true;document.body.appendChild(script);}
    script.addEventListener('load',process);script.addEventListener('error',failed);
    process();
    const timeout=setTimeout(()=>{if(live)setStatus(current=>current==='loaded'?current:'fallback');},9000);
    return()=>{live=false;observer.disconnect();clearTimeout(timeout);script.removeEventListener('load',process);script.removeEventListener('error',failed);loadedFrame?.removeEventListener('load',loaded);};
  },[visible]);
  return <section id="instagram" className="social-chapter section-pad">
    <Reveal className="social-copy"><span className="eyebrow">03 / BEYOND THIS PAGE</span><h2>A little less<br/><em>curated.</em></h2><p>The everyday. The unexpected.<br/>The story keeps going.</p><a href={content.instagram.url} target="_blank" rel="noopener noreferrer" className="social-handle"><Instagram size={21}/>{content.instagram.handle}<ArrowUpRight size={20}/></a><MagneticLink href={content.instagram.url} target="_blank" rel="noopener noreferrer">VISIT INSTAGRAM</MagneticLink></Reveal>
    <div className="social-embed-card"><div className="social-card-heading"><Instagram size={20}/><span>{content.instagram.handle}</span><span className="live-dot"/></div>
      <div ref={host} className={'instagram-embed-host '+(status==='loaded'?'embed-visible':'embed-pending')} aria-hidden={status!=='loaded'}>
        {visible&&<blockquote className="instagram-media" data-instgrm-permalink={content.instagram.url} data-instgrm-version="14"><a href={content.instagram.url} target="_blank" rel="noopener noreferrer" tabIndex={status==='loaded'?0:-1}>View Gaurav on Instagram</a></blockquote>}
      </div>
      {status!=='loaded'&&<div className="social-fallback"><img src={content.portrait} alt="Gaurav" loading="lazy"/><span>THE MOMENTS IN BETWEEN.</span><p>{status==='fallback'?'More of the story, on Instagram.':'A glimpse into his world.'}</p></div>}
      <a className="social-card-footer" href={content.instagram.url} target="_blank" rel="noopener noreferrer">OPEN PROFILE ON INSTAGRAM <ArrowUpRight size={15}/></a>
    </div>
  </section>;
}
export function LifestyleFooter() {
  return <footer className="lifestyle-footer section-pad"><Reveal><span className="eyebrow">THE STORY DOESN’T END HERE.</span><h2>Stay real.<br/><em>Keep moving.</em><span>↗</span></h2><a href={content.instagram.url} target="_blank" rel="noopener noreferrer">{content.instagram.handle}<ArrowUpRight size={18}/></a></Reveal><div className="footer-bottom"><span>{content.name.toUpperCase()} / A LIFE IN MOTION</span><a href={content.creator.url} target="_blank" rel="noopener noreferrer">Created by <strong>{content.creator.handle}</strong><ArrowUpRight size={13}/></a><a href="#home">BACK TO TOP <ArrowUpRight size={14}/></a></div></footer>;
}
