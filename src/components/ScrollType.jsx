import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { content } from '../config';
gsap.registerPlugin(ScrollTrigger);

export default function ScrollType({ reduced }) {
  const host=useRef();
  useLayoutEffect(()=>{
    if(reduced)return;
    let settle;
    const context=gsap.context(()=>{
      const lines=gsap.utils.toArray('.velocity-line');
      lines.forEach((line,index)=>{
        gsap.fromTo(line,{xPercent:index%2?-24:-2},{xPercent:index%2?0:-26,ease:'none',scrollTrigger:{trigger:host.current,start:'top bottom',end:'bottom top',scrub:.35}});
      });
      ScrollTrigger.create({trigger:host.current,start:'top bottom',end:'bottom top',onUpdate:self=>{
        const speed=gsap.utils.clamp(-9000,9000,self.getVelocity());
        gsap.to(lines,{skewX:speed/-650,filter:'blur('+Math.min(Math.abs(speed)/4500,1.8)+'px)',textShadow:(speed/-150)+'px 0 0 rgba(230,125,79,.14)',duration:.18,overwrite:'auto'});
        settle?.kill();
        settle=gsap.delayedCall(.12,()=>gsap.to(lines,{skewX:0,filter:'blur(0px)',textShadow:'0px 0 0 rgba(230,125,79,0)',duration:.6,overwrite:'auto'}));
      }});
    },host);
    return()=>{settle?.kill();context.revert();};
  },[reduced]);
  return <div className="velocity-section" ref={host} aria-label="Drive, style, and moments">
    <div className="velocity-caption"><span>SCROLL TO SET THE PACE</span><span>YOUR LIFE. YOUR RHYTHM.</span></div>
    {content.scrollWords.map((words,i)=><div className={'velocity-line line-'+i} key={i} aria-hidden="true">{[0,1,2].map(n=><span key={n}>{words} <i>↗</i> </span>)}</div>)}
    <span className="velocity-note">NOT JUST PASSING THROUGH.</span>
  </div>;
}
