import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { Box3, Group, PerspectiveCamera, Vector3 } from "three";

// https://github.com/pmndrs/react-three-fiber/issues/67
// https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/3
// https://github.com/mrdoob/three.js/pull/14526
// https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269

// https://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object

const useZoomToFit = (group: Group | null) => {
  const {aspect} = useThree(state => state.viewport)
  const size = useThree(state => state.size);
  const set = useThree((state) => state.set);

  // if (!group) {
  //   return;
  // }

  const pixelToThreeUnitRatio = 30;
  const planeDistance = 0;
  const cameraDistance = 100;
  const distance = cameraDistance - planeDistance;
  const height = size.height / pixelToThreeUnitRatio;
  const width = size.width / pixelToThreeUnitRatio;
  const smallestDimension = Math.min(height, width);
  const halfFovRadians = Math.tan((smallestDimension / 2 ) / distance);
  const fov = 5 * halfFovRadians * (180 / Math.PI);

  useLayoutEffect(() => {
    const newCam = new PerspectiveCamera(60 - fov, aspect, .5, 300);
    newCam.position.set(0, 0, cameraDistance)
    // newCam.copy(camera);
    // newCam.fov = fov;
    set({
      camera: newCam,
    });
    console.log(fov)
  }, [fov, aspect, set]);

  // const offset = 1.25;

  // camera.aspect = aspect;
  // camera.updateProjectionMatrix();

  // const boundingBox = new Box3();

  // // get bounding box of object - this will be used to setup controls and camera
  // boundingBox.setFromObject(group);

  // const center = new Vector3();
  // boundingBox.getCenter(center);

  // const size = new Vector3();
  // boundingBox.getSize(size);
  // console.log("size", size);
  // console.log("canvasSize", canvasSize);

  // // get the max side of the bounding box (fits to width OR height as needed )
  // const maxDim = Math.max(size.x, size.y, size.z);
  // const fov = camera.fov * (Math.PI / 180);
  // let cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2));

  // cameraZ *= offset; // zoom out a little so that objects don't fill the screen

  // camera.position.z = center.z + cameraZ;

  // const minZ = boundingBox.min.z;
  // const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

  // camera.far = cameraToFarEdge * 3;
  // camera.updateProjectionMatrix();

  // camera.lookAt(center);
};
export default useZoomToFit;
