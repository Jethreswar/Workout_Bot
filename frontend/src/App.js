import { BrowserRouter, Routes, Route } from 'react-router-dom';

// pages and components are imported and used in the App component
import Home from './pages/Home';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className='pages'>
          <Routes>
            <Route path='/'
              element={<Home />} />
          </Routes>
        </div>
        <ChatBot />
      </BrowserRouter>
    </div>
  );
}

export default App;
