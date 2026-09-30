import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// A bespoke, lightweight grand-tourer silhouette. No external model downloads.
function hullGeometry(stations) {
  const positions = [], indices = [];
  stations.forEach(([x, width, bottom, top]) => {
    positions.push(x,bottom,-width*.78, x,top-.08,-width, x,top,width, x,bottom,width*.78);
  });
  for (let i=0;i<stations.length-1;i++) for(let j=0;j<4;j++) {
    const a=i*4+j,b=i*4+(j+1)%4,c=(i+1)*4+j,d=(i+1)*4+(j+1)%4;
    indices.push(a,c,b,b,c,d);
  }
  indices.push(0,1,2,0,2,3);
  const end=(stations.length-1)*4; indices.push(end,end+2,end+1,end,end+3,end+2);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}
function Wheel({ position, reduced, boost }) {
  const rim = useRef();
  useFrame((_, dt) => { if (!reduced && rim.current) rim.current.rotation.z -= Math.min(dt,.04) * (boost ? 26 : 2); });
  return <group position={position}>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.38,.38,.25,32]}/><meshStandardMaterial color="#101112" roughness={.8}/></mesh>
    <group ref={rim}>
      <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.29,.29,.258,32]}/><meshStandardMaterial color="#26292b" metalness={.9} roughness={.3}/></mesh>
      {[0,1,2,3,4,5,6,7,8,9].map(i => <mesh key={i} rotation={[0,0,i*Math.PI/5]} position={[0,0,position[2]>0?.135:-.135]}><boxGeometry args={[.045,.53,.018]}/><meshStandardMaterial color="#b9bdbe" metalness={.95} roughness={.23}/></mesh>)}
      <mesh><sphereGeometry args={[.075,12,12]}/><meshStandardMaterial color="#e57d4c" metalness={.7} roughness={.3}/></mesh>
    </group>
  </group>;
}
export default function Car({ reduced, boost }) {
  const body = useMemo(()=>hullGeometry([[-2.8,.72,.30,.58],[-2.35,1,.30,.82],[-1.65,1.02,.30,.9],[-.6,.92,.34,.85],[.65,.96,.32,.8],[1.7,1.02,.3,.84],[2.45,.91,.30,.61],[2.8,.8,.36,.5]]),[]);
  const cabin = useMemo(()=>hullGeometry([[-1.45,.79,.79,.85],[-.65,.7,.8,1.39],[.35,.66,.8,1.4],[1.25,.8,.72,.84]]),[]);
  return <group>
    <mesh geometry={body}><meshPhysicalMaterial color="#a5aaad" metalness={.94} roughness={.24} clearcoat={1} clearcoatRoughness={.13} side={THREE.DoubleSide}/></mesh>
    <mesh geometry={cabin}><meshPhysicalMaterial color="#141e23" metalness={.8} roughness={.12} clearcoat={1} side={THREE.DoubleSide}/></mesh>
    <mesh position={[-.12,1.4,0]}><boxGeometry args={[1.05,.04,1.34]}/><meshStandardMaterial color="#7c8285" metalness={1} roughness={.25}/></mesh>
    {[-1,1].map(side=><group key={side}>
      <Wheel position={[-1.75,.39,side*.98]} reduced={reduced} boost={boost}/><Wheel position={[1.73,.39,side*.98]} reduced={reduced} boost={boost}/>
      <mesh position={[.08,.34,side*.96]}><boxGeometry args={[2.4,.07,.055]}/><meshStandardMaterial color="#111315" metalness={.8}/></mesh>
      <mesh position={[2.5,.63,side*.66]} rotation={[0,side*-.13,0]}><boxGeometry args={[.12,.035,.38]}/><meshStandardMaterial color="#e4f4ff" emissive="#d9f0ff" emissiveIntensity={4}/></mesh>
      <mesh position={[-2.61,.64,side*.55]}><boxGeometry args={[.045,.045,.43]}/><meshStandardMaterial color="#ff4a25" emissive="#ff4015" emissiveIntensity={3}/></mesh>
      <mesh position={[.75,1.01,side*.9]} rotation={[0,0,-.12]}><boxGeometry args={[.27,.09,.26]}/><meshStandardMaterial color="#727779" metalness={.9} roughness={.2}/></mesh>
      <mesh position={[-.15,.79,side*.945]}><boxGeometry args={[.2,.02,.02]}/><meshStandardMaterial color="#1d2123"/></mesh>
    </group>)}
    <mesh position={[2.65,.38,0]}><boxGeometry args={[.2,.13,1.65]}/><meshStandardMaterial color="#0b0d0e" metalness={.6} roughness={.4}/></mesh>
    <mesh position={[-2.55,.94,0]}><boxGeometry args={[.38,.04,1.98]}/><meshStandardMaterial color="#33383b" metalness={.95} roughness={.22}/></mesh>
    {[-.62,.62].map(z=><mesh key={z} position={[-2.5,.81,z]}><boxGeometry args={[.07,.24,.06]}/><meshStandardMaterial color="#222"/></mesh>)}
  </group>;
}
