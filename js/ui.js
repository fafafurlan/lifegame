// Ano a Ano · interface: tela principal, painéis, ações do jogador, minijogo, som.

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ================= avatares =================
const PELES = ['#F6D7B8', '#EBBF94', '#D49A6A', '#B07445', '#8A5530', '#5E3A20'];
const CABELOS = ['#2B1B10', '#5A3A1E', '#A0642B', '#D9B25A', '#151515'];
const BICHOS = { 'cão': '🐕', gato: '🐈', ave: '🐦', coelho: '🐇' };
function avatar(p, extra = '') {
  if (p.tipo === 'pet') return `<span class="av pet ${extra}" aria-hidden="true">${BICHOS[p.especie] || '🐾'}</span>`;
  const pele = PELES[p.pele ?? 2], idade = p.idade ?? 30;
  const cab = idade >= 62 ? '#CFCFCF' : CABELOS[p.cabelo ?? 0];
  const f = p.sexo === 'F';
  let cabelo = '';
  if (idade < 2) cabelo = `<path d="M18 9 q2 -4 4 0" stroke="${cab}" stroke-width="2" fill="none"/>`;
  else if (f) cabelo = `<path d="M6 24 Q5 7 20 6 Q35 7 34 24 L34 32 Q31 24 30 16 Q20 12 10 16 Q9 24 6 32Z" fill="${cab}"/>`;
  else if (idade >= 62 && p.cabelo % 2) cabelo = `<path d="M8 17 Q9 13 11 15 M32 17 Q31 13 29 15" stroke="${cab}" stroke-width="3" fill="none"/>`;
  else cabelo = `<path d="M7 18 Q8 6 20 6 Q32 6 33 18 Q28 11 20 12 Q12 11 7 18Z" fill="${cab}"/>`;
  const boca = idade < 2 ? '<circle cx="20" cy="27" r="3" fill="#E26B8F"/><circle cx="20" cy="27" r="1.2" fill="#fff"/>' : '<path d="M15 26 Q20 30 25 26" stroke="#4A2A1A" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  const oculos = idade >= 50 && (p.cabelo ?? 0) > 2 ? '<g stroke="#333" stroke-width="1.1" fill="none"><circle cx="15" cy="20" r="3.4"/><circle cx="25" cy="20" r="3.4"/><path d="M18.4 20h3.2"/></g>' : '';
  return `<span class="av ${extra}" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="21" r="13" fill="${pele}"/>${cabelo}<circle cx="15" cy="20" r="1.5" fill="#2A1A10"/><circle cx="25" cy="20" r="1.5" fill="#2A1A10"/>${boca}${oculos}</svg></span>`;
}

// ================= componentes =================
const cor = v => (v < 25 ? 'var(--bad)' : v < 50 ? 'var(--warn)' : 'var(--good)');
const mini = v => `<span class="mini"><span style="width:${v}%;background:${cor(v)}"></span></span>`;
const badge = d => (d ? `<span class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d}</span>` : '');
const secao = t => `<h4 class="secao">${t}</h4>`;
const nota = t => `<p class="nota">${t}</p>`;
function row(o) {
  const tag = o.tag !== undefined ? `<span class="tag mono">${o.tag}</span>` : '';
  const seta = o.go ? '<span class="seta" aria-hidden="true">›</span>' : '';
  const attrs = o.go ? `data-go="${o.go}"${o.arg !== undefined ? ` data-arg="${esc(o.arg)}"` : ''}` : (o.attrs || '');
  return `<button class="row" ${attrs}${o.off ? ' disabled' : ''}>${o.ico ? (o.ico.startsWith('<') ? o.ico : `<span class="ico" aria-hidden="true">${o.ico}</span>`) : ''}<span class="txt"><b>${o.titulo}</b>${o.sub ? `<small>${o.sub}</small>` : ''}${o.barra !== undefined ? mini(o.barra) : ''}</span>${tag}${seta}</button>`;
}
const act = (a, ds = {}) => `data-act="${a}" ${Object.entries(ds).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}`;
const feito = k => !!S.feitosAno[k];
const pago = c => (S.idade >= 18 && !S.preso ? preco(c) : 0);

// ================= tela principal =================
function estagio() {
  if (!S.vivo) return ['Fim', '🕊️'];
  if (S.preso) return ['Prisão', '⛓️'];
  if (S.idade < 6) return [S.idade < 2 ? 'Bebê' : 'Infância', '🍼'];
  if (S.escola) return ['Escola', '🎒'];
  if (S.faculdade) return ['Faculdade', '🎓'];
  if (S.aposentado && !S.emprego) return ['Aposentadoria', '🏖️'];
  return ['Trabalho', '💼'];
}
function ocupacao() {
  if (!S.vivo) return G('Falecido', 'Falecida');
  if (S.preso) return `${G('Preso', 'Presa')} · falta${S.preso > 1 ? 'm' : ''} ${anos(S.preso)}`;
  if (S.emprego) return S.emprego.id === 'ator' ? `${S.emprego.titulo} · ${NIVEIS_ATOR[S.emprego.nivel].toLowerCase()}` : S.emprego.titulo;
  if (S.faculdade) return `${G('Universitário', 'Universitária')} · ${S.faculdade.curso}`;
  if (S.escola) return S.escola.tipo === 'fundamental' ? `${S.idade - 5}º ano do fundamental` : `${S.idade - 14}º ano do médio`;
  if (S.aposentado) return G('Aposentado', 'Aposentada');
  if (S.idade < 2) return 'Bebê';
  if (S.idade < 6) return 'Criança';
  if (S.bico) return S.bico.nome;
  return G('Desempregado', 'Desempregada');
}
const STATS = [['felicidade', 'Felicidade'], ['saude', 'Saúde'], ['inteligencia', 'Inteligência'], ['aparencia', 'Aparência']];

function render() {
  $('avatar').innerHTML = avatar({ sexo: S.sexo, idade: S.idade, pele: S.pele, cabelo: S.cabelo });
  $('uf').textContent = S.pais === 'Brasil' ? S.uf : PAISES[S.pais].moeda;
  $('nome').textContent = S.nome;
  $('sub').textContent = ocupacao() + (S.seguidores >= 1000 ? ` · ${num(S.seguidores)} seguidores` : '');
  $('money').textContent = fmt(S.dinheiro);
  $('money').classList.toggle('neg', S.dinheiro < 0);
  const dm = deltas.dinheiro || 0;
  $('moneyDelta').innerHTML = dm ? `<span class="delta ${dm > 0 ? 'up' : 'down'}">${dm > 0 ? '+' : '−'}${fmt(Math.abs(dm))}</span>` : '';
  $('stats').innerHTML = STATS.map(([k, n]) => `<div class="stat"><span class="lbl">${n}</span><span class="bar"><span style="width:${S.st[k]}%;background:${cor(S.st[k])}"></span></span><span class="v mono">${S.st[k]}%</span>${badge(deltas[k])}</div>`).join('');
  deltas = {};
  const [et, ei] = estagio();
  $('tabOcupacao').innerHTML = `<span class="ico-c">${ei}</span>${et}`;

  let html = '';
  if (!S.vivo) {
    const f = S.fita || fita();
    const herdeiros = filhosVivos();
    html += `<section class="obit">
      <span class="fita">${esc(f[0])}</span>
      <h2>${esc(S.nome)}</h2>
      <p class="nota">${esc(f[1])}</p>
      <dl><dt>Viveu</dt><dd class="mono">${S.nasc.ano} – ${S.ano} · ${S.idade} anos</dd>
      <dt>Profissão</dt><dd>${esc(S.ultimoTrabalho || 'Nenhuma')}</dd>
      <dt>Formação</dt><dd>${S.cursos.length ? S.cursos.join(', ') : FORM_NOME[S.formacao]}</dd>
      <dt>Filhos</dt><dd class="mono">${S.rel.filter(r => r.tipo === 'filho').length}</dd>
      <dt>Reputação</dt><dd>${reputacao()}</dd>
      <dt>Patrimônio</dt><dd class="mono">${fmt(patrimonio())}</dd></dl>
      <div class="legado">
        ${herdeiros.map(h => `<button class="primary" ${act('legado', { id: h.id })}>Continuar como ${esc(h.nome.split(' ')[0])} (${h.idade} anos)</button>`).join('')}
        <button class="${herdeiros.length ? 'ghost' : 'primary'}" ${act('novaVidaRapida')}>Viver uma vida nova</button>
      </div></section>`;
  }
  html += S.log.slice().reverse().map((y, i) => `<article class="yr${i === 0 ? ' now' : ''}"><h3>Idade: ${anos(y.i)} <span class="mono">${y.a}</span></h3>
    <ul>${y.l.map(x => `<li class="cat-${x.c || 'vida'} ${x.tone}">${esc(x.t)}</li>`).join('')}</ul></article>`).join('');
  $('log').innerHTML = html;
  $('age').disabled = !S.vivo || S.fila.length > 0;
  checarConquistas();
  renderModal();
  if (pilha.length) desenharPainel();
}
function reputacao() {
  const k = S.karma;
  return k >= 85 ? 'Exemplar' : k >= 65 ? 'Boa' : k >= 40 ? 'Normal' : k >= 20 ? 'Duvidosa' : 'Péssima';
}

// ================= cartões (eventos, avisos, resultados, perfil) =================
// Eventos do jogo ficam em S.fila e têm prioridade. CARTAO é um popup da interface que não é salvo.
let CARTAO = null;
let ultimoItem = null;
function cartaoDoItem(item) {
  if (item.id === '__marco') return { cat: 'vida', etiqueta: 'Marco da vida', ico: '🎉', titulo: item.d.titulo, texto: item.d.texto, marco: true, botoes: [{ t: 'Seguir em frente', attrs: 'data-escolha="0"', cls: 'ok' }] };
  if (item.id === '__info') { const d = item.d, p = d.pessoa; return { cat: d.cat, etiqueta: p ? (p.tipo === 'pet' ? 'Animal de estimação' : rotulo(p)) : (CATS[d.cat] || 'Vida'), pessoa: p, ico: d.ico, titulo: d.titulo, texto: d.texto, info: d.info, botoes: [{ t: 'OK', attrs: 'data-escolha="0"', cls: 'ok' }] }; }
  const e = EV[item.id];
  if (!e) return null;
  if (e.cond) { try { if (!e.cond(S)) return null; } catch (err) { return null; } }
  const d = item.d, lista = typeof e.escolhas === 'function' ? e.escolhas(S, d) : e.escolhas;
  const p = e.pessoa ? e.pessoa(S, d) : null;
  return {
    cat: e.cat, ico: e.ico || CAT_ICO[e.cat], titulo: typeof e.titulo === 'function' ? e.titulo(S, d) : e.titulo,
    etiqueta: p ? (p.tipo === 'amigo' ? (p.sexo === 'F' ? 'Amiga' : 'Amigo') : p.tipo === 'parceiro' ? 'Paquera' : rotulo(p)) : (CATS[e.cat] || 'Vida'),
    texto: typeof e.texto === 'function' ? e.texto(S, d) : e.texto, pessoa: p,
    info: p ? [['Nome', p.nome], ['Gênero', p.sexo === 'F' ? 'Feminino' : 'Masculino'], ['Idade', String(p.idade)]] : null,
    barras: p ? [['Aparência', p.ap], ['Inteligência', p.int], ['Doideira', p.doido]] : null,
    botoes: lista.map((c, i) => ({ t: rotuloTexto(c.t), attrs: `data-escolha="${i}"` })), surpresa: lista.length > 1
  };
}
function desenharCartao(c) {
  const m = $('modal');
  m.classList.toggle('marco', !!c.marco);
  m.style.setProperty('--cor', c.marco ? 'var(--sun)' : `var(--c-${c.cat || 'vida'})`);
  $('evAv').innerHTML = c.pessoa ? avatar(c.pessoa) : '';
  $('evNome').textContent = c.pessoa ? c.pessoa.nome : '';
  $('evCat').textContent = c.etiqueta || '';
  $('evCab').hidden = !c.titulo;
  $('evIco').textContent = c.ico || '';
  $('evTitulo').textContent = c.titulo || '';
  $('evTexto').textContent = c.texto || '';
  $('evTexto').hidden = !c.texto;
  $('evInfo').innerHTML = (c.info || []).map(([k, v]) => `<div><dt>${esc(k)}:</dt><dd>${esc(v)}</dd></div>`).join('');
  $('evInfo').hidden = !(c.info && c.info.length);
  $('evBarras').innerHTML = (c.barras || []).map(([k, v, d]) => `<span class="lbl">${k}</span><span class="bar"><span style="width:${v}%;background:${cor(v)}"></span></span><span class="v mono">${d === undefined ? '' : (d > 0 ? '+' : '') + d}</span>`).join('');
  $('evBarras').hidden = !(c.barras && c.barras.length);
  $('evForm').innerHTML = (c.form || []).map(f => `<label class="campo-ev"><span>${f.label}:</span><select id="f_${f.id}">${f.opcoes.map((o, i) => `<option value="${i}">${o}</option>`).join('')}</select></label>`).join('');
  $('evForm').hidden = !c.form;
  $('evExtra').innerHTML = c.html || '';
  $('evExtra').hidden = !c.html;
  $('modalChoices').innerHTML = c.botoes.map(b => `<button ${b.attrs} class="${b.cls || ''}">${esc(b.t)}</button>`).join('');
  $('evSurpresa').hidden = !c.surpresa;
  $('modalX').hidden = !c.fechar;
  const novo = m.hidden;
  m.hidden = false;
  if (novo) { const b = $('modalChoices').querySelector('button') || $('modalX'); if (b) b.focus(); }
}
function renderModal() {
  const item = S.vivo ? S.fila[0] : null;
  if (item) {
    const c = cartaoDoItem(item);
    if (!c) { S.fila.shift(); renderModal(); return; }
    if (item.id === '__marco' && ultimoItem !== item) { som('marco'); confete(); }
    ultimoItem = item;
    desenharCartao(c);
    return;
  }
  if (CARTAO) { desenharCartao(CARTAO); return; }
  $('modal').hidden = true;
}
function escolher(i) {
  deltas = {};
  const item = S.fila.shift();
  if (item.id !== '__marco' && item.id !== '__info') {
    const e = EV[item.id];
    const lista = typeof e.escolhas === 'function' ? e.escolhas(S, item.d) : e.escolhas;
    CUR_CAT = e.cat || 'vida';
    try { lista[i].fx(S, item.d); } catch (err) { console.warn('Escolha com erro:', item.id, err); }
    CUR_CAT = null;
  }
  morteImediata();
  salvar(); render();
}
function surpresa() {
  const item = S.fila[0];
  if (!item || item.id === '__marco' || item.id === '__info') return;
  const e = EV[item.id], lista = typeof e.escolhas === 'function' ? e.escolhas(S, item.d) : e.escolhas;
  escolher(Math.floor(Math.random() * lista.length));
}
// Roda uma ação e, se ela não abriu outro evento, mostra o resultado num popup
function comResultado(fn, titulo, ico) {
  const linhas = S.log[S.log.length - 1].l, n = linhas.length, fila = S.fila.length;
  fn();
  const novas = linhas.slice(n);
  if (!S.vivo || S.fila.length > fila || !novas.length) return;
  const ult = novas[novas.length - 1], ruim = novas.some(x => x.tone === 'bad');
  const barras = STATS.filter(([k]) => deltas[k]).map(([k, nome]) => [nome, S.st[k], deltas[k]]);
  CARTAO = {
    cat: ult.c, etiqueta: CATS[ult.c] || 'Vida', ico: ico || (ruim ? '😬' : '😄'),
    titulo: titulo || (ruim ? pick(['Deu ruim', 'Que pena', 'Ih...']) : pick(['Foi demais', 'Mandou bem', 'Que dia!', 'Valeu a pena'])),
    texto: novas.map(x => x.t).join(' '), barras,
    info: deltas.dinheiro ? [['Dinheiro', `${deltas.dinheiro > 0 ? '+' : '−'}${fmt(Math.abs(deltas.dinheiro))}`]] : null,
    botoes: [{ t: 'OK', attrs: 'data-cartao="ok"', cls: 'ok' }]
  };
}
function abrirPerfil() {
  if (!S) return;
  const eu = { nome: S.nome, sexo: S.sexo, idade: S.idade, pele: S.pele, cabelo: S.cabelo };
  CARTAO = {
    cat: 'vida', etiqueta: 'Você', ico: '🔍', titulo: 'Perfil', pessoa: eu, fechar: true, botoes: [],
    info: [['Gênero', S.sexo === 'F' ? 'Feminino' : 'Masculino'], ['Idade', String(S.idade)], ['Localização', S.pais === 'Brasil' ? `${S.cidade}, ${ESTADOS[S.uf].nome}` : S.pais], ['Signo', S.signo], ['Time', S.time], ['Reputação', reputacao()]],
    barras: STATS.map(([k, n]) => [n, S.st[k]])
  };
  renderModal();
}
function morteImediata() { if (S.vivo && S.st.saude <= 0) morte(); }

// ================= painéis =================
let pilha = [];
let confirmarFim = false;
function abrirPainel(id, arg, raiz) {
  if (raiz) pilha = [];
  pilha.push({ id, arg });
  $('painel').scrollTop = 0;
  desenharPainel(true);
}
function voltar() { pilha.pop(); if (pilha.length) desenharPainel(true); else fecharPainel(); }
function fecharPainel() { pilha = []; confirmarFim = false; $('painel').hidden = true; }
function desenharPainel(novo) {
  const { id, arg } = pilha[pilha.length - 1];
  const def = PAINEIS[id];
  if (!def) { fecharPainel(); return; }
  const corpo = $('painelCorpo');
  const y = corpo.scrollTop;
  const p = def(arg);
  if (!p) { voltar(); return; }
  $('painelTitulo').textContent = p.titulo;
  $('painelVoltar').innerHTML = pilha.length > 1 ? '‹' : '✕';
  $('painelVoltar').setAttribute('aria-label', pilha.length > 1 ? 'Voltar' : 'Fechar');
  corpo.innerHTML = p.html;
  corpo.scrollTop = novo ? 0 : y;
  $('painel').hidden = false;
}
const fim = () => (S.vivo ? '' : nota('Esta vida acabou. Continue com um herdeiro ou comece uma nova.'));

