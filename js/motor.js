// Ano a Ano · motor: estado do jogo, passagem do ano, carreiras e regras.

// ================= utilidades =================
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;
const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
const uid = () => Math.random().toString(36).slice(2, 9);
const lerLS = (k, def) => { try { const t = localStorage.getItem(k); return t ? JSON.parse(t) : def; } catch (e) { return def; } };
const gravarLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const SAVE_KEY = 'ano-a-ano:v3', CONQ_KEY = 'ano-a-ano:conquistas', VIDAS_KEY = 'ano-a-ano:vidas', SOM_KEY = 'ano-a-ano:som';
const ANO_INICIAL = 2026;
const CAT_ICO = { vida: '🌱', infancia: '🧸', familia: '👪', escola: '🏫', amor: '💘', saude: '🤒', dinheiro: '💰', trabalho: '💼', fama: '⭐', crime: '🚨' };
const CATS = { vida: 'Vida', infancia: 'Infância', familia: 'Família', escola: 'Escola', amor: 'Amor', saude: 'Saúde', dinheiro: 'Dinheiro', trabalho: 'Trabalho', fama: 'Fama', crime: 'Crime' };

// ================= estado e ajudantes =================
let S = null;
let CUR_CAT = null;
let deltas = {};
const fmtCache = {};
function fmt(v) {
  const p = PAISES[(S && S.pais) || 'Brasil'];
  fmtCache[p.moeda] = fmtCache[p.moeda] || new Intl.NumberFormat('pt-BR', { style: 'currency', currency: p.moeda, maximumFractionDigits: 0 });
  return fmtCache[p.moeda].format(Math.round(v / p.taxa));
}
const num = n => new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const preco = v => Math.round(v * PAISES[S.pais].custo);
const G = (m, f) => (S && S.sexo === 'F' ? f : m);
const flag = k => !!(S && S.flags[k]);
const setFlag = (k, v = true) => { S.flags[k] = v; };
function mod(k, d) { const a = S.st[k]; S.st[k] = clamp(a + d); deltas[k] = (deltas[k] || 0) + (S.st[k] - a); }
function grana(d) { d = Math.round(d); S.dinheiro += d; deltas.dinheiro = (deltas.dinheiro || 0) + d; }
function karma(d) { S.karma = clamp(S.karma + d); }
function popular(d) { S.popularidade = clamp(S.popularidade + d); }
function line(t, tone = '', cat) { S.log[S.log.length - 1].l.push({ t, tone, c: cat || CUR_CAT || 'vida' }); }
const addAno = () => { S.log.push({ i: S.idade, a: S.ano, l: [] }); };
const achar = tipo => S.rel.find(r => r.tipo === tipo && r.vivo);
const filhosVivos = () => S.rel.filter(r => r.tipo === 'filho' && r.vivo);
const paisVivos = () => S.rel.filter(r => (r.tipo === 'mae' || r.tipo === 'pai') && r.vivo);
const temCurso = c => S.cursos.includes(c);
const rotuloTexto = t => (typeof t === 'function' ? t(S) : t);
const anos = n => `${n} ${n === 1 ? 'ano' : 'anos'}`;
const temVeiculo = () => S.bens.some(b => b.tipo === 'veiculo');
const temCarro = () => S.bens.some(b => b.tipo === 'veiculo' && b.cnh === 'carro');

