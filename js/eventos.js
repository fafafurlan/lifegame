/* Ano a Ano · eventos
   Para criar um evento novo, copie um bloco desta lista e mude o texto.

   Campos:
   id        identificador único, sem espaços
   cat       tipo, define a cor no diário: vida, familia, escola, amor, saude, dinheiro, trabalho, fama, crime
   min/max   faixa de idade em que o evento pode acontecer
   once      true = só acontece uma vez na vida
   fixo      true = acontece sempre ao chegar na idade (marcos como os primeiros passos)
   gap       anos mínimos até o evento poder se repetir (padrão: 6)
   p         chance extra de acontecer quando sorteado (de 0 a 1)
   prisao    true = só acontece na prisão (os outros nunca acontecem lá)
   cond      (s) => true/false, condição extra (s é o estado do jogo)
   prep      (s) => dados sorteados uma vez, como nomes e valores; chegam como "d"
   fx        (s, d) => efeito, para eventos sem escolha
   texto     (s, d) => pergunta, para eventos com escolha
   escolhas  lista de { t: 'texto do botão', fx: (s, d) => efeito }

   Ajudantes: line(texto, 'good'|'bad'), mod('felicidade'|'saude'|'inteligencia'|'aparencia', valor),
   grana(valor), fmt(valor), G('masculino', 'feminino'), R(min, max), pick(lista), chance(0..1),
   flag('nome'), setFlag('nome'), marco('título', 'texto'), prender(anos, 'motivo'), adoecer('Nome'),
   conhecerAlguem('onde'), achar('mae'|'pai'|'parceiro'|'amigo'|'pet'|'ex'), filhosVivos(), num(n)
*/
const EVENTOS = [
  // ---------- primeira infância ----------
  { id: 'passos', cat: 'vida', min: 1, max: 1, once: true, fixo: true,
    fx: () => { line('Você deu os primeiros passos.', 'good'); mod('felicidade', 2); } },
  { id: 'palavra', cat: 'vida', min: 2, max: 2, once: true, fixo: true,
    fx: () => line(`Sua primeira palavra foi "${pick(['mamãe', 'papai', 'não', 'água', 'auau', 'bola', 'biscoito'])}".`) },
  { id: 'creche', cat: 'escola', min: 3, max: 4, once: true,
    texto: () => 'Primeiro dia na creche. Você...',
    escolhas: [
      { t: 'Chora sem parar', fx: () => { mod('felicidade', -2); line('Você chorou o dia inteiro na creche.'); } },
      { t: 'Faz amizade com todo mundo', fx: () => { mod('felicidade', 4); setFlag('sociavel'); line('Você voltou da creche contando o nome de todos os coleguinhas.', 'good'); } },
      { t: 'Morde um coleguinha', fx: () => { setFlag('mordeu'); line('Você mordeu um coleguinha e a creche chamou seus pais.', 'bad'); } }
    ] },
  { id: 'tombo', cat: 'saude', min: 2, max: 5,
    fx: () => { line('Você bateu a testa na quina da mesa e ganhou um galo enorme.', 'bad'); mod('saude', -3); } },
  { id: 'irmaoNasce', cat: 'familia', min: 1, max: 10, once: true, p: .35,
    cond: s => { const m = achar('mae'); return m && m.idade < 42; },
    fx: s => {
      const ir = pessoa('irmao', pick(['M', 'F']), 0, s.sobrenome); ir.rel = R(60, 90); s.rel.push(ir);
      line(`Nasceu ${ir.nome}, ${ir.sexo === 'F' ? 'sua irmã mais nova' : 'seu irmão mais novo'}.`, 'good');
    } },
  { id: 'aniversario', cat: 'familia', min: 5, max: 9, once: true,
    fx: () => { line(`Seus pais fizeram uma festa de aniversário com tema de ${pick(['super-herói', 'dinossauro', 'princesa', 'futebol', 'astronauta'])}.`, 'good'); mod('felicidade', 5); } },
  { id: 'dente', cat: 'vida', min: 6, max: 7, once: true,
    fx: () => line('Seu primeiro dente de leite caiu. A fada do dente deixou uma moeda.') },
  { id: 'divorcioPais', cat: 'familia', min: 6, max: 17, once: true, p: .3,
    cond: () => achar('mae') && achar('pai'),
    texto: () => 'Seus pais anunciaram que vão se separar.',
    escolhas: [
      { t: 'Morar com a mãe', fx: () => { achar('mae').rel = clamp(achar('mae').rel + 10); achar('pai').rel = clamp(achar('pai').rel - 10); mod('felicidade', -5); line('Seus pais se separaram e você foi morar com sua mãe.', 'bad'); } },
      { t: 'Morar com o pai', fx: () => { achar('pai').rel = clamp(achar('pai').rel + 10); achar('mae').rel = clamp(achar('mae').rel - 10); mod('felicidade', -5); line('Seus pais se separaram e você foi morar com seu pai.', 'bad'); } },
      { t: 'Se trancar no quarto', fx: () => { mod('felicidade', -9); line('A separação dos seus pais te deixou arrasad' + G('o', 'a') + '.', 'bad'); } }
    ] },

  // ---------- escola ----------
  { id: 'lanche', cat: 'escola', min: 6, max: 11, cond: s => !!s.escola,
    texto: () => 'Um colega da escola pegou o seu lanche no recreio.',
    escolhas: [
      { t: 'Contar para a professora', fx: () => { mod('felicidade', 1); line('Você contou para a professora, e o colega ficou de castigo.'); } },
      { t: 'Pegar de volta na marra', fx: () => { if (chance(.5)) { mod('felicidade', 4); line('Você recuperou o lanche. Ninguém mexe mais com você.', 'good'); } else { mod('felicidade', -4); mod('saude', -3); line('Você tentou pegar o lanche de volta e levou um empurrão.', 'bad'); } } },
      { t: 'Deixar pra lá', fx: () => { mod('felicidade', -3); line('Você ficou com fome no recreio.'); } }
    ] },
  { id: 'prova', cat: 'escola', min: 9, max: 17, gap: 3, cond: s => !!s.escola,
    texto: () => 'Amanhã tem prova de matemática e você não estudou nada.',
    escolhas: [
      { t: 'Virar a noite estudando', fx: () => { mod('inteligencia', R(3, 6)); mod('saude', -2); line('Você virou a noite estudando e tirou nota boa.', 'good'); } },
      { t: 'Colar na prova', fx: () => { setFlag('colou'); if (chance(.35)) { mod('felicidade', -6); line(`Você foi ${G('pego', 'pega')} colando e tirou zero.`, 'bad'); } else line('A cola deu certo. Ninguém percebeu.'); } },
      { t: 'Dormir cedo e torcer', fx: () => { mod('saude', 2); if (chance(.5)) line('Você foi bem na prova, para sua surpresa.'); else { mod('felicidade', -3); line('Você tirou nota vermelha em matemática.', 'bad'); } } }
    ] },
  { id: 'colaDeNovo', cat: 'escola', min: 11, max: 17, once: true, cond: s => !!s.escola && flag('colou'),
    texto: () => 'A professora desconfia que você cola e avisou que vai te vigiar na próxima prova.',
    escolhas: [
      { t: 'Estudar de verdade desta vez', fx: () => { mod('inteligencia', R(4, 7)); setFlag('honesto'); line('Você estudou de verdade e passou sem colar.', 'good'); } },
      { t: 'Arriscar colar de novo', fx: () => { if (chance(.6)) { mod('felicidade', -8); achar('mae') && (achar('mae').rel = clamp(achar('mae').rel - 8)); line(`Você foi ${G('pego', 'pega')} e levou três dias de suspensão.`, 'bad'); } else line('Você colou de novo. Sorte de principiante.'); } }
    ] },
  { id: 'bullying', cat: 'escola', min: 10, max: 16, cond: s => !!s.escola,
    texto: () => 'Um grupo da escola começou a zoar você todo dia.',
    escolhas: [
      { t: 'Enfrentar o grupo', fx: () => { if (chance(.5)) { mod('felicidade', 6); line('Você enfrentou o grupo e eles pararam.', 'good'); } else { mod('felicidade', -5); mod('saude', -4); line('Você enfrentou o grupo e acabou numa briga.', 'bad'); } } },
      { t: 'Contar para os pais', fx: s => { mod('felicidade', 3); s.rel.filter(r => (r.tipo === 'mae' || r.tipo === 'pai') && r.vivo).forEach(r => { r.rel = clamp(r.rel + 5); }); line('Seus pais foram até a escola e resolveram a situação.', 'good'); } },
      { t: 'Ignorar', fx: () => { mod('felicidade', -6); line('Você ignorou as zoações, mas elas continuaram.', 'bad'); } }
    ] },
  { id: 'feiraCiencias', cat: 'escola', min: 10, max: 16, once: true, cond: s => !!s.escola,
    texto: () => 'Feira de ciências! Seu projeto vai ser...',
    escolhas: [
      { t: 'Um vulcão de bicarbonato', fx: () => { mod('inteligencia', 2); line('Seu vulcão fez sujeira e todo mundo adorou.'); } },
      { t: 'Um robô de sucata', fx: s => { if (s.st.inteligencia > 60 && chance(.6)) { mod('inteligencia', 5); mod('felicidade', 6); line('Seu robô de sucata ganhou o primeiro lugar!', 'good'); } else { mod('felicidade', -2); line('Seu robô pegou fogo na frente dos jurados.', 'bad'); } } },
      { t: 'Copiar um projeto da internet', fx: () => { if (chance(.4)) { mod('felicidade', -5); line('O professor achou o vídeo de onde você copiou o projeto.', 'bad'); } else line('Ninguém percebeu que o projeto era copiado.'); } }
    ] },
  { id: 'olimpiada', cat: 'escola', min: 12, max: 17, once: true, cond: s => !!s.escola && s.st.inteligencia > 70,
    texto: () => `Você foi ${G('convidado', 'convidada')} para a Olimpíada Brasileira de Matemática.`,
    escolhas: [
      { t: 'Participar', fx: s => { if (chance(s.st.inteligencia / 140)) { setFlag('medalha'); mod('inteligencia', 4); mod('felicidade', 8); line('Você ganhou medalha de ouro na Olimpíada de Matemática!', 'good'); } else { mod('inteligencia', 2); line('Você não ganhou medalha, mas aprendeu muito.'); } } },
      { t: 'Recusar', fx: () => line('Você não quis participar da olimpíada.') }
    ] },
  { id: 'musica', cat: 'escola', min: 8, max: 16, once: true,
    texto: () => 'Seu professor de música disse que você tem talento.',
    escolhas: [
      { t: 'Fazer aulas de violão', fx: () => { setFlag('violao'); mod('felicidade', 5); mod('inteligencia', 2); line('Você começou a fazer aulas de violão.', 'good'); } },
      { t: 'Não dar bola', fx: () => line('Você preferiu não levar a música a sério.') }
    ] },
  { id: 'peneira', cat: 'fama', min: 11, max: 16, once: true, cond: s => s.st.saude > 55,
    texto: () => 'Um olheiro de um time grande vai fazer uma peneira no campinho do bairro.',
    escolhas: [
      { t: 'Participar da peneira', fx: s => { if (chance(s.st.saude / 160)) { setFlag('base'); marco(`${G('Aprovado', 'Aprovada')} na peneira!`, 'Você entrou para as categorias de base de um time profissional. Aos 17 já dá para tentar o time principal, na aba Carreira.'); } else { mod('felicidade', -3); line('O olheiro não escolheu você desta vez.'); } } },
      { t: 'Ficar em casa', fx: () => line('Você não foi à peneira.') }
    ] },

  // ---------- adolescência ----------
  { id: 'beijo', cat: 'amor', min: 12, max: 17, once: true,
    fx: () => { line('Você deu seu primeiro beijo.', 'good'); mod('felicidade', R(4, 8)); } },
  { id: 'espinhas', cat: 'saude', min: 13, max: 17,
    fx: () => { line('Uma onda de espinhas tomou conta do seu rosto.', 'bad'); mod('aparencia', -R(2, 6)); } },
  { id: 'bike', cat: 'saude', min: 6, max: 14,
    fx: () => { line('Você caiu da bicicleta e ralou os dois joelhos.', 'bad'); mod('saude', -R(2, 6)); } },
  { id: 'cigarro', cat: 'saude', min: 14, max: 25, once: true,
    texto: () => 'Uma turma te oferece um cigarro eletrônico.',
    escolhas: [
      { t: 'Experimentar', fx: () => { if (chance(.5)) { setFlag('fumante'); line(`Você ficou ${G('viciado', 'viciada')} em cigarro.`, 'bad'); } else line('Você experimentou e achou horrível.'); } },
      { t: 'Recusar', fx: () => { mod('felicidade', 1); line('Você recusou o cigarro.'); } }
    ] },
  { id: 'bebida', cat: 'saude', min: 16, max: 30, once: true,
    texto: () => 'Numa festa, insistem para você virar uma garrafa inteira de cachaça.',
    escolhas: [
      { t: 'Virar a garrafa', fx: () => { mod('saude', -6); if (chance(.3)) { setFlag('alcool'); line('Você virou a garrafa. Desde então, a bebida virou um problema.', 'bad'); } else line('Você virou a garrafa e passou a noite abraçad' + G('o', 'a') + ' no vaso.', 'bad'); } },
      { t: 'Recusar', fx: () => line('Você recusou e foi embora mais cedo.') }
    ] },
  { id: 'banda', cat: 'fama', min: 15, max: 30, once: true, cond: () => flag('violao'),
    texto: () => 'Uns amigos querem montar uma banda e precisam de alguém no violão.',
    escolhas: [
      { t: 'Entrar na banda', fx: s => { setFlag('banda'); s.seguidores += R(50, 500); mod('felicidade', 6); line(`Você entrou na banda "${pick(['Os Desafinados', 'Pastel de Vento', 'Café Frio', 'Rádio Pirata', 'Sereno'])}".`, 'good'); } },
      { t: 'Recusar', fx: () => line('Você não quis entrar na banda.') }
    ] },
  { id: 'showBanda', cat: 'fama', min: 16, max: 45, gap: 3, cond: () => flag('banda'),
    texto: () => 'Sua banda foi chamada para tocar num bar no sábado.',
    escolhas: [
      { t: 'Tocar', fx: s => { if (chance(.6)) { const g = R(500, 5000); s.seguidores += g; grana(R(2, 10) * 100); mod('felicidade', 6); line(`O show lotou! Vocês ganharam ${num(g)} seguidores.`, 'good'); } else { mod('felicidade', -2); line('O bar estava vazio. Só a família foi ver.'); } } },
      { t: 'Recusar', fx: () => line('A banda ficou sem tocar este ano.') }
    ] },
  { id: 'gravadora', cat: 'fama', min: 18, max: 40, once: true, cond: s => flag('banda') && s.seguidores > 15000,
    texto: () => 'Uma gravadora quer contratar sua banda!',
    escolhas: [
      { t: 'Assinar o contrato', fx: s => { setFlag('gravadora'); s.seguidores = Math.round(s.seguidores * 3); grana(80000); marco('Contrato assinado', 'Sua banda agora tem gravadora e música tocando no rádio.'); } },
      { t: 'Continuar independente', fx: () => line('Vocês preferiram continuar independentes.') }
    ] },

  // ---------- amizade e amor ----------
  { id: 'amigo', cat: 'familia', min: 6, max: 70, gap: 4,
    prep: () => { const p = pessoa('amigo', pick(['M', 'F']), 0); return { nome: p.nome, sexo: p.sexo }; },
    texto: (s, d) => `${d.nome} puxou papo com você e parece querer ser ${d.sexo === 'F' ? 'sua amiga' : 'seu amigo'}.`,
    escolhas: [
      { t: 'Fazer amizade', fx: (s, d) => { s.rel.push({ id: uid(), tipo: 'amigo', sexo: d.sexo, nome: d.nome, idade: Math.max(1, s.idade + R(-2, 2)), rel: R(55, 80), vivo: true }); mod('felicidade', 3); line(`Você fez ${d.sexo === 'F' ? 'uma nova amiga' : 'um novo amigo'}: ${d.nome}.`, 'good'); } },
      { t: 'Manter distância', fx: (s, d) => line(`Você não deu muita conversa para ${d.nome}.`) }
    ] },
  { id: 'festa', cat: 'amor', min: 15, max: 30, gap: 3,
    texto: () => `Você foi ${G('convidado', 'convidada')} para uma festa no sábado.`,
    escolhas: [
      { t: 'Ir à festa', fx: () => { mod('felicidade', R(4, 8)); if (chance(.3)) conhecerAlguem('na festa'); else if (chance(.25)) { mod('saude', -4); line('Você exagerou na festa e passou o domingo de ressaca.', 'bad'); } else line('A festa foi ótima.', 'good'); } },
      { t: 'Ficar em casa', fx: () => line('Você ficou em casa vendo série.') }
    ] },
  { id: 'match', cat: 'amor', min: 18, max: 65, gap: 3, cond: () => !achar('parceiro'),
    prep: () => { const p = pessoa('parceiro', sexoParceiro(), 0); return { nome: p.nome, sexo: p.sexo }; },
    texto: (s, d) => `Você deu match com ${d.nome} num aplicativo de namoro.`,
    escolhas: [
      { t: 'Marcar um encontro', fx: (s, d) => { if (chance(.35 + s.st.aparencia / 250)) novoParceiro(d.nome, d.sexo, ' depois de um encontro num barzinho'); else { mod('felicidade', -2); line(`O encontro com ${d.nome} foi esquisito. Não rolou.`); } } },
      { t: 'Ignorar', fx: () => line('Você deixou o match sem resposta.') }
    ] },
  { id: 'ciume', cat: 'amor', min: 16, max: 80, cond: () => !!achar('parceiro'),
    texto: () => `${achar('parceiro').nome} está com ciúme de alguém do seu trabalho.`,
    escolhas: [
      { t: 'Conversar com calma', fx: () => { const p = achar('parceiro'); p.rel = clamp(p.rel + 6); line(`Você conversou com ${p.nome} e tudo se acertou.`, 'good'); } },
      { t: 'Ignorar o ciúme', fx: () => { const p = achar('parceiro'); p.rel = clamp(p.rel - 12); line(`${p.nome} ficou dias sem falar com você.`, 'bad'); } }
    ] },
  { id: 'traicao', cat: 'amor', min: 18, max: 80, p: .4, cond: () => !!achar('parceiro'),
    texto: () => `Você achou mensagens suspeitas de ${achar('parceiro').nome} com outra pessoa.`,
    escolhas: [
      { t: 'Tirar satisfação', fx: () => { const p = achar('parceiro'); if (chance(.5)) { p.rel = clamp(p.rel + 3); line('Era só um mal-entendido. Ufa.', 'good'); } else { p.rel = clamp(p.rel - 25); mod('felicidade', -10); line(`${p.nome} confessou a traição.`, 'bad'); } } },
      { t: 'Perdoar e esquecer', fx: () => { const p = achar('parceiro'); p.rel = clamp(p.rel - 8); mod('felicidade', -5); line('Você decidiu esquecer as mensagens, mas ficou com a pulga atrás da orelha.'); } },
      { t: 'Terminar na hora', fx: () => terminarRelacao(achar('parceiro')) }
    ] },
  { id: 'pedidoCasamento', cat: 'amor', min: 20, max: 55, once: true, cond: () => { const p = achar('parceiro'); return p && !p.casado && p.rel > 70; },
    texto: () => `${achar('parceiro').nome} ajoelhou e te pediu em casamento!`,
    escolhas: [
      { t: 'Aceitar', fx: () => casar(achar('parceiro')) },
      { t: () => 'Ainda não estou pront' + G('o', 'a'), fx: () => { const p = achar('parceiro'); p.rel = clamp(p.rel - 15); line(`${p.nome} ficou de coração partido.`, 'bad'); } }
    ] },
  { id: 'gravidez', cat: 'familia', min: 20, max: 44, p: .5, cond: () => { const p = achar('parceiro'); return p && p.casado && filhosVivos().length < 3; },
    fx: () => nascerFilho() },
  { id: 'casamentoAmigo', cat: 'familia', min: 22, max: 50, gap: 8, cond: () => !!achar('amigo'),
    prep: () => ({ id: achar('amigo').id }),
    texto: (s, d) => { const a = s.rel.find(r => r.id === d.id); return `${a.nome} vai casar e te chamou para ser ${G('padrinho', 'madrinha')}.`; },
    escolhas: [
      { t: 'Aceitar', fx: (s, d) => { const a = s.rel.find(r => r.id === d.id); a.rel = clamp(a.rel + 15); grana(-800); mod('felicidade', 5); line(`Você foi ${G('padrinho', 'madrinha')} no casamento de ${a.nome}. Chorou no discurso.`, 'good'); } },
      { t: 'Inventar uma desculpa', fx: (s, d) => { const a = s.rel.find(r => r.id === d.id); a.rel = clamp(a.rel - 20); line(`${a.nome} ficou magoad${a.sexo === 'F' ? 'a' : 'o'} com você.`, 'bad'); } }
    ] },
  { id: 'reencontro', cat: 'amor', min: 25, max: 85, once: true, cond: () => !!achar('ex') && !achar('parceiro'),
    texto: () => `Você encontrou ${achar('ex').nome}, seu antigo amor, por acaso no mercado.`,
    escolhas: [
      { t: 'Chamar para um café', fx: () => { const e = achar('ex'); if (chance(.45)) { e.tipo = 'parceiro'; e.rel = R(65, 85); mod('felicidade', 10); line(`Você e ${e.nome} voltaram a namorar!`, 'good'); } else line(`O café com ${e.nome} foi legal, mas ficou só na amizade.`); } },
      { t: 'Cumprimentar e seguir', fx: () => line('Vocês trocaram um oi meio sem graça.') }
    ] },
  { id: 'emprestimoAmigo', cat: 'dinheiro', min: 20, max: 80, gap: 6, cond: s => !!achar('amigo') && s.dinheiro > 3000,
    prep: () => ({ id: achar('amigo').id }),
    texto: (s, d) => `${s.rel.find(r => r.id === d.id).nome} pediu ${fmt(3000)} emprestados.`,
    escolhas: [
      { t: 'Emprestar', fx: (s, d) => { const a = s.rel.find(r => r.id === d.id); if (chance(.5)) { a.rel = clamp(a.rel + 10); line(`${a.nome} devolveu tudo certinho meses depois.`, 'good'); } else { grana(-3000); a.rel = clamp(a.rel - 10); line(`${a.nome} nunca devolveu o dinheiro.`, 'bad'); } } },
      { t: 'Negar', fx: (s, d) => { const a = s.rel.find(r => r.id === d.id); a.rel = clamp(a.rel - 10); line(`Você negou o empréstimo para ${a.nome}.`); } }
    ] },

  // ---------- família ----------
  { id: 'cachorro', cat: 'familia', min: 5, max: 85, cond: () => !achar('pet'),
    texto: () => 'Um vira-lata caramelo apareceu na sua porta, magrinho e abanando o rabo.',
    escolhas: [
      { t: 'Adotar', fx: s => { const p = bicho('vira'); p.idade = R(1, 4); s.rel.push(p); setFlag('tutor'); mod('felicidade', R(6, 10)); line(`Você adotou o cachorro e deu o nome de ${p.nome}.`, 'good'); } },
      { t: 'Levar a um abrigo', fx: () => { mod('felicidade', 2); line('Você levou o cachorro a um abrigo.'); } },
      { t: 'Fechar a porta', fx: () => { mod('felicidade', -3); line('Você fechou a porta. O cachorro foi embora.'); } }
    ] },
  { id: 'petFugiu', cat: 'familia', min: 5, max: 95, cond: () => !!achar('pet'),
    texto: () => `${achar('pet').nome} fugiu pelo portão aberto!`,
    escolhas: [
      { t: 'Procurar pelo bairro', fx: () => { const p = achar('pet'); if (chance(.75)) { p.rel = clamp(p.rel + 10); line(`Você achou ${p.nome} na padaria, comendo pão de queijo.`, 'good'); } else { p.vivo = false; p.sumiu = true; mod('felicidade', -12); line(`${p.nome} nunca mais voltou.`, 'bad'); } } },
      { t: 'Espalhar cartazes', fx: () => { const p = achar('pet'); if (chance(.55)) line(`Um vizinho viu o cartaz e trouxe ${p.nome} de volta.`, 'good'); else { p.vivo = false; p.sumiu = true; mod('felicidade', -12); line(`${p.nome} nunca mais voltou.`, 'bad'); } } }
    ] },
  { id: 'paisSaida', cat: 'familia', min: 26, max: 40, once: true, cond: s => s.moradia === 'pais',
    texto: () => 'Seus pais acham que já passou da hora de você ter o seu canto.',
    escolhas: [
      { t: 'Alugar um apartamento', fx: s => { s.moradia = 'aluguel'; mod('felicidade', 4); line('Você alugou um apartamento e saiu da casa dos pais.', 'good'); } },
      { t: 'Implorar para ficar', fx: s => { s.rel.filter(r => (r.tipo === 'mae' || r.tipo === 'pai') && r.vivo).forEach(r => { r.rel = clamp(r.rel - 10); }); line('Você implorou e ganhou mais um tempo na casa dos pais.'); } }
    ] },
  { id: 'paiDoente', cat: 'familia', min: 25, max: 75, gap: 8,
    cond: s => s.rel.some(r => (r.tipo === 'mae' || r.tipo === 'pai') && r.vivo && r.idade > 62),
    prep: s => ({ id: pick(s.rel.filter(r => (r.tipo === 'mae' || r.tipo === 'pai') && r.vivo && r.idade > 62)).id }),
    texto: (s, d) => { const p = s.rel.find(r => r.id === d.id); return `${p.tipo === 'mae' ? 'Sua mãe' : 'Seu pai'}, ${p.nome}, ficou doente e precisa de ajuda.`; },
    escolhas: [
      { t: 'Pagar o tratamento', fx: (s, d) => { const p = s.rel.find(r => r.id === d.id); grana(-10000); p.rel = clamp(p.rel + 15); p.idade -= 2; line(`Você pagou o tratamento de ${p.nome}, que se recuperou bem.`, 'good'); } },
      { t: 'Cuidar pessoalmente', fx: (s, d) => { const p = s.rel.find(r => r.id === d.id); p.rel = clamp(p.rel + 20); mod('felicidade', -3); if (s.emprego) s.emprego.desemp = clamp(s.emprego.desemp - 6); line(`Você passou meses cuidando de ${p.nome}.`); } },
      { t: 'Deixar com os irmãos', fx: (s, d) => { const p = s.rel.find(r => r.id === d.id); p.rel = clamp(p.rel - 15); line(`${p.nome} ficou chatead${p.sexo === 'F' ? 'a' : 'o'} com sua ausência.`, 'bad'); } }
    ] },
  { id: 'filhoEscola', cat: 'familia', min: 20, max: 70, gap: 4,
    cond: () => filhosVivos().some(f => f.idade >= 6 && f.idade <= 14),
    prep: () => ({ id: pick(filhosVivos().filter(f => f.idade >= 6 && f.idade <= 14)).id }),
    texto: (s, d) => { const f = s.rel.find(r => r.id === d.id); return `${f.nome} foi ${f.sexo === 'F' ? 'chamada' : 'chamado'} na diretoria por bagunça.`; },
    escolhas: [
      { t: 'Conversar com calma', fx: (s, d) => { const f = s.rel.find(r => r.id === d.id); f.rel = clamp(f.rel + 6); line(`Você teve uma boa conversa com ${f.nome}.`, 'good'); } },
      { t: 'Deixar de castigo', fx: (s, d) => { const f = s.rel.find(r => r.id === d.id); f.rel = clamp(f.rel - 6); line(`${f.nome} ficou um mês sem videogame.`); } },
      { t: 'Defender na escola', fx: (s, d) => { const f = s.rel.find(r => r.id === d.id); f.rel = clamp(f.rel + 10); line(`Você comprou briga com a diretora para defender ${f.nome}.`); } }
    ] },
  { id: 'filhoVestibular', cat: 'familia', min: 36, max: 80, gap: 3, cond: () => filhosVivos().some(f => f.idade === 18),
    fx: () => { const f = filhosVivos().find(x => x.idade === 18); mod('felicidade', 8); line(`${f.nome} passou no vestibular! Você chorou de orgulho.`, 'good'); } },
  { id: 'neto', cat: 'familia', min: 45, max: 99, gap: 4, p: .5, cond: () => filhosVivos().some(r => r.idade >= 22),
    fx: () => { line('Você ganhou um neto! A família está em festa.', 'good'); mod('felicidade', R(6, 12)); } },

  // ---------- saúde ----------
  { id: 'gripe', cat: 'saude', min: 1, max: 110, gap: 3,
    fx: () => { line('Você pegou uma gripe forte e passou dias de cama.', 'bad'); mod('saude', -R(3, 8)); } },
  { id: 'dentista', cat: 'saude', min: 8, max: 90, gap: 8,
    texto: () => 'Você está com uma dor de dente terrível.',
    escolhas: [
      { t: 'Ir ao dentista', fx: s => { if (s.idade >= 18) grana(-600); mod('saude', 2); line('O dentista fez um canal. Doeu, mas resolveu.'); } },
      { t: 'Tomar remédio e esperar', fx: () => { if (chance(.5)) { mod('saude', -6); line('A dor piorou e virou uma infecção.', 'bad'); } else line('A dor passou sozinha.'); } }
    ] },
  { id: 'vacina', cat: 'saude', min: 1, max: 110, gap: 15,
    texto: () => 'Tem campanha de vacinação no posto de saúde.',
    escolhas: [
      { t: 'Tomar a vacina', fx: () => { mod('saude', 3); line('Você se vacinou. Ganhou até adesivo.', 'good'); } },
      { t: 'Não ir', fx: () => { if (chance(.4)) { mod('saude', -8); line('Você pegou a doença que a vacina evitaria.', 'bad'); } else line('Você não foi se vacinar.'); } }
    ] },
  { id: 'costas', cat: 'saude', min: 35, max: 110,
    fx: () => { line('Suas costas começaram a doer sem motivo nenhum.', 'bad'); mod('saude', -R(2, 6)); } },
  { id: 'pressao', cat: 'saude', min: 35, max: 110, once: true, p: .5, fx: () => adoecer('Pressão alta') },
  { id: 'diabetes', cat: 'saude', min: 30, max: 110, once: true, p: .35, fx: () => adoecer('Diabetes') },
  { id: 'pneumonia', cat: 'saude', min: 0, max: 110, gap: 20, p: .3, fx: () => adoecer('Pneumonia') },
  { id: 'hernia', cat: 'saude', min: 30, max: 85, once: true, p: .4, fx: () => adoecer('Hérnia de disco') },
  { id: 'depressao', cat: 'saude', min: 14, max: 95, once: true, cond: s => s.st.felicidade < 35, fx: () => adoecer('Depressão') },
  { id: 'cancer', cat: 'saude', min: 40, max: 110, once: true, cond: () => flag('fumante') || chance(.25), p: .35, fx: () => adoecer('Câncer') },

  // ---------- dinheiro ----------
  { id: 'carteira', cat: 'dinheiro', min: 8, max: 85,
    prep: () => ({ v: R(5, 40) * 10 }),
    texto: (s, d) => `Você achou uma carteira na calçada com ${fmt(d.v)} e um documento dentro.`,
    escolhas: [
      { t: 'Ficar com o dinheiro', fx: (s, d) => { grana(d.v); mod('felicidade', -2); line(`Você ficou com os ${fmt(d.v)} da carteira. A consciência pesou.`); } },
      { t: 'Procurar o dono', fx: () => { mod('felicidade', R(4, 8)); line('Você devolveu a carteira. O dono quase chorou de alegria.', 'good'); } },
      { t: 'Deixar onde estava', fx: () => line('Você fingiu que não viu a carteira.') }
    ] },
  { id: 'pix', cat: 'dinheiro', min: 25, max: 110, cond: s => s.dinheiro > 1500,
    texto: () => `Chegou uma mensagem: "Oi, troquei de número. Me faz um Pix de ${fmt(1500)}? Te devolvo amanhã."`,
    escolhas: [
      { t: 'Fazer o Pix', fx: () => { grana(-1500); mod('felicidade', -6); line(`Era golpe. Você perdeu ${fmt(1500)}.`, 'bad'); } },
      { t: 'Bloquear o número', fx: () => line('Você bloqueou o golpista. Boa!', 'good') }
    ] },
  { id: 'heranca', cat: 'dinheiro', min: 20, max: 80, once: true, p: .3, prep: () => ({ v: R(5, 60) * 1000 }),
    fx: (s, d) => { grana(d.v); line(`Uma tia-avó que você mal conhecia deixou ${fmt(d.v)} de herança para você.`, 'good'); } },
  { id: 'assalto', cat: 'crime', min: 16, max: 95, p: .6, cond: s => s.dinheiro > 300, prep: s => ({ v: Math.min(s.dinheiro, R(2, 20) * 100) }),
    fx: (s, d) => { grana(-d.v); mod('felicidade', -R(3, 7)); line(`Você foi ${G('assaltado', 'assaltada')} e levaram ${fmt(d.v)}.`, 'bad'); } },
  { id: 'carroQuebrou', cat: 'dinheiro', min: 18, max: 95, cond: s => s.bens.some(b => b.tipo === 'carro'), prep: () => ({ v: R(8, 40) * 100 }),
    fx: (s, d) => { grana(-d.v); line(`Seu carro quebrou na estrada. O conserto custou ${fmt(d.v)}.`, 'bad'); } },
  { id: 'enchente', cat: 'vida', min: 10, max: 95, gap: 12, p: .4,
    fx: s => { mod('felicidade', -5); if (s.idade >= 18) { const v = R(10, 40) * 100; grana(-v); line(`Uma enchente alagou sua rua. O prejuízo foi de ${fmt(v)}.`, 'bad'); } else line('Uma enchente alagou sua rua e a escola fechou por uma semana.', 'bad'); } },
  { id: 'restituicao', cat: 'dinheiro', min: 22, max: 90, gap: 4, cond: s => !!s.emprego,
    prep: () => ({ v: R(5, 40) * 100 }),
    fx: (s, d) => { grana(d.v); line(`Você recebeu ${fmt(d.v)} de restituição do Imposto de Renda.`, 'good'); } },
  { id: 'malhaFina', cat: 'dinheiro', min: 22, max: 90, p: .3, cond: s => !!s.emprego,
    texto: () => 'Caiu na malha fina! Você esqueceu de declarar uma renda.',
    escolhas: [
      { t: 'Pagar a multa', fx: () => { const v = R(20, 80) * 100; grana(-v); line(`Você pagou ${fmt(v)} de multa para a Receita.`, 'bad'); } },
      { t: 'Contratar um contador', fx: () => { grana(-1500); if (chance(.7)) line('O contador resolveu tudo sem multa.', 'good'); else { grana(-4000); line('Nem o contador salvou. Você pagou a multa também.', 'bad'); } } }
    ] },
  { id: 'blackFriday', cat: 'dinheiro', min: 16, max: 85, gap: 3, cond: s => s.dinheiro > 2500,
    texto: () => `Black Friday! Uma TV gigante pela metade do preço: ${fmt(2500)}.`,
    escolhas: [
      { t: 'Comprar', fx: () => { grana(-2500); mod('felicidade', 4); line('Você comprou a TV. A sala ficou pequena para ela.'); } },
      { t: 'Deixar passar', fx: () => line('Você resistiu à Black Friday.') }
    ] },
  { id: 'criptoAmigo', cat: 'dinheiro', min: 18, max: 70, once: true, cond: s => s.dinheiro > 5000,
    texto: () => 'Um amigo jura que uma criptomoeda nova vai multiplicar por 100.',
    escolhas: [
      { t: () => `Investir ${fmt(5000)}`, fx: () => { if (chance(.15)) { const v = R(50, 300) * 1000; grana(v); marco('A moeda explodiu!', `Seus ${fmt(5000)} viraram ${fmt(v)}.`); } else { grana(-5000); line('A moeda virou pó em duas semanas.', 'bad'); } } },
      { t: 'Não cair nessa', fx: () => line('Você não caiu na conversa. A moeda sumiu um mês depois.', 'good') }
    ] },
  { id: 'empreender', cat: 'trabalho', min: 22, max: 60, once: true, cond: s => s.dinheiro > 20000,
    texto: () => `Você teve uma ideia de negócio: uma hamburgueria artesanal. Precisa de ${fmt(20000)}.`,
    escolhas: [
      { t: 'Abrir o negócio', fx: () => { grana(-20000); if (chance(.45)) { const v = R(60, 300) * 1000; grana(v); setFlag('negocio'); marco('Negócio de sucesso', `A hamburgueria virou rede e já rendeu ${fmt(v)}.`); } else { mod('felicidade', -8); line('A hamburgueria fechou em um ano.', 'bad'); } } },
      { t: 'Deixar a ideia de lado', fx: () => line('Você guardou a ideia na gaveta.') }
    ] },

  // ---------- trabalho ----------
  { id: 'promocao', cat: 'trabalho', min: 18, max: 70, p: .5, cond: s => !!s.emprego && s.emprego.desemp > 50,
    fx: s => { s.emprego.sal = Math.round(s.emprego.sal * 1.15); mod('felicidade', 6); line(`Você foi ${G('promovido', 'promovida')}! Seu salário agora é ${fmt(s.emprego.sal)} por ano.`, 'good'); } },
  { id: 'rival', cat: 'trabalho', min: 18, max: 65, cond: s => !!s.emprego,
    texto: () => 'Um colega de trabalho está levando o crédito pelas suas ideias.',
    escolhas: [
      { t: 'Confrontar o colega', fx: s => { if (chance(.5)) { s.emprego.desemp = clamp(s.emprego.desemp + 8); line('Você confrontou o colega e o chefe ficou do seu lado.', 'good'); } else { s.emprego.desemp = clamp(s.emprego.desemp - 8); line('O confronto virou fofoca no escritório.', 'bad'); } } },
      { t: 'Falar com o chefe', fx: s => { s.emprego.desemp = clamp(s.emprego.desemp + 4); line('Você conversou com o chefe e mostrou seus e-mails.'); } },
      { t: 'Deixar quieto', fx: () => { mod('felicidade', -4); line('Você deixou quieto, mas ficou com raiva.'); } }
    ] },
  { id: 'chefeChato', cat: 'trabalho', min: 18, max: 65, cond: s => !!s.emprego && s.emprego.id !== 'fut',
    texto: () => 'Seu chefe novo é insuportável e grita com todo mundo.',
    escolhas: [
      { t: 'Aguentar firme', fx: s => { mod('felicidade', -5); s.emprego.desemp = clamp(s.emprego.desemp + 3); line('Você aguentou o chefe gritão o ano inteiro.'); } },
      { t: 'Denunciar ao RH', fx: s => { if (chance(.5)) { mod('felicidade', 6); line('O RH demitiu o chefe. O escritório comemorou.', 'good'); } else { s.emprego.desemp = clamp(s.emprego.desemp - 12); line('O RH não fez nada e o chefe descobriu.', 'bad'); } } },
      { t: 'Pedir demissão', fx: s => { s.ultimoTrabalho = s.emprego.titulo; s.emprego = null; line('Você pediu demissão por causa do chefe.'); } }
    ] },
  { id: 'homeOffice', cat: 'trabalho', min: 18, max: 65, once: true, cond: s => !!s.emprego && ['adm', 'analista', 'dev', 'adv', 'eng', 'servidor'].includes(s.emprego.id),
    texto: () => 'A empresa liberou home office para quem quiser.',
    escolhas: [
      { t: 'Trabalhar de casa', fx: () => { mod('felicidade', 6); mod('saude', -1); line('Você passou a trabalhar de pijama.', 'good'); } },
      { t: 'Continuar no escritório', fx: s => { s.emprego.desemp = clamp(s.emprego.desemp + 5); line('Você preferiu continuar indo ao escritório.'); } }
    ] },
  { id: 'demissaoMassa', cat: 'trabalho', min: 18, max: 65, p: .3, cond: s => !!s.emprego && !['servidor', 'fut', 'musico', 'estagio'].includes(s.emprego.id),
    fx: s => { if (chance(1 - s.emprego.desemp / 100)) { s.ultimoTrabalho = s.emprego.titulo; line(`A empresa fez demissões em massa e você foi ${G('cortado', 'cortada')}.`, 'bad'); mod('felicidade', -10); s.emprego = null; } else line('A empresa fez demissões em massa, mas você escapou do corte.'); } },
  { id: 'golaco', cat: 'fama', min: 17, max: 36, gap: 2, cond: s => s.emprego && s.emprego.id === 'fut',
    fx: s => { const g = R(10, 300) * 1000; s.seguidores += g; s.emprego.desemp = clamp(s.emprego.desemp + 10); mod('felicidade', 8); line(`Você marcou um golaço no clássico e ganhou ${num(g)} seguidores.`, 'good'); } },
  { id: 'lesao', cat: 'saude', min: 17, max: 36, p: .5, cond: s => s.emprego && s.emprego.id === 'fut',
    fx: s => { mod('saude', -15); s.emprego.desemp = clamp(s.emprego.desemp - 20); line('Você rompeu o ligamento do joelho e ficou meses fora.', 'bad'); } },
  { id: 'europa', cat: 'fama', min: 18, max: 32, once: true, cond: s => s.emprego && s.emprego.id === 'fut' && s.emprego.desemp > 65,
    texto: () => 'Um clube de Portugal fez uma proposta milionária por você!',
    escolhas: [
      { t: 'Aceitar e se mudar', fx: s => { s.pais = 'Portugal'; setFlag('emigrou'); s.emprego.sal = Math.round(s.emprego.sal * 4); s.seguidores *= 2; marco('Rumo à Europa', 'Você foi jogar em Portugal com um salário milionário.'); } },
      { t: 'Ficar no Brasil', fx: () => { mod('felicidade', 3); line('Você recusou a Europa para ficar perto da família.'); } }
    ] },

  // ---------- fama ----------
  { id: 'viral', cat: 'fama', min: 13, max: 80, gap: 4, cond: s => s.seguidores >= 300,
    fx: s => { const antes = s.seguidores; s.seguidores = Math.round(s.seguidores * R(2, 6)); mod('felicidade', 6); line(`Um vídeo seu viralizou! Você foi de ${num(antes)} para ${num(s.seguidores)} seguidores.`, 'good'); } },
  { id: 'cancelado', cat: 'fama', min: 15, max: 85, gap: 6, cond: s => s.seguidores > 20000,
    texto: () => `Acharam um post antigo seu e você está sendo ${G('cancelado', 'cancelada')} na internet.`,
    escolhas: [
      { t: 'Pedir desculpas', fx: s => { s.seguidores = Math.round(s.seguidores * .85); line('Você pediu desculpas. Perdeu alguns seguidores, mas a poeira baixou.'); } },
      { t: 'Dobrar a aposta', fx: s => { if (chance(.35)) { s.seguidores = Math.round(s.seguidores * 1.3); line('A polêmica te deu ainda mais seguidores.', 'good'); } else { s.seguidores = Math.round(s.seguidores * .4); mod('felicidade', -10); line('Você piorou tudo e perdeu mais da metade dos seguidores.', 'bad'); } } },
      { t: 'Sumir das redes', fx: s => { s.seguidores = Math.round(s.seguidores * .7); mod('felicidade', 3); line('Você deu um tempo das redes.'); } }
    ] },
  { id: 'publi', cat: 'fama', min: 15, max: 85, gap: 3, cond: s => s.seguidores >= 50000,
    texto: () => 'Uma marca de energético quer patrocinar seus posts.',
    escolhas: [
      { t: 'Aceitar a publi', fx: s => { const v = Math.round(s.seguidores * .3); grana(v); line(`Você fechou uma publi de ${fmt(v)}.`, 'good'); } },
      { t: 'Recusar', fx: s => { s.seguidores = Math.round(s.seguidores * 1.05); line('Seus fãs adoraram você recusar a publi.'); } }
    ] },
  { id: 'tv', cat: 'fama', min: 16, max: 90, once: true, cond: s => s.seguidores > 500000,
    texto: () => `Você foi ${G('convidado', 'convidada')} para um programa de TV no domingo.`,
    escolhas: [
      { t: 'Ir ao programa', fx: s => { s.seguidores = Math.round(s.seguidores * 1.5); grana(30000); marco('Ao vivo na TV', 'Você apareceu no programa de domingo e o Brasil inteiro viu.'); } },
      { t: 'Recusar', fx: () => line('Você recusou o convite da TV.') }
    ] },
  { id: 'reality', cat: 'fama', min: 18, max: 45, once: true, p: .4, cond: s => s.st.aparencia > 65 && !s.preso,
    texto: () => 'Te chamaram para a seleção do maior reality show do país!',
    escolhas: [
      { t: 'Entrar na casa', fx: s => { if (chance(.2)) { grana(1500000); s.seguidores += 3000000; marco(`${G('Campeão', 'Campeã')} do reality!`, `Você venceu o reality e levou ${fmt(1500000)}.`); } else { const g = R(100, 900) * 1000; s.seguidores += g; mod('felicidade', 4); line(`Você foi ${G('eliminado', 'eliminada')} na ${R(2, 9)}ª semana, mas saiu com ${num(g)} seguidores.`); } } },
      { t: 'Recusar', fx: () => line('Você preferiu ficar longe das câmeras.') }
    ] },

  // ---------- crime ----------
  { id: 'esquema', cat: 'crime', min: 14, max: 35, once: true,
    texto: () => 'Um conhecido te chamou para um "esquema fácil": revender celulares roubados.',
    escolhas: [
      { t: 'Entrar no esquema', fx: () => { setFlag('esquema'); grana(R(1, 5) * 1000); if (chance(.35)) prender(R(1, 3), 'receptação'); else line('Você ganhou um dinheiro fácil. Por enquanto.', 'bad'); } },
      { t: 'Recusar', fx: () => line('Você recusou o esquema. Meses depois, a turma toda foi presa.', 'good') }
    ] },
  { id: 'briga', cat: 'crime', min: 12, max: 110, gap: 1, prisao: true,
    texto: () => 'Um detento te provocou no pátio.',
    escolhas: [
      { t: 'Revidar', fx: s => { if (chance(.45)) { mod('felicidade', 3); line('Você ganhou a briga. Agora te respeitam no pátio.'); } else { mod('saude', -10); s.preso += 1; line('Você perdeu a briga e ganhou mais um ano de pena.', 'bad'); } } },
      { t: 'Ignorar', fx: () => { mod('felicidade', -3); line('Você ignorou a provocação.'); } },
      { t: 'Chamar o agente', fx: () => { mod('felicidade', -2); line('Você chamou o agente. Agora te olham torto.'); } }
    ] },
  { id: 'fuga', cat: 'crime', min: 12, max: 110, gap: 3, prisao: true,
    texto: () => 'Seu colega de cela está planejando uma fuga e te chamou.',
    escolhas: [
      { t: 'Fugir junto', fx: s => { if (chance(.3)) { s.preso = 0; setFlag('fugitivo'); marco('Fuga!', `Você fugiu da prisão. Agora é ${G('um fugitivo', 'uma fugitiva')}.`); } else { s.preso += 3; mod('felicidade', -8); line('A fuga deu errado. Mais três anos de pena.', 'bad'); } } },
      { t: 'Ficar quieto', fx: () => line('Você não quis arriscar a fuga.') }
    ] },
  { id: 'remicao', cat: 'escola', min: 12, max: 110, gap: 2, prisao: true,
    texto: () => 'A prisão abriu vagas num programa de leitura que reduz a pena.',
    escolhas: [
      { t: 'Participar', fx: s => { mod('inteligencia', 3); s.preso = Math.max(1, s.preso - 1); line('Você leu doze livros e reduziu um ano da pena.', 'good'); } },
      { t: 'Recusar', fx: () => line('Você não quis entrar no programa de leitura.') }
    ] },
  { id: 'visita', cat: 'familia', min: 12, max: 110, gap: 1, prisao: true, cond: s => s.rel.some(r => r.vivo && r.tipo !== 'pet' && r.rel > 50),
    fx: () => { mod('felicidade', 5); line('Sua família veio te visitar no domingo.', 'good'); } },

  // ---------- vida adulta e velhice ----------
  { id: 'corrida', cat: 'saude', min: 18, max: 60,
    texto: () => 'Um amigo chamou você para correr uma meia maratona.',
    escolhas: [
      { t: 'Topar o desafio', fx: () => { if (chance(.75)) { mod('saude', R(4, 8)); mod('felicidade', 4); line('Você completou a meia maratona!', 'good'); } else { mod('saude', -6); line('Você se machucou no quilômetro 12.', 'bad'); } } },
      { t: 'Recusar', fx: () => line('Você recusou a corrida.') }
    ] },
  { id: 'vizinho', cat: 'vida', min: 18, max: 95,
    texto: () => 'O vizinho de cima faz festa com som alto toda madrugada.',
    escolhas: [
      { t: 'Bater na porta e reclamar', fx: () => { if (chance(.6)) line('O vizinho pediu desculpas e baixou o som.', 'good'); else { mod('felicidade', -3); line('O vizinho bateu a porta na sua cara.', 'bad'); } } },
      { t: 'Reclamar com o síndico', fx: () => { mod('felicidade', 2); line('O síndico deu uma multa no vizinho.'); } },
      { t: () => 'Aguentar calad' + G('o', 'a'), fx: () => { mod('felicidade', -3); mod('saude', -2); line('Você passou meses dormindo mal.', 'bad'); } }
    ] },
  { id: 'viagem', cat: 'vida', min: 20, max: 80, gap: 3, cond: s => s.dinheiro > 900, prep: () => ({ dest: pick(DESTINOS.nacional)[0] }),
    texto: (s, d) => `Apareceu uma passagem em promoção para ${d.dest} por ${fmt(900)}.`,
    escolhas: [
      { t: 'Comprar e viajar', fx: (s, d) => { grana(-900); mod('felicidade', R(7, 12)); line(`Você viajou para ${d.dest}. Que viagem!`, 'good'); } },
      { t: 'Deixar passar', fx: () => line('Você deixou a promoção passar.') }
    ] },
  { id: 'mudarCidade', cat: 'vida', min: 20, max: 60, once: true, p: .5, cond: s => s.pais === 'Brasil',
    prep: s => { const uf = pick(Object.keys(ESTADOS).filter(u => u !== s.uf)); return { uf, c: pick(ESTADOS[uf].cidades) }; },
    texto: (s, d) => `Você recebeu um convite para se mudar para ${d.c}.`,
    escolhas: [
      { t: 'Fazer as malas', fx: (s, d) => { s.cidade = d.c; s.uf = d.uf; mod('felicidade', 4); line(`Você se mudou para ${d.c}.`, 'good'); } },
      { t: 'Ficar onde está', fx: s => line(`Você preferiu continuar em ${s.cidade}.`) }
    ] },
  { id: 'eleicao', cat: 'vida', min: 16, max: 110, gap: 4,
    texto: () => 'Dia de eleição. Você...',
    escolhas: [
      { t: 'Vota com consciência', fx: () => { mod('felicidade', 1); line('Você votou e saiu com a sensação de dever cumprido.'); } },
      { t: 'Vai à praia', fx: () => { grana(-4); mod('felicidade', 3); line('Você foi à praia e pagou a multa por não votar.'); } }
    ] },
  { id: 'crise40', cat: 'vida', min: 40, max: 48, once: true,
    texto: () => 'Você bateu os 40 e começou a repensar a vida inteira.',
    escolhas: [
      { t: () => `Comprar uma moto (${fmt(25000)})`, fx: () => { grana(-25000); mod('felicidade', 10); line('Você comprou uma moto. A crise passou um pouco.', 'good'); } },
      { t: () => `Fazer uma tatuagem (${fmt(800)})`, fx: () => { grana(-800); mod('felicidade', 5); line('Você fez uma tatuagem enorme no braço.'); } },
      { t: () => `Começar terapia (${fmt(3000)})`, fx: () => { grana(-3000); mod('felicidade', 9); line('Você começou terapia e se sente mais leve.', 'good'); } }
    ] },
  { id: 'copa', cat: 'vida', min: 6, max: 95, once: true, p: .4,
    fx: () => { line('O Brasil foi campeão da Copa do Mundo! A rua inteira comemorou.', 'good'); mod('felicidade', 8); } },
  { id: 'rifa', cat: 'dinheiro', min: 10, max: 95, gap: 10, p: .5,
    fx: s => { if (s.idade >= 18) grana(300); line('Você ganhou a rifa da quermesse: uma cesta básica e um pouco de dinheiro.', 'good'); } },
  { id: 'bingo', cat: 'vida', min: 60, max: 110, gap: 4,
    fx: () => { if (chance(.25)) { const v = R(5, 30) * 100; grana(v); line(`Você gritou BINGO no salão da terceira idade e levou ${fmt(v)}.`, 'good'); } else { mod('felicidade', 3); line('Você passou a tarde no bingo com as amizades.'); } } },
  { id: 'tecnologia', cat: 'vida', min: 65, max: 110, once: true,
    texto: () => 'Seu neto tentou te ensinar a usar o novo aplicativo do banco.',
    escolhas: [
      { t: 'Aprender', fx: () => { mod('inteligencia', 3); line('Você aprendeu a usar o aplicativo e agora manda áudio de 5 minutos.', 'good'); } },
      { t: 'Desistir', fx: () => line('Você disse que prefere ir à agência.') }
    ] },
  { id: 'memorias', cat: 'familia', min: 75, max: 110, once: true,
    fx: () => { mod('felicidade', 6); line('Você passou a tarde mostrando fotos antigas para a família.', 'good'); } },
  // ---------- Brasil de todo dia ----------
  { id: 'festaJunina', cat: 'escola', min: 6, max: 14, gap: 2, cond: s => !!s.escola,
    texto: () => 'Festa junina na escola! Você vai...',
    escolhas: [
      { t: 'Dançar quadrilha', fx: () => { mod('felicidade', 4); popular(3); line('Você dançou quadrilha de chapéu de palha e bigode pintado.', 'good'); } },
      { t: 'Ficar na barraca da pescaria', fx: () => { mod('felicidade', 2); line('Você pescou três prendas na barraca da pescaria.'); } },
      { t: 'Comer canjica até passar mal', fx: () => { mod('felicidade', 3); mod('saude', -2); line('Você comeu canjica, pamonha e quentão de criança até passar mal.'); } }
    ] },
  { id: 'natalTio', cat: 'familia', min: 5, max: 90, gap: 3,
    texto: () => 'Ceia de Natal na casa da vó. O tio do pavê ataca: "É pavê ou pacomê?"',
    escolhas: [
      { t: 'Rir por educação', fx: s => { const t = achar('tio'); if (t) t.rel = clamp(t.rel + 6); line('Você riu da piada do pavê pela décima vez.'); } },
      { t: 'Revirar os olhos', fx: s => { const t = achar('tio'); if (t) t.rel = clamp(t.rel - 4); line('Seu tio ficou chateado com a falta de humor.'); } },
      { t: 'Devolver com outra piada ruim', fx: () => { mod('felicidade', 3); line('Você respondeu com a do "pá de cal" e a mesa inteira gemeu.', 'good'); } }
    ] },
  { id: 'almocoVo', cat: 'familia', min: 6, max: 45, gap: 3, cond: () => !!achar('avo'),
    prep: () => ({ id: achar('avo').id }),
    texto: (s, d) => `Almoço de domingo na casa de ${s.rel.find(r => r.id === d.id).nome}. Ela insiste para você repetir o prato.`,
    escolhas: [
      { t: 'Repetir duas vezes', fx: (s, d) => { const a = s.rel.find(r => r.id === d.id); a.rel = clamp(a.rel + 8); mod('felicidade', 3); mod('saude', -1); line(`Você repetiu a lasanha de ${a.nome} duas vezes.`, 'good'); } },
      { t: 'Dizer que está de dieta', fx: (s, d) => { const a = s.rel.find(r => r.id === d.id); a.rel = clamp(a.rel - 4); line(`${a.nome} disse que você está magr${G('o', 'a')} demais.`); } }
    ] },
  { id: 'carnaval', cat: 'vida', min: 16, max: 75, gap: 3,
    texto: () => 'Chegou o Carnaval. Qual vai ser?',
    escolhas: [
      { t: () => `Desfilar numa escola de samba (${fmt(1500)} a fantasia)`, fx: () => { grana(-1500); mod('felicidade', 10); if (chance(.2)) conhecerAlguem('no desfile da escola de samba'); else line('Você desfilou na avenida e cantou o samba-enredo inteiro.', 'good'); } },
      { t: 'Bloquinho de rua', fx: () => { mod('felicidade', 6); mod('saude', -2); if (chance(.2)) conhecerAlguem('num bloquinho'); else line('Você pulou bloquinho de glitter até a Quarta-feira de Cinzas.'); } },
      { t: 'Descansar longe da folia', fx: () => { mod('felicidade', 3); mod('saude', 2); line('Você aproveitou o feriado para descansar.'); } }
    ] },
  { id: 'reveillon', cat: 'vida', min: 12, max: 95, gap: 4,
    texto: () => 'Réveillon chegando. Vai pular as sete ondas de branco?',
    escolhas: [
      { t: 'Pular as sete ondas', fx: () => { mod('felicidade', 4); line('Você pulou sete ondas, fez sete pedidos e comeu lentilha.'); } },
      { t: 'Ver os fogos pela TV', fx: () => line('Você virou o ano no sofá, vendo os fogos pela TV.') }
    ] },
  { id: 'faltaLuz', cat: 'vida', min: 3, max: 100, gap: 6,
    fx: () => { mod('felicidade', 1); line('Faltou luz no bairro a noite toda. Teve roda de violão na calçada.'); } },
  { id: 'dengue', cat: 'saude', min: 3, max: 100, gap: 8, p: .4, fx: () => adoecer('Dengue') },
  { id: 'calor', cat: 'vida', min: 3, max: 100, gap: 5,
    fx: () => { mod('felicidade', -2); line('Fez 41 graus e o ventilador quebrou no mesmo dia.', 'bad'); } },
  { id: 'grupoFamilia', cat: 'familia', min: 14, max: 95, gap: 4,
    texto: () => 'Seu tio mandou uma notícia falsa no grupo da família.',
    escolhas: [
      { t: 'Corrigir com fonte', fx: () => { karma(2); const t = achar('tio'); if (t) t.rel = clamp(t.rel - 5); line('Você mandou o link da checagem. O tio saiu do grupo indignado.'); } },
      { t: 'Ignorar e silenciar o grupo', fx: () => line('Você silenciou o grupo da família por um ano.') },
      { t: 'Mandar figurinha de bom dia', fx: () => { mod('felicidade', 2); line('Você respondeu com uma figurinha de "bom dia, abençoado".'); } }
    ] },
  { id: 'greveOnibus', cat: 'vida', min: 14, max: 70, gap: 6,
    fx: () => { mod('felicidade', -2); line('Greve de ônibus: você andou uma hora até o destino.', 'bad'); } },
  { id: 'churrascoVizinho', cat: 'familia', min: 18, max: 90, gap: 5,
    texto: () => 'O vizinho chamou você para um churrasco no domingo.',
    escolhas: [
      { t: 'Ir e levar a carne', fx: () => { grana(-150); mod('felicidade', 5); if (chance(.4)) { const p = pessoa('amigo', pick(['M', 'F']), Math.max(18, S.idade + R(-8, 8))); S.rel.push(p); line(`No churrasco, você fez amizade com ${p.nome}.`, 'good'); } else line('O churrasco foi ótimo.', 'good'); } },
      { t: 'Ir e levar só a farofa', fx: () => { karma(-1); mod('felicidade', 4); line('Você levou só um pacote de farofa pronta. Comeu de tudo.'); } },
      { t: 'Inventar uma desculpa', fx: () => line('Você disse que tinha um compromisso.') }
    ] },
  { id: 'obraVizinho', cat: 'vida', min: 18, max: 95, gap: 6,
    texto: () => 'O vizinho começou uma reforma: furadeira às 7h de sábado.',
    escolhas: [
      { t: 'Bater na porta e reclamar', fx: () => { if (chance(.5)) line('O vizinho pediu desculpas e mudou o horário.', 'good'); else { mod('felicidade', -3); line('O vizinho disse que está dentro do horário permitido.'); } } },
      { t: 'Ligar o som mais alto', fx: () => { karma(-1); mod('felicidade', 2); line('Você respondeu com pagode no volume máximo.'); } },
      { t: 'Aguentar', fx: () => { mod('felicidade', -3); line('Você passou três meses acordando com furadeira.'); } }
    ] },
  { id: 'pixErrado', cat: 'dinheiro', min: 18, max: 95, gap: 10,
    texto: () => `Caiu um Pix de ${fmt(800)} de um desconhecido na sua conta. Foi engano.`,
    escolhas: [
      { t: 'Devolver', fx: () => { karma(5); mod('felicidade', 2); line('Você devolveu o Pix. A pessoa mandou um áudio agradecendo.', 'good'); } },
      { t: 'Ficar com o dinheiro', fx: () => { karma(-6); grana(800); line(`Você ficou com os ${fmt(800)} que não eram seus.`); } }
    ] },
  { id: 'cpfNota', cat: 'dinheiro', min: 18, max: 95, gap: 8,
    fx: () => { grana(30); line('Você colocou CPF na nota o ano todo e ganhou trinta reais de crédito.'); } },
  { id: 'celularRoubado', cat: 'crime', min: 12, max: 85, p: .4, cond: s => s.pertences.some(x => x.ref === 'celular'),
    fx: s => { const i = s.pertences.findIndex(x => x.ref === 'celular'); s.pertences.splice(i, 1); mod('felicidade', -6); line('Levaram seu celular no ônibus. Ainda faltavam oito parcelas.', 'bad'); } },
  { id: 'gatonet', cat: 'crime', min: 18, max: 80, once: true,
    texto: () => 'Um vizinho oferece "gatonet": TV a cabo pirata por trinta reais por mês.',
    escolhas: [
      { t: 'Aceitar', fx: () => { karma(-2); mod('felicidade', 3); if (chance(.2)) { grana(-1500); line('A operadora descobriu o gato e você pagou multa.', 'bad'); } else line('Você assistiu todos os jogos pelo gatonet.'); } },
      { t: 'Recusar', fx: () => line('Você recusou o gatonet.') }
    ] },
  { id: 'culto', cat: 'familia', min: 12, max: 95, gap: 8,
    texto: () => 'Uma vizinha te convidou para o culto de domingo.',
    escolhas: [
      { t: 'Ir ao culto', fx: () => { karma(2); mod('felicidade', 3); if (chance(.3)) { const p = pessoa('amigo', pick(['M', 'F']), Math.max(12, S.idade + R(-5, 5))); S.rel.push(p); line(`Você foi ao culto e fez amizade com ${p.nome}.`); } else line('Você foi ao culto e gostou dos louvores.'); } },
      { t: 'Agradecer e recusar', fx: () => line('Você agradeceu o convite, mas não foi.') }
    ] },
  { id: 'timeCampeao', cat: 'vida', min: 6, max: 100, gap: 7, p: .4,
    fx: s => { mod('felicidade', 8); line(`O ${s.time} foi campeão! Você comemorou até ficar sem voz.`, 'good'); } },
  { id: 'rebaixado', cat: 'vida', min: 6, max: 100, gap: 10, p: .3,
    fx: s => { mod('felicidade', -6); line(`O ${s.time} foi rebaixado. Você passou uma semana sem sair de casa.`, 'bad'); } },
  { id: 'jogoCopa', cat: 'vida', min: 10, max: 95, gap: 4,
    texto: () => 'Jogo do Brasil na Copa! Onde você vai assistir?',
    escolhas: [
      { t: 'No bar, com a galera', fx: () => { mod('felicidade', R(3, 6)); line('Você viu o jogo no bar, de camisa amarela e corneta.'); } },
      { t: 'Em casa, com a família', fx: s => { s.rel.filter(r => ['mae', 'pai', 'parceiro', 'filho'].includes(r.tipo) && r.vivo).forEach(r => { r.rel = clamp(r.rel + 3); }); line('Você viu o jogo em casa com a família.'); } },
      { t: 'Nem ligar para futebol', fx: () => line('Você aproveitou a rua vazia para resolver as coisas.') }
    ] },
  { id: 'decimoTerceiro', cat: 'dinheiro', min: 16, max: 75, gap: 2, p: .5, cond: s => !!s.emprego && s.emprego.id !== 'pol',
    prep: s => ({ v: Math.round(s.emprego.sal / 12) }),
    texto: (s, d) => `Caiu o 13º salário: ${fmt(d.v)}. O que fazer?`,
    escolhas: [
      { t: 'Guardar na poupança', fx: (s, d) => { s.inv.poupanca += d.v; line(`Você guardou o 13º na poupança.`, 'good'); } },
      { t: 'Gastar nas compras de Natal', fx: (s, d) => { mod('felicidade', 5); line('Você gastou o 13º inteiro em presentes de Natal.'); } },
      { t: 'Pagar as contas atrasadas', fx: (s, d) => { grana(d.v); line(`Você usou o 13º para pagar as contas.`); } }
    ] },
  { id: 'seguroDesemprego', cat: 'dinheiro', min: 18, max: 64, gap: 6, p: .5, cond: s => !s.emprego && flag('trabalhou') && !s.aposentado && !s.preso,
    fx: () => { const v = preco(6000); grana(v); line(`Você recebeu ${fmt(v)} de seguro-desemprego.`); } },
  { id: 'ipva', cat: 'dinheiro', min: 18, max: 100, gap: 2, p: .6, cond: () => temCarro(),
    fx: () => { const v = preco(R(10, 40) * 100); grana(-v); line(`Chegou o IPVA: ${fmt(v)}.`, 'bad'); } },
  { id: 'buraco', cat: 'dinheiro', min: 18, max: 100, gap: 4, cond: () => temCarro(),
    fx: () => { grana(-600); line(`Você caiu num buraco e furou o pneu. Foram ${fmt(600)} de borracharia.`, 'bad'); } },
  { id: 'multa', cat: 'dinheiro', min: 18, max: 100, gap: 3, p: .5, cond: () => temCarro(),
    texto: () => 'Chegou uma multa de radar por excesso de velocidade.',
    escolhas: [
      { t: 'Pagar a multa', fx: () => { grana(-300); line('Você pagou a multa de radar.'); } },
      { t: 'Recorrer no Detran', fx: () => { if (chance(.3)) line('O recurso foi aceito e a multa caiu.', 'good'); else { grana(-400); line('O recurso foi negado e a multa ficou mais cara.', 'bad'); } } }
    ] },
  { id: 'blitz', cat: 'crime', min: 18, max: 80, p: .6, cond: s => temCarro() && !s.cnh.carro,
    fx: () => { grana(-3000); karma(-2); line('Você foi parad' + G('o', 'a') + ' numa blitz dirigindo sem CNH. Multa e carro guinchado.', 'bad'); } },
  { id: 'intercambio', cat: 'escola', min: 16, max: 25, once: true, cond: s => s.dinheiro > 25000,
    texto: () => `Apareceu a chance de fazer intercâmbio no Canadá por seis meses (${fmt(25000)}).`,
    escolhas: [
      { t: 'Ir', fx: () => { grana(-25000); mod('inteligencia', 6); mod('felicidade', 8); setFlag('ingles'); line('Você fez intercâmbio e voltou falando inglês.', 'good'); } },
      { t: 'Deixar para depois', fx: () => line('Você guardou o dinheiro.') }
    ] },
  { id: 'escandalo', cat: 'trabalho', min: 18, max: 100, gap: 3, p: .5, cond: s => s.emprego && s.emprego.id === 'pol' && s.karma < 55,
    texto: () => 'Vazou um áudio seu num esquema de rachadinha. A imprensa está na sua porta.',
    escolhas: [
      { t: 'Negar tudo', fx: s => { if (chance(.5)) line('A história sumiu do noticiário em uma semana.'); else { karma(-8); s.seguidores = Math.round(s.seguidores * .7); line('Ninguém acreditou. Abriram uma CPI.', 'bad'); } } },
      { t: 'Pedir desculpas em rede nacional', fx: s => { karma(3); s.seguidores = Math.round(s.seguidores * .85); line('Você pediu desculpas em rede nacional.'); } },
      { t: 'Renunciar', fx: s => { s.ultimoTrabalho = s.emprego.titulo; s.emprego = null; line('Você renunciou ao mandato.', 'bad'); } }
    ] },
  { id: 'vilao', cat: 'fama', min: 16, max: 90, gap: 3, cond: s => s.emprego && s.emprego.id === 'ator',
    texto: () => 'A emissora te ofereceu o papel de vilão na novela das nove.',
    escolhas: [
      { t: 'Aceitar o papel', fx: s => { s.emprego.desemp = clamp(s.emprego.desemp + 12); s.seguidores = Math.round(s.seguidores * 1.3) + 10000; if (s.emprego.nivel >= 3) setFlag('estrela'); line('Seu vilão virou meme e o Brasil inteiro te odeia (no bom sentido).', 'good'); } },
      { t: 'Recusar', fx: () => line('Você recusou o papel de vilão.') }
    ] },
  { id: 'protagonista', cat: 'fama', min: 16, max: 90, once: true, cond: s => s.emprego && s.emprego.id === 'ator' && s.emprego.nivel >= 3,
    fx: () => { setFlag('estrela'); marco('Horário nobre', 'Você é protagonista da novela das nove. Seu rosto está em todas as revistas.'); } },
  { id: 'vizinhaFofoca', cat: 'vida', min: 14, max: 95, gap: 7,
    fx: () => { mod('felicidade', -2); line('A vizinha fofoqueira espalhou pelo prédio que você está devendo o condomínio.'); } }
];
