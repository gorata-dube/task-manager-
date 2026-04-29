import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import List from './pages/List';
import Details from './pages/Details';
import AddTask from './pages/AddTask';
import Login from './pages/Login';
import Register from './pages/Register';
import { clearSession, getStoredUser } from './services/api';
import './App.css';

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  return (
    <BrowserRouter>
      <div className="app-bg">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home user={user} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route
              path="/list"
              element={
                <ProtectedRoute user={user}>
                  <List />
                </ProtectedRoute>
              }
            />
            <Route
              path="/details/:id"
              element={
                <ProtectedRoute user={user}>
                  <Details />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRoute user={user}>
                  <AddTask />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
