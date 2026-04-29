import { Link } from 'react-router-dom';

function TaskCard({ task, deleteTask, toggleComplete }) {
  return (
    <article className={`task-card ${task.completed ? 'completed' : ''}`}>
      <div className="task-info">
        <h3>{task.title}</h3>
        <p>{task.description || 'No description added yet.'}</p>
        <div className="task-meta">
          <span>{task.completed ? 'Completed' : 'Pending'}</span>
          <span>{task.priority || 'Normal'} priority</span>
          {task.due_date && <span>Due: {task.due_date}</span>}
        </div>
      </div>

      <div className="task-actions">
        <button className="btn btn-complete" onClick={() => toggleComplete(task)}>
          {task.completed ? 'Undo' : 'Done'}
        </button>
        <Link to={`/details/${task.id}`} className="btn btn-view">View</Link>
        <button className="btn btn-delete" onClick={() => deleteTask(task.id)}>Delete</button>
      </div>
    </article>
  );
}

export default TaskCard;
