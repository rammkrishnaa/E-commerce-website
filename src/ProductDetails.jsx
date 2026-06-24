import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import './index.css';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart, cart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSingleProduct();
  }, [id]);

  if (isLoading) {
    return <div style={{ padding: '100px', textAlign: 'center', fontSize: '1.5rem', color: 'var(--accent-color)' }}>Loading details...</div>;
  }

  if (!product) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Product not found!</div>;
  }

  return (
    <div className="app-container" style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--accent-color)', fontWeight: 600 }}>
          ← Back to Shop
        </Link>
        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
          Cart ({cart.length})
        </div>
      </header>

      <div className="product-detail-layout">
        <div className="glass" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf5eb' }}>
           <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>High-Res Packaging Image</span>
        </div>

        <div>
          {product.tag && <span className="badge" style={{ position: 'relative', top: '0', right: '0', display: 'inline-block', marginBottom: '15px' }}>{product.tag}</span>}
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '20px' }}>
            {product.name}
          </h1>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '30px' }}>
            ₹{product.price}
          </p>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '30px' }}>
            {product.description}
          </p>

          <div style={{ padding: '20px', background: '#faf5eb', border: '1px solid var(--card-border)', borderRadius: '12px', marginBottom: '40px' }}>
            <h4 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Ingredients</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{product.ingredients}</p>
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.1rem' }} onClick={() => addToCart(product)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;