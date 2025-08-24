import './css/App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { isTokenExpired } from './helper/ValidateToken'

import AramGameMode from "./pages/AramGameMode";
import NavBarFull from './components/NavBarFull';
import GuessTracker from './components/GuessTracker';

const apiUrl = process.env.REACT_APP_API_URL;

async function fetchRuneIcons(patch) {
  const runesURL = `https://ddragon.leagueoflegends.com/cdn/${patch}.1/data/en_US/runesReforged.json`;
  const iconBaseURL = "https://ddragon.leagueoflegends.com/cdn/img/";

  try {
    const response = await fetch(runesURL);
    const runes = await response.json();

    const runeIconDict = {};

    // Traverse the top-level rune trees
    for (const tree of runes) {
      // Add the style icon
      runeIconDict[tree.key] = iconBaseURL + tree.icon;

      // Add each rune under the style
      for (const slot of tree.slots) {
        for (const rune of slot.runes) {
          runeIconDict[rune.key] = iconBaseURL + rune.icon;
        }
      }
    }

    return runeIconDict;
  } catch (error) {
    console.error("Failed to fetch or parse runes data:", error);
    return {};
  }
}

function App() {
  // -------------------- Game State --------------------
  const [gameStart, setGameStart] = useState(false)
  const [prediction, setPrediction] = useState(-1);           // User's current prediction
  const [isResultOpen, setIsResultOpen] = useState(false);    // Result modal visibility
  const [isCorrect, setIsCorrect] = useState(false);          // Whether the user's guess was correct
  const [blueWins, setBlueWins] = useState(null);             // Actual outcome: true if blue team won
  const [guessesLeft, setGuessesLeft] = useState(3);          // Number of guesses left
  //const [timeLeft, setTimeLeft] = useState(20);               // Countdown timer for each guess
  const [isRecord, setIsRecord] = useState(false);            // Whether the current score is a new record
  const [totalScore, setTotalScore] = useState(0);            // Total score accumulated
  const [queue, setQueue] = useState(0); 

// -------------------- Game Data --------------------
  const [hiddenGame, setHiddenGame] = useState(null);         // Current hidden game object
  const [hiddenPlayers, setHiddenPlayers] = useState([]);     // Hidden players (masked for guessing)
  const [gamePlayers, setGamePlayers] = useState([]);         // All players in the current game
  const [runeIconDict, setRuneIconDict] = useState(null);     // Rune icons for display
  const [LeaderboardList, setLeaderboardList] = useState([]); // Leaderboard player list

// -------------------- Modals --------------------
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);  // Leaderboard modal
  const [isStatsOpen, setIsStatsOpen] = useState(false);              // Stats modal
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);  // User profile modal

// -------------------- Authentication --------------------
  const [isLoginOpen, setIsLoginOpen] = useState(false);       // Login modal visibility
  const [isRegisterOpen, setIsRegisterOpen] = useState(false); // Register modal visibility
  const [isAuthenticated, setIsAuthenticated] = useState(false); // User authentication state
  const [username, setUsername] = useState(null);              // Authenticated user's name

