import React, {useState, useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Users, Award, Activity, Plus, Search, Trash2, Edit3, X, Loader2} from "lucide-react";
import api from "../services/api";
import './DashboardAlunos.css';

export default function DashboardAlunos() {
    const [alunos, setAlunos] = useState([]);
    const [planos, setPlanos] = useState([]);
    const [totalTreinos, setTotalTreinos] = useState(0);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
 
    //busca e filtro
    const [busca, setBusca] = useState('');

    // Modal cadastro
const [modalAberto, setModalAberto] = useState(false);
const [alunoEditando, setAlunoEditando] = useState(null);

       const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        planoId: ''
    });

       const carregarDados = async () => {
        setLoading(true);
        setErro('');
        try {
            // fazendo requisicao para buscar alunos planos e treinos
            const [alunosRes, planosRes, treinosRes] = await Promise.all([
                api.get('/Alunos').catch(() => ({ data: [] })), 
                api.get('/Planos').catch(() => ({ data: [] })), 
                api.get('/Treinos').catch(() => ({ data: [] })), 
            ]);
            
            setAlunos(alunosRes.data);
            setPlanos(planosRes.data);
            setTotalTreinos(treinosRes.data.length);
        } catch (err) {
            console.error(err);
            setErro('Erro ao carregar dados. Por favor, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    //funcao de acao

    //deletar aluno
    const handleDeletar = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este aluno?')) {
            try {
                await api.delete(`/alunos/${id}`);
                setAlunos(alunos.filter(aluno => aluno.id !== id));
            } catch (err) {
                console.error(err);
                alert('Erro ao deletar aluno. Por favor, tente novamente.');
            }
        }
    };

    // modal de edicao
    const abrirModalEditar = (aluno) => {
        setAlunoEditando(aluno);
        setFormData({
            nome: aluno.nome,
            email: aluno.email,
            telefone: aluno.telefone,
            planoId: aluno.planoId
        });
        setModalAberto(true);
    };

    const abrirModalCriar = () => {
        setAlunoEditando(null);
        setFormData({
            nome: '',
            email: '',
            telefone: '',
            planoId: planos.length > 0 ? planos[0].id : '' // seleciona o primeiro plano se existir
        });
        setModalAberto(true);
    }

    // salvar alunos envia o fomulario de criacao ou edicao
    const handleSalvar = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                planoId: parseInt(formData.planoId)
            };

            if (alunoEditando) {
                await api.put(`/alunos/${alunoEditando.id}`, payload);
            } else {
                await api.post('/alunos', payload);
            }

            setModalAberto(false);
            carregarDados();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar aluno. Por favor, tente novamente.');
        }
    };

    const alunosFiltrados = alunos.filter(aluno => 
        aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
        aluno.email.toLowerCase().includes(busca.toLowerCase())
    );


   return (
    <div className="dashboard-container">
      {/* Cabeçalho */}
      <div className="dashboard-header">
        <h1>Dashboard & Alunos</h1>
        <p>Olá Gerente! Gerencie os indicadores gerais e a ficha de alunos matriculados.</p>
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
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Pesquisar aluno..."
                className="search-input"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            {/* Botão Novo Aluno */}
            <button className="btn-primary" onClick={abrirModalCriar}>
              <Plus size={18} /> Novo Aluno
            </button>
          </div>
        </div>
        {/* Lista / Tabela */}
        {loading ? (
          <div className="loading">
            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
            <p>Carregando registros da academia...</p>
          </div>
        ) : erro ? (
          <div className="error-msg">
            <p>{erro}</p>
            <button className="btn-secondary" onClick={carregarDados} style={{ marginTop: '12px' }}>
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
                    <td style={{ fontWeight: '500', color: 'var(--text-h)' }}>{aluno.nome}</td>
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
                          onClick={() => abrirModalEditar(aluno)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Excluir"
                          onClick={() => handleDeletar(aluno.id)}
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
      {/* --- MODAL DE CRIAR OU EDITAR ALUNO --- */}
      <AnimatePresence>
        {modalAberto && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{alunoEditando ? 'Editar Aluno' : 'Novo Aluno'}</h3>
                <button
                  className="btn-icon"
                  onClick={() => setModalAberto(false)}
                  style={{ border: 'none' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Campo Nome */}
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo</label>
                  <input
                    type="text"
                    id="nome"
                    required
                    className="form-control"
                    placeholder="Digite o nome completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                {/* Campo E-mail */}
                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="form-control"
                    placeholder="exemplo@academia.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {/* Campo Telefone */}
                <div className="form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <input
                    type="tel"
                    id="telefone"
                    required
                    className="form-control"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                {/* Dropdown de Planos */}
                <div className="form-group">
                  <label htmlFor="plano">Plano da Academia</label>
                  <select
                    id="plano"
                    required
                    className="form-control"
                    value={formData.planoId}
                    onChange={(e) => setFormData({ ...formData, planoId: e.target.value })}
                  >
                    {planos.length === 0 ? (
                      <option value="" disabled>Nenhum plano cadastrado</option>
                    ) : (
                      planos.map((plano) => (
                        <option key={plano.id} value={plano.id}>
                          {plano.nome} — R$ {plano.preco.toFixed(2)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {/* Botões do Rodapé do Modal */}
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setModalAberto(false)}>
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