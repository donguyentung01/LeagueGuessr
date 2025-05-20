import React, { useEffect, useRef, useState } from 'react';

const LoginModal = ({ isLoginOpen, onClose, setIsAuthenticated, onOpenRegister }) => {
  const modalRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(""); // State to store error message

  useEffect(() => {
    if (isLoginOpen && modalRef.current) {
      modalRef.current.showModal(); // NES.css dialog method
    } else if (modalRef.current) {
      modalRef.current.close();
    }
  }, [isLoginOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    try {
      const response = await fetch("https://api.aramguess.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        setIsAuthenticated(true);
        setErrorMessage(""); // Clear error message on successful login
        onClose();
      } else {
        // Set error message if login fails
        setErrorMessage(data.detail || "Login failed, please try again.");
      }
    } catch (error) {
      // Set error message for network issues
      setErrorMessage("Network error, please try again later.");
      console.error("Network error", error);
    }
  };

  return (
    <dialog className="nes-dialog is-dark is-rounded" ref={modalRef}>
      <form method="dialog" onSubmit={handleLogin}>
        <p className="title">Login</p>
        <p>
          <label>
            Username:
            <input name="username" type="text" className="nes-input" required />
          </label>
          <br />
          <label>
            Password:
            <input name="password" type="password" className="nes-input" required />
          </label>
        </p>

        {/* Display the error message if it exists */}
        {errorMessage && (
          <p className="nes-text is-error" style={{ marginTop: '1rem' }}>
            {errorMessage}
          </p>
        )}

        <menu className="dialog-menu">
          <button type="button" className="nes-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="nes-btn is-primary">Log in</button>
        </menu>
        <div style={{ marginTop: '1rem' }}>
          <span>Don't have an account?</span>{' '}
          <button type="button" className="nes-btn is-warning" onClick={onOpenRegister}>
            Register now!
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default LoginModal;
