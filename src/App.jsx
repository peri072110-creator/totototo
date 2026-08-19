import { useEffect, useMemo, useState } from "react";
import useApi from "./hooks/useApi";
import "./App.css";

const PRIORITIES = ["low", "medium", "high"];
const PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High" };

const App = () => {
  const { error, data, loading, get, post, put, deleteChushpan } = useApi(
    "https://6a85dd7e9c451dc67a64375d.mockapi.io"
  );

  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("low");
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("low");
  const [removingId, setRemovingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    get("chushpan");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => get("chushpan");

  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || submitting) return;

    setSubmitting(true);
    try {
      await post("chushpan", {
        title,
        description: "",
        completed: false,
        priority: newPriority,
        createdAt: new Date().toISOString(),
      });
      setNewTitle("");
      setNewPriority("low");
      await refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (item) => {
    await put(`chushpan/${item.id}`, { ...item, completed: !item.completed });
    refresh();
  };

  const handleDeleteClick = (id) => {
    setRemovingId(id);
    setTimeout(async () => {
      await deleteChushpan(`chushpan/${id}`);
      setRemovingId(null);
      refresh();
    }, 260);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditPriority(item.priority || "low");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveEdit = async (item) => {
    const title = editTitle.trim();
    if (!title) return;
    await put(`chushpan/${item.id}`, {
      ...item,
      title,
      priority: editPriority,
    });
    setEditingId(null);
    refresh();
  };

  const items = useMemo(() => data || [], [data]);

  const counts = useMemo(
    () => ({
      all: items.length,
      active: items.filter((i) => !i.completed).length,
      completed: items.filter((i) => i.completed).length,
      high: items.filter((i) => i.priority === "high" && !i.completed).length,
    }),
    [items]
  );

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => {
        if (filter === "active") return !i.completed;
        if (filter === "completed") return i.completed;
        return true;
      })
      .filter((i) => !q || (i.title || "").toLowerCase().includes(q));
  }, [items, filter, search]);

  return (
    <div className="reminders-app">
      <aside className="rem-sidebar">
        <div className="rem-search">
          <span className="rem-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rem-stats">
          <button
            type="button"
            className={`rem-stat rem-stat-all ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <span className="rem-stat-icon">≡</span>
            <span className="rem-stat-num">{counts.all}</span>
            <span className="rem-stat-label">All</span>
          </button>
          <button
            type="button"
            className={`rem-stat rem-stat-active ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            <span className="rem-stat-icon">○</span>
            <span className="rem-stat-num">{counts.active}</span>
            <span className="rem-stat-label">Active</span>
          </button>
          <button type="button" className="rem-stat rem-stat-high" disabled>
            <span className="rem-stat-icon">!</span>
            <span className="rem-stat-num">{counts.high}</span>
            <span className="rem-stat-label">High</span>
          </button>
          <button
            type="button"
            className={`rem-stat rem-stat-completed ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            <span className="rem-stat-icon">✓</span>
            <span className="rem-stat-num">{counts.completed}</span>
            <span className="rem-stat-label">Completed</span>
          </button>
        </div>

        <div className="rem-mylists">
          <p className="rem-mylists-title">My Lists</p>
          <div className="rem-list-item active">
            <span className="rem-list-dot" />
            Work
            <span className="rem-list-count">{counts.active}</span>
          </div>
        </div>
      </aside>

      <main className="rem-main">
        <header className="rem-main-header">
          <div>
            <h1>Work</h1>
            <p className="rem-main-sub">
              {counts.active} active · {counts.completed} completed
            </p>
          </div>
          <div className="rem-count-big">{counts.all}</div>
        </header>

        <form className="add-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
          <button type="submit" disabled={!newTitle.trim() || submitting}>
            {submitting ? "Adding..." : "Add"}
          </button>
        </form>

        <div className="filters">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <span className="filters-count">{visibleItems.length} shown</span>
        </div>

        {loading && !data && <p className="app-state">loading...</p>}
        {error && <p className="app-state error">error: {error.message}</p>}

        {data && (
          <ul className="todo-list">
            {visibleItems.length === 0 && (
              <li className="empty-state">Nothing here yet</li>
            )}
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className={`todo-item ${removingId === item.id ? "removing" : ""}`}
                data-priority={item.priority || "low"}
                data-completed={item.completed}
              >
                <button
                  type="button"
                  className="todo-check"
                  onClick={() => handleToggle(item)}
                  aria-label="toggle complete"
                />

                {editingId === item.id ? (
                  <div className="todo-edit-row">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(item);
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {PRIORITY_LABEL[p]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="icon-btn save"
                      onClick={() => saveEdit(item)}
                      aria-label="save"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      className="icon-btn cancel"
                      onClick={cancelEdit}
                      aria-label="cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span
                      className="todo-title"
                      onDoubleClick={() => startEdit(item)}
                    >
                      {item.title}
                    </span>
                    <span
                      className="todo-priority-tag"
                      data-priority={item.priority || "low"}
                    >
                      {PRIORITY_LABEL[item.priority] || "Low"}
                    </span>
                    <button
                      type="button"
                      className="icon-btn edit"
                      onClick={() => startEdit(item)}
                      aria-label="edit"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="icon-btn delete"
                      onClick={() => handleDeleteClick(item.id)}
                      aria-label="delete"
                    >
                      🗑
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default App;
