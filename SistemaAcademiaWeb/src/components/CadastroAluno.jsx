import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "../services/api";

export default function CadastroAluno({
  aberto,
  fechar,
  itemEditando,
  planos,
  onSalvar,
}) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    planoId: "",
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setErro("");
      setFormData({
        nome: itemEditando?.nome || "",
        email: itemEditando?.email || "",
        telefone: itemEditando?.telefone || "",
        planoId:
          itemEditando?.planoId !== undefined
            ? String(itemEditando.planoId)
            : planos.length > 0
              ? String(planos[0].id)
              : "",
      });
    }
  }, [aberto, itemEditando, planos]);

  if (!aberto) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    // Validações herdadas do original
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErro("Por favor, informe um e-mail em formato válido.");
      return;
    }

    const apenasNumeros = formData.telefone.replace(/\D/g, "");
    if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
      setErro("O telefone deve ter 10 ou 11 dígitos numéricos (com DDD).");
      return;
    }

    const payload = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      planoId: parseInt(formData.planoId, 10),
    };

    try {
      if (itemEditando) {
        await api.put(`/Alunos/${itemEditando.id}`, payload);
      } else {
        await api.post("/Alunos", payload);
      }
      onSalvar();
      fechar();
    } catch (err) {
      console.error(err);
      setErro(
        err?.response?.data?.mensagem ||
          "Erro ao salvar aluno. Por favor, tente novamente.",
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
            <h3>{itemEditando ? "Editar Aluno" : "Novo Aluno"}</h3>
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
                placeholder="Nome completo"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                required
                className="form-control"
                placeholder="exemplo@academia.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="tel"
                id="telefone"
                required
                className="form-control"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="plano">Plano</label>
              <select
                id="plano"
                required
                className="form-control"
                value={formData.planoId}
                onChange={(e) =>
                  setFormData({ ...formData, planoId: e.target.value })
                }
              >
                {planos.length === 0 ? (
                  <option value="" disabled>
                    Nenhum plano cadastrado
                  </option>
                ) : (
                  planos.map((plano) => (
                    <option key={plano.id} value={plano.id}>
                      {plano.nome} — R$ {plano.preco.toFixed(2)}
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