function pessoa(tipo, sexo, idade, sob) {
  const nome = `${sexo === 'F' ? pick(NF) : pick(NM)} ${sob || pick(SOB)}`;
  const p = { id: uid(), tipo, sexo, nome, idade, rel: R(55, 90), vivo: true, pele: R(0, 5), cabelo: R(0, 4), ap: R(5, 95), int: R(5, 95), doido: R(0, 100) };
  if (idade >= 18) p.prof = profissao(sexo);
  return p;
}
function profissao(sexo) { const p = pick(PROFISSOES); return sexo === 'F' ? p[1] : p[0]; }
function bicho(raca) {
  const r = RACAS.find(x => x.id === raca) || RACAS[0];
  return { id: uid(), tipo: 'pet', sexo: pick(['M', 'F']), nome: pick(PETS_NOMES), idade: R(0, 3), rel: R(70, 95), vivo: true, raca: r.nome, especie: r.especie };
}
function rotulo(r) {
  const f = r.sexo === 'F';
  switch (r.tipo) {
    case 'mae': return 'Mãe';
    case 'pai': return 'Pai';
    case 'irmao': return f ? 'Irmã' : 'Irmão';
    case 'avo': return f ? 'Avó' : 'Avô';
    case 'tio': return f ? 'Tia' : 'Tio';
    case 'primo': return f ? 'Prima' : 'Primo';
    case 'amigo': return f ? 'Amiga' : 'Amigo';
    case 'parceiro': return r.casado ? (f ? 'Esposa' : 'Marido') : (f ? 'Namorada' : 'Namorado');
    case 'filho': return f ? 'Filha' : 'Filho';
    case 'ex': return 'Ex';
    case 'pet': return r.raca;
  }
  return '';
}
const quem = r => `${r.nome} (${rotulo(r).toLowerCase()})`;
// Popup informativo (doença, escola nova...): só tem o botão OK
function aviso(cat, ico, titulo, texto, info) { S.fila.push({ id: '__info', d: { cat, ico, titulo, texto, info } }); }
function marco(titulo, texto) { S.fila.push({ id: '__marco', d: { titulo, texto } }); line(texto, 'good'); }
function sexoParceiro() { return S.interesse === 'A' ? pick(['M', 'F']) : S.interesse; }
function novoParceiro(nome, sexo, sufixo) {
  const p = pessoa('parceiro', sexo, Math.max(14, S.idade + R(-3, 3)));
  p.nome = nome; p.rel = R(60, 85); p.casado = false;
  S.rel.push(p);
  mod('felicidade', R(5, 10));
  line(`Você começou a namorar ${nome}${sufixo || ''}.`, 'good', 'amor');
}
function conhecerAlguem(onde) {
  if (achar('parceiro')) { line(`Você conheceu gente legal ${onde}.`); return; }
  const p = pessoa('parceiro', sexoParceiro(), 0);
  novoParceiro(p.nome, p.sexo, `, que você conheceu ${onde}`);
}
function casar(p) {
  p.casado = true; setFlag('casou');
  const v = R(5, 25) * 1000; grana(-v); mod('felicidade', 15); p.rel = clamp(p.rel + 10);
  S.fila.push({ id: '__marco', d: { titulo: 'Casamento', texto: `Você se casou com ${p.nome}. A festa custou ${fmt(v)} e teve até bem-casado.` } });
  line(`Você se casou com ${p.nome}.`, 'good', 'amor');
}
function terminarRelacao(p) {
  const era = p.casado; p.tipo = 'ex'; p.casado = false; p.rel = clamp(p.rel - 30); mod('felicidade', -R(5, 12));
  if (era) {
    setFlag('divorciou');
    if (S.dinheiro > 0) { const v = Math.round(S.dinheiro * .4); grana(-v); line(`Você se divorciou de ${p.nome}. Na partilha, foram ${fmt(v)}.`, 'bad', 'amor'); return; }
    line(`Você se divorciou de ${p.nome}.`, 'bad', 'amor');
  } else line(`Você terminou com ${p.nome}.`, 'bad', 'amor');
}
function nascerFilho(adotado) {
  const sx = pick(['M', 'F']); const f = pessoa('filho', sx, adotado ? R(0, 10) : 0, S.sobrenome); f.rel = R(80, 100); S.rel.push(f);
  mod('felicidade', 12);
  const titulo = adotado ? 'Família aumentou' : (sx === 'F' ? 'É uma menina!' : 'É um menino!');
  const texto = adotado ? `Você adotou ${f.nome}, de ${anos(f.idade)}.` : `Nasceu ${sx === 'F' ? 'sua filha' : 'seu filho'}, ${f.nome}.`;
  S.fila.push({ id: '__marco', d: { titulo, texto } });
  line(texto, 'good', 'familia');
  return f;
}
function prender(n, motivo) {
  S.ficha++; setFlag('preso'); karma(-10);
  if (S.emprego) { S.ultimoTrabalho = S.emprego.titulo; S.emprego = null; }
  S.bico = null;
  if (S.faculdade) { line(`Você perdeu a vaga na faculdade de ${S.faculdade.curso}.`, 'bad', 'escola'); S.faculdade = null; }
  if (S.escola) S.escola = null;
  S.preso = n; mod('felicidade', -15);
  line(S.idade < 18 ? `Você foi ${G('apreendido', 'apreendida')} por ${motivo} e vai cumprir ${anos(n)} de internação.` : `Você foi ${G('preso', 'presa')} por ${motivo}. Pena: ${anos(n)}.`, 'bad', 'crime');
}
function adoecer(nome) {
  if (S.doencas.includes(nome)) return;
  S.doencas.push(nome);
  line(`Você está com ${nome.toLowerCase()}.`, 'bad', 'saude');
  aviso('saude', '🤒', nome, `Você foi ${G('diagnosticado', 'diagnosticada')} com ${nome.toLowerCase()}.`, [['Gravidade', ['leve', 'leve', 'moderada', 'moderada', 'séria', 'séria', 'grave', 'grave', 'grave', 'grave'][DOENCAS[nome].grav]], ['Tratamento', 'Atividades › Médico']]);
}
const valorBens = () => S.bens.reduce((t, b) => t + b.valor, 0) + S.pertences.reduce((t, b) => t + b.valor, 0);
const dividaBens = () => S.bens.reduce((t, b) => t + b.parcela * b.anos, 0);
const dividaEmprestimos = () => S.emprestimos.reduce((t, e) => t + e.parcela * e.anos, 0);
const totalInv = () => S.inv.poupanca + S.inv.acoes + S.inv.cripto;
const patrimonio = () => S.dinheiro + totalInv() + valorBens() - dividaBens() - dividaEmprestimos() - S.fies;
function signo(dia, mes) { return dia >= SIGNOS[mes][0] ? SIGNOS_DEPOIS[mes] : SIGNOS[mes][1]; }
const enemNota = () => Math.max(300, Math.min(1000, Math.round(330 + S.st.inteligencia * 5.6 + R(-60, 60) + (flag('cursinho') ? 45 : 0))));