// ---------- ocupação ----------
function painelOcupacao() {
  const [titulo] = estagio();
  if (!S.vivo) return { titulo: 'Profissão', html: fim() };
  let h = '';
  if (S.preso) {
    h += `<div class="cartao"><b>Pena</b><span>Falta${S.preso > 1 ? 'm' : ''} ${anos(S.preso)} de prisão.</span></div>`;
    h += secao('Na prisão');
    h += row({ ico: '🏃', titulo: 'Tentar fugir', sub: 'Um caminho até a saída sem ser pego pelo guarda', attrs: act('fuga'), off: feito('fuga'), tag: feito('fuga') ? 'Este ano não' : '' });
    h += row({ ico: '📚', titulo: 'Projeto de leitura', sub: 'Reduz a pena se der certo', attrs: act('remicao'), off: feito('remicao') });
    h += row({ ico: '🏋️', titulo: 'Malhar no pátio', sub: 'Saúde', attrs: act('patio'), off: feito('patio') });
    return { titulo, html: h };
  }
  if (S.idade < 6) {
    h += nota('Por enquanto, sua única obrigação é crescer.');
    h += secao('Coisas de criança');
    h += row({ ico: '🧸', titulo: 'Brincar', sub: 'Felicidade', attrs: act('crianca', { id: 'brincar' }), off: feito('cr:brincar') });
    h += row({ ico: '😭', titulo: 'Fazer birra', sub: 'Mais atenção, menos paciência dos pais', attrs: act('crianca', { id: 'birra' }), off: feito('cr:birra') || S.idade < 1 });
    h += row({ ico: '📺', titulo: 'Assistir desenho', sub: 'Felicidade, um pouco de inteligência', attrs: act('crianca', { id: 'desenho' }), off: feito('cr:desenho') || S.idade < 1 });
    return { titulo, html: h };
  }
  h += secao('Você');
  let algo = false;
  if (S.escola) { algo = true; h += row({ ico: '🏫', titulo: `${S.escola.tipo === 'fundamental' ? 'Ensino fundamental' : 'Ensino médio'} (${S.escola.rede})`, sub: 'Notas', barra: S.st.inteligencia, go: 'escola' }); }
  if (S.faculdade) { algo = true; h += row({ ico: '🎓', titulo: `Faculdade de ${S.faculdade.curso}`, sub: 'Notas', barra: S.st.inteligencia, go: 'escola' }); }
  if (S.emprego) { algo = true; h += row({ ico: S.emprego.id === 'militar' ? '🎖️' : S.emprego.id === 'pol' ? '🏛️' : '💼', titulo: esc(S.emprego.titulo), sub: 'Desempenho', barra: S.emprego.desemp, go: 'trabalho' }); }
  if (S.bico) { algo = true; h += row({ ico: '🧢', titulo: S.bico.nome, sub: `Bico · ${fmt(S.bico.sal)} por ano`, tag: 'Largar', attrs: act('largarBico') }); }
  if (S.negocio) { algo = true; h += row({ ico: '🏪', titulo: S.negocio.nome, sub: `Sua empresa · vale ${fmt(S.negocio.valor)}`, go: 'empresa' }); }
  if (S.aposentado) { algo = true; h += row({ ico: '🏖️', titulo: G('Aposentado', 'Aposentada'), sub: `Pensão de ${fmt(S.pensao)} por ano` }); }
  if (!algo) h += nota('Você está sem ocupação no momento.');
  h += secao('Carreiras especiais');
  const ator = CARREIRAS.find(c => c.id === 'ator'), fut = CARREIRAS.find(c => c.id === 'fut');
  h += row({ ico: '🏛️', titulo: `${G('Político', 'Política')} <span class="rot">(carreira especial)</span>`, sub: S.idade < 18 ? 'A partir de 18 anos' : 'De vereador a presidente', go: S.idade >= 18 ? 'politica' : undefined, off: S.idade < 18 });
  h += row({ ico: '🏪', titulo: `${G('Empresário', 'Empresária')} <span class="rot">(carreira especial)</span>`, sub: S.idade < 18 ? 'A partir de 18 anos' : 'Abra seu próprio negócio', go: S.idade >= 18 ? 'empresa' : undefined, off: S.idade < 18 });
  h += row({ ico: '📱', titulo: `Influenciador${G('', 'a')} <span class="rot">(carreira especial)</span>`, sub: S.idade < 13 ? 'A partir de 13 anos' : 'Cresça nas redes sociais', go: S.idade >= 13 ? 'redes' : undefined, off: S.idade < 13 });
  h += row({ ico: '🎬', titulo: `${tituloCarreira(ator)} <span class="rot">(carreira especial)</span>`, sub: podeCandidatar(ator) || (feito('vaga:ator') ? 'Tente no ano que vem' : 'Fazer teste na emissora'), attrs: act('vaga', { id: 'ator' }), off: !!podeCandidatar(ator) || feito('vaga:ator') || !!S.emprego });
  h += row({ ico: '⚽', titulo: `${tituloCarreira(fut)} <span class="rot">(carreira especial)</span>`, sub: podeCandidatar(fut) || (feito('vaga:fut') ? 'Tente no ano que vem' : 'Tentar o time principal'), attrs: act('vaga', { id: 'fut' }), off: !!podeCandidatar(fut) || feito('vaga:fut') || !!S.emprego });
  h += secao('Todos');
  h += row({ ico: '🧢', titulo: 'Bicos', sub: S.idade < 12 ? 'A partir de 12 anos' : 'Ganhe um dinheiro rápido', go: S.idade >= 12 && !S.bico ? 'bicos' : undefined, off: S.idade < 12 || !!S.bico });
  h += row({ ico: '📞', titulo: 'Agência de empregos', sub: S.idade < 18 ? 'A partir de 18 anos' : 'Propostas prontas, sem entrevista', go: S.idade >= 18 && !S.emprego ? 'recrutador' : undefined, off: S.idade < 18 || !!S.emprego });
  h += row({ ico: '💵', titulo: 'Vagas de emprego', sub: S.idade < 16 ? 'A partir de 16 anos' : 'CLT, concursos e estágio', go: S.idade >= 16 && !S.emprego ? 'vagas' : undefined, off: S.idade < 16 || !!S.emprego });
  h += row({ ico: '🛡️', titulo: 'Exército', sub: S.idade < 18 ? 'A partir de 18 anos' : 'Carreira militar, de soldado a general', go: S.idade >= 18 ? 'militar' : undefined, off: S.idade < 18 });
  if (!S.escola && S.idade >= 17) h += row({ ico: '📚', titulo: 'Estudos', sub: 'ENEM, faculdade, cursinho e supletivo', go: 'estudos' });
  return { titulo: 'Profissão', html: h };
}
function painelEscola() {
  if (!S.escola && !S.faculdade) return null;
  let h = '';
  if (S.escola) {
    const e = S.escola;
    h += `<div class="cartao"><b>${esc(e.nome)}</b><span>${ocupacao()} · rede ${e.rede}</span>
      ${e.clubes.length ? `<span class="nota">Participa de: ${e.clubes.map(c => CLUBES.find(x => x.id === c).nome.toLowerCase()).join(', ')}.</span>` : ''}</div>`;
    h += secao('Atividades');
    h += row({ ico: '🔁', titulo: 'Mudar de escola', sub: e.rede === 'particular' ? 'Pedir para ir para uma escola pública' : 'Pedir para ir para uma escola particular', attrs: act('mudarEscola'), off: feito('mudarEscola') });
    h += row({ ico: '✏️', titulo: 'Turma e clubes', sub: 'Popularidade', barra: S.popularidade, go: 'clubes' });
    h += row({ ico: '🧑‍🏫', titulo: 'Corpo docente', sub: 'Interaja com seus professores', go: 'professores' });
    h += row({ ico: '🩹', titulo: 'Enfermaria', sub: 'Visite a enfermeira da escola', attrs: act('escola', { id: 'enfermaria' }), off: feito('es:enfermaria') });
    h += row({ ico: '📚', titulo: 'Estudar mais', sub: 'Faça um esforço extra', attrs: act('escola', { id: 'estudar' }), off: feito('es:estudar') });
    h += row({ ico: '🤝', titulo: 'Fazer amizades', sub: 'Popularidade, talvez um amigo novo', attrs: act('escola', { id: 'amizade' }), off: feito('es:amizade') });
    h += row({ ico: '🏃', titulo: 'Matar aula', sub: 'Divertido, até alguém descobrir', attrs: act('escola', { id: 'matar' }), off: feito('es:matar') || S.idade < 10 });
    if (e.tipo === 'medio') h += row({ ico: '📝', titulo: 'ENEM', sub: S.enem ? `Sua nota: ${S.enem}` : 'A prova acontece no 3º ano (aos 17)', off: true });
    h += row({ ico: '👋', titulo: 'Abandonar os estudos', sub: S.idade < 16 ? 'Só a partir dos 16 anos' : 'Largar a escola', attrs: act('largarEscola'), off: S.idade < 16 });
  } else {
    const f = S.faculdade;
    h += `<div class="cartao"><b>${f.curso}</b><span>${f.tipo === 'bolsa' ? 'Bolsa ProUni' : f.fies ? 'Particular com Fies' : f.tipo === 'pública' ? 'Universidade federal' : 'Faculdade particular'} · ${f.ano + 1}º de ${CURSOS[f.curso].anos} anos</span></div>`;
    h += secao('Atividades');
    h += row({ ico: '📚', titulo: 'Estudar mais', sub: 'Inteligência', attrs: act('escola', { id: 'estudar' }), off: feito('es:estudar') });
    h += row({ ico: '🎉', titulo: 'Festa universitária', sub: 'Felicidade, talvez um amor', attrs: act('escola', { id: 'festa' }), off: feito('es:festa') });
    h += row({ ico: '👋', titulo: 'Trancar a faculdade', sub: 'Você perde o progresso do curso', attrs: act('trancar') });
  }
  return { titulo: S.escola ? 'Escola' : 'Faculdade', html: h };
}
function painelProfessores() {
  if (!S.escola) return null;
  if (!S.escola.profs) S.escola.profs = novosProfs();
  return { titulo: 'Corpo docente', html: S.escola.profs.map(p => row({ ico: avatar(p), titulo: `${esc(p.nome)} <span class="rot">(${p.materia})</span>`, sub: 'Relação', barra: p.rel, go: 'professor', arg: p.id })).join('') };
}
const INTER_PROF = [
  ['conversar', 'Conversar'], ['ajuda', 'Pedir ajuda com a matéria'], ['elogiar', 'Elogiar a aula'], ['maca', 'Levar uma maçã'], ['nota', 'Reclamar da nota'], ['xingar', 'Xingar']
];
function painelProfessor(id) {
  const p = S.escola && S.escola.profs && S.escola.profs.find(x => x.id === id);
  if (!p) return null;
  let h = `<div class="perfil">${avatar(p, 'grande')}<div><b>${esc(p.nome)}</b><span>${G('Seu', 'Sua')} ${p.sexo === 'F' ? 'professora' : 'professor'} de ${p.materia}</span><div class="kv2"><span>Relação</span>${mini(p.rel)}</div></div></div>`;
  h += secao('Interações') + INTER_PROF.map(([k, n]) => row({ titulo: n, attrs: act('prof', { id: p.id, acao: k }), off: feito(`prof:${p.id}:${k}`), tag: feito(`prof:${p.id}:${k}`) ? 'Este ano já' : '' })).join('');
  return { titulo: p.nome.split(' ')[0], html: h };
}
function painelTrabalho() {
  const e = S.emprego;
  if (!e) return null;
  let h = `<div class="cartao"><b>${esc(e.titulo)}${e.id === 'ator' ? ` · ${NIVEIS_ATOR[e.nivel]}` : ''}</b><span class="mono">${fmt(e.sal)} por ano · ${anos(e.anos)} no cargo${e.id === 'pol' ? ` · mandato: falta${e.mandato > 1 ? 'm' : ''} ${anos(e.mandato)}` : ''}</span>
    <div class="kv2"><span>Desempenho</span>${mini(e.desemp)}</div></div>`;
  h += secao('Atividades');
  h += row({ ico: '💪', titulo: 'Trabalhar mais', sub: 'Desempenho', attrs: act('trab', { id: 'esforco' }), off: feito('trab:esforco') });
  if (e.id !== 'pol' && e.id !== 'militar') h += row({ ico: '💸', titulo: 'Pedir aumento', sub: 'Funciona melhor com bom desempenho', attrs: act('trab', { id: 'aumento' }), off: feito('trab:aumento') });
  h += row({ ico: '☕', titulo: 'Puxar papo com os colegas', sub: 'Felicidade, talvez um amigo', attrs: act('trab', { id: 'colegas' }), off: feito('trab:colegas') });
  h += row({ ico: '👋', titulo: e.id === 'pol' ? 'Renunciar ao mandato' : e.id === 'militar' ? 'Pedir baixa do Exército' : 'Pedir demissão', attrs: act('trab', { id: 'demissao' }) });
  if (S.idade >= 60 && e.id !== 'pol') h += row({ ico: '🏖️', titulo: 'Aposentar', sub: 'Pensão pelo resto da vida', attrs: act('trab', { id: 'aposentar' }) });
  return { titulo: 'Trabalho', html: h };
}
function painelEstudos() {
  let h = '';
  if (S.formacao === 'medio' || S.formacao === 'superior') {
    if (!S.faculdade) h += row({ ico: '🎓', titulo: 'Entrar na faculdade', sub: S.enem ? `Com sua nota do ENEM (${S.enem})` : 'Precisa fazer o ENEM antes', attrs: act('faculdade'), off: !S.enem });
    h += row({ ico: '📝', titulo: 'Fazer o ENEM', sub: S.enem ? `Nota atual: ${S.enem}` : 'Uma vez por ano', attrs: act('enem'), off: feito('enem') });
    if (!flag('cursinho')) h += row({ ico: '🏫', titulo: 'Fazer cursinho', sub: 'Aumenta a nota do próximo ENEM', tag: fmt(preco(6000)), attrs: act('cursinho'), off: S.dinheiro < preco(6000) });
  } else h += row({ ico: '📚', titulo: 'Supletivo (EJA)', sub: 'Concluir o ensino médio em um ano', tag: 'Grátis', attrs: act('supletivo'), off: feito('supletivo') });
  return { titulo: 'Estudos', html: h };
}
function ofertasDoAno() {
  if (!S.feitosAno.ofertas) {
    const ok = CARREIRAS.filter(c => !podeCandidatar(c) && !c.teste && !c.concurso && c.id !== 'fut' && !c.estudante);
    S.feitosAno.ofertas = ok.sort(() => Math.random() - .5).slice(0, 3).map(c => ({ id: c.id, sal: Math.round(c.sal * PAISES[S.pais].sal * R(85, 115) / 100) }));
  }
  return S.feitosAno.ofertas;
}
function painelRecrutador() {
  const of = ofertasDoAno();
  let h = nota('A agência encontrou estas vagas para o seu perfil. É só aceitar.');
  h += of.length ? of.map((o, i) => { const c = CARREIRAS.find(x => x.id === o.id); return row({ ico: '📄', titulo: tituloCarreira(c), sub: 'Aceitar a proposta', tag: `${fmt(o.sal)}/ano`, attrs: act('oferta', { i }), off: !!S.emprego || o.usada }); }).join('') : nota('Nenhuma vaga para o seu perfil este ano. Estudar ajuda.');
  return { titulo: 'Agência de empregos', html: h };
}
function motivoExercito() {
  if (S.idade > 30) return 'Até 30 anos';
  if (FORM[S.formacao] < FORM.medio) return 'Exige ensino médio';
  if (S.ficha > 0) return 'Exige ficha limpa';
  if (S.st.saude < 40) return 'Reprovado no exame de saúde';
  if (S.emprego) return 'Saia do emprego atual antes';
  return '';
}
function painelMilitar() {
  let h = '';
  if (S.emprego && S.emprego.id === 'militar') h += `<div class="cartao"><b>${PATENTES[S.emprego.nivel]}</b><span>Próxima patente: ${PATENTES[S.emprego.nivel + 1] || 'nenhuma, você chegou ao topo'}</span></div>`;
  else { const m = motivoExercito(); h += row({ ico: '🎖️', titulo: 'Alistar-se no Exército', sub: m || 'Entrar como soldado', attrs: act('alistar'), off: !!m || feito('alistar') }); }
  h += secao('Patentes') + nota(PATENTES.join(' › '));
  return { titulo: 'Exército', html: h };
}
function painelEmpresa() {
  let h = '';
  if (S.negocio) {
    const n = S.negocio;
    h += `<div class="cartao"><b>${n.nome}</b><div class="kv"><span>Investido</span><b class="mono">${fmt(n.investido)}</b><span>Valor de mercado</span><b class="mono">${fmt(n.valor)}</b><span>Anos de casa</span><b class="mono">${n.anos}</b></div></div>`;
    const extra = Math.round(n.investido * .3);
    const teto = n.investido >= preco(NEGOCIOS.find(x => x.id === n.id).custo) * 3;
    h += row({ ico: '📈', titulo: 'Investir mais', sub: teto ? 'O negócio já está no tamanho máximo' : 'Aumenta o lucro esperado', tag: fmt(extra), attrs: act('empresa', { op: 'investir' }), off: teto || S.dinheiro < extra || feito('empresa') });
    h += row({ ico: '🤝', titulo: 'Vender a empresa', tag: fmt(n.valor), attrs: act('empresa', { op: 'vender' }) });
  } else {
    h += nota('Escolha um negócio para abrir. O lucro varia todo ano e depende da sua inteligência.');
    h += NEGOCIOS.map(n => { const c = preco(n.custo); return row({ ico: n.ico, titulo: n.nome, tag: fmt(c), attrs: act('abrirNegocio', { id: n.id }), off: S.dinheiro < c }); }).join('');
  }
  return { titulo: 'Empresa', html: h };
}
// ---------- redes sociais ----------
const pesos = () => Object.values(S.redes).reduce((t, r) => t + r.peso, 0);
const segRede = id => (S.redes[id] && pesos() ? Math.round(S.seguidores * S.redes[id].peso / pesos()) : 0);
function postarEm(id, mult) {
  const r = S.redes[id];
  let g = Math.round((10 + S.st.aparencia) * R(1, 12) * (1 + S.seguidores / 20000) * mult);
  const pl = PLATAFORMAS.find(x => x.id === id);
  if (chance(.08)) { g *= R(10, 40); line(`Seu post no ${pl.nome} viralizou: mais ${num(g)} seguidores!`, 'good', 'fama'); }
  else line(`Você ganhou ${num(g)} seguidores no ${pl.nome}.`, '', 'fama');
  S.seguidores += g; r.peso += g; mod('felicidade', 1);
  if (!r.verificado && segRede(id) >= 100000) { r.verificado = true; setFlag('verificado'); line(`Sua conta no ${pl.nome} ganhou o selo de verificada!`, 'good', 'fama'); }
}
function painelRedes() {
  let h = nota(`Total: ${num(S.seguidores)} seguidores. A partir de 10 mil, as redes começam a pagar publicidade.`);
  h += PLATAFORMAS.map(pl => {
    const r = S.redes[pl.id];
    if (!r) return row({ ico: pl.ico, titulo: pl.nome, sub: S.idade < 13 ? 'A partir de 13 anos' : `Cadastre-se no ${pl.nome}`, attrs: act('rede', { id: pl.id, op: 'cadastrar' }), off: S.idade < 13 });
    return row({ ico: pl.ico, titulo: `${pl.nome}${r.verificado ? ' ✔️' : ''}`, sub: `${num(segRede(pl.id))} seguidores`, go: 'rede', arg: pl.id });
  }).join('');
  return { titulo: 'Redes sociais', html: h };
}
function painelRede(id) {
  const pl = PLATAFORMAS.find(x => x.id === id), r = S.redes[id];
  if (!r) return null;
  let h = `<div class="cartao"><b>${pl.ico} ${pl.nome}${r.verificado ? ' ✔️' : ''}</b><span>${num(segRede(id))} seguidores</span></div>`;
  h += row({ titulo: pl.acao, sub: 'Seguidores', attrs: act('rede', { id, op: 'postar' }), off: feito('rede:' + id) });
  if (['tiktok', 'youtube', 'twitch', 'kwai'].includes(id)) h += row({ titulo: 'Fazer uma live', sub: 'Seguidores e doações', attrs: act('rede', { id, op: 'live' }), off: feito('rede:' + id + ':live') || S.idade < 16 });
  h += row({ titulo: 'Criar polêmica', sub: 'Muitos seguidores ou cancelamento', attrs: act('rede', { id, op: 'polemica' }), off: feito('rede:' + id + ':pol') || S.idade < 16 });
  h += row({ titulo: 'Excluir conta', sub: 'Você perde os seguidores desta rede', attrs: act('rede', { id, op: 'excluir' }) });
  return { titulo: pl.nome, html: h };
}
function painelVagas() {
  let h = nota('Uma tentativa por vaga a cada ano.');
  h += CARREIRAS.map(c => {
    const motivo = podeCandidatar(c) || (feito('vaga:' + c.id) ? 'Tente no ano que vem' : '');
    const sal = c.id === 'fut' ? 'variável' : `${fmt(c.sal * PAISES[S.pais].sal)}/ano`;
    return row({ titulo: tituloCarreira(c), sub: motivo || (c.concurso ? 'Prestar concurso' : c.teste ? 'Fazer teste na emissora' : 'Candidatar-se'), tag: sal, attrs: act('vaga', { id: c.id }), off: !!motivo || !!S.emprego });
  }).join('');
  return { titulo: 'Vagas', html: h };
}
function painelBicos() {
  let h = nota('Dá para fazer bico junto com a escola ou a faculdade.');
  h += BICOS.map(b => {
    const motivo = S.idade < b.idade ? `A partir de ${b.idade} anos` : b.veiculo && !temVeiculo() ? 'Precisa de bicicleta ou moto (Bens › Veículos)' : '';
    return row({ titulo: b.nome, sub: motivo || 'Começar', tag: `${fmt(b.sal)}/ano`, attrs: act('bico', { id: b.id }), off: !!motivo || !!S.bico });
  }).join('');
  return { titulo: 'Bicos', html: h };
}
function painelPolitica() {
  let h = nota(`Campanha custa 15% do salário do cargo. Pesam a sua reputação (${reputacao().toLowerCase()}), a aparência e os seguidores.`);
  h += CARGOS.map(c => {
    const motivo = podeConcorrer(c) || (feito('eleicao') ? 'Uma eleição por ano' : '');
    return row({ titulo: G(c.m, c.f), sub: motivo || `Concorrer · campanha de ${fmt(preco(c.sal * .15))}`, tag: S.cargos.includes(c.id) ? 'Já exerceu' : `${fmt(c.sal * PAISES[S.pais].sal)}/ano`, attrs: act('concorrer', { id: c.id }), off: !!motivo || S.dinheiro < preco(c.sal * .15) });
  }).join('');
  return { titulo: 'Política', html: h };
}
function painelClubes() {
  let h = nota('Os clubes rendem um pouco por ano enquanto você participa.');
  h += CLUBES.map(c => {
    const dentro = S.escola && S.escola.clubes.includes(c.id);
    return row({ titulo: c.nome, sub: dentro ? 'Você participa · tocar para sair' : 'Entrar', attrs: act('clube', { id: c.id }), tag: dentro ? '✓' : '' });
  }).join('');
  return { titulo: 'Clubes', html: h };
}

