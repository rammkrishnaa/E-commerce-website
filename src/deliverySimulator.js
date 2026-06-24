import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Simulates a real-world logistics webhook timeline.
 * Automatically updates the Firestore order status at timed intervals.
 */
export const simulateDeliveryTimeline = (orderId) => {
  console.log(`🚚 Delivery Simulator started for Order: ${orderId}`);

  // 1. After 15 seconds: Order Dispatched (Handed over to courier)
  setTimeout(async () => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "Dispatched from Warehouse" });
      console.log(`📦 Order ${orderId}: Dispatched`);
    } catch (error) {
      console.error("Simulation error:", error);
    }
  }, 15000);

  // 2. After 35 seconds: Out for Delivery (Local delivery hub scan)
  setTimeout(async () => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "Out for Delivery via BlueDart Mock API" });
      console.log(`🛵 Order ${orderId}: Out for delivery`);
    } catch (error) {
      console.error("Simulation error:", error);
    }
  }, 35000);

  // 3. After 55 seconds: Delivered (Package reached destination)
  setTimeout(async () => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "Delivered 🎉 Enjoy your snacks!" });
      console.log(`✅ Order ${orderId}: Delivered`);
    } catch (error) {
      console.error("Simulation error:", error);
    }
  }, 55000);
};