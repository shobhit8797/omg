import React from "react";
import "./App.css";
import VideoChat from "./components/VideoChat";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Video Chat App</h1>
      </header>
      <VideoChat />
    </div>
  );
};

export default App;
