import React from "react";
import NavBar from "./NavBar";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import Leaderboard from "./Leaderboard";
import Stats from "./Stats";
import UserProfile from "./UserProfile";

const NavBarFull = ({ authState, modals, gameData, gameActions }) => {
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
    setLeaderboardList,
    recordScore,
  } = gameData;

  const {
    submitPrediction,
    handleNextQuestion,
    resetGame,
    setQueue
  } = gameActions; 

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
        resetGame={() => resetGame()}
        resetQueue={() => setQueue(0)}
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
        setLeaderboardList={setLeaderboardList}
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
