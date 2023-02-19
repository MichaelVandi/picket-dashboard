import "./App.css";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Content from "./components/Content/Content";

import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
    apiKey: "AIzaSyDKNAYOQmKfqCm8rvu_p_NF3n-_DlaedBs",
    authDomain: "tree-hacks-picket.firebaseapp.com",
    projectId: "tree-hacks-picket",
    storageBucket: "tree-hacks-picket.appspot.com",
    messagingSenderId: "679294240200",
    appId: "1:679294240200:web:a4e860374050b63543ecfd",
    measurementId: "G-XNMX3TV2BW"
};
initializeApp(firebaseConfig);
// const app = initializeApp(firebaseConfig);
// getAnalytics(app);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar />
        <Content />
      </BrowserRouter>
    </div>
  );
}

export default App;
