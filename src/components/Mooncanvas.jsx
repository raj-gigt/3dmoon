import { useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Label, Radio } from "flowbite-react";
import AlSiRatioTexture from "../assets/Al-Si_ratio.png";
import MgSiRatioTexture from "../assets/Mg-Si_ratio.png";

const Mooncanvas = () => {
  const [ratio, setRatio] = useState("Al-Si");
  useEffect(() => {
    // initialize the scene
    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();
    const AlSiRatio = textureLoader.load(AlSiRatioTexture);
    const MgSiRatio = textureLoader.load(MgSiRatioTexture);
    // add objects to the scene
    const moonGeometry = new THREE.IcosahedronGeometry(1, 16);
    const moonMaterial = new THREE.MeshStandardMaterial({});
    if (ratio == "Al-Si") {
      moonMaterial.map = AlSiRatio;
    } else if (ratio == "Mg-Si") {
      moonMaterial.map = MgSiRatio;
    }
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

    scene.add(moonMesh);

    // add axes helper to the scene
    const axesHelper = new THREE.AxesHelper(5); // 5 is the size of the axes
    scene.add(axesHelper);

    // initialize the camera
    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.z = 5;

    // initialize the renderer
    const canvas = document.querySelector("canvas.threejs");
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // instantiate the controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    // controls.autoRotate = true;

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // initialize the clock
    const clock = new THREE.Clock();
    let previousTime = 0;

    // add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // white light with intensity 0.5
    scene.add(ambientLight);

    // add point light to the scene
    const pointLight = new THREE.PointLight(0xffffff, 100); // white light with intensity 1 and distance 100
    pointLight.position.set(5, 5, 5); // position the point light
    scene.add(pointLight);

    // render the scene
    const renderloop = () => {
      const currentTime = clock.getElapsedTime();
      const delta = currentTime - previousTime;
      previousTime = currentTime;

      // cubeMesh.rotation.y += THREE.MathUtils.degToRad(1) * delta * 20;
      // cubeMesh.scale.x = Math.sin(currentTime) * 20 + 2;
      // cubeMesh.position.x = Math.sin(currentTime) + 2;

      controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(renderloop);
    };

    renderloop();
  }, [ratio]);

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
      <canvas class="threejs"></canvas>
    </div>
  );
};
export default Mooncanvas;
