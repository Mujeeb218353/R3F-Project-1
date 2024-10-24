import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, MeshWobbleMaterial, useHelper } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { DirectionalLightHelper } from 'three'
import { useControls, Leva } from 'leva'
import React from 'react'
import './App.css'

const Box = ({ position, args, color }) => {

  const ref = useRef()
  useFrame((state, delta, xrFrame) => {
    ref.current.rotation.x += delta
    ref.current.rotation.y += delta
    ref.current.position.y = Math.sin(state.clock.elapsedTime) * 2
  })
  return (
    <mesh position={position || [0, 0, 0]} ref={ref}>
      <boxGeometry args={args || [1, 1, 1]} />
      <meshStandardMaterial color={color || "orange"} />
    </mesh>
  )
}

const Sphere = ({ position, args, color, wireframe }) => {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef()
  useFrame((state, delta, xrFrame) => {
    const speed = isHovered ? 5 : 2
    ref.current.rotation.x += delta * speed
    ref.current.rotation.y += delta * speed
    ref.current.position.y = Math.sin(state.clock.elapsedTime) * 5
  })
  return (
    <mesh
      position={position || [0, 0, 0]}
      ref={ref}
      onPointerEnter={e => {
        e.stopPropagation()
        setIsHovered(true)
      }}
      onPointerLeave={e => {
        setIsHovered(false)
      }}
    >
      <sphereGeometry args={args || [1, 1, 1]} />
      <meshStandardMaterial color={isHovered ? "orange" : color} wireframe={wireframe || false} />
    </mesh>
  )
}

const Torus = ({ position, args, color, wireframe }) => {
  const [isClicked, setIsClicked] = useState(false)
  const ref = useRef()
  useFrame((state, delta, xrFrame) => {
    ref.current.rotation.x += delta
    ref.current.rotation.y += delta
  })
  return (
    <mesh
      position={position || [0, 0, 0]}
      ref={ref}
      scale={isClicked ? 1.5 : 1}
      onClick={e => {
        e.stopPropagation()
        setIsClicked(!isClicked)
      }}
    >
      <torusGeometry args={args || [1, 1, 1]} />
      <meshStandardMaterial color={color || "orange"} wireframe={wireframe || false} side={THREE.DoubleSide} />
    </mesh>
  )
}

const TorusKnot = ({ position }) => {
  const ref = useRef()
  const {color, radius, tube, tubularSegments, radialSegments } = useControls({
    color: { value: "orange", label: "Color" },
    radius: { value: 0.65, label: "Radius", min: 0, max: 3, step: 0.05},
    tube: { value: 0.1, label: "Tube", min: 0, max: 1, step: 0.01 },
    tubularSegments: { value: 100, label: "Tub Segments", min: 0, max: 100, step: 1},
    radialSegments: { value: 100, label: "Rad Segments", min: 0, max: 100, step: 1}
  })
  useFrame((state, delta, xrFrame) => {
    ref.current.rotation.x += delta
    ref.current.rotation.y += delta
  })
  return (
    <mesh position={position || [0, 0, 0]} ref={ref}>
      <torusKnotGeometry args={[radius, tube, tubularSegments, radialSegments]} />
      <MeshWobbleMaterial factor={2} speed={5} color={color} />
      {/* <meshStandardMaterial color={color || "orange"} wireframe={wireframe || false} side={THREE.DoubleSide}/> */}
    </mesh>
  )
}

const Scene = () => {
  const { lightColor, lightIntensity } = useControls({
    lightColor: { value: "#ffffff", label: "Light Color" },
    lightIntensity: { value: 1, label: "Light Intensity", min: 0, max: 10 }
  })
  const directionalLightRef = useRef()
  useHelper(directionalLightRef, DirectionalLightHelper, 1, lightColor)
  // (ref: Object3D, helper: DirectionalLightHelper, size: number, color: string | number, headLength: number, headWidth: number)
  // min: 0, max: Infinity for size, headLength, and headWidth
  // headLength: The length of the directional arrow
  // headWidth: The width of the directional arrow
  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight 
        ref={directionalLightRef} 
        position={[0, 0, 5]} 
        intensity={lightIntensity} 
        castShadow={true} 
        color={lightColor}
      />
      {/* <group position={[0, 1, -5]}> */}
      <Box color={"skyblue"} position={[-4, 0, 0]} />
      <TorusKnot color={"red"} position={[-2, 0, 0]} />
      <Sphere color={"green"} args={[1, 32, 32]} wireframe={true} position={[0, 0, 0]} />
      <Torus color={"blue"} args={[0.8, 0.25, 100, 100]} position={[2, 0, 0]} />
      {/* </group> */}
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
    <div className='w-full min-h-screen'>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <Scene />
        </Canvas>
        <Leva />
      </div>
    </ErrorBoundary>
  )
}

export default App


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children; 
  }
}
