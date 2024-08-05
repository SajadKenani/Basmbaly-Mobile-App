import './App.css';
import  HOME  from "./site/homePage";
import ComingOrders from './site/comingOrders';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NOTIFICATION from './site/notification';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='' element={<HOME />} />
          <Route path='/orders' element={<ComingOrders />} />
          <Route path='/notification' element={<NOTIFICATION />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
