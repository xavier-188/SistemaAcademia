import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "../services/api";

export default function CadastroTreino({
  aberto,
  fechar,
  itemEditando,
  alunos,
  onSalvar,
}) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    alunoId: "",
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setErro("");
      setFormData({
        nome: itemEditando?.nome || "",
        descricao: itemEditando?.descricao || "",
        alunoId:
          itemEditando?.alunoId !== undefined
            ? String(itemEditando.alunoId)
            : alunos.length > 0
              ? String(alunos[0].id)
              : "",
      });
    }
  }, [aberto, itemEditando, alunos]);

  if (!aberto) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    const payload = {
      nome: formData.nome,
      descricao: formData.descricao,
      alunoId: parseInt(formData.alunoId, 10),
    };

    try {
      if (itemEditando) {
        await api.put(`/Treinos/${itemEditando.id}`, payload);
      } else {
        await api.post("/Treinos", payload);
      }
      onSalvar();
      fechar();
    } catch (err) {
      console.error(err);
      setErro(
        err?.response?.data?.mensagem ||
          "Erro ao salvar treino. Por favor, tente novamente.",
      );
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>{itemEditando ? "Editar Treino" : "Novo Treino"}</h3>
            <button
              className="btn-icon"
              onClick={fechar}
              style={{ border: "none" }}
            >
              <X size={20} />
            </button>
          </div>

          {erro && (
            <div className="error-msg" style={{ marginBottom: "0" }}>
              {erro}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                required
                className="form-control"
                placeholder="Nome do treino"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                required
                className="form-control"
                placeholder="Descreva o treino"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="aluno">Aluno</label>
              <select
                id="aluno"
                required
                className="form-control"
                value={formData.alunoId}
                onChange={(e) =>
                  setFormData({ ...formData, alunoId: e.target.value })
                }
              >
                {alunos.length === 0 ? (
                  <option value="" disabled>
                    Nenhum aluno cadastrado
                  </option>
                ) : (
                  alunos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={fechar}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
