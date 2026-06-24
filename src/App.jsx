import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import Home from './Home';
import Checkout from './Checkout';
import ProductDetails from './ProductDetails';
import AdminSetup from './AdminSetup';
import './index.css';
import TrackOrder from './TrackOrder';
import Shop from './Shop';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/admin" element={<AdminSetup />} /> {/* <-- 2. Add the route here */}
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;