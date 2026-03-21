import { useState } from 'react';

export function useRewards() {
  const [stats] = useState({
    holdings: '124,500',
    earned: '4,200',
    claimable: '1,150',
    rank: '#492',
    streak: 12, // days
    multiplier: 1.5,
  });

  const [leaderboard] = useState([
    { id: 1, name: 'NeonSamurai', score: 120500, isUser: false },
    { id: 2, name: 'CyberQueen', score: 115200, isUser: false },
    { id: 3, name: 'GlitchPulse', score: 109000, isUser: false },
    { id: 4, name: 'You (Player_99)', score: 98400, isUser: true },
    { id: 5, name: 'VoidWalker', score: 85000, isUser: false },
  ]);

  const claimRewards = () => {
    console.log("Claiming rewards...");
  };

  return {
    stats,
    leaderboard,
    claimRewards,
  };
}
