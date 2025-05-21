import React, { useEffect, useRef } from 'react';
import '../css/ResultModal.css';

function ResultModal({ onNextQuestion, isCorrect, gamePlayers, runeIconDict, hiddenGame, prediction }) {
  const modalRef = useRef(null);
  const actualWinner = isCorrect ? prediction : 1 - prediction;
  const winnerText = actualWinner === 0 ? 'Red Team Wins' : 'Blue Team Wins';

  useEffect(() => {
    if (modalRef.current) {
      if (isCorrect !== null) {
        modalRef.current.showModal();
      } else {
        modalRef.current.close();
      }
    }
  }, [isCorrect]);

  const version = `${hiddenGame.game_patch}.1`;
  const CHAMPION_IMG_BASE = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/`;
  const SPELL_IMG_BASE = `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/`;
  const ITEM_IMG_BASE = `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/`;

  const blueTeamPlayers = gamePlayers.filter(p => p.team === 'blue');
  const redTeamPlayers = gamePlayers.filter(p => p.team === 'red');

  const maxDamageDealt = Math.max(...gamePlayers.map(p => p.damage_dealt));
  const maxDamageTaken = Math.max(...gamePlayers.map(p => p.damage_taken));

  const renderRow = (p, index, team) => {
    const dmgDealtPercent = Math.round((p.damage_dealt / maxDamageDealt) * 100);
    const dmgTakenPercent = Math.round((p.damage_taken / maxDamageTaken) * 100);
    const barClass = team === 'blue' ? 'is-primary' : 'is-error';

    return (
      <tr key={`${team}-${index}`} className={`${team}-team-row`}>
        <td>
          <div className="result-champion-cell">
            <img
              src={`${CHAMPION_IMG_BASE}${p.champion_name}.png`}
              alt={p.champion_name}
              className="result-champion-img"
            />
            <div className="result-rune-column">
              <img
                src={runeIconDict[p.primary_rune]}
                alt={p.primary_rune}
                className="result-rune-img"
              />
              <img
                src={runeIconDict[p.secondary_rune]}
                alt={p.secondary_rune}
                className="result-rune-img nes-filter"
              />
            </div>
            <div className="result-spell-column">
              <img
                src={`${SPELL_IMG_BASE}${p.spell1}.png`}
                alt={p.spell1}
                className="result-spell-img"
              />
              <img
                src={`${SPELL_IMG_BASE}${p.spell2}.png`}
                alt={p.spell2}
                className="result-spell-img"
              />
              
            </div>
            <div className="result-summoner-name-column">
              <span className="summoner-name-text">{p.summoner_name}</span>
            </div>
          </div>
        </td>
        <td className="kda-text">{`${p.kills}/${p.deaths}/${p.assists}`}</td>
        <td>
          {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].map((itemId, i) =>
            itemId > 0 ? (
              <img
                key={i}
                src={`${ITEM_IMG_BASE}${itemId}.png`}
                alt={`Item ${itemId}`}
                className="result-item-img"
              />
            ) : (
              <span key={i} className="result-item-placeholder" />
            )
          )}
        </td>
        <td>
          <div className="progress-cell">
            <div className="progress-value">{p.damage_dealt.toLocaleString()}</div>
            <progress className={`nes-progress ${barClass}`} value={dmgDealtPercent} max="100"></progress>
          </div>
        </td>
        <td>
          <div className="progress-cell">
            <div className="progress-value">{p.damage_taken.toLocaleString()}</div>
            <progress className={`nes-progress ${barClass}`} value={dmgTakenPercent} max="100"></progress>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <dialog className="nes-dialog is-dark is-rounded" ref={modalRef}>
      <form method="dialog">
        <p className={`guess-correct nes-text ${isCorrect === true ? 'is-success' : isCorrect === false ? 'is-error' : ''}`} style={{ textAlign: 'center' }}>
          {isCorrect === true && "Your guess is correct! 🎉"}
          {isCorrect === false && "Your guess is incorrect."}
        </p>
        <h3 className={`winner-text nes-text ${actualWinner === 0 ? 'is-error' : 'is-primary'}`} style={{ textAlign: 'center' }}>{winnerText}</h3>
        <div className="result-table-container">
          <table className="nes-table is-bordered is-centered is-dark result-table">
            <thead>
              <tr>
                <th>Champion</th>
                <th>K/D/A</th>
                <th>Items</th>
                <th>Damage Dealt</th>
                <th>Damage Taken</th>
              </tr>
            </thead>
            <tbody>
              {blueTeamPlayers.map((p, index) => renderRow(p, index, 'blue'))}
              <tr className="team-separator-row"><td colSpan="5"></td></tr>
              {redTeamPlayers.map((p, index) => renderRow(p, index, 'red'))}
            </tbody>
          </table>
        </div>

        <menu className="dialog-menu">
          <button type="button" className="nes-btn is-primary" onClick={onNextQuestion}>
            Next Question
          </button>
        </menu>
      </form>
    </dialog>
  );
}

export default ResultModal;

