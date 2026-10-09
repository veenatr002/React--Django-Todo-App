import { useEffect, useState } from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [completed, setCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingTodo, setEditingTodo] = useState(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [deletingTodoId, setDeletingTodoId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/todos/')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setTodos(data)
      })
      .catch((err) => {
        setError(`Could not load tasks: ${err.message}`)
      })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:8000/todos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, completed }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data === 'object'
            ? Object.entries(data)
                .map(([field, messages]) => `${field}: ${messages}`)
                .join(' ')
            : 'Unable to create the task.',
        )
      }

      setTodos((currentTodos) => [...currentTodos, data])
      setTitle('')
      setDescription('')
      setCompleted(false)
    } catch (err) {
      setError(`Could not create task: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEditing(todo) {
    setEditingTodo({ ...todo })
    setError('')
  }

  async function saveEdit(e) {
    e.preventDefault()
    if (!editingTodo) return

    setIsSavingEdit(true)
    setError('')

    try {
      const response = await fetch(`http://127.0.0.1:8000/todos/${editingTodo.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingTodo.title,
          description: editingTodo.description,
          completed: editingTodo.completed,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(
          Object.entries(data)
            .map(([field, messages]) => `${field}: ${messages}`)
            .join(' ') || 'Unable to update the task.',
        )
      }

      const updatedTodo = await response.json()
      setTodos((currentTodos) =>
        currentTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)),
      )
      setEditingTodo(null)
    } catch (err) {
      setError(`Could not update task: ${err.message}`)
    } finally {
      setIsSavingEdit(false)
    }
  }

  async function deleteTodo(todoId, todoTitle) {
    const shouldDelete = window.confirm(`Delete "${todoTitle}"? This action cannot be undone.`)
    if (!shouldDelete) return

    setDeletingTodoId(todoId)
    setError('')

    try {
      const response = await fetch(`http://127.0.0.1:8000/todos/${todoId}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId))
      if (editingTodo?.id === todoId) {
        setEditingTodo(null)
      }
    } catch (err) {
      setError(`Could not delete task: ${err.message}`)
    } finally {
      setDeletingTodoId(null)
    }
  }

  const filteredTodos = todos.filter((todo) => {
    if (statusFilter === 'completed') return todo.completed
    if (statusFilter === 'not-completed') return !todo.completed
    return true
  })

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-10 sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "linear-gradient(rgba(8, 47, 73, 0.48), rgba(8, 47, 73, 0.65)), url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2000&q=85')",
      }}
    >
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <h1 className="mb-0 text-3xl font-bold tracking-tight text-white drop-shadow sm:text-4xl lg:col-span-2">
          Todo App
        </h1>
        <div className="overflow-hidden rounded-xl border border-white/30 bg-white shadow-2xl shadow-slate-950/30">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="task-status-filter" className="text-sm font-medium text-slate-700">
                Show:
              </label>
              <select
                id="task-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="all">All tasks</option>
                <option value="completed">Completed</option>
                <option value="not-completed">Not completed</option>
              </select>
            </div>
          </div>
          <div className="max-h-[65vh] overflow-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="sticky top-0 z-10 bg-slate-100">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">ID</th>
                  <th scope="col" className="px-4 py-3 text-sm font-semibold text-slate-700">Title</th>
                  <th scope="col" className="px-4 py-3 text-sm font-semibold text-slate-700">Description</th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">Completed</th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
              {filteredTodos.map((todo) => (
                <tr key={todo.id} className="transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{todo.id}</td>
                  {editingTodo?.id === todo.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          aria-label="Task title"
                          value={editingTodo.title}
                          maxLength={100}
                          required
                          onChange={(event) =>
                            setEditingTodo({ ...editingTodo, title: event.target.value })
                          }
                          className="w-full min-w-32 rounded border border-slate-300 px-2 py-1 text-sm text-slate-900"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          aria-label="Task description"
                          value={editingTodo.description}
                          required
                          onChange={(event) =>
                            setEditingTodo({ ...editingTodo, description: event.target.value })
                          }
                          className="w-full min-w-48 rounded border border-slate-300 px-2 py-1 text-sm text-slate-900"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <input
                          aria-label="Task completed"
                          type="checkbox"
                          checked={editingTodo.completed}
                          onChange={(event) =>
                            setEditingTodo({ ...editingTodo, completed: event.target.checked })
                          }
                          className="size-4 rounded border-slate-300 accent-sky-700"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          aria-label="Save task changes"
                          title="Save changes"
                          onClick={saveEdit}
                          disabled={isSavingEdit}
                          className="mr-2 rounded px-2 py-1 font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          aria-label="Cancel editing"
                          onClick={() => setEditingTodo(null)}
                          className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{todo.title}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{todo.description}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            todo.completed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {todo.completed ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          aria-label={`Edit ${todo.title}`}
                          title="Edit task"
                          onClick={() => startEditing(todo)}
                          disabled={deletingTodoId === todo.id}
                          className="mr-2 rounded px-2 py-1 text-sky-700 hover:bg-sky-100 disabled:opacity-50"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${todo.title}`}
                          title="Delete task"
                          onClick={() => deleteTodo(todo.id, todo.title)}
                          disabled={deletingTodoId === todo.id}
                          className="rounded px-2 py-1 font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingTodoId === todo.id ? '…' : '×'}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredTodos.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan="5">
                    {todos.length === 0
                      ? 'No todos to display.'
                      : 'No tasks match this filter.'}
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-xl border border-white/30 bg-white p-5 shadow-2xl shadow-slate-950/30"
        >
          <h2 className="text-xl font-semibold text-slate-900">
            Add a new task
          </h2>
          <div>
            <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
              placeholder="Enter a task title"
            />
          </div>
          <div>
            <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
              placeholder="Describe the task"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              name="completed"
              type="checkbox"
              checked={completed}
              onChange={(event) => setCompleted(event.target.checked)}
              className="size-4 rounded border-slate-300 accent-sky-700"
            />
            Mark as completed
          </label>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Adding task...' : 'Add task'}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}

export default App
