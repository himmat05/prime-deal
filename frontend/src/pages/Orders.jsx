import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';

export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="text-center py-20">Loading your order history...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Your Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-gray-50 text-center p-12 rounded-lg border">
          <p className="text-gray-600">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                <div>
                  <p className="text-sm text-gray-500">ORDER PLACED</p>
                  <p className="text-sm font-medium text-gray-700">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">TOTAL</p>
                  <p className="text-sm font-medium text-gray-700">${Number(order.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ORDER # {order.id}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Items in this order:</h3>
                <ul className="space-y-3">
                  {order.items && order.items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-800">{item.name} <span className="text-gray-500">x {item.quantity}</span></span>
                      <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
