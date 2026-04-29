import { Link, NavLink } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar-custom">
      <Link to="/home" className="logo">Nova Task Manager</Link>

      <div className="nav-links">
        <NavLink to="/home">Home</NavLink>
        {user && <NavLink to="/list">Tasks</NavLink>}
        {user && <NavLink to="/add" className="nav-btn">Add Task</NavLink>}
        {!user && <NavLink to="/login">Login</NavLink>}
        {!user && <NavLink to="/register" className="nav-btn">Register</NavLink>}
        {user && (
          <button type="button" className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
