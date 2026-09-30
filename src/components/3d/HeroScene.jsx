import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import Car from './Car';

function World({ reduced, boost, onReady, mobile }) {
  const car = useRef(), light = useRef();
  const age = useRef(0), boostAge = useRef(0);
  useEffect(()=> { boostAge.current=0; },[boost]);
  useEffect(()=> { onReady?.(); }, [onReady]);
  useFrame((state, dt) => {
    const delta=Math.min(dt,.05); age.current+=delta;
    if(reduced) return;
    const intro=Math.max(0,1-age.current/1.8);
    if(boost) boostAge.current+=delta;
    const passing=boost ? Math.sin(Math.min(boostAge.current/1.6,1)*Math.PI*2)*9 : 0;
    car.current.position.x=THREE.MathUtils.damp(car.current.position.x, -intro*14+passing, 4,delta);
    car.current.rotation.y=THREE.MathUtils.damp(car.current.rotation.y,-.2+state.pointer.x*.16,3,delta);
    light.current.position.x=state.pointer.x*5;
    state.camera.position.y=THREE.MathUtils.damp(state.camera.position.y,3.3+state.pointer.y*.25+Math.min(window.scrollY/window.innerHeight,1)*.65,2,delta);
    state.camera.lookAt(0,.55,0);
  });
  return <>
    <fog attach="fog" args={['#121212',12,32]}/>
    <ambientLight intensity={.5}/><directionalLight position={[4,6,3]} intensity={2} color="#edf3f6"/>
    <pointLight ref={light} position={[0,3,2]} intensity={35} color="#c5d9e6"/>
    <pointLight position={[-4,1,-2]} intensity={28} color="#ed7645"/>
    <Environment resolution={mobile?128:256} frames={1}>
      <Lightformer form="rect" intensity={4} position={[0,5,0]} rotation={[Math.PI/2,0,0]} scale={[10,3,1]}/>
      <Lightformer form="rect" intensity={3} position={[1,2,-5]} scale={[9,2,1]}/>
      <Lightformer form="rect" intensity={2} position={[0,1,5]} rotation={[0,Math.PI,0]} scale={[12,.6,1]}/>
    </Environment>
    <group ref={car} scale={1.45} position={[reduced?0:-12,0,0]} rotation={[0,-.2,0]}><Car reduced={reduced} boost={boost}/></group>
    <ContactShadows position={[0,-.025,0]} opacity={.65} scale={16} blur={2.5} far={4} resolution={mobile?128:256} frames={reduced?1:Infinity}/>
    {!reduced && <Sparkles count={mobile?14:32} scale={[15,3,9]} size={1.5} speed={.2} opacity={.35} color="#d6d7cf"/>}
    <SpeedLines reduced={reduced} boost={boost}/>
  </>;
}
function SpeedLines({ reduced, boost }) {
  const group=useRef();
  const lines=useMemo(()=>Array.from({length:14},(_,i)=>({z:(i-7)*1.15,y:.04+(i%3)*.018,x:(i*7.13)%26-13,length:2+(i%4)*1.6})),[]);
  useFrame((_,dt)=> { if(reduced) return; group.current.children.forEach((line,i)=> { line.position.x+=Math.min(dt,.05)*(boost?42:5); if(line.position.x>18) line.position.x=-18-lines[i].length; }); });
  return <group ref={group}>{lines.map((line,i)=><mesh key={i} position={[line.x,line.y,line.z]}><boxGeometry args={[line.length,.008,.014]}/><meshBasicMaterial color={i%4===0?'#d2774d':'#919b98'} transparent opacity={boost?.65:.2}/></mesh>)}</group>;
}
export default function HeroScene({ reduced, boost, onReady }) {
  const [active,setActive]=useState(true), host=useRef();
  const mobile=typeof window!=='undefined' && window.innerWidth<768;
  useEffect(()=> { const observer=new IntersectionObserver(([entry])=>setActive(entry.isIntersecting)); observer.observe(host.current); return ()=>observer.disconnect(); },[]);
  return <div className="hero-canvas" ref={host} aria-hidden="true"><Canvas dpr={[1,mobile?1.5:1.6]} frameloop={active&&!reduced?'always':'demand'} camera={{position:[6,3.3,7.7],fov:36}} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}}><World reduced={reduced} boost={boost} onReady={onReady} mobile={mobile}/></Canvas></div>;
}
export function BirthdayScene({ reduced }) {
  return <Canvas dpr={[1,1.3]} frameloop={reduced?'demand':'always'} camera={{position:[0,0,7],fov:42}} gl={{alpha:true,antialias:true}}>
    <ambientLight intensity={.7}/><directionalLight position={[3,4,5]} intensity={4}/><pointLight position={[-3,-1,2]} intensity={30} color="#e1774a"/>
    <Float speed={reduced?0:1.1} rotationIntensity={reduced?0:.35} floatIntensity={reduced?0:.4}><mesh rotation={[.45,.5,.4]}><torusGeometry args={[2,.14,24,100]}/><meshStandardMaterial color="#777e82" metalness={.85} roughness={.28}/></mesh><mesh rotation={[-.4,.4,-.5]}><torusGeometry args={[2.25,.025,12,100]}/><meshStandardMaterial color="#b8b7ae" metalness={.7} roughness={.25}/></mesh></Float>
    {!reduced&&<Sparkles count={24} scale={7} size={1} opacity={.4} speed={.15}/>}
  </Canvas>;
}
