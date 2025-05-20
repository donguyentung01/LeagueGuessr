import React, { useEffect, useRef, useState } from 'react';

const RegisterModal = ({ isRegisterOpen, onClose, setIsAuthenticated }) => {
  const modalRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(""); // State to store error message

  useEffect(() => {
    if (isRegisterOpen && modalRef.current) {
      modalRef.current.showModal(); // NES.css dialog method
    } else if (modalRef.current) {
      modalRef.current.close();
    }
  }, [isRegisterOpen]);

  const handleRegister = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const reentered_password = e.target.reentered_password.value;

    try {
      const registerResponse = await fetch("https://api.aramguess.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password,
          reentered_password
        })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        // Set error message if registration fails
        setErrorMessage(registerData.detail || "Registration failed, please try again.");
        return;
      }

      console.log("Registration successful", registerData);

      const loginParams = new URLSearchParams();
      loginParams.append("username", username);
      loginParams.append("password", password);

      const loginResponse = await fetch("https://api.aramguess.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: loginParams.toString()
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        console.log("Login successful", loginData);
        localStorage.setItem("access_token", loginData.access_token);
        setIsAuthenticated(true);
        onClose();
      } else {
        // Set error message if login fails
        setErrorMessage("Login failed, please try again.");
        console.error("Login failed", loginData);
      }
    } catch (error) {
      // Set error message for network issues
      setErrorMessage("Network error, please try again later.");
      console.error("Network error", error);
    }
  };

  return (
    <dialog className="nes-dialog is-dark is-rounded" ref={modalRef}>
      <form method="dialog" onSubmit={handleRegister}>
        <p className="title">Create an Account</p>
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
          <br />
          <label>
            Confirm your password:
            <input name="reentered_password" type="password" className="nes-input" required />
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
          <button type="submit" className="nes-btn is-primary">Register</button>
        </menu>
      </form>
    </dialog>
  );
};

export default RegisterModal;
