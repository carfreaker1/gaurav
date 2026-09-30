import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Image, Lightformer, Sparkles } from '@react-three/drei';
import { MathUtils } from 'three';
import { content } from '../../config';

function Frame({ image, position, rotation = [0,0,0], size = [2.5,3.35], onClick, reduced, index = 0, active = 0, gallery = false }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  useFrame(({ clock }, dt) => {
    const frame = group.current;
    if (!frame) return;
    const delta = Math.min(dt, .05);
    if (gallery) {
      const offset = index - active;
      frame.position.x = reduced ? offset * 3.1 : MathUtils.damp(frame.position.x, offset * 3.1, 6, delta);
      frame.position.z = reduced ? -Math.abs(offset) * 1.3 : MathUtils.damp(frame.position.z, -Math.abs(offset) * 1.3, 6, delta);
      frame.rotation.y = reduced ? -offset * .22 : MathUtils.damp(frame.rotation.y, -offset * .22, 5, delta);
    } else if (!reduced) frame.position.y = position[1] + Math.sin(clock.elapsedTime * .55 + index * 2) * .06;
    const scale = hovered && !reduced ? 1.025 : 1;
    frame.scale.setScalar(MathUtils.damp(frame.scale.x, scale, 7, delta));
  });
  return <group ref={group} position={position} rotation={rotation}
    onPointerOver={e => { e.stopPropagation(); setHovered(true); }}
    onPointerOut={() => setHovered(false)}
    onClick={e => { e.stopPropagation(); onClick?.(); }}>
    <mesh position={[0,0,-.065]}><boxGeometry args={[size[0]+.07,size[1]+.07,.11]}/><meshStandardMaterial color={hovered?'#c8b49e':'#46484b'} metalness={.85} roughness={.3}/></mesh>
    <Image url={image} scale={size} position={[0,0,.005]} transparent={false} toneMapped={false} radius={.015}/>
    <mesh position={[0,-size[1]/2-.035,.03]}><boxGeometry args={[size[0],.022,.02]}/><meshBasicMaterial color={hovered?'#ef875a':'#c5b19c'}/></mesh>
  </group>;
}
function Chrome({ reduced }) {
  const ref = useRef();
  useFrame((_,dt) => { if(!reduced && ref.current) ref.current.rotation.z += Math.min(dt,.05)*.09; });
  return <group ref={ref} position={[.4,-.25,-3.5]} rotation={[.7,.3,.6]}>
    <mesh><torusGeometry args={[2.7,.065,12,100]}/><meshStandardMaterial color="#a1a5ad" metalness={1} roughness={.19}/></mesh>
    <mesh rotation={[.8,.3,0]}><torusGeometry args={[2.6,.024,8,90]}/><meshStandardMaterial color="#a1a5ad" metalness={1} roughness={.2}/></mesh>
  </group>;
}
function World({ mode, reduced, onReady, onSelect, active, motionState, mobile }) {
  const rig = useRef(), light = useRef();
  useEffect(() => { onReady?.(); }, [onReady]);
  useFrame((state,dt) => {
    if(reduced) return;
    const delta=Math.min(dt,.05);
    rig.current.rotation.y=MathUtils.damp(rig.current.rotation.y,state.pointer.x*.12,3,delta);
    rig.current.rotation.x=MathUtils.damp(rig.current.rotation.x,-state.pointer.y*.055,3,delta);
    light.current.position.x=state.pointer.x*5;
    if(mode==='hero') {
      const progress=motionState?.current?.progress || 0;
      rig.current.rotation.z=MathUtils.damp(rig.current.rotation.z,-progress*.13,3,delta);
      state.camera.position.z=MathUtils.damp(state.camera.position.z,8-progress*.8,3,delta);
    }
  });
  return <>
    <ambientLight intensity={1}/><directionalLight position={[3,5,6]} intensity={3}/><pointLight ref={light} position={[2,2,4]} color="#f0b491" intensity={18}/>
    <Environment resolution={128} frames={1}>
      <Lightformer intensity={4} position={[0,5,0]} rotation={[Math.PI/2,0,0]} scale={[8,3,1]}/>
      <Lightformer intensity={3} position={[-4,1,2]} rotation={[0,Math.PI/2,0]} scale={[6,2,1]}/>
    </Environment>
    <group ref={rig}>
      {mode==='hero' ? <>
        <Chrome reduced={reduced}/>
        <Frame image={content.gallery[0].image} position={[-1.65,.6,-.8]} rotation={[.02,.25,-.12]} size={[1.65,2.35]} onClick={()=>onSelect(content.gallery[0])} reduced={reduced} index={1}/>
        <Frame image={content.portrait} position={[.45,.12,.4]} rotation={[0,-.1,.055]} size={[2.8,3.7]} onClick={()=>onSelect({title:'GAURAV',subtitle:'A life in motion.',image:content.portrait})} reduced={reduced}/>
        {!mobile && <Frame image={content.gallery[1].image} position={[2.5,-.8,-.45]} rotation={[.05,-.25,.13]} size={[1.45,1.95]} onClick={()=>onSelect(content.gallery[1])} reduced={reduced} index={2}/>}
      </> : content.gallery.map((item,index)=><Frame key={item.title} image={item.image} position={[(index-active)*3.1,0,-Math.abs(index-active)*1.3]} onClick={()=>onSelect(item)} reduced={reduced} index={index} active={active} gallery size={[2.6,3.4]}/>)}
      {!reduced && <Sparkles count={mobile?12:28} scale={[9,6,3]} size={1.3} speed={.15} opacity={.45} color="#d1bba4"/>}
    </group>
  </>;
}
export default function SpatialScene(props) {
  const host = useRef();
  const [visible,setVisible] = useState(true);
  const mobile = window.matchMedia('(max-width: 680px)').matches;
  useEffect(() => {
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
    observer.observe(host.current);
    const visibility=()=>{ if(document.hidden)setVisible(false); else setVisible(host.current.getBoundingClientRect().bottom>0 && host.current.getBoundingClientRect().top<innerHeight); };
    document.addEventListener('visibilitychange',visibility);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);};
  },[]);
  return <div ref={host} className="spatial-canvas"><Canvas dpr={[1,mobile?1.3:1.6]} frameloop={visible&&!props.reduced?'always':'demand'} camera={{position:[0,0,8],fov:mobile?39:38}} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}}>
    <Suspense fallback={null}><World {...props} mobile={mobile}/></Suspense>
  </Canvas></div>;
}