// ---------- relações ----------
const GRUPOS_REL = [
  ['Cônjuge e namoro', r => r.tipo === 'parceiro'], ['Pais', r => r.tipo === 'mae' || r.tipo === 'pai'], ['Filhos', r => r.tipo === 'filho'],
  ['Irmãos', r => r.tipo === 'irmao'], ['Avós', r => r.tipo === 'avo'], ['Tios e primos', r => r.tipo === 'tio' || r.tipo === 'primo'],
  ['Amigos', r => r.tipo === 'amigo'], ['Bichos de estimação', r => r.tipo === 'pet'], ['Ex', r => r.tipo === 'ex']
];
function painelRelacoes() {
  let h = '';
  if (S.vivo && !S.preso && !achar('parceiro') && S.idade >= 14) h += row({ ico: '💘', titulo: 'Procurar alguém', sub: 'Amor', go: 'cat', arg: 'amor' });
  GRUPOS_REL.forEach(([nome, f]) => {
    const lista = S.rel.filter(r => r.vivo && f(r));
    if (!lista.length) return;
    h += secao(nome) + lista.map(r => row({ ico: avatar(r), titulo: `${esc(r.nome)} <span class="rot">(${rotulo(r)})</span>`, sub: `${anos(r.idade)}${r.prof ? ' · ' + r.prof : ''}`, barra: r.rel, go: 'pessoa', arg: r.id })).join('');
  });
  const mortos = S.rel.filter(r => !r.vivo);
  if (mortos.length) h += secao('Em memória') + mortos.map(r => row({ ico: avatar(r, 'dead'), titulo: `${esc(r.nome)} <span class="rot">(${rotulo(r)})</span>`, sub: r.sumiu ? 'Sumiu' : `Faleceu aos ${r.idade} anos` })).join('');
  return { titulo: 'Relações', html: h || nota('Ninguém por perto agora.') };
}
const humano = r => r.tipo !== 'pet';
const INTERACOES = [
  { id: 'conversar', nome: 'Conversar', ok: humano, fx: r => { r.rel = clamp(r.rel + R(3, 8)); mod('felicidade', R(1, 3)); line(`Você bateu um papo com ${quem(r)}.`); } },
  { id: 'elogiar', nome: 'Elogiar', ok: humano, fx: r => { r.rel = clamp(r.rel + R(2, 7)); karma(1); line(`Você elogiou ${quem(r)} e arrancou um sorriso.`); } },
  { id: 'abracar', nome: 'Dar um abraço', ok: r => humano(r) && r.tipo !== 'ex', fx: r => { r.rel = clamp(r.rel + R(4, 9)); mod('felicidade', 2); line(`Você deu um abraço apertado em ${quem(r)}.`); } },
  { id: 'tempo', nome: 'Passar tempo juntos', ok: r => humano(r) && r.tipo !== 'ex', fx: r => { r.rel = clamp(r.rel + R(6, 12)); mod('felicidade', R(2, 5)); line(`Você passou um dia inteiro com ${quem(r)}.`, 'good'); } },
  { id: 'conselho', nome: 'Pedir conselho', ok: r => humano(r) && r.idade >= S.idade + 10, fx: r => { r.rel = clamp(r.rel + 3); mod('inteligencia', R(0, 2)); line(`${r.nome} te aconselhou: "${pick(['Estuda, que conhecimento ninguém te tira.', 'Não empresta dinheiro pra parente.', 'Guarda um pouco todo mês.', 'Cuida da sua saúde enquanto é tempo.', 'Não confia em promessa de político.', 'Sempre leva um casaquinho.'])}"`); } },
  { id: 'churrasco', nome: 'Chamar para um churrasco', ok: r => humano(r) && S.idade >= 18 && r.idade >= 10 && r.tipo !== 'ex', custo: 150, fx: r => { r.rel = clamp(r.rel + R(8, 14)); mod('felicidade', 3); line(`Você fez um churrasco e chamou ${quem(r)}. Teve picanha e pagode.`, 'good'); } },
  { id: 'presente', nome: 'Dar um presente', ok: r => humano(r) && S.idade >= 8, custo: 300, fx: r => { r.rel = clamp(r.rel + R(8, 14)); karma(1); line(`Você deu um presente para ${quem(r)}.`); } },
  { id: 'dinheiro', nome: 'Pedir dinheiro', ok: r => ['mae', 'pai', 'avo'].includes(r.tipo), fx: r => {
    if (chance(r.rel / 130)) { const v = R(5, 50) * 10 * (S.idade >= 18 ? 10 : 1); grana(v); line(`${quem(r)} te deu ${fmt(v)}.`, 'good', 'dinheiro'); }
    else { r.rel = clamp(r.rel - 3); line(`${quem(r)} disse que dinheiro não dá em árvore.`); } } },
  { id: 'ler', nome: 'Ler uma história', ok: r => r.tipo === 'filho' && r.idade < 10 && S.idade >= 16, fx: r => { r.rel = clamp(r.rel + 10); mod('felicidade', 3); line(`Você leu uma história para ${r.nome} dormir.`, 'good'); } },
  { id: 'mesada', nome: 'Dar mesada', ok: r => r.tipo === 'filho' && r.idade >= 6 && r.idade < 18 && S.idade >= 18, custo: 1200, fx: r => { r.rel = clamp(r.rel + 8); line(`Você deu mesada para ${r.nome} o ano todo.`); } },
  { id: 'namorar', nome: 'Chamar para namorar', ok: r => r.tipo === 'amigo' && !achar('parceiro') && S.idade >= 14 && r.idade >= 14, fx: r => {
    if (chance(r.rel / 150)) { r.tipo = 'parceiro'; r.casado = false; r.rel = clamp(r.rel + 10); mod('felicidade', 10); line(`${r.nome} topou! Vocês estão namorando.`, 'good', 'amor'); }
    else { r.rel = clamp(r.rel - 10); mod('felicidade', -4); line(`${r.nome} disse que te vê só como amizade.`, 'bad', 'amor'); } } },
  { id: 'casar', nome: 'Pedir em casamento', ok: r => r.tipo === 'parceiro' && !r.casado && S.idade >= 18, fx: r => {
    if (r.rel >= 65 && chance(.8)) casar(r);
    else { r.rel = clamp(r.rel - 15); mod('felicidade', -8); line(`${r.nome} disse que ainda não está pront${r.sexo === 'F' ? 'a' : 'o'}.`, 'bad', 'amor'); } } },
  { id: 'filho', nome: 'Tentar ter um filho', ok: r => r.tipo === 'parceiro' && S.idade >= 18 && S.idade <= 50, fx: () => { if (chance(.5)) nascerFilho(); else line('Não foi desta vez. Vocês podem tentar de novo no ano que vem.', '', 'familia'); } },
  { id: 'zoar', nome: 'Pregar uma peça', ok: r => humano(r) && S.idade >= 5, fx: r => { if (chance(.5)) { mod('felicidade', 4); r.rel = clamp(r.rel - 2); line(`Você escondeu o chinelo de ${quem(r)}. Todo mundo riu.`); } else { r.rel = clamp(r.rel - 10); line(`A brincadeira com ${quem(r)} não pegou bem.`, 'bad'); } } },
  { id: 'discutir', nome: 'Discutir', ok: humano, fx: r => { r.rel = clamp(r.rel - R(8, 18)); mod('felicidade', -R(1, 4)); line(`Você discutiu com ${quem(r)} no grupo da família.`, 'bad'); } },
  { id: 'xingar', nome: 'Xingar', ok: r => humano(r) && S.idade >= 6, fx: r => { r.rel = clamp(r.rel - R(15, 25)); karma(-3); line(`Você xingou ${quem(r)}.`, 'bad'); } },
  { id: 'terminar', nome: 'Terminar', ok: r => r.tipo === 'parceiro', fx: r => terminarRelacao(r) },
  { id: 'brincar', nome: 'Brincar', ok: r => r.tipo === 'pet', fx: r => { r.rel = clamp(r.rel + 8); mod('felicidade', R(3, 6)); line(`Você brincou com ${r.nome}.`, 'good'); } },
  { id: 'passear', nome: 'Levar para passear', ok: r => r.tipo === 'pet' && r.especie === 'cão', fx: r => { r.rel = clamp(r.rel + 6); mod('saude', 2); line(`Você levou ${r.nome} para passear na praça.`); } },
  { id: 'vet', nome: 'Levar ao veterinário', ok: r => r.tipo === 'pet', custo: 250, fx: r => { r.rel = clamp(r.rel + 3); r.idade = Math.max(0, r.idade - 1); line(`${r.nome} tomou vacina e está saudável.`); } },
  { id: 'doar', nome: 'Doar para outra família', ok: r => r.tipo === 'pet', fx: r => { r.vivo = false; r.sumiu = true; karma(-4); mod('felicidade', -6); line(`Você doou ${r.nome} para outra família.`, 'bad'); } }
];
function painelPessoa(id) {
  const r = S.rel.find(x => x.id === id);
  if (!r) return null;
  const attrs = r.ap !== undefined ? `<span>Aparência</span>${mini(r.ap)}<span>Inteligência</span>${mini(r.int)}<span>Doideira</span>${mini(r.doido)}` : '';
  let h = `<div class="perfil">${avatar(r, 'grande')}<div><b>${esc(r.nome)}</b><span>${rotulo(r)} · ${anos(r.idade)}${r.prof ? ' · ' + r.prof : ''}</span><div class="kv2"><span>Relação</span>${mini(r.rel)}${attrs}</div></div></div>`;
  if (!S.vivo || !r.vivo) return { titulo: r.nome.split(' ')[0], html: h };
  const lista = INTERACOES.filter(a => a.ok(r) && (!S.preso || a.id === 'conversar'));
  h += secao('Interações') + lista.map(a => {
    const c = a.custo ? pago(a.custo) : 0;
    const k = r.id + ':' + a.id;
    return row({ titulo: a.id === 'terminar' && r.casado ? 'Pedir divórcio' : a.nome, attrs: act('rel', { id: r.id, acao: a.id }), off: feito(k) || (c && S.dinheiro < c), tag: feito(k) ? 'Este ano já' : c ? fmt(c) : '' });
  }).join('');
  if (S.preso) h += nota('Na prisão, só dá para conversar no dia de visita.');
  return { titulo: r.nome.split(' ')[0], html: h };
}

