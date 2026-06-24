import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './index.css';


function Home() {
  const { cart, addToCart, removeFromCart, cartTotal } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
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

  const [user, setUser] = useState(null);

  // Listen for login/logout changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

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
    <div className="app-container">
      <nav style={styles.navbar}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.8rem', color: 'var(--text-primary)' }}>
          Nimadi <span style={{ color: 'var(--accent-color)' }}>Namkeen</span>
        </h1>
        
        <input 
          type="text" 
          placeholder="Search snacks..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        <ul style={styles.navLinks}>
          <Link to="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>
             <li style={styles.link}>Shop</li>
          </Link>
          <Link to="/track" style={{ textDecoration: 'none', color: 'inherit' }}>
             <li style={styles.link}>Track Order</li>
          </Link>
          
          {user ? (
            <li style={{ ...styles.link, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={user.photoURL} alt="profile" style={{ width: '30px', borderRadius: '50%' }} />
              <span onClick={handleLogout} style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Logout</span>
            </li>
          ) : (
            <li style={{ ...styles.link, cursor: 'pointer' }} onClick={handleLogin}>
              Login
            </li>
          )}

          <li style={{ ...styles.link, color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 800 }} onClick={() => setIsCartOpen(true)}>
            Cart ({cart.length})
          </li>
        </ul>
      </nav>

      <main style={styles.hero}>
        <div style={styles.heroContent}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '4.5rem', fontWeight: 700, lineHeight: '1.1', marginBottom: '20px' }}>
            The Taste of <br />
            <span style={{ color: 'var(--accent-color)' }}>Tradition.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '30px', maxWidth: '500px', lineHeight: '1.6' }}>
            Experience the authentic crunch. Crafted with heritage recipes, premium spices, and a whole lot of love. 
          </p>
          <button className="btn-primary">Shop Bestsellers</button>
        </div>
        
        <div style={styles.heroGraphic}>
           <div style={styles.packagingPlaceholderFront}>
              <span>Packet Front<br/><small>(Cultural Branding)</small></span>
           </div>
           <div style={styles.packagingPlaceholderBack}>
              <span>Packet Back<br/><small>(Nutritional Info)</small></span>
           </div>
        </div>
      </main>

      <section>
        <h3 className="section-title">Featured <span>Products</span></h3>

        <div className="filter-container">
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
        
        {}
        {isLoading ? (
          <p style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--accent-color)', padding: '40px' }}>Loading fresh snacks...</p>
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
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                        ₹{product.price}
                      </span>
                      <button className="btn-add" onClick={() => handleAddToCart(product)}>+ Add</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>No snacks found matching your filters.</p>
            )}
          </div>
        )}
      </section>

      {}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 style={{ fontWeight: 800 }}>Your Cart</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>✖</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px' }}>Your cart is empty.</p>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>₹{item.price}</span>
                </div>
                <button onClick={() => removeFromCart(index)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
            <span>Total:</span>
            <span>₹{cartTotal}</span>
          </div>
          <button className="btn-primary" style={{ width: '100%', padding: '15px' }} disabled={cart.length === 0} onClick={handleCheckout}>
            Checkout Securely
          </button>
        </div>
      </div>

      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', position: 'sticky', top: '0', zIndex: 100, background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' },
  searchInput: { padding: '10px 20px', borderRadius: '30px', border: '1px solid var(--card-border)', outline: 'none', width: '300px', background: '#faf5eb', fontFamily: "'Poppins', sans-serif" },
  navLinks: { display: 'flex', listStyle: 'none', gap: '30px', fontWeight: 600 },
  link: { cursor: 'pointer', transition: 'color 0.3s' },
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 5% 100px', minHeight: '70vh', gap: '50px' },
  heroContent: { flex: 1 },
  heroGraphic: { flex: 1, height: '450px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  packagingPlaceholderFront: { width: '240px', height: '360px', backgroundColor: 'var(--card-bg)', border: '2px dashed var(--accent-color)', borderRadius: '16px', position: 'absolute', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--accent-color)', fontWeight: 600, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', transform: 'rotate(-5deg) translateX(-40px)' },
  packagingPlaceholderBack: { width: '240px', height: '360px', backgroundColor: '#faf5eb', border: '1px solid var(--card-border)', borderRadius: '16px', position: 'absolute', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, transform: 'rotate(5deg) translateX(40px)' }
};

export default Home;