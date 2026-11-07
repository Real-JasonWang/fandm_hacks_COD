import React from 'react';
import type { TabType } from '../types';

interface AppleBottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenCheckIn: () => void;
}

export const AppleBottomNav: React.FC<AppleBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenCheckIn,
}) => {
  return (
    <nav className="apple-nav" aria-label="Main Navigation">
      <div className="apple-navin">
        <button
          className={`apple-nb ${activeTab === 'today' ? 'on' : ''}`}
          onClick={() => onChangeTab('today')}
        >
          <span>🏠</span>
          Today
        </button>

        <button
          className={`apple-nb ${activeTab === 'insights' ? 'on' : ''}`}
          onClick={() => onChangeTab('insights')}
        >
          <span>✨</span>
          Insights
        </button>

        <button
          className="apple-plus"
          onClick={onOpenCheckIn}
          aria-label="New Check-in"
        >
          +
        </button>

        <button
          className={`apple-nb ${activeTab === 'map' ? 'on' : ''}`}
          onClick={() => onChangeTab('map')}
        >
          <span>🧽</span>
          Reports
        </button>

        <button
          className={`apple-nb ${activeTab === 'house' ? 'on' : ''}`}
          onClick={() => onChangeTab('house')}
        >
          <span>🏆</span>
          House
        </button>
      </div>
    </nav>
  );
};