// ================= nova vida =================
function baseVida(o) {
  Object.keys(o).forEach(k => { if (o[k] === undefined) delete o[k]; });
  const uf = o.uf || pick(Object.keys(ESTADOS));
  const dia = R(1, 28), mes = R(0, 11);
  return Object.assign({
    versao: 3, nome: '', sobrenome: '', sexo: 'M', interesse: 'A', uf, cidade: pick(ESTADOS[uf].cidades), pais: 'Brasil',
    reg: R(100000, 999999), geracao: 1, nasc: { dia, mes, ano: ANO_INICIAL }, signo: signo(dia, mes),
    time: chance(.45) ? pick(TIMES_NACIONAIS) : pick(ESTADOS[uf].times), pele: R(0, 5), cabelo: R(0, 4),
    idade: 0, ano: ANO_INICIAL, vivo: true, causa: '', fita: null,
    st: { felicidade: R(60, 95), saude: R(70, 100), inteligencia: R(15, 95), aparencia: R(15, 95) },
    karma: 50, popularidade: 50, dinheiro: 0,
    escola: null, formacao: 'nenhuma', cursos: [], faculdade: null, enem: null,
    emprego: null, bico: null, cargos: [], aposentado: false, pensao: 0, ultimoTrabalho: '',
    moradia: 'pais', bens: [], pertences: [], inv: { poupanca: 0, acoes: 0, cripto: 0 }, plano: false, doencas: [],
    hab: {}, seguidores: 0, preso: 0, ficha: 0, fies: 0, emprestimos: [], cnh: { carro: false, moto: false }, herdeiro: null, flags: {},
    rel: [], feitosAno: {}, feitos: [], ultimoEv: {}, fila: [], log: []
  }, o);
}
function familiaExtensa(mae, pai, sobMae, sobPai) {
  const rel = [];
  [[mae, sobMae], [pai, sobPai]].forEach(([p, sob]) => {
    ['F', 'M'].forEach(sx => {
      const idade = p.idade + R(20, 32);
      const a = pessoa('avo', sx, idade, sob);
      if (idade > R(68, 92)) a.vivo = false;
      a.prof = idade > 65 ? (sx === 'F' ? 'aposentada' : 'aposentado') : a.prof;
      rel.push(a);
    });
  });
  for (let i = 0, n = R(1, 3); i < n; i++) {
    const lado = chance(.5) ? [mae, sobMae] : [pai, sobPai];
    const t = pessoa('tio', pick(['M', 'F']), lado[0].idade + R(-8, 8), lado[1]);
    rel.push(t);
    if (chance(.6)) rel.push(pessoa('primo', pick(['M', 'F']), R(0, 12), pick(SOB)));
  }
  return rel;
}
function novaVida(opts = {}) {
  const sexo = opts.sexo || pick(['M', 'F']);
  const sobPai = pick(SOB), sobMae = pick(SOB);
  const primeiro = (opts.nome || '').trim() || (sexo === 'F' ? pick(NF) : pick(NM));
  const mae = pessoa('mae', 'F', R(18, 40), sobMae);
  const pai = pessoa('pai', 'M', R(19, 45), sobPai);
  S = baseVida({ nome: `${primeiro} ${sobMae} ${sobPai}`, sobrenome: sobPai, sexo, interesse: opts.interesse || 'A', uf: opts.uf || undefined, rel: [mae, pai] });
  if (opts.cidade) S.cidade = opts.cidade;
  if (chance(.55)) S.rel.push(pessoa('irmao', pick(['M', 'F']), R(1, 12), sobPai));
  S.rel.push(...familiaExtensa(mae, pai, sobMae, sobPai));
  if (chance(.35)) S.rel.push(Object.assign(bicho(chance(.7) ? 'vira' : 'gato'), { idade: R(1, 6) }));
  addAno();
  CUR_CAT = 'familia';
  line(`Você nasceu no dia ${S.nasc.dia} de ${MESES[S.nasc.mes]} de ${ANO_INICIAL}, em ${S.cidade} (${S.uf}). Seu signo é ${S.signo}.`, 'good');
  line(`Sua mãe é ${mae.nome}, ${mae.prof || 'estudante'} (${mae.idade} anos).`);
  line(`Seu pai é ${pai.nome}, ${pai.prof || 'estudante'} (${pai.idade} anos).`);
  const ir = achar('irmao');
  if (ir) line(`Você tem ${ir.sexo === 'F' ? 'uma irmã mais velha' : 'um irmão mais velho'}: ${ir.nome} (${anos(ir.idade)}).`);
  const pet = achar('pet');
  if (pet) line(`A família tem ${pet.especie === 'gato' ? 'um gato' : 'um cachorro'} chamado ${pet.nome}.`);
  line(`Em casa, todo mundo torce para o ${S.time}.`);
  CUR_CAT = null;
  deltas = {};
  salvar(); render();
}
function novaVidaLegado(id) {
  const ant = S, f = ant.rel.find(r => r.id === id);
  const herdeiros = ant.rel.filter(r => r.tipo === 'filho' && r.vivo);
  const total = Math.max(0, patrimonio());
  let heranca = Math.round(total / (herdeiros.length || 1));
  if (ant.herdeiro && herdeiros.some(h => h.id === ant.herdeiro)) heranca = ant.herdeiro === id ? Math.round(total * (herdeiros.length > 1 ? .7 : 1)) : Math.round(total * .3 / Math.max(1, herdeiros.length - 1));
  const outro = ant.rel.find(r => r.tipo === 'parceiro' && r.vivo);
  const rel = [{ id: uid(), tipo: ant.sexo === 'F' ? 'mae' : 'pai', sexo: ant.sexo, nome: ant.nome, idade: ant.idade, rel: f.rel, vivo: false, pele: ant.pele, cabelo: ant.cabelo }];
  if (outro) rel.push(Object.assign({}, outro, { tipo: outro.sexo === 'F' ? 'mae' : 'pai', casado: false }));
  ant.rel.filter(r => r.tipo === 'filho' && r.id !== id).forEach(r => rel.push(Object.assign({}, r, { tipo: 'irmao' })));
  ant.rel.filter(r => r.tipo === 'pet' && r.vivo).forEach(r => rel.push(r));
  const idade = f.idade;
  S = baseVida({
    nome: f.nome, sobrenome: ant.sobrenome, sexo: f.sexo, interesse: ant.interesse, uf: ant.uf, cidade: ant.cidade, pais: ant.pais,
    geracao: (ant.geracao || 1) + 1, idade, ano: ant.ano, time: ant.time, pele: f.pele, cabelo: f.cabelo, dinheiro: heranca, rel,
    st: { felicidade: R(40, 70), saude: R(60, 100), inteligencia: clamp(ant.st.inteligencia + R(-25, 20)), aparencia: R(15, 95) },
    moradia: idade >= 18 ? 'aluguel' : 'pais'
  });
  S.nasc.ano = ant.ano - idade;
  if (idade >= 6 && idade < 15) S.escola = novaEscola('fundamental');
  else if (idade >= 15 && idade < 18) { S.escola = novaEscola('medio'); S.formacao = 'fundamental'; }
  else if (idade >= 18) { S.formacao = 'medio'; S.feitos.push('fimEscola', 'alistamento', 'enem'); }
  S.feitos.push(...EVENTOS_TODOS.filter(e => e.fixo && e.max < idade).map(e => e.id));
  addAno();
  CUR_CAT = 'familia';
  line(`Você é ${f.sexo === 'F' ? 'a filha' : 'o filho'} de ${ant.nome}, que morreu aos ${ant.idade} anos.`);
  if (heranca > 0) line(`Você herdou ${fmt(heranca)}.`, 'good', 'dinheiro');
  line(`A história da família continua: ${S.geracao}ª geração.`);
  CUR_CAT = null; deltas = {};
  salvar(); render();
}
function novaEscola(tipo, rede) {
  rede = rede || (chance(.25) ? 'particular' : 'pública');
  return { tipo, rede, nome: pick(rede === 'particular' ? ESCOLAS_PART : ESCOLAS_PUB), clubes: [] };
}
function avisoEscola() {
  const e = S.escola, fund = e.tipo === 'fundamental';
  aviso('escola', '🏫', fund ? 'Ensino fundamental' : 'Ensino médio', fund ? 'Você está começando o ensino fundamental.' : 'Você está começando o ensino médio.',
    [['Escola', e.nome], ['Rede', e.rede === 'particular' ? 'Particular' : 'Pública'], ['Nível', fund ? 'Ensino fundamental' : 'Ensino médio'], ['Duração', fund ? '9 anos' : '3 anos']]);
}

