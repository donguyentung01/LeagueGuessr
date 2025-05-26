import React from 'react';
import '../css/fonts.css';
import '../css/NavBar.css';

function NavBar({ isAuthenticated, openLogin, openProfile, openLeaderboard, openStats }) {
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
        <div className="tooltip" onClick={openStats}>
            <img
              src="/images/stats.png"
              alt="About the game"
              className="navbar-icon"
              title="About the game"
            />
        </div>
        <div className="tooltip" onClick={openLeaderboard}>
            <img
              src="/images/trophy.png"
              alt="Leaderboard"
              className="navbar-icon"
              title="Leaderboard"
            />
        </div>
        {!isAuthenticated && (
          <div className="tooltip" onClick={openLogin}>
            <img
              src="/images/login.png"
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
      </div>
    </nav>
  );
}

export default NavBar;

