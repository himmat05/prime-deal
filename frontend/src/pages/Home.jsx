import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { auth } from '../config/firebase';

export default function Home({ user }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (!user) {
      alert('Please login to add items to your cart.');
      return;
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product_id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product_id: product.id, quantity: 1, name: product.name, price: product.price }];
    });
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      const idToken = await user.getIdToken();
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ items: cart }),
      });
      alert('Order placed successfully!');
      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading Products...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Products Section */}
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Cart</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.product_id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Your cart is empty.</p>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t mt-6 pt-4">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total</span>
                  <span>${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
                </div>
                <button
                  onClick={checkout}
                  disabled={!user}
                  className="w-full py-3 text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-400"
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
