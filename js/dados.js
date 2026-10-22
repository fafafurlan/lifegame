// Ano a Ano · dados fixos do jogo (nomes, lugares, carreiras, lojas).
// Valores em dinheiro ficam sempre em reais; a moeda do país só muda na tela.

const NM = ['Miguel','Arthur','Gael','Heitor','Theo','Davi','Gabriel','Bernardo','Samuel','João','Pedro','Lucas','Rafael','Enzo','Matheus','Caio','Bruno','Felipe','Thiago','Vinícius','Otávio','Benício','Lorenzo','Igor','Cauã','Kauê','Wesley','Diego','Anderson','Rodrigo','Marcos','Antônio','José','Francisco','Paulo'];
const NF = ['Helena','Alice','Laura','Maria','Valentina','Heloísa','Cecília','Júlia','Sofia','Manuela','Lívia','Beatriz','Ana','Clara','Lara','Isadora','Mariana','Luiza','Yasmin','Rafaela','Bianca','Gabriela','Antonella','Lorena','Vitória','Larissa','Camila','Fernanda','Patrícia','Juliana','Aline','Francisca','Raimunda','Tereza','Sandra'];
const SOB = ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Rocha','Almeida','Nascimento','Araújo','Barbosa','Cardoso','Moreira','Teixeira','Mendes','Freitas','Cavalcanti','Monteiro','Batista','Dias','Barros','Vieira'];

