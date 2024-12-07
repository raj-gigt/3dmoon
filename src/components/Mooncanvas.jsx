import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Label, Radio } from "flowbite-react";
function getVisibleObjects(camera, group) {
  // Update the camera's projection matrix
  const raycaster = new THREE.Raycaster();
  const frustum = new THREE.Frustum();
  const cameraMatrix = new THREE.Matrix4();
  const visibleObjects = [];

  // Update the camera matrix and frustum
  camera.updateMatrixWorld();
  cameraMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(cameraMatrix);

  // Traverse the group to find objects
  group.traverse((object) => {
    if (object.isMesh) {
      // Compute the object's bounding box in world space
      const boundingBox = new THREE.Box3().setFromObject(object);

      // Check if the bounding box intersects the camera frustum
      if (!frustum.intersectsBox(boundingBox)) {
        return; // Skip objects outside the frustum
      }

      // Calculate the direction from the camera to the object's center
      const cameraPosition = camera.position.clone();
      const objectWorldPosition = boundingBox.getCenter(new THREE.Vector3());
      const direction = objectWorldPosition
        .clone()
        .sub(cameraPosition)
        .normalize();

      // Set raycaster from camera to the object's center
      raycaster.set(cameraPosition, direction);

      // Cast ray and check for intersections within the group
      const intersects = raycaster.intersectObjects(group.children, true);

      // Check if the bounding box is intersected first
      if (intersects.length > 0 && intersects[0].object === object) {
        visibleObjects.push(object);
      }
    }
  });

  return visibleObjects;
}
function getColorForRatio(ratio, min, max) {
  // Ensure ratio is clamped between min and max
  ratio = Math.max(min, Math.min(max, ratio));

  // Normalize the ratio to a 0-1 scale
  const i = (ratio - min) / (max - min);

  let r;
  let g;
  let b;
  if (i >= 0 && i <= 0.25) {
    r = 0;
    g = (i / 0.25) * 255;
    b = 255;
  } else if (i >= 0.25 && i <= 0.5) {
    r = 0;
    g = 255;
    b = ((0.5 - i) / 0.25) * 255;
  } else if (i >= 0.5 && i <= 0.75) {
    r = ((i - 0.5) / 0.25) * 255;
    g = 255;
    b = 0;
  } else {
    r = 255;
    g = ((1 - i) / 0.25) * 255;
    b = 0;
  }

  return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
}

async function loadCSV(url) {
  const response = await fetch(url);
  const csvText = await response.text();
  return parseCSV(csvText);
}

// Parse CSV Data
function parseCSV(csvText) {
  const rows = csvText.split("\n").map((row) => row.trim());
  const headers = rows[0].split(","); // First row contains headers
  const data = rows.slice(1).map((row) => {
    const values = row.split(",");
    return headers.reduce((acc, header, i) => {
      acc[header] = values[i];
      return acc;
    }, {});
  });
  return data;
}

const Mooncanvas = () => {
  const [ratio, setRatio] = useState("Al-Si");
  const [data, setData] = useState([]); // State to hold loaded CSV data
  const canvasRef = useRef(null); // Create a ref for the canvas

  // Load CSV data
  useEffect(() => {
    const fetchData = async () => {
      const csvData = await loadCSV("catalogue.csv");
      setData(csvData); // Set the loaded data
    };

    fetchData();
  }, []); // Run once on mount

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
    const moonmap = textureLoader.load("/moonmap1k.jpg");
    const MgSiRatio = textureLoader.load("/Mg-Si_ratio.png");
    console.log(data[0]);
    // Add objects to the scene
    const moonGeometry = new THREE.IcosahedronGeometry(1, 16);
    const moonMaterial = new THREE.MeshStandardMaterial({});

    moonMaterial.map = moonmap;

    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonMesh);
    const ratiogrp = new THREE.Group();

    data.map((obj, index) => {
      // if (index <= 27000) {
      const color =
        ratio === "Al-Si"
          ? getColorForRatio(parseFloat(obj.Al_Si_ratio), 0, 3)
          : getColorForRatio(parseFloat(obj.Mg_Si_ratio), 0, 3); // Change color based on selected ratio

      ratiogrp.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(
            1.01,
            2,
            2,
            (parseFloat(obj.V0_LON) * Math.PI) / 180,
            ((parseFloat(obj.V3_LON) - parseFloat(obj.V0_LON)) * Math.PI) / 180,
            ((90 - parseFloat(obj.V0_LAT)) * Math.PI) / 180,
            ((parseFloat(obj.V0_LAT) - parseFloat(obj.V1_LAT)) * Math.PI) / 180
          ),
          new THREE.MeshStandardMaterial({
            color: color, // Use the determined color
          })
        )
      );
      // }
    });
    // const ratiogeo = new THREE.SphereGeometry(
    //   1.005,
    //   16,
    //   16,
    //   (parseFloat(data[0].V0_LON) * Math.PI) / 180,
    //   ((parseFloat(data[0].V3_LON) - parseFloat(data[0].V0_LON)) * Math.PI) /
    //     180,

    //   ((90 - parseFloat(data[0].V0_LAT)) * Math.PI) / 180,
    //   ((parseFloat(data[0].V0_LAT) - parseFloat(data[0].V1_LAT)) * Math.PI) /
    //     180
    // );
    // const ratiomat = new THREE.MeshStandardMaterial({
    //   color: getColorForRatio(parseFloat(data[0].Al_Si_ratio), 0, 3),
    // });
    // console.log(ratiomat.color); // Check the color value
    // const ratiomesh = new THREE.Mesh(ratiogeo, ratiomat);
    // ratiogrp.add(ratiomesh);
    scene.add(ratiogrp);

    // add axes helper to the scene
    // const axesHelper = new THREE.AxesHelper(5); // 5 is the size of the axes
    // scene.add(axesHelper);

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
    // const visibleObjects = getVisibleObjects(camera, scene);

    // console.log("Visible objects:", visibleObjects);
    const renderloop = () => {
      controls.update();
      renderer.render(scene, camera);

      window.requestAnimationFrame(renderloop);
    };

    renderloop();

    // Cleanup function to dispose of the renderer on unmount
    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup resize listener
      if (renderer) {
        renderer.dispose(); // Dispose of the renderer
      }
    };
  }, [ratio, data]); // Add data as a dependency if you need to re-render based on it

  return (
    <div className="relative">
      <div className="absolute flex max-w-md flex-col gap-4 text-white">
        <legend className="mb-4">Choose Ratio</legend>
        <div className="flex items-center gap-2 ">
          <Radio
            id="united-state"
            name="countries"
            value="Al-Si"
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
            value="Mg-Si"
            onChange={(e) => {
              setRatio(e.target.value);
            }}
          />
          <Label htmlFor="germany" className="text-white">
            Mg-Si
          </Label>
        </div>
      </div>
      <canvas ref={canvasRef} className="threejs"></canvas>
    </div>
  );
};

export default Mooncanvas;
