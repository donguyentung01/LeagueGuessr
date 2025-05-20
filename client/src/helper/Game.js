import React from 'react';
import '../css/Game.css';

const formatGameDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function Game({ hiddenGame, hiddenPlayers, submitPrediction, runeIconDict}) {
  // Checking if hiddenGame is available and if the necessary draft data exists
  const runeIconsReady = runeIconDict && Object.keys(runeIconDict).length > 0;
  const totalRows = hiddenGame && hiddenGame.game_id ? 5 : 0; 
  const championIconBaseURL =hiddenGame?.game_patch
  ? `https://ddragon.leagueoflegends.com/cdn/${hiddenGame.game_patch}.1/img/champion/`
  : '';
  const summonerBaseURL =hiddenGame?.game_patch
  ? `https://ddragon.leagueoflegends.com/cdn/${hiddenGame.game_patch}.1/img/spell/`
  : '';
  const middleIndex = Math.floor(totalRows / 2); // Middle row to place "VS"
  return (
    <table id={hiddenGame ? hiddenGame.game_id : ''} className="draft">
      <tbody>
        {/* Draft table rows */}
        {hiddenGame && hiddenGame.game_id && hiddenGame.game_patch && hiddenGame.game_length_seconds !== undefined && runeIconsReady ? (
          <>
            {/* Mapping over the players and generating rows for blue and red teams */}
            <tr className="game-patch">
              <td colSpan="3" style={{ textAlign: 'center' }} className="game-patch">
                <span className="nes-text is-primary">  <span className="game-patch-emoji">🛠️</span> Patch: {hiddenGame.game_patch} </span>
              </td>
            </tr>
            <tr className="game-length">
              <td colSpan="3" style={{ textAlign: 'center' }} className="game-patch">
                <span className="nes-text is-primary"> <span className="game-length-emoji">⌛</span>Game Length: {formatGameDuration(hiddenGame.game_length_seconds)} </span>
              </td>
            </tr>
            {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                    <td>
                        {/* For blue team (index 0-4) */}
                        {hiddenPlayers[index] && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                                  src={championIconBaseURL + hiddenPlayers[index].champion_name + ".png"}
                                  alt={hiddenPlayers[index].champion_name}
                                  className="champion-container"
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '4px' }}>  
                              <img
                                  src={runeIconDict[hiddenPlayers[index].primary_rune]}
                                  alt={hiddenPlayers[index].primary_rune}
                                  className="rune-container"
                              />
                              <img
                                  src={runeIconDict[hiddenPlayers[index].secondary_rune]}
                                  alt={hiddenPlayers[index].secondary_rune}
                                  className="rune-container nes-filter"
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '4px' }}>  
                              <img
                                  src={summonerBaseURL + hiddenPlayers[index].spell1 + ".png" }
                                  alt={hiddenPlayers[index].spell1}
                                  className="spell-container"
                              />
                              <img
                                  src={summonerBaseURL + hiddenPlayers[index].spell2 + ".png" }
                                  alt={hiddenPlayers[index].spell2}
                                  className="spell-container"
                              />
                            </div>
                          </div>
                        )}
                    </td>

                    {/* VS goes in the middle row */}
                    <td style={{ textAlign: 'center' }}>
                        {index === middleIndex ? (
                            <span className="vs-text nes-text is-warning">VS</span>
                        ) : (
                            <span>&nbsp;</span> // empty space to keep alignment
                        )}
                    </td>

                    <td>
                        {/* For red team (index 5-9) */}
                        {hiddenPlayers[index + 5] && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '4px' }}>  
                              <img
                                  src={summonerBaseURL + hiddenPlayers[index+5].spell1 + ".png" }
                                  alt={hiddenPlayers[index+5].spell1}
                                  className="spell-container"
                              />
                              <img
                                  src={summonerBaseURL + hiddenPlayers[index+5].spell2 + ".png" }
                                  alt={hiddenPlayers[index+5].spell2}
                                  className="spell-container"
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '4px' }}> 
                              <img
                                  src={runeIconDict[hiddenPlayers[index+5].primary_rune]}
                                  alt={hiddenPlayers[index+5].primary_rune}
                                  className="rune-container"
                              />
                              <img
                                  src={runeIconDict[hiddenPlayers[index+5].secondary_rune]}
                                  alt={hiddenPlayers[index+5].secondary_rune}
                                  className="rune-container"
                              />
                            </div>
                            <img
                              src={championIconBaseURL + hiddenPlayers[index+5].champion_name + ".png"}
                              alt={hiddenPlayers[index + 5].champion_name}
                              className="champion-container nes-filter"
                            />
                          </div>
                        )}
                    </td>
                </tr>
            ))}
          </>
        ) : null}

        {/* Buttons row */}
        <tr>
          <td>
            <button type="button" className="nes-btn is-primary" onClick={() => submitPrediction(1)}>
              Blue Wins
            </button>
          </td>
          <td></td>
          <td>
            <button type="button" className="nes-btn is-error" onClick={() => submitPrediction(0)}>
              Red Wins
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default Game;
