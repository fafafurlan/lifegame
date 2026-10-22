// Simula vidas aleatórias apertando botões de todos os painéis, para achar erros de lógica.
// Uso: node teste/sim.js <pasta do jogo> [número de vidas]
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = process.argv[2] || '.';
const N = +process.argv[3] || 200;
const codigo = ['dados', 'eventos', 'motor', 'ui'].map(f => fs.readFileSync(path.join(dir, 'js', f + '.js'), 'utf8')).join('\n;\n');

function el() { return { innerHTML: '', textContent: '', hidden: true, value: '0', style: { setProperty() {} }, scrollTop: 0, dataset: {}, classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }, addEventListener() {}, setAttribute() {}, querySelector() { return { focus() {} }; }, focus() {}, getContext() { return null; } }; }
const els = {};
let clique = null;
const ctx = {
  console, Math, JSON, Intl, Object, Array, String, Number, Date, Map, Set,
  setTimeout: f => { f(); return 0; }, clearTimeout() {}, performance: { now: () => 0 }, requestAnimationFrame() {}, innerWidth: 400, innerHeight: 800,
  getComputedStyle: () => ({ getPropertyValue: () => '#fff' }),
  document: { getElementById: id => (els[id] = els[id] || el()), addEventListener: (t, f) => { if (t === 'click') clique = f; }, documentElement: {} },
  localStorage: { getItem() { return null; }, setItem() {} }
};
ctx.window = ctx; ctx.window.scrollTo = () => {};
vm.createContext(ctx);
vm.runInContext(codigo + '\n;globalThis.__api = { get S(){return S;}, set S(v){S=v;}, avancar, escolher, novaVida, novaVidaLegado, PAINEIS, EVENTOS_TODOS, render, get FUGA(){return FUGA;}, moverFuga, get CARTAO(){return CARTAO;}, cliqueCartao, surpresa, abrirPerfil, get CONQ(){return CONQ;} };', ctx);
const A = ctx.__api;
const pick = a => a[Math.floor(Math.random() * a.length)];

function botoes(html) {
  const out = []; const re = /<button([^>]*)>/g; let m;
  while ((m = re.exec(html))) {
    if (/\sdisabled/.test(m[1])) continue;
    const ds = {}; (m[1].match(/data-([\w-]+)="([^"]*)"/g) || []).forEach(p => { const [, k, v] = p.match(/data-([\w-]+)="([^"]*)"/); ds[k] = v.replace(/&quot;/g, '"').replace(/&amp;/g, '&'); });
    if (ds.act || ds.go) out.push(ds);
  }
  return out;
}
function clicar(ds, noPainel) { clique({ target: { disabled: false, dataset: ds, closest(sel) { return sel === '#painel' ? (noPainel ? {} : null) : this; } } }); }
function resolverFila() {
  let g = 0;
  while ((A.render(), A.S.fila.length || A.CARTAO) && g++ < 50) {
    if (!A.S.fila.length) { A.cliqueCartao(A.CARTAO.form ? 'fazer' : 'ok'); continue; }
    const it = A.S.fila[0];
    if (Math.random() < .15 && it.id !== '__marco' && it.id !== '__info') { A.surpresa(); continue; }
    const e = A.EVENTOS_TODOS.find(x => x.id === it.id);
    const n = it.id === '__marco' || it.id === '__info' ? 1 : (typeof e.escolhas === 'function' ? e.escolhas(A.S, it.d) : e.escolhas).length;
    A.escolher(Math.floor(Math.random() * n));
  }
}
const PROIBIDOS = ['novaVida', 'novaVidaRapida', 'legado', 'som', 'encerrar'];
const CRIMES = ['furtar', 'pirata', 'golpe', 'banca', 'banco', 'pichar'];
const stats = { vidas: 0, idades: [], erros: 0, acoes: {}, paineis: new Set(), maxGer: 0, fitas: {} };
const warn = console.warn; console.warn = (...a) => { stats.erros++; if (stats.erros < 6) warn(...a); };

function explorar(raiz) {
  let pilha = [[raiz, undefined]];
  for (let passo = 0; passo < 4; passo++) {
    const [id, arg] = pilha[pilha.length - 1];
    if (!A.PAINEIS[id]) return;
    const p = A.PAINEIS[id](arg);
    if (!p) return;
    stats.paineis.add(id);
    const bs = botoes(p.html).filter(b => !PROIBIDOS.includes(b.act) && !(b.act === 'item' && CRIMES.includes(b.id) && Math.random() < .93) && !(b.act === 'item' && b.cat === 'apostas' && Math.random() < .7));
    if (!bs.length) return;
    const b = pick(bs);
    if (b.go) { pilha.push([b.go, b.arg]); continue; }
    stats.acoes[b.act] = (stats.acoes[b.act] || 0) + 1;
    clicar(b, true);
    if (Math.random() < .05) A.abrirPerfil();
    if (b.act === 'fuga') { let k = 0; while (A.FUGA && !A.FUGA.fim && k++ < 300) A.moverFuga(pick([[0, 1], [0, -1], [1, 0], [-1, 0]])); }
    resolverFila();
    return;
  }
}

for (let v = 0; v < N; v++) {
  if (v === 0 || !A.S.vivo) {
    const herd = A.S && !A.S.vivo ? A.S.rel.filter(r => r.tipo === 'filho' && r.vivo) : [];
    if (herd.length && Math.random() < .5) A.novaVidaLegado(herd[0].id); else A.novaVida({});
  }
  let g = 0;
  while (A.S.vivo && g++ < 400) {
    resolverFila();
    if (!process.env.PASSIVO) for (let k = 0; k < 5 && A.S.vivo; k++) explorar(pick(['ocupacao', 'bens', 'relacoes', 'atividades', 'atividades', 'menu']));
    resolverFila();
    A.avancar();
  }
  stats.vidas++; stats.idades.push(A.S.idade); stats.maxGer = Math.max(stats.maxGer, A.S.geracao);
  const f = A.S.fita && A.S.fita[0]; stats.fitas[f] = (stats.fitas[f] || 0) + 1;
  A.render();
}
const id = stats.idades.sort((a, b) => a - b);
console.log('vidas', stats.vidas, '| erros', stats.erros, '| idade mediana', id[id.length >> 1], 'min', id[0], 'max', id[id.length - 1], '| geração máx', stats.maxGer);
console.log('fitas', JSON.stringify(stats.fitas));
console.log('painéis visitados', stats.paineis.size, '| ações diferentes', Object.keys(stats.acoes).length, '| conquistas', A.CONQ.length);
