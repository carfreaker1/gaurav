import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Plus, X } from 'lucide-react';
import { content } from './config';
import { LoadingScreen, Navigation, Reveal, SoundToggle } from './components/ui';
import { LifestyleHero, LifestyleChapter, SpatialGallery, BirthdayChapter, BirthdayReveal, InstagramChapter, LifestyleFooter } from './components/LifestyleExperience';
import { useAnnualBirthday } from './lib/birthday';

function Message() {
  const [message,setMessage]=useState(()=>{ try{return localStorage.getItem('gaurav-birthday-message')||content.message;}catch{return content.message;} });
  const [editing,setEditing]=useState(false),[draft,setDraft]=useState(message),[status,setStatus]=useState('');
  function save(e) { e.preventDefault(); if(!draft.trim())return; setMessage(draft.trim());setEditing(false);try{localStorage.setItem('gaurav-birthday-message',draft.trim());setStatus('Your message is saved in this browser.');}catch{setStatus('Message updated for this visit.');} }
  return <section id="message" className="message-section section-pad"><Reveal><div className="section-label"><span>04 / A NOTE FOR YOU</span><span className="asterisk">✳</span></div><h2>{content.messageTitleLines[0]}<br/><span>{content.messageTitleLines[1]}</span></h2><div className="message-layout"><span className="message-to">DEAR {content.name.toUpperCase()},</span><div>{editing?<form onSubmit={save}><label className="sr-only" htmlFor="birthday-message">Your birthday message</label><textarea id="birthday-message" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={3000} required autoFocus/><div className="editor-actions"><button className="button" type="submit">SAVE MESSAGE <ArrowUpRight size={16}/></button><button className="text-link" type="button" onClick={()=>setEditing(false)}>Cancel</button></div></form>:<p className="personal-message">{message}</p>}<p className="message-signature">{content.messageSignature}</p><button className="edit-message" onClick={()=>{setDraft(message);setEditing(!editing);setStatus('');}}>{editing?'CLOSE EDITOR':'MAKE THIS MESSAGE YOURS'} <Plus size={13}/></button><p className="save-status" role="status">{status}</p></div></div></Reveal></section>;
}

function Lightbox({ item, onClose }) {
  const close=useRef(),previousFocus=useRef();
  useEffect(()=>{
    previousFocus.current=document.activeElement;close.current?.focus();
    const original=document.body.style.overflow;document.body.style.overflow='hidden';
    const key=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const elements=Array.from(document.querySelectorAll('.lightbox button, .lightbox video')).filter(el=>!el.disabled);const first=elements[0],last=elements[elements.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
    document.addEventListener('keydown',key);
    return()=>{document.body.style.overflow=original;document.removeEventListener('keydown',key);previousFocus.current?.focus();};
  },[onClose]);
  return <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title+' gallery preview'} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}><button ref={close} className="lightbox-close icon-button" aria-label="Close preview" onClick={onClose}><X/></button><div className="lightbox-content" onClick={e=>e.stopPropagation()}>{item.video?<video controls playsInline preload="metadata" poster={item.image} src={item.video} tabIndex={0}/>:<img src={item.image} alt={'Gaurav — '+item.title.toLowerCase()}/>}<p>{item.title}<span>{item.subtitle}</span></p></div></motion.div>;
}


export default function App() {
  const reduced=useReducedMotion();
  const [ready,setReady]=useState(false),[loading,setLoading]=useState(true),[selected,setSelected]=useState(null);
  const onReady=useCallback(()=>setReady(true),[]);
  const onClose=useCallback(()=>setSelected(null),[]);
  const calendar=useAnnualBirthday(!loading);
  useEffect(()=>{const timeout=setTimeout(()=>setReady(true),6000);return()=>clearTimeout(timeout);},[]);
  useEffect(()=>{if(!ready)return;const timeout=setTimeout(()=>setLoading(false),300);return()=>clearTimeout(timeout);},[ready]);
  return <>
    <a className="skip-link" href="#lifestyle">Skip introduction</a>
    {loading&&<LoadingScreen ready={ready}/>}
    <Navigation/>
    <main>
      <LifestyleHero reduced={reduced} onReady={onReady} onSelect={setSelected}/>
      <LifestyleChapter reduced={reduced}/>
      <SpatialGallery reduced={reduced} onSelect={setSelected}/>
      <BirthdayChapter calendar={calendar} onReplay={()=>calendar.setOpen(true)}/>
      <InstagramChapter/>
      <Message/>
    </main>
    <LifestyleFooter/><SoundToggle/>
    <AnimatePresence>{selected&&<Lightbox item={selected} onClose={onClose}/>}</AnimatePresence>
    <BirthdayReveal open={calendar.open} onClose={()=>calendar.setOpen(false)} year={Math.max(calendar.year,content.birthday.startYear)} reduced={reduced}/>
  </>;
}