// ---------- atividades ----------
// Itens genéricos: cada um pode ser feito uma vez por ano. custo só é cobrado de maiores de 18.
function itemSaude(nome, faixa, txt) { return () => { mod('saude', R(faixa[0], faixa[1])); line(txt, '', 'saude'); }; }
function aposta(v) {
  return () => {
    const n = (S.flags.apostas || 0) + 1; setFlag('apostas', n);
    if (n > 8 && !flag('apostador') && chance(.15)) { setFlag('apostador'); line('Você não consegue mais parar de apostar. Virou vício.', 'bad', 'dinheiro'); }
    if (chance(.45)) { grana(Math.round(v * 2.1)); mod('felicidade', 4); line(`Você acertou o placar e ganhou ${fmt(Math.round(v * 2.1))} na bet.`, 'good', 'dinheiro'); }
    else { mod('felicidade', -2); line(`Seu time perdeu e lá se foram ${fmt(v)} na bet.`, '', 'dinheiro'); }
  };
}
const ATIV = [
  { id: 'mente', ico: '🧘', nome: 'Mente e corpo', sub: 'Cuide de você', min: 6, itens: [
    { id: 'academia', nome: 'Academia', desc: 'Saúde e aparência', min: 13, custo: 1200, ico: '🏋️',
      form: [{ id: 'treino', label: 'Escolha o treino', opcoes: ['Musculação', 'Aeróbico', 'Funcional'] }, { id: 'freq', label: 'Escolha a frequência', opcoes: ['2 vezes por semana', '4 vezes por semana', 'Todo dia'] }],
      fx: v => { const f = v[1] + 1; if (v[1] === 2 && chance(.15)) { mod('saude', -5); line('Você exagerou no treino e se machucou.', 'bad', 'saude'); return; }
        if (v[0] !== 1) mod('aparencia', R(1, 2) * f); if (v[0] !== 0) mod('saude', R(1, 3) * f); mod('felicidade', 1);
        line(`Você fez ${['musculação', 'aeróbico', 'treino funcional'][v[0]]} ${['duas vezes por semana', 'quatro vezes por semana', 'todo dia'][v[1]]} o ano inteiro.`, '', 'saude'); } },
    { id: 'meditar', nome: 'Meditar', desc: 'Felicidade', min: 10, ico: '🧘',
      form: [{ id: 'tempo', label: 'Escolha o tempo', opcoes: ['10 minutos por dia', '30 minutos por dia', '1 hora por dia'] }],
      fx: v => { mod('felicidade', R(2, 4) * (v[0] + 1)); line(`Você meditou ${['dez minutos', 'meia hora', 'uma hora'][v[0]]} por dia e ficou mais em paz.`, '', 'saude'); } },
    { id: 'ler', nome: 'Ler um livro', desc: 'Inteligência', min: 7, fx: () => { mod('inteligencia', R(1, 3)); mod('felicidade', R(1, 3)); line(`Você leu "${pick(LIVROS)}".`, '', 'escola'); } },
    { id: 'caminhar', nome: 'Caminhada', desc: 'Saúde', min: 6, ico: '👟',
      form: [{ id: 'ritmo', label: 'Escolha seu ritmo', opcoes: ['Passeio', 'Caminhada rápida', 'Corrida'] }, { id: 'tempo', label: 'Escolha seu tempo', opcoes: ['15 minutos', '30 minutos', '1 hora'] }],
      fx: v => { if (v[0] === 2 && chance(.1)) { mod('saude', -4); line('Você torceu o pé correndo na calçada esburacada.', 'bad', 'saude'); return; }
        const g = Math.round((v[0] + 1) * (1 + v[1] * .5)); mod('saude', R(g, g + 2)); mod('felicidade', 1);
        line(`Você fez ${['um passeio', 'uma caminhada rápida', 'uma corrida'][v[0]]} de ${['15 minutos', '30 minutos', '1 hora'][v[1]]} todo fim de tarde.`, '', 'saude'); } },
    { id: 'pelada', nome: 'Pelada com os amigos', desc: 'Saúde e felicidade', min: 8, fx: () => { if (chance(.12)) { mod('saude', -6); line('Você torceu o tornozelo na pelada de domingo.', 'bad', 'saude'); } else { mod('saude', R(2, 5)); mod('felicidade', R(2, 4)); line('Você fez dois gols na pelada de domingo.', '', 'saude'); } } },
    { id: 'danca', nome: 'Aula de forró', desc: 'Felicidade e aparência', min: 12, custo: 600, fx: () => { mod('felicidade', R(3, 6)); mod('aparencia', 1); if (chance(.2)) conhecerAlguem('na aula de forró'); else line('Você aprendeu a dançar forró pé de serra.'); } },
    { id: 'yoga', nome: 'Yoga', desc: 'Saúde e felicidade', min: 12, custo: 800, fx: () => { mod('saude', R(2, 4)); mod('felicidade', R(2, 4)); line('Você fez aulas de yoga.', '', 'saude'); } }
  ] },
  { id: 'amor', ico: '💘', nome: 'Amor', sub: 'Encontre alguém', min: 14, itens: [
    { id: 'app', nome: 'App de namoro', desc: 'Chance depende da aparência', min: 18, fx: () => { if (chance(.25 + S.st.aparencia / 200)) conhecerAlguem('num app de namoro'); else { mod('felicidade', -2); line('Você passou o ano dando match com perfil fake.'); } } },
    { id: 'cegas', nome: 'Encontro arranjado pelos amigos', desc: 'Alguém conhecido de alguém', min: 16, fx: () => { if (chance(.4)) conhecerAlguem('num encontro arranjado pelos amigos'); else line('O encontro arranjado foi um silêncio constrangedor.'); } },
    { id: 'igreja', nome: 'Grupo de jovens da igreja', desc: 'Amizades e talvez um amor', min: 14, fx: () => { karma(2); if (chance(.3)) conhecerAlguem('no grupo de jovens'); else line('Você fez amizades no grupo de jovens.'); } }
  ], mostra: () => !achar('parceiro') },
  { id: 'noite', ico: '🍸', nome: 'Vida noturna', sub: 'Sair e se divertir', min: 16, itens: [
    { id: 'bar', nome: 'Barzinho com os amigos', desc: 'Felicidade', custo: 100, fx: () => { mod('felicidade', R(3, 6)); line('Você foi pro barzinho e pediu uma porção de mandioca.'); } },
    { id: 'pagode', nome: 'Roda de pagode', desc: 'Felicidade', custo: 80, fx: () => { mod('felicidade', R(4, 7)); if (chance(.2)) conhecerAlguem('numa roda de pagode'); else line('Você cantou todos os sambas da roda de pagode.'); } },
    { id: 'baile', nome: 'Baile funk', desc: 'Felicidade, risco', custo: 50, fx: () => { mod('felicidade', R(4, 8)); if (chance(.15)) { mod('saude', -5); line('O baile funk terminou com confusão e você se machucou.', 'bad'); } else if (chance(.2)) conhecerAlguem('no baile funk'); else line('Você dançou a noite toda no baile funk.'); } },
    { id: 'balada', nome: 'Balada', desc: 'Felicidade, talvez um amor', custo: 250, fx: () => { mod('felicidade', R(4, 8)); mod('saude', -R(0, 3)); if (chance(.25)) conhecerAlguem('numa balada'); else line('Você saiu com os amigos e dançou até de manhã.'); } },
    { id: 'karaoke', nome: 'Karaokê', desc: 'Felicidade', custo: 60, fx: () => { mod('felicidade', R(3, 6)); line(`Você cantou "${pick(['Evidências', 'Garçom', 'Ai se eu te pego', 'Fogo e Paixão', 'Sozinho'])}" no karaokê.`); } }
  ] },
  { id: 'medico', ico: '🩺', nome: 'Médico', sub: 'SUS, particular e tratamentos', min: 0, painel: 'medico' },
  { id: 'salao', ico: '💇', nome: 'Salão e spa', sub: 'Tempo para você', min: 8, itens: [
    { id: 'cabelo', nome: 'Cortar o cabelo', desc: 'Aparência', custo: 60, fx: () => { mod('aparencia', R(1, 3)); line('Você cortou o cabelo e saiu se sentindo outra pessoa.'); } },
    { id: 'barba', nome: 'Barbearia', desc: 'Aparência', min: 14, custo: 50, fx: () => { mod('aparencia', R(1, 2)); line('Você deu um trato no visual na barbearia.'); } },
    { id: 'unha', nome: 'Fazer as unhas', desc: 'Aparência', custo: 40, fx: () => { mod('aparencia', 1); mod('felicidade', 2); line('Você fez as unhas e ouviu todas as fofocas do bairro.'); } },
    { id: 'massagem', nome: 'Massagem', desc: 'Felicidade e saúde', min: 16, custo: 200, fx: () => { mod('felicidade', R(3, 5)); mod('saude', 1); line('Você fez uma massagem relaxante.'); } },
    { id: 'spa', nome: 'Dia de spa', desc: 'Muita felicidade', min: 18, custo: 800, fx: () => { mod('felicidade', R(6, 10)); mod('aparencia', 1); line('Você passou o dia num spa.', 'good'); } }
  ] },
  { id: 'plastica', ico: '💉', nome: 'Cirurgia plástica', sub: 'Mudar o visual, com riscos', min: 18, itens: [
    { id: 'harmonizacao', nome: 'Harmonização facial', desc: 'Aparência, risco pequeno', custo: 6000, fx: () => plastica(.85, [4, 8]) },
    { id: 'rino', nome: 'Rinoplastia', desc: 'Aparência', custo: 12000, fx: () => plastica(.8, [6, 12]) },
    { id: 'lipo', nome: 'Lipoaspiração', desc: 'Aparência, risco maior', custo: 18000, fx: () => plastica(.75, [8, 15]) },
    { id: 'capilar', nome: 'Implante capilar', desc: 'Aparência', custo: 15000, fx: () => plastica(.85, [5, 10]) }
  ] },
  { id: 'compras', ico: '🛍️', nome: 'Compras', sub: 'Shopping e camelô', min: 10, painel: 'compras' },
  { id: 'redes', ico: '📱', nome: 'Redes sociais', sub: 'Instagram, TikTok, YouTube...', min: 13, painel: 'redes', itens: [
    { id: 'post', nome: 'Postar fotos', desc: 'Seguidores', fx: () => postar(1) },
    { id: 'danca', nome: 'Gravar dancinha', desc: 'Mais seguidores, mais vergonha', fx: () => postar(1.6) },
    { id: 'live', nome: 'Fazer uma live', desc: 'Seguidores e dinheiro', min: 16, fx: () => { postar(1.3); if (S.seguidores > 5000) { const v = Math.round(S.seguidores * .05); grana(v); line(`A live rendeu ${fmt(v)} em doações.`, '', 'fama'); } } },
    { id: 'polemica', nome: 'Criar polêmica', desc: 'Muitos seguidores ou cancelamento', min: 16, fx: () => { if (chance(.5)) { postar(3); karma(-3); } else { S.seguidores = Math.round(S.seguidores * .6); mod('felicidade', -8); line(`Você foi ${G('cancelado', 'cancelada')} na internet.`, 'bad', 'fama'); } } },
    { id: 'comprar', nome: 'Comprar seguidores', desc: 'Rápido, mas pega mal', min: 16, custo: 2000, fx: () => { S.seguidores += 20000; karma(-3); line('Você comprou 20 mil seguidores. Todos com foto de ovo.', '', 'fama'); } }
  ] },
  { id: 'bichos', ico: '🐾', nome: 'Bichos de estimação', sub: 'Abrigo e pet shop', min: 6, painel: 'bichos' },
  { id: 'ferias', ico: '🏖️', nome: 'Férias e passeios', sub: 'Praia, show, viagens', min: 4, painel: 'ferias' },
  { id: 'apostas', ico: '🎲', nome: 'Apostas e loterias', sub: 'Mega-Sena, bet, bingo', min: 18, itens: [
    { id: 'mega', nome: 'Mega-Sena', desc: 'Prêmio milionário, chance mínima', custo: 5, fx: () => {
      if (chance(1 / 3000)) { const v = R(5, 80) * 1000000; grana(v); setFlag('mega'); mod('felicidade', 30); marco('Mega-Sena!', `Você acertou as seis dezenas e ganhou ${fmt(v)}!`); }
      else if (chance(.05)) { grana(1200); line(`Você acertou a quadra e ganhou ${fmt(1200)}.`, 'good', 'dinheiro'); } else line('Não deu nada na Mega-Sena.', '', 'dinheiro'); } },
    { id: 'lotofacil', nome: 'Lotofácil', desc: 'Prêmios menores, mais chance', custo: 3, fx: () => { if (chance(.01)) { const v = R(50, 900) * 1000; grana(v); line(`Você fez 15 pontos na Lotofácil e ganhou ${fmt(v)}!`, 'good', 'dinheiro'); } else if (chance(.12)) { grana(7); line('Você acertou 11 pontos na Lotofácil e recuperou a aposta.', '', 'dinheiro'); } else line('Não deu nada na Lotofácil.', '', 'dinheiro'); } },
    { id: 'raspadinha', nome: 'Raspadinha', desc: 'Sorte na hora', custo: 5, fx: () => { if (chance(.1)) { const v = pick([20, 50, 100, 1000]); grana(v); line(`A raspadinha deu ${fmt(v)}!`, 'good', 'dinheiro'); } else line('Raspadinha sem prêmio.', '', 'dinheiro'); } },
    { id: 'bet50', nome: 'Bet no futebol (pequena)', desc: 'Aposta de R$ 50', custo: 50, fx: aposta(50) },
    { id: 'bet500', nome: 'Bet no futebol (média)', desc: 'Aposta de R$ 500', custo: 500, fx: aposta(500) },
    { id: 'bet5000', nome: 'Bet no futebol (alta)', desc: 'Aposta de R$ 5.000', custo: 5000, fx: aposta(5000) },
    { id: 'bingo', nome: 'Bingo da paróquia', desc: 'Diversão garantida', custo: 20, fx: () => { if (chance(.15)) { const v = R(2, 20) * 100; grana(v); line(`Você gritou BINGO e levou ${fmt(v)}!`, 'good', 'dinheiro'); } else { mod('felicidade', 2); line('Você ficou a um número de gritar bingo.'); } } },
    { id: 'bicho', nome: 'Jogo do bicho', desc: 'Contravenção, mas todo mundo joga', custo: 10, fx: () => { karma(-1); const b = pick(['avestruz', 'águia', 'burro', 'borboleta', 'cachorro', 'cabra', 'carneiro', 'camelo', 'cobra', 'coelho', 'cavalo', 'elefante', 'galo', 'gato', 'jacaré', 'leão', 'macaco', 'porco', 'pavão', 'peru', 'touro', 'tigre', 'urso', 'veado', 'vaca']); if (chance(.04)) { grana(180); line(`Deu ${b} na cabeça! Você ganhou ${fmt(180)} no bicho.`, 'good', 'crime'); } else line(`Você jogou no ${b}, mas não deu.`, '', 'crime'); } }
  ] },
  { id: 'kart', ico: '🏎️', nome: 'Kart', sub: 'Acelerar no kartódromo', min: 10, itens: [
    { id: 'bateria', nome: 'Bateria de kart', desc: 'Felicidade', custo: 150, fx: () => { if (chance(.1)) { mod('saude', -5); line('Você rodou na curva e bateu no pneu.', 'bad'); } else { mod('felicidade', R(4, 7)); line(`Você chegou em ${R(1, 8)}º lugar no kart.`); } } }
  ] },
  { id: 'detran', ico: '🚗', nome: 'Detran', sub: 'Carteira de motorista', min: 18, itens: [
    { id: 'cnhcarro', nome: 'Tirar CNH de carro', desc: 'Prova teórica e prática', custo: 3500, acao: 'detran', tipo: 'carro', mostra: () => !S.cnh.carro },
    { id: 'cnhmoto', nome: 'Tirar CNH de moto', desc: 'Prova teórica e prática', custo: 2000, acao: 'detran', tipo: 'moto', mostra: () => !S.cnh.moto }
  ] },
  { id: 'emprestimo', ico: '🏦', nome: 'Empréstimo', sub: 'Banco ou agiota', min: 18, painel: 'emprestimo' },
  { id: 'processo', ico: '⚖️', nome: 'Processo', sub: 'Processar alguém', min: 18, itens: [
    { id: 'juizado', nome: 'Juizado de Pequenas Causas', desc: 'Grátis, causas pequenas', fx: () => processo(.4, [2, 10]) },
    { id: 'advogado', nome: 'Contratar advogado', desc: 'Mais chance, causas maiores', custo: 5000, fx: () => processo(.55, [10, 80]) }
  ] },
  { id: 'identidade', ico: '🪪', nome: 'Identidade', sub: 'Nome e preferências', min: 16, painel: 'identidade' },
  { id: 'familia', ico: '🍼', nome: 'Adoção e fertilidade', sub: 'Aumentar a família', min: 25, itens: [
    { id: 'adocao', nome: 'Entrar na fila de adoção', desc: 'Pode demorar', fx: () => { if (chance(.45)) nascerFilho(true); else line('Você continua na fila de adoção. Talvez no ano que vem.', '', 'familia'); } },
    { id: 'fiv', nome: 'Fertilização in vitro', desc: 'Tratamento caro', custo: 20000, fx: () => { if (chance(.45)) { nascerFilho(); if (chance(.15)) { nascerFilho(); line('Vieram gêmeos!', 'good', 'familia'); } } else line('A fertilização não deu certo desta vez.', 'bad', 'familia'); } }
  ] },
  { id: 'reab', ico: '🌱', nome: 'Reabilitação', sub: 'Largar os vícios', min: 12, mostra: () => flag('fumante') || flag('alcool') || flag('apostador'), itens: [
    { id: 'cigarro', nome: 'Largar o cigarro', desc: 'Difícil, mas possível', mostra: () => flag('fumante'), fx: () => largar('fumante', .3, 'Você largou o cigarro!') },
    { id: 'beber', nome: 'Parar de beber', desc: 'Difícil, mas possível', mostra: () => flag('alcool'), fx: () => largar('alcool', .3, 'Você parou de beber!') },
    { id: 'jogo', nome: 'Grupo de apoio para apostadores', desc: 'Sair do vício em apostas', mostra: () => flag('apostador'), fx: () => largar('apostador', .4, 'Você largou as apostas!') },
    { id: 'clinica', nome: 'Clínica de reabilitação', desc: 'Alta chance de largar tudo', min: 16, custo: 15000, fx: () => { if (chance(.75)) { setFlag('fumante', false); setFlag('alcool', false); setFlag('apostador', false); mod('felicidade', 8); line('Você saiu da clínica livre dos vícios.', 'good', 'saude'); } else line('A reabilitação não funcionou desta vez.', 'bad', 'saude'); } }
  ] },
  { id: 'emigrar', ico: '✈️', nome: 'Emigrar', sub: 'Morar em outro país', min: 18, itens: [
    { id: 'mudar', nome: 'Escolher um país', desc: 'Visto e passagem', fx: () => { S.fila.push({ id: 'emigrar', d: {} }); } }
  ] },
  { id: 'testamento', ico: '📜', nome: 'Testamento', sub: 'Quem fica com a herança', min: 18, painel: 'testamento' },
  { id: 'crime', ico: '🦹', nome: 'Crime', sub: 'Por sua conta e risco', min: 6, itens: [
    { id: 'travessura', nome: 'Travessura', desc: 'Tocar campainha e sair correndo', min: 6, fx: () => { karma(-1); if (chance(.25)) { paisVivos().forEach(r => { r.rel = clamp(r.rel - 5); }); line('O vizinho reconheceu você e contou para os seus pais.', 'bad', 'crime'); } else { mod('felicidade', 4); line('Você tocou a campainha do prédio inteiro e saiu correndo.', '', 'crime'); } } },
    { id: 'carteira', nome: 'Bater carteira', desc: 'No ônibus lotado', min: 12, fx: () => { karma(-5); if (chance(.3)) prender(1, 'furto'); else { const v = R(2, 30) * 10; grana(v); line(`Você bateu uma carteira no ônibus. Tinha ${fmt(v)}.`, '', 'crime'); } } },
    { id: 'encomenda', nome: 'Roubar encomenda', desc: 'Pacote esquecido na portaria', min: 12, fx: () => { karma(-4); if (chance(.2)) prender(1, 'furto'); else { const o = pick([['uma airfryer', 400], ['um fone de ouvido', 200], ['capinhas de celular', 30], ['um kit de skincare', 150]]); grana(o[1]); line(`Você pegou uma encomenda da portaria. Era ${o[0]}.`, '', 'crime'); } } },
    { id: 'pichar', nome: 'Pichar um muro', desc: 'Adrenalina', fx: () => {
      mod('felicidade', 3); karma(-2);
      if (chance(.25)) { if (S.idade < 18) { paisVivos().forEach(r => { r.rel = clamp(r.rel - 10); }); line(`Você foi ${G('pego', 'pega')} pichando e seus pais tiveram que pagar a pintura.`, 'bad', 'crime'); } else { grana(-2000); S.ficha++; line(`Você foi ${G('pego', 'pega')} pichando e pagou multa.`, 'bad', 'crime'); } }
      else line('Você pichou seu nome no viaduto.', '', 'crime'); } },
    { id: 'furtar', nome: 'Furtar numa loja', desc: 'Pouco dinheiro, risco médio', fx: () => { karma(-4); if (chance(.3)) prender(1, 'furto'); else { const v = R(5, 50) * 10; grana(v); line(`Você furtou coisas que valiam ${fmt(v)}.`, '', 'crime'); } } },
    { id: 'pirata', nome: 'Vender produto pirata', desc: 'Dinheiro médio, risco médio', min: 16, fx: () => { karma(-3); if (chance(.25)) prender(2, 'pirataria'); else { const v = R(2, 8) * 1000; grana(v); line(`Você faturou ${fmt(v)} vendendo produto pirata no camelô.`, '', 'crime'); } } },
    { id: 'golpe', nome: 'Aplicar golpe do Pix', desc: 'Prejudica gente honesta', min: 18, fx: () => { karma(-10); if (chance(.35)) prender(R(2, 5), 'estelionato'); else { const v = R(1, 8) * 1000; grana(v); line(`Você aplicou um golpe e levou ${fmt(v)}. A vítima era uma senhora aposentada.`, 'bad', 'crime'); } } },
    { id: 'banca', nome: 'Montar banca de jogo do bicho', desc: 'Dinheiro alto, risco alto', min: 18, fx: () => { karma(-6); if (chance(.3)) prender(R(2, 4), 'contravenção'); else { const v = R(5, 30) * 1000; grana(v); line(`Sua banca do bicho faturou ${fmt(v)} no ano.`, '', 'crime'); } } },
    { id: 'hackear', nome: 'Hackear', desc: 'Minijogo: ligue os pares antes do tempo acabar', min: 14, acao: 'hack' },
    { id: 'arrombar', nome: 'Arrombar uma casa', desc: 'Minijogo: pegue os objetos e fuja do cachorro', min: 12, acao: 'roubo' },
    { id: 'carro', nome: 'Roubar um carro', desc: 'Dinheiro alto, risco alto', min: 18, fx: () => { karma(-8); if (chance(.35)) prender(R(3, 6), 'roubo de veículo'); else { const v = R(10, 40) * 1000; grana(v); line(`Você roubou um carro e vendeu no desmanche por ${fmt(v)}.`, '', 'crime'); } } },
    { id: 'desvio', nome: 'Desviar dinheiro do trabalho', desc: 'Arriscado e difícil de esconder', min: 18, mostra: () => !!S.emprego, fx: () => { karma(-8); const pol = S.emprego.id === 'pol'; if (chance(.3)) prender(R(3, 8), pol ? 'corrupção' : 'peculato'); else { const v = Math.round(S.emprego.sal * R(10, 40) / 100); grana(v); line(pol ? `Você fez rachadinha no gabinete e embolsou ${fmt(v)}.` : `Você desviou ${fmt(v)} da empresa.`, '', 'crime'); } } },
    { id: 'banco', nome: 'Assaltar um banco', desc: 'Muito dinheiro, risco altíssimo', min: 18, fx: () => { karma(-15); if (chance(.25)) { const v = R(100, 800) * 1000; grana(v); line(`O assalto deu certo. Você levou ${fmt(v)}.`, '', 'crime'); } else prender(R(6, 12), 'assalto a banco'); } }
  ] }
];
function plastica(ok, faixa) { if (chance(ok)) { mod('aparencia', R(faixa[0], faixa[1])); line('A cirurgia ficou ótima.', 'good', 'saude'); } else { mod('aparencia', -10); mod('saude', -6); line('A cirurgia deu errado.', 'bad', 'saude'); } }
function postar(mult) {
  let g = Math.round((10 + S.st.aparencia) * R(1, 12) * (1 + S.seguidores / 20000) * mult);
  if (chance(.08)) { g *= R(10, 40); line(`Um post seu viralizou: mais ${num(g)} seguidores!`, 'good', 'fama'); }
  else line(`Você ganhou ${num(g)} seguidores.`, '', 'fama');
  S.seguidores += g; mod('felicidade', 1);
}
function cnh(tipo) { if (chance(.45 + S.st.inteligencia / 250)) { S.cnh[tipo] = true; mod('felicidade', 5); line(`Você passou na prova do Detran e tirou a CNH de ${tipo}!`, 'good'); } else { mod('felicidade', -3); line(`Você reprovou na prova prática do Detran. ${tipo === 'carro' ? 'A baliza não perdoa.' : 'Foi o oito.'}`, 'bad'); } }
function processo(p, faixa) { karma(-2); if (chance(p)) { const v = R(faixa[0], faixa[1]) * 1000; grana(v); line(`Você ganhou o processo e recebeu ${fmt(v)}.`, 'good', 'dinheiro'); } else line('O juiz não deu ganho de causa.', 'bad', 'dinheiro'); }
function largar(f, p, txt) { if (chance(p)) { setFlag(f, false); mod('felicidade', 5); line(txt, 'good', 'saude'); } else line('Você tentou, mas teve uma recaída.', 'bad', 'saude'); }

