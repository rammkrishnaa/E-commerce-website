import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import { collection, addDoc } from 'firebase/firestore'; // Fixed import!
import { db, auth } from './firebase';
import { simulateDeliveryTimeline } from './deliverySimulator'; // Added simulator import
import './index.css';

function Checkout() {
  const context = useContext(CartContext);

  if (!context) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>
        <h2>Error: CartContext not found!</h2>
        <p>Make sure your App.jsx is wrapped in &lt;CartProvider&gt;</p>
      </div>
    );
  }

  const { cart, removeFromCart, cartTotal } = context;
  const [isPaid, setIsPaid] = useState(false);
  const [orderId, setOrderId] = useState(""); // State to hold the new database ID

  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) return;

    const res = await loadRazorpaySDK();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: "rzp_test_SuYiNZdpwbobaC", 
      amount: cartTotal * 100, 
      currency: "INR",
      name: "Nimadi Namkeen",
      description: "Authentic Regional Snacks",
      image: "https://your-logo-url.com/logo.png", 
      handler: async function (response) {
        console.log("Payment ID:", response.razorpay_payment_id);
        
        try {
          // 1. Save order details to Firestore
          const orderRef = await addDoc(collection(db, "orders"), {
            userId: auth?.currentUser?.uid || "guest",
            items: cart,
            total: cartTotal,
            paymentId: response.razorpay_payment_id,
            status: "Processing Payment", 
            createdAt: new Date().toISOString(),
            shippingDetails: {
              name: "Test User", // In a full app, you'd pull this from the form inputs
              address: "Indore, MP",
              phone: "9876543210"
            }
          });

          const newOrderId = orderRef.id;
          
          // 2. Set states to show the success screen
          setOrderId(newOrderId);
          setIsPaid(true);

          // 3. Trigger the delivery simulator!
          simulateDeliveryTimeline(newOrderId);

        } catch (error) {
          console.error("Error saving order: ", error);
          alert("Payment succeeded, but failed to save order.");
        }
      },
      prefill: {
        name: "Test User",
        email: "student@davv.edu.in",
        contact: "9876543210"
      },
      theme: {
        color: "#d9480f" 
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  if (isPaid) {
    return (
      <div className="app-container" style={{ padding: '100px 5%', textAlign: 'center', minHeight: '80vh' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', color: 'var(--accent-color)', marginBottom: '20px' }}>
          Order Confirmed!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '20px' }}>
          Thank you for your purchase. Your authentic snacks are on the way.
        </p>
        
        {/* Display the Order ID so you can copy it for tracking */}
        <div style={{ background: '#faf5eb', padding: '20px', borderRadius: '12px', display: 'inline-block', marginBottom: '40px', border: '1px dashed var(--accent-color)' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Your Tracking ID:</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '5px 0 0 0', color: 'var(--text-primary)' }}>{orderId}</p>
        </div>
        <br/>
        
        <Link to="/track" className="btn-primary" style={{ textDecoration: 'none', marginRight: '15px' }}>
          Track Order
        </Link>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '40px 5%', maxWidth: '1100px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'var(--accent-color)', fontWeight: 600, display: 'inline-block', marginBottom: '30px' }}>
        ← Back to Shop
      </Link>
      
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '30px' }}>
        Secure Checkout
      </h2>

      <div className="checkout-layout">
        <div className="glass" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Shipping Details</h3>
          <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="First Name" style={inputStyle} required />
              <input type="text" placeholder="Last Name" style={inputStyle} required />
            </div>
            <input type="text" placeholder="Full Address" style={inputStyle} required />
            <input type="text" placeholder="City" style={inputStyle} required />
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="State" style={inputStyle} required />
              <input type="text" placeholder="PIN Code" style={inputStyle} required />
            </div>
            <input type="tel" placeholder="Phone Number" style={inputStyle} required />
            <button type="submit" className="btn-primary" style={{ marginTop: '20px' }} disabled={cart.length === 0}>
              Pay ₹{cartTotal}
            </button>
          </form>
        </div>

        <div className="glass" style={{ padding: '30px', background: '#faf5eb', border: '1px solid var(--card-border)' }}>
          <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            {cart.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Your cart is empty.</p>
            ) : (
              cart.map((item, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>₹{item.price}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeFromCart(index)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', padding: '5px 0 0 0', textDecoration: 'underline' }}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, borderTop: '2px solid var(--card-border)', paddingTop: '15px' }}>
            <span>Total:</span>
            <span style={{ color: 'var(--accent-color)' }}>₹{cartTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { flex: '1', minWidth: '150px', padding: '12px 15px', border: '1px solid var(--card-border)', borderRadius: '8px', background: '#fff', outline: 'none', fontSize: '1rem', fontFamily: "'Poppins', sans-serif" };

export default Checkout;