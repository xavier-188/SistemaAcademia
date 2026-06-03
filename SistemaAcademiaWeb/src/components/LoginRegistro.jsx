import React, { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginRegistro({ onSuccess }) {
  const { login: fazerLogin } = useAuth();
  
  const [isModoLogin, setIsModoLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // States de Login
  const [loginVal, setLoginVal] = useState("");
  const [senhaVal, setSenhaVal] = useState("");

  // States de Registro
  const [nomeRegistro, setNomeRegistro] = useState("");
  const [loginRegistro, setLoginRegistro] = useState("");
  const [senhaRegistro, setSenhaRegistro] = useState("");
  const [confirmarSenhaRegistro, setConfirmarSenhaRegistro] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await api.post("/Auth/login", {
        login: loginVal,
        senha: senhaVal,
      });

      fazerLogin(response.data.token);
      setLoginVal("");
      setSenhaVal("");
      onSuccess();
    } catch (err) {
      console.error(err);
      const mensagem =
        err?.response?.data?.mensagem ||
        "Erro ao fazer login. Verifique suas credenciais.";
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistroSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

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

    try {
      await api.post("/Auth/registrar", {
        nome: nomeRegistro,
        login: loginRegistro,
        senha: senhaRegistro,
        confirmarSenha: confirmarSenhaRegistro,
      });

      alert("Cadastro realizado com sucesso! Agora você pode fazer login.");

      setNomeRegistro("");
      setLoginRegistro("");
      setSenhaRegistro("");
      setConfirmarSenhaRegistro("");
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
                  value={loginVal}
                  required
                  className="form-control"
                  onChange={(e) => setLoginVal(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label htmlFor="senha">Senha</label>
                <input
                  type="password"
                  id="senha"
                  value={senhaVal}
                  required
                  className="form-control"
                  onChange={(e) => setSenhaVal(e.target.value)}
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
