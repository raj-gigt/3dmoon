import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Label, Radio } from "flowbite-react";
// import { debounce } from "lodash"; // or implement your own debounce

// function getVisibleObjects(camera, group) {
//   const raycaster = new THREE.Raycaster();
//   const frustum = new THREE.Frustum();
//   const cameraMatrix = new THREE.Matrix4();
//   const visibleObjects = [];
//   const boundingSphere = new THREE.Sphere();
//   const tempVector = new THREE.Vector3();

//   // Update the camera matrix and frustum
//   camera.updateMatrixWorld();
//   cameraMatrix.multiplyMatrices(
//     camera.projectionMatrix,
//     camera.matrixWorldInverse
//   );
//   frustum.setFromProjectionMatrix(cameraMatrix);

//   // Traverse the group to find objects
//   group.traverse((object) => {
//     if (object.isMesh) {
//       try {
//         // Use bounding box as a fallback if bounding sphere is not available
//         const boundingBox = new THREE.Box3().setFromObject(object);
//         boundingBox.getCenter(tempVector);
//         boundingSphere.center.copy(tempVector);
//         boundingSphere.radius = boundingBox.getSize(tempVector).length() / 2;

//         // Check if the bounding sphere intersects the camera frustum
//         if (!frustum.intersectsSphere(boundingSphere)) {
//           return; // Skip objects outside the frustum
//         }

//         // Calculate the direction from the camera to the object's center
//         const cameraPosition = camera.position.clone();
//         const direction = boundingSphere.center
//           .clone()
//           .sub(cameraPosition)
//           .normalize();

//         // Set raycaster from camera to the object's center with a small tolerance
//         raycaster.set(cameraPosition, direction);
//         raycaster.near = 0;
//         raycaster.far = cameraPosition.distanceTo(boundingSphere.center) + 0.1;

//         // Cast ray and check for intersections within the group
//         const intersects = raycaster.intersectObjects(group.children, true);

//         // Check if the object is the first intersected object
//         if (intersects.length > 0 && intersects[0].object === object) {
//           visibleObjects.push(object);
//         }
//       } catch (error) {
//         console.error("Error processing object:", object, error);
//       }
//     }
//   });

//   return visibleObjects;
// }

const Mooncanvas = () => {
  const [ratio, setRatio] = useState("Al_Si_ratio");

  const canvasRef = useRef(null); // Create a ref for the canvas

  // Load CSV data

  useEffect(() => {
    const canvas = canvasRef.current; // Get the current canvas reference
    if (!canvas) {
      console.error("Canvas element not found");
      return; // Exit if canvas is not found
    }

    // Initialize the renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });

    // Initialize the scene
    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();
    const almap = textureLoader.load("/Al_percentage_hexagon.png");
    const al_si_map = textureLoader.load("/Al_Si_ratio_hexagon.png");
    const mg_si_map = textureLoader.load("/Mg_Si_ratio_hexagon.png");
    const mg_map = textureLoader.load("/Mg_percentage_hexagon.png");
    const texturemap = {
      Al_percentage: almap,
      Mg_percentage: mg_map,
      Al_Si_ratio: al_si_map,
      Mg_Si_ratio: mg_si_map,
    };

    const ratiogrp = new THREE.Group();
    const axesHelper = new THREE.AxesHelper(5); // 5 is the size of the axes
    scene.add(axesHelper);
    const moongeo = new THREE.SphereGeometry(1, 64, 64);
    const moonmap = new THREE.MeshStandardMaterial({});
    moonmap.map = texturemap[ratio];
    const moonmesh = new THREE.Mesh(moongeo, moonmap);
    scene.add(moonmesh);
    // for (let x = 1; x <= 18; x++) {
    //   for (let y = 1; y <= 9; y++) {
    //     const slicemap = textureLoader.load(
    //       `/base_4k/row-${y}-column-${x}.png`
    //     );
    //     let moonmesh = new THREE.Mesh(
    //       new THREE.SphereGeometry(
    //         1,
    //         8,
    //         8,
    //         ((20 * x - 20) * Math.PI) / 180,
    //         (20 * Math.PI) / 180,
    //         ((20 * y - 20) * Math.PI) / 180,
    //         (20 * Math.PI) / 180
    //       ),
    //       new THREE.MeshStandardMaterial({
    //         map: slicemap,
    //       })
    //     );
    //     moonmesh.tileX = x;
    //     moonmesh.tileY = y;
    //     ratiogrp.add(moonmesh);
    //   }
    // }

    // console.log(ratiogrp.children);

    // scene.add(ratiogrp);

    // add axes helper to the scene

    // initialize the camera
    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.z = 5;

    // initialize the renderer

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // instantiate the controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    const origin = new THREE.Vector3(0, 0, 0);
    // Define the debounced function outside of the event listener
    // const debouncedVisibleObjects = debounce((camera, ratiogrp) => {
    //   const distance = camera.position.distanceTo(origin);
    //   const visibleObjects = getVisibleObjects(camera, ratiogrp);
    //   if (visibleObjects.length !== 0) {
    //     console.log(distance);
    //     console.log("Visible objects:", visibleObjects);
    //   }
    // }, 1000); // Adjust debounce time as needed

    // Define the event handler

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add point light to the scene
    const pointLight = new THREE.PointLight(0xffffff, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Render loop

    const renderloop = () => {
      controls.update(); // This is crucial for damping and smooth controls
      renderer.render(scene, camera);
      window.requestAnimationFrame(renderloop);
    };

    renderloop();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [ratio]); // Ensure dependencies are set correctly

  return (
    <div className="relative">
      <div className="absolute flex max-w-md flex-col gap-4 text-white">
        <legend className="mb-4">Choose Ratio</legend>
        <div className="flex items-center gap-2 ">
          <Radio
            id="united-state"
            name="countries"
            value="Al_Si_ratio"
            defaultChecked
            onChange={(e) => {
              setRatio(e.target.value);
            }}
          />
          <Label htmlFor="united-state" className="text-white">
            Al-Si
          </Label>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Radio
            id="germany"
            name="countries"
            value="Mg_Si_ratio"
            onChange={(e) => {
              setRatio(e.target.value);
            }}
          />
          <Label htmlFor="germany" className="text-white">
            Mg-Si
          </Label>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Radio
            id="germany"
            name="countries"
            value="Al_percentage"
            onChange={(e) => {
              setRatio(e.target.value);
            }}
          />
          <Label htmlFor="germany" className="text-white">
            Al percent
          </Label>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Radio
            id="germany"
            name="countries"
            value="Mg_percentage"
            onChange={(e) => {
              setRatio(e.target.value);
            }}
          />
          <Label htmlFor="germany" className="text-white">
            Mg percent
          </Label>
        </div>
      </div>
      <canvas ref={canvasRef} className="threejs"></canvas>
    </div>
  );
};

export default Mooncanvas;
