//import GuessTimer from "../components/GuessTimer";
import Game from "../components/Game";
import ResultModal from "../components/ResultModal";

const AramGameMode = ({
  authState: { isAuthenticated, setIsLoginOpen },
  gameState: {
    isResultOpen,
    isCorrect,
    prediction,
    blueWins,
    guessesLeft,
    timeLeft,
    setTimeLeft,
    isRecord,
    totalScore,
    gameStart,
    setGameStart,
    queue,
    setQueue
  },
  gameData: {
    hiddenGame,
    hiddenPlayers,
    runeIconDict,
    gamePlayers,
  },
  gameActions: {
    submitPrediction,
    handleNextQuestion,
    resetGame,
    submitPredictionTimeout,
  },
}) => (
  <div className="game-content">

    {isRecord && <div>You've made a new record.</div>}

    {guessesLeft > 0 && gameStart && (
      <>
        {/*
        <GuessTimer
          submitPredictionTimeout={submitPredictionTimeout}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          isResultOpen={isResultOpen}
        />
        */}
        <Game
          hiddenGame={hiddenGame}
          hiddenPlayers={hiddenPlayers}
          submitPrediction={submitPrediction}
          runeIconDict={runeIconDict}
        />
      </>
    )}

    {guessesLeft >= 0 && isResultOpen  && gameStart && (
      <ResultModal
        onNextQuestion={handleNextQuestion}
        gamePlayers={gamePlayers}
        isCorrect={isCorrect}
        runeIconDict={runeIconDict}
        hiddenGame={hiddenGame}
        prediction={prediction}
        blueWins={blueWins}
      />
    )}

    {guessesLeft === 0 && !isAuthenticated  && gameStart && (
      <div>
        <button
          type="button"
          className="nes-btn is-warning"
          onClick={() => setIsLoginOpen(true)}
        >
          Log in
        </button>{" "}
        to join the leaderboard
        <span className="leaderboard-emoji">😊</span>
      </div>
    )}

    {guessesLeft === 0 && gameStart && (
        <button
            type="button"
            className="nes-btn is-primary"
            onClick={() => {
                resetGame();
            }}
        >
            Try again
        </button>
    )}
  </div>
);

export default AramGameMode;