// ================= eventos de sistema =================
// Os eventos aleatórios ficam em eventos.js; aqui ficam os que o próprio jogo dispara.
const EVENTOS_SISTEMA = [
  { id: 'enem', cat: 'escola', interno: true, once: true,
    texto: () => 'Chegou o dia do ENEM. Como você vai encarar a prova?',
    escolhas: [
      { t: 'Revisar tudo e dormir cedo', fx: s => { s.enem = enemNota(); line(`Você fez o ENEM e tirou ${s.enem} pontos.`, s.enem >= 700 ? 'good' : ''); } },
      { t: 'Virar a noite estudando', fx: s => { mod('saude', -3); s.enem = Math.min(1000, enemNota() + R(-40, 50)); line(`Você chegou com sono, mas tirou ${s.enem} pontos no ENEM.`, s.enem >= 700 ? 'good' : ''); } },
      { t: 'Faltar na prova', fx: s => { s.enem = null; line('Você faltou no ENEM. Dá para fazer de novo no ano que vem.', 'bad'); } }
    ] },
  { id: 'fimEscola', cat: 'escola', min: 18, max: 18, once: true, interno: true,
    texto: s => s.enem ? `Você terminou o ensino médio com ${s.enem} pontos no ENEM. E agora?` : 'Você terminou o ensino médio, mas está sem nota do ENEM. E agora?',
    escolhas: s => [
      ...(s.enem ? [{ t: 'Entrar na faculdade', fx: s => s.fila.push({ id: 'curso', d: {} }) }] : []),
      { t: `Fazer cursinho e tentar o ENEM de novo (${fmt(preco(6000))})`, fx: s => { grana(-preco(6000)); setFlag('cursinho'); line('Você entrou no cursinho pré-vestibular. O próximo ENEM vai ser melhor.'); } },
      { t: 'Ir trabalhar', fx: () => line('Você decidiu ir direto para o mercado de trabalho.') }
    ] },
  { id: 'curso', cat: 'escola', interno: true,
    texto: s => `Qual curso você quer fazer? Sua nota no ENEM é ${s.enem || 'nenhuma'}.`,
    escolhas: () => Object.keys(CURSOS).map(c => ({ t: `${c} · nota de corte ${CURSOS[c].corte} · ${CURSOS[c].anos} anos`, fx: s => s.fila.push({ id: 'tipoFac', d: { curso: c } }) }))
      .concat([{ t: 'Mudei de ideia', fx: () => line('Você desistiu da faculdade por enquanto.') }]) },
  { id: 'tipoFac', cat: 'escola', interno: true,
    texto: (s, d) => `${d.curso}: como você vai estudar?`,
    escolhas: (s, d) => [
      { t: `Sisu, para a federal (grátis, corte ${CURSOS[d.curso].corte})`, fx: s => {
        if ((s.enem || 0) >= CURSOS[d.curso].corte) { s.faculdade = { curso: d.curso, ano: 0, tipo: 'pública' }; mod('felicidade', 10); karma(2); marco('Aprovação na federal!', `Você passou pelo Sisu em ${d.curso} numa universidade federal.`); }
        else { mod('felicidade', -6); line(`Sua nota não deu para ${d.curso} na federal pelo Sisu.`, 'bad'); }
      } },
      { t: 'ProUni, bolsa integral na particular (nota mínima 600)', fx: s => {
        if ((s.enem || 0) >= 600 && chance(.6)) { s.faculdade = { curso: d.curso, ano: 0, tipo: 'bolsa' }; mod('felicidade', 8); line(`Você ganhou bolsa integral do ProUni para ${d.curso}!`, 'good'); }
        else { mod('felicidade', -4); line('Você não conseguiu a bolsa do ProUni.', 'bad'); }
      } },
      { t: `Particular com Fies (paga depois de formad${G('o', 'a')})`, fx: s => { s.faculdade = { curso: d.curso, ano: 0, tipo: 'particular', fies: true }; mod('felicidade', 5); line(`Você começou ${d.curso} numa particular, financiada pelo Fies.`); } },
      { t: `Particular pagando (${fmt(preco(20000))} por ano)`, fx: s => { s.faculdade = { curso: d.curso, ano: 0, tipo: 'particular' }; mod('felicidade', 5); line(`Você começou ${d.curso} numa faculdade particular.`); } },
      { t: 'Desistir', fx: () => line('Você desistiu da faculdade por enquanto.') }
    ] },
  { id: 'alistamento', cat: 'trabalho', interno: true, once: true,
    texto: () => 'Você fez 18 anos e precisa se alistar no Exército.',
    escolhas: [
      { t: 'Pedir dispensa', fx: () => { if (chance(.75)) line('Você foi dispensado do serviço militar e pegou o certificado de reservista.'); else { setFlag('reservista'); mod('saude', 6); mod('felicidade', -4); line('Pediu dispensa, mas foi convocado. Você passou um ano servindo no quartel.', 'bad'); } } },
      { t: 'Quero servir', fx: () => { setFlag('reservista'); mod('saude', 8); karma(3); line('Você serviu um ano no Exército. Acordava às 5h, mas voltou em forma.', 'good'); } }
    ] },
  { id: 'emigrar', cat: 'vida', interno: true,
    texto: () => `Para onde você quer se mudar? A viagem e o visto custam ${fmt(15000)}. Com faculdade, o visto sai mais fácil.`,
    escolhas: s => Object.keys(PAISES).filter(p => p !== s.pais).map(p => ({ t: p, fx: s => {
      if (s.dinheiro < 15000) { line('Você não tinha dinheiro para a mudança.', 'bad'); return; }
      const ch = p === 'Brasil' ? 1 : .35 + (s.formacao === 'superior' ? .35 : 0) + s.st.inteligencia / 400;
      if (chance(ch)) {
        grana(-15000);
        if (s.emprego) { s.ultimoTrabalho = s.emprego.titulo; s.emprego = null; }
        s.bico = null; s.pais = p; s.moradia = 'aluguel'; if (p !== 'Brasil') setFlag('emigrou');
        s.fila.push({ id: '__marco', d: { titulo: p === 'Brasil' ? 'De volta ao Brasil' : `Nova vida: ${p}`, texto: p === 'Brasil' ? 'Você voltou para o Brasil. Que saudade de um pão de queijo!' : `Você se mudou para ${p}. Os valores agora aparecem na moeda local.` } });
        line(p === 'Brasil' ? 'Você voltou a morar no Brasil.' : `Você se mudou para ${p}.`, 'good');
      } else { grana(-3000); mod('felicidade', -5); line(`O visto para ${p} foi negado.`, 'bad'); }
    } })).concat([{ t: 'Ficar onde estou', fx: () => line('Você desistiu da mudança.') }]) }
];
const EVENTOS_TODOS = EVENTOS_SISTEMA.concat(typeof EVENTOS !== 'undefined' ? EVENTOS : []);
const EV = Object.fromEntries(EVENTOS_TODOS.map(e => [e.id, e]));

