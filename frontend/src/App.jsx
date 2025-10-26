import React, { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/clerk-react";
import axios from "axios";

const App = () => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    if (!isSignedIn) return;

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
      }
    };

    loadUserData();
  }, [isSignedIn, getToken, user]);

  if (!isSignedIn)
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <h2>📝 NoteAI</h2>
        <p>Please sign in to continue</p>
        <SignInButton mode="modal" />
      </div>
    );

  return (
    <div style={{ padding: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📝 NoteAI</h2>
        <UserButton />
      </header>

      <main style={{ marginTop: "2rem" }}>
        <h3>Welcome, {user.fullName || "User"} 👋</h3>
        {todos.length ? (
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>
                {todo.text} {todo.completed ? "✅" : "❌"}
              </li>
            ))}
          </ul>
        ) : (
          <p>No todos yet. Add one soon!</p>
        )}
      </main>
    </div>
  );
};

export default App;