function painelAtividades() {
  if (!S.vivo) return { titulo: 'Atividades', html: fim() };
  if (S.preso) return { titulo: 'Atividades', html: nota('Na prisão, as opções ficam em Ocupação.') };
  const h = ATIV.filter(c => !c.mostra || c.mostra()).map(c => row({ ico: c.ico, titulo: c.nome, sub: S.idade < c.min ? `A partir de ${c.min} anos` : c.sub, go: S.idade >= c.min ? (c.painel || 'cat') : undefined, arg: c.painel ? undefined : c.id, off: S.idade < c.min })).join('')
    + `<div class="aviso-pequeno">${nota('Cada atividade pode ser feita uma vez por ano. Antes dos 18, seus pais pagam.')}</div>`;
  return { titulo: 'Atividades', html: h };
}
function painelCategoria(id) {
  const c = ATIV.find(x => x.id === id);
  let topo = '';
  if (c.id === 'mente') topo = row({ ico: '🥋', titulo: 'Artes marciais', sub: 'Jiu-jítsu, capoeira, judô...', go: 'artes' }) + row({ ico: '🎸', titulo: 'Instrumentos', sub: 'Violão, cavaquinho, pandeiro...', go: 'instrumentos' });
  const h = topo + c.itens.filter(i => !i.mostra || i.mostra()).map(i => {
    const custo = i.custo ? pago(i.custo) : 0, k = `at:${c.id}:${i.id}`;
    const min = i.min ?? c.min;
    const motivo = S.idade < min ? `A partir de ${min} anos` : feito(k) ? 'Feito este ano' : custo && S.dinheiro < custo ? 'Sem saldo' : '';
    return row({ titulo: i.nome, sub: i.desc, tag: motivo || (custo ? fmt(custo) : 'Grátis'), attrs: act(i.acao || (i.form ? 'form' : 'item'), { cat: c.id, id: i.id }), off: !!motivo });
  }).join('');
  return { titulo: c.nome, html: h || nota('Nada para fazer aqui agora.') };
}
const NIVEIS_MUSICA = ['iniciante', 'básico', 'intermediário', 'avançado', 'virtuose'];
const faixaDe = (x, n) => x.faixas[Math.min(4, Math.floor(n / 20))];
function painelAulas(tipo) {
  const arte = tipo === 'arte', lista = arte ? ARTES : INSTRUMENTOS, min = arte ? 5 : 6, custo = pago(arte ? 1200 : 1000);
  const h = nota('Uma aula por modalidade a cada ano. Quanto mais você treina, mais sobe de nível.') + lista.map(x => {
    const n = S.hab[x.id] || 0, k = 'aula:' + x.id;
    const sub = n ? (arte ? `Nível ${n} · ${x.corda ? 'corda' : 'faixa'} ${faixaDe(x, n)}` : `Nível ${n} · ${NIVEIS_MUSICA[Math.min(4, Math.floor(n / 20))]}`) : (arte ? `Pratique ${x.nome.toLowerCase()}` : `Faça aulas de ${x.nome.toLowerCase()}`);
    const motivo = S.idade < min ? `A partir de ${min} anos` : feito(k) ? 'Feito este ano' : custo && S.dinheiro < custo ? 'Sem saldo' : '';
    return row({ ico: x.ico, titulo: x.nome, sub, tag: motivo || (custo ? fmt(custo) : 'Grátis'), attrs: act('aula', { tipo, id: x.id }), off: !!motivo });
  }).join('');
  return { titulo: arte ? 'Artes marciais' : 'Instrumentos', html: h };
}
function painelMedico() {
  let h = secao('Consultas');
  h += row({ ico: '🏥', titulo: 'Posto de saúde (SUS)', sub: 'Grátis, mas tem fila', tag: feito('med:sus') ? 'Feito este ano' : 'Grátis', attrs: act('medico', { id: 'sus' }), off: feito('med:sus') });
  const c = S.plano ? 0 : pago(300);
  h += row({ ico: '👩‍⚕️', titulo: 'Consulta particular', sub: S.plano ? 'Coberta pelo plano' : 'Atendimento rápido', tag: feito('med:part') ? 'Feito este ano' : c ? fmt(c) : 'Grátis', attrs: act('medico', { id: 'part' }), off: feito('med:part') || S.dinheiro < c });
  h += row({ ico: '🦷', titulo: 'Dentista', sub: 'Aparência e saúde', tag: feito('med:dente') ? 'Feito este ano' : pago(200) ? fmt(pago(200)) : 'Grátis', attrs: act('medico', { id: 'dente' }), off: feito('med:dente') });
  if (S.idade >= 18) h += row({ ico: '📋', titulo: S.plano ? 'Cancelar plano de saúde' : 'Contratar plano de saúde', sub: 'Consulta grátis, tratamentos mais baratos', tag: `${fmt(preco(6000))}/ano`, attrs: act('plano') });
  if (S.doencas.length) {
    h += secao('Tratamentos');
    S.doencas.forEach(n => {
      const d = DOENCAS[n];
      const cp = S.idade < 18 ? 0 : Math.round(preco(d.custo) * (S.plano ? .2 : 1));
      h += row({ titulo: `Tratar ${n.toLowerCase()} pelo SUS`, sub: `Chance de cura: ${Math.round((d.cura - .15) * 100)}%`, tag: feito('trat:' + n) ? 'Feito este ano' : 'Grátis', attrs: act('tratar', { id: n, via: 'sus' }), off: feito('trat:' + n) });
      h += row({ titulo: `Tratar ${n.toLowerCase()} no particular`, sub: `Chance de cura: ${Math.round((d.cura + (S.plano ? .15 : 0)) * 100)}%`, tag: feito('trat:' + n) ? 'Feito este ano' : cp ? fmt(cp) : 'Grátis', attrs: act('tratar', { id: n, via: 'part' }), off: feito('trat:' + n) || cp > S.dinheiro });
    });
  }
  return { titulo: 'Médico', html: h };
}
function painelCompras() {
  let h = nota('O que você compra vai para Bens › Pertences.');
  h += LOJA.map(i => { const v = preco(i.valor); return row({ titulo: i.nome, tag: fmt(v), attrs: act('comprarItem', { id: i.id }), off: S.idade < 14 || S.dinheiro < v }); }).join('');
  if (S.idade < 14) h += nota('Compras liberam aos 14 anos.');
  return { titulo: 'Compras', html: h };
}
function painelBichos() {
  let h = secao('Abrigo de animais');
  h += RACAS.filter(r => r.abrigo).map(r => row({ titulo: `Adotar: ${r.nome.toLowerCase()}`, sub: 'Adoção responsável', tag: 'Grátis', attrs: act('pet', { id: r.id }), off: feito('pet') })).join('');
  h += secao('Pet shop');
  h += RACAS.filter(r => !r.abrigo).map(r => { const v = preco(r.preco); return row({ titulo: r.nome, tag: fmt(v), attrs: act('pet', { id: r.id }), off: feito('pet') || S.idade < 16 || S.dinheiro < v }); }).join('');
  h += nota('Um bicho novo por ano. Cada bicho custa um pouco por ano depois dos seus 18.');
  return { titulo: 'Bichos', html: h };
}
const PASSEIOS = [['praia', 'Dia de praia', 50, 3], ['zoo', 'Zoológico', 80, 3], ['cinema', 'Cinema', 50, 2], ['parque', 'Parque aquático', 200, 5], ['show', 'Show sertanejo', 400, 6], ['estadio', 'Jogo no estádio', 150, 5]];
function painelFerias() {
  let h = secao('Passeios');
  h += PASSEIOS.map(([id, n, v, f]) => row({ titulo: id === 'estadio' ? `Jogo do ${S.time}` : n, sub: `Felicidade +${f}`, tag: feito('ps:' + id) ? 'Feito este ano' : pago(v) ? fmt(pago(v)) : 'Grátis', attrs: act('passeio', { id }), off: feito('ps:' + id) || S.dinheiro < pago(v) })).join('');
  if (S.idade >= 18) {
    ['nacional', 'internacional'].forEach(t => {
      h += secao(t === 'nacional' ? 'Viagens pelo Brasil' : 'Viagens internacionais');
      h += DESTINOS[t].map(([n, v]) => row({ titulo: n, tag: fmt(preco(v)), attrs: act('viagem', { id: n, t }), off: feito('viagem') || S.dinheiro < preco(v) })).join('');
    });
    h += nota('Uma viagem por ano.');
  }
  return { titulo: 'Férias e passeios', html: h };
}
function painelEmprestimo() {
  const sal = S.emprego ? S.emprego.sal : 0;
  let h = nota(`Você tem ${S.emprestimos.length} de 3 empréstimos. Parcelas saem do saldo todo ano.`);
  h += secao('Banco');
  [[5000, 0], [20000, 1], [100000, 60000]].forEach(([v, req]) => {
    const motivo = S.emprestimos.length >= 3 ? 'Limite atingido' : req && !S.emprego ? 'Exige emprego' : req > 1 && sal < req ? 'Renda insuficiente' : S.dinheiro < -50000 ? 'Nome sujo' : '';
    h += row({ titulo: `${fmt(v)} em 5 anos`, sub: motivo || `Parcela de ${fmt(Math.round(v * 1.3 / 5))} por ano`, attrs: act('emprestimo', { v, t: 'banco' }), off: !!motivo || feito('emp') });
  });
  h += secao('Agiota');
  [10000, 50000].forEach(v => {
    const motivo = S.emprestimos.length >= 3 ? 'Limite atingido' : '';
    h += row({ titulo: `${fmt(v)} em 2 anos`, sub: motivo || `Parcela de ${fmt(v)} por ano. Atrasar é perigoso.`, attrs: act('emprestimo', { v, t: 'agiota' }), off: !!motivo || feito('emp') });
  });
  if (S.emprestimos.length) h += secao('Seus empréstimos') + S.emprestimos.map(e => row({ titulo: e.tipo === 'agiota' ? 'Agiota' : 'Banco', sub: `Falta${e.anos > 1 ? 'm' : ''} ${anos(e.anos)}`, tag: `${fmt(e.parcela)}/ano` })).join('');
  return { titulo: 'Empréstimo', html: h };
}
function painelTestamento() {
  const cand = S.rel.filter(r => r.vivo && (r.tipo === 'filho'));
  let h = nota('O herdeiro escolhido fica com 70% da herança. Sem escolha, a divisão é igual entre os filhos.');
  h += cand.length ? cand.map(r => row({ ico: avatar(r), titulo: esc(r.nome), sub: rotulo(r), tag: S.herdeiro === r.id ? 'Herdeiro' : '', attrs: act('herdeiro', { id: r.id }) })).join('') : nota('Você ainda não tem filhos para deixar herança.');
  return { titulo: 'Testamento', html: h };
}
function painelIdentidade() {
  let h = secao('Nome');
  h += `<div class="campo"><label for="novoNome">Novo primeiro nome</label><input id="novoNome" maxlength="24" placeholder="${esc(S.nome.split(' ')[0])}"></div>`;
  h += row({ titulo: 'Mudar o nome no cartório', tag: fmt(preco(300)), attrs: act('mudarNome'), off: feito('nome') || S.dinheiro < preco(300) });
  h += secao('Interesse amoroso');
  h += [['A', 'Homens e mulheres'], ['M', 'Homens'], ['F', 'Mulheres']].map(([v, n]) => row({ titulo: n, tag: S.interesse === v ? '✓' : '', attrs: act('interesse', { id: v }) })).join('');
  return { titulo: 'Identidade', html: h };
}

// ---------- bens ----------
function riqueza() { const p = patrimonio(); return p <= 0 ? 0 : clamp(Math.log10(p) / 8 * 100); }
function painelBens() {
  if (!S.vivo) return { titulo: 'Bens', html: fim() };
  let h = secao('Finanças');
  h += row({ ico: '💵', titulo: 'Finanças', sub: `Patrimônio: ${fmt(patrimonio())}`, go: 'financas' });
  h += row({ ico: '💎', titulo: 'Riqueza', sub: 'Do zero ao bilhão', barra: riqueza() });
  if (S.idade >= 18) h += row({ ico: '📈', titulo: 'Investimentos', sub: `Aplicado: ${fmt(totalInv())}`, go: 'investimentos' });
  h += secao('Seus bens');
  if (S.idade >= 18) h += row({ ico: '🏠', titulo: 'Imóveis e moradia', sub: { pais: 'Mora com os pais', aluguel: 'Mora de aluguel', propria: 'Mora no próprio imóvel' }[S.moradia], go: 'imoveis' });
  h += row({ ico: '🚗', titulo: 'Veículos', sub: `${S.bens.filter(b => b.tipo === 'veiculo').length} veículo(s)`, go: 'veiculos' });
  h += row({ ico: '🎒', titulo: 'Pertences', sub: `${S.pertences.length} item(ns)`, go: 'pertences' });
  return { titulo: 'Bens', html: h };
}
function painelFinancas() {
  const linhas = [['Saldo bancário', S.dinheiro], ['Investimentos', totalInv()], ['Imóveis, veículos e pertences', valorBens()]];
  if (dividaBens()) linhas.push(['Financiamentos', -dividaBens()]);
  if (dividaEmprestimos()) linhas.push(['Empréstimos', -dividaEmprestimos()]);
  if (S.fies) linhas.push(['Fies', -S.fies]);
  let h = `<div class="cartao"><div class="kv">${linhas.map(([n, v]) => `<span>${n}</span><b class="mono${v < 0 ? ' neg' : ''}">${fmt(v)}</b>`).join('')}<span><b>Patrimônio</b></span><b class="mono">${fmt(patrimonio())}</b></div></div>`;
  if (S.idade >= 18 && !S.preso) {
    const renda = (S.emprego ? S.emprego.sal : 0) + (S.bico ? S.bico.sal : 0) + (S.aposentado ? S.pensao : 0) + (S.seguidores >= 10000 ? Math.round(S.seguidores * .5) : 0);
    h += `<div class="cartao"><div class="kv"><span>Renda por ano</span><b class="mono">${fmt(renda)}</b><span>Gastos fixos por ano</span><b class="mono">${fmt(custoAnual())}</b></div></div>`;
  }
  return { titulo: 'Finanças', html: h };
}
function painelInvestimentos() {
  const INV = [['poupanca', 'Poupança', 'Rende 6% ao ano, sem risco'], ['acoes', 'Ações na bolsa', 'Entre −25% e +35% ao ano'], ['cripto', 'Criptomoedas', 'Entre −75% e +100% ao ano']];
  const h = INV.map(([k, n, d]) => `<div class="cartao"><div class="kv"><span><b>${n}</b></span><b class="mono">${fmt(S.inv[k])}</b></div><small class="nota">${d}</small>
    <div class="chips">
      <button class="chip" ${act('investir', { id: k, v: 1000 })} ${S.dinheiro < 1000 ? 'disabled' : ''}>+ ${fmt(1000)}</button>
      <button class="chip" ${act('investir', { id: k, v: 10000 })} ${S.dinheiro < 10000 ? 'disabled' : ''}>+ ${fmt(10000)}</button>
      <button class="chip" ${act('investir', { id: k, v: 'tudo' })} ${S.dinheiro < 1 ? 'disabled' : ''}>Todo o saldo</button>
      <button class="chip" ${act('resgatar', { id: k })} ${S.inv[k] < 1 ? 'disabled' : ''}>Resgatar</button>
    </div></div>`).join('');
  return { titulo: 'Investimentos', html: h };
}
function loja(lista, tipo, anosFin) {
  return lista.map(i => {
    const v = preco(i.valor), entrada = Math.round(v * .2);
    return `<div class="cartao"><div class="kv"><span><b>${i.nome}</b></span><b class="mono">${fmt(v)}</b></div>${i.cnh && !S.cnh[i.cnh] ? `<small class="nota">Você ainda não tem CNH de ${i.cnh}.</small>` : ''}
      <div class="chips">
        <button class="chip" ${act('comprar', { tipo, id: i.id, modo: 'vista' })} ${S.dinheiro < v || S.idade < 16 ? 'disabled' : ''}>À vista</button>
        ${v > 10000 ? `<button class="chip" ${act('comprar', { tipo, id: i.id, modo: 'fin' })} ${S.dinheiro < entrada || !S.emprego ? 'disabled' : ''}>Financiar em ${anosFin} anos (entrada ${fmt(entrada)})</button>` : ''}
      </div></div>`;
  }).join('') + (S.emprego ? '' : nota('Financiar exige emprego.'));
}
function seusBens(tipo) {
  const l = S.bens.filter(b => b.tipo === tipo);
  if (!l.length) return '';
  return secao('Seus') + l.map(b => `<div class="cartao"><div class="kv"><span><b>${esc(b.nome)}</b></span><b class="mono">${fmt(b.valor)}</b></div>
    <small class="nota">${b.anos ? `Parcela de ${fmt(b.parcela)} por ano · falta${b.anos > 1 ? 'm' : ''} ${anos(b.anos)}` : 'Quitado'}</small>
    <div class="chips"><button class="chip" ${act('vender', { id: b.id })}>Vender por ${fmt(b.valor - b.parcela * b.anos)}</button></div></div>`).join('');
}
function painelImoveis() {
  const MOR = { pais: 'Na casa dos pais', aluguel: 'Apartamento alugado', propria: 'Imóvel próprio' };
  let h = secao('Onde você mora') + nota(`${MOR[S.moradia]} · ${fmt(custoMoradia())} por ano`);
  if (S.moradia !== 'aluguel') h += row({ titulo: 'Alugar um apartamento', sub: 'Mais liberdade e felicidade', tag: `${fmt(preco(18000))}/ano`, attrs: act('mudar', { id: 'aluguel' }) });
  if (S.moradia !== 'pais' && paisVivos().length) h += row({ titulo: 'Voltar para a casa dos pais', sub: 'Economia, mas pesa depois dos 25', tag: `${fmt(preco(3000))}/ano`, attrs: act('mudar', { id: 'pais' }) });
  if (S.moradia !== 'propria' && S.bens.some(b => b.tipo === 'imovel')) h += row({ titulo: 'Morar no seu imóvel', sub: 'Só condomínio e IPTU', tag: `${fmt(preco(6000))}/ano`, attrs: act('mudar', { id: 'propria' }) });
  h += seusBens('imovel') + secao('À venda') + loja(IMOVEIS, 'imovel', 30);
  return { titulo: 'Imóveis', html: h };
}
function painelVeiculos() { return { titulo: 'Veículos', html: seusBens('veiculo') + secao('Concessionária') + loja(VEICULOS, 'veiculo', 5) }; }
function painelPertences() {
  let h = S.pertences.length ? S.pertences.map(p => row({ titulo: esc(p.nome), sub: `Vale ${fmt(p.valor)}`, tag: 'Vender', attrs: act('venderItem', { id: p.id }) })).join('') : nota('Você ainda não comprou nada.');
  h += row({ ico: '🛍️', titulo: 'Ir às compras', go: 'compras' });
  return { titulo: 'Pertences', html: h };
}

