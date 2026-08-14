import './index.css';
import Home from './pages/Home';
import Game from './pages/Game';
import SinglePlayer from './pages/SinglePlayer';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Router>
      <ToastContainer position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/singleplayer" element={<SinglePlayer />} />
        <Route path="/:gameId" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;