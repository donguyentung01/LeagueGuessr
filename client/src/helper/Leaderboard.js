import React, { useState, useEffect, useRef } from 'react';
import '../css/Leaderboard.css';

const Leaderboard = ({ isLeaderboardOpen, onClose, LeaderboardList }) => {
  const modalRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isLeaderboardOpen && modalRef.current) {
      modalRef.current.showModal();
    } else if (modalRef.current) {
      modalRef.current.close();
    }
  }, [isLeaderboardOpen]);

  // Calculate the total pages
  const totalPages = Math.ceil(LeaderboardList.length / itemsPerPage);

  // Get the leaderboard entries for the current page
  const currentEntries = LeaderboardList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <dialog className="nes-dialog is-dark is-rounded leaderboard-dialog" ref={modalRef}>
      <table className="leaderboard">
        <thead>
          <tr>
            <th><span className="nes-text is-primary">Rank</span></th>
            <th><span className="nes-text is-primary">Player</span></th>
            <th><span className="nes-text is-primary">Record</span></th>
          </tr>
        </thead>
        <tbody>
          {currentEntries.map((entry, index) => (
            <tr key={index}>
              <td className={index + 1 + (currentPage - 1) * itemsPerPage <= 5 ? 'nes-text is-warning' : ''}>
                {index + 1 + (currentPage - 1) * itemsPerPage}
              </td>
              <td>{entry.username}</td>
              <td>{entry.record_score}<i className="nes-icon is-small star"></i></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          className="nes-btn is-primary"
          onClick={() => changePage(currentPage > 1 ? currentPage - 1 : 1)}
        >
          Prev
        </button>
        <span className="page-info">
          {currentPage} / {totalPages}
        </span>
        <button
          className="nes-btn is-primary"
          onClick={() => changePage(currentPage < totalPages ? currentPage + 1 : totalPages)}
        >
          Next
        </button>
      </div>

      <button type="button" className="nes-btn" onClick={onClose}>Close</button>
    </dialog>
  );
};

export default Leaderboard;
