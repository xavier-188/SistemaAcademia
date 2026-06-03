import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Importando os subcomponentes modulares recém-criados
import StatsCards from "./StatsCards";
import TabelaAlunos from "./TabelaAlunos";
import TabelaPlanos from "./TabelaPlanos";
import TabelaTreinos from "./TabelaTreinos";
import CadastroAluno from "./CadastroAluno";
import CadastroPlano from "./CadastroPlano";
import CadastroTreino from "./CadastroTreino";
import LoginRegistro from "./LoginRegistro";

import "./DashboardAlunos.css";

export default function DashboardAlunos() {
  // --- ESTADOS GERAIS ---
  const [alunos, setAlunos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [totalTreinos, setTotalTreinos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const { autenticado, logout } = useAuth();

  // --- ESTADOS DO CONTROLE DOS MODAIS DE CADASTRO/EDIÇÃO ---
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTipo, setModalTipo] = useState(""); // "aluno", "plano" ou "treino"
  const [itemEditando, setItemEditando] = useState(null);

  // --- LOGOUT ---
  const handleLogout = () => {
    logout();
    setAlunos([]);
    setPlanos([]);
    setTreinos([]);
    setTotalTreinos(0);
    setLoading(false);
  };

  // --- BUSCA DE DADOS NA API ---
  const carregarDados = async () => {
    setLoading(true);
    setErro("");
    try {
      const [alunosRes, planosRes, treinosRes] = await Promise.all([
        api.get("/Alunos"),
        api.get("/Planos"),
        api.get("/Treinos"),
      ]);

      setAlunos(alunosRes.data);
      setPlanos(planosRes.data);
      setTreinos(treinosRes.data);
      setTotalTreinos(treinosRes.data.length);
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setErro("Sessão expirada ou não autorizada. Faça login novamente.");
        handleLogout();
      } else {
        setErro(
          "Erro ao carregar dados. Por favor, tente novamente mais tarde.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      carregarDados();
    } else {
      setLoading(false);
    }
  }, [autenticado]);

  // --- DELETAR REGISTROS ---
  const handleDeletarAluno = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este aluno?")) return;

    try {
      await api.delete(`/Alunos/${id}`);
      setAlunos(alunos.filter((aluno) => aluno.id !== id));
      setTreinos(treinos.filter((treino) => treino.alunoId !== id));
      setTotalTreinos((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar aluno. Por favor, tente novamente.");
    }
  };

  const handleDeletarPlano = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este plano?")) return;

    try {
      await api.delete(`/Planos/${id}`);
      setPlanos(planos.filter((plano) => plano.id !== id));
    } catch (err) {
      console.error(err);
      const mensagem =
        err?.response?.data?.mensagem ||
        "Erro ao deletar plano. Por favor, tente novamente.";
      alert(mensagem);
    }
  };

  const handleDeletarTreino = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este treino?")) return;

    try {
      await api.delete(`/Treinos/${id}`);
      setTreinos(treinos.filter((treino) => treino.id !== id));
      setTotalTreinos((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar treino. Por favor, tente novamente.");
    }
  };

  // --- CONTROLE DE ABERTURA E FECHAMENTO DOS MODAIS ---
  const abrirModalCriar = (tipo) => {
    setModalTipo(tipo);
    setItemEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (tipo, item) => {
    setModalTipo(tipo);
    setItemEditando(item);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalTipo("");
    setItemEditando(null);
  };

  // --- RENDER DA TELA DE LOGIN/REGISTRO SE NÃO AUTENTICADO ---
  if (!autenticado) {
    return <LoginRegistro onSuccess={carregarDados} />;
  }

  return (
    <div className="dashboard-container">
      {/* Botão de Logout no Topo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="dashboard-header" style={{ flexGrow: 1 }}>
          <h1>Dashboard & Alunos</h1>
          <p>Olá Gerente! Gerencie os indicadores gerais e a ficha de alunos matriculados.</p>
        </div>
        <button className="btn-secondary" onClick={handleLogout} style={{ height: "fit-content" }}>
          Sair do Sistema
        </button>
      </div>

      {/* 1. Indicadores do Dashboard */}
      <StatsCards
        alunosCount={alunos.length}
        planosCount={planos.length}
        treinosCount={totalTreinos}
      />

      {/* 2. Tabela de Alunos */}
      <TabelaAlunos
        alunos={alunos}
        loading={loading}
        erro={erro}
        carregarDados={carregarDados}
        onCriar={() => abrirModalCriar("aluno")}
        onEditar={(aluno) => abrirModalEditar("aluno", aluno)}
        onDeletar={handleDeletarAluno}
      />

      {/* 3. Tabela de Planos */}
      <TabelaPlanos
        planos={planos}
        onCriar={() => abrirModalCriar("plano")}
        onEditar={(plano) => abrirModalEditar("plano", plano)}
        onDeletar={handleDeletarPlano}
      />

      {/* 4. Tabela de Treinos */}
      <TabelaTreinos
        treinos={treinos}
        onCriar={() => abrirModalCriar("treino")}
        onEditar={(treino) => abrirModalEditar("treino", treino)}
        onDeletar={handleDeletarTreino}
      />

      {/* Modais de Cadastro e Edição (De acordo com o tipo selecionado) */}
      <CadastroAluno
        aberto={modalAberto && modalTipo === "aluno"}
        fechar={fecharModal}
        itemEditando={itemEditando}
        planos={planos}
        onSalvar={carregarDados}
      />

      <CadastroPlano
        aberto={modalAberto && modalTipo === "plano"}
        fechar={fecharModal}
        itemEditando={itemEditando}
        onSalvar={carregarDados}
      />

      <CadastroTreino
        aberto={modalAberto && modalTipo === "treino"}
        fechar={fecharModal}
        itemEditando={itemEditando}
        alunos={alunos}
        onSalvar={carregarDados}
      />
    </div>
  );
}
