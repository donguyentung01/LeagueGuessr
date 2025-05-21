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
        <h4 className="nes-text is-warning"> About the game </h4>
        <p className='nes-text'> Guess the outcome of an ARAM game based on draft, runes, spells, and more!</p>
        <h4 className="nes-text is-warning"> Social links </h4>
        <i class="nes-icon reddit is-small"></i> <a className='nes-text' href="https://www.reddit.com/r/ARAM/comments/1kqn8r8/i_pulled_data_from_10000_aram_matches_in_euw_and/" > r/ARAM </a>
        <menu className="dialog-menu">
          <button type="button" className="nes-btn" onClick={onClose}>Close</button>
        </menu>
      </form>
    </dialog>
  );
};

export default Stats;
