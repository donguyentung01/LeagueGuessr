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
        <h3 className="nes-text is-warning"> What’s this game? </h3>
        <p className='nes-text'> Guess the outcome of an ARAM game based on draft, runes, spells, and more!</p>
        <p className='nes-text'> Currently, <span className='nes-text is-primary'>AramGuess</span> has had <span className='nes-text is-success'> 10,000+ players </span> and <span className='nes-text is-success'> 100,000+ guesses </span> made.</p>
        <h3 className="nes-text is-warning"> Social links </h3>
        <p>
          <div>
          <i class="nes-icon twitch is-small"></i> &nbsp;
          <a 
            className='nes-text' 
            href="https://www.twitch.tv/caedrel/clip/CoyBoringPterodactylGingerPower-DvceWTwpsh5ivYf3"
            target="_blank" 
            rel="noopener noreferrer"> 
              Caedrel (1 million+ subs streamer) plays ARAM Guess!
          </a>
          </div>
          <div>
          <i class="nes-icon reddit is-small"></i> &nbsp;
          <a 
            className='nes-text' 
            href="https://www.reddit.com/r/ARAM/comments/1kqn8r8/i_pulled_data_from_10000_aram_matches_in_euw_and/"
            target="_blank" 
            rel="noopener noreferrer">
            r/ARAM 
          </a>
          </div>
          <div>
          <i class="nes-icon reddit is-small"></i> &nbsp;
          <a 
            className='nes-text' 
            href="https://www.reddit.com/r/leagueoflegends/comments/1l3k8dh/i_pulled_data_from_10000_aram_matches_in_euw_and/"
            target="_blank" 
            rel="noopener noreferrer">
            r/leagueoflegends
          </a>
          </div>
        </p>
        <h3 className="nes-text is-warning"> Reviews </h3>
        <p>
          <div>
            <span className="nes-text is-success">u/GratefulChungus</span>:
            <a
              className="nes-text is-primary"
              href="https://www.reddit.com/r/ARAM/comments/1kqn8r8/comment/mt6xgb4/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
              target="_blank"
              rel="noopener noreferrer"
            >
              "This is cool, thanks for putting the time into it!"
            </a>
          </div>
          <br />
          <div>
            <span className="nes-text is-success">u/Kansleren</span>:
            <a
              className="nes-text is-primary"
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
            <span className="nes-text is-success">u/metrokaiv</span>:
            <a
              className="nes-text is-primary"
              href="https://www.reddit.com/r/ARAM/comments/1kqn8r8/comment/mt6vufn/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
              target="_blank"
              rel="noopener noreferrer"
            >
              "This is the kind of content we need in this community regardless of your region"
            </a>
          </div>
        </p>

        <h3 className="nes-text is-warning"> Feedback </h3>
        <p className="nes-text">
                <div>Wanna share an idea, bug, or just say hi? </div>
                <a 
                  className="nes-text is-primary" 
                  href="mailto:aramguess@gmail.com"
                >
                  <i class="nes-icon gmail is-small"></i> Send a message!
                </a>
        </p>  
        <menu className="dialog-menu">
          <button type="button" className="nes-btn" onClick={onClose}>Close</button>
        </menu>
      </form>
    </dialog>
  );
};

export default Stats;
