import React, { useState, useEffect, useRef } from 'react';
import '../css/Leaderboard.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Leaderboard = ({ isLeaderboardOpen, onClose, LeaderboardList, setLeaderboardList }) => {
  const modalRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔸 Track leaderboard queue: 420 = Ranked, 450 = ARAM
  const [leaderboardQueue, setLeaderboardQueue] = useState(420);

  useEffect(() => {
    if (isLeaderboardOpen && modalRef.current) {
      modalRef.current.showModal();
    } else if (modalRef.current) {
      modalRef.current.close();
    }
  }, [isLeaderboardOpen]);

  const fetchLeaderboard = async (queue) => {
    try {
      const response = await fetch(`${apiUrl}/leaderboard?limit=50&queue=${queue}`);
      const data = await response.json();
      if (response.ok) {
        setLeaderboardList(data);
        setCurrentPage(1); // reset to first page
      } else {
        console.error("Failed to fetch leaderboard", data);
      }
    } catch (error) {
      console.error("Network error", error);
    }
  };

  // 🔸 Refetch when the modal opens or queue changes
  useEffect(() => {
    if (isLeaderboardOpen) {
      fetchLeaderboard(leaderboardQueue);
    }
  }, [isLeaderboardOpen, leaderboardQueue]);

  const totalPages = Math.ceil(LeaderboardList.length / itemsPerPage);
  const currentEntries = LeaderboardList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const changePage = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <dialog className="nes-dialog is-dark is-rounded leaderboard-dialog" ref={modalRef}>
      {/* 🔸 Queue toggle buttons */}
      <div className="queue-toggle">
        <button
          className={`nes-btn ${leaderboardQueue === 420 ? 'is-warning' : ''}`}
          onClick={() => setLeaderboardQueue(420)}
        >
          Ranked
        </button>
        <button
          className={`nes-btn ${leaderboardQueue === 450 ? 'is-warning' : ''}`}
          onClick={() => setLeaderboardQueue(450)}
        >
          ARAM
        </button>
      </div>

      {/* Leaderboard table */}
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
              <td>{entry.username.length > 15 ? entry.username.slice(0, 15) + '…' : entry.username}</td>
              <td>
                {leaderboardQueue === 420 ? entry.record_score_ranked : entry.record_score}
                <i className="nes-icon is-small star"></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button className="nes-btn is-primary" onClick={() => changePage(Math.max(currentPage - 1, 1))}>
          Prev
        </button>
        <span className="page-info">{currentPage} / {totalPages}</span>
        <button className="nes-btn is-primary" onClick={() => changePage(Math.min(currentPage + 1, totalPages))}>
          Next
        </button>
      </div>

      <button type="button" className="nes-btn" onClick={onClose}>Close</button>
    </dialog>
  );
};

export default Leaderboard;
