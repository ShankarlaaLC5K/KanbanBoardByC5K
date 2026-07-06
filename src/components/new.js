{columns[columnId].items.map((item, index) => (
  <div key={item.id} draggable className="task-card" ...>
    <div className="card-header">
      {/* Conditionally render Title */}
      {editingId === item.id ? (
        <input 
          className="edit-title"
          value={item.title} 
          onChange={(e) => updateTask(columnId, item.id, 'title', e.target.value)}
        />
      ) : (
        <h4>{item.title}</h4>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        {/* Pencil Button to toggle Edit Mode */}
        <button 
          className="edit-btn" 
          onClick={() => setEditingId(editingId === item.id ? null : item.id)}
        >
          ✏️
        </button>
        <button className="mac-close-btn" onClick={() => removeTask(columnId, item.id)}></button>
      </div>
    </div>

    {/* Conditionally render Description */}
    {editingId === item.id ? (
      <textarea 
        className="edit-desc"
        value={item.description} 
        onChange={(e) => updateTask(columnId, item.id, 'description', e.target.value)}
      />
    ) : (
      <p>{item.description}</p>
    )}

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
      <span className={`priority-badge ${item.priority.toLowerCase()}`}>{item.priority}</span>
      <div style={{ display: "flex", gap: "5px" }}>
        {item.tags.map((tag, i) => <span key={i} className="tag-style">{tag}</span>)}
      </div>
    </div>
  </div>
))}