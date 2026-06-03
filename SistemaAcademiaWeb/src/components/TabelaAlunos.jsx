import React, { useState } from "react";
import { Plus, Edit3, Trash2, Loader2 } from "lucide-react";

export default function TabelaAlunos({
  alunos,
  loading,
  erro,
  carregarDados,
  onCriar,
  onEditar,
  onDeletar,
}) {
  const [busca, setBusca] = useState("");

  const alunosFiltrados = alunos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="students-section">
      <div className="section-header">
        <h2>Alunos Matriculados</h2>

        <div className="controls">
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Pesquisar aluno..."
              className="search-input"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={onCriar}>
            <Plus size={18} /> Novo Aluno
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <Loader2
            className="animate-spin"
            size={24}
            style={{ margin: "0 auto 8px" }}
          />
          <p>Carregando registros da academia...</p>
        </div>
      ) : erro ? (
        <div className="error-msg">
          <p>{erro}</p>
          <button
            className="btn-secondary"
            onClick={carregarDados}
            style={{ marginTop: "12px" }}
          >
            Tentar Novamente
          </button>
        </div>
      ) : alunosFiltrados.length === 0 ? (
        <div className="empty-msg">
          <p>Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="students-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Plano</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunosFiltrados.map((aluno) => (
                <tr key={aluno.id}>
                  <td style={{ fontWeight: "500", color: "var(--text-h)" }}>
                    {aluno.nome}
                  </td>
                  <td>{aluno.email}</td>
                  <td>{aluno.telefone}</td>
                  <td>
                    <span className="plan-badge">{aluno.planoNome}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        title="Editar"
                        onClick={() => onEditar(aluno)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        title="Excluir"
                        onClick={() => onDeletar(aluno.id)}
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
      )}
    </div>
  );
}