// ---------- menu ----------
function painelMenu() {
  const vidas = lerLS(VIDAS_KEY, []);
  return { titulo: 'Menu', html: `${secao('Sua vida')}
    <div class="cartao"><div class="kv"><span>Signo</span><b>${S.signo}</b><span>Time do coração</span><b>${esc(S.time)}</b><span>Reputação</span><b>${reputacao()}</b><span>Nascimento</span><b>${S.nasc.dia} de ${MESES[S.nasc.mes]} de ${S.nasc.ano}</b></div></div>
    ${secao(`Conquistas · ${CONQ.length} de ${CONQUISTAS.length}`)}<div class="conq">
    ${CONQUISTAS.map(c => `<div class="${CONQ.includes(c.id) ? '' : 'off'}"><b>${c.nome}</b><small>${c.desc}</small></div>`).join('')}</div>
    ${vidas.length ? secao('Vidas anteriores') + vidas.slice(0, 8).map(v => row({ titulo: esc(v.nome), sub: esc(v.fita), tag: `${v.idade} anos` })).join('') : ''}
    ${secao('Nova vida')}
    <div class="campo"><label for="nvNome">Primeiro nome</label><input id="nvNome" maxlength="24" placeholder="Deixe vazio para sortear"></div>
    <div class="campo"><label for="nvSexo">Sexo</label><select id="nvSexo"><option value="">Sortear</option><option value="F">Feminino</option><option value="M">Masculino</option></select></div>
    <div class="campo"><label for="nvUf">Estado</label><select id="nvUf"><option value="">Sortear</option>${Object.entries(ESTADOS).map(([k, e]) => `<option value="${k}">${e.nome}</option>`).join('')}</select></div>
    <div class="campo"><label for="nvInt">Interesse amoroso</label><select id="nvInt"><option value="A">Homens e mulheres</option><option value="M">Homens</option><option value="F">Mulheres</option></select></div>
    <button class="primary largo" ${act('novaVida')}>${S.vivo ? 'Começar do zero (apaga a vida atual)' : 'Nascer de novo'}</button>
    ${secao('Ajustes')}
    ${row({ titulo: 'Sons', sub: 'Efeitos curtos ao passar o ano e nos marcos', tag: somLigado ? 'Ligado' : 'Desligado', attrs: act('som') })}
    ${S.vivo ? row({ titulo: confirmarFim ? 'Tocar de novo para confirmar' : 'Encerrar esta vida', sub: 'A história termina aqui e você pode começar outra', attrs: act('encerrar') }) : ''}
    ${secao('Como jogar')}
    ${nota('Toque em + Idade para envelhecer um ano. Algumas situações pedem uma escolha, e as escolhas destravam outras situações no futuro. Estude e trabalhe em Ocupação, cuide das pessoas em Relações, do dinheiro em Bens e do resto em Atividades. Quando a vida acabar, dá para continuar como um dos filhos. O progresso fica salvo neste navegador.')}
    <ul class="legenda">${Object.entries(CATS).map(([k, n]) => `<li class="cat-${k}">${n}</li>`).join('')}</ul>` };
}

const PAINEIS = {
  ocupacao: painelOcupacao, vagas: painelVagas, bicos: painelBicos, politica: painelPolitica, clubes: painelClubes,
  relacoes: painelRelacoes, pessoa: painelPessoa,
  atividades: painelAtividades, cat: painelCategoria, medico: painelMedico, compras: painelCompras, bichos: painelBichos,
  ferias: painelFerias, emprestimo: painelEmprestimo, testamento: painelTestamento, identidade: painelIdentidade,
  artes: () => painelAulas('arte'), instrumentos: () => painelAulas('inst'),
  escola: painelEscola, professores: painelProfessores, professor: painelProfessor, trabalho: painelTrabalho, estudos: painelEstudos,
  recrutador: painelRecrutador, militar: painelMilitar, empresa: painelEmpresa, redes: painelRedes, rede: painelRede,
  bens: painelBens, financas: painelFinancas, investimentos: painelInvestimentos, imoveis: painelImoveis, veiculos: painelVeiculos, pertences: painelPertences,
  menu: painelMenu
};

