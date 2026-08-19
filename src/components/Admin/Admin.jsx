import { useState } from "react"
import useApi from "../../hooks/useApi"
import "./Admin.css"

const Admin = () => {
  const { post } = useApi(
    "https://6a85dd7e9c451dc67a64375d.mockapi.io"
  )

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("low")
  const [completed, setCompleted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newChushpan = {
      title,
      description,
      completed,
      priority,
      createdAt: new Date().toISOString()
    }

    await post("chushpan", newChushpan)

    setTitle("")
    setDescription("")
    setPriority("low")
    setCompleted(false)
  }

  return (
    <div className="admin">
      <div className="admin-card">
        <h1>Add Todo</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Todo title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            Completed
          </label>

          <button type="submit">Add Todo</button>
        </form>
      </div>
    </div>
  )
}

export default Admin