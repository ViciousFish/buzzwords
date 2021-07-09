import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useState } from "react";
import { Box3, Group, PerspectiveCamera, Vector3 } from "three";

// https://github.com/pmndrs/react-three-fiber/issues/67
// https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/3
// https://github.com/mrdoob/three.js/pull/14526
// https://discourse.threejs.org/t/functions-to-calculate-the-visible-width-height-at-a-given-z-depth-from-a-perspective-camera/269

// https://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object

// https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f

/**
 * Convert vertical field of view to horizontal field of view, given an aspect
 * ratio. See https://arstechnica.com/civis/viewtopic.php?f=6&t=37447
 *
 * @param vfov - The vertical field of view.
 * @param aspect - The aspect ratio, which is generally width/height of the viewport.
 * @returns - The horizontal field of view.
 */
 function vfovToHfov(vfov: number, aspect: number): number {
  const {tan, atan} = Math
  return atan(aspect * tan(vfov / 2)) * 2
}

/**
 * Get the distance from the camera to fit an object in view by either its
 * horizontal or its vertical dimension.
 *
 * @param size - This should be the width or height of the object to fit.
 * @param fov - If `size` is the object's width, `fov` should be the horizontal
 * field of view of the view camera. If `size` is the object's height, then
 * `fov` should be the view camera's vertical field of view.
 * @returns - The distance from the camera so that the object will fit from
 * edge to edge of the viewport.
 */
function _distanceToFitObjectInView(size: number, fov: number): number {
  const {tan} = Math
  return size / (2 * tan(fov / 2))
}

function distanceToFitObjectToView(
  cameraAspect: number,
  cameraVFov: number,
  objWidth: number,
  objHeight: number
): number {
  const objAspect = objWidth / objHeight

  const cameraHFov = vfovToHfov(cameraVFov, cameraAspect)

  let distance: number = 0

  console.log(cameraHFov, cameraVFov);

  if (objAspect > cameraAspect) {
    distance = _distanceToFitObjectInView(objHeight, cameraVFov)
  } else if (objAspect <= cameraAspect) {
    distance = _distanceToFitObjectInView(objWidth, cameraHFov)
  }

  return distance
}

const useZoomToFit = (group: Group | null) => {
  const { aspect } = useThree((state) => state.viewport);
  const canvasSize = useThree((state) => state.size);
  // const set = useThree((state) => state.set);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;

  const [size] = useState(() => new Vector3());
  const [center] = useState(() => new Vector3());
  const [boundingBox] = useState(() => new Box3());
  if (!group) {
    return;
  }

  boundingBox.setFromObject(group);
  boundingBox.getSize(size);
  // console.log(canvasSize);

  const dist = distanceToFitObjectToView(aspect, camera.fov * (Math.PI / 180), size.x, size.y)
  // console.log('dist', dist);

  camera.position.set(0, 0, dist * 6)

  // var cameraZ = camera.position.z;
  // var planeZ = 0;
  // var distance = cameraZ - planeZ;

  // var vFov = (camera.fov * Math.PI) / 180;
  // var planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
  // var planeWidthAtDistance = planeHeightAtDistance * aspect;
  // console.log(planeWidthAtDistance);

  // camera.fov = planeHeightAtDistance;
  // camera.updateProjectionMatrix();

  // or

  // let dist = camera.position.z - group.position.z;
  // boundingBox.setFromObject(group)
  // boundingBox.getSize(size)
  // let height = Math.max(size.x, size.y, size.z); // desired height to fit

  // camera.fov = 2 * Math.atan(height / (2 * dist)) * (180 / Math.PI);
  // camera.updateProjectionMatrix();

  // Basically solving an AAS triangle https://www.mathsisfun.com/algebra/trig-solving-aas-triangles.html
  // https://i.stack.imgur.com/PgSn3.jpg
  // --------------
  // const pixelToThreeUnitRatio = 30;
  // const planeDistance = 0;
  // const cameraDistance = 100;
  // const distance = cameraDistance - planeDistance;
  // const height = size.height / pixelToThreeUnitRatio;
  // const width = size.width / pixelToThreeUnitRatio;
  // const smallestDimension = Math.min(height, width);
  // const halfFovRadians = Math.tan((smallestDimension / 2 ) / distance);
  // const fov = 5 * halfFovRadians * (180 / Math.PI);

  // useLayoutEffect(() => {
  //   const newCam = new PerspectiveCamera(60 - fov, aspect, .5, 300);
  //   newCam.position.set(0, 0, cameraDistance)
  //   // newCam.copy(camera);
  //   // newCam.fov = fov;
  //   set({
  //     camera: newCam,
  //   });
  //   console.log(fov)
  // }, [fov, aspect, set]);
};
export default useZoomToFit;
