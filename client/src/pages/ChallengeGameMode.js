import GuessTracker from "../components/GuessTracker";
import GuessTimer from "../components/GuessTimer";
import Game from "../components/Game";
import ResultModal from "../components/ResultModal";

const ChallengeGameMode = ({
  gameState: {
    isResultOpen,
    isCorrect,
    prediction,
    blueWins,
    timeLeft,
    setTimeLeft,
    totalScore,
    setTotalScore,
    guessesLeft
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
    <h2 className="nes-score-box">
      <i className="snes-jp-logo nes-text is-warning"></i>Total score:{" "}
      <span id="score">{totalScore}</span>
      <i className="nes-icon star"></i>
    </h2>

    {guessesLeft > 0 && (
      <>
        <GuessTimer
          submitPredictionTimeout={submitPredictionTimeout}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          isResultOpen={isResultOpen}
        />
        <Game
          hiddenGame={hiddenGame}
          hiddenPlayers={hiddenPlayers}
          submitPrediction={submitPrediction}
          runeIconDict={runeIconDict}
        />
      </>
    )}

    {guessesLeft >= 0 && isResultOpen && (
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

    {guessesLeft === 0 && (
      <button
        type="button"
        className="nes-btn is-primary"
        onClick={resetGame}
      >
      </button>
    )}
  </div>
);

export default ChallengeGameMode;

