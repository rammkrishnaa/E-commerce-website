import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import './index.css';

function TrackOrder() {
  const [searchId, setSearchId] = useState("");
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsLoading(true);
    setError("");
    setOrder(null);

    try {
      const docRef = doc(db, "orders", searchId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder(docSnap.data());
      } else {
        setError("No order found with this ID. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching your order.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ padding: '40px 5%', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'var(--accent-color)', fontWeight: 600 }}>
        ← Back to Shop
      </Link>

      <div className="glass" style={{ padding: '40px', marginTop: '30px', borderRadius: '16px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '10px' }}>
          Track Your Order
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
          Enter your Order ID to check your snack dispatch and delivery status.
        </p>

        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <input 
            type="text" 
            placeholder="Paste your Order ID here (e.g., zX9Y7...)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ flex: 1, padding: '15px 20px', borderRadius: '30px', border: '1px solid var(--card-border)', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 30px' }}>
            {isLoading ? "Searching..." : "Track"}
          </button>
        </form>

        {error && <p style={{ color: '#e03131', fontWeight: 600 }}>{error}</p>}

        {order && (
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '30px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Status</h4>
                <span className="badge" style={{ position: 'relative', top: '5px', background: '#e67e22', color: '#fff', fontSize: '1rem', padding: '6px 16px' }}>
                  📦 {order.status}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Total Amount</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-color)' }}>₹{order.total}</p>
              </div>
            </div>

            <div style={{ background: '#faf5eb', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Items Ordered</h4>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: idx !== order.items.length - 1 ? '1px solid #eee' : 'none' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>₹{item.price}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '0 10px' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '5px' }}>Shipping To:</h4>
              <p style={{ fontWeight: 600 }}>{order.shippingDetails.name}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{order.shippingDetails.address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackOrder;