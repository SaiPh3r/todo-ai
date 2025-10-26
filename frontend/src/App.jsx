import React, { useEffect, useState } from "react";
import {
  SignInButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/clerk-react";
import axios from "axios";
import "./App.css";

const PencilLogo = () => (
  <div className="pencil-logo">
    <svg className="pencil-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
    <div className="pencil-dot" />
  </div>
);

const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-logo">
      <PencilLogo />
      <div className="loading-logo-ping">
        <PencilLogo />
      </div>
    </div>
    <p className="loading-text">Loading your notes...</p>
  </div>
);

const App = () => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get("http://127.0.0.1:8000/user", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            user_id: user.id,
            email: user.primaryEmailAddress.emailAddress,
          },
        });
        setTodos(data.todos || []);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isSignedIn, getToken, user]);


  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `http://127.0.0.1:8000/create`,
        { user_id : user.id, text: newTodo, completed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos((prev) => [...prev, data.todo]);
      setNewTodo("");
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!isSignedIn)
    return (
      <div className="signin-container">
        <div className="signin-content">
          <div className="signin-header">
            <PencilLogo />
            <h2 className="app-title">NoteAI</h2>
          </div>
          <p className="signin-subtitle">Please sign in to continue</p>
          <div className="signin-button-wrapper">
            <SignInButton mode="modal">
              <button className="signin-button">Sign In</button>
            </SignInButton>
          </div>
        </div>
      </div>
    );

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-left">
            <PencilLogo />
            <h2 className="app-title">NoteAI</h2>
          </div>
          <div className="user-button-wrapper">
            <UserButton />
          </div>
        </header>

        <main className="main-content">
          <div className="welcome-card">
            <h3 className="welcome-text">
              Welcome, {user.fullName || "User"} 👋
            </h3>
          </div>

          {/* 🟢 Add Todo Form */}
          <form onSubmit={handleAddTodo} className="add-todo-form">
            <input
              type="text"
              placeholder="Write a new note..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="todo-input"
            />
            <button type="submit" className="add-button">
              ➕ Add
            </button>
          </form>

          <div className="todos-card">
            {todos.length ? (
              <ul className="todos-list">
                {todos.map((todo, index) => (
                  <li
                    key={todo.id || index}
                    className="todo-item"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="todo-content">
                      <span className="todo-text">{todo.text}</span>
                      <span className="todo-status">
                        {todo.completed ? "✅" : "❌"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg
                    className="document-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="empty-text">No todos yet. Add one soon!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;