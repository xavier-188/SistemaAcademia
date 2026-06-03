import React from "react";
import { Users, Award, Activity } from "lucide-react";

export default function StatsCards({ alunosCount, planosCount, treinosCount }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <Users size={24} />
        </div>
        <div className="stat-info">
          <h3>Total Alunos</h3>
          <p>{alunosCount}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <Award size={24} />
        </div>
        <div className="stat-info">
          <h3>Planos Disponíveis</h3>
          <p>{planosCount}</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <Activity size={24} />
        </div>
        <div className="stat-info">
          <h3>Total Treinos</h3>
          <p>{treinosCount}</p>
        </div>
      </div>
    </div>
  );
}
