
import React, { useState, useEffect } from 'react';

const palette = {
  offwhite: '#F8F9FB',
  purpleDeep: '#2D1B69',
  purpleVivid: '#6D28D9',
  emerald: '#10B981',
  red: '#EF4444',
  purpleLight: '#A78BFA',
};

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const initialTransactions = [
  { tipo: 'entrada', desc: 'Pedido #101', valor: 120, status: 'Confirmado', canal: 'Loja', categoria: 'Venda', data: new Date().toISOString() },
  { tipo: 'saida', desc: 'Luz', valor: 150, status: 'Quitado', categoria: 'Fixa', data: new Date().toISOString() },
];
const initialFuncionarios = [
  { nome: 'Lucas', cargo: 'Dono', status: 'Ativo' },
];
const initialContas = [
  { desc: 'Aluguel', valor: 1200, status: 'Pendente', categoria: 'Fixa', data: new Date().toISOString() },
];

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });
  const [funcionarios, setFuncionarios] = useState(() => {
    const saved = localStorage.getItem('funcionarios');
    return saved ? JSON.parse(saved) : initialFuncionarios;
  });
  const [isDono, setIsDono] = useState(() => {
    const saved = localStorage.getItem('isDono');
    return saved ? JSON.parse(saved) : false;
  });
  const [showSenha, setShowSenha] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [activeModule, setActiveModule] = useState('pedidos');
  const [contas, setContas] = useState(() => {
    const saved = localStorage.getItem('contas');
    return saved ? JSON.parse(saved) : initialContas;
  });
  const [filter, setFilter] = useState('tudo');
  const [saidaInput, setSaidaInput] = useState('');
  const [novoFuncionario, setNovoFuncionario] = useState('');

  // Documentação state
  const docs = [
    { titulo: 'Manual do Usuário', link: '#' },
    { titulo: 'Fluxo de Caixa', link: '#' },
    { titulo: 'FAQ', link: '#' },
  ];

  // Persistência automática
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
  }, [funcionarios]);
  useEffect(() => {
    localStorage.setItem('contas', JSON.stringify(contas));
  }, [contas]);
  useEffect(() => {
    localStorage.setItem('isDono', JSON.stringify(isDono));
  }, [isDono]);

  // KPIs
  const faturamento = transactions.filter(t => t.tipo === 'entrada').reduce((a, b) => a + b.valor, 0);
  const despesas = transactions.filter(t => t.tipo === 'saida').reduce((a, b) => a + b.valor, 0);
  const pedidos = transactions.filter(t => t.tipo === 'entrada').length;
  const lucro = faturamento - despesas;
  const saldo = lucro;

  // Filtros
  let filtered = transactions;
  if (filter === 'entradas') filtered = filtered.filter(t => t.tipo === 'entrada');
  if (filter === 'saidas') filtered = filtered.filter(t => t.tipo === 'saida');

  // Simular Pedido
  function simularPedido() {
    const id = String(Math.floor(Math.random() * 900) + 100);
    const valor = Math.floor(Math.random() * 200) + 20;
    setTransactions([{ tipo: 'entrada', desc: `Pedido #${id}`, valor, status: 'Confirmado', canal: 'Loja', categoria: 'Venda', data: new Date().toISOString() }, ...transactions]);
  }

  // Lançar Saída
  function lancarSaida(e) {
    e.preventDefault();
    const val = saidaInput.trim();
    if (!val) return;
    const match = val.match(/(.+)\s(\d+[\.,]?\d*)$/);
    let desc = val, valor = 0, categoria = 'Outros';
    if (match) {
      desc = match[1];
      valor = parseFloat(match[2].replace(',', '.'));
      // Categorização automática
      if (/aluguel|luz|energia|internet|água|telefone/i.test(desc)) categoria = 'Fixa';
      else if (/açaí|barra|insumo|copo|embalagem|fornecedor/i.test(desc)) categoria = 'Insumo/Custo';
      else categoria = 'Outros';
    } else {
      desc = val;
      valor = Math.floor(Math.random() * 100) + 10;
    }
    setTransactions([{ tipo: 'saida', desc, valor, status: 'Quitado', categoria, data: new Date().toISOString(), origem: 'Loja' }, ...transactions]);
    setSaidaInput('');
  }

  // Funcionários: adicionar
  function adicionarFuncionario(e) {
    e.preventDefault();
    const nome = novoFuncionario.trim();
    if (!nome) return;
    setFuncionarios([{ nome, cargo: 'Novo Cargo', status: 'Ativo' }, ...funcionarios]);
    setNovoFuncionario('');
  }

  // Permissões: login do dono
  function handleSenhaSubmit(e) {
    e.preventDefault();
    if (senhaInput === '1234') {
      setIsDono(true);
      setShowSenha(false);
      setSenhaInput('');
    } else {
      alert('Senha incorreta!');
    }
  }
  function handleLogout() {
    setIsDono(false);
  }

  // Data atual formatada
  const dataAtual = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Sidebar buttons
  const navButtons = [
    { id: 'pedidos', label: 'Pedidos', icon: '🛒' },
    { id: 'financeiro', label: 'Financeiro', icon: '💸' },
    { id: 'funcionarios', label: 'Funcionários', icon: '👥' },
    { id: 'docs', label: 'Documentação', icon: '📄' },
  ];

  // Delivery test (placeholder)
  function receberPedidoDelivery(canal, valor, desc) {
    setTransactions([{ tipo: 'entrada', desc: `${desc} (${canal})`, valor, status: 'Confirmado', canal, categoria: 'Delivery', data: new Date().toISOString() }, ...transactions]);
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.offwhite, fontFamily: 'DM Sans, Arial, sans-serif', color: palette.purpleDeep, display: 'flex', position: 'relative' }}>
      {/* Sidebar */}
      <aside style={{ width: 270, background: '#fff', borderRight: `1px solid ${palette.purpleLight}`, padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '3rem', minHeight: '100vh', position: 'relative' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, margin: 0, letterSpacing: '-1px', color: palette.purpleDeep }}>Goiás Açaí</h1>
          <div style={{ color: palette.purpleLight, fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '0.2rem', textAlign: 'center' }}>ERP • GOIÂNIA</div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {navButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveModule(btn.id)}
              style={{
                background: activeModule === btn.id ? palette.purpleVivid : 'none',
                color: activeModule === btn.id ? '#fff' : palette.purpleLight,
                fontWeight: 'bold', fontSize: '1rem', padding: '1rem 1.2rem', borderRadius: 24,
                display: 'flex', alignItems: 'center', gap: '0.8rem', border: 'none', cursor: 'pointer', boxShadow: activeModule === btn.id ? '0 4px 24px 0 rgba(45,27,105,0.07)' : 'none'
              }}
            >
              <span role="img" aria-label={btn.label}>{btn.icon}</span> {btn.label}
            </button>
          ))}
        </nav>
        {/* Cadeado de permissões */}
        <button onClick={() => isDono ? handleLogout() : setShowSenha(true)} style={{ position: 'absolute', bottom: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: palette.purpleLight, fontSize: 24 }} title={isDono ? 'Sair do modo Dono' : 'Entrar como Dono'}>
          {isDono ? '🔓' : '🔒'}
        </button>
        {/* Modal de senha */}
        {showSenha && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <form onSubmit={handleSenhaSubmit} style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.12)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ fontWeight: 'bold', color: palette.purpleDeep }}>Senha do Dono:</label>
              <input type="password" value={senhaInput} onChange={e => setSenhaInput(e.target.value)} autoFocus style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.purpleLight}` }} />
              <button type="submit" style={{ background: palette.purpleVivid, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>Entrar</button>
              <button type="button" onClick={() => setShowSenha(false)} style={{ background: 'none', color: palette.red, border: 'none', marginTop: 8, cursor: 'pointer' }}>Cancelar</button>
            </form>
          </div>
        )}
      </aside>
      {/* Main */}
      <main style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: palette.offwhite }}>
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem 3rem 1.5rem 3rem' }}>
          <div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.7rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{activeModule === 'pedidos' ? 'Dashboard' : navButtons.find(b => b.id === activeModule)?.label}</span>
            <span style={{ color: palette.purpleLight, fontSize: '1.1rem', fontStyle: 'italic', fontFamily: 'DM Serif Display, serif', fontWeight: 400, marginLeft: '0.5rem' }}>{activeModule === 'pedidos' ? 'físico' : ''}</span>
          </div>
          {activeModule === 'pedidos' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ background: '#fff', border: `1px solid ${palette.purpleLight}`, borderRadius: 24, padding: '0.8rem 2rem', fontSize: '0.95rem', fontWeight: 'bold', color: palette.purpleDeep, textTransform: 'uppercase', letterSpacing: '0.15em', boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)' }}>{dataAtual}</div>
              <button onClick={simularPedido} style={{ background: palette.emerald, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 24, padding: '0.9rem 2rem', fontSize: '1rem', marginLeft: '2rem', cursor: 'pointer', boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>+ Simular Pedido</button>
              {/* Botões de teste de delivery */}
              <button onClick={() => receberPedidoDelivery('iFood', 45.9, 'Açaí 500ml')} style={{ background: '#EA1D2C', color: '#fff', border: 'none', borderRadius: 16, padding: '0.5rem 1rem', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }}>Teste iFood</button>
              <button onClick={() => receberPedidoDelivery('99Food', 39.5, 'Combo 99')} style={{ background: '#FFC107', color: palette.purpleDeep, border: 'none', borderRadius: 16, padding: '0.5rem 1rem', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer' }}>Teste 99Food</button>
            </div>
          )}
        </div>
        {/* Conteúdo dos módulos */}
        {activeModule === 'pedidos' && (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', padding: '0 3rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '2.2rem 1.5rem 1.7rem 1.5rem', borderBottom: `7px solid ${palette.emerald}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.7rem', letterSpacing: '0.15em' }}>Faturamento</div>
                <div style={{ fontSize: '2.2rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{formatBRL(faturamento)}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '2.2rem 1.5rem 1.7rem 1.5rem', borderBottom: `7px solid ${palette.purpleVivid}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.7rem', letterSpacing: '0.15em' }}>Lucro Real</div>
                <div style={{ fontSize: '2.2rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{formatBRL(lucro)}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '2.2rem 1.5rem 1.7rem 1.5rem', borderBottom: `7px solid ${palette.emerald}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.7rem', letterSpacing: '0.15em' }}>Pedidos</div>
                <div style={{ fontSize: '2.2rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{pedidos}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '2.2rem 1.5rem 1.7rem 1.5rem', borderBottom: `7px solid ${palette.red}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.7rem', letterSpacing: '0.15em' }}>Despesas</div>
                <div style={{ fontSize: '2.2rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{formatBRL(despesas)}</div>
              </div>
            </div>
            {/* Saldo do Dia */}
            <div style={{ margin: '0 3rem 2.5rem 3rem', background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '1.2rem 2rem', fontSize: '1.1rem', fontWeight: 'bold', color: palette.emerald, display: 'flex', alignItems: 'center', gap: '0.7rem', borderLeft: `6px solid ${palette.emerald}`, maxWidth: 350 }}>
              Saldo do Dia: <span>{formatBRL(saldo)}</span>
            </div>
            {/* Lançar Saída */}
            <form onSubmit={lancarSaida} style={{ margin: '0 3rem 2.5rem 3rem', display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: 500 }} autoComplete="off">
              <input type="text" value={saidaInput} onChange={e => setSaidaInput(e.target.value)} placeholder="Ex: Luz 150" required style={{ flex: 1, padding: '0.9rem 1.2rem', borderRadius: 24, border: `1.5px solid ${palette.purpleLight}`, fontSize: '1rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 500, outline: 'none' }} />
              <button type="submit" style={{ background: palette.red, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 24, padding: '0.9rem 2rem', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>- Lançar Saída</button>
            </form>
            {/* Filtros */}
            <div style={{ display: 'flex', gap: '0.7rem', margin: '0 3rem 1.2rem 3rem' }}>
              <button onClick={() => setFilter('tudo')} style={{ background: filter === 'tudo' ? palette.purpleVivid : '#fff', border: `1.5px solid ${palette.purpleLight}`, color: filter === 'tudo' ? '#fff' : palette.purpleLight, fontWeight: 'bold', borderRadius: 16, padding: '0.5rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer' }}>Tudo</button>
              <button onClick={() => setFilter('entradas')} style={{ background: filter === 'entradas' ? palette.purpleVivid : '#fff', border: `1.5px solid ${palette.purpleLight}`, color: filter === 'entradas' ? '#fff' : palette.purpleLight, fontWeight: 'bold', borderRadius: 16, padding: '0.5rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer' }}>Entradas</button>
              <button onClick={() => setFilter('saidas')} style={{ background: filter === 'saidas' ? palette.purpleVivid : '#fff', border: `1.5px solid ${palette.purpleLight}`, color: filter === 'saidas' ? '#fff' : palette.purpleLight, fontWeight: 'bold', borderRadius: 16, padding: '0.5rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer' }}>Saídas</button>
            </div>
            {/* Transactions List */}
            <section style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', margin: '0 3rem 2.5rem 3rem', padding: '2.2rem 2rem 2.5rem 2rem', minHeight: 340, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.7rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: '1rem', color: palette.purpleLight, fontWeight: 'bold', paddingBottom: '0.7rem', background: 'none', fontFamily: 'DM Sans, Arial, sans-serif' }}>Venda/Despesa</th>
                    <th style={{ textAlign: 'left', fontSize: '1rem', color: palette.purpleLight, fontWeight: 'bold', paddingBottom: '0.7rem', background: 'none', fontFamily: 'DM Sans, Arial, sans-serif' }}>Descrição</th>
                    <th style={{ textAlign: 'left', fontSize: '1rem', color: palette.purpleLight, fontWeight: 'bold', paddingBottom: '0.7rem', background: 'none', fontFamily: 'DM Sans, Arial, sans-serif' }}>Valor</th>
                    <th style={{ textAlign: 'left', fontSize: '1rem', color: palette.purpleLight, fontWeight: 'bold', paddingBottom: '0.7rem', background: 'none', fontFamily: 'DM Sans, Arial, sans-serif' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, idx) => (
                    <tr key={idx} style={{ borderLeft: `5px solid ${t.tipo === 'entrada' ? palette.emerald : palette.red}` }}>
                      <td>{t.tipo === 'entrada' ? 'Venda' : 'Despesa'}</td>
                      <td>{t.desc}</td>
                      <td style={{ color: t.tipo === 'entrada' ? palette.emerald : palette.red, fontWeight: 'bold' }}>{t.tipo === 'entrada' ? '+' : '-'} {formatBRL(t.valor)}</td>
                      <td style={{ color: t.tipo === 'entrada' ? palette.emerald : palette.red, fontWeight: 'bold', fontSize: '0.98rem' }}>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
        {activeModule === 'financeiro' && (
          <div style={{ padding: '3rem', color: palette.purpleDeep }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, marginBottom: '2rem' }}>Financeiro</h2>
            <p>Em breve: visão detalhada de receitas, despesas, relatórios e gráficos financeiros.</p>
          </div>
        )}
        {activeModule === 'funcionarios' && (
          <div style={{ padding: '3rem', color: palette.purpleDeep }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, marginBottom: '2rem' }}>Funcionários</h2>
            <form onSubmit={adicionarFuncionario} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', maxWidth: 400 }}>
              <input type="text" value={novoFuncionario} onChange={e => setNovoFuncionario(e.target.value)} placeholder="Nome do funcionário" style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: 16, border: `1.5px solid ${palette.purpleLight}`, fontSize: '1rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 500, outline: 'none' }} />
              <button type="submit" style={{ background: palette.purpleVivid, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 16, padding: '0.8rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>Adicionar</button>
            </form>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.7rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', color: palette.purpleLight, fontWeight: 'bold', fontSize: '1rem', paddingBottom: '0.7rem' }}>Nome</th>
                  <th style={{ textAlign: 'left', color: palette.purpleLight, fontWeight: 'bold', fontSize: '1rem', paddingBottom: '0.7rem' }}>Cargo</th>
                  <th style={{ textAlign: 'left', color: palette.purpleLight, fontWeight: 'bold', fontSize: '1rem', paddingBottom: '0.7rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((f, idx) => (
                  <tr key={idx} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px 0 rgba(45,27,105,0.04)' }}>
                    <td style={{ padding: '0.9rem 1.2rem' }}>{f.nome}</td>
                    <td style={{ padding: '0.9rem 1.2rem' }}>{f.cargo}</td>
                    <td style={{ padding: '0.9rem 1.2rem', color: f.status === 'Ativo' ? palette.emerald : palette.red, fontWeight: 'bold' }}>{f.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeModule === 'docs' && (
          <div style={{ padding: '3rem', color: palette.purpleDeep }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, marginBottom: '2rem' }}>Documentação</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {docs.map((doc, idx) => (
                <li key={idx} style={{ marginBottom: '1.2rem' }}>
                  <a href={doc.link} style={{ color: palette.purpleVivid, fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none' }}>{doc.titulo}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
  const [contas, setContas] = useState(() => {
    const saved = localStorage.getItem('contas');
    return saved ? JSON.parse(saved) : initialContas;
  });
  const [filter, setFilter] = useState('tudo');
  const [saidaInput, setSaidaInput] = useState('');
  const [novoFuncionario, setNovoFuncionario] = useState('');

  // Documentação state
  const docs = [
    { titulo: 'Manual do Usuário', link: '#' },
    { titulo: 'Fluxo de Caixa', link: '#' },
    { titulo: 'FAQ', link: '#' },
  ];

  // Persistência automática
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
  }, [funcionarios]);
  useEffect(() => {
    localStorage.setItem('contas', JSON.stringify(contas));
  }, [contas]);
  useEffect(() => {
    localStorage.setItem('isDono', JSON.stringify(isDono));
  }, [isDono]);

  // KPIs
  const faturamento = transactions.filter(t => t.tipo === 'entrada').reduce((a, b) => a + b.valor, 0);
  const despesas = transactions.filter(t => t.tipo === 'saida').reduce((a, b) => a + b.valor, 0);
  const pedidos = transactions.filter(t => t.tipo === 'entrada').length;
  const lucro = faturamento - despesas;
  const saldo = lucro;

  // Filtros
  let filtered = transactions;
  if (filter === 'entradas') filtered = filtered.filter(t => t.tipo === 'entrada');
  if (filter === 'saidas') filtered = filtered.filter(t => t.tipo === 'saida');

  // Simular Pedido
  function simularPedido() {
    const id = String(Math.floor(Math.random() * 900) + 100);
    const valor = Math.floor(Math.random() * 200) + 20;
    setTransactions([{ tipo: 'entrada', desc: `Pedido #${id}`, valor, status: 'Confirmado', canal: 'Loja', categoria: 'Venda', data: new Date().toISOString() }, ...transactions]);
  }

  // Lançar Saída
  function lancarSaida(e) {
    e.preventDefault();
    const val = saidaInput.trim();
    if (!val) return;
    const match = val.match(/(.+)\s(\d+[\.,]?\d*)$/);
    let desc = val, valor = 0, categoria = 'Outros';
    if (match) {
      desc = match[1];
      valor = parseFloat(match[2].replace(',', '.'));
      // Categorização automática
      if (/aluguel|luz|energia|internet|água|telefone/i.test(desc)) categoria = 'Fixa';
      else if (/açaí|barra|insumo|copo|embalagem|fornecedor/i.test(desc)) categoria = 'Insumo/Custo';
      else categoria = 'Outros';
    } else {
      desc = val;
      valor = Math.floor(Math.random() * 100) + 10;
    }
    setTransactions([{ tipo: 'saida', desc, valor, status: 'Quitado', categoria, data: new Date().toISOString(), origem: 'Loja' }, ...transactions]);
    setSaidaInput('');
  }

  // Funcionários: adicionar
  function adicionarFuncionario(e) {
    e.preventDefault();
    const nome = novoFuncionario.trim();
    if (!nome) return;
    setFuncionarios([{ nome, cargo: 'Novo Cargo', status: 'Ativo' }, ...funcionarios]);
    setNovoFuncionario('');
  }

  // Permissões: login do dono
  function handleSenhaSubmit(e) {
    e.preventDefault();
    if (senhaInput === '1234') {
      setIsDono(true);
      setShowSenha(false);
      setSenhaInput('');
    } else {
      alert('Senha incorreta!');
    }
  }
  function handleLogout() {
    setIsDono(false);
  }

  // Data atual formatada
  const dataAtual = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Sidebar buttons
  const navButtons = [
    { id: 'pedidos', label: 'Pedidos', icon: '🛒' },
    { id: 'financeiro', label: 'Financeiro', icon: '💸' },
    { id: 'funcionarios', label: 'Funcionários', icon: '👥' },
    { id: 'docs', label: 'Documentação', icon: '📄' },
  ];

  // ...restante do componente (renderização)
    <div style={{ minHeight: '100vh', background: palette.offwhite, fontFamily: 'DM Sans, Arial, sans-serif', color: palette.purpleDeep, display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 270, background: '#fff', borderRight: `1px solid ${palette.purpleLight}`, padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '3rem', minHeight: '100vh' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, margin: 0, letterSpacing: '-1px', color: palette.purpleDeep }}>Goiás Açaí</h1>
          <div style={{ color: palette.purpleLight, fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '0.2rem', textAlign: 'center' }}>ERP • GOIÂNIA</div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {navButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveModule(btn.id)}
              style={{
                background: activeModule === btn.id ? palette.purpleVivid : 'none',
                color: activeModule === btn.id ? '#fff' : palette.purpleLight,
                fontWeight: 'bold', fontSize: '1rem', padding: '1rem 1.2rem', borderRadius: 24,
                display: 'flex', alignItems: 'center', gap: '0.8rem', border: 'none', cursor: 'pointer', boxShadow: activeModule === btn.id ? '0 4px 24px 0 rgba(45,27,105,0.07)' : 'none'
              }}
            >
              <span role="img" aria-label={btn.label}>{btn.icon}</span> {btn.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main */}
      <main style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: palette.offwhite }}>
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem 3rem 1.5rem 3rem' }}>
          <div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.7rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{activeModule === 'pedidos' ? 'Dashboard' : navButtons.find(b => b.id === activeModule)?.label}</span>
            <span style={{ color: palette.purpleLight, fontSize: '1.1rem', fontStyle: 'italic', fontFamily: 'DM Serif Display, serif', fontWeight: 400, marginLeft: '0.5rem' }}>{activeModule === 'pedidos' ? 'físico' : ''}</span>
          </div>
          {activeModule === 'pedidos' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div style={{ background: '#fff', border: `1px solid ${palette.purpleLight}`, borderRadius: 24, padding: '0.8rem 2rem', fontSize: '0.95rem', fontWeight: 'bold', color: palette.purpleDeep, textTransform: 'uppercase', letterSpacing: '0.15em', boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)' }}>{dataAtual}</div>
              <button onClick={simularPedido} style={{ background: palette.emerald, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 24, padding: '0.9rem 2rem', fontSize: '1rem', marginLeft: '2rem', cursor: 'pointer', boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>+ Simular Pedido</button>
            </div>
          )}
        </div>
        {/* Conteúdo dos módulos */}
        {activeModule === 'pedidos' && (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', padding: '0 3rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '2.2rem 1.5rem 1.7rem 1.5rem', borderBottom: `7px solid ${palette.emerald}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.7rem', letterSpacing: '0.15em' }}>Faturamento</div>
                <div style={{ fontSize: '2.2rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{formatBRL(faturamento)}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '2.2rem 1.5rem 1.7rem 1.5rem', borderBottom: `7px solid ${palette.purpleVivid}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.7rem', letterSpacing: '0.15em' }}>Lucro Real</div>
                <div style={{ fontSize: '2.2rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{formatBRL(lucro)}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '2.2rem 1.5rem 1.7rem 1.5rem', borderBottom: `7px solid ${palette.emerald}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.7rem', letterSpacing: '0.15em' }}>Pedidos</div>
                <div style={{ fontSize: '2.2rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{pedidos}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '2.2rem 1.5rem 1.7rem 1.5rem', borderBottom: `7px solid ${palette.red}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.7rem', letterSpacing: '0.15em' }}>Despesas</div>
                <div style={{ fontSize: '2.2rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>{formatBRL(despesas)}</div>
              </div>
            </div>
            {/* Saldo do Dia */}
            <div style={{ margin: '0 3rem 2.5rem 3rem', background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', padding: '1.2rem 2rem', fontSize: '1.1rem', fontWeight: 'bold', color: palette.emerald, display: 'flex', alignItems: 'center', gap: '0.7rem', borderLeft: `6px solid ${palette.emerald}`, maxWidth: 350 }}>
              Saldo do Dia: <span>{formatBRL(saldo)}</span>
            </div>
            {/* Lançar Saída */}
            <form onSubmit={lancarSaida} style={{ margin: '0 3rem 2.5rem 3rem', display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: 500 }} autoComplete="off">
              <input type="text" value={saidaInput} onChange={e => setSaidaInput(e.target.value)} placeholder="Ex: Luz 150" required style={{ flex: 1, padding: '0.9rem 1.2rem', borderRadius: 24, border: `1.5px solid ${palette.purpleLight}`, fontSize: '1rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 500, outline: 'none' }} />
              <button type="submit" style={{ background: palette.red, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 24, padding: '0.9rem 2rem', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>- Lançar Saída</button>
            </form>
            {/* Filtros */}
            <div style={{ display: 'flex', gap: '0.7rem', margin: '0 3rem 1.2rem 3rem' }}>
              <button onClick={() => setFilter('tudo')} style={{ background: filter === 'tudo' ? palette.purpleVivid : '#fff', border: `1.5px solid ${palette.purpleLight}`, color: filter === 'tudo' ? '#fff' : palette.purpleLight, fontWeight: 'bold', borderRadius: 16, padding: '0.5rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer' }}>Tudo</button>
              <button onClick={() => setFilter('entradas')} style={{ background: filter === 'entradas' ? palette.purpleVivid : '#fff', border: `1.5px solid ${palette.purpleLight}`, color: filter === 'entradas' ? '#fff' : palette.purpleLight, fontWeight: 'bold', borderRadius: 16, padding: '0.5rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer' }}>Entradas</button>
              <button onClick={() => setFilter('saidas')} style={{ background: filter === 'saidas' ? palette.purpleVivid : '#fff', border: `1.5px solid ${palette.purpleLight}`, color: filter === 'saidas' ? '#fff' : palette.purpleLight, fontWeight: 'bold', borderRadius: 16, padding: '0.5rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer' }}>Saídas</button>
            </div>
            {/* Transactions List */}
            <section style={{ background: '#fff', borderRadius: 40, boxShadow: '0 4px 24px 0 rgba(45,27,105,0.07)', margin: '0 3rem 2.5rem 3rem', padding: '2.2rem 2rem 2.5rem 2rem', minHeight: 340, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.7rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: '1rem', color: palette.purpleLight, fontWeight: 'bold', paddingBottom: '0.7rem', background: 'none', fontFamily: 'DM Sans, Arial, sans-serif' }}>Venda/Despesa</th>
                    <th style={{ textAlign: 'left', fontSize: '1rem', color: palette.purpleLight, fontWeight: 'bold', paddingBottom: '0.7rem', background: 'none', fontFamily: 'DM Sans, Arial, sans-serif' }}>Descrição</th>
                    <th style={{ textAlign: 'left', fontSize: '1rem', color: palette.purpleLight, fontWeight: 'bold', paddingBottom: '0.7rem', background: 'none', fontFamily: 'DM Sans, Arial, sans-serif' }}>Valor</th>
                    <th style={{ textAlign: 'left', fontSize: '1rem', color: palette.purpleLight, fontWeight: 'bold', paddingBottom: '0.7rem', background: 'none', fontFamily: 'DM Sans, Arial, sans-serif' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, idx) => (
                    <tr key={idx} style={{ borderLeft: `5px solid ${t.tipo === 'entrada' ? palette.emerald : palette.red}` }}>
                      <td>{t.tipo === 'entrada' ? 'Venda' : 'Despesa'}</td>
                      <td>{t.desc}</td>
                      <td style={{ color: t.tipo === 'entrada' ? palette.emerald : palette.red, fontWeight: 'bold' }}>{t.tipo === 'entrada' ? '+' : '-'} {formatBRL(t.valor)}</td>
                      <td style={{ color: t.tipo === 'entrada' ? palette.emerald : palette.red, fontWeight: 'bold', fontSize: '0.98rem' }}>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
        {activeModule === 'financeiro' && (
          <div style={{ padding: '3rem', color: palette.purpleDeep }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, marginBottom: '2rem' }}>Financeiro</h2>
            <p>Em breve: visão detalhada de receitas, despesas, relatórios e gráficos financeiros.</p>
          </div>
        )}
        {activeModule === 'funcionarios' && (
          <div style={{ padding: '3rem', color: palette.purpleDeep }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, marginBottom: '2rem' }}>Funcionários</h2>
            <form onSubmit={adicionarFuncionario} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', maxWidth: 400 }}>
              <input type="text" value={novoFuncionario} onChange={e => setNovoFuncionario(e.target.value)} placeholder="Nome do funcionário" style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: 16, border: `1.5px solid ${palette.purpleLight}`, fontSize: '1rem', fontFamily: 'DM Sans, Arial, sans-serif', fontWeight: 500, outline: 'none' }} />
              <button type="submit" style={{ background: palette.purpleVivid, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 16, padding: '0.8rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>Adicionar</button>
            </form>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.7rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', color: palette.purpleLight, fontWeight: 'bold', fontSize: '1rem', paddingBottom: '0.7rem' }}>Nome</th>
                  <th style={{ textAlign: 'left', color: palette.purpleLight, fontWeight: 'bold', fontSize: '1rem', paddingBottom: '0.7rem' }}>Cargo</th>
                  <th style={{ textAlign: 'left', color: palette.purpleLight, fontWeight: 'bold', fontSize: '1rem', paddingBottom: '0.7rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((f, idx) => (
                  <tr key={idx} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px 0 rgba(45,27,105,0.04)' }}>
                    <td style={{ padding: '0.9rem 1.2rem' }}>{f.nome}</td>
                    <td style={{ padding: '0.9rem 1.2rem' }}>{f.cargo}</td>
                    <td style={{ padding: '0.9rem 1.2rem', color: f.status === 'Ativo' ? palette.emerald : palette.red, fontWeight: 'bold' }}>{f.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeModule === 'docs' && (
          <div style={{ padding: '3rem', color: palette.purpleDeep }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, marginBottom: '2rem' }}>Documentação</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {docs.map((doc, idx) => (
                <li key={idx} style={{ marginBottom: '1.2rem' }}>
                  <a href={doc.link} style={{ color: palette.purpleVivid, fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none' }}>{doc.titulo}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