// -------------------- Record Score --------------------
  const [recordScore, setRecordScore] = useState([]);           // Highest score achieved

  const fetchNewQuestion = (queue) => {
    fetch(`${apiUrl}/game/random?queue=${queue}`)  
      .then(response => response.json())
      .then(result => {
        // set game data
        // Fetch hidden players for the game
        const currentGameId = result.game_id
        fetch(`${apiUrl}/game/${currentGameId}/hidden_players`)  // Replace with your API URL
          .then(playerResponse => playerResponse.json())
          .then(playersResult => {
            setHiddenPlayers(playersResult); // Set hidden players state
          })
          .catch(playerError => console.error('Error fetching hidden players:', playerError));
        setHiddenGame(result); // Set hidden game data
      })
      .catch(error => console.error('Error fetching game data:', error));
  };

  useEffect(() => {
    if (hiddenGame) {
      fetchRuneIcons(hiddenGame.game_patch).then((runeDict) => {
        setRuneIconDict(runeDict);
      });
    }
  }, [hiddenGame]);  

  useEffect(() => {
    if (gameStart) {
      fetchNewQuestion(queue)
      const access_token = localStorage.getItem("access_token");
      if ((access_token && isTokenExpired(access_token)) || !access_token) {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false); 
      }
      else {
        setIsAuthenticated(true); 
      }
    }
  }, [gameStart]);

  useEffect(() => {
    const anonUserId = localStorage.getItem('anon_user_id');
    if (!anonUserId) {
      // Create anon user
      fetch(`${apiUrl}/anon_users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})  
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          localStorage.setItem('anon_user_id', data.id);
        }
      })
      .catch(console.error);
    }
  }, []);  // Run once on mount


  useEffect(() => {
    if (prediction === -1) {
      // Reset the draft to the next question when prediction is reset
      setIsResultOpen(false);  // Close the modal
      fetchNewQuestion(queue);
    } else {
      setIsResultOpen(true);  // Open the modal if prediction is set

      const fetchGamePlayers = async () => {
        try {
          const response = await fetch(`${apiUrl}/game/${hiddenGame.game_id}/players`);  
          const data = await response.json();
          setGamePlayers([])
          setGamePlayers(data);
        } catch (error) {
          console.error("Failed to fetch game players:", error);
        }
      };

      fetchGamePlayers();
    }
  }, [prediction]);  // This effect runs when `prediction` changes

  useEffect(() => {
    if (isUserProfileOpen) {
      (async () => {
        const token = localStorage.getItem("access_token");

        try {
          const response = await fetch(`${apiUrl}/users/me`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          const data = await response.json();

          if (response.ok) {
            setUsername(data["username"]);
            setRecordScore([data["record_score"], data["record_score_ranked"]]);
          } else {
            setIsAuthenticated(false);
            localStorage.removeItem("access_token");
          }
        } catch (error) {
          console.error("Network error", error);
        }
      })();
    }
  }, [isUserProfileOpen]);

  useEffect(() => {
    if (guessesLeft === 0 && isAuthenticated) {
  
      const accessToken = localStorage.getItem("access_token");
      const anonUserId = localStorage.getItem('anon_user_id');

      fetch(`${apiUrl}/set_record_score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          queue: queue 
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
         }
        return response.json();
      })
      .then((data) => {
        setIsRecord(data["new_record"]); 
      })
      .catch((error) => {
        setIsAuthenticated(false);
        localStorage.removeItem("access_token")
        console.error("Sending record errors:", error);
      });
    }
  }, [guessesLeft, isAuthenticated]); // Watch guessesLeft, isAuthenticated

  const handleNextQuestion = () => {
    setPrediction(-1);  // Reset prediction to -1 when the modal is closed
  };

  const resetGame = () => {
    setPrediction(-1); 
    setGuessesLeft(3); 
    setTotalScore(0);
    setIsRecord(false); 
    setBlueWins(null); 
    setGameStart(false);
  }

  const submitPrediction = async (predict) => {
    try {
      // Step 1: Get or create anon_user_id
      let anonUserId = localStorage.getItem("anon_user_id");
      let token = localStorage.getItem("access_token");
  
      if (!anonUserId) {
        const createResponse = await fetch(`${apiUrl}/anon_user/create`, {
          method: 'POST',
        });
  
        if (!createResponse.ok) {
          console.error("Failed to create anon_user");
          return;
        }
  
        const createData = await createResponse.json();
        anonUserId = createData["anon_user_id"];
        localStorage.setItem("anon_user_id", anonUserId);
      }
  
      // Step 2: Submit prediction
      const response = await fetch(`${apiUrl}/prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId: hiddenGame.game_id,
          prediction: predict,
          anon_user_id: anonUserId,
          queue: queue
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        const isCorrect = result["successful_guess"];
        const blueWins = result.game_data_out?.blue_wins;
        setIsCorrect(isCorrect);
  
        if (!isCorrect) {
          setGuessesLeft(guessesLeft - 1);
        } else {
          setTotalScore(totalScore + 1);
        }
  
        setPrediction(predict);
        setBlueWins(blueWins);
  
        // Step 3: Update anon_user score
        //await fetch(`${apiUrl}/anon_users/update_score`, {
        //  method: 'POST',
        //  headers: {
        //    'Content-Type': 'application/json',
        //  },
        //  body: JSON.stringify({
        //    anon_user_id: anonUserId,
        //    correct: isCorrect,
        //  }),
        //});
  
      } else {
        console.error('Prediction submission failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error making prediction:', error);
    }
  };

  {/*
  const submitPredictionTimeout = async () => {
    try {
      // Step 1: Get or create anon_user_id
      let anonUserId = localStorage.getItem("anon_user_id");
  
      if (!anonUserId) {
        const createResponse = await fetch(`${apiUrl}/anon_user/create`, {
          method: 'POST',
        });
  
        if (!createResponse.ok) {
          console.error("Failed to create anon_user");
          return;
        }
  
        const createData = await createResponse.json();
        anonUserId = createData["anon_user_id"];
        localStorage.setItem("anon_user_id", anonUserId);
      }
  
      // Step 2: Submit prediction with 0 (because API requires boolean)
      const response = await fetch(`${apiUrl}/prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: hiddenGame.game_id,
          prediction: 0,
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        const blueWins = result.game_data_out?.blue_wins;
        setIsCorrect(false);  // timeout is always incorrect
  
        setGuessesLeft(guessesLeft - 1);
        setPrediction(-2); // mark prediction as timeout locally
        setBlueWins(blueWins);
  
        // Step 3: Update anon_user score with correct = false explicitly
        await fetch(`${apiUrl}/anon_users/update_score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            anon_user_id: anonUserId,
            correct: false,
          }),
        });
  
      } else {
        console.error('Prediction submission failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error making prediction:', error);
    }
  };
  */}
  
  const gameState = {
    isResultOpen,
    isCorrect,
    prediction,
    blueWins,
    guessesLeft,
    isRecord,
    totalScore,
    gameStart, 
    setGameStart,
    queue,
    setQueue 
  };

  const gameData = {
    hiddenGame,
    hiddenPlayers,
    gamePlayers,
    runeIconDict,
    LeaderboardList,
    setLeaderboardList,
    recordScore
  };

  const gameActions = {
    submitPrediction,
    handleNextQuestion,
    resetGame,
    setQueue,
  };

  const modals = {
    isLeaderboardOpen,
    setIsLeaderboardOpen,
    isStatsOpen,
    setIsStatsOpen,
    isUserProfileOpen,
    setIsUserProfileOpen,
  };

  const authState = {
    isLoginOpen,
    isRegisterOpen,
    setIsLoginOpen,
    setIsRegisterOpen,
    isAuthenticated,
    setIsAuthenticated,
    username
  };

  return (
    <Router>
      <div>
        <NavBarFull
          authState={authState}
          modals={modals}
          gameData={gameData}
          gameActions={gameActions}
        />

        <div className="game-content">
          <h2 className="nes-score-box">
            <i className="snes-jp-logo nes-text is-warning"></i>
            Total score: <span id="score">{totalScore}</span>
            <i className="nes-icon star"></i>
          </h2>

          <GuessTracker guessesLeft={guessesLeft} />

          {!gameStart && (
            <div> 
              <div> 
              <button
                type="button"
                className="play-button nes-btn is-warning"
                onClick={() => {
                  setGameStart(true);
                  setQueue(420); 
                }}
              >
                Guess Ranked Games
              </button>
              </div>

              <div> 
              <button
                type="button"
                className="play-button nes-btn is-warning"
                onClick={() => {
                  setGameStart(true);
                  setQueue(450); 
                }}
              >
                Guess ARAM Games
              </button>
              </div>
            </div>
          )}
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <AramGameMode
                gameState={gameState}
                gameData={gameData}
                gameActions={gameActions}
                authState={authState}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );  
}

export default App;
