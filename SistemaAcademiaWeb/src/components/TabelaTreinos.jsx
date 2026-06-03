import React from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";

export default function TabelaTreinos({ treinos, onCriar, onEditar, onDeletar }) {
  return (
    <div className="students-section">
      <div className="section-header">
        <h2>Treinos</h2>
        <button className="btn-primary" onClick={onCriar}>
          <Plus size={18} /> Novo Treino
        </button>
      </div>

      <div className="table-responsive">
        <table className="students-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Aluno</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {treinos.map((treino) => (
              <tr key={treino.id}>
                <td style={{ fontWeight: "500", color: "var(--text-h)" }}>
                  {treino.nome}
                </td>
                <td>{treino.descricao}</td>
                <td>{treino.alunoNome}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon edit"
                      title="Editar"
                      onClick={() => onEditar(treino)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      title="Excluir"
                      onClick={() => onDeletar(treino.id)}
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