function elegivel(e) {
  if (e.interno || e.fixo) return false;
  if (S.idade < (e.min ?? 0) || S.idade > (e.max ?? 120)) return false;
  if (!!e.prisao !== S.preso > 0) return false;
  if (e.once && S.feitos.includes(e.id)) return false;
  if (!e.once && S.ultimoEv[e.id] !== undefined && S.idade - S.ultimoEv[e.id] < (e.gap ?? 6)) return false;
  if (e.cond) { try { if (!e.cond(S)) return false; } catch (err) { return false; } }
  return true;
}
function disparar(e, data) {
  if (e.once) S.feitos.push(e.id);
  S.ultimoEv[e.id] = S.idade;
  CUR_CAT = e.cat || 'vida';
  try {
    const d = data || (e.prep ? e.prep(S) : {});
    if (e.escolhas) S.fila.push({ id: e.id, d }); else e.fx(S, d);
  } catch (err) { console.warn('Evento com erro:', e.id, err); }
  CUR_CAT = null;
}
function sortearEventos() {
  EVENTOS_TODOS.filter(e => e.fixo && S.idade >= e.min && S.idade <= e.max && !S.feitos.includes(e.id)).forEach(e => disparar(e));
  const ok = EVENTOS_TODOS.filter(elegivel);
  let n = chance(.75) ? 1 : 0;
  if (chance(.3)) n++;
  for (let k = 0; k < n && ok.length; k++) {
    const e = ok.splice(Math.floor(Math.random() * ok.length), 1)[0];
    if (e.p && !chance(e.p)) continue;
    disparar(e);
  }
}