// Estados: cidades e times de futebol locais
const ESTADOS = {
  SP: { nome: 'São Paulo', cidades: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Guarulhos'], times: ['Corinthians', 'Palmeiras', 'São Paulo', 'Santos'] },
  RJ: { nome: 'Rio de Janeiro', cidades: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Petrópolis'], times: ['Flamengo', 'Fluminense', 'Vasco', 'Botafogo'] },
  MG: { nome: 'Minas Gerais', cidades: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Montes Claros'], times: ['Atlético-MG', 'Cruzeiro', 'América-MG'] },
  RS: { nome: 'Rio Grande do Sul', cidades: ['Porto Alegre', 'Caxias do Sul', 'Pelotas'], times: ['Grêmio', 'Internacional'] },
  PR: { nome: 'Paraná', cidades: ['Curitiba', 'Londrina', 'Maringá', 'Foz do Iguaçu'], times: ['Athletico-PR', 'Coritiba'] },
  SC: { nome: 'Santa Catarina', cidades: ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó'], times: ['Avaí', 'Figueirense', 'Chapecoense'] },
  BA: { nome: 'Bahia', cidades: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Porto Seguro'], times: ['Bahia', 'Vitória'] },
  PE: { nome: 'Pernambuco', cidades: ['Recife', 'Olinda', 'Caruaru', 'Petrolina'], times: ['Sport', 'Náutico', 'Santa Cruz'] },
  CE: { nome: 'Ceará', cidades: ['Fortaleza', 'Juazeiro do Norte', 'Sobral'], times: ['Fortaleza', 'Ceará'] },
  GO: { nome: 'Goiás', cidades: ['Goiânia', 'Anápolis', 'Rio Verde'], times: ['Goiás', 'Vila Nova', 'Atlético-GO'] },
  DF: { nome: 'Distrito Federal', cidades: ['Brasília', 'Taguatinga', 'Ceilândia'], times: ['Gama', 'Brasiliense'] },
  PA: { nome: 'Pará', cidades: ['Belém', 'Santarém', 'Marabá'], times: ['Paysandu', 'Remo'] },
  AM: { nome: 'Amazonas', cidades: ['Manaus', 'Parintins'], times: ['Amazonas', 'Nacional'] },
  MA: { nome: 'Maranhão', cidades: ['São Luís', 'Imperatriz'], times: ['Sampaio Corrêa', 'Moto Club'] },
  ES: { nome: 'Espírito Santo', cidades: ['Vitória', 'Vila Velha', 'Serra'], times: ['Rio Branco-ES', 'Desportiva'] },
  RN: { nome: 'Rio Grande do Norte', cidades: ['Natal', 'Mossoró'], times: ['ABC', 'América-RN'] },
  PB: { nome: 'Paraíba', cidades: ['João Pessoa', 'Campina Grande'], times: ['Botafogo-PB', 'Treze'] },
  AL: { nome: 'Alagoas', cidades: ['Maceió', 'Arapiraca'], times: ['CRB', 'CSA'] },
  SE: { nome: 'Sergipe', cidades: ['Aracaju'], times: ['Sergipe', 'Confiança'] },
  PI: { nome: 'Piauí', cidades: ['Teresina', 'Parnaíba'], times: ['River-PI'] },
  MT: { nome: 'Mato Grosso', cidades: ['Cuiabá', 'Rondonópolis'], times: ['Cuiabá'] },
  MS: { nome: 'Mato Grosso do Sul', cidades: ['Campo Grande', 'Dourados'], times: ['Operário'] },
  TO: { nome: 'Tocantins', cidades: ['Palmas', 'Araguaína'], times: ['Palmas'] },
  RO: { nome: 'Rondônia', cidades: ['Porto Velho', 'Ji-Paraná'], times: ['Porto Velho'] },
  AC: { nome: 'Acre', cidades: ['Rio Branco', 'Cruzeiro do Sul'], times: ['Rio Branco-AC'] },
  AP: { nome: 'Amapá', cidades: ['Macapá'], times: ['Trem'] },
  RR: { nome: 'Roraima', cidades: ['Boa Vista'], times: ['São Raimundo-RR'] }
};
const TIMES_NACIONAIS = ['Flamengo', 'Corinthians', 'Palmeiras', 'São Paulo', 'Vasco'];

const PROFISSOES = [
  ['motorista de ônibus', 'motorista de ônibus'], ['pedreiro', 'diarista'], ['vendedor', 'vendedora'], ['mecânico', 'manicure'],
  ['professor', 'professora'], ['enfermeiro', 'enfermeira'], ['policial', 'policial'], ['cabeleireiro', 'cabeleireira'],
  ['caixa de supermercado', 'caixa de supermercado'], ['auxiliar administrativo', 'auxiliar administrativa'], ['feirante', 'feirante'],
  ['programador', 'programadora'], ['advogado', 'advogada'], ['eletricista', 'cozinheira'], ['motoboy', 'costureira'],
  ['dentista', 'dentista'], ['corretor de imóveis', 'corretora de imóveis'], ['porteiro', 'recepcionista'], ['agricultor', 'agricultora'],
  ['comerciante', 'comerciante'], ['segurança', 'cuidadora de idosos'], ['taxista', 'confeiteira']
];
const SIGNOS = [[20, 'Capricórnio'], [19, 'Aquário'], [20, 'Peixes'], [20, 'Áries'], [20, 'Touro'], [20, 'Gêmeos'], [22, 'Câncer'], [22, 'Leão'], [22, 'Virgem'], [22, 'Libra'], [21, 'Escorpião'], [21, 'Sagitário']];
const SIGNOS_DEPOIS = ['Aquário', 'Peixes', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const DESTINOS = {
  nacional: [['Fernando de Noronha', 9000], ['Gramado', 3500], ['Bonito', 4000], ['Jericoacoara', 3500], ['Porto de Galinhas', 3000], ['Chapada Diamantina', 2500], ['Lençóis Maranhenses', 3500], ['Foz do Iguaçu', 2800]],
  internacional: [['Buenos Aires', 6000], ['Lisboa', 12000], ['Orlando', 18000], ['Paris', 20000], ['Santiago', 7000], ['Cancún', 14000], ['Tóquio', 28000]]
};
const LIVROS = ['Dom Casmurro', 'Capitães da Areia', 'O Pequeno Príncipe', 'Vidas Secas', 'Grande Sertão: Veredas', 'A Hora da Estrela', 'O Alquimista', 'Torto Arado', 'Memórias Póstumas de Brás Cubas', 'O Auto da Compadecida', 'Quarto de Despejo'];
const PETS_NOMES = ['Caramelo', 'Paçoca', 'Pipoca', 'Thor', 'Mel', 'Bolinha', 'Pretinha', 'Fubá', 'Cuscuz', 'Biscoito', 'Brigadeiro', 'Tapioca'];
const RACAS = [
  { id: 'vira', nome: 'Vira-lata caramelo', especie: 'cão', preco: 0, abrigo: true },
  { id: 'gato', nome: 'Gato SRD', especie: 'gato', preco: 0, abrigo: true },
  { id: 'shih', nome: 'Shih-tzu', especie: 'cão', preco: 2500 },
  { id: 'golden', nome: 'Golden retriever', especie: 'cão', preco: 4000 },
  { id: 'pinscher', nome: 'Pinscher', especie: 'cão', preco: 1200 },
  { id: 'persa', nome: 'Gato persa', especie: 'gato', preco: 3000 },
  { id: 'calopsita', nome: 'Calopsita', especie: 'ave', preco: 400 },
  { id: 'coelho', nome: 'Coelho', especie: 'coelho', preco: 300 }
];
const ESCOLAS_PUB = ['E.E. Professora Maria José', 'E.M. Monteiro Lobato', 'Colégio Estadual Tiradentes', 'E.E. Dom Pedro II', 'Escola Municipal Cecília Meireles', 'E.E. Paulo Freire', 'Escola Municipal Anita Garibaldi', 'E.M. Carolina Maria de Jesus'];
const ESCOLAS_PART = ['Colégio Santa Clara', 'Colégio Integrado Horizonte', 'Instituto Educacional Saber', 'Colégio Bom Jesus do Vale', 'Escola Monte Azul'];
// Artes marciais: o nível (0 a 100) vira faixa
const ARTES = [
  { id: 'jiujitsu', nome: 'Jiu-jítsu', ico: '🥋', faixas: ['branca', 'azul', 'roxa', 'marrom', 'preta'] },
  { id: 'capoeira', nome: 'Capoeira', ico: '🤸', faixas: ['crua', 'amarela', 'azul', 'verde', 'vermelha'], corda: true },
  { id: 'judo', nome: 'Judô', ico: '🥋', faixas: ['branca', 'amarela', 'laranja', 'verde', 'preta'] },
  { id: 'karate', nome: 'Caratê', ico: '🥋', faixas: ['branca', 'amarela', 'verde', 'marrom', 'preta'] },
  { id: 'muaythai', nome: 'Muay thai', ico: '🥊', faixas: ['branca', 'amarela', 'verde', 'azul', 'preta'], prajied: true },
  { id: 'taekwondo', nome: 'Taekwondo', ico: '🥋', faixas: ['branca', 'amarela', 'verde', 'vermelha', 'preta'] }
];
const INSTRUMENTOS = [
  { id: 'violao', nome: 'Violão', ico: '🎸' }, { id: 'cavaquinho', nome: 'Cavaquinho', ico: '🎸' }, { id: 'pandeiro', nome: 'Pandeiro', ico: '🥁' },
  { id: 'sanfona', nome: 'Sanfona', ico: '🪗' }, { id: 'berimbau', nome: 'Berimbau', ico: '🎶' }, { id: 'zabumba', nome: 'Zabumba', ico: '🥁' },
  { id: 'bateria', nome: 'Bateria', ico: '🥁' }, { id: 'teclado', nome: 'Teclado', ico: '🎹' }, { id: 'flauta', nome: 'Flauta doce', ico: '🎶' },
  { id: 'sax', nome: 'Saxofone', ico: '🎷' }, { id: 'trompete', nome: 'Trompete', ico: '🎺' }, { id: 'guitarra', nome: 'Guitarra', ico: '🎸' },
  { id: 'baixo', nome: 'Baixo', ico: '🎸' }, { id: 'violino', nome: 'Violino', ico: '🎻' }
];
const CLUBES = [
  { id: 'futebol', nome: 'Time de futsal', st: 'saude' }, { id: 'teatro', nome: 'Grupo de teatro', st: 'felicidade' },
  { id: 'banda', nome: 'Fanfarra da escola', st: 'felicidade' }, { id: 'robotica', nome: 'Clube de robótica', st: 'inteligencia' },
  { id: 'gremio', nome: 'Grêmio estudantil', st: 'popularidade' }, { id: 'xadrez', nome: 'Clube de xadrez', st: 'inteligencia' }
];

const CURSOS = {
  'Medicina': { anos: 6, corte: 820 }, 'Direito': { anos: 5, corte: 720 }, 'Engenharia': { anos: 5, corte: 720 },
  'Computação': { anos: 4, corte: 700 }, 'Enfermagem': { anos: 4, corte: 640 }, 'Administração': { anos: 4, corte: 620 },
  'Pedagogia': { anos: 4, corte: 580 }, 'Artes Cênicas': { anos: 4, corte: 600 }, 'Educação Física': { anos: 4, corte: 600 }
};
const FORM = { nenhuma: 0, fundamental: 1, medio: 2, superior: 3 };
const FORM_NOME = { nenhuma: 'Sem formação', fundamental: 'Ensino fundamental', medio: 'Ensino médio', superior: 'Ensino superior' };
const PAISES = {
  'Brasil': { moeda: 'BRL', taxa: 1, sal: 1, custo: 1 },
  'Portugal': { moeda: 'EUR', taxa: 6.2, sal: 1.7, custo: 1.5 },
  'Estados Unidos': { moeda: 'USD', taxa: 5.6, sal: 3.2, custo: 2.6 },
  'Canadá': { moeda: 'CAD', taxa: 4.1, sal: 2.7, custo: 2.2 },
  'Japão': { moeda: 'JPY', taxa: 0.037, sal: 2.3, custo: 2.0 }
};
const DOENCAS = {
  'Gripe': { grav: 2, custo: 200, cura: .95, rec: .9 },
  'Pressão alta': { grav: 1, custo: 2000, cura: .7, rec: 0 },
  'Diabetes': { grav: 2, custo: 4000, cura: .5, rec: 0 },
  'Depressão': { grav: 1, custo: 3000, cura: .6, fel: 4, rec: .15 },
  'Hérnia de disco': { grav: 1, custo: 15000, cura: .85, rec: .1 },
  'Pneumonia': { grav: 6, custo: 5000, cura: .9, rec: .6 },
  'Dengue': { grav: 4, custo: 800, cura: .95, rec: .8 },
  'Câncer': { grav: 6, custo: 90000, cura: .45, rec: 0 }
};
const IMOVEIS = [
  { id: 'kitnet', nome: 'Kitnet', valor: 180000 }, { id: 'apto', nome: 'Apartamento de 2 quartos', valor: 420000 },
  { id: 'casa', nome: 'Casa com quintal', valor: 750000 }, { id: 'praia', nome: 'Casa de praia', valor: 1200000 },
  { id: 'cobertura', nome: 'Cobertura com piscina', valor: 2500000 }, { id: 'sitio', nome: 'Sítio no interior', valor: 900000 }
];
const VEICULOS = [
  { id: 'bike', nome: 'Bicicleta', valor: 1500, cnh: null }, { id: 'moto', nome: 'Moto 160cc', valor: 18000, cnh: 'moto' },
  { id: 'popular', nome: 'Carro popular', valor: 70000, cnh: 'carro' }, { id: 'suv', nome: 'SUV', valor: 190000, cnh: 'carro' },
  { id: 'pickup', nome: 'Caminhonete', valor: 280000, cnh: 'carro' }, { id: 'esportivo', nome: 'Carro esportivo', valor: 850000, cnh: 'carro' }
];
const LOJA = [
  { id: 'celular', nome: 'Celular top de linha', valor: 8000, fel: 4 }, { id: 'notebook', nome: 'Notebook', valor: 5000, fel: 3, int: 2 },
  { id: 'console', nome: 'Videogame', valor: 4000, fel: 6 }, { id: 'tenis', nome: 'Tênis de marca', valor: 1200, fel: 2, ap: 1 },
  { id: 'relogio', nome: 'Relógio', valor: 2500, fel: 2, ap: 1 }, { id: 'bolsa', nome: 'Bolsa de grife', valor: 12000, fel: 4, ap: 2 },
  { id: 'cordao', nome: 'Cordão de ouro', valor: 9000, fel: 3, ap: 2 }, { id: 'violao', nome: 'Violão', valor: 900, fel: 3, flag: 'violao' },
  { id: 'churrasqueira', nome: 'Churrasqueira', valor: 1800, fel: 4 }, { id: 'tv', nome: 'TV de 75 polegadas', valor: 6000, fel: 4 }
];
const CARREIRAS = [
  { id: 'lanche', m: 'Atendente de lanchonete', f: 'Atendente de lanchonete', sal: 18000, idade: 16, form: 'nenhuma' },
  { id: 'estagio', m: 'Estagiário', f: 'Estagiária', sal: 15000, idade: 18, estudante: true },
  { id: 'caixa', m: 'Operador de caixa', f: 'Operadora de caixa', sal: 24000, idade: 18, form: 'medio' },
  { id: 'app', m: 'Motorista de aplicativo', f: 'Motorista de aplicativo', sal: 34000, idade: 18, form: 'nenhuma', cnh: 'carro', carro: true },
  { id: 'adm', m: 'Auxiliar administrativo', f: 'Auxiliar administrativa', sal: 34000, idade: 18, form: 'medio' },
  { id: 'servidor', m: 'Servidor público', f: 'Servidora pública', sal: 70000, idade: 18, form: 'medio', concurso: true },
  { id: 'militar', m: 'Militar do Exército', f: 'Militar do Exército', sal: 48000, idade: 18, form: 'medio', flag: 'reservista', flagMsg: 'Exige ter servido o Exército' },
  { id: 'musico', m: 'Músico', f: 'Musicista', sal: 26000, idade: 16, form: 'nenhuma', flag: 'violao', flagMsg: 'Exige saber tocar um instrumento' },
  { id: 'fut', m: 'Jogador de futebol', f: 'Jogadora de futebol', sal: 0, idade: 17, idadeMax: 33, form: 'nenhuma', flag: 'base', flagMsg: 'Exige passar na peneira de um time' },
  { id: 'ator', m: 'Ator de novela', f: 'Atriz de novela', sal: 60000, idade: 16, form: 'nenhuma', teste: true },
  { id: 'prof', m: 'Professor', f: 'Professora', sal: 55000, idade: 21, curso: 'Pedagogia' },
  { id: 'personal', m: 'Personal trainer', f: 'Personal trainer', sal: 50000, idade: 21, curso: 'Educação Física' },
  { id: 'enf', m: 'Enfermeiro', f: 'Enfermeira', sal: 65000, idade: 21, curso: 'Enfermagem' },
  { id: 'analista', m: 'Analista de negócios', f: 'Analista de negócios', sal: 75000, idade: 21, curso: 'Administração' },
  { id: 'dev', m: 'Programador', f: 'Programadora', sal: 110000, idade: 21, curso: 'Computação' },
  { id: 'eng', m: 'Engenheiro civil', f: 'Engenheira civil', sal: 120000, idade: 22, curso: 'Engenharia' },
  { id: 'adv', m: 'Advogado', f: 'Advogada', sal: 130000, idade: 22, curso: 'Direito' },
  { id: 'med', m: 'Médico', f: 'Médica', sal: 240000, idade: 24, curso: 'Medicina' }
];
// Bicos: renda pequena, dá para fazer junto com escola ou faculdade
const BICOS = [
  { id: 'entregas', nome: 'Entregador de aplicativo', sal: 9000, idade: 16, veiculo: true },
  { id: 'panfleto', nome: 'Panfletagem no farol', sal: 4000, idade: 14 },
  { id: 'baba', nome: 'Babá de fim de semana', sal: 6000, idade: 15 },
  { id: 'brigadeiro', nome: 'Vender brigadeiro', sal: 5000, idade: 12 },
  { id: 'garcom', nome: 'Garçom de buffet', sal: 7000, idade: 16 }
];
// Política: cada cargo dura 4 anos
const CARGOS = [
  { id: 'vereador', m: 'Vereador', f: 'Vereadora', sal: 180000, idade: 18, base: .35 },
  { id: 'depest', m: 'Deputado estadual', f: 'Deputada estadual', sal: 380000, idade: 21, base: .25, req: 'vereador' },
  { id: 'prefeito', m: 'Prefeito', f: 'Prefeita', sal: 300000, idade: 21, base: .2, req: 'vereador' },
  { id: 'depfed', m: 'Deputado federal', f: 'Deputada federal', sal: 450000, idade: 21, base: .2, req: 'depest' },
  { id: 'governador', m: 'Governador', f: 'Governadora', sal: 420000, idade: 30, base: .15, req: 'prefeito' },
  { id: 'senador', m: 'Senador', f: 'Senadora', sal: 460000, idade: 35, base: .15, req: 'depfed' },
  { id: 'presidente', m: 'Presidente da República', f: 'Presidenta da República', sal: 500000, idade: 35, base: .1, req: 'governador' }
];
const NIVEIS_ATOR = ['Figurante', 'Elenco de apoio', 'Coadjuvante', 'Protagonista', 'Estrela da emissora'];
