import React, { useEffect, useRef } from 'react';
import '../css/Stats.css';

const Stats = ({ isStatsOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isStatsOpen && modalRef.current) {
      modalRef.current.showModal();
    } else if (modalRef.current) {
      modalRef.current.close();
    }
  }, [isStatsOpen]);

  return (
    <dialog className="nes-dialog is-dark is-rounded stats" ref={modalRef}>
      <form method="dialog">
        <h3 className="nes-text is-warning"> About the game </h3>
        <p className='nes-text'> Guess the outcome of an ARAM game based on draft, runes, spells, and more!</p>
        <h3 className="nes-text is-warning"> Social links </h3>
        <i class="nes-icon reddit is-small"></i> <a className='nes-text' href="https://www.reddit.com/r/ARAM/comments/1kqn8r8/i_pulled_data_from_10000_aram_matches_in_euw_and/"> r/ARAM </a>
        <h3 className="nes-text is-warning"> Reviews </h3>
        <div>
          <div>
            <span className="nes-text is-primary">GratefulChungus</span>: 
            <a
              className="nes-text is-success"
              href="https://www.reddit.com/r/ARAM/comments/1kqn8r8/comment/mt6xgb4/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
              target="_blank"
              rel="noopener noreferrer"
            >
              "This is cool, thanks for putting the time into it!"
            </a>
          </div>
          <br />
          <div>
            <span className="nes-text is-primary">Kansleren</span>: 
            <a
              className="nes-text is-success"
              href="https://www.reddit.com/r/ARAM/comments/1kqn8r8/comment/mt6vld6/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
              target="_blank"
              rel="noopener noreferrer"
            >
              "This was f genius.
              Great stuff! Your a credit to our community, and your ancestors!"
            </a>
          </div>
          <br />
          <div>
            <span className="nes-text is-primary">metrokaiv</span>: 
            <a
              className="nes-text is-success"
              href="https://www.reddit.com/r/ARAM/comments/1kqn8r8/comment/mt6vufn/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
              target="_blank"
              rel="noopener noreferrer"
            >
              "This is the kind of content we need in this community regardless of your region"
            </a>
          </div>
        </div>
        <menu className="dialog-menu">
          <button type="button" className="nes-btn" onClick={onClose}>Close</button>
        </menu>
      </form>
    </dialog>
  );
};

export default Stats;
