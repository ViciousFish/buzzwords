import React, { useEffect, useRef } from 'react';
import { extend, useFrame, useThree } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls });

const CameraControls = () => {
  const {
    camera,
    gl: { domElement }
  } = useThree();

  const controls = useRef<any>();
  useEffect(() => {
    if (controls.current) {
      // controls.current.enableDamping = true;
      controls.current.update();
    }
  }, []);
  useFrame(() => {
    // required for it to update when not actively being dragged by a mouse (for autorotate and damping physics)
    if (controls.current) controls.current.update();
  });
  // @ts-ignore
  return <orbitControls
    ref={controls}
    enableDamping
    // autoRotate
    // autoRotateSpeed={10}
    args={[camera, domElement]}
  />;
};

export default CameraControls;