// ================= passar o ano =================
function avancar() {
  if (!S.vivo || S.fila.length) return;
  deltas = {};
  S.idade++; S.ano++; S.feitosAno = {};
  addAno();
  const preso = S.preso > 0;
  if (preso) {
    S.preso--;
    if (S.preso === 0) { mod('felicidade', 10); line('Você cumpriu a pena e saiu da prisão.', 'good', 'crime'); }
  }
  envelhecerFamilia();
  if (!preso) { escola(); trabalho(); }
  financas();
  saude();
  deriva();
  if (!S.preso) {
    if (S.idade === 17 && S.escola && S.escola.tipo === 'medio' && !S.feitos.includes('enem')) disparar(EV.enem);
    if (S.idade === 18 && S.sexo === 'M' && !S.feitos.includes('alistamento')) disparar(EV.alistamento);
    if (S.idade === 18 && S.formacao === 'medio' && !S.feitos.includes('fimEscola')) disparar(EV.fimEscola);
  }
  sortearEventos();
  morte();
  const ano = S.log[S.log.length - 1].l;
  if (!ano.length) line('Um ano tranquilo.', 'quiet');
  salvar(); render();
  const ruins = ano.filter(x => x.tone === 'bad').length, bons = ano.filter(x => x.tone === 'good').length;
  if (!S.vivo) som('ruim'); else if (!S.fila.length) som(ruins > bons ? 'ruim' : 'ano');
}
function envelhecerFamilia() {
  S.rel.forEach(r => {
    if (!r.vivo) return;
    r.idade++;
    r.rel = clamp(r.rel - R(0, 4));
    if (r.tipo !== 'pet' && r.idade === 18 && !r.prof) r.prof = profissao(r.sexo);
    const limite = r.especie === 'gato' ? 13 : r.especie === 'ave' || r.especie === 'coelho' ? 7 : 11;
    const morre = r.tipo === 'pet' ? (r.idade > limite && chance((r.idade - limite) / 6)) : (r.idade > 60 && chance(Math.pow((r.idade - 60) / 40, 3)));
    if (morre) {
      r.vivo = false;
      mod('felicidade', -R(['avo', 'tio', 'primo'].includes(r.tipo) ? 3 : 8, ['avo', 'tio', 'primo'].includes(r.tipo) ? 8 : 20));
      line(`${quem(r)} morreu aos ${r.idade} anos.`, 'bad', 'familia');
      if ((r.tipo === 'mae' || r.tipo === 'pai') && chance(.5)) { const v = R(5, 80) * 1000; grana(v); line(`Você recebeu ${fmt(v)} de herança.`, '', 'dinheiro'); }
      if (r.tipo === 'avo' && chance(.25)) { const v = R(2, 30) * 1000; grana(v); line(`${r.nome} deixou ${fmt(v)} para você no testamento.`, '', 'dinheiro'); }
    } else if (r.tipo === 'filho' && r.idade === 18) line(`${r.nome} fez 18 anos e saiu de casa.`, '', 'familia');
  });
}
function escola() {
  CUR_CAT = 'escola';
  if (S.idade === 6) { S.escola = novaEscola('fundamental'); line(`Você entrou no ensino fundamental, na ${S.escola.nome}.`); avisoEscola(); }
  else if (S.idade === 15 && S.escola && S.escola.tipo === 'fundamental') { S.escola = Object.assign(novaEscola('medio', S.escola.rede), { clubes: S.escola.clubes }); S.formacao = 'fundamental'; line(`Você começou o ensino médio, na ${S.escola.nome}.`); avisoEscola(); }
  else if (S.idade >= 18 && S.escola && S.escola.tipo === 'medio') { S.escola = null; S.formacao = 'medio'; mod('felicidade', 5); marco('Formatura do ensino médio', 'Você terminou a escola! Teve até festa no clube.'); }
  if (S.escola) {
    mod('inteligencia', R(0, 3));
    S.escola.clubes.forEach(id => { const c = CLUBES.find(x => x.id === id); if (c.st === 'popularidade') popular(3); else mod(c.st, R(1, 2)); });
    popular(R(-3, 3));
  }
  if (S.faculdade) {
    S.faculdade.ano++;
    mod('inteligencia', R(1, 4));
    const c = S.faculdade.curso;
    if (S.faculdade.ano >= CURSOS[c].anos) {
      S.cursos.push(c); S.formacao = 'superior'; S.faculdade = null;
      mod('felicidade', 10);
      marco(`Formatura em ${c}`, `Você se formou em ${c}! A família inteira foi na colação de grau.`);
      if (S.emprego && S.emprego.id === 'estagio') {
        const cargo = CARREIRAS.find(x => x.curso === c);
        if (cargo && chance(.6)) { S.emprego = { id: cargo.id, titulo: G(cargo.m, cargo.f), sal: Math.round(cargo.sal * PAISES[S.pais].sal), anos: 0, desemp: R(55, 70) }; S.ultimoTrabalho = S.emprego.titulo; line(`A empresa do estágio te efetivou como ${S.emprego.titulo.toLowerCase()}.`, 'good', 'trabalho'); }
      }
    }
  }
  CUR_CAT = null;
}
function trabalho() {
  CUR_CAT = 'trabalho';
  if (S.aposentado) grana(S.pensao);
  else if (!S.emprego && S.idade >= 65 && flag('trabalhou')) {
    S.aposentado = true; S.pensao = preco(20000);
    line(`Você começou a receber aposentadoria do INSS: ${fmt(S.pensao)} por ano.`, 'good');
  }
  if (S.bico) { grana(S.bico.sal); }
  const e = S.emprego;
  if (e) {
    grana(e.sal);
    e.anos++;
    e.desemp = clamp(e.desemp + R(-8, 6));
    if (e.id === 'musico') S.seguidores += R(100, 3000);
    if (e.id === 'pol') {
      e.mandato--;
      if (e.mandato <= 0) { S.ultimoTrabalho = e.titulo; S.emprego = null; line(`Seu mandato de ${e.titulo.toLowerCase()} terminou. Dá para concorrer de novo em Ocupação › Política.`); }
    } else if (e.id === 'ator') {
      S.seguidores += R(1000, 20000) * (e.nivel + 1);
      if (e.desemp > 65 && e.nivel < NIVEIS_ATOR.length - 1 && chance(.4)) { e.nivel++; e.sal = Math.round(e.sal * 1.9); line(`Você subiu de patamar na emissora: agora é ${NIVEIS_ATOR[e.nivel].toLowerCase()}. Salário: ${fmt(e.sal)} por ano.`, 'good', 'fama'); }
    } else if (e.id === 'fut' && S.idade >= 36) { S.ultimoTrabalho = e.titulo; S.emprego = null; mod('felicidade', -4); line('Você pendurou as chuteiras.', '', 'fama'); }
    else if (e.desemp > 75 && chance(.3)) { e.sal = Math.round(e.sal * 1.12); line(`Seu chefe gostou do seu trabalho e te deu aumento: ${fmt(e.sal)} por ano.`, 'good'); }
    else if (e.desemp < 20 && e.id !== 'servidor' && chance(.45)) { S.ultimoTrabalho = e.titulo; line(`Você foi ${G('demitido', 'demitida')} do emprego de ${e.titulo.toLowerCase()}.`, 'bad'); mod('felicidade', -10); S.emprego = null; }
    if (S.emprego && S.fies > 0) { const p = Math.min(S.fies, Math.round(S.emprego.sal * .1)); S.fies -= p; grana(-p); if (S.fies === 0) line('Você quitou o Fies!', 'good', 'dinheiro'); }
  }
  if (S.seguidores >= 10000) { const v = Math.round(S.seguidores * .5); grana(v); if (v > 20000) line(`As redes sociais renderam ${fmt(v)} em publicidade.`, '', 'fama'); }
  CUR_CAT = null;
}
function custoMoradia() { return S.idade < 18 ? 0 : preco({ pais: 3000, aluguel: 18000, propria: 6000 }[S.moradia]); }
function custoAnual() {
  if (S.idade < 18 || S.preso) return 0;
  let c = custoMoradia();
  c += preco(8000) * filhosVivos().filter(f => f.idade < 18).length;
  c += preco(3500) * S.bens.filter(b => b.tipo === 'veiculo' && b.cnh).length;
  c += preco(1200) * S.rel.filter(r => r.tipo === 'pet' && r.vivo).length;
  if (S.plano) c += preco(6000);
  if (flag('fumante')) c += preco(3000);
  return c;
}
function financas() {
  CUR_CAT = 'dinheiro';
  grana(-custoAnual());
  if (S.faculdade && S.faculdade.tipo === 'particular') { const c = preco(20000); if (S.faculdade.fies) S.fies += c; else grana(-c); }
  S.bens.forEach(b => { if (b.anos > 0) { grana(-b.parcela); b.anos--; if (b.anos === 0) line(`Você quitou o financiamento: ${b.nome.toLowerCase()}.`, 'good'); } });
  S.bens.forEach(b => { b.valor = Math.round(b.valor * (b.tipo === 'imovel' ? 1.04 : .88)); });
  S.pertences.forEach(b => { b.valor = Math.round(b.valor * .8); });
  S.emprestimos.forEach(e => {
    grana(-e.parcela); e.anos--;
    if (e.anos === 0) line(e.tipo === 'agiota' ? 'Você terminou de pagar o agiota. Ufa.' : 'Você quitou o empréstimo do banco.', 'good');
  });
  S.emprestimos = S.emprestimos.filter(e => e.anos > 0);
  if (S.dinheiro < 0 && S.emprestimos.some(e => e.tipo === 'agiota') && chance(.5)) {
    mod('saude', -R(8, 15)); mod('felicidade', -8);
    line('Os cobradores do agiota apareceram na sua porta. Você levou um susto daqueles.', 'bad', 'crime');
  }
  if (totalInv() > 0) {
    const antes = totalInv();
    S.inv.poupanca = Math.round(S.inv.poupanca * 1.06);
    S.inv.acoes = Math.round(S.inv.acoes * (1 + R(-25, 35) / 100));
    S.inv.cripto = Math.round(S.inv.cripto * (1 + R(-75, 100) / 100));
    const dif = totalInv() - antes;
    line(dif >= 0 ? `Seus investimentos renderam ${fmt(dif)}.` : `Seus investimentos perderam ${fmt(-dif)}.`, dif >= 0 ? '' : 'bad');
  }
  if (S.dinheiro < 0) {
    const juros = Math.round(-S.dinheiro * .1); grana(-juros);
    mod('felicidade', -R(2, 6));
    if (chance(.5)) line(`Seu nome está no Serasa. Os juros do cheque especial foram ${fmt(juros)}.`, 'bad');
  }
  CUR_CAT = null;
}
function saude() {
  CUR_CAT = 'saude';
  S.doencas.forEach(n => { mod('saude', -DOENCAS[n].grav); if (DOENCAS[n].fel) mod('felicidade', -DOENCAS[n].fel); });
  S.doencas = S.doencas.filter(n => { if (chance(DOENCAS[n].rec)) { line(`Você se recuperou de ${n.toLowerCase()}.`, 'good'); return false; } return true; });
  if (flag('fumante')) { mod('saude', -2); mod('aparencia', -1); }
  if (flag('alcool')) { mod('saude', -2); mod('felicidade', R(-3, 1)); }
  if (flag('apostador') && S.idade >= 18) { const v = preco(R(10, 60) * 100); grana(-v); line(`O vício em apostas levou ${fmt(v)} este ano.`, 'bad', 'dinheiro'); }
  CUR_CAT = null;
}
function deriva() {
  mod('felicidade', R(-3, 3));
  if (S.idade > 40) mod('saude', -R(0, 2));
  if (S.idade > 65) mod('saude', -R(0, 3));
  if (S.idade > 30) mod('aparencia', -R(0, 2));
  if (S.idade > 70) mod('inteligencia', -R(0, 2));
  if (S.moradia === 'pais' && S.idade > 25) mod('felicidade', -2);
  if (S.st.felicidade < 15 && chance(.3)) line('Você anda muito pra baixo. Talvez seja bom conversar com alguém ou procurar ajuda.', 'bad', 'saude');
}
function morte(forcada) {
  let p = 0;
  if (S.idade >= 55) p += Math.pow((S.idade - 55) / 45, 3) * .9;
  if (S.st.saude < 20) p += (20 - S.st.saude) / 100;
  if (S.st.saude <= 0 || S.idade >= 115) p = 1;
  if (!forcada && !chance(p)) return;
  S.vivo = false; S.fila = [];
  if (forcada) { S.causa = ''; line('Esta história terminou aqui.', 'bad'); }
  else {
    S.causa = S.doencas.includes('Câncer') ? 'de câncer' : S.st.saude < 20 ? 'de problemas de saúde' : pick(['enquanto dormia', 'de um infarto', 'de velhice', 'cercad' + G('o', 'a') + ' pela família']);
    line(`Você morreu ${S.causa}, aos ${S.idade} anos.`, 'bad');
  }
  S.fita = fita();
  const vidas = lerLS(VIDAS_KEY, []);
  vidas.unshift({ nome: S.nome, idade: S.idade, fita: S.fita[0], ger: S.geracao, ano: S.ano });
  gravarLS(VIDAS_KEY, vidas.slice(0, 30));
}
function fita() {
  const pt = patrimonio(), filhos = S.rel.filter(r => r.tipo === 'filho').length;
  if (S.cargos.includes('presidente')) return [G('Presidente', 'Presidenta'), 'Chegou ao Palácio do Planalto.'];
  if (pt >= 1e7) return ['Magnata', 'Morreu com mais de 10 milhões de patrimônio.'];
  if (S.seguidores >= 1e6) return ['Celebridade', 'Milhões de pessoas acompanhavam cada passo.'];
  if (flag('estrela')) return ['Estrela da TV', 'Brilhou no horário nobre.'];
  if (flag('profissional')) return ['Craque', 'Viveu do futebol, como sonhava no campinho.'];
  if (pt >= 1e6) return [G('Milionário', 'Milionária'), 'Terminou a vida com mais de um milhão.'];
  if (S.cursos.length >= 2 || temCurso('Medicina')) return [G('Acadêmico', 'Acadêmica'), 'Estudou como poucos.'];
  if (S.karma >= 85) return [G('Santo', 'Santa'), 'Ajudou todo mundo que pôde.'];
  if (S.ficha >= 2 || S.karma <= 15) return ['Fora da lei', 'A polícia conhecia pelo nome.'];
  if (filhos >= 3) return ['Família', 'Deixou uma família grande.'];
  if (flag('emigrou')) return [G('Cidadão do mundo', 'Cidadã do mundo'), 'Viveu longe de onde nasceu.'];
  if (S.idade >= 95) return [G('Longevo', 'Longeva'), 'Passou dos 95 anos.'];
  if (S.idade < 30) return ['Vida breve', 'Partiu cedo demais.'];
  if (S.st.felicidade >= 80) return ['Feliz', 'Morreu de bem com a vida.'];
  return ['Vida comum', 'Uma vida tranquila, sem grandes reviravoltas.'];
}

