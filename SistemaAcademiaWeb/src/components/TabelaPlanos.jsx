import React from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";

export default function TabelaPlanos({ planos, onCriar, onEditar, onDeletar }) {
  return (
    <div className="students-section">
      <div className="section-header">
        <h2>Planos</h2>
        <button className="btn-primary" onClick={onCriar}>
          <Plus size={18} /> Novo Plano
        </button>
      </div>

      <div className="table-responsive">
        <table className="students-table">
          <thead>
            <tr>
              <th>Nome do Plano</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {planos.map((plano) => (
              <tr key={plano.id}>
                <td style={{ fontWeight: "500", color: "var(--text-h)" }}>
                  {plano.nome}
                </td>
                <td>R$ {plano.preco.toFixed(2)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon edit"
                      title="Editar"
                      onClick={() => onEditar(plano)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      title="Excluir"
                      onClick={() => onDeletar(plano.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
