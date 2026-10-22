const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = process.argv[2];
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const main = html.match(/<script>([\s\S]*)<\/script>/)[1];
const ev = fs.readFileSync(path.join(dir, 'eventos.js'), 'utf8');
function el() { return { innerHTML: '', textContent: '', hidden: true, scrollTop: 0, dataset: {}, classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }, addEventListener() {}, querySelector() { return { focus() {} }; }, focus() {}, getContext() { return null; } }; }
const els = {};
let clickHandler = null;
const ctx = {
  console, Math, JSON, Intl, Object, Array, String, Number, Date, setTimeout: () => 0, clearTimeout() {},
  performance: { now: () => 0 }, requestAnimationFrame() {}, innerWidth: 400, innerHeight: 800,
  getComputedStyle: () => ({ getPropertyValue: () => '#fff' }),
  document: { getElementById: id => (els[id] = els[id] || el()), addEventListener: (t, f) => { if (t === 'click') clickHandler = f; }, documentElement: {} },
  localStorage: { getItem() { return null; }, setItem() {} },
};
ctx.window = ctx; ctx.window.scrollTo = () => {};
vm.createContext(ctx);
vm.runInContext(ev + '\n' + main + '\n;globalThis.__api = { get S(){return S;}, avancar, escolher, novaVida, novaVidaLegado, ATIVIDADES, CARREIRAS, htmlAtividades, htmlCarreira, htmlPessoas, htmlBens, htmlMenu, abrir, EVENTOS_TODOS, CONQ, render };', ctx);
const A = ctx.__api;
const pick = a => a[Math.floor(Math.random() * a.length)];
// clica num botão simulado
function click(attrs) { const b = { disabled: false, dataset: attrs, closest() { return this; } }; clickHandler({ target: b }); }
function botoes(htmlStr) {
  const out = []; const re = /<button[^>]*?data-act="([^"]+)"([^>]*)>/g; let m;
  while ((m = re.exec(htmlStr))) { if (/\sdisabled/.test(m[2])) continue; const ds = { act: m[1] }; (m[2].match(/data-(\w+)="([^"]*)"/g) || []).forEach(p => { const [, k, v] = p.match(/data-(\w+)="([^"]*)"/); ds[k] = v; }); out.push(ds); }
  return out;
}
const stats = { vidas: 0, idades: [], erros: 0, eventos: {}, maxGer: 0, fitas: {} };
const origWarn = console.warn; console.warn = (...a) => { stats.erros++; if (stats.erros < 6) origWarn(...a); };
const N = +process.argv[3] || 300;
for (let v = 0; v < N; v++) {
  if (v === 0 || !A.S.vivo) {
    const herd = A.S && !A.S.vivo ? A.S.rel.filter(r => r.tipo === 'filho' && r.vivo) : [];
    if (herd.length && Math.random() < .5) A.novaVidaLegado(herd[0].id); else A.novaVida({});
  }
  let guard = 0;
  while (A.S.vivo && guard++ < 400) {
    while ((A.render(), A.S.fila.length)) { const it = A.S.fila[0]; stats.eventos[it.id] = (stats.eventos[it.id] || 0) + 1; const e = A.EVENTOS_TODOS.find(x => x.id === it.id); const n = it.id === '__marco' ? 1 : (typeof e.escolhas === 'function' ? e.escolhas(A.S, it.d) : e.escolhas).length; A.escolher(Math.floor(Math.random() * n)); }
    // ações aleatórias em todas as abas
    for (const f of [A.htmlAtividades, A.htmlCarreira, A.htmlPessoas, A.htmlBens]) {
      for (let k = 0; k < 2; k++) { const bs = botoes(f()).filter(b => !['novaVida', 'novaVidaRapida', 'legado', 'som'].includes(b.act) && !(b.act === 'atividade' && ['banco', 'furtar', 'pirata'].includes(b.id) && Math.random() < .9)); if (!bs.length || !A.S.vivo) break; click(pick(bs)); while ((A.render(), A.S.fila.length)) { const it = A.S.fila[0]; const e = A.EVENTOS_TODOS.find(x => x.id === it.id); const n = it.id === '__marco' ? 1 : (typeof e.escolhas === 'function' ? e.escolhas(A.S, it.d) : e.escolhas).length; A.escolher(Math.floor(Math.random() * n)); } }
    }
    A.htmlMenu();
    A.avancar();
  }
  stats.vidas++; stats.idades.push(A.S.idade); stats.maxGer = Math.max(stats.maxGer, A.S.geracao);
  stats.fitas[A.S.fita && A.S.fita[0]] = (stats.fitas[A.S.fita && A.S.fita[0]] || 0) + 1;
  A.render();
}
const id = stats.idades.sort((a, b) => a - b);
const usados = new Set(Object.keys(stats.eventos));
console.log('vidas', stats.vidas, 'erros', stats.erros, 'idade mediana', id[id.length >> 1], 'min', id[0], 'max', id[id.length - 1], 'geração máx', stats.maxGer);
console.log('fitas', JSON.stringify(stats.fitas));
console.log('conquistas', A.CONQ.length);
console.log('eventos com escolha nunca vistos:', A.EVENTOS_TODOS.filter(e => e.escolhas && !usados.has(e.id)).map(e => e.id).join(', '));
