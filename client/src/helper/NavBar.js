import React from 'react';
import '../css/fonts.css';
import '../css/NavBar.css';

function NavBar({ isAuthenticated, openLogin, openProfile, openLeaderboard }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img
          src="/images/lolicon.png"
          alt="LoL Icon"
          className="navbar-logo"
        />
        <p className="title navbar-title">aramguess</p>
      </div>

      <div className="navbar-right">
        {!isAuthenticated && (
          <div className="tooltip" onClick={openLogin}>
            <img
              src="/images/user.png"
              alt="Login"
              className="navbar-icon"
              title="Login"
            />
          </div>
        )}
        {isAuthenticated && (
          <div className="tooltip" onClick={openProfile}>
            <img
              src="/images/user.png"
              alt="Profile"
              className="navbar-icon"
              title="Profile"
            />
          </div>
        )}
        <div className="tooltip" onClick={openLeaderboard}>
          <i className="nes-icon trophy is-medium navbar-trophy" title="Leaderboard"></i>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;

