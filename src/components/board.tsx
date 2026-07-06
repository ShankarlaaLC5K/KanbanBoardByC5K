import { useState, useEffect } from 'react';
import type { DragEvent } from 'react';
type ColumnKey = 'toDo' | 'inProgress' | 'Done';
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  flagged: boolean;
}
interface Column {
  name: string;
  items: Task[];
}

export default function Board() {
const [columns, setColumns] = useState<Record<ColumnKey, Column>>(() => {
    const savedData = localStorage.getItem("kanban-board-data");
    return savedData ? JSON.parse(savedData) : {
      toDo: { 
        name: "To Do", 
        items: [{ 
          id: "1", 
          title: "Movie Review App", 
          description: "Search and filter movies, view detailed information, and rate them using a star-based review system.", 
          priority: "High", 
          flagged: false 
        }] 
      },
      inProgress: { name: "In Progress", items: [] },
      Done: { 
        name: "Done", 
        items: [
          { 
            id: "2", 
            title: "Notes App", 
            description: "A notes app with search, pin, archive, trash, and offline support using localStorage.", 
            priority: "Low", 
            flagged: false 
          },
          { 
            id: "3", 
            title: "Kanban Board", 
            description: "Create a Kanban board for task management, allowing users to organize tasks into customizable columns such as To Do, In Progress, and Done.", 
            priority: "Low", 
            flagged: false 
          }
        ] 
      },
    };
  });

  const [taskData, setTaskData] = useState({ title: "", description: "", priority: "Low" as 'High' | 'Medium' | 'Low' });
  const [activeColumn, setActiveColumn] = useState<ColumnKey>("toDo");
  const [draggedItem, setDraggedItem] = useState<{ columnId: ColumnKey; item: Task; index: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [tempTask, setTempTask] = useState({ title: "", description: "", priority: "Low" as 'High' | 'Medium' | 'Low' });

  useEffect(() => {
    localStorage.setItem("kanban-board-data", JSON.stringify(columns));
  }, [columns]);

  const handleDragStart = (columnId: ColumnKey, item: Task, index: number) => setDraggedItem({ columnId, item, index });
  const handleDragOver = (e: DragEvent) => e.preventDefault();

  const handleDragEnter = (targetColumnId: ColumnKey, targetIndex: number) => {
    if (!draggedItem || draggedItem.columnId !== targetColumnId) return;
    setColumns(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const sourceItems = updated[targetColumnId].items;
      const [movedItem] = sourceItems.splice(draggedItem.index, 1);
      sourceItems.splice(targetIndex, 0, movedItem);
      setDraggedItem({ ...draggedItem, index: targetIndex });
      return updated;
    });
  };

  const handleDrop = (e: DragEvent, targetColumnId: ColumnKey) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.columnId !== targetColumnId) {
      setColumns(prev => {
        const updated = JSON.parse(JSON.stringify(prev));
        const [movedItem] = updated[draggedItem.columnId].items.splice(draggedItem.index, 1);
        updated[targetColumnId].items.push(movedItem);
        return updated;
      });
    }
    setDraggedItem(null);
  };

  const toggleFlag = (e: React.MouseEvent, columnId: ColumnKey, taskId: string) => {
    e.stopPropagation();
    setColumns(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const task = updated[columnId].items.find((i: Task) => i.id === taskId);
      if (task) task.flagged = !task.flagged;
      return updated;
    });
  };

  const addNewTask = () => {
    if (taskData.title.trim() === "") return;
    setColumns(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[activeColumn].items.push({ id: Date.now().toString(), ...taskData, flagged: false });
      return updated;
    });
    setTaskData({ title: "", description: "", priority: "Low" });
  };

  const startEdit = (e: React.MouseEvent, item: Task) => {
    e.stopPropagation();
    setEditingId(item.id);
    setTempTask({ title: item.title, description: item.description, priority: item.priority });
  };

  const saveEdit = (columnId: ColumnKey, id: string) => {
    setColumns(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const task = updated[columnId].items.find((i: Task) => i.id === id);
      if (task) { 
        task.title = tempTask.title; 
        task.description = tempTask.description; 
        task.priority = tempTask.priority; 
      }
      return updated;
    });
    setEditingId(null);
  };

  const removeTask = (e: React.MouseEvent, columnId: ColumnKey, taskId: string) => {
    e.stopPropagation();
    setColumns(prev => ({
      ...prev,
      [columnId]: { ...prev[columnId], items: prev[columnId].items.filter(i => i.id !== taskId) }
    }));
  };

  const findTask = (id: string) => {
    for (const col in columns) {
      const task = columns[col as ColumnKey].items.find(t => t.id === id);
      if (task) return task;
    }
    return null;
  };

