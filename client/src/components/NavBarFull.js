import React from "react";
import NavBar from "./NavBar";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import Leaderboard from "./Leaderboard";
import Stats from "./Stats";
import UserProfile from "./UserProfile";

const NavBarFull = ({ authState, modals, gameData }) => {
  // Destructure auth-related state
  const {
    isLoginOpen,
    setIsLoginOpen,
    isRegisterOpen,
    setIsRegisterOpen,
    isAuthenticated,
    setIsAuthenticated,
    username,
  } = authState;

  // Destructure modal visibility state
  const {
    isLeaderboardOpen,
    setIsLeaderboardOpen,
    isStatsOpen,
    setIsStatsOpen,
    isUserProfileOpen,
    setIsUserProfileOpen,
  } = modals;

  // Destructure game-related data
  const {
    LeaderboardList,
    recordScore,
  } = gameData;

  const handleSignOut = () => {
    setIsUserProfileOpen(false);
    setIsAuthenticated(false);
    localStorage.removeItem("access_token");
  };

  return (
    <>
      <NavBar
        openLogin={() => setIsLoginOpen(true)}
        openProfile={() => setIsUserProfileOpen(true)}
        isAuthenticated={isAuthenticated}
        openLeaderboard={() => setIsLeaderboardOpen(true)}
        openStats={() => setIsStatsOpen(true)}
      />

      <LoginModal
        isLoginOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        setIsAuthenticated={setIsAuthenticated}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <RegisterModal
        isRegisterOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        setIsAuthenticated={setIsAuthenticated}
      />

      <Leaderboard
        isLeaderboardOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        LeaderboardList={LeaderboardList}
      />

      <Stats
        isStatsOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <UserProfile
        isUserProfileOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        username={username}
        recordScore={recordScore}
        signOut={handleSignOut}
      />
    </>
  );
};

export default NavBarFull;
