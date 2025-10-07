import { useState } from "react";
import reactLogo from "../assets/react.svg";
import { invoke } from "@tauri-apps/api/core";

function Home() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Tauri + React</h1>

      <div className="flex justify-center gap-8 mb-8">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite h-24" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri h-24" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react h-24" alt="React logo" />
        </a>
      </div>
      <p className="mb-8">Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="flex gap-4 justify-center mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          className="px-4 py-2 border rounded"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Greet
        </button>
      </form>
      {greetMsg && <p className="text-lg font-semibold">{greetMsg}</p>}
    </div>
  );
}

export default Home;
