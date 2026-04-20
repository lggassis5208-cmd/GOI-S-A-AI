
import React, { useEffect, useMemo, useState } from 'react';

const palette = {
  offwhite: '#F8F9FB',
  purpleDeep: '#2D1B69',
  purpleVivid: '#6D28D9',
  emerald: '#10B981',
  red: '#EF4444',
  purpleLight: '#A78BFA',
};

const lojas = ['iFood Loja 1', 'iFood Loja 2', '99 Loja 1', '99 Loja 2'];
const metodosPagamento = ['Pix', 'Dinheiro', 'Cartão'];

const initialTransactions = [
  { tipo: 'entrada', produto: 'Açaí 500ml', desc: 'Açaí 500ml', valor: 120, loja: 'iFood Loja 1', metodoPagamento: 'Pix', status: 'Confirmado', data: new Date().toISOString() },
  { tipo: 'saida', desc: 'Compra de copos', valor: 45, loja: '99 Loja 1', metodoPagamento: 'Dinheiro', status: 'Quitado', data: new Date().toISOString() },
];

const initialFuncionarios = [{ nome: 'Lucas', cargo: 'Dono', status: 'Ativo' }];

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function toDateInput(isoDateString) {
  return new Date(isoDateString).toISOString().slice(0, 10);
}

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
  const [activeModule, setActiveModule] = useState('vendas');
  const [filter, setFilter] = useState('tudo');
  const [novoFuncionario, setNovoFuncionario] = useState('');
  const [dataFechamento, setDataFechamento] = useState(new Date().toISOString().slice(0, 10));
  const [caixaAberto, setCaixaAberto] = useState(() => {
    const saved = localStorage.getItem('caixaAberto');
    return saved ? JSON.parse(saved) : false;
  });
  const [ultimoFechamento, setUltimoFechamento] = useState(() => {
    const saved = localStorage.getItem('ultimoFechamento');
    return saved ? JSON.parse(saved) : null;
  });

  const [formVenda, setFormVenda] = useState({
    produto: '',
    loja: lojas[0],
    metodoPagamento: metodosPagamento[0],
    valor: '',
  });
  const [formCompra, setFormCompra] = useState({
    loja: lojas[0],
    metodoPagamento: metodosPagamento[0],
    valor: '',
    desc: '',
  });

  const docs = [
    { titulo: 'Manual do Usuário', link: '#' },
    { titulo: 'Fluxo de Caixa', link: '#' },
    { titulo: 'FAQ', link: '#' },
  ];

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
  }, [funcionarios]);
  useEffect(() => {
    localStorage.setItem('isDono', JSON.stringify(isDono));
  }, [isDono]);
  useEffect(() => {
    localStorage.setItem('caixaAberto', JSON.stringify(caixaAberto));
  }, [caixaAberto]);
  useEffect(() => {
    localStorage.setItem('ultimoFechamento', JSON.stringify(ultimoFechamento));
  }, [ultimoFechamento]);

  const faturamento = transactions
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, item) => acc + Number(item.valor), 0);
  const despesas = transactions
    .filter(t => t.tipo === 'saida')
    .reduce((acc, item) => acc + Number(item.valor), 0);
  const pedidos = transactions.filter(t => t.tipo === 'entrada').length;
  const lucro = faturamento - despesas;

  const transacoesDoDia = useMemo(
    () => transactions.filter(t => toDateInput(t.data) === dataFechamento),
    [transactions, dataFechamento]
  );
  const totalEntradasDia = transacoesDoDia
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, item) => acc + Number(item.valor), 0);
  const totalSaidasDia = transacoesDoDia
    .filter(t => t.tipo === 'saida')
    .reduce((acc, item) => acc + Number(item.valor), 0);
  const saldoLiquidoDia = totalEntradasDia - totalSaidasDia;

  const resumoLojasMetodos = useMemo(() => {
    const base = {};
    lojas.forEach(loja => {
      base[loja] = {};
      metodosPagamento.forEach(metodo => {
        base[loja][metodo] = { entrada: 0, saida: 0 };
      });
    });

    transacoesDoDia.forEach(item => {
      if (!base[item.loja] || !base[item.loja][item.metodoPagamento]) return;
      base[item.loja][item.metodoPagamento][item.tipo] += Number(item.valor);
    });
    return base;
  }, [transacoesDoDia]);

  const graficoPagamentosDia = useMemo(() => {
    const base = { Pix: 0, Dinheiro: 0, Cartão: 0 };
    transacoesDoDia
      .filter(item => item.tipo === 'entrada')
      .forEach(item => {
        if (base[item.metodoPagamento] !== undefined) {
          base[item.metodoPagamento] += Number(item.valor);
        }
      });
    return base;
  }, [transacoesDoDia]);

  const maiorValorGrafico = Math.max(...Object.values(graficoPagamentosDia), 1);

  let filtered = transactions;
  if (filter === 'entradas') filtered = filtered.filter(t => t.tipo === 'entrada');
  if (filter === 'saidas') filtered = filtered.filter(t => t.tipo === 'saida');

  function registrarLancamento(tipo, payload) {
    if (!caixaAberto) return;
    const valor = Number(payload.valor);
    if (!valor || valor <= 0) return;

    const produto = payload.produto?.trim() || '';
    const descPadrao = tipo === 'entrada' ? (produto || 'Venda manual') : 'Compra manual';
    const nova = {
      tipo,
      desc: (payload.desc || '').trim() || descPadrao,
      produto: tipo === 'entrada' ? produto : '',
      valor,
      loja: payload.loja,
      metodoPagamento: payload.metodoPagamento,
      status: tipo === 'entrada' ? 'Confirmado' : 'Quitado',
      data: new Date().toISOString(),
      categoria: tipo === 'entrada' ? 'Venda' : 'Compra',
    };

    setTransactions(prev => [nova, ...prev]);
  }

  function handleVendaSubmit(event) {
    event.preventDefault();
    registrarLancamento('entrada', formVenda);
    setFormVenda(prev => ({ ...prev, produto: '', valor: '' }));
  }

  function handleCompraSubmit(event) {
    event.preventDefault();
    registrarLancamento('saida', formCompra);
    setFormCompra(prev => ({ ...prev, valor: '', desc: '' }));
  }

  function adicionarFuncionario(e) {
    e.preventDefault();
    const nome = novoFuncionario.trim();
    if (!nome) return;
    setFuncionarios(prev => [{ nome, cargo: 'Novo Cargo', status: 'Ativo' }, ...prev]);
    setNovoFuncionario('');
  }

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

  function abrirCaixa() {
    setCaixaAberto(true);
  }

  function fecharCaixaDiario() {
    if (!caixaAberto) return;
    setUltimoFechamento({
      data: dataFechamento,
      entradas: totalEntradasDia,
      saidas: totalSaidasDia,
      saldoLiquido: saldoLiquidoDia,
      fechadoEm: new Date().toISOString(),
    });
    setCaixaAberto(false);
  }

  const dataAtual = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const navButtons = [
    { id: 'vendas', label: 'Vendas', icon: '🧾' },
    { id: 'pedidos', label: 'Pedidos', icon: '🛒' },
    { id: 'financeiro', label: 'Financeiro', icon: '💸' },
    { id: 'funcionarios', label: 'Funcionários', icon: '👥' },
    { id: 'docs', label: 'Documentação', icon: '📄' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: palette.offwhite, fontFamily: 'DM Sans, Arial, sans-serif', color: palette.purpleDeep, display: 'flex', position: 'relative' }}>
      <aside style={{ width: 270, background: '#fff', borderRight: `1px solid ${palette.purpleLight}`, padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '3rem', minHeight: '100vh', position: 'relative' }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, margin: 0, letterSpacing: '-1px', color: palette.purpleDeep }}>GOOD AÇAÍ</h1>
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
                fontWeight: 'bold',
                fontSize: '1rem',
                padding: '1rem 1.2rem',
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span role="img" aria-label={btn.label}>{btn.icon}</span> {btn.label}
            </button>
          ))}
        </nav>
        <button onClick={() => (isDono ? handleLogout() : setShowSenha(true))} style={{ position: 'absolute', bottom: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: palette.purpleLight, fontSize: 24 }} title={isDono ? 'Sair do modo Dono' : 'Entrar como Dono'}>
          {isDono ? '🔓' : '🔒'}
        </button>
        {showSenha && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <form onSubmit={handleSenhaSubmit} style={{ background: '#fff', padding: 32, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ fontWeight: 'bold', color: palette.purpleDeep }}>Senha do Dono:</label>
              <input type="password" value={senhaInput} onChange={e => setSenhaInput(e.target.value)} autoFocus style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.purpleLight}` }} />
              <button type="submit" style={{ background: palette.purpleVivid, color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>Entrar</button>
              <button type="button" onClick={() => setShowSenha(false)} style={{ background: 'none', color: palette.red, border: 'none', marginTop: 8, cursor: 'pointer' }}>Cancelar</button>
            </form>
          </div>
        )}
      </aside>
      <main style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: palette.offwhite }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem 3rem 1.5rem 3rem' }}>
          <div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.7rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, letterSpacing: '-1px' }}>
              {navButtons.find(b => b.id === activeModule)?.label}
            </span>
          </div>
          {activeModule === 'financeiro' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={abrirCaixa}
                disabled={caixaAberto}
                style={{
                  background: caixaAberto ? '#ddd' : palette.emerald,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '0.75rem 1rem',
                  fontWeight: 700,
                  cursor: caixaAberto ? 'not-allowed' : 'pointer',
                }}
              >
                Abrir caixa
              </button>
              <button
                onClick={fecharCaixaDiario}
                disabled={!caixaAberto}
                style={{
                  background: !caixaAberto ? '#ddd' : palette.red,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '0.75rem 1rem',
                  fontWeight: 700,
                  cursor: !caixaAberto ? 'not-allowed' : 'pointer',
                }}
              >
                Fechar caixa diário
              </button>
              <div style={{ background: '#fff', border: `1px solid ${palette.purpleLight}`, borderRadius: 24, padding: '0.8rem 1.2rem', fontSize: '0.95rem', fontWeight: 'bold', color: palette.purpleDeep, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dataAtual}</div>
              <input
                type="date"
                value={dataFechamento}
                onChange={e => setDataFechamento(e.target.value)}
                style={{ border: `1px solid ${palette.purpleLight}`, borderRadius: 16, padding: '0.75rem 1rem', color: palette.purpleDeep, fontWeight: 'bold' }}
              />
            </div>
          )}
        </div>

        {activeModule === 'pedidos' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '0 3rem', marginBottom: '1.6rem' }}>
              <div style={{ background: '#fff', borderRadius: 24, padding: '1.3rem', borderBottom: `5px solid ${palette.emerald}` }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase' }}>Faturamento</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatBRL(faturamento)}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 24, padding: '1.3rem', borderBottom: `5px solid ${palette.purpleVivid}` }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase' }}>Lucro</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatBRL(lucro)}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 24, padding: '1.3rem', borderBottom: `5px solid ${palette.emerald}` }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase' }}>Vendas</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{pedidos}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 24, padding: '1.3rem', borderBottom: `5px solid ${palette.red}` }}>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase' }}>Despesas</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{formatBRL(despesas)}</div>
              </div>
            </div>
            <section style={{ background: '#fff', borderRadius: 24, margin: '0 3rem 2.5rem 3rem', padding: '1.2rem 1.4rem', minHeight: 250, overflowX: 'auto' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>Pedidos lançados (todas as origens)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Tipo</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Loja</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Pagamento</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Descrição</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Valor</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 20).map((t, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: t.tipo === 'entrada' ? palette.emerald : palette.red }}>{t.tipo === 'entrada' ? 'Venda' : 'Compra'}</td>
                      <td style={{ padding: '0.65rem' }}>{t.loja || '-'}</td>
                      <td style={{ padding: '0.65rem' }}>{t.metodoPagamento || '-'}</td>
                      <td style={{ padding: '0.65rem' }}>{t.desc}</td>
                      <td style={{ padding: '0.65rem', color: t.tipo === 'entrada' ? palette.emerald : palette.red, fontWeight: 'bold' }}>{t.tipo === 'entrada' ? '+' : '-'} {formatBRL(Number(t.valor))}</td>
                      <td style={{ padding: '0.65rem' }}>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {activeModule === 'vendas' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(320px, 1fr))', gap: '1.2rem', margin: '0 3rem 1.8rem 3rem' }}>
              <form onSubmit={handleVendaSubmit} style={{ background: '#fff', borderRadius: 24, padding: '1.2rem', display: 'grid', gap: '0.8rem', opacity: caixaAberto ? 1 : 0.7 }}>
                <div style={{ fontWeight: 700, color: palette.emerald }}>Lançamento de Venda por Categoria</div>
                <input
                  disabled={!caixaAberto}
                  type="text"
                  required
                  placeholder="Nome do produto"
                  value={formVenda.produto}
                  onChange={e => setFormVenda(prev => ({ ...prev, produto: e.target.value }))}
                  style={{ padding: '0.8rem', borderRadius: 12, border: `1px solid ${palette.purpleLight}` }}
                />
                <select disabled={!caixaAberto} value={formVenda.loja} onChange={e => setFormVenda(prev => ({ ...prev, loja: e.target.value }))} style={{ padding: '0.8rem', borderRadius: 12, border: `1px solid ${palette.purpleLight}` }}>
                  {lojas.map(loja => <option key={loja} value={loja}>{loja}</option>)}
                </select>
                <select disabled={!caixaAberto} value={formVenda.metodoPagamento} onChange={e => setFormVenda(prev => ({ ...prev, metodoPagamento: e.target.value }))} style={{ padding: '0.8rem', borderRadius: 12, border: `1px solid ${palette.purpleLight}` }}>
                  {metodosPagamento.map(metodo => <option key={metodo} value={metodo}>{metodo}</option>)}
                </select>
                <input disabled={!caixaAberto} type="number" min="0.01" step="0.01" inputMode="decimal" required placeholder="Valor da venda" value={formVenda.valor} onChange={e => setFormVenda(prev => ({ ...prev, valor: e.target.value }))} style={{ padding: '0.8rem', borderRadius: 12, border: `1px solid ${palette.purpleLight}` }} />
                <button disabled={!caixaAberto} type="submit" style={{ background: caixaAberto ? palette.emerald : '#ddd', color: '#fff', border: 'none', borderRadius: 14, padding: '0.85rem', fontWeight: 700, cursor: caixaAberto ? 'pointer' : 'not-allowed' }}>+ Registrar Venda</button>
              </form>

              <form onSubmit={handleCompraSubmit} style={{ background: '#fff', borderRadius: 24, padding: '1.2rem', display: 'grid', gap: '0.8rem', opacity: caixaAberto ? 1 : 0.7 }}>
                <div style={{ fontWeight: 700, color: palette.red }}>Lançamento Manual de Compra</div>
                <select disabled={!caixaAberto} value={formCompra.loja} onChange={e => setFormCompra(prev => ({ ...prev, loja: e.target.value }))} style={{ padding: '0.8rem', borderRadius: 12, border: `1px solid ${palette.purpleLight}` }}>
                  {lojas.map(loja => <option key={loja} value={loja}>{loja}</option>)}
                </select>
                <select disabled={!caixaAberto} value={formCompra.metodoPagamento} onChange={e => setFormCompra(prev => ({ ...prev, metodoPagamento: e.target.value }))} style={{ padding: '0.8rem', borderRadius: 12, border: `1px solid ${palette.purpleLight}` }}>
                  {metodosPagamento.map(metodo => <option key={metodo} value={metodo}>{metodo}</option>)}
                </select>
                <input disabled={!caixaAberto} type="number" min="0.01" step="0.01" inputMode="decimal" required placeholder="Valor da compra" value={formCompra.valor} onChange={e => setFormCompra(prev => ({ ...prev, valor: e.target.value }))} style={{ padding: '0.8rem', borderRadius: 12, border: `1px solid ${palette.purpleLight}` }} />
                <input disabled={!caixaAberto} type="text" placeholder="Descrição rápida (opcional)" value={formCompra.desc} onChange={e => setFormCompra(prev => ({ ...prev, desc: e.target.value }))} style={{ padding: '0.8rem', borderRadius: 12, border: `1px solid ${palette.purpleLight}` }} />
                <button disabled={!caixaAberto} type="submit" style={{ background: caixaAberto ? palette.red : '#ddd', color: '#fff', border: 'none', borderRadius: 14, padding: '0.85rem', fontWeight: 700, cursor: caixaAberto ? 'pointer' : 'not-allowed' }}>- Registrar Compra</button>
              </form>
            </div>

            <div style={{ display: 'flex', gap: '0.7rem', margin: '0 3rem 1rem 3rem' }}>
              <button onClick={() => setFilter('tudo')} style={{ background: filter === 'tudo' ? palette.purpleVivid : '#fff', border: `1.5px solid ${palette.purpleLight}`, color: filter === 'tudo' ? '#fff' : palette.purpleLight, fontWeight: 'bold', borderRadius: 16, padding: '0.5rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer' }}>Tudo</button>
              <button onClick={() => setFilter('entradas')} style={{ background: filter === 'entradas' ? palette.purpleVivid : '#fff', border: `1.5px solid ${palette.purpleLight}`, color: filter === 'entradas' ? '#fff' : palette.purpleLight, fontWeight: 'bold', borderRadius: 16, padding: '0.5rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer' }}>Entradas</button>
              <button onClick={() => setFilter('saidas')} style={{ background: filter === 'saidas' ? palette.purpleVivid : '#fff', border: `1.5px solid ${palette.purpleLight}`, color: filter === 'saidas' ? '#fff' : palette.purpleLight, fontWeight: 'bold', borderRadius: 16, padding: '0.5rem 1.2rem', fontSize: '0.95rem', cursor: 'pointer' }}>Saídas</button>
            </div>

            <section style={{ background: '#fff', borderRadius: 24, margin: '0 3rem 2.5rem 3rem', padding: '1.2rem 1.4rem', minHeight: 250, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Tipo</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Loja</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Pagamento</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Descrição</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Valor</th>
                    <th style={{ textAlign: 'left', padding: '0.6rem', color: palette.purpleLight }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: t.tipo === 'entrada' ? palette.emerald : palette.red }}>{t.tipo === 'entrada' ? 'Venda' : 'Compra'}</td>
                      <td style={{ padding: '0.65rem' }}>{t.loja || '-'}</td>
                      <td style={{ padding: '0.65rem' }}>{t.metodoPagamento || '-'}</td>
                      <td style={{ padding: '0.65rem' }}>{t.tipo === 'entrada' ? (t.produto || t.desc) : t.desc}</td>
                      <td style={{ padding: '0.65rem', color: t.tipo === 'entrada' ? palette.emerald : palette.red, fontWeight: 'bold' }}>{t.tipo === 'entrada' ? '+' : '-'} {formatBRL(Number(t.valor))}</td>
                      <td style={{ padding: '0.65rem' }}>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {activeModule === 'financeiro' && (
          <div style={{ padding: '3rem', color: palette.purpleDeep }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, marginBottom: '1rem' }}>Financeiro</h2>
            <div style={{ margin: '0 0 1.4rem 0', background: '#fff', borderRadius: 24, padding: '1.3rem 1.8rem', borderLeft: `8px solid ${saldoLiquidoDia >= 0 ? palette.emerald : palette.red}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: palette.purpleLight, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Saldo Líquido do Dia</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: saldoLiquidoDia >= 0 ? palette.emerald : palette.red }}>{formatBRL(saldoLiquidoDia)}</div>
                <div style={{ marginTop: '0.4rem', fontWeight: 700, color: caixaAberto ? palette.emerald : palette.red }}>
                  Status do Caixa: {caixaAberto ? 'Aberto' : 'Fechado'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.2rem', fontWeight: 'bold', color: palette.purpleDeep }}>
                <span>Entradas: {formatBRL(totalEntradasDia)}</span>
                <span>Saídas: {formatBRL(totalSaidasDia)}</span>
              </div>
            </div>
            {ultimoFechamento && (
              <div style={{ margin: '0 0 1.2rem 0', background: '#fff', borderRadius: 16, padding: '0.9rem 1.1rem', border: `1px solid ${palette.purpleLight}` }}>
                <strong>Último fechamento:</strong> {new Date(ultimoFechamento.fechadoEm).toLocaleString('pt-BR')} | Saldo Líquido: {formatBRL(ultimoFechamento.saldoLiquido)}
              </div>
            )}
            <section style={{ background: '#fff', borderRadius: 24, padding: '1.2rem 1.4rem', overflowX: 'auto' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>Fechamento por Loja e Método ({dataFechamento.split('-').reverse().join('/')})</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.55rem', color: palette.purpleLight }}>Loja</th>
                    {metodosPagamento.map(metodo => <th key={metodo} style={{ textAlign: 'left', padding: '0.55rem', color: palette.purpleLight }}>{metodo}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {lojas.map(loja => (
                    <tr key={loja}>
                      <td style={{ padding: '0.6rem', fontWeight: 700 }}>{loja}</td>
                      {metodosPagamento.map(metodo => {
                        const bloco = resumoLojasMetodos[loja][metodo];
                        const saldo = bloco.entrada - bloco.saida;
                        return (
                          <td key={`${loja}-${metodo}`} style={{ padding: '0.6rem', color: saldo >= 0 ? palette.emerald : palette.red, fontWeight: 700 }}>
                            {formatBRL(saldo)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section style={{ background: '#fff', borderRadius: 24, padding: '1.2rem 1.4rem', marginTop: '1.2rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '1rem' }}>Gráfico de Vendas por Forma de Pagamento</div>
              {metodosPagamento.map(metodo => {
                const valor = graficoPagamentosDia[metodo];
                const largura = `${(valor / maiorValorGrafico) * 100}%`;
                return (
                  <div key={metodo} style={{ marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 700 }}>
                      <span>{metodo}</span>
                      <span>{formatBRL(valor)}</span>
                    </div>
                    <div style={{ width: '100%', height: 12, background: '#eee', borderRadius: 99 }}>
                      <div style={{ width: largura, height: '100%', borderRadius: 99, background: palette.purpleVivid }} />
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        )}
        {activeModule === 'funcionarios' && (
          <div style={{ padding: '3rem', color: palette.purpleDeep }}>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 700, color: palette.purpleDeep, marginBottom: '2rem' }}>Funcionários</h2>
            <form onSubmit={adicionarFuncionario} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', maxWidth: 400 }}>
              <input type="text" value={novoFuncionario} onChange={e => setNovoFuncionario(e.target.value)} placeholder="Nome do funcionário" style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: 16, border: `1.5px solid ${palette.purpleLight}`, fontSize: '1rem' }} />
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
                  <tr key={idx} style={{ background: '#fff', borderRadius: 16 }}>
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
