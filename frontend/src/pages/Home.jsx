import { Link } from 'react-router-dom';

function Home({ user }) {
  return (
    <section className="home glass-card">
      <p className="eyebrow">React + Express + SQLite</p>
      <h1>Welcome to Nova Task Manager</h1>
      <p>
        Organise school work, personal tasks and deadlines in one clean task management website.
      </p>

      <div className="home-buttons">
        {user ? (
          <>
            <Link to="/list" className="btn btn-outline">View Tasks</Link>
            <Link to="/add" className="btn btn-pink">Add Task</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-pink">Create Account</Link>
          </>
        )}
      </div>
    </section>
  );
}

export default Home;
