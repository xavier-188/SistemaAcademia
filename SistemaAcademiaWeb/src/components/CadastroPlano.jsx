import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "../services/api";

export default function CadastroPlano({
  aberto,
  fechar,
  itemEditando,
  onSalvar,
}) {
  const [formData, setFormData] = useState({
    nome: "",
    preco: "",
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setErro("");
      setFormData({
        nome: itemEditando?.nome || "",
        preco: itemEditando?.preco !== undefined ? String(itemEditando.preco) : "",
      });
    }
  }, [aberto, itemEditando]);

  if (!aberto) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    const preco = parseFloat(formData.preco.replace(",", "."));
    if (Number.isNaN(preco) || preco <= 0) {
      setErro("Preço inválido. Informe um valor numérico maior que zero.");
      return;
    }

    const payload = {
      nome: formData.nome,
      preco,
    };

    try {
      if (itemEditando) {
        await api.put(`/Planos/${itemEditando.id}`, payload);
      } else {
        await api.post("/Planos", payload);
      }
      onSalvar();
      fechar();
    } catch (err) {
      console.error(err);
      setErro(
        err?.response?.data?.mensagem ||
          "Erro ao salvar plano. Por favor, tente novamente.",
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
            <h3>{itemEditando ? "Editar Plano" : "Novo Plano"}</h3>
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
                placeholder="Nome do plano"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="preco">Preço</label>
              <input
                type="text"
                id="preco"
                required
                className="form-control"
                placeholder="99.90"
                value={formData.preco}
                onChange={(e) =>
                  setFormData({ ...formData, preco: e.target.value })
                }
              />
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
