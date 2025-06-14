import React, { useEffect, useRef } from 'react';

const UserProfile = ({ isUserProfileOpen, onClose, username, recordScore, signOut }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isUserProfileOpen && modalRef.current) {
      modalRef.current.showModal();
    } else if (modalRef.current) {
      modalRef.current.close();
    }
  }, [isUserProfileOpen]);

  return (
    <dialog className="nes-dialog is-dark is-rounded" ref={modalRef}>
      <form method="dialog">
        <p>Hi, <strong className='nes-text is-primary'>{username}</strong></p>
        <p>Your record score for Ranked Games is <strong className='nes-text is-warning'>{recordScore[1]}</strong>.</p>
        <p>Your record score for ARAM Games is <strong className='nes-text is-warning'>{recordScore[0]}</strong>.</p>
        <menu className="dialog-menu">
          <button type="button" className="nes-btn" onClick={onClose}>Close</button>
          <button type="button" className="nes-btn is-error" onClick={signOut}>Sign Out</button>
        </menu>
      </form>
    </dialog>
  );
};

export default UserProfile;