// ================= ações do jogador =================
const ACOES = {
  item(ds) {
    const c = ATIV.find(x => x.id === ds.cat), i = c.itens.find(x => x.id === ds.id);
    const custo = i.custo ? pago(i.custo) : 0;
    if (custo) grana(-custo);
    S.feitosAno[`at:${c.id}:${i.id}`] = true;
    i.fx();
  },
  mudarEscola() {
    S.feitosAno.mudarEscola = true; CUR_CAT = 'escola';
    const e = S.escola;
    if (e.rede === 'pública' && !(paisVivos().length && chance(.4))) { line('Seus pais disseram que não dá para pagar escola particular.', 'bad'); return; }
    const nova = novaEscola(e.tipo, e.rede === 'particular' ? 'pública' : 'particular');
    S.escola = Object.assign(nova, { clubes: [] }); popular(-10);
    line(`Você mudou para a ${nova.nome}, da rede ${nova.rede}.`);
  },
  prof(ds) {
    const p = S.escola.profs.find(x => x.id === ds.id); S.feitosAno[`prof:${p.id}:${ds.acao}`] = true; CUR_CAT = 'escola';
    const a = p.sexo === 'F' ? 'a professora' : 'o professor';
    if (ds.acao === 'conversar') { p.rel = clamp(p.rel + R(3, 8)); line(`Você conversou com ${a} ${p.nome.split(' ')[0]} depois da aula.`); }
    if (ds.acao === 'ajuda') { p.rel = clamp(p.rel + 4); mod('inteligencia', R(2, 4)); line(`${p.nome.split(' ')[0]} tirou suas dúvidas de ${p.materia}.`); }
    if (ds.acao === 'elogiar') { p.rel = clamp(p.rel + R(5, 10)); karma(1); line(`Você elogiou a aula de ${p.materia}.`); }
    if (ds.acao === 'maca') { p.rel = clamp(p.rel + 8); popular(-3); line(`Você levou uma maçã para ${a}. A turma te chamou de puxa-saco.`); }
    if (ds.acao === 'nota') { if (p.rel > 60 && chance(.5)) { mod('inteligencia', 2); line(`${p.nome.split(' ')[0]} revisou a prova e aumentou sua nota.`, 'good'); } else { p.rel = clamp(p.rel - 6); line(`${p.nome.split(' ')[0]} disse que a nota está certa.`); } }
    if (ds.acao === 'xingar') { p.rel = clamp(p.rel - 25); karma(-3); paisVivos().forEach(r => { r.rel = clamp(r.rel - 6); }); line(`Você xingou ${a} e levou três dias de suspensão.`, 'bad'); }
  },
  oferta(ds) {
    const o = S.feitosAno.ofertas[+ds.i], c = CARREIRAS.find(x => x.id === o.id);
    o.usada = true; CUR_CAT = 'trabalho';
    S.emprego = { id: c.id, titulo: tituloCarreira(c), sal: o.sal, anos: 0, desemp: R(45, 65) }; S.ultimoTrabalho = S.emprego.titulo;
    mod('felicidade', 5);
    const txt = `Você aceitou a vaga de ${S.emprego.titulo.toLowerCase()} pela agência. Salário: ${fmt(o.sal)} por ano.`;
    if (!flag('trabalhou')) { setFlag('trabalhou'); marco('Primeiro emprego', txt); } else line(txt, 'good');
  },
  alistar() {
    S.feitosAno.alistar = true; CUR_CAT = 'trabalho';
    if (chance(.7)) { S.emprego = { id: 'militar', nivel: 0, titulo: 'Soldado do Exército', sal: Math.round(30000 * PAISES[S.pais].sal), anos: 0, desemp: 55 }; S.ultimoTrabalho = S.emprego.titulo; setFlag('reservista'); setFlag('trabalhou'); mod('saude', 4); line('Você entrou para o Exército como soldado.', 'good'); }
    else line('Você não passou no teste físico do Exército.', 'bad');
  },
  abrirNegocio(ds) {
    const n = NEGOCIOS.find(x => x.id === ds.id), c = preco(n.custo);
    grana(-c); S.negocio = { id: n.id, nome: n.nome, investido: c, valor: Math.round(c * .8), anos: 0 }; CUR_CAT = 'trabalho'; mod('felicidade', 5);
    marco('Negócio próprio', `Você abriu: ${n.nome.toLowerCase()}. Agora é ${G('patrão', 'patroa')}!`);
  },
  empresa(ds) {
    const n = S.negocio; CUR_CAT = 'dinheiro';
    if (ds.op === 'investir') { S.feitosAno.empresa = true; const v = Math.round(n.investido * .3); grana(-v); n.investido += v; n.valor += Math.round(v * .7); line(`Você investiu ${fmt(v)} no negócio.`); }
    if (ds.op === 'vender') { grana(n.valor); line(`Você vendeu ${n.nome.toLowerCase()} por ${fmt(n.valor)}.`, 'good'); S.negocio = null; }
  },
  rede(ds) {
    const pl = PLATAFORMAS.find(x => x.id === ds.id); CUR_CAT = 'fama';
    if (ds.op === 'cadastrar') { S.redes[ds.id] = { peso: 1, verificado: false }; line(`Você criou uma conta no ${pl.nome}.`); return; }
    if (ds.op === 'postar') { S.feitosAno['rede:' + ds.id] = true; postarEm(ds.id, 1); }
    if (ds.op === 'live') { S.feitosAno['rede:' + ds.id + ':live'] = true; postarEm(ds.id, 1.3); if (S.seguidores > 5000) { const v = Math.round(S.seguidores * .05); grana(v); line(`A live rendeu ${fmt(v)} em doações.`); } }
    if (ds.op === 'polemica') { S.feitosAno['rede:' + ds.id + ':pol'] = true; if (chance(.5)) { postarEm(ds.id, 3); karma(-3); } else { S.seguidores = Math.round(S.seguidores * .6); mod('felicidade', -8); line(`Você foi ${G('cancelado', 'cancelada')} no ${pl.nome}.`, 'bad'); } }
    if (ds.op === 'excluir') { S.seguidores = Math.max(0, S.seguidores - segRede(ds.id)); delete S.redes[ds.id]; line(`Você excluiu sua conta no ${pl.nome}.`); voltar(); }
  },
  detran(ds) {
    const i = ATIV.find(x => x.id === ds.cat).itens.find(x => x.id === ds.id);
    grana(-pago(i.custo)); S.feitosAno[`at:${ds.cat}:${ds.id}`] = true;
    abrirProva(i.tipo);
  },
  hack(ds) { S.feitosAno[`at:${ds.cat}:${ds.id}`] = true; abrirHack(); },
  roubo(ds) {
    CARTAO = { cat: 'crime', etiqueta: 'Crime', ico: '🦝', titulo: 'Arrombamento', texto: 'Você está pensando em arrombar uma casa.', fechar: true, alvo: ds,
      form: [{ id: 'vitima', label: 'Escolha sua vítima', opcoes: VITIMAS.map(v => v.nome) }], botoes: [{ t: 'Arrombar a casa', attrs: 'data-cartao="roubo"' }] };
  },
  form(ds) {
    const c = ATIV.find(x => x.id === ds.cat), i = c.itens.find(x => x.id === ds.id);
    CARTAO = { cat: 'saude', etiqueta: c.nome, ico: i.ico || c.ico, titulo: i.nome, texto: i.desc + (i.custo && pago(i.custo) ? ` · ${fmt(pago(i.custo))} por ano` : ''), form: i.form, fechar: true, alvo: ds, botoes: [{ t: 'Fazer', attrs: 'data-cartao="fazer"' }] };
  },
  aula(ds) {
    const arte = ds.tipo === 'arte', x = (arte ? ARTES : INSTRUMENTOS).find(y => y.id === ds.id);
    S.feitosAno['aula:' + x.id] = true;
    grana(-pago(arte ? 1200 : 1000));
    const antes = S.hab[x.id] || 0, n = Math.min(100, antes + R(6, 14) + Math.round((arte ? S.st.saude : S.st.inteligencia) / 25));
    S.hab[x.id] = n;
    CUR_CAT = arte ? 'saude' : 'escola';
    if (arte) {
      mod('saude', R(1, 3)); mod('felicidade', R(1, 3));
      if (x.id === 'capoeira') popular(2);
      const fa = Math.min(4, Math.floor(antes / 20)), fn = Math.min(4, Math.floor(n / 20));
      if (fn > fa) { line(`Você ganhou a ${x.corda ? 'corda' : 'faixa'} ${x.faixas[fn]} no ${x.nome.toLowerCase()}!`, 'good'); if (fn === 4) setFlag('faixapreta'); }
      else line(`Você treinou ${x.nome.toLowerCase()} o ano todo.`);
    } else {
      mod('felicidade', 2); mod('inteligencia', 1);
      if (n >= 30) setFlag('violao');
      const na = Math.min(4, Math.floor(antes / 20)), nn = Math.min(4, Math.floor(n / 20));
      line(nn > na ? `Você chegou ao nível ${NIVEIS_MUSICA[nn]} no ${x.nome.toLowerCase()}!` : `Você fez aulas de ${x.nome.toLowerCase()} o ano todo.`, nn > na ? 'good' : '');
    }
  },
  crianca(ds) {
    S.feitosAno['cr:' + ds.id] = true; CUR_CAT = 'familia';
    if (ds.id === 'brincar') { mod('felicidade', R(3, 6)); line(`Você brincou de ${pick(['massinha', 'carrinho', 'boneca', 'pega-pega', 'esconde-esconde'])} o dia todo.`); }
    if (ds.id === 'birra') { mod('felicidade', 3); paisVivos().forEach(r => { r.rel = clamp(r.rel - 4); }); line('Você fez uma birra daquelas no meio do supermercado.'); }
    if (ds.id === 'desenho') { mod('felicidade', 3); mod('inteligencia', 1); line('Você assistiu desenho a manhã inteira.'); }
  },
  escola(ds) {
    S.feitosAno['es:' + ds.id] = true; CUR_CAT = 'escola';
    if (ds.id === 'estudar') { mod('inteligencia', R(2, 6)); mod('felicidade', -1); line('Você se dedicou aos estudos.'); }
    if (ds.id === 'enfermaria') { if (S.doencas.length || S.st.saude < 60) { mod('saude', R(2, 4)); line('A enfermeira te deu um remédio e um copo de água com açúcar.'); } else if (chance(.5)) { mod('felicidade', 3); line('Você fingiu dor de barriga e foi liberad' + G('o', 'a') + ' mais cedo.'); } else { line('A enfermeira percebeu que você estava fingindo e te mandou de volta para a sala.'); } }
    if (ds.id === 'professor') { mod('inteligencia', R(1, 3)); karma(1); line('Você tirou dúvidas com a professora depois da aula.'); }
    if (ds.id === 'amizade') { popular(R(3, 8)); if (chance(.5)) { const p = pessoa('amigo', pick(['M', 'F']), Math.max(6, S.idade + R(-1, 1))); S.rel.push(p); line(`Você fez amizade com ${p.nome}.`, 'good', 'familia'); } else line('Você se enturmou com a galera do fundão.'); }
    if (ds.id === 'matar') { mod('felicidade', 4); mod('inteligencia', -2); if (chance(.35)) { paisVivos().forEach(r => { r.rel = clamp(r.rel - 8); }); line('A escola ligou para os seus pais: você matou aula.', 'bad'); } else line('Você matou aula e foi para a praça com a turma.'); }
    if (ds.id === 'festa') { mod('felicidade', R(4, 8)); mod('inteligencia', -1); if (chance(.25)) conhecerAlguem('numa festa universitária'); else line('Você foi numa calourada que acabou às 6h da manhã.'); }
  },
  clube(ds) {
    const l = S.escola.clubes;
    const c = CLUBES.find(x => x.id === ds.id);
    if (l.includes(ds.id)) { S.escola.clubes = l.filter(x => x !== ds.id); line(`Você saiu do ${c.nome.toLowerCase()}.`, '', 'escola'); }
    else { l.push(ds.id); setFlag(ds.id); popular(2); line(`Você entrou no ${c.nome.toLowerCase()}.`, '', 'escola'); }
  },
  largarEscola() { line('Você largou a escola.', 'bad', 'escola'); S.escola = null; karma(-2); },
  supletivo() { S.feitosAno.supletivo = true; if (chance(.4 + S.st.inteligencia / 200)) { S.formacao = 'medio'; line('Você concluiu o ensino médio pelo supletivo!', 'good', 'escola'); } else line('Você não passou no supletivo este ano.', 'bad', 'escola'); },
  faculdade() { S.fila.push({ id: 'curso', d: {} }); },
  enem() { S.feitosAno.enem = true; S.enem = Math.max(S.enem || 0, enemNota()); line(`Você fez o ENEM. Sua melhor nota agora é ${S.enem}.`, '', 'escola'); },
  cursinho() { grana(-preco(6000)); setFlag('cursinho'); line('Você entrou no cursinho pré-vestibular.', '', 'escola'); },
  trancar() { line(`Você trancou a faculdade de ${S.faculdade.curso}.`, '', 'escola'); S.faculdade = null; },
  vaga(ds) { candidatar(ds.id); },
  bico(ds) { const b = BICOS.find(x => x.id === ds.id); S.bico = { id: b.id, nome: b.nome, sal: preco(b.sal) }; line(`Você começou um bico: ${b.nome.toLowerCase()}.`, '', 'trabalho'); },
  largarBico() { line(`Você largou o bico de ${S.bico.nome.toLowerCase()}.`, '', 'trabalho'); S.bico = null; },
  concorrer(ds) { concorrer(ds.id); },
  trab(ds) {
    S.feitosAno['trab:' + ds.id] = true; CUR_CAT = 'trabalho';
    const e = S.emprego;
    if (ds.id === 'esforco') { e.desemp = clamp(e.desemp + R(6, 14)); mod('felicidade', -2); mod('saude', -1); line('Você fez hora extra o ano inteiro.'); }
    if (ds.id === 'aumento') { if (e.desemp > 60 && chance(.55)) { e.sal = Math.round(e.sal * 1.08); line(`Você pediu aumento e conseguiu: ${fmt(e.sal)} por ano.`, 'good'); } else { e.desemp = clamp(e.desemp - 5); line('Você pediu aumento e o chefe riu.', 'bad'); } }
    if (ds.id === 'colegas') { mod('felicidade', 2); if (chance(.35)) { const p = pessoa('amigo', pick(['M', 'F']), Math.max(18, S.idade + R(-5, 5))); S.rel.push(p); line(`Você fez amizade com ${p.nome}, do trabalho.`, 'good', 'familia'); } else line('Você tomou um cafezinho com o pessoal do trabalho.'); }
    if (ds.id === 'demissao') { S.ultimoTrabalho = e.titulo; line(e.id === 'pol' ? `Você renunciou ao mandato de ${e.titulo.toLowerCase()}.` : `Você pediu demissão do emprego de ${e.titulo.toLowerCase()}.`); S.emprego = null; }
    if (ds.id === 'aposentar') {
      S.ultimoTrabalho = e.titulo; S.pensao = Math.round(e.sal * (e.id === 'servidor' ? .9 : .45)); S.aposentado = true; S.emprego = null; mod('felicidade', 8);
      marco('Aposentadoria', `Você se aposentou. Pensão: ${fmt(S.pensao)} por ano.`);
    }
  },
  rel(ds) {
    const r = S.rel.find(x => x.id === ds.id), a = INTERACOES.find(x => x.id === ds.acao);
    S.feitosAno[r.id + ':' + a.id] = true;
    CUR_CAT = ['parceiro', 'ex'].includes(r.tipo) ? 'amor' : 'familia';
    if (a.custo) grana(-pago(a.custo));
    a.fx(r);
    if (!r.vivo || r.tipo === 'ex') voltar();
  },
  medico(ds) {
    S.feitosAno['med:' + ds.id] = true; CUR_CAT = 'saude';
    if (ds.id === 'sus') { mod('saude', R(2, 8)); line(`Você esperou ${R(2, 6)} horas no posto de saúde, mas foi bem atendid${G('o', 'a')}.`); }
    if (ds.id === 'part') { if (!S.plano) grana(-pago(300)); mod('saude', R(5, 14)); line('Você fez um check-up completo.'); }
    if (ds.id === 'dente') { grana(-pago(200)); mod('saude', 2); mod('aparencia', 1); line('Você foi ao dentista e fez uma limpeza.'); }
  },
  plano() { S.plano = !S.plano; line(S.plano ? 'Você contratou um plano de saúde.' : 'Você cancelou o plano de saúde.', '', 'saude'); },
  tratar(ds) {
    S.feitosAno['trat:' + ds.id] = true; CUR_CAT = 'saude';
    const d = DOENCAS[ds.id];
    let p = d.cura - .15;
    if (ds.via === 'part') { if (S.idade >= 18) grana(-Math.round(preco(d.custo) * (S.plano ? .2 : 1))); p = d.cura + (S.plano ? .15 : 0); }
    if (chance(p)) { S.doencas = S.doencas.filter(n => n !== ds.id); mod('saude', 8); line(`O tratamento funcionou: você está ${G('curado', 'curada')} de ${ds.id.toLowerCase()}.`, 'good'); }
    else line(`O tratamento de ${ds.id.toLowerCase()} não funcionou este ano.`, 'bad');
  },
  comprarItem(ds) {
    const i = LOJA.find(x => x.id === ds.id), v = preco(i.valor);
    grana(-v); S.pertences.push({ id: uid(), ref: i.id, nome: i.nome, valor: v });
    mod('felicidade', i.fel || 0); if (i.ap) mod('aparencia', i.ap); if (i.int) mod('inteligencia', i.int); if (i.flag) setFlag(i.flag);
    line(`Você comprou: ${i.nome.toLowerCase()}.`, '', 'dinheiro');
  },
  venderItem(ds) { const p = S.pertences.find(x => x.id === ds.id); grana(p.valor); S.pertences = S.pertences.filter(x => x.id !== ds.id); line(`Você vendeu: ${p.nome.toLowerCase()}.`, '', 'dinheiro'); },
  pet(ds) {
    const r = RACAS.find(x => x.id === ds.id);
    S.feitosAno.pet = true;
    if (r.preco) grana(-preco(r.preco)); else karma(3);
    const b = bicho(ds.id); b.idade = r.abrigo ? R(0, 5) : 0; S.rel.push(b); setFlag('tutor'); mod('felicidade', R(5, 9));
    line(r.abrigo ? `Você adotou ${b.nome}, ${r.especie === 'gato' ? 'um gato' : 'um vira-lata caramelo'} do abrigo.` : `Você comprou ${b.nome}, ${r.nome.toLowerCase()}.`, 'good', 'familia');
  },
  passeio(ds) {
    const [id, n, v, f] = PASSEIOS.find(x => x[0] === ds.id);
    S.feitosAno['ps:' + id] = true; grana(-pago(v)); mod('felicidade', R(f - 1, f + 1));
    line(id === 'estadio' ? `Você foi ao estádio ver o ${S.time}. ${pick(['Vitória suada!', 'Empate sem graça.', 'Derrota doída.', 'Goleada!'])}` : `Você foi: ${n.toLowerCase()}.`);
  },
  viagem(ds) {
    const [n, v] = DESTINOS[ds.t].find(x => x[0] === ds.id);
    S.feitosAno.viagem = true; grana(-preco(v)); mod('felicidade', R(8, 14) + (ds.t === 'internacional' ? 3 : 0));
    line(`Você viajou para ${n}.`, 'good');
    if (chance(.15)) conhecerAlguem(`em ${n}`);
  },
  emprestimo(ds) {
    const v = +ds.v; S.feitosAno.emp = true;
    const e = ds.t === 'agiota' ? { tipo: 'agiota', parcela: v, anos: 2 } : { tipo: 'banco', parcela: Math.round(v * 1.3 / 5), anos: 5 };
    S.emprestimos.push(e); grana(v);
    if (ds.t === 'agiota') karma(-2);
    line(ds.t === 'agiota' ? `Você pegou ${fmt(v)} com um agiota. Melhor não atrasar.` : `O banco liberou um empréstimo de ${fmt(v)}.`, '', 'dinheiro');
  },
  herdeiro(ds) { S.herdeiro = ds.id; const r = S.rel.find(x => x.id === ds.id); line(`Você fez um testamento deixando a maior parte para ${r.nome}.`, '', 'familia'); },
  mudarNome() {
    const v = ($('novoNome').value || '').trim();
    if (!v) { toast('Digite o novo nome primeiro.'); return; }
    S.feitosAno.nome = true; grana(-preco(300));
    const partes = S.nome.split(' '); partes[0] = v.slice(0, 24); S.nome = partes.join(' ');
    line(`Você mudou o nome no cartório. Agora é ${S.nome}.`);
  },
  interesse(ds) { S.interesse = ds.id; },
  mudar(ds) { S.moradia = ds.id; if (ds.id === 'aluguel') mod('felicidade', 4); line({ aluguel: 'Você alugou um apartamento.', pais: 'Você voltou para a casa dos pais.', propria: 'Você se mudou para o seu imóvel.' }[ds.id]); },
  comprar(ds) {
    const item = (ds.tipo === 'imovel' ? IMOVEIS : VEICULOS).find(x => x.id === ds.id);
    const v = preco(item.valor), n = ds.tipo === 'imovel' ? 30 : 5;
    const bem = { id: uid(), tipo: ds.tipo, ref: item.id, nome: item.nome, valor: v, parcela: 0, anos: 0, cnh: item.cnh || null };
    if (ds.modo === 'vista') grana(-v);
    else { const ent = Math.round(v * .2); grana(-ent); bem.parcela = Math.round((v - ent) * (n === 30 ? 1.8 : 1.3) / n); bem.anos = n; }
    S.bens.push(bem);
    CUR_CAT = 'dinheiro';
    if (bem.tipo === 'imovel') {
      S.moradia = 'propria';
      if (!flag('imovel')) { setFlag('imovel'); marco('Casa própria', `Você comprou: ${item.nome.toLowerCase()}. As chaves são suas.`); } else line(`Você comprou: ${item.nome.toLowerCase()}.`, 'good');
    } else { mod('felicidade', 5); line(`Você comprou: ${item.nome.toLowerCase()}.`, 'good'); }
  },
  vender(ds) {
    const bem = S.bens.find(x => x.id === ds.id);
    grana(bem.valor - bem.parcela * bem.anos);
    S.bens = S.bens.filter(x => x.id !== ds.id);
    if (bem.tipo === 'imovel' && !S.bens.some(x => x.tipo === 'imovel') && S.moradia === 'propria') S.moradia = 'aluguel';
    if (S.bico && S.bico.id === 'entregas' && !temVeiculo()) { line('Sem veículo, você largou as entregas.', '', 'trabalho'); S.bico = null; }
    line(`Você vendeu: ${bem.nome.toLowerCase()}.`, '', 'dinheiro');
  },
  investir(ds) { const v = ds.v === 'tudo' ? S.dinheiro : +ds.v; grana(-v); S.inv[ds.id] += v; },
  resgatar(ds) { grana(S.inv[ds.id]); S.inv[ds.id] = 0; },
  remicao() { S.feitosAno.remicao = true; mod('inteligencia', 3); if (chance(.4) && S.preso > 1) { S.preso--; line('Você leu doze livros e reduziu um ano da pena.', 'good', 'crime'); } else line('Você leu bastante na biblioteca da prisão.', '', 'escola'); },
  patio() { S.feitosAno.patio = true; mod('saude', R(3, 6)); line('Você malhou no pátio com barra improvisada.', '', 'saude'); },
  fuga() { S.feitosAno.fuga = true; abrirFuga(); },
  som() { somLigado = !somLigado; gravarLS(SOM_KEY, somLigado); if (somLigado) som('bom'); },
  encerrar() { if (!confirmarFim) { confirmarFim = true; return; } confirmarFim = false; morte(true); fecharPainel(); },
  novaVida() { novaVida({ nome: $('nvNome').value, sexo: $('nvSexo').value, uf: $('nvUf').value || undefined, interesse: $('nvInt').value }); fecharPainel(); return 'pronto'; },
  novaVidaRapida() { novaVida({ interesse: S.interesse }); return 'pronto'; },
  legado(ds) { novaVidaLegado(ds.id); return 'pronto'; }
};
// Ações que dependem de algo que pode ter sumido (botão antigo na tela)
function acaoValida(a, ds) {
  if (a === 'trab') return !!S.emprego;
  if (a === 'trancar') return !!S.faculdade;
  if (a === 'largarBico') return !!S.bico;
  if (a === 'clube' || a === 'mudarEscola' || a === 'prof') return !!S.escola;
  if (a === 'empresa') return !!S.negocio;
  if (a === 'oferta') return !S.emprego && !!S.feitosAno.ofertas;
  if (a === 'rede' && ds.op !== 'cadastrar') return !!S.redes[ds.id];
  if (a === 'rel') return S.rel.some(x => x.id === ds.id && x.vivo);
  if (a === 'vender') return S.bens.some(x => x.id === ds.id);
  if (a === 'venderItem') return S.pertences.some(x => x.id === ds.id);
  return true;
}

