import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { CartContext } from './CartContext';
import './index.css';

function Shop() {
  const { cart, addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  const categories = ['All', 'Spicy', 'Salty', 'Sweet & Sour', 'Falahari'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setProducts(productsArray);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`${product.name} added to cart!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-container" style={{ padding: '40px 5%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--accent-color)', fontWeight: 600 }}>
          ← Back to Home
        </Link>
        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
          Cart ({cart.length})
        </div>
      </header>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', marginBottom: '15px' }}>
          All <span style={{ color: 'var(--accent-color)' }}>Snacks</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Browse our complete collection of authentic regional flavors.</p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <input 
          type="text" 
          placeholder="Search for a snack..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '15px 25px', borderRadius: '30px', border: '1px solid var(--card-border)', outline: 'none', width: '100%', maxWidth: '500px', fontSize: '1rem' }}
        />
        
        <div className="filter-container" style={{ justifyContent: 'center' }}>
          {categories.map(category => (
            <button 
              key={category}
              className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <p style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--accent-color)', padding: '40px' }}>Loading catalog...</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card glass">
                {product.tag && <span className="badge">{product.tag}</span>}
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                  <div className="product-image-placeholder" style={{ cursor: 'pointer' }}>Click for Details</div>
                </Link>
                <div className="product-info">
                  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, cursor: 'pointer' }}>{product.name}</h4>
                  </Link>
                  <div className="price-row">
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-color)' }}>₹{product.price}</span>
                    <button className="btn-add" onClick={() => handleAddToCart(product)}>+ Add</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>No snacks found matching your criteria.</p>
          )}
        </div>
      )}

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}

export default Shop;