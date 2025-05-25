import './css/App.css';
import React from 'react';
import Game from './helper/Game'
import ResultModal from './helper/ResultModal'
import NavBar from './helper/NavBar';
import LoginModal from './helper/LoginModal';
import RegisterModal from './helper/RegisterModal';
import { useState, useEffect } from 'react';
import { isTokenExpired } from './helper/ValidateToken'
import UserProfile from './helper/UserProfile';
import GuessTracker from './helper/GuessTracker';
import Leaderboard from './helper/Leaderboard';
import Stats from './helper/Stats';

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
  const [hiddenPlayers, setHiddenPlayers] = useState([]);
  const [hiddenGame, setHiddenGame] = useState(null); 
  const [gamePlayers, setGamePlayers] = useState([])
  const [prediction, setPrediction] = useState(-1);
  const [isResultOpen, setIsResultOpen] = useState(false); 
  const [isCorrect, setIsCorrect] = useState(false); 
  const [guessesLeft, setGuessesLeft] = useState(3); 
  const [totalScore, setTotalScore] = useState(0); 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false) 
  const [isRecord, setIsRecord] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false)
  const [username, setUsername] = useState(null)
  const [recordScore, setRecordScore] = useState(0)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [LeaderboardList, setLeaderboardList] = useState([])
  const [runeIconDict, setRuneIconDict] = useState(null)
  const [blueWins, setBlueWins] = useState(null)

  const fetchNewQuestion = () => {
    fetch(`${apiUrl}/game/random`)  // Replace with your API URL
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
    fetchNewQuestion()
    const access_token = localStorage.getItem("access_token");
    if ((access_token && isTokenExpired(access_token)) || !access_token) {
      localStorage.removeItem("access_token");
      setIsAuthenticated(false); 
    }
    else {
      setIsAuthenticated(true); 
    }
  }, []);

  useEffect(() => {
    const anonUserId = localStorage.getItem('anon_user_id');
    if (!anonUserId) {
      // Create anon user
      fetch(`${apiUrl}/anon_users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})  // whatever your API expects
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
      fetchNewQuestion();
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
            setRecordScore(data["record_score"]);
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
    const fetchLeaderboard = async () => {
      if (isLeaderboardOpen) {
        try {
          const response = await fetch(`${apiUrl}/leaderboard?limit=50`, {
            method: "GET",
          });

          const data = await response.json();

          if (response.ok) {
            setLeaderboardList(data);
          } else {
            console.error("Failed to fetch leaderboard", data);
          }
        } catch (error) {
          console.error("Network error", error);
        }
      }
    };

    fetchLeaderboard();
  }, [isLeaderboardOpen]);


  useEffect(() => {
    if (guessesLeft === 0 && isAuthenticated) {
  
      const accessToken = localStorage.getItem("access_token");

      fetch(`${apiUrl}/set_record_score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          current_score: totalScore,
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
  }

  const submitPrediction = async (predict) => {
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
  
      // Step 2: Submit prediction
      const response = await fetch(`${apiUrl}/prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: hiddenGame.game_id,
          prediction: predict,
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
        await fetch(`${apiUrl}/anon_users/update_score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            anon_user_id: anonUserId,
            correct: isCorrect,
          }),
        });
  
      } else {
        console.error('Prediction submission failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error making prediction:', error);
    }
  };
  

  return (
    <div>
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
        onClose= {() => setIsRegisterOpen(false)} 
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
        signOut={() => {
          setIsUserProfileOpen(false)
          setIsAuthenticated(false) 
          localStorage.removeItem("access_token")
        }}
      />

      <div class="game-content">
      <h2 class="nes-score-box">
      <i class="snes-jp-logo nes-text is-warning"></i>Total score: <span id="score">{totalScore}</span><i class="nes-icon star"></i>
      </h2>
      {isRecord && <div>You've made a new record. </div>}
      <GuessTracker guessesLeft={guessesLeft} />
      {guessesLeft > 0 && (
        <>
          <Game
            hiddenGame = {hiddenGame}
            hiddenPlayers = {hiddenPlayers}
            submitPrediction={submitPrediction}
            runeIconDict={runeIconDict}
          />
        </>
      )}
      {guessesLeft >= 0 && (
        <>
          {isResultOpen && (
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
        </>
      )}
      {
        guessesLeft === 0 && !isAuthenticated && (
          <div> <button type="button" class="nes-btn is-warning" onClick={() => setIsLoginOpen(true)}> Log in </button> to join the leaderboard<span className='leaderboard-emoji'>😊 </span> </div>
        )
      }
      {
        guessesLeft === 0 && (
          <button type="button" class="nes-btn is-primary" onClick={resetGame}> Try again </button>
        )
      }
    </div>
    </div>
  );
}

export default App;
