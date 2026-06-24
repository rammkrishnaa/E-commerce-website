import React, { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { products } from './data';
import './index.css';

function AdminSetup() {
  const [status, setStatus] = useState("Ready to upload");

  const handleUpload = async () => {
    setStatus("Uploading...");
    try {
      // Loop through our local products array
      for (const product of products) {
        // Create a document reference in the "products" collection using the product ID
        const productRef = doc(db, 'products', product.id.toString());
        // Upload the product data to that document
        await setDoc(productRef, product);
      }
      setStatus("Successfully uploaded to Firebase!");
      alert("Products uploaded successfully!");
    } catch (error) {
      console.error("Error uploading data: ", error);
      setStatus("Error uploading data (Check console)");
    }
  };

  return (
    <div className="app-container" style={{ padding: '100px 5%', textAlign: 'center', minHeight: '80vh' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '20px' }}>
        Database Setup
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Status: <strong>{status}</strong>
      </p>
      <button onClick={handleUpload} className="btn-primary">
        Upload Products to Firestore
      </button>
    </div>
  );
}

export default AdminSetup;