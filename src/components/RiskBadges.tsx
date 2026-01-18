import React from "react";
import type { Risk } from "../lib/schemas";

interface RiskBadgesProps {
  risks: Risk[];
}

export function RiskBadges({ risks }: RiskBadgesProps) {
  if (risks.length === 0) {
    return <p className="empty-message">No risks identified</p>;
  }

  const getBadgeClass = (level: Risk["level"]) => {
    switch (level) {
      case "high":
        return "risk-badge risk-high";
      case "medium":
        return "risk-badge risk-medium";
      case "low":
        return "risk-badge risk-low";
      default:
        return "risk-badge";
    }
  };

  return (
    <div className="risks-container">
      {risks.map((risk, index) => (
        <div key={index} className="risk-item">
          <span className={getBadgeClass(risk.level)}>
            {risk.level.toUpperCase()}
          </span>
          <span className="risk-text">{risk.item}</span>
        </div>
      ))}
    </div>
  );
}
