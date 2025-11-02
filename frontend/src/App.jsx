import { useState, useEffect } from 'react';
import { auth } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Home from './pages/Home';
import Login from './pages/Login';
import Orders from './pages/Orders';
import './App.css'

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">E-Shop</h1>
          <div className="flex gap-4">
            {user ? (
              <>
                <button onClick={() => setCurrentPage('home')} className="px-4 py-2 hover:bg-gray-100">
                  Products
                </button>
                <button onClick={() => setCurrentPage('orders')} className="px-4 py-2 hover:bg-gray-100">
                  My Orders
                </button>
                <span className="px-4 py-2">{user.email}</span>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => setCurrentPage('login')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Pages */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'home' && <Home user={user} />}
        {currentPage === 'login' && <Login setCurrentPage={setCurrentPage} />}
        {currentPage === 'orders' && user && <Orders user={user} />}
      </main>
    </div>
  )
}
