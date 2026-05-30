import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Award,
  Activity,
  Plus,
  Trash2,
  Edit3,
  X,
  Loader2,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./DashboardAlunos.css";

export default function DashboardAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [totalTreinos, setTotalTreinos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const { autenticado, login: fazerLogin, logout } = useAuth();

  // Controle da tela de Login/Registro
  const [isModoLogin, setIsModoLogin] = useState(true);

  // Campos de Registro
  const [nomeRegistro, setNomeRegistro] = useState("");
  const [loginRegistro, setLoginRegistro] = useState("");
  const [senhaRegistro, setSenhaRegistro] = useState("");
  const [confirmarSenhaRegistro, setConfirmarSenhaRegistro] = useState(""); // <-- ADICIONE ESTA LINHA

  // busca e filtro
  const [busca, setBusca] = useState("");

  // Modal cadastro
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTipo, setModalTipo] = useState("");
  const [itemEditando, setItemEditando] = useState(null);
  const [modalErro, setModalErro] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    planoId: "",
    preco: "",
    descricao: "",
    alunoId: "",
  });

  const handleLogout = () => {
    logout();
    setAlunos([]);
    setPlanos([]);
    setTreinos([]);
    setTotalTreinos(0);
    setLoading(false);
  };

  const carregarDados = async () => {
    setLoading(true);
    setErro("");
    try {
      // fazendo requisicao para buscar alunos planos e treinos
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
  }, []);

  // funções de ação
  const handleDeletarAluno = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este aluno?")) return;

    try {
      await api.delete(`/Alunos/${id}`);
      setAlunos(alunos.filter((aluno) => aluno.id !== id));
      setTreinos(treinos.filter((treino) => treino.alunoId !== id));
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

  const abrirModalCriar = (tipo) => {
    setModalTipo(tipo);
    setItemEditando(null);
    setModalErro("");
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      planoId: tipo === "aluno" && planos.length > 0 ? planos[0].id : "",
      preco: "",
      descricao: "",
      alunoId: tipo === "treino" && alunos.length > 0 ? alunos[0].id : "",
    });
    setModalAberto(true);
  };

  const abrirModalEditar = (tipo, item) => {
    setModalTipo(tipo);
    setItemEditando(item);
    setModalErro("");
    setFormData({
      nome: item.nome || "",
      email: item.email || "",
      telefone: item.telefone || "",
      planoId:
        item.planoId !== undefined
          ? String(item.planoId)
          : planos.length > 0
            ? String(planos[0].id)
            : "",
      preco: item.preco !== undefined ? String(item.preco) : "",
      descricao: item.descricao || "",
      alunoId:
        item.alunoId !== undefined
          ? String(item.alunoId)
          : alunos.length > 0
            ? String(alunos[0].id)
            : "",
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setModalTipo("");
    setItemEditando(null);
    setModalErro("");
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setModalErro("");

    try {
      if (modalTipo === "aluno") {
        // --- VALIDAÇÕES REACT: E-MAIL E TELEFONE ---
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setModalErro("Por favor, informe um e-mail em formato válido.");
          return;
        }

        const apenasNumeros = formData.telefone.replace(/\D/g, "");
        if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
          setModalErro(
            "O telefone deve ter 10 ou 11 dígitos numéricos (com DDD).",
          );
          return;
        }
        // -------------------------------------------

        const payload = {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          planoId: parseInt(formData.planoId, 10),
        };

        if (itemEditando) {
          await api.put(`/Alunos/${itemEditando.id}`, payload);
        } else {
          await api.post("/Alunos", payload);
        }
      }

      if (modalTipo === "plano") {
        const preco = parseFloat(formData.preco.replace(",", "."));

        // --- VALIDAÇÕES REACT: PREÇO VÁLIDO E POSITIVO ---
        if (Number.isNaN(preco) || preco <= 0) {
          setModalErro(
            "Preço inválido. Informe um valor numérico maior que zero.",
          );
          return;
        }
        // -------------------------------------------------

        const payload = {
          nome: formData.nome,
          preco,
        };

        if (itemEditando) {
          await api.put(`/Planos/${itemEditando.id}`, payload);
        } else {
          await api.post("/Planos", payload);
        }
      }

      if (modalTipo === "treino") {
        const payload = {
          nome: formData.nome,
          descricao: formData.descricao,
          alunoId: parseInt(formData.alunoId, 10),
        };

        if (itemEditando) {
          await api.put(`/Treinos/${itemEditando.id}`, payload);
        } else {
          await api.post("/Treinos", payload);
        }
      }

      fecharModal();
      carregarDados();
    } catch (err) {
      console.error(err);
      const mensagem =
        err?.response?.data?.mensagem ||
        "Erro ao salvar. Por favor, tente novamente.";
      setModalErro(mensagem);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await api.post("/Auth/login", {
        login,
        senha,
      });

      fazerLogin(response.data.token);
      setLogin("");
      setSenha("");
      carregarDados();
    } catch (err) {
      console.error(err);
      const mensagem =
        err?.response?.data?.mensagem ||
        "Erro ao fazer login. Verifique suas credenciais.";
      setErro(mensagem);
      setLoading(false);
    }
  };

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    // --- VALIDAÇÕES REACT: TAMANHO E CONFIRMAÇÃO DE SENHA ---
    if (senhaRegistro.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    if (senhaRegistro !== confirmarSenhaRegistro) {
      setErro("As senhas não coincidem. Tente novamente.");
      setLoading(false);
      return;
    }
    // --------------------------------------------------------

    try {
      await api.post("/Auth/registrar", {
        nome: nomeRegistro,
        login: loginRegistro,
        senha: senhaRegistro,
        confirmarSenha: confirmarSenhaRegistro, // <-- ENVIANDO PARA A API
      });

      alert("Cadastro realizado com sucesso! Agora você pode fazer login.");

      // Limpa os campos e volta para a tela de login
      setNomeRegistro("");
      setLoginRegistro("");
      setSenhaRegistro("");
      setConfirmarSenhaRegistro(""); // <-- LIMPA O NOVO CAMPO
      setIsModoLogin(true);
    } catch (err) {
      console.error(err);
      const mensagem =
        err?.response?.data?.mensagem ||
        "Erro ao registrar usuário. Verifique os dados fornecidos.";
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const alunosFiltrados = alunos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.email.toLowerCase().includes(busca.toLowerCase()),
  );

  if (!autenticado) {
    return (
      <main className="dashboard-container">
        <header className="dashboard-header">
          <h1>
            {isModoLogin ? "Entrar na API da Academia" : "Criar Nova Conta"}
          </h1>
          <p>
            {isModoLogin
              ? "Faça login para sincronizar os dados do dashboard."
              : "Registre um novo administrador para gerenciar o sistema."}
          </p>
        </header>

        <section className="students-section">
          <div
            className="form-card"
            style={{ maxWidth: "400px", margin: "0 auto" }}
          >
            {isModoLogin ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label htmlFor="login">Login</label>
                  <input
                    type="text"
                    id="login"
                    value={login}
                    required
                    className="form-control"
                    onChange={(e) => setLogin(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label htmlFor="senha">Senha</label>
                  <input
                    type="password"
                    id="senha"
                    value={senha}
                    required
                    className="form-control"
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
                {erro && <div className="error-msg">{erro}</div>}

                <div
                  className="modal-actions"
                  style={{ flexDirection: "column", gap: "8px" }}
                >
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setIsModoLogin(false);
                      setErro("");
                    }}
                    style={{ width: "100%" }}
                  >
                    Não tem conta? Registrar-se
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegistroSubmit}>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label htmlFor="nomeRegistro">Nome Completo</label>
                  <input
                    type="text"
                    id="nomeRegistro"
                    value={nomeRegistro}
                    required
                    className="form-control"
                    onChange={(e) => setNomeRegistro(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label htmlFor="loginRegistro">Login</label>
                  <input
                    type="text"
                    id="loginRegistro"
                    value={loginRegistro}
                    required
                    className="form-control"
                    onChange={(e) => setLoginRegistro(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label htmlFor="senhaRegistro">Senha</label>
                  <input
                    type="password"
                    id="senhaRegistro"
                    value={senhaRegistro}
                    required
                    className="form-control"
                    onChange={(e) => setSenhaRegistro(e.target.value)}
                  />
                </div>

                {/* --- ADICIONE ESTE NOVO BLOCO --- */}
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label htmlFor="confirmarSenhaRegistro">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    id="confirmarSenhaRegistro"
                    value={confirmarSenhaRegistro}
                    required
                    className="form-control"
                    onChange={(e) => setConfirmarSenhaRegistro(e.target.value)}
                  />
                </div>
                {/* -------------------------------- */}

                {erro && <div className="error-msg">{erro}</div>}

                <div
                  className="modal-actions"
                  style={{ flexDirection: "column", gap: "8px" }}
                >
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {loading ? "Registrando..." : "Registrar"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setIsModoLogin(true);
                      setErro("");
                    }}
                    style={{ width: "100%" }}
                  >
                    Já tem uma conta? Fazer Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Cabeçalho */}
      <div className="dashboard-header">
        <h1>Dashboard & Alunos</h1>
        <p>
          Olá Gerente! Gerencie os indicadores gerais e a ficha de alunos
          matriculados.
        </p>
      </div>

      {/* --- CARDS DE ESTATÍSTICA (DASHBOARD) --- */}
      <div className="stats-grid">
        {/* Card Alunos */}
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Alunos</h3>
            <p>{alunos.length}</p>
          </div>
        </div>
        {/* Card Planos */}
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>Planos Disponíveis</h3>
            <p>{planos.length}</p>
          </div>
        </div>
        {/* Card Treinos */}
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Treinos</h3>
            <p>{totalTreinos}</p>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO DE GESTÃO DE ALUNOS --- */}
      <div className="students-section">
        <div className="section-header">
          <h2>Alunos Matriculados</h2>

          <div className="controls">
            {/* Campo de Busca */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Pesquisar aluno..."
                className="search-input"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            {/* Botão Novo Aluno */}
            <button
              className="btn-primary"
              onClick={() => abrirModalCriar("aluno")}
            >
              <Plus size={18} /> Novo Aluno
            </button>
          </div>
        </div>
        {/* Lista / Tabela */}
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
                          onClick={() => abrirModalEditar("aluno", aluno)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Excluir"
                          onClick={() => handleDeletarAluno(aluno.id)}
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

      <div className="students-section">
        <div className="section-header">
          <h2>Planos</h2>
          <button
            className="btn-primary"
            onClick={() => abrirModalCriar("plano")}
          >
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
                        onClick={() => abrirModalEditar("plano", plano)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        title="Excluir"
                        onClick={() => handleDeletarPlano(plano.id)}
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

      <div className="students-section">
        <div className="section-header">
          <h2>Treinos</h2>
          <button
            className="btn-primary"
            onClick={() => abrirModalCriar("treino")}
          >
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
                        onClick={() => abrirModalEditar("treino", treino)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        title="Excluir"
                        onClick={() => handleDeletarTreino(treino.id)}
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

      {/* --- MODAL DE CRIAR OU EDITAR --- */}
      <AnimatePresence>
        {modalAberto && (
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
                <h3>
                  {itemEditando
                    ? `Editar ${modalTipo === "aluno" ? "Aluno" : modalTipo === "plano" ? "Plano" : "Treino"}`
                    : `Novo ${modalTipo === "aluno" ? "Aluno" : modalTipo === "plano" ? "Plano" : "Treino"}`}
                </h3>
                <button
                  className="btn-icon"
                  onClick={fecharModal}
                  style={{ border: "none" }}
                >
                  <X size={20} />
                </button>
              </div>
              {modalErro && (
                <div className="error-msg" style={{ marginBottom: "0" }}>
                  {modalErro}
                </div>
              )}
              <form
                onSubmit={handleSalvar}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label htmlFor="nome">Nome</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    required
                    className="form-control"
                    placeholder="Nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                  />
                </div>

                {modalTipo === "aluno" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="email">E-mail</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
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
                        name="telefone"
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
                        name="planoId"
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
                  </>
                )}

                {modalTipo === "plano" && (
                  <div className="form-group">
                    <label htmlFor="preco">Preço</label>
                    <input
                      type="text"
                      id="preco"
                      name="preco"
                      required
                      className="form-control"
                      placeholder="99.90"
                      value={formData.preco}
                      onChange={(e) =>
                        setFormData({ ...formData, preco: e.target.value })
                      }
                    />
                  </div>
                )}

                {modalTipo === "treino" && (
                  <>
                    <div className="form-group">
                      <label htmlFor="descricao">Descrição</label>
                      <textarea
                        id="descricao"
                        name="descricao"
                        required
                        className="form-control"
                        placeholder="Descreva o treino"
                        value={formData.descricao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descricao: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="aluno">Aluno</label>
                      <select
                        id="aluno"
                        name="alunoId"
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
                  </>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={fecharModal}
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
        )}
      </AnimatePresence>
    </div>
  );
}