// ================= conquistas =================
const CONQUISTAS = [
  { id: 'milionario', nome: 'Milionário', desc: 'Patrimônio de 1 milhão de reais', ok: () => patrimonio() >= 1e6 },
  { id: 'centenario', nome: 'Centenário', desc: 'Chegar aos 100 anos', ok: () => S.idade >= 100 },
  { id: 'enem', nome: 'Nota alta', desc: 'Tirar 850 ou mais no ENEM', ok: () => (S.enem || 0) >= 850 },
  { id: 'doutor', nome: 'Doutor', desc: 'Se formar em Medicina', ok: () => temCurso('Medicina') },
  { id: 'diplomas', nome: 'Eterno estudante', desc: 'Ter dois diplomas', ok: () => S.cursos.length >= 2 },
  { id: 'medalha', nome: 'Gênio', desc: 'Medalha na Olimpíada de Matemática', ok: () => flag('medalha') },
  { id: 'casou', nome: 'Sim, aceito', desc: 'Casar', ok: () => flag('casou') },
  { id: 'familia', nome: 'Família grande', desc: 'Ter 4 filhos', ok: () => S.rel.filter(r => r.tipo === 'filho').length >= 4 },
  { id: 'dinastia', nome: 'Dinastia', desc: 'Chegar à 3ª geração da família', ok: () => S.geracao >= 3 },
  { id: 'tutor', nome: 'Melhor amigo', desc: 'Adotar um bicho', ok: () => flag('tutor') },
  { id: 'influencer', nome: 'Influencer', desc: 'Ter 1 milhão de seguidores', ok: () => S.seguidores >= 1e6 },
  { id: 'craque', nome: 'Craque', desc: 'Virar jogador de futebol profissional', ok: () => flag('profissional') },
  { id: 'estrela', nome: 'Horário nobre', desc: 'Virar protagonista de novela', ok: () => flag('estrela') },
  { id: 'rockstar', nome: 'Rockstar', desc: 'Assinar com uma gravadora', ok: () => flag('gravadora') },
  { id: 'politico', nome: 'Voto de confiança', desc: 'Ganhar uma eleição', ok: () => S.cargos.length > 0 || (S.emprego && S.emprego.id === 'pol') },
  { id: 'presidente', nome: 'Faixa presidencial', desc: 'Ser eleito presidente', ok: () => flag('presidente') },
  { id: 'reservista', nome: 'Sentido!', desc: 'Servir o Exército', ok: () => flag('reservista') },
  { id: 'empreendedor', nome: 'Empreendedor', desc: 'Abrir um negócio de sucesso', ok: () => flag('negocio') },
  { id: 'casaPropria', nome: 'Casa própria', desc: 'Comprar um imóvel', ok: () => flag('imovel') },
  { id: 'sortudo', nome: 'Sortudo', desc: 'Ganhar na Mega-Sena', ok: () => flag('mega') },
  { id: 'aposentado', nome: 'Missão cumprida', desc: 'Se aposentar', ok: () => S.aposentado },
  { id: 'expatriado', nome: 'Expatriado', desc: 'Morar em outro país', ok: () => flag('emigrou') },
  { id: 'saudavel', nome: 'Corpo de atleta', desc: 'Chegar aos 80 com saúde acima de 80', ok: () => S.idade >= 80 && S.st.saude >= 80 },
  { id: 'santo', nome: 'Coração de ouro', desc: 'Chegar à reputação máxima', ok: () => S.karma >= 95 },
  { id: 'endividado', nome: 'Nome sujo', desc: 'Dever mais de 100 mil reais', ok: () => S.dinheiro <= -100000 },
  { id: 'preso', nome: 'Atrás das grades', desc: 'Ser preso', ok: () => flag('preso') },
  { id: 'fugitivo', nome: 'Fugitivo', desc: 'Fugir da prisão', ok: () => flag('fugitivo') }
];
let CONQ = lerLS(CONQ_KEY, []);
function checarConquistas() {
  const novas = CONQUISTAS.filter(c => !CONQ.includes(c.id) && (() => { try { return c.ok(); } catch (e) { return false; } })());
  if (!novas.length) return;
  novas.forEach(c => CONQ.push(c.id));
  gravarLS(CONQ_KEY, CONQ);
  toast(`Conquista: ${novas.map(c => c.nome).join(', ')}`);
  som('conquista');
}

