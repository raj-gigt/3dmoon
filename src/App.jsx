import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Mooncanvas from "./components/Mooncanvas";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Mooncanvas></Mooncanvas>
    </>
  );
}

export default App;