const getBadgeColor = (key: ColumnKey) => {
  if (key === 'toDo') return "bg-rose-400";
  if (key === 'inProgress') return "bg-amber-400";
  return "bg-emerald-400";
};
  

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-mono">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 tracking-tighter">Kanban Board</h1>
      
      <div className="flex flex-wrap gap-3 mb-8 bg-white p-5 rounded-2xl shadow-md border border-gray-100 justify-center items-center max-w-4xl mx-auto">
        <input className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="Title" value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} />
        <input className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="Description" value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} />
        <select className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-sm" value={activeColumn} onChange={(e) => setActiveColumn(e.target.value as ColumnKey)}>{(Object.keys(columns) as ColumnKey[]).map(k => <option key={k} value={k}>{columns[k].name}</option>)}</select>
        <select className="border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white text-sm" value={taskData.priority} onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as 'High' | 'Medium' | 'Low' })}><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select>
        <button className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-700 active:scale-95 transition-all shadow-lg text-sm" onClick={addNewTask}>Add Task</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {(Object.keys(columns) as ColumnKey[]).map((colKey) => (
          <div key={colKey} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, colKey)} className="bg-gray-100 p-4 rounded-lg flex flex-col min-h-150 h-auto border border-gray-200">
            <h2 className="font-bold text-center text-gray-700 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
              {columns[colKey].name}
              <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${getBadgeColor(colKey)}`}>
                {columns[colKey].items.length}
              </span>
            </h2>
            <div className="border-b border-gray-300 my-4" />
            
            {columns[colKey].items.length === 0 && <p className="text-gray-400 text-xs text-center italic mt-4">No tasks</p>}
            
            {columns[colKey].items.map((item, index) => (
              <div 
                key={item.id} 
                draggable 
                onDragStart={() => handleDragStart(colKey, item, index)} 
                onDragEnter={() => handleDragEnter(colKey, index)}
                onClick={() => setViewingId(item.id)}
                className={`p-4 mb-3 rounded-lg border transition-all duration-300 cursor-pointer ${item.flagged ? "border-red-400 bg-red-50" : ""} ${editingId === item.id ? "bg-blue-50 border-blue-400 shadow-md scale-[1.02]" : "bg-white border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1"}`}
              >
                {editingId === item.id ? (
  <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
    <input 
      value={tempTask.title} 
      onChange={(e) => setTempTask({...tempTask, title: e.target.value})} 
      className="border p-1 rounded text-sm" 
      placeholder="Title" 
    />
    <textarea 
      value={tempTask.description} 
      onChange={(e) => setTempTask({...tempTask, description: e.target.value})} 
      className="border p-2 rounded text-sm h-24 w-full resize-none" 
      placeholder="Description"
      rows={4}
    />
    <select 
      value={tempTask.priority} 
      onChange={(e) => setTempTask({...tempTask, priority: e.target.value as 'High' | 'Medium' | 'Low'})} 
      className="border p-1 rounded text-sm"
    >
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </select>
    <button 
      onClick={() => saveEdit(colKey, item.id)} 
      className="bg-gray-800 text-white py-1 rounded text-sm font-bold"
    >
      Save
    </button>
  </div>
) : (
                  <>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-gray-800 wrap-break-word text-sm">{item.title}</h4>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={(e) => toggleFlag(e, colKey, item.id)} className={`w-6 h-6 flex items-center justify-center rounded ${item.flagged ? "bg-red-200 text-red-800" : "bg-gray-100 text-gray-400"} text-[10px]`}>🚩</button>
                        <button onClick={(e) => startEdit(e, item)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-black text-[9px] font-bold">✎</button>
                        <button onClick={(e) => removeTask(e, colKey, item.id)} className="w-6 h-6 flex items-center justify-center rounded bg-red-100 hover:bg-red-200 text-red-700 text-[9px] font-bold">✕</button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 my-2 truncate">{item.description}</p>
                    <span className="text-[10px] font-bold block mt-3 bg-gray-800 text-white w-max px-2 py-0.5 rounded">Priority: {item.priority}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {viewingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setViewingId(null)}>
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
              <h2 className="font-bold text-xl">{findTask(viewingId)?.title} {findTask(viewingId)?.flagged && "🚩"}</h2>
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
              <p className="text-gray-600">{findTask(viewingId)?.description}</p>
            </div>
            <span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold uppercase">Priority: {findTask(viewingId)?.priority}</span>
            <button className="block w-full mt-6 bg-gray-900 text-white py-2 rounded-lg font-bold" onClick={() => setViewingId(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}