// ================= carreira =================
const tituloCarreira = c => G(c.m, c.f);
function podeCandidatar(c) {
  if (S.preso) return 'Você está na prisão';
  if (S.idade < c.idade) return `A partir de ${c.idade} anos`;
  if (c.idadeMax && S.idade > c.idadeMax) return `Até ${c.idadeMax} anos`;
  if (c.estudante) return S.faculdade && S.faculdade.ano >= 1 ? '' : 'Para universitários a partir do 2º ano';
  if (c.flag && !flag(c.flag)) return c.flagMsg;
  if (c.cnh && !S.cnh[c.cnh]) return 'Exige carteira de motorista';
  if (c.carro && !temCarro()) return 'Exige ter um carro';
  if (S.escola && c.form !== 'nenhuma') return 'Termine a escola primeiro';
  if (c.curso && !temCurso(c.curso)) return `Exige faculdade de ${c.curso}`;
  if (c.form && FORM[S.formacao] < FORM[c.form]) return `Exige ${FORM_NOME[c.form].toLowerCase()}`;
  if (c.concurso && S.ficha > 0) return 'Exige ficha criminal limpa';
  return '';
}
function candidatar(id) {
  const c = CARREIRAS.find(x => x.id === id);
  S.feitosAno['vaga:' + id] = true;
  CUR_CAT = 'trabalho';
  let p = (c.curso ? .7 : .6) + (S.st.inteligencia - 50) / 200 + (S.st.aparencia - 50) / 400 - .25 * Math.min(S.ficha, 2);
  if (c.concurso) p = .15 + S.st.inteligencia / 300;
  if (c.id === 'fut') p = S.st.saude / 120;
  if (c.teste) p = S.st.aparencia / 140 + (flag('teatro') ? .2 : 0) + (temCurso('Artes Cênicas') ? .25 : 0);
  if (chance(p)) {
    let sal = c.sal;
    if (c.id === 'fut') { sal = [36000, 120000, 480000, 2400000][Math.min(3, Math.floor(R(0, S.st.saude) / 28))]; setFlag('profissional'); }
    S.emprego = { id: c.id, titulo: tituloCarreira(c), sal: Math.round(sal * PAISES[S.pais].sal), anos: 0, desemp: R(45, 65) };
    if (c.teste) S.emprego.nivel = 0;
    S.ultimoTrabalho = S.emprego.titulo;
    mod('felicidade', 6);
    const txt = c.teste ? `Você passou no teste e vai estrear numa novela como figurante. Salário: ${fmt(S.emprego.sal)} por ano.` : c.concurso ? `Você passou no concurso público! Salário: ${fmt(S.emprego.sal)} por ano.` : `Você foi ${G('contratado', 'contratada')} como ${S.emprego.titulo.toLowerCase()}. Salário: ${fmt(S.emprego.sal)} por ano.`;
    if (!flag('trabalhou')) { setFlag('trabalhou'); marco('Primeiro emprego', txt); } else line(txt, 'good');
  } else {
    mod('felicidade', -2);
    line(c.concurso ? 'Você não passou no concurso público.' : c.teste ? 'Você não passou no teste da emissora.' : `Você não passou na entrevista para ${tituloCarreira(c).toLowerCase()}.`);
  }
  CUR_CAT = null;
}
function podeConcorrer(c) {
  if (S.preso) return 'Você está na prisão';
  if (S.idade < c.idade) return `A partir de ${c.idade} anos`;
  if (S.ficha > 0) return 'Ficha suja: a Justiça Eleitoral barrou';
  if (c.req && !S.cargos.includes(c.req)) return `Antes, exerça o cargo de ${G(CARGOS.find(x => x.id === c.req).m, CARGOS.find(x => x.id === c.req).f).toLowerCase()}`;
  if (S.emprego && S.emprego.id === 'pol') return 'Termine o mandato atual primeiro';
  return '';
}
function concorrer(id) {
  const c = CARGOS.find(x => x.id === id);
  S.feitosAno.eleicao = true;
  CUR_CAT = 'trabalho';
  const custo = preco(c.sal * .15);
  grana(-custo);
  const p = c.base + (S.karma - 50) / 200 + S.st.aparencia / 500 + Math.min(.25, Math.log10(S.seguidores + 1) / 25) + (S.cargos.length * .04);
  if (chance(p)) {
    if (S.emprego) S.ultimoTrabalho = S.emprego.titulo;
    S.emprego = { id: 'pol', cargo: id, titulo: G(c.m, c.f), sal: Math.round(c.sal * PAISES[S.pais].sal), anos: 0, desemp: 60, mandato: 4 };
    if (!S.cargos.includes(id)) S.cargos.push(id);
    S.ultimoTrabalho = S.emprego.titulo;
    setFlag('trabalhou');
    if (id === 'presidente') setFlag('presidente');
    S.seguidores += R(5, 50) * 1000 * (CARGOS.indexOf(c) + 1);
    mod('felicidade', 12);
    marco(`${G('Eleito', 'Eleita')}!`, `Você venceu a eleição para ${G(c.m, c.f).toLowerCase()}. A campanha custou ${fmt(custo)}.`);
  } else {
    mod('felicidade', -8);
    line(`Você perdeu a eleição para ${G(c.m, c.f).toLowerCase()}. A campanha custou ${fmt(custo)}.`, 'bad');
  }
  CUR_CAT = null;
}

function salvar() { gravarLS(SAVE_KEY, S); }