document.addEventListener('click', ev => {
  const b = ev.target.closest('button');
  if (!b || b.disabled || !S) return;
  if (b.dataset.escolha !== undefined) { escolher(+b.dataset.escolha); return; }
  if (b.dataset.cartao) { cliqueCartao(b.dataset.cartao, b.dataset); return; }
  if (b.dataset.go) { abrirPainel(b.dataset.go, b.dataset.arg, b.closest('#painel') === null); return; }
  const a = b.dataset.act;
  if (!a || !ACOES[a]) return;
  if (a !== 'encerrar') confirmarFim = false;
  if (!acaoValida(a, b.dataset)) { render(); return; }
  deltas = {};
  CUR_CAT = null;
  let r;
  if (COM_RESULTADO.includes(a)) comResultado(() => { r = ACOES[a](b.dataset); }); else r = ACOES[a](b.dataset);
  CUR_CAT = null;
  if (r === 'pronto') { window.scrollTo({ top: 0 }); return; }
  morteImediata();
  salvar(); render();
});
const COM_RESULTADO = ['item', 'crianca', 'escola', 'rel', 'medico', 'tratar', 'passeio', 'viagem', 'aula', 'pet', 'remicao', 'patio', 'trab', 'vaga', 'concorrer', 'enem', 'supletivo', 'mudarEscola', 'prof', 'oferta', 'alistar', 'rede'];
function cliqueCartao(tipo, ds = {}) {
  const c = CARTAO;
  CARTAO = null;
  if (tipo === 'resp') { responderProva(+ds.r); return; }
  if (tipo === 'roubo' && c && c.alvo) { S.feitosAno[`at:${c.alvo.cat}:${c.alvo.id}`] = true; salvar(); render(); abrirRoubo(+($('f_vitima').value || 0)); return; }
  if (tipo === 'fazer' && c && c.alvo) {
    const cat = ATIV.find(x => x.id === c.alvo.cat), i = cat.itens.find(x => x.id === c.alvo.id);
    const vals = i.form.map(f => +($('f_' + f.id).value || 0));
    deltas = {};
    comResultado(() => { const custo = i.custo ? pago(i.custo) : 0; if (custo) grana(-custo); S.feitosAno[`at:${cat.id}:${i.id}`] = true; i.fx(vals); CUR_CAT = null; }, i.nome, i.ico);
    morteImediata(); salvar(); render();
    return;
  }
  renderModal();
}
$('modalX').addEventListener('click', () => { CARTAO = null; renderModal(); });
$('evSurpresa').addEventListener('click', surpresa);
$('avatar').addEventListener('click', abrirPerfil);
$('age').addEventListener('click', () => { avancar(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
$('painelVoltar').addEventListener('click', voltar);
document.addEventListener('keydown', e => {
  if (JOGO) { const d = DIRS[e.key]; if (d) { e.preventDefault(); if (JOGO === 'fuga') moverFuga(d); if (JOGO === 'roubo') dirRoubo(d); } return; }
  if (e.key === 'Escape' && CARTAO && !S.fila.length) { CARTAO = null; renderModal(); return; }
  if (e.key === 'Escape' && !$('painel').hidden && $('modal').hidden) voltar();
});

// ================= minijogos =================
// Todos usam a mesma janela (#jogo). JOGO diz qual está aberto: 'fuga', 'roubo' ou 'hack'.
let JOGO = null;
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
function labirinto(n, extras) {
  const g = Array.from({ length: n }, () => Array(n).fill(1));
  const p = [[1, 1]]; g[1][1] = 0;
  while (p.length) {
    const [x, y] = p[p.length - 1];
    const viz = [[2, 0], [-2, 0], [0, 2], [0, -2]].map(([dx, dy]) => [x + dx, y + dy, x + dx / 2, y + dy / 2]).filter(([nx, ny]) => nx > 0 && ny > 0 && nx < n - 1 && ny < n - 1 && g[ny][nx]);
    if (!viz.length) { p.pop(); continue; }
    const [nx, ny, mx, my] = pick(viz); g[ny][nx] = 0; g[my][mx] = 0; p.push([nx, ny]);
  }
  for (let k = 0; k < extras; k++) { const x = R(1, n - 2), y = R(1, n - 2); if ((x + y) % 2) g[y][x] = 0; }
  return g;
}
// Próximo passo de quem persegue (guarda, cachorro) pelo menor caminho
function perseguir(g, de, alvo) {
  const vis = new Map([[de.join(','), null]]), fila = [de];
  while (fila.length) {
    const a = fila.shift();
    if (a[0] === alvo[0] && a[1] === alvo[1]) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = [a[0] + dx, a[1] + dy], k = n.join(',');
      if (g[n[1]] && g[n[1]][n[0]] === 0 && !vis.has(k)) { vis.set(k, a); fila.push(n); }
    }
  }
  let p = alvo, ant = vis.get(alvo.join(','));
  if (ant === undefined) return de;
  while (ant && !(ant[0] === de[0] && ant[1] === de[1])) { p = ant; ant = vis.get(ant.join(',')); }
  return p;
}
function abrirJogo(tipo, titulo, texto, n, ctrl) {
  JOGO = tipo;
  $('jogoTitulo').textContent = titulo;
  $('jogoTexto').textContent = texto;
  $('jogoGrade').style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  $('jogoGrade').className = 'grade ' + tipo;
  $('jogoCtrl').hidden = !ctrl;
  $('jogo').hidden = false;
}
function fecharJogo() { $('jogo').hidden = true; JOGO = null; salvar(); render(); }
const mesma = (a, b) => a[0] === b[0] && a[1] === b[1];

// ---------- fuga da prisão (por turnos) ----------
let FUGA = null;
function abrirFuga() {
  const n = 11;
  FUGA = { g: labirinto(n, 12), eu: [1, n - 2], guarda: [n - 2, n - 2], saida: [n - 2, 1], passos: 0, fim: false };
  abrirJogo('fuga', 'Fuga da prisão', 'Chegue à porta (verde) sem encostar no guarda. Ele anda a cada dois passos seus.', n, true);
  desenharFuga('Use as setas.');
}
function desenharFuga(msg) {
  const { g, eu, guarda, saida } = FUGA;
  let h = '';
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++) {
    const p = [x, y];
    h += mesma(p, eu) ? `<span class="c chao">${avatar({ sexo: S.sexo, idade: S.idade, pele: S.pele, cabelo: S.cabelo })}</span>` : mesma(p, guarda) ? '<span class="c chao">👮</span>' : mesma(p, saida) ? '<span class="c saida">🚪</span>' : `<span class="c ${g[y][x] ? 'parede' : 'chao'}"></span>`;
  }
  $('jogoGrade').innerHTML = h;
  $('jogoMsg').textContent = msg;
}
function moverFuga([dx, dy]) {
  if (!FUGA || FUGA.fim) return;
  const n = [FUGA.eu[0] + dx, FUGA.eu[1] + dy];
  if (FUGA.g[n[1]][n[0]]) return;
  FUGA.eu = n; FUGA.passos++;
  if (mesma(n, FUGA.saida)) return terminarFuga(true);
  if (mesma(n, FUGA.guarda)) return terminarFuga(false);
  if (FUGA.passos % 2 === 0) FUGA.guarda = perseguir(FUGA.g, FUGA.guarda, FUGA.eu);
  if (mesma(FUGA.eu, FUGA.guarda)) return terminarFuga(false);
  desenharFuga(`Passos: ${FUGA.passos}`);
}
function terminarFuga(ok) {
  FUGA.fim = true;
  deltas = {};
  comResultado(() => {
    CUR_CAT = 'crime';
    if (ok) { S.preso = 0; setFlag('fugitivo'); karma(-5); marco('Fuga!', `Você escapou da prisão. Agora é ${G('um fugitivo', 'uma fugitiva')}.`); }
    else { S.preso += 2; mod('felicidade', -8); line('O guarda te pegou na fuga. Mais dois anos de pena.', 'bad'); }
    CUR_CAT = null;
  }, ok ? 'Fuga!' : 'Pego!', ok ? '🏃' : '👮');
  desenharFuga(ok ? 'Você conseguiu!' : 'O guarda te pegou.');
  setTimeout(fecharJogo, 900);
}

// ---------- arrombamento (em tempo real) ----------
let ROUBO = null, ROUBO_T = null;
function abrirRoubo(vi) {
  const v = VITIMAS[vi] || VITIMAS[0], n = 11, g = labirinto(n, 16);
  g[0][1] = 0;
  const livres = [];
  for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) if (!g[y][x]) livres.push([x, y]);
  livres.sort(() => Math.random() - .5);
  const eu = livres.find(p => p[0] > 3 && p[1] > 3) || livres[0];
  const caes = [[n - 2, n - 2], [n - 2, 1], [1, n - 2]].slice(0, v.caes).filter(c => !g[c[1]][c[0]]);
  const itens = livres.filter(p => !mesma(p, eu) && !caes.some(c => mesma(c, p))).slice(0, v.itens).map(p => ({ p, o: pick(OBJETOS) }));
  ROUBO = { g, eu, dir: [0, 0], caes, itens, pegos: [], saida: [1, 0], v, fim: false, t: 0 };
  abrirJogo('roubo', `Casa de ${v.nome.toLowerCase().replace(/^(um|uma) /, '')}`, 'Pegue o máximo de objetos e saia pela porta (🚪 no canto) sem o cachorro te pegar. Deslize o dedo ou use as setas para mudar de direção.', n, true);
  desenharRoubo('Escolha uma direção para começar.');
  clearInterval(ROUBO_T);
  ROUBO_T = setInterval(tickRoubo, 260);
}
function desenharRoubo(msg) {
  const { g, eu, caes, itens, saida } = ROUBO;
  let h = '';
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g.length; x++) {
    const p = [x, y], it = itens.find(i => mesma(i.p, p));
    h += mesma(p, eu) ? `<span class="c chao">${avatar({ sexo: S.sexo, idade: S.idade, pele: S.pele, cabelo: S.cabelo })}</span>`
      : caes.some(c => mesma(c, p)) ? '<span class="c cao">🐕</span>'
      : mesma(p, saida) ? '<span class="c saida">🚪</span>'
      : it ? `<span class="c chao">${it.o[0]}</span>` : `<span class="c ${g[y][x] ? 'parede' : 'chao'}"></span>`;
  }
  $('jogoGrade').innerHTML = h;
  $('jogoMsg').textContent = msg || `Objetos: ${ROUBO.pegos.length} de ${ROUBO.pegos.length + ROUBO.itens.length}`;
}
function dirRoubo(d) { if (ROUBO && !ROUBO.fim) ROUBO.dir = d; }
function tickRoubo() {
  const r = ROUBO;
  if (!r || r.fim) return;
  const [dx, dy] = r.dir;
  if (dx || dy) {
    const n = [r.eu[0] + dx, r.eu[1] + dy];
    if (r.g[n[1]] && r.g[n[1]][n[0]] === 0) r.eu = n;
    const k = r.itens.findIndex(i => mesma(i.p, r.eu));
    if (k >= 0) r.pegos.push(r.itens.splice(k, 1)[0].o);
    if (mesma(r.eu, r.saida)) return terminarRoubo(true);
    r.t++;
    if (r.t % 2 === 0) r.caes = r.caes.map(c => perseguir(r.g, c, r.eu));
  }
  if (r.caes.some(c => mesma(c, r.eu))) return terminarRoubo(false);
  desenharRoubo();
}
function terminarRoubo(ok) {
  const r = ROUBO; r.fim = true; clearInterval(ROUBO_T);
  deltas = {};
  comResultado(() => {
    CUR_CAT = 'crime'; karma(-8);
    if (ok) {
      const v = r.pegos.reduce((t, o) => t + o[2], 0) * r.v.mult;
      if (v) { grana(v); line(`Você arrombou a casa de ${r.v.nome.toLowerCase().replace(/^(um|uma) /, '')} e levou ${r.pegos.map(o => o[1]).join(', ')}. Vendeu tudo por ${fmt(v)}.`); }
      else line('Você entrou na casa, ficou com medo e saiu de mãos vazias.');
    } else {
      mod('saude', -R(3, 8));
      line('O cachorro te pegou pela calça e a polícia chegou.', 'bad');
      if (S.idade >= 12) prender(R(1, 3), 'invasão de domicílio');
    }
    CUR_CAT = null;
  }, ok ? 'Arrombamento' : 'Pego no flagra', '🦝');
  desenharRoubo(ok ? 'Você escapou!' : 'O cachorro te pegou!');
  setTimeout(fecharJogo, 900);
}

// ---------- hacker: ligar os pares ----------
let HACK = null, HACK_T = null;
const CORES_HACK = ['#E5484D', '#3E7BFA', '#30A46C', '#F5B014'];
function gerarHack(n, k) {
  for (let t = 0; t < 300; t++) {
    const g = Array.from({ length: n }, () => Array(n).fill(-1)), sol = [];
    let ok = true;
    for (let c = 0; c < k && ok; c++) {
      const livres = []; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (g[y][x] < 0) livres.push([x, y]);
      let p = pick(livres), cam = [p]; g[p[1]][p[0]] = c;
      for (let passo = 0; passo < R(3, 7); passo++) {
        const viz = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [p[0] + dx, p[1] + dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < n && y < n && g[y][x] < 0);
        if (!viz.length) break;
        p = pick(viz); g[p[1]][p[0]] = c; cam.push(p);
      }
      if (cam.length < 3) ok = false; else sol.push(cam);
    }
    if (ok) return sol;
  }
  return null;
}
function abrirHack() {
  const n = 5, sol = gerarHack(n, 4);
  const pontas = {};
  sol.forEach((cam, c) => { pontas[cam[0].join(',')] = c; pontas[cam[cam.length - 1].join(',')] = c; });
  HACK = { n, sol, pontas, cams: {}, ativo: null, arrastando: false, tempo: 20 + Math.round(S.st.inteligencia / 10), fim: false };
  abrirJogo('hack', 'Hackear', 'Você encontrou um firewall! Ligue cada número ao seu par, arrastando o dedo, antes que o sistema te expulse.', n, false);
  desenharHack();
  clearInterval(HACK_T);
  HACK_T = setInterval(() => { if (!HACK || HACK.fim) return; HACK.tempo--; if (HACK.tempo <= 0) terminarHack(false); else desenharHack(); }, 1000);
}
function donoCelula(k) { for (const c in HACK.cams) if (HACK.cams[c].some(p => p.join(',') === k)) return +c; return -1; }
function desenharHack() {
  const { n, pontas } = HACK;
  let h = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const k = `${x},${y}`, d = donoCelula(k), pt = pontas[k];
    const fundo = d >= 0 ? `style="background:${CORES_HACK[d]}55"` : '';
    h += `<span class="c hk" data-x="${x}" data-y="${y}" ${fundo}>${pt !== undefined ? `<i style="background:${CORES_HACK[pt]}">${pt + 1}</i>` : ''}</span>`;
  }
  $('jogoGrade').innerHTML = h;
  $('jogoMsg').textContent = HACK.fim ? '' : `Tempo restante: ${HACK.tempo} segundos`;
}
function completo(c) { const cam = HACK.cams[c]; if (!cam || cam.length < 2) return false; const a = cam[0].join(','), b = cam[cam.length - 1].join(','); return a !== b && HACK.pontas[a] === c && HACK.pontas[b] === c; }
function tocarHack(x, y, inicio) {
  if (!HACK || HACK.fim) return;
  const k = `${x},${y}`, pt = HACK.pontas[k];
  if (inicio && pt !== undefined) { HACK.ativo = pt; HACK.cams[pt] = [[x, y]]; desenharHack(); return; }
  const c = HACK.ativo;
  if (c === null) return;
  const cam = HACK.cams[c], ult = cam[cam.length - 1];
  if (Math.abs(ult[0] - x) + Math.abs(ult[1] - y) !== 1) return;
  const ja = cam.findIndex(p => p[0] === x && p[1] === y);
  if (ja >= 0) { cam.length = ja + 1; desenharHack(); return; }
  if (completo(c)) return;
  if (pt !== undefined && pt !== c) return;
  const outro = donoCelula(k);
  if (outro >= 0 && outro !== c) { const oc = HACK.cams[outro], i = oc.findIndex(p => p.join(',') === k); oc.length = i; }
  cam.push([x, y]);
  if ([0, 1, 2, 3].every(completo)) return terminarHack(true);
  desenharHack();
}
function terminarHack(ok) {
  HACK.fim = true; clearInterval(HACK_T);
  deltas = {};
  comResultado(() => {
    CUR_CAT = 'crime'; karma(-6);
    if (ok) { const v = R(2, 20) * 1000 + S.st.inteligencia * 50; grana(v); line(`Você passou pelo firewall e transferiu ${fmt(v)} de uma conta.`); }
    else if (chance(.4)) prender(2, 'crime cibernético');
    else line('O sistema te expulsou antes de você terminar.', 'bad');
    CUR_CAT = null;
  }, ok ? 'Acesso liberado' : 'Acesso negado', '💻');
  desenharHack();
  $('jogoMsg').textContent = ok ? 'Acesso liberado!' : 'Tempo esgotado.';
  setTimeout(fecharJogo, 900);
}
function celulaEm(e) { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.closest ? el.closest('.hk') : null; }
let toque0 = null;
$('jogoGrade').addEventListener('pointerdown', e => {
  if (JOGO === 'hack') { const c = celulaEm(e); if (c) { HACK.arrastando = true; tocarHack(+c.dataset.x, +c.dataset.y, true); } e.preventDefault(); }
  else toque0 = [e.clientX, e.clientY];
});
$('jogoGrade').addEventListener('pointermove', e => { if (JOGO === 'hack' && HACK && HACK.arrastando) { const c = celulaEm(e); if (c) tocarHack(+c.dataset.x, +c.dataset.y, false); } });
document.addEventListener('pointerup', e => {
  if (HACK) HACK.arrastando = false;
  if (toque0 && (JOGO === 'roubo' || JOGO === 'fuga')) {
    const dx = e.clientX - toque0[0], dy = e.clientY - toque0[1];
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) { const d = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]; JOGO === 'roubo' ? dirRoubo(d) : moverFuga(d); }
  }
  toque0 = null;
});
$('jogoCtrl').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !b.dataset.d) return; const d = b.dataset.d.split(',').map(Number); JOGO === 'roubo' ? dirRoubo(d) : moverFuga(d); });

// ---------- prova do Detran ----------
let PROVA = null;
function placaSVG(id) {
  const losango = (dentro) => `<svg viewBox="0 0 100 100" class="placa"><rect x="18" y="18" width="64" height="64" rx="5" transform="rotate(45 50 50)" fill="#F5C400" stroke="#111" stroke-width="4"/>${dentro}</svg>`;
  const circulo = (dentro, barra) => `<svg viewBox="0 0 100 100" class="placa"><circle cx="50" cy="50" r="42" fill="#fff" stroke="#D11" stroke-width="10"/>${dentro}${barra ? '<line x1="22" y1="22" x2="78" y2="78" stroke="#D11" stroke-width="9"/>' : ''}</svg>`;
  return {
    pare: '<svg viewBox="0 0 100 100" class="placa"><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#D11" stroke="#fff" stroke-width="4"/><text x="50" y="60" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" font-family="sans-serif">PARE</text></svg>',
    preferencia: '<svg viewBox="0 0 100 100" class="placa"><polygon points="8,12 92,12 50,90" fill="#fff" stroke="#D11" stroke-width="10" stroke-linejoin="round"/></svg>',
    vel60: circulo('<text x="50" y="62" text-anchor="middle" font-size="34" font-weight="800" fill="#111" font-family="sans-serif">60</text><text x="50" y="76" text-anchor="middle" font-size="10" fill="#111" font-family="sans-serif">km/h</text>'),
    estacionar: circulo('<text x="50" y="64" text-anchor="middle" font-size="40" font-weight="800" fill="#111" font-family="sans-serif">E</text>', true),
    lombada: losango('<path d="M28 62 Q50 36 72 62 Z" fill="#111"/><rect x="24" y="62" width="52" height="5" fill="#111"/>'),
    curva: losango('<path d="M42 72 V52 Q42 38 56 38 H60" stroke="#111" stroke-width="7" fill="none"/><polygon points="58,28 72,38 58,48" fill="#111"/>'),
    esquerda: circulo('<path d="M60 72 V50 Q60 40 50 40 H40" stroke="#111" stroke-width="7" fill="none"/><polygon points="42,30 28,40 42,50" fill="#111"/>', true),
    pedestre: losango('<text x="50" y="64" text-anchor="middle" font-size="34">🚶</text>')
  }[id];
}
function abrirProva(tipo) {
  PROVA = { tipo, qs: PLACAS.slice().sort(() => Math.random() - .5).slice(0, 3), i: 0, acertos: 0 };
  perguntaProva();
  renderModal();
}
function perguntaProva() {
  const q = PROVA.qs[PROVA.i];
  const opts = [q.certo, ...q.erradas].sort(() => Math.random() - .5);
  CARTAO = { cat: 'vida', etiqueta: 'Detran', ico: '🚗', titulo: `Prova teórica · ${PROVA.i + 1} de 3`, texto: 'O que significa esta placa?', html: placaSVG(q.id),
    botoes: opts.map(o => ({ t: o, attrs: `data-cartao="resp" data-r="${o === q.certo ? 1 : 0}"` })) };
}
function responderProva(certo) {
  PROVA.acertos += certo; PROVA.i++;
  if (PROVA.i < PROVA.qs.length) { perguntaProva(); renderModal(); return; }
  const p = PROVA; PROVA = null;
  deltas = {};
  comResultado(() => {
    CUR_CAT = 'vida';
    if (p.acertos < 2) { mod('felicidade', -3); line(`Você acertou ${p.acertos} de 3 na prova teórica do Detran e reprovou.`, 'bad'); }
    else if (chance(.55 + S.st.inteligencia / 300)) { S.cnh[p.tipo] = true; mod('felicidade', 6); line(`Você acertou ${p.acertos} de 3 na teórica, passou na prática e tirou a CNH de ${p.tipo}!`, 'good'); }
    else { mod('felicidade', -3); line(`Você passou na teórica, mas reprovou na prática. ${p.tipo === 'carro' ? 'A baliza não perdoa.' : 'Foi o oito.'}`, 'bad'); }
    CUR_CAT = null;
  }, 'Prova do Detran', '🚗');
  salvar(); render();
}

// ================= som, confete e aviso =================
let somLigado = lerLS(SOM_KEY, true);
let AC = null;
function som(tipo) {
  if (!somLigado) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const notas = { ano: [[520, .06]], bom: [[660, .08], [880, .1]], ruim: [[300, .12], [220, .16]], marco: [[523, .1], [659, .1], [784, .1], [1046, .22]], conquista: [[784, .08], [1046, .16]] }[tipo];
    let t = AC.currentTime;
    notas.forEach(([f, d]) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.1, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d);
      t += d * .9;
    });
  } catch (e) {}
}
function confete() {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('confete'), ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) return;
  cv.hidden = false; cv.width = innerWidth; cv.height = innerHeight;
  const cs = getComputedStyle(document.documentElement);
  const cores = ['--sun', '--accent', '--c-amor', '--c-saude', '--c-fama'].map(v => cs.getPropertyValue(v).trim() || '#F4B62C');
  const ps = Array.from({ length: 120 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .4, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 4, r: Math.random() * 6, c: pick(cores), a: Math.random() * 6 }));
  const ini = performance.now();
  (function quadro(t) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.a += .1; ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillRect(-4, -2, 8, 4 + p.r); ctx.restore(); });
    if (t - ini < 2200) requestAnimationFrame(quadro); else { ctx.clearRect(0, 0, cv.width, cv.height); cv.hidden = true; }
  })(ini);
}
let toastT = null;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200);
}

// ================= início =================
if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ S }));
function start(data) {
  const salvo = (data && data.S) || lerLS(SAVE_KEY, null);
  if (salvo && salvo.versao === 3) { S = salvo; S.hab = S.hab || {}; render(); } else novaVida();
}
const hot = window.claude && window.claude.hot;
hot && hot.ready ? hot.ready(start) : start((hot && hot.data) || {});
