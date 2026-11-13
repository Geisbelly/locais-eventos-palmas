(() => {
  'use strict';

  /* ============ Config e utilidades ============ */
  const CFG = Object.assign({ apiUrl: '', repo: '' }, window.LEP_CONFIG || {});
  const API = (CFG.apiUrl || '').replace(/\/+$/, '');
  const LS = { catalogo: 'lep.catalogo.v1', eventos: 'lep.eventos.v1', evPend: 'lep.eventos.pend.v1', visitas: 'lep.visitas.v1', pendentes: 'lep.pendentes.v1', chave: 'lep.chave', ui: 'lep.ui.v1' };
  const MAX_CMP = 4;

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const digitos = (s) => String(s ?? '').replace(/\D/g, '');
  const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: n % 1 ? 2 : 0 });
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* modo privado */ } };
  const dataBR = (iso) => { if (!iso) return ''; const [a, m, d] = iso.slice(0, 10).split('-'); return `${d}/${m}/${a}`; };

  const I = {
    chacara: '<path d="M12 22v-5"/><path d="M12 3l6 7h-3l4 6H5l4-6H6z"/>',
    salao: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    piscina: '<circle cx="17" cy="6" r="2.5"/><path d="M2 14c2 0 2-1.5 4-1.5S8 14 10 14s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M2 19c2 0 2-1.5 4-1.5S8 19 10 19s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/>',
    restaurante: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8M7 7h4"/><path d="M17 21V3c-2 1-3 4-3 7s1 4 3 4"/>',
    espaco: '<path d="M3 20 12 4l9 16z"/><path d="M9 20l3-6 3 6"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    zap: '<path d="M21 12a9 9 0 0 1-13.4 7.9L3 21l1.2-4.4A9 9 0 1 1 21 12z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1-1.2 2 .8c-.2 1.2-1.2 1.9-2.4 1.7C11 14.8 9.2 13 8.6 9.9 8.4 8.7 9.1 7.7 10.3 7.5l.8 2z"/>',
    insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
    fone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    site: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    mapa: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    alvo: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
    rota: '<path d="M3 11l18-8-8 18-2-8z"/>',
    nuvem: '<path d="M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z"/>',
    coracao: '<path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    alerta: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.5"/>',
    nada: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    quero: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    visitado: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    descartado: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    voltar: '<path d="M15 18l-6-6 6-6"/>',
    editar: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4 10-10"/>',
    lixo: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    buffet: '<path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 8V6M10 6h4"/><path d="M4 20h16"/>',
    brinquedos: '<path d="M12 3a5 6 0 0 1 5 6c0 3.5-2.5 6-5 6s-5-2.5-5-6a5 6 0 0 1 5-6z"/><path d="M12 15l-1 2h2l-1-2M12 17c0 2-2 2-2 4"/>',
    servicos: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',
    alugueis: '<path d="M3 10 12 4l9 6"/><path d="M5 10v10M19 10v10M3 20h18"/><path d="M5 10c1.2 1.5 3.3 1.5 4.7 0 1.4 1.5 3.3 1.5 4.6 0 1.4 1.5 3.5 1.5 4.7 0"/>',
    eventos: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="m9 15 2 2 4-4"/>',
    estrela: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    imprimir: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-2.5-5.1"/>',
    clima: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/>',
    fogo: '<path d="M12 22c4 0 7-2.7 7-6.5 0-4-3-6-4-9.5-1.5 2-2 3.5-2 5-1.5-1-2.5-3-2.5-5C7 8 5 11.5 5 15.5 5 19.3 8 22 12 22z"/>',
    carro: '<path d="M5 17h14M5 17v2M19 17v2M4 13l2-6h12l2 6v4H4z"/><circle cx="8" cy="14.5" r=".8"/><circle cx="16" cy="14.5" r=".8"/>',
    comparar: '<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/>',
    catalogo: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    seguir: '<path d="M9 6l6 6-6 6"/>',
  };
  const ic = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;

  const STATUS = {
    '': { rotulo: 'Não visitado', icone: 'nada' },
    quero: { rotulo: 'Quero visitar', icone: 'quero', cls: 'st-quero' },
    visitado: { rotulo: 'Visitado', icone: 'visitado', cls: 'st-visitado' },
    descartado: { rotulo: 'Descartado', icone: 'descartado', cls: 'st-descartado' },
  };
  const CRITERIOS = [
    ['preco', 'Custo-benefício'], ['estrutura', 'Estrutura'], ['localizacao', 'Localização e acesso'],
    ['atendimento', 'Atendimento'], ['ambiente', 'Ambiente / beleza'],
  ];
  // O que pode vir no aluguel. 'num' = aceita quantidade.
  const ITENS = [
    ['piscina', 'Piscina'], ['climatizado', 'Climatizado'], ['churrasqueira', 'Churrasqueira'],
    ['cozinha', 'Cozinha'], ['fogao', 'Fogão'], ['freezer', 'Freezer / cervejeira'], ['geladeira', 'Geladeira'],
    ['bebedouro', 'Bebedouro'], ['mesas', 'Mesas', 'num'], ['cadeiras', 'Cadeiras', 'num'], ['toalhas', 'Toalhas de mesa'],
    ['som', 'Som'], ['palco', 'Palco'], ['iluminacao', 'Iluminação de festa'], ['brinquedos', 'Espaço kids / brinquedos'],
    ['jogos', 'Sinuca / jogos'], ['area_coberta', 'Área coberta'], ['gramado', 'Gramado / jardim'], ['lago', 'Beira do lago'],
    ['estacionamento', 'Estacionamento'], ['banheiros', 'Banheiros'], ['acessivel', 'Acessível (PCD)'], ['wifi', 'Wi-Fi'],
    ['limpeza', 'Limpeza inclusa'], ['gas', 'Gás incluso'], ['hospedagem', 'Quarto / hospedagem'], ['seguranca', 'Câmeras / segurança'],
  ];
  const temItem = (l, k) => !!(l.itens && l.itens[k]);
  function rotItem(l, k) { const it = (CATS[l.cat] || { inclusos: ITENS }).inclusos.find((x) => x[0] === k); return it ? it[1] : k; }
  function itemTexto(l, k) {
    const v = l.itens && l.itens[k];
    return typeof v === 'number' ? `${v} ${rotItem(l, k).toLowerCase()}` : rotItem(l, k);
  }
  const itensDo = (l) => (CATS[l.cat] || { inclusos: ITENS }).inclusos.filter(([k]) => temItem(l, k)).map(([k]) => k);

  // Categorias do catálogo. Campos vieram da pesquisa em docs/pesquisa-atributos.md.
  const CRIT_F = [
    ['preco', 'Custo-benefício'], ['qualidade', 'Qualidade / portfólio'], ['atendimento', 'Atendimento'],
    ['confianca', 'Confiança / referências'], ['flexibilidade', 'Flexibilidade'],
  ];
  const ENERGIA = ['Não precisa', '110V', '220V', '110V ou 220V'];
  const CATS = {
    espacos: {
      rot: 'Espaços', curto: 'Espaços', icone: 'salao', um: 'local', varios: 'locais', criterios: CRITERIOS, inclusos: ITENS,
      unidades: ['diária', 'evento', 'locação', '4h de uso', '5h de uso', '8h de uso', '12h de uso'],
    },
    buffet: {
      rot: 'Buffet e comida', curto: 'Buffet', icone: 'buffet', um: 'fornecedor', varios: 'fornecedores', criterios: CRIT_F,
      exemplo: 'Buffet Sabor da Casa',
      subtipos: ['Buffet completo', 'Churrasco', 'Coquetel / finger food', 'Jantar servido', 'Salgados', 'Doces', 'Bolo', 'Kit festa', 'Bebidas / bar', 'Chopp'],
      unidades: ['por pessoa', 'por cento', 'por kg', 'pacote', 'por evento'],
      inclusos: [['garcons', 'Garçons', 'num'], ['copeira', 'Copeira / cozinheira'], ['louca', 'Louça e talheres'], ['toalhas', 'Toalhas e mesa posta'],
        ['bebidas', 'Refrigerante e suco'], ['cerveja', 'Cerveja / chopp'], ['gelo', 'Gelo e copos'], ['montagem', 'Montagem e desmontagem'],
        ['deslocamento', 'Deslocamento'], ['degustacao', 'Degustação'], ['sobremesa', 'Sobremesa'], ['bolo', 'Bolo'],
        ['decoracao_mesa', 'Decoração das mesas'], ['dieta', 'Opção vegetariana / sem glúten']],
      rapidos: ['garcons', 'bebidas', 'louca', 'degustacao'],
      campos: [['convidados_min', 'Mínimo de convidados', 'num'], ['convidados_max', 'Máximo de convidados', 'num'],
        ['duracao', 'Duração do serviço', 'txt', 'ex.: 4 horas'], ['criancas', 'Regra para crianças', 'txt', 'ex.: até 5 anos não paga, 6 a 10 meia'],
        ['excedente', 'Convidados a mais', 'txt', 'ex.: absorve 5%, depois R$ 80 cada'], ['prazo', 'Fechar com quanto tempo', 'txt', 'ex.: 30 dias antes'],
        ['reajuste', 'Reajuste até a data', 'txt', 'ex.: preço travado no contrato'], ['cardapio', 'Cardápio', 'area', 'Entradas, pratos, sobremesas, bebidas…']],
    },
    brinquedos: {
      rot: 'Brinquedos e recreação', curto: 'Brinquedos', icone: 'brinquedos', um: 'fornecedor', varios: 'fornecedores', criterios: CRIT_F,
      exemplo: 'Pula Pula Kids',
      porObjeto: { rot: 'Brinquedos', um: 'brinquedo', varios: 'brinquedos', tipoRot: 'Tipo de brinquedo', ex: 'ex.: Pula-pula 3 x 3 m' },
      subtipos: ['Pula-pula / cama elástica', 'Inflável / tobogã', 'Piscina de bolinhas', 'Escorregador / gangorra', 'Área baby', 'Touro mecânico', 'Futebol de sabão',
        'Games / fliperama', 'Recreação com monitores', 'Personagens', 'Pintura facial / oficinas', 'Mágico / palhaço'],
      unidades: ['por evento', 'por hora', 'pacote', 'diária'],
      inclusos: [['monitor', 'Monitor', 'num'], ['entrega', 'Entrega e retirada'], ['montagem', 'Montagem'], ['higienizacao', 'Higienização'],
        ['lona', 'Lona / proteção de chão'], ['seguro', 'Seguro'], ['gerador', 'Gerador'], ['extensao', 'Extensão elétrica']],
      rapidos: ['monitor', 'entrega', 'montagem', 'higienizacao'],
      campos: [['idade', 'Faixa de idade', 'txt', 'ex.: 3 a 10 anos'], ['simultaneas', 'Crianças ao mesmo tempo', 'num'],
        ['tamanho', 'Tamanho do brinquedo', 'txt', 'ex.: 4 x 4 m, 3 m de altura'], ['espaco', 'Espaço necessário', 'txt', 'ex.: 5 x 5 m, chão plano'],
        ['energia', 'Energia', 'sel', ENERGIA], ['duracao', 'Tempo de uso', 'txt', 'ex.: 4 horas, 24 horas, a combinar'],
        ['hora_extra', 'Hora extra', 'txt', 'ex.: R$ 50 por hora'], ['chuva', 'Se chover ou ventar', 'txt', 'ex.: remarca sem custo'],
        ['normas', 'Normas / certificação', 'txt', 'ex.: NBR 15859']],
    },
    servicos: {
      rot: 'Serviços', curto: 'Serviços', icone: 'servicos', um: 'fornecedor', varios: 'fornecedores', criterios: CRIT_F,
      exemplo: 'Ana Lima Fotografia',
      subtipos: ['Fotografia', 'Filmagem', 'DJ / som', 'Banda / música ao vivo', 'Decoração', 'Cerimonial / assessoria', 'Garçons / copeiras',
        'Bartender', 'Segurança', 'Limpeza', 'Maquiagem e cabelo', 'Convites e papelaria', 'Lembrancinhas', 'Iluminação', 'Animação / MC'],
      unidades: ['por evento', 'por hora', 'pacote', 'por pessoa', 'por profissional'],
      inclusos: [['equipamento', 'Equipamento próprio'], ['equipe', 'Equipe de apoio', 'num'], ['deslocamento', 'Deslocamento'],
        ['montagem', 'Montagem e desmontagem'], ['edicao', 'Edição / tratamento'], ['album', 'Álbum impresso'], ['video', 'Vídeo'],
        ['making_of', 'Making of / preparação'], ['drone', 'Drone'], ['online', 'Entrega online'], ['reuniao', 'Reunião de alinhamento']],
      rapidos: ['equipamento', 'deslocamento', 'edicao'],
      campos: [['horas', 'Horas de cobertura', 'txt', 'ex.: 5 horas a partir da chegada'], ['entrega', 'Prazo de entrega', 'txt', 'ex.: fotos em 30 dias'],
        ['hora_extra', 'Hora extra', 'txt', 'ex.: R$ 200 por hora'], ['necessidades', 'Precisa no local', 'txt', 'ex.: tomada 220V, alimentação da equipe'],
        ['entregaveis', 'O que é entregue', 'area', 'ex.: 300 fotos tratadas, vídeo de 3 minutos'], ['portfolio', 'Link do portfólio', 'url']],
    },
    alugueis: {
      rot: 'Aluguéis e barraquinhas', curto: 'Aluguéis', icone: 'alugueis', um: 'fornecedor', varios: 'fornecedores', criterios: CRIT_F,
      exemplo: 'Pipoca da Festa',
      porObjeto: { rot: 'Itens para alugar', um: 'item', varios: 'itens', tipoRot: 'Tipo de item', ex: 'ex.: Carrinho de pipoca' },
      subtipos: ['Carrinho de pipoca', 'Algodão-doce', 'Crepe', 'Churros', 'Hot dog', 'Sorvete / açaí', 'Food truck', 'Barraquinhas temáticas',
        'Mesas e cadeiras', 'Louças e talheres', 'Toalhas e tecidos', 'Tendas', 'Som e iluminação', 'Gerador', 'Freezer / chopeira', 'Pegue e monte (decoração)'],
      unidades: ['por hora', 'por evento', 'diária', 'por unidade', 'por porção', 'pacote'],
      inclusos: [['atendente', 'Atendente / operador', 'num'], ['insumos', 'Insumos inclusos'], ['porcoes_livres', 'Porções à vontade'],
        ['embalagens', 'Embalagens / guardanapos'], ['frete', 'Frete (entrega e retirada)'], ['montagem', 'Montagem e desmontagem'],
        ['energia_propria', 'Gás ou energia próprios'], ['limpeza', 'Limpeza'], ['personalizacao', 'Personalização com o tema']],
      rapidos: ['atendente', 'insumos', 'frete', 'porcoes_livres'],
      campos: [['duracao', 'Duração mínima', 'txt', 'ex.: 3 horas'], ['hora_extra', 'Hora extra', 'txt', 'ex.: R$ 120 por hora'],
        ['porcoes', 'Porções ou unidades', 'txt', 'ex.: 300 porções ou à vontade'], ['producao', 'Produção por hora', 'txt', 'ex.: 80 pipocas por hora'],
        ['energia', 'Energia', 'sel', [...ENERGIA, 'Gás']], ['espaco', 'Espaço necessário', 'txt', 'ex.: 2 x 2 m perto de tomada'],
        ['quantidade', 'Quantidade disponível', 'txt', 'ex.: 200 cadeiras'], ['caucao', 'Caução', 'txt'],
        ['avaria', 'Quebra ou avaria', 'txt', 'ex.: cobra o valor da peça']],
    },
  };
  const ORDEM_CATS = ['espacos', 'buffet', 'brinquedos', 'servicos', 'alugueis'];
  const SECOES = [...ORDEM_CATS.map((k) => [k, CATS[k].curto, CATS[k].icone]), ['eventos', 'Meus eventos', 'eventos']];
  const catDe = (l) => CATS[l.cat] || CATS.espacos;
  const ehEspaco = (l) => !l.cat || l.cat === 'espacos';
  const tiposDe = (l) => (ehEspaco(l) ? [l.tipo].filter(Boolean)
    : [...new Set([...(l.subtipos || []), ...(l.objetos || []).map((o) => o.tipo).filter(Boolean)])]);
  const objetosDe = (l) => (l.objetos || []).filter((o) => o && (o.nome || o.tipo));
  // Tempo de uso (brinquedos e aluguéis): o da empresa fica em detalhes.duracao; cada item pode ter o seu.
  const CATS_TEMPO = ['brinquedos', 'alugueis'];
  const mostraTempo = (l) => CATS_TEMPO.includes(l.cat);
  const tempoDe = (l) => String((l.detalhes || {}).duracao || '').trim();
  const tempoObj = (l, o) => String(o.duracao || '').trim() || (objetosDe(l).some((x) => x.duracao) ? '' : tempoDe(l));
  const tempoHtml = (t, cls = '') => `<p class="tempo-uso ${t ? '' : 'sem'} ${cls}">${ic('relogio')}<span>Tempo de uso</span><strong>${esc(t || 'não informado')}</strong></p>`;
  const porObj = (sec = S.secao) => !!(CATS[sec] && CATS[sec].porObjeto);
  // Preços da empresa somados aos de cada objeto, para achar o menor valor.
  const precosDe = (l) => [...(l.precos || []), ...objetosDe(l).filter((o) => o.valor != null)
    .map((o) => ({ valor: o.valor, unidade: o.unidade, condicao: o.nome || o.tipo }))];
  const ehFornSec = () => S.secao !== 'espacos' && S.secao !== 'eventos';
  function stRot(k, l) {
    const forn = l ? !ehEspaco(l) : ehFornSec();
    if (forn && k === 'quero') return 'Quero orçar';
    if (forn && k === 'visitado') return 'Já conversei';
    return STATUS[k].rotulo;
  }

  const RAPIDOS = [
    ['com-preco', 'Com valor', (l) => menorPreco(l) != null],
    ['piscina', 'Piscina', (l) => temItem(l, 'piscina')],
    ['climatizado', 'Climatizado', (l) => temItem(l, 'climatizado')],
    ['brinquedos', 'Espaço kids', (l) => temItem(l, 'brinquedos')],
    ['churrasqueira', 'Churrasqueira', (l) => temItem(l, 'churrasqueira')],
    ['limpeza', 'Limpeza inclusa', (l) => temItem(l, 'limpeza')],
    ['lago', 'Beira do lago', (l) => temItem(l, 'lago')],
    ['zap', 'Tem WhatsApp', (l) => !!l.whatsapp],
  ];
  const ABAS = [
    ['todos', 'Todos'], ['favoritos', 'Favoritos'], ['quero', 'Quero visitar'], ['visitado', 'Visitados'], ['descartado', 'Descartados'],
  ];
  const rotAba = (k, r) => (ehFornSec() ? { quero: 'Quero orçar', visitado: 'Já conversei' }[k] || r : r);
  function rapidosDe(sec) {
    if (sec === 'espacos' || !CATS[sec]) return RAPIDOS;
    const c = CATS[sec];
    return [['com-preco', 'Com valor', (l) => menorPreco(l) != null],
      ...c.rapidos.map((k) => [k, c.inclusos.find((x) => x[0] === k)[1], (l) => temItem(l, k)]),
      ['zap', 'Tem WhatsApp', (l) => !!l.whatsapp]];
  }

  const urlSegura = (u) => (/^https?:\/\//i.test(u || '') || /^fotos\/[\w./-]+$/.test(u || '') ? u : null);
  function menorPreco(l) {
    const vs = precosDe(l).map((p) => p.valor).filter((v) => typeof v === 'number');
    return vs.length ? Math.min(...vs) : null;
  }
  function artePorTipo(tipo) {
    const t = norm(tipo);
    if (t.includes('chacara')) return 'chacara';
    if (t.includes('piscina')) return 'piscina';
    if (t.includes('restaurante')) return 'restaurante';
    if (t.includes('salao')) return 'salao';
    return 'espaco';
  }
  function iniciais(nome) {
    return nome.replace(/\(.*?\)/g, '').split(/\s+/).filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }
  function completude(l) {
    return (menorPreco(l) != null ? 4 : 0) + (l.whatsapp ? 2 : 0) + (l.instagram ? 1 : 0) + (l.endereco ? 1 : 0)
      + (l.capacidade ? 1 : 0) + (itensDo(l).length >= 3 ? 2 : 0) + (l.site ? 1 : 0) + ((l.fotos || []).length ? 2 : 0)
      + (/^Informado/.test(l.status || '') ? 3 : 0);
  }
  function zapLink(numero, nome, oque) {
    let d = digitos(numero);
    if (!d) return null;
    if (!d.startsWith('55')) d = '55' + d;
    const msg = oque ? `Olá! Vi o ${oque} de ${nome} pesquisando para um evento em Palmas. Pode me passar o valor, o que está incluso e as datas disponíveis?`
      : `Olá! Encontrei ${nome} pesquisando para um evento em Palmas. Pode me passar valores, condições e datas disponíveis?`;
    return `https://wa.me/${d}?text=${encodeURIComponent(msg)}`;
  }
  const instaUrl = (h) => (h ? (/^https?:/.test(h) ? h : `https://instagram.com/${h.replace(/^@/, '')}`) : null);
  const instaArroba = (h) => '@' + String(h).replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/[/?#].*$/, '').replace(/^@/, '');
  function mapaUrl(l) {
    if (l.mapa && urlSegura(l.mapa)) return l.mapa;
    if (l.coordenadas) return `https://www.google.com/maps/search/?api=1&query=${l.coordenadas.lat},${l.coordenadas.lng}`;
    const q = [l.nome, l.endereco, 'Palmas - TO'].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }
  function rotaUrl(l) {
    const c = l.coordenadas;
    const dest = c ? `${c.lat},${c.lng}` : [l.nome, l.endereco, 'Palmas - TO'].filter(Boolean).join(', ');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
  }

  /* ============ Localização do usuário e distância ============ */
  // A posição fica só na memória desta aba: serve para calcular a distância e nunca é salva nem enviada.
  const GEO = { pos: null, estado: 'nada' }; // nada | pedindo | ok | negado | erro
  function distKm(l) {
    const c = l && l.coordenadas;
    if (!GEO.pos || !c || !isFinite(c.lat) || !isFinite(c.lng)) return null;
    const r = (x) => (x * Math.PI) / 180;
    const dLat = r(c.lat - GEO.pos.lat), dLng = r(c.lng - GEO.pos.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(GEO.pos.lat)) * Math.cos(r(c.lat)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  }
  function distTxt(km) {
    if (km == null) return '';
    if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
    return `${km.toLocaleString('pt-BR', { maximumFractionDigits: km < 10 ? 1 : 0 })} km`;
  }
  function pedirLocal({ avisar = true } = {}) {
    if (!navigator.geolocation) { if (avisar) toast('Este navegador não informa a localização.'); return; }
    if (GEO.estado === 'pedindo') return;
    GEO.estado = 'pedindo'; aoMudarLocal();
    navigator.geolocation.getCurrentPosition((p) => {
      GEO.pos = { lat: p.coords.latitude, lng: p.coords.longitude }; GEO.estado = 'ok';
      aoMudarLocal();
    }, (e) => {
      GEO.estado = e && e.code === 1 ? 'negado' : 'erro';
      if (avisar) toast(GEO.estado === 'negado' ? 'A localização está bloqueada para este site. Libere nas permissões do navegador para ver as distâncias.' : 'Não consegui pegar sua localização agora. Tente de novo.');
      aoMudarLocal();
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
  }
  function aoMudarLocal() {
    const b = $('#btn-perto');
    if (b) { b.setAttribute('aria-pressed', String(GEO.estado === 'ok')); b.classList.toggle('carregando', GEO.estado === 'pedindo'); }
    if (typeof renderLista === 'function' && $('#lista')) renderLista();
    const d = $('#det-local');
    if (d && S.detalheId && S.porId[S.detalheId]) d.outerHTML = localHtml(S.porId[S.detalheId]);
  }
  function localHtml(l) {
    const c = l.coordenadas && isFinite(l.coordenadas.lat) && isFinite(l.coordenadas.lng) ? l.coordenadas : null;
    if (!c && !l.endereco && !ehEspaco(l)) return '<div id="det-local" hidden></div>';
    const end = l.endereco || (ehEspaco(l) ? l.bairro : '') || '';
    let mapa;
    if (c) {
      const dd = 0.006;
      const bbox = [c.lng - dd, c.lat - dd * 0.7, c.lng + dd, c.lat + dd * 0.7].map((n) => n.toFixed(6)).join(',');
      mapa = `<iframe class="det-mapa" title="Mapa com a localização de ${esc(l.nome)}" loading="lazy" referrerpolicy="no-referrer"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&amp;layer=mapnik&amp;marker=${c.lat},${c.lng}"></iframe>`;
    } else {
      mapa = `<div class="det-mapa sem">${ic('mapa')}<p>Este espaço ainda não tem um ponto no mapa${end ? '' : ' nem endereço'}. Procure pelo nome no Google Maps ou pergunte o endereço pelo contato.</p></div>`;
    }
    const km = distKm(l);
    let dist;
    if (!c) dist = '';
    else if (km != null) {
      dist = `<div class="dist-linha"><span class="dist-ic">${ic('alvo')}</span><div><p class="dist-n">${distTxt(km)} de você</p>
        <p class="dist-c">em linha reta, pela sua localização agora${c.aprox ? ' · ponto aproximado (só a quadra)' : ''}</p></div></div>`;
    } else if (GEO.estado === 'negado') {
      dist = `<p class="dist-aviso">A localização está bloqueada para este site. Libere nas permissões do navegador para ver a que distância ele fica de você.</p>`;
    } else {
      dist = `<div class="dist-pedir"><p>Veja a que distância este espaço fica de você. A localização só é usada neste aparelho para fazer a conta e não é salva.</p>
        <button type="button" class="btn" data-acao="usar-local" ${GEO.estado === 'pedindo' ? 'disabled' : ''}>${ic('alvo')}${GEO.estado === 'pedindo' ? 'Pegando sua localização…' : 'Usar minha localização'}</button></div>`;
    }
    return `<section class="det-local" id="det-local" aria-labelledby="t-det-local">
      <h3 id="t-det-local">Localização</h3>
      ${end ? `<p class="det-end">${ic('pin')}<span>${esc(end)}</span></p>` : ''}
      <div class="det-local-caixa">
        ${mapa}
        <div class="det-local-pe">
          ${dist}
          <div class="det-local-acoes">
            <a class="btn primario" href="${esc(rotaUrl(l))}" target="_blank" rel="noopener">${ic('rota')}Como chegar</a>
            <a class="btn" href="${esc(mapaUrl(l))}" target="_blank" rel="noopener">${ic('mapa')}Abrir no Maps</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ============ Estado ============ */
  const S = {
    locais: [], porId: {}, dataDados: '', base: [], fbase: [], remotos: [],
    secao: 'espacos', paginaEv: null,
    eventos: lsGet(LS.eventos, {}), evPend: new Set(lsGet(LS.evPend, [])),
    visitas: lsGet(LS.visitas, {}),
    pendentes: new Set(lsGet(LS.pendentes, [])),
    chave: lsGet(LS.chave, ''),
    aba: 'todos',
    f: { busca: '', tipo: '', evento: '', cap: '', preco: '', ordem: 'relevancia', rapidos: new Set() },
    cmp: new Set(),
    detalheId: null, detalheAba: 'sobre',
    sync: 'local', // local | sem-chave | pendente | ok | erro
    pag: 1, porPag: 12, sig: '', ultCat: 'espacos', abaDepois: null, visao: {},
  };
  const ui = lsGet(LS.ui, {});
  if (ui.ordem) S.f.ordem = ui.ordem;
  if ([12, 24, 48].includes(ui.porPag)) S.porPag = ui.porPag;
  if (ui.visao && typeof ui.visao === 'object') S.visao = ui.visao;
  const verObjetos = () => porObj() && S.visao[S.secao] === 'objeto';

  const vazia = () => ({ status: '', favorito: false, data: '', nota: 0, criterios: {}, pros: [], contras: [], anotacoes: '', orcamento_valor: '', orcamento_condicao: '', album: '', atualizado_em: '' });
  const visita = (id) => Object.assign(vazia(), S.visitas[id] || {});

  /* ============ Persistência e sincronização ============ */
  let timerSync = null;
  // Sem a opção de guardar só no aparelho: para gravar é preciso entrar com a chave (tudo vai para a nuvem).
  let avisouChave = 0;
  function precisaChave() {
    if (!API || S.chave) return false;
    if (Date.now() - avisouChave > 1500) {
      avisouChave = Date.now();
      toast('Entre com a chave de edição para salvar na nuvem.');
      if (!$('#config').open) abrirConfig();
    }
    return true;
  }
  function salvarVisita(id, patch, { render = true } = {}) {
    if (precisaChave()) return false;
    S.visitas[id] = Object.assign(visita(id), patch, { atualizado_em: new Date().toISOString() });
    lsSet(LS.visitas, S.visitas);
    if (API) { S.pendentes.add(id); lsSet(LS.pendentes, [...S.pendentes]); }
    clearTimeout(timerSync);
    timerSync = setTimeout(sincronizar, 800);
    atualizarSync();
    if (render) { if (S.paginaEv || S.secao === 'eventos') renderTudo(); else { renderAbas(); renderLista(); renderNumeros(); renderNav(); } }
  }

  function atualizarSync(estado) {
    if (estado) S.sync = estado;
    else if (!API) S.sync = 'local';
    else if (!S.chave) S.sync = 'sem-chave';
    else if (S.pendentes.size) S.sync = 'pendente';
    const mapa = { local: '', 'sem-chave': 'pendente', pendente: 'pendente', ok: 'ok', erro: 'erro' };
    document.querySelectorAll('.ponto-sync').forEach((p) => { p.dataset.estado = mapa[S.sync]; });
    const t = $('#txt-sync');
    if (t) t.textContent = textoSync();
    const c = $('#sync-curto');
    if (c) { c.textContent = SYNC_CURTO[S.sync] || ''; c.parentElement.title = textoSync() + ' Toque para sincronização e backup.'; }
  }
  function textoSync() {
    return {
      local: 'Nuvem não configurada neste site.',
      'sem-chave': 'Entre com a chave de edição para salvar. Tudo fica na nuvem, em qualquer aparelho.',
      pendente: 'Salvando na nuvem…',
      ok: 'Tudo salvo na nuvem',
      erro: 'Sem conexão com a nuvem agora. Tento de novo sozinho assim que voltar.',
    }[S.sync];
  }

  async function carregarRemoto() {
    if (!API) return;
    try {
      const r = await fetch(`${API}/visitas`, { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const linhas = await r.json();
      for (const { local_id: id, dados, atualizado_em: em } of linhas) {
        const loc = S.visitas[id];
        if (!loc || (loc.atualizado_em || '') < em) { S.visitas[id] = Object.assign(vazia(), dados, { atualizado_em: em }); S.pendentes.delete(id); }
      }
      lsSet(LS.visitas, S.visitas);
      lsSet(LS.pendentes, [...S.pendentes]);
      atualizarSync(S.chave && !S.pendentes.size ? 'ok' : undefined);
      if (S.pendentes.size) sincronizar();
    } catch {
      atualizarSync('erro');
    }
  }

  async function sincronizar() {
    if (!API || !S.chave || !S.pendentes.size) { atualizarSync(); return; }
    atualizarSync('pendente');
    let falhou = false;
    for (const id of [...S.pendentes]) {
      try {
        const r = await fetch(`${API}/visitas/${encodeURIComponent(id)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Chave': S.chave }, body: JSON.stringify(S.visitas[id]),
        });
        if (r.status === 401) { toast('Chave de edição recusada. Confira em Sincronização.'); falhou = true; break; }
        if (!r.ok) throw new Error(r.status);
        S.pendentes.delete(id);
      } catch { falhou = true; }
    }
    lsSet(LS.pendentes, [...S.pendentes]);
    atualizarSync(falhou ? 'erro' : 'ok');
  }
  window.addEventListener('online', sincronizar);

  /* ============ Filtragem ============ */
  function passaAba(l) {
    const v = visita(l.id);
    if (S.aba === 'favoritos') return v.favorito;
    if (S.aba === 'todos') return true;
    return v.status === S.aba;
  }
  const daSecao = () => S.locais.filter((l) => (l.cat || 'espacos') === S.secao);
  function filtrados() {
    const q = norm(S.f.busca.trim()).split(/\s+/).filter(Boolean);
    const cap = Number(S.f.cap) || 0;
    const teto = Number(S.f.preco) || 0;
    const rapidos = rapidosDe(S.secao).filter(([k]) => S.f.rapidos.has(k));
    const r = daSecao().filter((l) => {
      if (!passaAba(l)) return false;
      if (S.f.tipo && !tiposDe(l).includes(S.f.tipo)) return false;
      if (S.f.evento && !(l.eventos || []).includes(S.f.evento)) return false;
      if (cap && (l.capacidade || 0) < cap) return false;
      const mp = menorPreco(l);
      if (teto && (mp == null || mp > teto)) return false;
      if (!rapidos.every(([, , fn]) => fn(l))) return false;
      if (q.length) {
        const v = visita(l.id);
        const txt = l._busca + ' ' + norm([v.anotacoes, ...v.pros, ...v.contras].join(' '));
        if (!q.every((t) => txt.includes(t))) return false;
      }
      return true;
    });
    const o = S.f.ordem;
    const ordemStatus = (l) => (visita(l.id).status === 'descartado' ? 1 : 0);
    r.sort((a, b) => {
      const d = ordemStatus(a) - ordemStatus(b);
      if (d) return d;
      if (o === 'preco') return (menorPreco(a) ?? Infinity) - (menorPreco(b) ?? Infinity) || a.nome.localeCompare(b.nome, 'pt-BR');
      if (o === 'cap') return (b.capacidade || 0) - (a.capacidade || 0) || a.nome.localeCompare(b.nome, 'pt-BR');
      if (o === 'nota') return (visita(b.id).nota || 0) - (visita(a.id).nota || 0) || completude(b) - completude(a);
      if (o === 'nome') return a.nome.localeCompare(b.nome, 'pt-BR');
      if (o === 'perto') return (distKm(a) ?? Infinity) - (distKm(b) ?? Infinity) || completude(b) - completude(a);
      return completude(b) - completude(a) || a.nome.localeCompare(b.nome, 'pt-BR');
    });
    return r;
  }

  /* ============ Render: topo ============ */
  const TITULOS = { espacos: 'Espaços para eventos' };
  const SYNC_CURTO = { local: 'Sem nuvem', 'sem-chave': 'Entrar', pendente: 'Salvando…', ok: 'Na nuvem', erro: 'Sem conexão' };
  function renderNav() {
    const nEv = eventosAtivos().length;
    const cat = CATS[S.secao] ? S.secao : S.ultCat;
    const emCat = !S.paginaEv && !!CATS[S.secao];
    const emEv = !emCat;
    const badge = (n, cls = '') => (n ? `<span class="nav-n ${cls}">${n}</span>` : '');
    $('#nav-principal').innerHTML = `
      <a href="#${cat}" ${emCat ? 'aria-current="page"' : ''}>Catálogo</a>
      <a href="#eventos" ${emEv ? 'aria-current="page"' : ''}>Meus eventos${badge(nEv, 'ouro')}</a>
      <button type="button" data-acao="abrir-comparar">Comparar${badge(S.cmp.size, 'escuro')}</button>`;
    $('#nav-baixo').innerHTML = `
      <a href="#${cat}" ${emCat && S.aba !== 'favoritos' ? 'aria-current="page"' : ''}>${ic('catalogo')}<span>Catálogo</span></a>
      <button type="button" data-acao="ver-favoritos" ${emCat && S.aba === 'favoritos' ? 'aria-current="page"' : ''}>${ic('coracao')}<span>Favoritos</span></button>
      <button type="button" data-acao="abrir-comparar">${ic('comparar')}<span>Comparar</span>${badge(S.cmp.size, 'escuro')}</button>
      <a href="#eventos" ${emEv ? 'aria-current="page"' : ''}>${ic('eventos')}<span>Eventos</span>${badge(nEv, 'ouro')}</a>`;
    const t = $('#sync-curto'); if (t) t.textContent = SYNC_CURTO[S.sync] || '';
  }
  function renderNumeros() {
    if (S.secao === 'eventos') {
      const evs = eventosAtivos();
      const prox = evs.find((e) => e.data && diasAte(e.data) >= 0);
      const contratados = evs.reduce((a, e) => a + (e.escolhas || []).filter((x) => x.status === 'contratado').length, 0);
      $('#trilha').innerHTML = '<a href="#espacos">Início</a> <span aria-hidden="true">/</span> <span>Meus eventos</span>';
      $('#titulo-pagina').textContent = 'Meus eventos';
      $('#numeros').textContent = [`${evs.length} ${evs.length === 1 ? 'evento' : 'eventos'}`,
        prox ? `próximo ${diasAte(prox.data) === 0 ? 'hoje' : `em ${diasAte(prox.data)} dias`}` : null,
        contratados ? `${contratados} ${contratados === 1 ? 'fornecedor contratado' : 'fornecedores contratados'}` : null].filter(Boolean).join(' · ');
      return;
    }
    const C = CATS[S.secao];
    const ls = daSecao();
    const comPreco = ls.filter((l) => menorPreco(l) != null).length;
    const vis = ls.filter((l) => visita(l.id).status === 'visitado').length;
    $('#trilha').innerHTML = `<a href="#espacos">Catálogo</a> <span aria-hidden="true">/</span> <span>${esc(C.curto)}</span>`;
    $('#titulo-pagina').textContent = TITULOS[S.secao] || C.rot;
    $('#numeros').textContent = [`${ls.length} ${ls.length === 1 ? C.um : C.varios} em Palmas`, `${comPreco} com valor informado`,
      vis ? `${vis} ${S.secao === 'espacos' ? (vis === 1 ? 'visitado' : 'visitados') : 'já conversados'}` : null,
      S.dataDados ? `dados conferidos em ${dataBR(S.dataDados)}` : null].filter(Boolean).join(' · ');
  }
  function renderSecoes() {
    const n = (k) => S.locais.filter((l) => (l.cat || 'espacos') === k).length;
    $('#secoes').innerHTML = ORDEM_CATS.map((k) =>
      `<a class="secao-link" href="#${k}" ${S.secao === k ? 'aria-current="page"' : ''}>${ic(CATS[k].icone)}<span class="rot-longo">${esc(CATS[k].rot)}</span><span class="rot-curto">${esc(CATS[k].curto || CATS[k].rot)}</span><span class="n">${n(k)}</span></a>`).join('');
  }
  function renderAbas() {
    const ls = daSecao();
    const cont = (k) => (k === 'todos' ? ls.length
      : ls.filter((l) => (k === 'favoritos' ? visita(l.id).favorito : visita(l.id).status === k)).length);
    const html = ABAS.map(([k, r]) =>
      `<button type="button" role="radio" class="aba" data-aba="${k}" aria-checked="${S.aba === k}"><span class="aba-rot">${rotAba(k, r)}</span><span class="n">${cont(k)}</span></button>`).join('');
    $('#abas').innerHTML = html;
    $('#abas-mob').innerHTML = html;
  }
  function renderRapidos() {
    const ls = daSecao();
    $('#chips-rapidos').innerHTML = rapidosDe(S.secao).map(([k, r, fn]) =>
      `<label class="check"><input type="checkbox" data-rapido="${k}" ${S.f.rapidos.has(k) ? 'checked' : ''}><span>${esc(r)}</span><span class="n">${ls.filter(fn).length}</span></label>`).join('');
  }
  function renderAplicados(n, nEmp = null) {
    const tags = [];
    const add = (rot, acao) => tags.push(`<button type="button" class="tag-filtro" data-remover="${acao}"><span>${esc(rot)}</span>${ic('x')}<span class="sr">remover filtro</span></button>`);
    if (S.f.busca.trim()) add(`“${S.f.busca.trim()}”`, 'busca');
    if (S.f.tipo) add(S.f.tipo, 'tipo');
    if (S.f.evento) add(S.f.evento, 'evento');
    if (Number(S.f.cap)) add(`${S.f.cap}+ convidados`, 'cap');
    if (Number(S.f.preco)) add(`até ${brl(Number(S.f.preco))}`, 'preco');
    rapidosDe(S.secao).forEach(([k, r]) => { if (S.f.rapidos.has(k)) add(r, 'r:' + k); });
    const total = daSecao().filter(passaAba).length;
    const C = CATS[S.secao];
    const lista = S.aba !== 'todos' ? ` em ${rotAba(S.aba, ABAS.find((a) => a[0] === S.aba)[1]).toLowerCase()}` : '';
    const P = C.porObjeto;
    const quem = nEmp != null ? `${n} ${n === 1 ? P.um : P.varios}</strong> <span>de ${nEmp} ${nEmp === 1 ? 'empresa' : 'empresas'}${tags.length ? ', com esses filtros' : ''}`
      : `${n} ${n === 1 ? C.um : C.varios}</strong> <span>${tags.length ? `com esses filtros${n !== total ? `, de ${total}` : ''}` : ''}`;
    $('#aplicados').innerHTML = `<p class="cont"><strong>${quem}${lista}</span></p>`
      + tags.join('') + (tags.length ? '<button type="button" class="link-btn" data-remover="tudo">Limpar tudo</button>' : '');
    const nf = tags.length - (S.f.busca.trim() ? 1 : 0);
    const b = $('#n-filtros'); b.hidden = !nf; b.textContent = nf;
    const v = $('#ver-resultados'); if (v) v.textContent = n ? `Ver ${n} ${n === 1 ? 'resultado' : 'resultados'}` : 'Nenhum resultado';
  }

  /* ============ Render: cards ============ */
  // Crédito das fotos copiadas de terceiros (ex.: Google Maps), com link para a página de origem.
  function creditoHtml(fotos) {
    const c = fotos.map((f) => f && f.credito).find((x) => x && /^https?:\/\//i.test(x.url || ''));
    if (!c) return '';
    const todas = fotos.every((f) => f && f.credito);
    return `<a class="foto-credito" href="${esc(c.url)}" target="_blank" rel="noopener">${todas ? 'Fotos' : 'Parte das fotos'}: ${esc(c.nome || 'fonte')}</a>`;
  }
  function capaHtml(l, grande = false) {
    const fotos = (l.fotos || []).filter((f) => urlSegura(f.url || f));
    if (fotos.length) {
      const cred = grande ? creditoHtml(fotos) : '';
      if (grande && fotos.length > 1) return `<div class="galeria" tabindex="0" aria-label="Fotos, role para o lado">${fotos.map((f) => `<img src="${esc(f.url || f)}" alt="${esc(f.legenda || 'Foto de ' + l.nome)}" loading="lazy">`).join('')}</div><span class="galeria-n">${fotos.length} fotos</span>${cred}`;
      const f = fotos[0];
      return `<img src="${esc(f.url || f)}" alt="${esc(f.legenda || 'Foto de ' + l.nome)}" loading="lazy">${cred}`;
    }
    const a = ehEspaco(l) ? artePorTipo(l.tipo) : l.cat;
    return `<div class="capa-arte arte-${a}">${ic(a)}<span class="ini">${esc(iniciais(l.nome))}</span></div>`;
  }
  const numHash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  function miniCapa(l) {
    const f = (l.fotos || []).find((x) => urlSegura(x.url || x));
    if (f) return `<img class="mini-capa" src="${esc(f.url || f)}" alt="" loading="lazy">`;
    const sig = iniciais(l.nome.replace(/^espa[çc]o\s+/i, '')) || l.nome.slice(0, 1).toUpperCase();
    return `<span class="mini-capa mono mono-${numHash(l.id) % 5}" aria-hidden="true">${esc(sig.slice(0, 2))}</span>`;
  }
  function precoInfo(l) {
    const mp = menorPreco(l);
    if (mp == null) {
      const txt = precosDe(l).find((p) => typeof p.valor === 'string' && p.valor.trim());
      return { consulta: true, valor: txt ? txt.valor : 'Sob consulta', cond: txt ? txt.condicao || '' : 'Peça o valor pelo contato' };
    }
    const nums = precosDe(l).filter((p) => typeof p.valor === 'number');
    const p = nums.find((x) => x.valor === mp);
    const mx = Math.max(...nums.map((x) => x.valor));
    const tx = (l.taxas || []).filter((t) => typeof t.valor === 'number').reduce((a, t) => a + t.valor, 0);
    return {
      prefixo: mx > mp ? 'de' : 'a partir de',
      valor: mx > mp ? `${brl(mp)} a ${brl(mx).replace(/^R\$\s/, '')}` : brl(mp),
      unidade: p.unidade || 'evento',
      cond: [p.condicao, tx ? `taxas ${brl(tx)}` : null].filter(Boolean).join(' · '),
    };
  }
  function precoCard(l) {
    const p = precoInfo(l);
    if (p.consulta) return `<div class="preco consulta"><p class="pv"><strong>${esc(p.valor)}</strong></p>${p.cond ? `<p class="pc">${esc(p.cond)}</p>` : ''}</div>`;
    return `<div class="preco"><p class="pp">${p.prefixo}</p><p class="pv"><strong>${esc(p.valor)}</strong><span>/ ${esc(p.unidade)}</span></p>${p.cond ? `<p class="pc">${esc(p.cond)}</p>` : ''}</div>`;
  }
  function estrelas(n) {
    return `<span class="estrelas" aria-label="${n} de 5">${'★'.repeat(n)}<span class="apagada">${'★'.repeat(5 - n)}</span></span>`;
  }
  const IC_ITEM = { piscina: 'piscina', climatizado: 'clima', brinquedos: 'brinquedos', churrasqueira: 'fogo', lago: 'piscina', estacionamento: 'carro', limpeza: 'check' };
  function fatosCard(l) {
    const its = itensDo(l);
    const prior = rapidosDe(ehEspaco(l) ? 'espacos' : l.cat).map(([k]) => k);
    const ord = [...its.filter((k) => prior.includes(k)), ...its.filter((k) => !prior.includes(k))];
    const f = [];
    if (l.capacidade) f.push(['pessoas', `até ${l.capacidade}`]);
    const obs = objetosDe(l);
    if (porObj(l.cat) && obs.length) {
      const P = CATS[l.cat].porObjeto;
      return obs.slice(0, 3).map((o) => `<li>${ic(CATS[l.cat].icone)}${esc(o.nome || o.tipo)}</li>`).join('')
        + (obs.length > 3 ? `<li class="mais">+${obs.length - 3} ${obs.length - 3 === 1 ? P.um : P.varios}</li>` : '');
    }
    if (!ehEspaco(l)) tiposDe(l).slice(0, 2).forEach((t) => f.push(['', t]));
    let usados = 0;
    for (const k of ord) { if (f.length >= 3) break; f.push([IC_ITEM[k] || 'check', itemTexto(l, k)]); usados++; }
    const resto = its.length - usados;
    return f.map(([i, t]) => `<li>${i ? ic(i) : ''}${esc(t)}</li>`).join('') + (resto > 0 ? `<li class="mais">+${resto} ${resto === 1 ? 'item' : 'itens'}</li>` : '');
  }
  function cardHtml(l) {
    const v = visita(l.id);
    const zap = zapLink(l.whatsapp, l.nome);
    const insta = instaUrl(l.instagram);
    const nEv = eventosCom(l.id).length;
    const cmp = S.cmp.has(l.id);
    const onde = ehEspaco(l) ? l.bairro || 'Palmas' : l.atende_em || l.bairro || 'Palmas';
    const st = v.status ? [stRot(v.status, l), v.status === 'visitado' && v.data ? dataBR(v.data).slice(0, 5) : null, v.nota ? `nota ${v.nota}` : null].filter(Boolean).join(' · ') : '';
    const fatos = fatosCard(l);
    const foto = (l.fotos || []).find((x) => urlSegura(x.url || x));
    const km = distKm(l);
    return `<article class="card com-capa ${v.status === 'descartado' ? 'descartado' : ''} ${cmp ? 'comparando' : ''}">
      <button type="button" class="card-capa ${foto ? '' : 'sem-foto'}" data-abrir="${l.id}" tabindex="-1" aria-hidden="true">${foto ? `<img src="${esc(foto.url || foto)}" alt="" loading="lazy">` : capaHtml(l)}${km != null ? `<span class="capa-dist">${ic('pin')}${distTxt(km)}</span>` : ''}${foto ? '' : '<span class="capa-sem">Sem foto ainda</span>'}</button>
      <div class="card-cab">
        <div class="card-tit">
          <h2><button type="button" data-abrir="${l.id}">${esc(l.nome)}</button></h2>
          <p class="onde">${ic('pin')}<span>${esc(onde)}</span>${!ehEspaco(l) || !l.tipo ? '' : `<span class="tipo">· ${esc(l.tipo)}</span>`}</p>
        </div>
        <button type="button" class="coracao" data-fav="${l.id}" aria-pressed="${v.favorito}" aria-label="${v.favorito ? 'Tirar dos' : 'Adicionar aos'} favoritos">${ic('coracao')}</button>
      </div>
      ${st || nEv ? `<div class="card-st">${st ? `<span class="pill-st ${STATUS[v.status].cls}">${ic(STATUS[v.status].icone)}${esc(st)}</span>` : ''}${nEv ? `<span class="pill-st st-ev">${ic('eventos')}em ${nEv} ${nEv === 1 ? 'evento' : 'eventos'}</span>` : ''}</div>` : ''}
      ${precoCard(l)}
      ${mostraTempo(l) ? tempoHtml(tempoDe(l)) : ''}
      ${fatos ? `<ul class="fatos">${fatos}</ul>` : ''}
      <div class="rodape-card">
        ${zap ? `<a class="acao zap" href="${zap}" target="_blank" rel="noopener">${ic('zap')}WhatsApp</a>`
          : l.telefone ? `<a class="acao" href="tel:+55${digitos(l.telefone)}">${ic('fone')}Ligar</a>`
          : insta ? `<a class="acao" href="${esc(insta)}" target="_blank" rel="noopener">${ic('insta')}Instagram</a>` : ''}
        <button type="button" class="acao cmp-btn" data-cmp="${l.id}" aria-pressed="${cmp}">${ic('comparar')}${cmp ? 'Comparando' : 'Comparar'}</button>
        <button type="button" class="link-det" data-abrir="${l.id}">Detalhes<span aria-hidden="true"> →</span><span class="sr"> de ${esc(l.nome)}</span></button>
      </div>
      <p class="fonte-card">${esc(l.status || 'Fonte não informada')}${l.conferido_em ? ` · ${dataBR(l.conferido_em)}` : ''}</p>
    </article>`;
  }
  const ehCelular = () => matchMedia('(max-width: 760px)').matches;
  // Visão por objeto: cada brinquedo (ou item de aluguel) vira um cartão, com a empresa ao lado.
  function objetosFiltrados(empresas) {
    const q = norm(S.f.busca.trim()).split(/\s+/).filter(Boolean);
    const teto = Number(S.f.preco) || 0;
    const r = [];
    empresas.forEach((l, ord) => objetosDe(l).forEach((o, i) => {
      if (S.f.tipo && o.tipo !== S.f.tipo) return;
      if (teto && !(typeof o.valor === 'number' && o.valor <= teto)) return;
      if (q.length) { const txt = norm([o.nome, o.tipo, o.obs, l.nome, l.atende_em].join(' ')); if (!q.every((t) => txt.includes(t))) return; }
      r.push({ l, o, i, ord });
    }));
    const o = S.f.ordem;
    const v = (x) => (typeof x.o.valor === 'number' ? x.o.valor : Infinity);
    const nome = (x) => x.o.nome || x.o.tipo || '';
    const cmpV = (a, b) => (v(a) === v(b) ? 0 : v(a) < v(b) ? -1 : 1);
    r.sort((a, b) => (o === 'preco' ? cmpV(a, b) || nome(a).localeCompare(nome(b), 'pt-BR')
      : o === 'nome' ? nome(a).localeCompare(nome(b), 'pt-BR') : a.ord - b.ord || a.i - b.i));
    return r;
  }
  function objCardHtml({ l, o }) {
    const nome = o.nome || o.tipo;
    const zap = zapLink(l.whatsapp, l.nome, nome);
    const num = typeof o.valor === 'number';
    return `<article class="card obj-card">
      <div class="card-cab">
        <span class="mini-capa mono mono-${numHash(l.id + (o.tipo || '')) % 5}" aria-hidden="true">${ic(CATS[l.cat].icone)}</span>
        <div class="card-tit">
          <h2><button type="button" data-abrir="${l.id}">${esc(nome)}</button></h2>
          ${o.tipo && o.tipo !== nome ? `<p class="onde">${esc(o.tipo)}</p>` : ''}
        </div>
      </div>
      <div class="preco ${num ? '' : 'consulta'}"><p class="pv"><strong>${num ? brl(o.valor) : esc(o.valor || 'Sob consulta')}</strong>${num ? `<span>/ ${esc(o.unidade || 'evento')}</span>` : ''}</p>
        ${o.obs ? `<p class="pc">${esc(o.obs)}</p>` : num ? '' : '<p class="pc">Peça o valor pelo contato</p>'}</div>
      ${mostraTempo(l) ? tempoHtml(tempoObj(l, o)) : ''}
      ${o.qtd ? `<ul class="fatos"><li>${ic('check')}${o.qtd} ${o.qtd === 1 ? 'disponível' : 'disponíveis'}</li></ul>` : ''}
      <p class="obj-empresa">${miniCapa(l)}<span>de <button type="button" data-abrir="${l.id}">${esc(l.nome)}</button>${l.atende_em ? ` · ${esc(l.atende_em)}` : ''}</span></p>
      <div class="rodape-card">
        ${zap ? `<a class="acao zap" href="${zap}" target="_blank" rel="noopener">${ic('zap')}WhatsApp</a>`
          : l.telefone ? `<a class="acao" href="tel:+55${digitos(l.telefone)}">${ic('fone')}Ligar</a>` : ''}
        <button type="button" class="acao" data-add-evento="${l.id}">${ic('eventos')}Ao evento</button>
        <button type="button" class="link-det" data-abrir="${l.id}">Empresa<span aria-hidden="true"> →</span></button>
      </div>
    </article>`;
  }
  function renderVisao() {
    const el = $('#visao');
    if (!porObj()) { el.hidden = true; return; }
    const P = CATS[S.secao].porObjeto;
    el.hidden = false;
    el.innerHTML = [['empresa', 'Por empresa'], ['objeto', `Por ${P.um}`]].map(([k, r]) =>
      `<button type="button" data-visao="${k}" aria-pressed="${(S.visao[S.secao] || 'empresa') === k}">${r}</button>`).join('');
  }
  function renderLista() {
    renderVisao();
    const empresas = filtrados();
    const objs = verObjetos();
    const r = objs ? objetosFiltrados(empresas) : empresas;
    const sig = JSON.stringify([S.secao, S.aba, S.f.busca, S.f.tipo, S.f.evento, S.f.cap, S.f.preco, S.f.ordem, [...S.f.rapidos], S.porPag, objs]);
    if (sig !== S.sig) { S.sig = sig; S.pag = 1; }
    const paginas = Math.max(1, Math.ceil(r.length / S.porPag));
    if (S.pag > paginas) S.pag = paginas;
    const mob = ehCelular();
    const ini = mob ? 0 : (S.pag - 1) * S.porPag;
    const fim = Math.min(r.length, S.pag * S.porPag);
    renderAplicados(r.length, objs ? new Set(r.map((x) => x.l.id)).size : null);
    if (!r.length) {
      const msg = !daSecao().length
        ? [`Nenhum ${CATS[S.secao].um} cadastrado ainda`, 'Use o botão Cadastrar, no alto, para adicionar o primeiro.', '']
        : objs && !daSecao().some((l) => objetosDe(l).length) ? [`Nenhum ${CATS[S.secao].porObjeto.um} listado ainda`, `Abra uma empresa, toque em Editar e cadastre os ${CATS[S.secao].porObjeto.varios} que ela tem, com o valor de cada um.`, '<button type="button" class="btn" data-visao="empresa">Ver por empresa</button>']
        : S.aba === 'todos' ? ['Nada com esses filtros', 'Tire algum filtro ou busque por outro termo.', '<button type="button" class="btn" data-remover="tudo">Limpar filtros</button>']
        : ['Lista vazia por enquanto', 'Abra um cadastro e use “Minha visita” para marcar favorito, visita ou descarte.', '<button type="button" class="btn" data-aba="todos">Ver todos</button>'];
      $('#lista').innerHTML = `<div class="vazio"><h3>${msg[0]}</h3><p>${msg[1]}</p>${msg[2]}</div>`;
    } else {
      $('#lista').innerHTML = r.slice(ini, fim).map(objs ? objCardHtml : cardHtml).join('');
    }
    renderPaginacao(r.length, ini, fim, paginas, mob);
    renderBarraComparar();
  }
  function renderPaginacao(n, ini, fim, paginas, mob) {
    const nav = $('#paginacao');
    if (!n) { nav.innerHTML = ''; return; }
    if (mob) {
      nav.innerHTML = `<p>Mostrando <strong>${fim}</strong> de <strong>${n}</strong></p>
        <div class="progresso" aria-hidden="true"><span style="width:${Math.round((fim / n) * 100)}%"></span></div>
        ${fim < n ? `<button type="button" class="btn largo" data-pag="mais">Carregar mais ${Math.min(S.porPag, n - fim)}</button>` : ''}`;
      return;
    }
    const nums = [];
    for (let p = 1; p <= paginas; p++) {
      if (p === 1 || p === paginas || Math.abs(p - S.pag) <= 1) nums.push(p);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    const passo = (p, rot, cls, dis) => (dis ? `<span class="pag-passo ${cls}" aria-disabled="true">${rot}</span>`
      : `<button type="button" class="pag-passo ${cls}" data-pag="${p}">${rot}</button>`);
    nav.innerHTML = `<p>Mostrando <strong>${ini + 1}–${fim}</strong> de <strong>${n}</strong></p>
      ${paginas > 1 ? `<div class="pags">
        ${passo(S.pag - 1, `${ic('voltar')}Anterior`, 'ant', S.pag === 1)}
        ${nums.map((p) => (p === '…' ? '<span class="pag-gap" aria-hidden="true">…</span>'
          : `<button type="button" class="pag-n" data-pag="${p}" ${p === S.pag ? 'aria-current="page"' : ''} aria-label="Página ${p}">${p}</button>`)).join('')}
        ${passo(S.pag + 1, `Próxima${ic('seguir')}`, 'prox', S.pag === paginas)}
      </div>` : ''}
      <label class="por-pag">Por página <select id="f-porpag">${[12, 24, 48].map((x) => `<option ${x === S.porPag ? 'selected' : ''}>${x}</option>`).join('')}</select></label>`;
  }

  /* ============ Detalhe ============ */
  function abrirDetalhe(id, aba = 'sobre') {
    if (!S.porId[id]) return;
    S.detalheId = id; S.detalheAba = aba;
    renderDetalhe();
    const d = $('#detalhe');
    if (!d.open) d.showModal();
    d.scrollTop = 0;
    history.replaceState(null, '', '#local/' + id);
  }
  function renderDetalhe() {
    const l = S.porId[S.detalheId];
    const zap = zapLink(l.whatsapp, l.nome);
    const insta = instaUrl(l.instagram);
    const contatos = [
      l.telefone && `<a class="btn" href="tel:+55${digitos(l.telefone)}">${ic('fone')}${esc(l.telefone)}</a>`,
      insta && `<a class="btn" href="${esc(insta)}" target="_blank" rel="noopener">${ic('insta')}${esc(instaArroba(l.instagram))}</a>`,
      urlSegura(l.site) && `<a class="btn" href="${esc(l.site)}" target="_blank" rel="noopener">${ic('site')}Site</a>`,
      urlSegura(l.detalhes && l.detalhes.portfolio) && `<a class="btn" href="${esc(l.detalhes.portfolio)}" target="_blank" rel="noopener">${ic('servicos')}Portfólio</a>`,
    ].filter(Boolean).join('');
    const meta = (ehEspaco(l)
      ? [l.tipo, l.endereco || l.bairro, l.capacidade ? `até ${l.capacidade} pessoas` : null]
      : [catDe(l).rot, l.atende_em ? `Atende: ${l.atende_em}` : null, l.endereco]).filter(Boolean).map(esc).join(' · ');
    const evs = eventosCom(l.id);
    const pi = precoInfo(l);
    const esp = ehEspaco(l);
    const h0 = (l.horarios || [])[0];
    const pBase = (l.precos || []).find((p) => typeof p.valor === 'number' && p.valor === menorPreco(l));
    const fatos = [
      ['Menor valor', pi.consulta ? pi.valor : brl(menorPreco(l)), pi.consulta ? '' : `/ ${pi.unidade}`],
      esp ? ['Capacidade', l.capacidade ? `até ${l.capacidade}` : 'Não informada', l.capacidade ? 'pessoas' : '']
        : mostraTempo(l) ? ['Tempo de uso', tempoDe(l) || 'Não informado', '']
        : ['Atende', l.atende_em || l.bairro || 'Palmas', ''],
      esp ? ['Tempo de uso', h0 ? h0.horario : /h de uso/.test(pBase?.unidade || '') ? pBase.unidade : 'Não informado', h0 ? h0.dias : '']
        : porObj(l.cat) && objetosDe(l).length ? [catDe(l).porObjeto.rot, `${objetosDe(l).length}`, objetosDe(l).length === 1 ? catDe(l).porObjeto.um : catDe(l).porObjeto.varios]
        : ['Oferece', tiposDe(l)[0] || catDe(l).curto, tiposDe(l).length > 1 ? `+${tiposDe(l).length - 1}` : ''],
      ['Pagamento', l.pagamento ? l.pagamento.split(/[.;]/)[0].slice(0, 60) : 'Não informado', ''],
    ];
    const v0 = visita(l.id);
    $('#detalhe').innerHTML = `
      <div class="folha-topo">
        <button type="button" class="fechar" data-fechar aria-label="Fechar">${ic('voltar')}</button>
        <h2 id="detalhe-titulo">${esc(l.nome)}</h2>
        <button type="button" class="fechar" data-editar="${l.id}" aria-label="Editar local" title="Editar local">${ic('editar')}</button>
        <button type="button" class="coracao" style="position:static;box-shadow:none;border:1px solid var(--linha)" data-fav="${l.id}" aria-pressed="${visita(l.id).favorito}" aria-label="Favorito">${ic('coracao')}</button>
      </div>
      <div class="folha-capa">${capaHtml(l, true)}</div>
      <div class="folha-corpo">
        <div class="det-pills">
          <span class="det-pill">${esc(tiposDe(l)[0] || catDe(l).curto)}</span>
          ${l.status ? `<span class="det-pill ${/^Informado|^Conferido|oficial/.test(l.status) ? 'confia' : 'duvida'}">${ic(/^Informado|^Conferido|oficial/.test(l.status) ? 'check' : 'alerta')}${esc(l.status)}</span>` : ''}
          ${v0.status ? `<span class="det-pill ${STATUS[v0.status].cls}">${esc(stRot(v0.status, l))}${v0.nota ? ` · nota ${v0.nota}` : ''}</span>` : ''}
        </div>
        <h1>${esc(l.nome)}</h1>
        <p class="meta">${meta}</p>
        <dl class="det-fatos">${fatos.map(([r, v, x]) => `<div><dt>${r}</dt><dd>${esc(v)}${x ? ` <small>${esc(x)}</small>` : ''}</dd></div>`).join('')}</dl>
        ${contatos ? `<div class="contatos">${contatos}</div>` : ''}
        ${localHtml(l)}
        ${evs.length ? `<div class="no-evento-box">${ic('eventos')}<span>Nos seus eventos: ${evs.map(({ ev, esc: e }) => `<a href="#evento/${ev.id}">${esc(ev.nome)}</a> <small>(${escRot(e.status)})</small>`).join(', ')}</span></div>` : ''}
        <div class="segmento" role="tablist">
          <button type="button" role="tab" data-daba="sobre" aria-selected="${S.detalheAba === 'sobre'}">Informações</button>
          <button type="button" role="tab" data-daba="visita" aria-selected="${S.detalheAba === 'visita'}">${ehEspaco(l) ? 'Minha visita' : 'Minha avaliação'}</button>
        </div>
        <div id="painel-detalhe">${S.detalheAba === 'sobre' ? sobreHtml(l) : visitaHtml(l)}</div>
      </div>
      <div class="det-cta">
        ${zap ? `<a class="btn zap" href="${zap}" target="_blank" rel="noopener">${ic('zap')}WhatsApp</a>`
          : l.telefone ? `<a class="btn primario" href="tel:+55${digitos(l.telefone)}">${ic('fone')}Ligar</a>` : ''}
        <button type="button" class="btn" data-add-evento="${l.id}">${ic('eventos')}${evs.length ? 'Outro evento' : 'Ao evento'}</button>
      </div>`;
    atualizarSync();
  }
  function sobreHtml(l) {
    const esp = ehEspaco(l);
    const objs = objetosDe(l);
    const P = catDe(l).porObjeto;
    const mpObj = Math.min(...objs.map((o) => (typeof o.valor === 'number' ? o.valor : Infinity)));
    const objsHtml = P ? `<section class="secao" id="det-objetos"><h3>${esc(P.rot)}${objs.length ? ` (${objs.length})` : ''}</h3>
      ${objs.length ? `<ul class="obj-lista">${objs.map((o) => {
        const num = typeof o.valor === 'number';
        return `<li class="${num && o.valor === mpObj && objs.length > 1 ? 'menor' : ''}">
          <div><strong>${esc(o.nome || o.tipo)}</strong>${o.tipo && o.tipo !== o.nome ? `<span class="obj-tipo">${esc(o.tipo)}</span>` : ''}
            ${mostraTempo(l) ? `<span class="obj-tempo ${tempoObj(l, o) ? '' : 'sem'}">${ic('relogio')}${esc(tempoObj(l, o) || 'Tempo de uso não informado')}</span>` : ''}
            ${o.qtd || o.obs ? `<small>${[o.qtd ? `${o.qtd} ${o.qtd === 1 ? 'disponível' : 'disponíveis'}` : null, o.obs].filter(Boolean).map(esc).join(' · ')}</small>` : ''}</div>
          <span class="obj-valor">${num ? `${o.valor === mpObj && objs.length > 1 ? '<span class="selo-menor">Menor</span>' : ''}${brl(o.valor)} <small>/ ${esc(o.unidade || 'evento')}</small>` : `<span class="fraco">${esc(o.valor || 'Sob consulta')}</span>`}</span>
        </li>`;
      }).join('')}</ul>`
        : `<div class="cartao"><p class="texto">Ainda sem a lista de ${esc(P.varios)}. Toque em Editar para cadastrar cada um com o seu valor.</p></div>`}
    </section>` : '';
    const precos = (l.precos || []).length
      ? `<div class="cartao">${l.precos.map((p) => `
          <div class="linha-preco ${typeof p.valor === 'number' && p.valor === menorPreco(l) && l.precos.length > 1 ? 'menor' : ''}">
            <span class="v">${typeof p.valor === 'number' ? brl(p.valor) : esc(p.valor || 'Sob consulta')}${p.unidade ? ` <small>/ ${esc(p.unidade)}</small>` : ''}</span>
            <span class="c">${typeof p.valor === 'number' && p.valor === menorPreco(l) && l.precos.length > 1 ? '<span class="selo-menor">Menor</span>' : ''}${esc(p.condicao || 'Condição não informada')}</span>
            ${p.inclui ? `<span class="i">Inclui: ${esc(p.inclui)}</span>` : ''}
          </div>`).join('')}</div>`
      : objs.length ? '' : '<div class="cartao"><p class="texto">Sem valor publicado. Peça orçamento informando data, horário e número de convidados.</p></div>';
    const taxas = (l.taxas || []).length
      ? `<div class="cartao" style="margin-top:8px">${l.taxas.map((t) => `<div class="linha-preco"><span class="v">+ ${typeof t.valor === 'number' ? brl(t.valor) : esc(t.valor)}</span><span class="c">${esc(t.nome)}</span></div>`).join('')}</div>`
      : '';
    const pagamento = l.pagamento ? `<div class="cartao" style="margin-top:8px"><div class="linha-preco"><span class="v"><small>Pagamento</small></span><span class="c" style="font-weight:400">${esc(l.pagamento)}</span></div></div>` : '';
    const v = visita(l.id);
    const orc = v.orcamento_valor ? `<div class="cartao" style="margin-top:8px"><div class="linha-preco"><span class="v">${esc(v.orcamento_valor)}</span><span class="c">Orçamento que você recebeu</span>${v.orcamento_condicao ? `<span class="i">${esc(v.orcamento_condicao)}</span>` : ''}</div></div>` : '';
    const horarios = (l.horarios || []).length
      ? `<ul class="lista-simples">${l.horarios.map((h) => `<li><strong>${esc(h.dias)}</strong>: ${esc(h.horario)}</li>`).join('')}</ul>`
      : '<p class="texto">Não informado. Pergunte o horário de início e término e se há cobrança por hora extra.</p>';
    const det = l.detalhes || {};
    const camposDet = esp ? [] : (catDe(l).campos || []).filter(([k, , t]) => det[k] != null && det[k] !== '' && t !== 'url' && !(k === 'duracao' && mostraTempo(l)));
    const reserva = [l.antecedencia && ['Reservar com', l.antecedencia], l.cancelamento && ['Cancelamento', l.cancelamento]].filter(Boolean);
    const falta = [menorPreco(l) == null && 'o valor', esp && !l.capacidade && 'a capacidade', esp && !(l.horarios || []).length && 'o horário de uso',
      !itensDo(l).length && (esp ? 'o que vem no aluguel' : 'o que está incluso'), mostraTempo(l) && !tempoDe(l) && !objs.some((o) => o.duracao) && 'o tempo de uso', !l.pagamento && 'a forma de pagamento'].filter(Boolean);
    const zapF = zapLink(l.whatsapp, l.nome);
    const perguntar = falta.length ? `<div class="perguntar">${ic('alerta')}<div><strong>Perguntar ao ${esp ? 'local' : 'fornecedor'}</strong>
      <span>Ainda falta saber ${falta.length > 1 ? falta.slice(0, -1).join(', ') + ' e ' + falta[falta.length - 1] : falta[0]}.</span>
      ${zapF ? `<a href="${zapF}" target="_blank" rel="noopener">Perguntar no WhatsApp</a>` : ''}</div></div>` : '';
    return `
      ${perguntar}
      ${l.descricao ? `<section class="secao"><h3>Sobre</h3><div class="cartao"><p class="texto">${esc(l.descricao)}</p></div></section>` : ''}
      ${objsHtml}
      <section class="secao"><h3>${P ? 'Pacotes e condições' : 'Valores e condições'}</h3>${precos}${taxas}${pagamento}${orc}
        <div class="nota-aviso">${ic('alerta')}<span>O valor muda com o dia da semana, a temporada, a duração e o que está incluso. Os daqui são referência de ${dataBR(l.conferido_em)}.</span></div>
      </section>
      ${reserva.length ? `<section class="secao"><h3>Reserva e cancelamento</h3><div class="cartao"><dl class="det">${reserva.map(([r, v]) => `<div><dt>${r}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div></section>` : ''}
      ${esp ? `<section class="secao"><h3>Horários de uso</h3><div class="cartao">${horarios}</div></section>` : ''}
      ${camposDet.length ? `<section class="secao"><h3>Detalhes</h3><div class="cartao"><dl class="det">${camposDet.map(([k, r]) => `<div><dt>${esc(r)}</dt><dd>${esc(det[k])}</dd></div>`).join('')}</dl></div></section>` : ''}
      <section class="secao"><h3>${esp ? 'O que vem' : 'O que está incluso'}</h3>
        ${itensDo(l).length
          ? `<ul class="vem">${itensDo(l).map((k) => `<li>${ic('check')}${esc(itemTexto(l, k))}</li>`).join('')}</ul>`
          : `<div class="cartao"><p class="texto">Ainda não informado. Pergunte o que ${esp ? 'vem no aluguel' : 'está no preço'} e cadastre em Editar.</p></div>`}
        ${(l.comodidades || []).length ? `<h4 class="sub-h">Detalhes e outros itens</h4><ul class="tags">${l.comodidades.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      </section>
      ${(l.eventos || []).length ? `<section class="secao"><h3>Bom para</h3><ul class="tags">${l.eventos.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>` : ''}
      ${l.observacoes ? `<section class="secao"><h3>Observações</h3><div class="cartao"><p class="texto">${esc(l.observacoes)}</p></div></section>` : ''}
      <p style="margin:22px 0 0"><button type="button" class="btn" data-editar="${l.id}">${ic('editar')}Editar informações</button></p>
      <section class="secao fontes"><h3>De onde vieram os dados</h3>
        Conferido em ${dataBR(l.conferido_em)}${l.status ? `<span class="status-dado">${esc(l.status)}</span>` : ''}
        <ul>${(l.fontes || []).map((u) => (/^https?:\/\//.test(u)
          ? `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\/(www\.)?/, '').slice(0, 70))}</a></li>`
          : `<li>${esc(u)}</li>`)).join('')}</ul>
      </section>`;
  }
  function listaEditHtml(tipo, itens, rotulo, ph) {
    return `<section class="secao"><h3>${rotulo}</h3><div class="cartao lista-edit ${tipo}">
      ${itens.length ? `<ul>${itens.map((t, i) => `<li><span>${esc(t)}</span><button type="button" data-tirar="${tipo}:${i}" aria-label="Remover">×</button></li>`).join('')}</ul>` : ''}
      <form data-add="${tipo}"><input name="t" placeholder="${ph}" autocomplete="off" maxlength="200"><button class="btn" type="submit">Adicionar</button></form>
    </div></section>`;
  }
  function visitaHtml(l) {
    const v = visita(l.id);
    const entrar = API && !S.chave ? `<div class="aviso-chave">${ic('nuvem')}<p>Para registrar visita, nota e anotações, entre com a chave de edição. Tudo fica salvo na nuvem.</p><button type="button" class="btn primario" data-acao="abrir-config">Entrar</button></div>` : '';
    return `${entrar}
      <section class="secao"><h3>Situação</h3>
        <div class="status-visita">${Object.entries(STATUS).map(([k, s]) =>
          `<button type="button" data-status="${k}" data-v="${k}" aria-pressed="${v.status === k}">${ic(s.icone)}${k ? stRot(k, l) : (ehEspaco(l) ? s.rotulo : 'Sem contato')}</button>`).join('')}</div>
      </section>
      <section class="secao"><h3>${ehEspaco(l) ? 'Visita' : 'Contato'} e nota geral</h3>
        <div class="cartao" style="padding:12px 14px">
          <div class="grade-2">
            <label class="campo"><span>${ehEspaco(l) ? 'Data da visita' : 'Data do contato'}</span><input type="date" data-campo="data" value="${esc(v.data)}"></label>
            <div class="campo"><span>Nota geral</span>
              <div class="nota-geral" role="radiogroup" aria-label="Nota geral">${[1, 2, 3, 4, 5].map((n) =>
                `<button type="button" role="radio" aria-checked="${v.nota === n}" aria-label="${n} de 5" data-nota="${n}" class="${n <= v.nota ? 'on' : ''}">★</button>`).join('')}</div>
            </div>
          </div>
        </div>
      </section>
      <section class="secao"><h3>Avaliação por critério</h3>
        <div class="cartao criterios">${catDe(l).criterios.map(([k, r]) => `
          <div class="criterio"><span>${r}</span><div class="pontos">${[1, 2, 3, 4, 5].map((n) =>
            `<button type="button" data-crit="${k}:${n}" class="${(v.criterios[k] || 0) >= n ? 'on' : ''}" aria-label="${r}: ${n}">${n}</button>`).join('')}</div></div>`).join('')}
        </div>
      </section>
      ${listaEditHtml('pros', v.pros, 'Prós', 'Ex.: estacionamento amplo')}
      ${listaEditHtml('contras', v.contras, 'Contras', ehEspaco(l) ? 'Ex.: som só até 22h' : 'Ex.: frete cobrado à parte')}
      <section class="secao"><h3>Orçamento recebido</h3>
        <div class="cartao" style="padding:12px 14px"><div class="grade-2">
          <label class="campo"><span>Valor</span><input data-campo="orcamento_valor" value="${esc(v.orcamento_valor)}" placeholder="Ex.: R$ 2.800" maxlength="60"></label>
          <label class="campo"><span>Condição</span><input data-campo="orcamento_condicao" value="${esc(v.orcamento_condicao)}" placeholder="Ex.: sábado, 8h de uso, com cadeiras" maxlength="200"></label>
        </div></div>
      </section>
      <section class="secao"><h3>Anotações</h3>
        <label class="campo"><span class="sr">Anotações</span><textarea data-campo="anotacoes" rows="5" placeholder="Impressões, perguntas que ficaram, nome de quem atendeu, regras do local…">${esc(v.anotacoes)}</textarea></label>
        <label class="campo" style="margin-top:10px"><span>Link do álbum de fotos da visita</span><input type="url" data-campo="album" value="${esc(v.album)}" placeholder="Google Fotos, Drive…"></label>
        ${v.album && /^https?:\/\//.test(v.album) ? `<p style="margin:8px 0 0"><a href="${esc(v.album)}" target="_blank" rel="noopener">Abrir álbum</a></p>` : ''}
      </section>
      <p class="estado-salvo"><span class="ponto-sync"></span><span id="txt-sync"></span></p>`;
  }
  function renderPainelVisita() {
    const p = $('#painel-detalhe');
    if (p && S.detalheAba === 'visita') { p.innerHTML = visitaHtml(S.porId[S.detalheId]); atualizarSync(); }
  }

  /* ============ Comparar ============ */
  function renderBarraComparar() {
    const b = $('#barra-comparar');
    const ls = [...S.cmp].map((id) => S.porId[id]).filter(Boolean);
    b.hidden = !ls.length || !!S.paginaEv || S.secao === 'eventos';
    document.body.classList.toggle('com-bandeja', !b.hidden);
    $('#n-comparar').textContent = ls.length === 1 ? '1 selecionado:' : `${ls.length} para comparar:`;
    $('#txt-comparar').textContent = ls.map((l) => l.nome).join(', ') + (ls.length === 1 ? ' · escolha mais um' : '');
    b.querySelector('[data-acao="abrir-comparar"]').disabled = ls.length < 2;
    renderNav();
  }
  function abrirComparar() {
    const ls = [...S.cmp].map((id) => S.porId[id]).filter(Boolean);
    const vs = ls.map((l) => visita(l.id));
    const melhor = (vals, maior) => {
      const nums = vals.filter((x) => typeof x === 'number' && x > 0);
      if (nums.length < 2) return null;
      return maior ? Math.max(...nums) : Math.min(...nums);
    };
    const precos = ls.map(menorPreco);
    const caps = ls.map((l) => l.capacidade || null);
    const notas = vs.map((v) => v.nota || null);
    const bp = melhor(precos, false), bc = melhor(caps, true), bn = melhor(notas, true);
    const lista = (a) => (a.length ? `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '—');
    const esp = ls.every(ehEspaco);
    const C = catDe(ls[0] || {});
    const linhas = [
      ['Tipo', ls.map((l) => esc(tiposDe(l).join(', ') || '—'))],
      [esp ? 'Onde' : 'Atende em', ls.map((l) => esc((esp ? l.bairro : l.atende_em) || '—'))],
      ['Menor valor', ls.map((l, i) => {
        const p = (l.precos || []).find((x) => x.valor === precos[i]);
        return [precos[i] != null ? `<strong>${brl(precos[i])}</strong><br><small>${esc(p.unidade || '')} · ${esc(p.condicao || '')}</small>` : 'Sob consulta', precos[i] != null && precos[i] === bp];
      })],
      ...(ls.some(mostraTempo) ? [['Tempo de uso', ls.map((l) => {
        const t = tempoDe(l);
        const ob = objetosDe(l).filter((o) => o.duracao && o.duracao !== t);
        return t || ob.length ? [t ? esc(t) : '', ob.length ? `<small>${ob.map((o) => `${esc(o.nome || o.tipo)}: ${esc(o.duracao)}`).join('<br>')}</small>` : ''].filter(Boolean).join('<br>') : '—';
      })]] : []),
      ['Taxas extras', ls.map((l) => ((l.taxas || []).length ? l.taxas.map((t) => `${esc(t.nome)}: ${typeof t.valor === 'number' ? brl(t.valor) : esc(t.valor)}`).join('<br>') : '—'))],
      ['Orçamento recebido', vs.map((v) => (v.orcamento_valor ? `${esc(v.orcamento_valor)}<br><small>${esc(v.orcamento_condicao)}</small>` : '—'))],
      ...(esp ? [['Capacidade', ls.map((l, i) => [l.capacidade ? `${l.capacidade} pessoas` : '—', caps[i] && caps[i] === bc])]] : []),
      ['Situação', vs.map((v, i) => (v.status ? stRot(v.status, ls[i]) : '—') + (v.data ? ` (${dataBR(v.data)})` : ''))],
      ['Nota geral', vs.map((v, i) => [v.nota ? estrelas(v.nota) : '—', notas[i] && notas[i] === bn])],
      ...C.criterios.map(([k, r]) => {
        const vals = vs.map((v) => v.criterios[k] || null);
        const b = melhor(vals, true);
        return [r, vals.map((x) => [x ? `${x}/5` : '—', x && x === b])];
      }),
      ['Prós', vs.map((v) => lista(v.pros))],
      ['Contras', vs.map((v) => lista(v.contras))],
      [esp ? 'O que vem' : 'O que está incluso', ls.map((l) => lista(itensDo(l).map((k) => itemTexto(l, k))))],
      ...(esp ? [] : (C.campos || []).filter(([k, , t]) => t !== 'url' && t !== 'area' && !(k === 'duracao' && ls.some(mostraTempo))).map(([k, r]) => [r, ls.map((l) => esc((l.detalhes || {})[k] ?? '—'))])),
      ['Pagamento', ls.map((l) => esc(l.pagamento || '—'))],
      ['Cancelamento', ls.map((l) => esc(l.cancelamento || '—'))],
      ['Outros itens', ls.map((l) => lista(l.comodidades || []))],
    ];
    $('#comparar').innerHTML = `
      <div class="folha-topo">
        <button type="button" class="fechar" data-fechar aria-label="Fechar">${ic('voltar')}</button>
        <h2>Comparando ${ls.length} ${esp ? 'locais' : 'fornecedores'}</h2>
      </div>
      <div class="folha-corpo" style="padding-bottom:8px"><p class="meta">Em verde, o melhor de cada linha. Notas e orçamentos vêm do que você registrou.</p></div>
      <div class="tabela-wrap"><table class="tabela-cmp" style="--n:${ls.length}">
        <thead><tr><th></th>${ls.map((l) => `<th><a href="#local/${l.id}" data-abrir="${l.id}">${esc(l.nome)}</a></th>`).join('')}</tr></thead>
        <tbody>${linhas.map(([r, cels]) => `<tr><th scope="row">${r}</th>${cels.map((c) => {
          const [h, m] = Array.isArray(c) ? c : [c, false];
          return `<td class="${m ? 'melhor' : ''}">${h}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    $('#comparar').showModal();
  }

  /* ============ Config / backup ============ */
  function abrirConfig() {
    const d = $('#config');
    d.innerHTML = `<div class="folha-corpo">
      <h2>Salvar na nuvem</h2>
      ${API
        ? `<p>Visitas, eventos e cadastros ficam sempre na nuvem e aparecem em qualquer aparelho. Para <strong>gravar</strong>, <strong>cadastrar ou editar</strong> e <strong>ver os eventos</strong>, entre com a chave de edição (pergunte a quem cuida do site).</p>
           <label class="campo"><span>Chave de edição</span><input id="in-chave" type="password" autocomplete="off" value="${esc(S.chave)}" placeholder="Digite a chave"></label>
           <div class="acoes"><button class="btn primario" data-acao="salvar-chave">${S.chave ? 'Trocar chave' : 'Entrar e sincronizar'}</button>${S.chave ? '<button class="btn" data-acao="esquecer-chave">Sair</button>' : ''}</div>`
        : `<p>A nuvem não está configurada neste site.</p>`}
      <p class="estado-salvo"><span class="ponto-sync"></span><span id="txt-sync"></span></p>
      <h2 style="margin-top:22px">Backup</h2>
      <p>Baixe um arquivo com todas as suas visitas, prós, contras e anotações, ou restaure um backup.</p>
      <div class="acoes">
        <button class="btn" data-acao="exportar">Baixar backup</button>
        <label class="btn" style="cursor:pointer">Restaurar backup<input id="in-import" type="file" accept="application/json,.json" hidden></label>
        <button class="btn ghost" data-fechar>Fechar</button>
      </div></div>`;
    d.showModal();
    atualizarSync();
  }
  async function salvarChave() {
    const v = $('#in-chave').value.trim();
    if (!v) return;
    try {
      const r = await fetch(`${API}/verificar`, { headers: { 'X-Chave': v } });
      if (r.status === 401) { toast('Chave incorreta.'); return; }
      if (!r.ok) throw new Error(r.status);
    } catch { toast('Não consegui falar com a nuvem agora. Entrei mesmo assim; sincronizo quando a conexão voltar.'); }
    S.chave = v; lsSet(LS.chave, v);
    Object.keys(S.visitas).forEach((id) => S.pendentes.add(id));
    lsSet(LS.pendentes, [...S.pendentes]);
    toast('Pronto! Sincronizando com a nuvem…');
    $('#config').close();
    sincronizar();
    Object.keys(S.eventos).forEach((id) => S.evPend.add(id));
    lsSet(LS.evPend, [...S.evPend]);
    carregarEventos().then(() => { sincronizarEventos(); renderTudo(); });
  }
  function exportar() {
    const blob = new Blob([JSON.stringify({ exportado_em: new Date().toISOString(), visitas: S.visitas }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `visitas-locais-palmas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  async function importar(file) {
    try {
      const j = JSON.parse(await file.text());
      const vs = j.visitas || j;
      let n = 0;
      for (const [id, dados] of Object.entries(vs)) {
        if (!S.porId[id] || typeof dados !== 'object') continue;
        const atual = S.visitas[id];
        if (!atual || (atual.atualizado_em || '') <= (dados.atualizado_em || '')) {
          S.visitas[id] = Object.assign(vazia(), dados);
          if (API) S.pendentes.add(id);
          n++;
        }
      }
      lsSet(LS.visitas, S.visitas); lsSet(LS.pendentes, [...S.pendentes]);
      toast(`${n} ${n === 1 ? 'registro restaurado' : 'registros restaurados'}.`);
      renderTudo(); sincronizar();
    } catch { toast('Arquivo de backup inválido.'); }
  }


  /* ============ Cadastrar / editar local ============ */
  const SITUACOES = ['Informado pelo local', 'Conferido em visita', 'Perfil oficial no Instagram', 'Dados de diretório', 'Dados mínimos', 'Pode estar desatualizado'];
  const EVENTOS_BASE = ['Aniversário', 'Aniversário infantil', 'Casamento', 'Confraternização', 'Formatura', 'Corporativo', 'Chá revelação', 'Batizado', 'Retiro'];
  let ED = null; // { id, sujo }

  const slug = (t) => norm(t).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'local';
  function idNovo(nome) {
    const base = slug(nome);
    let id = base, n = 2;
    while (S.porId[id] || S.base.some((l) => l.id === id) || S.fbase.some((l) => l.id === id) || S.remotos.some((r) => r.id === id)) id = `${base}-${n++}`;
    return id;
  }
  // "R$ 1.500", "1500,00" -> 1500. Texto como "Sob consulta" fica como texto.
  function parseValor(v) {
    const t = String(v || '').trim();
    if (!t) return null;
    const m = t.replace(/^R\$\s*/i, '');
    if (/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(m)) return Number(m.replace(/\./g, '').replace(',', '.'));
    return t;
  }
  const valorTxt = (v) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v || '');
  const val = (r, k) => (r.querySelector(`[data-k="${k}"]`)?.value || '').trim();
  const linhas = (txt) => String(txt || '').split('\n').map((x) => x.trim()).filter(Boolean);

  const REP = {
    precos: { rot: 'valor', campos: [['valor', 'Valor', 'R$ 1.500 ou Sob consulta'], ['unidade', 'Por', 'escolha ou escreva'], ['condicao', 'Condição', 'sexta a domingo, até 100 pessoas'], ['inclui', 'O que esse valor inclui', 'mesas, limpeza…']] },
    taxas: { rot: 'taxa', campos: [['nome', 'Taxa', 'limpeza, caução, energia'], ['valor', 'Valor', 'R$ 150']] },
    horarios: { rot: 'horário', campos: [['dias', 'Dias', 'sábado'], ['horario', 'Horário', '8h às 2h']] },
    objetos: { rot: 'item', campos: [['nome', 'Nome', 'ex.: Pula-pula 3 x 3 m'], ['tipo', 'Tipo', 'escolha ou escreva'], ['valor', 'Valor', 'R$ 250 ou Sob consulta'],
      ['unidade', 'Por', 'por evento'], ['qtd', 'Quantos tem', 'ex.: 2'], ['duracao', 'Tempo de uso', 'ex.: 4 horas'], ['obs', 'Observação', 'idade, tamanho, monitor, energia…']] },
  };
  function linhaRep(tipo, d = {}) {
    return `<div class="rep-linha rep-${tipo}">
      ${REP[tipo].campos.map(([k, rot, ph]) => `<label class="campo c-${k}"><span>${rot}</span><input data-k="${k}" ${k === 'unidade' ? 'list="dl-unidades"' : tipo === 'objetos' && k === 'tipo' ? 'list="dl-subtipos"' : ''} value="${esc(k === 'valor' ? valorTxt(d[k]) : d[k] || '')}" placeholder="${esc(ph)}"></label>`).join('')}
      <button type="button" class="tirar-linha" data-tirar-linha aria-label="Remover ${REP[tipo].rot}">×</button>
    </div>`;
  }
  function blocoRep(tipo, titulo, ajuda, itens) {
    return `<fieldset class="ed-bloco"><legend>${titulo}</legend>${ajuda ? `<p class="ajuda">${ajuda}</p>` : ''}
      <div class="rep" data-rep="${tipo}">${(itens.length ? itens : [{}]).map((d) => linhaRep(tipo, d)).join('')}</div>
      <button type="button" class="btn ghost add-linha" data-acao="add-linha" data-rep="${tipo}">${ic('mais')}Adicionar ${REP[tipo].rot}</button>
    </fieldset>`;
  }

  function campoDet(k, rot, tipo, x, v) {
    const val = esc(v ?? '');
    if (tipo === 'area') return `<label class="campo largo"><span>${esc(rot)}</span><textarea data-det="${k}" rows="3" placeholder="${esc(x || '')}">${val}</textarea></label>`;
    if (tipo === 'sel') return `<label class="campo"><span>${esc(rot)}</span><select data-det="${k}"><option value="">Não informado</option>${x.map((o) => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
    if (tipo === 'num') return `<label class="campo"><span>${esc(rot)}</span><input data-det="${k}" type="number" min="0" inputmode="numeric" value="${val}"></label>`;
    if (tipo === 'url') return `<label class="campo largo"><span>${esc(rot)}</span><input data-det="${k}" type="url" placeholder="https://" value="${val}"></label>`;
    return `<label class="campo"><span>${esc(rot)}</span><input data-det="${k}" maxlength="300" placeholder="${esc(x || '')}" value="${val}"></label>`;
  }

  function abrirEditor(id, catNovo) {
    const l = id ? S.porId[id] : null;
    if (id && !l) return;
    const cat = l ? l.cat || 'espacos' : (CATS[catNovo] ? catNovo : CATS[S.secao] ? S.secao : 'espacos');
    const C = CATS[cat];
    const esp = cat === 'espacos';
    ED = { id: l ? l.id : null, cat, sujo: false };
    if ($('#detalhe').open) $('#detalhe').close();
    limparHash();
    const it = (l && l.itens) || {};
    const det = (l && l.detalhes) || {};
    const eventosTodos = [...new Set([...EVENTOS_BASE, ...S.locais.flatMap((x) => x.eventos || [])])];
    const evSel = new Set((l && l.eventos) || []);
    const subSel = new Set((l && l.subtipos) || []);
    const subExtra = [...subSel].filter((x) => !(C.subtipos || []).includes(x));
    const mapaTxt = l ? (l.mapa || (l.coordenadas ? `${l.coordenadas.lat}, ${l.coordenadas.lng}` : '')) : '';
    const situ = [...new Set([...SITUACOES, ...(l && l.status ? [l.status] : [])])];
    const basico = esp ? `
          <div class="grade-2">
            <label class="campo largo"><span>Nome do local *</span><input name="nome" required maxlength="120" value="${esc(l?.nome || '')}" placeholder="ex.: Chácara Recanto do Sol"></label>
            <label class="campo"><span>Tipo</span><input name="tipo" list="dl-tipos" maxlength="60" value="${esc(l?.tipo || '')}" placeholder="Salão de festas, Chácara…"></label>
            <label class="campo"><span>Capacidade (pessoas)</span><input name="capacidade" type="number" inputmode="numeric" min="1" max="100000" value="${esc(l?.capacidade ?? '')}" placeholder="ex.: 150"></label>
            <label class="campo"><span>Bairro / quadra</span><input name="bairro" maxlength="120" value="${esc(l?.bairro || '')}" placeholder="ex.: 403 Sul"></label>
            <label class="campo"><span>Endereço</span><input name="endereco" maxlength="300" value="${esc(l?.endereco || '')}"></label>
            <label class="campo largo"><span>Localização no mapa</span><input name="mapa" maxlength="500" value="${esc(mapaTxt)}" placeholder="Cole o link do Google Maps ou as coordenadas (-10.18, -48.33)"></label>
          </div>
          <datalist id="dl-tipos">${[...new Set(['Salão de festas', 'Chácara', 'Espaço com piscina', 'Espaço de eventos', 'Restaurante', ...S.locais.filter(ehEspaco).map((x) => x.tipo)])].filter(Boolean).map((t) => `<option value="${esc(t)}">`).join('')}</datalist>`
      : `
          <div class="grade-2">
            <label class="campo largo"><span>Nome *</span><input name="nome" required maxlength="120" value="${esc(l?.nome || '')}" placeholder="ex.: ${esc(C.exemplo)}"></label>
            <label class="campo largo"><span>Descrição curta</span><textarea name="descricao" rows="2" maxlength="600" placeholder="O que oferece, diferenciais, estilo">${esc(l?.descricao || '')}</textarea></label>
            <label class="campo"><span>Atende em</span><input name="atende_em" maxlength="200" value="${esc(l?.atende_em || '')}" placeholder="Palmas e região"></label>
            <label class="campo"><span>Endereço / loja (se tiver)</span><input name="endereco" maxlength="300" value="${esc(l?.endereco || '')}"></label>
          </div>
          <h4 class="sub-h">O que oferece</h4>
          <div class="pills">${C.subtipos.map((t) => `<label class="pill"><input type="checkbox" data-subtipo="${esc(t)}" ${subSel.has(t) ? 'checked' : ''}><span>${ic('check')}${esc(t)}</span></label>`).join('')}</div>
          <label class="campo" style="margin-top:10px"><span>Outro tipo (separe por vírgula)</span><input name="subtipos_extra" maxlength="200" value="${esc(subExtra.join(', '))}"></label>`;
    const d = $('#editor');
    d.innerHTML = `<form id="form-editor" novalidate>
      <div class="folha-topo">
        <button type="button" class="fechar" data-acao="cancelar-editor" aria-label="Fechar">${ic('voltar')}</button>
        <h2>${l ? `Editar: ${esc(l.nome)}` : `Cadastrar em ${esc(C.rot)}`}</h2>
      </div>
      <div class="folha-corpo">
        ${!API ? '<p class="nota-aviso">A nuvem não está configurada, então não dá para salvar cadastros por aqui.</p>'
          : !S.chave ? '<p class="nota-aviso">Para salvar você vai precisar da chave de edição. Pode preencher agora e informar a chave na hora de salvar.</p>' : ''}

        <fieldset class="ed-bloco"><legend>Básico</legend>${basico}</fieldset>

        <fieldset class="ed-bloco"><legend>${esp ? 'O que vem no aluguel' : 'O que está incluso no preço'}</legend>
          <p class="ajuda">Marque o que está no valor. Itens com campo aceitam quantidade.</p>
          <div class="pills">${C.inclusos.map(([k, rot, tipo]) => {
            const v = it[k];
            return `<label class="pill${tipo === 'num' ? ' com-qtd' : ''}"><input type="checkbox" data-item="${k}" ${v ? 'checked' : ''}><span>${ic('check')}${esc(rot)}</span>${tipo === 'num'
              ? `<input type="number" class="qtd" data-qtd="${k}" min="1" max="100000" inputmode="numeric" placeholder="qtd" aria-label="Quantidade de ${esc(rot.toLowerCase())}" value="${typeof v === 'number' ? v : ''}">` : ''}</label>`;
          }).join('')}</div>
          <label class="campo" style="margin-top:12px"><span>Outros itens e detalhes (um por linha)</span><textarea name="comodidades" rows="3" placeholder="${esp ? 'ex.: 2 piscinas (adulto e infantil)&#10;Decoração não inclusa' : 'ex.: 2 tipos de massa à escolha&#10;Não inclui bebida alcoólica'}">${esc(((l && l.comodidades) || []).join('\n'))}</textarea></label>
        </fieldset>

        ${esp ? '' : `<fieldset class="ed-bloco"><legend>Detalhes de ${esc(C.curto.toLowerCase())}</legend>
          <div class="grade-2">${C.campos.map(([k, rot, tipo, x]) => campoDet(k, rot, tipo, x, det[k])).join('')}</div>
        </fieldset>`}

        ${C.porObjeto ? blocoRep('objetos', esc(C.porObjeto.rot), `Um por ${esc(C.porObjeto.um)}, com o valor de cada um. Assim dá para filtrar e comparar por ${esc(C.porObjeto.um)} no catálogo.`, (l && l.objetos) || [])
          .replace(/Adicionar item/, `Adicionar ${esc(C.porObjeto.um)}`) : ''}
        ${C.porObjeto ? `<datalist id="dl-subtipos">${C.subtipos.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>` : ''}
        ${blocoRep('precos', C.porObjeto ? 'Pacotes e outros valores' : 'Valores', C.porObjeto ? 'Combos ou valores que valem para a empresa toda (ex.: 3 brinquedos por R$ 600).' : 'Cada valor com a sua condição: dia, horário, número de convidados, pacote.', (l && l.precos) || [])}
        <datalist id="dl-unidades">${C.unidades.map((u) => `<option value="${esc(u)}">`).join('')}</datalist>
        ${blocoRep('taxas', 'Taxas extras', esp ? 'Cobranças à parte, como limpeza, caução ou energia.' : 'Frete, deslocamento, hora extra, profissional adicional.', (l && l.taxas) || [])}
        <fieldset class="ed-bloco"><legend>Pagamento, reserva e cancelamento</legend>
          <label class="campo"><span>Condições de pagamento</span><textarea name="pagamento" rows="2" maxlength="600" placeholder="ex.: 50% para reservar, resto até 7 dias antes; Pix ou cartão">${esc(l?.pagamento || '')}</textarea></label>
          <div class="grade-2" style="margin-top:10px">
            <label class="campo"><span>Reservar com quanto tempo</span><input name="antecedencia" maxlength="200" value="${esc(l?.antecedencia || '')}" placeholder="ex.: 30 dias antes"></label>
            <label class="campo"><span>Cancelamento ou adiamento</span><input name="cancelamento" maxlength="300" value="${esc(l?.cancelamento || '')}" placeholder="ex.: perde o sinal; remarca 1 vez sem custo"></label>
          </div>
        </fieldset>
        ${esp ? blocoRep('horarios', 'Horários de uso', '', (l && l.horarios) || []) : ''}

        <fieldset class="ed-bloco"><legend>Contato</legend>
          <div class="grade-2">
            <label class="campo"><span>WhatsApp</span><input name="whatsapp" inputmode="tel" maxlength="30" value="${esc(l?.whatsapp || '')}" placeholder="(63) 9 9999-9999"></label>
            <label class="campo"><span>Telefone</span><input name="telefone" inputmode="tel" maxlength="30" value="${esc(l?.telefone || '')}"></label>
            <label class="campo"><span>Instagram</span><input name="instagram" maxlength="100" value="${esc(l?.instagram || '')}" placeholder="@perfil"></label>
            <label class="campo"><span>Site</span><input name="site" type="url" maxlength="300" value="${esc(l?.site || '')}" placeholder="https://"></label>
          </div>
        </fieldset>

        <fieldset class="ed-bloco"><legend>Bom para</legend>
          <div class="pills">${eventosTodos.map((ev) => `<label class="pill"><input type="checkbox" data-evento="${esc(ev)}" ${evSel.has(ev) ? 'checked' : ''}><span>${ic('check')}${esc(ev)}</span></label>`).join('')}</div>
          <label class="campo" style="margin-top:12px"><span>Outros tipos de evento (separe por vírgula)</span><input name="eventos_extra" maxlength="200"></label>
        </fieldset>

        <fieldset class="ed-bloco"><legend>Fotos e observações</legend>
          <label class="campo"><span>Links das fotos (um por linha)</span><textarea name="fotos" rows="3" placeholder="https://…">${esc(((l && l.fotos) || []).map((f) => f.url || f).join('\n'))}</textarea></label>
          <label class="campo" style="margin-top:10px"><span>Observações</span><textarea name="observacoes" rows="4" maxlength="3000" placeholder="Regras, restrições, o que não está incluso, pontos de atenção…">${esc(l?.observacoes || '')}</textarea></label>
        </fieldset>

        <fieldset class="ed-bloco"><legend>Origem dos dados</legend>
          <div class="grade-2">
            <label class="campo"><span>Situação</span><select name="status">${situ.map((x) => `<option ${x === (l?.status || 'Informado pelo local') ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
            <label class="campo"><span>Fontes (uma por linha)</span><textarea name="fontes" rows="2" placeholder="Conversa no WhatsApp, link do anúncio…">${esc(((l && l.fontes) || []).join('\n'))}</textarea></label>
          </div>
        </fieldset>
      </div>
      <div class="ed-rodape">
        ${l ? `<button type="button" class="btn ghost perigo" data-acao="remover-local">${ic('lixo')}<span class="lbl">Excluir</span></button>` : ''}
        <span class="espaco"></span>
        <button type="button" class="btn" data-acao="cancelar-editor">Cancelar</button>
        <button type="submit" class="btn primario" id="btn-salvar-local">Salvar</button>
      </div>
    </form>`;
    if (!d.open) d.showModal();
    d.scrollTop = 0;
    if (!l) setTimeout(() => d.querySelector('[name="nome"]').focus(), 50);
  }

  function lerEditor() {
    const f = $('#form-editor');
    const g = (n) => (f.elements[n]?.value || '').trim();
    const base = ED.id ? S.porId[ED.id] : {};
    const esp = ED.cat === 'espacos';
    const itens = {};
    f.querySelectorAll('[data-item]').forEach((c) => {
      if (!c.checked) return;
      const q = f.querySelector(`[data-qtd="${c.dataset.item}"]`);
      const n = q ? parseInt(q.value, 10) : NaN;
      itens[c.dataset.item] = n > 0 ? n : true;
    });
    const rep = (tipo, fn) => [...f.querySelectorAll(`[data-rep="${tipo}"] .rep-linha`)].map(fn).filter(Boolean);
    const precos = rep('precos', (r) => {
      const p = { valor: parseValor(val(r, 'valor')), unidade: val(r, 'unidade') || null, condicao: val(r, 'condicao') || null, inclui: val(r, 'inclui') || null };
      return p.valor != null || p.condicao ? p : null;
    });
    const taxas = rep('taxas', (r) => (val(r, 'nome') ? { nome: val(r, 'nome'), valor: parseValor(val(r, 'valor')) } : null));
    const eventos = [...f.querySelectorAll('[data-evento]:checked')].map((c) => c.dataset.evento);
    g('eventos_extra').split(',').map((x) => x.trim()).filter(Boolean).forEach((x) => { if (!eventos.includes(x)) eventos.push(x); });
    const fotoMeta = Object.fromEntries((base.fotos || []).map((x) => [x.url || x, x]));
    const comum = {
      cat: ED.cat,
      nome: g('nome'),
      endereco: g('endereco') || null,
      precos, taxas,
      pagamento: g('pagamento') || null,
      antecedencia: g('antecedencia') || null,
      cancelamento: g('cancelamento') || null,
      itens,
      comodidades: linhas(g('comodidades')),
      eventos,
      instagram: g('instagram') || null,
      whatsapp: g('whatsapp') || null,
      telefone: g('telefone') || null,
      site: urlSegura(g('site')) ? g('site') : null,
      fotos: linhas(g('fotos')).filter((u) => urlSegura(u)).map((u) => {
        const m = fotoMeta[u] || {};
        return m.credito ? { url: u, legenda: m.legenda || null, credito: m.credito } : { url: u, legenda: m.legenda || null };
      }),
      observacoes: g('observacoes') || null,
      fontes: linhas(g('fontes')),
      conferido_em: new Date().toISOString().slice(0, 10),
      status: g('status') || null,
    };
    if (esp) {
      const mapa = g('mapa');
      const coord = mapa.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
      const cap = parseInt(g('capacidade'), 10);
      return {
        ...comum,
        tipo: g('tipo') || 'Espaço de eventos',
        bairro: g('bairro') || null,
        coordenadas: coord ? { lat: Number(coord[1]), lng: Number(coord[2]) } : null,
        mapa: /^https?:\/\//i.test(mapa) ? mapa : null,
        capacidade: cap > 0 ? cap : null,
        horarios: rep('horarios', (r) => (val(r, 'dias') || val(r, 'horario') ? { dias: val(r, 'dias'), horario: val(r, 'horario') } : null)),
      };
    }
    const subtipos = [...f.querySelectorAll('[data-subtipo]:checked')].map((c) => c.dataset.subtipo);
    g('subtipos_extra').split(',').map((x) => x.trim()).filter(Boolean).forEach((x) => { if (!subtipos.includes(x)) subtipos.push(x); });
    const detalhes = {};
    f.querySelectorAll('[data-det]').forEach((e) => {
      const v = e.value.trim();
      if (!v) return;
      if (e.type === 'number') { const n = Number(v); if (Number.isFinite(n)) detalhes[e.dataset.det] = n; } else detalhes[e.dataset.det] = v;
    });
    const objetos = CATS[ED.cat].porObjeto ? rep('objetos', (r) => {
      const o = { nome: val(r, 'nome'), tipo: val(r, 'tipo') || null, valor: parseValor(val(r, 'valor')), unidade: val(r, 'unidade') || null,
        qtd: parseInt(val(r, 'qtd'), 10) > 0 ? parseInt(val(r, 'qtd'), 10) : null, duracao: val(r, 'duracao') || null, obs: val(r, 'obs') || null };
      return o.nome || o.tipo ? o : null;
    }) : undefined;
    return { ...comum, subtipos, descricao: g('descricao') || null, atende_em: g('atende_em') || null, detalhes, ...(objetos ? { objetos } : {}) };
  }

  const colDe = (dados) => (dados.cat && dados.cat !== 'espacos' ? 'fornecedores' : 'locais');
  async function gravarLocal(id, dados) {
    const col = colDe(dados);
    if (!API) { toast('A nuvem não está configurada.'); return null; }
    if (!S.chave) { toast('Informe a chave de edição para salvar.'); abrirConfig(); return null; }
    const em = new Date().toISOString();
    try {
      const r = await fetch(`${API}/dados/${col}/${encodeURIComponent(id)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Chave': S.chave }, body: JSON.stringify({ ...dados, atualizado_em: em }),
      });
      if (r.status === 401) { toast('Chave de edição incorreta.'); abrirConfig(); return null; }
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      S.remotos = S.remotos.filter((x) => x.id !== id).concat({ col, id, dados: j.item, atualizado_em: j.atualizado_em });
      lsSet(LS.catalogo, S.remotos);
      montarLocais(); renderOpcoes(); renderTudo();
      return j.item;
    } catch {
      toast('Não consegui salvar agora. Confira a internet e tente de novo.');
      return null;
    }
  }

  async function salvarEditor() {
    const f = $('#form-editor');
    const nome = f.elements.nome;
    if (!nome.value.trim()) { nome.focus(); nome.setCustomValidity('Informe o nome do local'); nome.reportValidity(); return; }
    nome.setCustomValidity('');
    const dados = lerEditor();
    const id = ED.id || idNovo(dados.nome);
    const b = $('#btn-salvar-local'); b.disabled = true; b.textContent = 'Salvando…';
    const ok = await gravarLocal(id, dados);
    b.disabled = false; b.textContent = 'Salvar';
    if (!ok) return;
    const novo = !ED.id;
    const addEv = ED.addEv;
    ED.sujo = false; $('#editor').close();
    toast(novo ? 'Cadastrado.' : 'Alterações salvas.');
    if (novo && addEv && S.eventos[addEv]) { addEscolha(addEv, id); return; }
    abrirDetalhe(id);
  }

  async function removerLocal() {
    const l = S.porId[ED.id];
    if (!l || !confirm(`Excluir "${l.nome}"? Ele deixa de aparecer para todo mundo.`)) return;
    const { _busca, _nuvem, ...resto } = l;
    const ok = await gravarLocal(l.id, { ...resto, removido: true });
    if (!ok) return;
    ED.sujo = false; $('#editor').close();
    toast('Excluído da lista.');
  }

  function fecharEditor() {
    if (ED && ED.sujo && !confirm('Descartar as alterações que você fez?')) return;
    const volta = ED && ED.tipo !== 'evento' && ED.id;
    if (ED) ED.sujo = false;
    $('#editor').close();
    if (volta && S.porId[volta]) abrirDetalhe(volta); // volta para onde estava
  }
  function limparHash() {
    if (location.hash.startsWith('#local/')) history.replaceState(null, '', hashBase());
  }

  /* ============ Toast ============ */
  let tt;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2800);
  }

  /* ============ Eventos ============ */
  function renderTudo() {
    document.body.dataset.modo = S.paginaEv ? 'pagina' : S.secao === 'eventos' ? 'eventos' : 'catalogo';
    if (CATS[S.secao]) S.ultCat = S.secao;
    renderSecoes();
    renderNav();
    if (S.paginaEv) renderPagina();
    else {
      renderNumeros();
      if (S.secao === 'eventos') renderEventos();
      else { renderAbas(); renderRapidos(); renderLista(); }
    }
    if ($('#detalhe').open && S.porId[S.detalheId]) renderDetalhe();
    const bn = $('#btn-novo');
    if (bn && CATS[S.secao]) { const r = `Cadastrar em ${CATS[S.secao].rot}`; bn.title = r; bn.setAttribute('aria-label', r); }
  }

  function ligarFiltros() {
    const campos = { busca: '#f-busca', tipo: '#f-tipo', evento: '#f-evento', cap: '#f-cap', preco: '#f-preco', ordem: '#f-ordem' };
    for (const [k, sel] of Object.entries(campos)) {
      const e = $(sel);
      e.value = S.f[k];
      e.addEventListener('input', () => {
        S.f[k] = e.value;
        if (k === 'ordem') { if (e.value !== 'perto') { ui.ordem = e.value; lsSet(LS.ui, ui); } if (e.value === 'perto' && !GEO.pos) pedirLocal(); }
        renderLista();
      });
    }
    $('#btn-filtros').addEventListener('click', () => filtrosAbertos(!$('#painel-filtros').classList.contains('aberto')));
    $('#btn-config').addEventListener('click', abrirConfig);
    $('#btn-perto').addEventListener('click', () => { S.f.ordem = 'perto'; $('#f-ordem').value = 'perto'; if (!GEO.pos) pedirLocal(); else renderLista(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#painel-filtros').classList.contains('aberto')) filtrosAbertos(false); });
    let eraCel = ehCelular();
    matchMedia('(max-width: 760px)').addEventListener('change', () => {
      if (ehCelular() !== eraCel) { eraCel = ehCelular(); if (!S.paginaEv && CATS[S.secao]) renderLista(); }
      if (!ehCelular()) filtrosAbertos(false);
    });
  }

  function filtrosAbertos(abrir) {
    const p = $('#painel-filtros');
    p.classList.toggle('aberto', abrir);
    document.body.classList.toggle('travado', abrir && ehCelular());
    $('#btn-filtros').setAttribute('aria-expanded', abrir);
    if (abrir && ehCelular()) p.querySelector('.fechar').focus();
    else if (!abrir && p.contains(document.activeElement)) $('#btn-filtros').focus();
  }
  function irPagina(p) {
    if (p === 'mais') { S.pag++; renderLista(); return; }
    S.pag = Number(p); renderLista();
    const alvo = $('#barra').getBoundingClientRect().top + window.scrollY - 8;
    if (window.scrollY > alvo) window.scrollTo({ top: alvo });
    $('#lista').focus({ preventScroll: true });
  }
  function alternarCmp(id) {
    if (S.cmp.has(id)) S.cmp.delete(id);
    else {
      if (S.cmp.size >= MAX_CMP) { toast(`Compare até ${MAX_CMP} por vez.`); return; }
      S.cmp.add(id);
    }
    const on = S.cmp.has(id);
    document.querySelectorAll(`button[data-cmp="${id}"]`).forEach((x) => {
      x.setAttribute('aria-pressed', on);
      x.innerHTML = `${ic('comparar')}${on ? 'Comparando' : 'Comparar'}`;
      x.closest('.card')?.classList.toggle('comparando', on);
    });
    renderBarraComparar();
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    let b;
    if ((b = t.closest('[data-aba]'))) { S.aba = b.dataset.aba; renderAbas(); renderLista(); renderNav(); return; }
    if ((b = t.closest('[data-pag]'))) { irPagina(b.dataset.pag); return; }
    if ((b = t.closest('[data-visao]'))) { S.visao[S.secao] = b.dataset.visao; ui.visao = S.visao; lsSet(LS.ui, ui); renderLista(); return; }
    if ((b = t.closest('[data-orc-f]'))) {
      S.orcF = b.dataset.orcF; $('#orc-lista').className = 'orc-f-' + S.orcF;
      document.querySelectorAll('[data-orc-f]').forEach((x) => x.setAttribute('aria-pressed', x === b)); return;
    }
    if ((b = t.closest('button[data-cmp]'))) { alternarCmp(b.dataset.cmp); return; }
    if ((b = t.closest('[data-remover]'))) {
      const k = b.dataset.remover;
      if (k === 'tudo') { Object.assign(S.f, { busca: '', tipo: '', evento: '', cap: '', preco: '' }); S.f.rapidos.clear(); }
      else if (k.startsWith('r:')) S.f.rapidos.delete(k.slice(2));
      else S.f[k] = '';
      ['busca', 'tipo', 'evento', 'cap', 'preco'].forEach((c) => { $('#f-' + c).value = S.f[c]; });
      renderRapidos(); renderLista(); return;
    }
    if ((b = t.closest('[data-fav]'))) {
      const id = b.dataset.fav; const fav = !visita(id).favorito;
      if (salvarVisita(id, { favorito: fav }) === false) return;
      document.querySelectorAll(`[data-fav="${id}"]`).forEach((x) => x.setAttribute('aria-pressed', fav));
      toast(fav ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
      return;
    }
    if ((b = t.closest('[data-abrir]'))) {
      e.preventDefault();
      if ($('#comparar').open) $('#comparar').close();
      abrirDetalhe(b.dataset.abrir); return;
    }
    if ((b = t.closest('[data-daba]'))) { S.detalheAba = b.dataset.daba; renderDetalhe(); return; }
    if ((b = t.closest('[data-status]'))) {
      const st = b.dataset.status;
      const patch = { status: st };
      if (st === 'visitado' && !visita(S.detalheId).data) patch.data = new Date().toISOString().slice(0, 10);
      salvarVisita(S.detalheId, patch); renderPainelVisita(); return;
    }
    if ((b = t.closest('[data-nota]'))) {
      const n = Number(b.dataset.nota);
      salvarVisita(S.detalheId, { nota: visita(S.detalheId).nota === n ? 0 : n }); renderPainelVisita(); return;
    }
    if ((b = t.closest('[data-crit]'))) {
      const [k, n] = b.dataset.crit.split(':');
      const c = Object.assign({}, visita(S.detalheId).criterios);
      c[k] = c[k] === Number(n) ? 0 : Number(n);
      salvarVisita(S.detalheId, { criterios: c }); renderPainelVisita(); return;
    }
    if ((b = t.closest('[data-tirar]'))) {
      const [tipo, i] = b.dataset.tirar.split(':');
      const arr = visita(S.detalheId)[tipo].slice(); arr.splice(Number(i), 1);
      salvarVisita(S.detalheId, { [tipo]: arr }); renderPainelVisita(); return;
    }
    if ((b = t.closest('[data-editar]'))) { abrirEditor(b.dataset.editar); return; }
    if ((b = t.closest('[data-add-evento]'))) { if (!precisaChave()) abrirPickerEvento(b.dataset.addEvento); return; }
    if ((b = t.closest('[data-picker]'))) { abrirPicker(b.dataset.picker); return; }
    if ((b = t.closest('[data-pick]'))) {
      if (addEscolha(S.paginaEv, b.dataset.pick)) { toast('Adicionado ao evento.'); $('#pick-lista').innerHTML = listaPick(); }
      return;
    }
    if ((b = t.closest('[data-pick-ev]'))) {
      const evId = b.dataset.pickEv;
      if (addEscolha(evId, PK.itemId)) {
        $('#picker').close();
        if ($('#detalhe').open) $('#detalhe').close();
        toast('Adicionado ao evento.');
        location.hash = `#evento/${evId}`;
      }
      return;
    }
    if ((b = t.closest('[data-esc-melhor]'))) {
      const ev = evAtual(); const e = ev.escolhas[Number(b.dataset.escMelhor)];
      if (e) { e.status = fechado(e.status) ? 'opcao' : 'escolhido'; salvarEvento(ev); }
      return;
    }
    if ((b = t.closest('[data-esc-tirar]'))) {
      const ev = evAtual(); const i = Number(b.dataset.escTirar);
      const nome = (S.porId[ev.escolhas[i]?.id] || ev.escolhas[i] || {}).nome;
      if (ev.escolhas[i] && confirm(`Tirar ${nome || 'esta opção'} do evento?`)) { ev.escolhas.splice(i, 1); salvarEvento(ev); }
      return;
    }
    if ((b = t.closest('[data-ev-add]'))) {
      const ev = evAtual(); const lista = b.dataset.evAdd;
      ev[lista].push(LINHA_VAZIA[lista]());
      salvarEvento(ev);
      const ult = document.querySelector(`[data-evc^="${lista}.${ev[lista].length - 1}."]:not([type="checkbox"]):not([type="date"]):not([type="time"])`)
        || document.querySelector(`[data-evc^="${lista}.${ev[lista].length - 1}."]`);
      if (ult) ult.focus();
      return;
    }
    if ((b = t.closest('[data-gasto-st]'))) {
      const ev = evAtual(); const g = ev.gastos[Number(b.dataset.gastoSt)];
      if (g) {
        g.status = g.status === 'aprovado' ? 'rascunho' : 'aprovado';
        if (g.status === 'rascunho') g.pago = false;
        salvarEvento(ev);
        toast(g.status === 'aprovado' ? `${g.descricao || 'Item'} aprovado: entrou no combinado.` : `${g.descricao || 'Item'} voltou para rascunho.`);
      }
      return;
    }
    if ((b = t.closest('[data-ev-tirar]'))) {
      const ev = evAtual(); const [lista, i] = b.dataset.evTirar.split(':');
      ev[lista].splice(Number(i), 1); salvarEvento(ev);
      return;
    }
    if ((b = t.closest('[data-tirar-linha]'))) {
      const rep = b.closest('.rep'); const linha = b.closest('.rep-linha');
      if (rep.children.length > 1) linha.remove(); else linha.querySelectorAll('input').forEach((i) => { i.value = ''; });
      ED.sujo = true; return;
    }
    if ((b = t.closest('[data-acao]'))) {
      const a = b.dataset.acao;
      if (a === 'novo-local') { if (S.secao === 'eventos') abrirEditorEvento(null); else abrirEditor(null, S.secao); }
      if (a === 'novo-evento') { if (!precisaChave()) abrirEditorEvento(null); }
      if (a === 'editar-evento') abrirEditorEvento(S.paginaEv);
      if (a === 'remover-evento') removerEvento();
      if (a === 'imprimir') window.print();
      if (a === 'ev-sugerir') sugerirTarefas();
      if (a === 'ev-sugerir-itens') sugerirItens();
      if (a === 'pick-cadastrar') { const cat = PK.cat; $('#picker').close(); abrirEditor(null, cat); ED.addEv = S.paginaEv; }
      if (a === 'pick-novo-evento') { const it = PK.itemId; $('#picker').close(); abrirEditorEvento(null); ED.addItem = it; }
      if (a === 'cancelar-editor') fecharEditor();
      if (a === 'remover-local') removerLocal();
      if (a === 'add-linha') {
        const rep = $(`#editor [data-rep="${b.dataset.rep}"]`);
        rep.insertAdjacentHTML('beforeend', linhaRep(b.dataset.rep));
        rep.lastElementChild.querySelector('input').focus();
      }
      if (a === 'abrir-comparar') {
        if (S.cmp.size < 2) { toast(S.cmp.size ? 'Escolha mais um para comparar.' : 'Toque em “Comparar” nos cartões para escolher até 4.'); return; }
        abrirComparar();
      }
      if (a === 'fechar-filtros') filtrosAbertos(false);
      if (a === 'ver-favoritos') {
        const alvo = CATS[S.secao] && !S.paginaEv ? S.secao : S.ultCat;
        S.aba = 'favoritos'; S.abaDepois = 'favoritos';
        if (location.hash !== '#' + alvo) location.hash = alvo;
        else { S.abaDepois = null; renderAbas(); renderLista(); renderNav(); }
        window.scrollTo({ top: 0 });
      }
      if (a === 'limpar-comparar') { S.cmp.clear(); renderLista(); }
      if (a === 'salvar-chave') salvarChave();
      if (a === 'usar-local') pedirLocal();
      if (a === 'abrir-config') abrirConfig();
      if (a === 'esquecer-chave') { S.chave = ''; lsSet(LS.chave, ''); toast('Você saiu. Para salvar de novo, entre com a chave.'); $('#config').close(); atualizarSync(); }
      if (a === 'exportar') exportar();
      return;
    }
    if (t.closest('[data-fechar]')) { t.closest('dialog').close(); return; }
    if (t.tagName === 'DIALOG') { // clique no fundo escuro, fora da caixa
      const r = t.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) (t.id === 'editor' ? fecharEditor() : t.close());
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-rapido]')) {
      const k = t.dataset.rapido; t.checked ? S.f.rapidos.add(k) : S.f.rapidos.delete(k);
      renderLista(); return;
    }
    if (t.id === 'f-porpag') { S.porPag = Number(t.value) || 12; ui.porPag = S.porPag; lsSet(LS.ui, ui); renderLista(); return; }
    if (t.id === 'in-import' && t.files[0]) importar(t.files[0]);
    if (t.matches('[data-evc]') && S.paginaEv) {
      const ev = evAtual();
      const tp = t.dataset.tipo;
      let v = tp === 'bool' ? t.checked : t.value.trim();
      if (tp === 'num') {
        v = numDe(v);
        if (v == null && t.value.trim()) { toast('Não entendi o valor. Use números, ex.: 1.500'); t.value = ''; }
      }
      setCaminho(ev, t.dataset.evc, v);
      // Mudar a categoria muda o agrupamento do orçamento: redesenha a página.
      const estrutura = t.tagName === 'SELECT' || tp === 'bool' || /^gastos\.\d+\.categoria$/.test(t.dataset.evc);
      salvarEvento(ev, { render: estrutura });
      if (!estrutura) {
        $('#pg-resumo').innerHTML = resumoHtml(ev, contas(ev));
        if (t.dataset.evc.startsWith('gastos.')) atualizarOrc(ev);
      }
    }
  });

  const timersCampo = {};
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'pick-busca' && PK) { PK.busca = t.value; $('#pick-lista').innerHTML = listaPick(); return; }
    if (!t.matches('[data-campo]') || !S.detalheId) return;
    const id = S.detalheId, k = t.dataset.campo, v = t.value;
    clearTimeout(timersCampo[k]);
    timersCampo[k] = setTimeout(() => salvarVisita(id, { [k]: v }, { render: true }), 500);
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-editor') { e.preventDefault(); salvarEditor(); return; }
    if (e.target.id === 'form-evento') { e.preventDefault(); salvarEditorEvento(); return; }
    const f = e.target.closest('[data-add]');
    if (!f) return;
    e.preventDefault();
    const txt = f.t.value.trim();
    if (!txt) return;
    const tipo = f.dataset.add;
    salvarVisita(S.detalheId, { [tipo]: [...visita(S.detalheId)[tipo], txt] });
    renderPainelVisita();
    const nf = $(`[data-add="${tipo}"] input`); if (nf) nf.focus();
  });

  $('#editor').addEventListener('input', (e) => {
    if (ED) ED.sujo = true;
    if (e.target.matches('.qtd') && e.target.value) { const c = e.target.closest('.pill').querySelector('[data-item]'); c.checked = true; }
  });
  $('#editor').addEventListener('cancel', (e) => { e.preventDefault(); fecharEditor(); });

  $('#detalhe').addEventListener('close', () => {
    if ($('#detalhe').open) return; // fechou e reabriu antes do evento chegar
    S.detalheId = null;
    limparHash();
  });

  /* ============ Locais: base (JSON) + banco ============ */
  function prepLocal(l) {
    l._busca = norm([l.nome, l.tipo, l.bairro, l.endereco, l.observacoes, l.descricao, l.atende_em, ...(l.subtipos || []),
      ...Object.values(l.detalhes || {}), ...(l.comodidades || []), ...(l.eventos || []),
      ...itensDo(l).map((k) => rotItem(l, k)), ...(l.precos || []).map((p) => `${p.condicao || ''} ${p.inclui || ''}`),
      ...objetosDe(l).map((o) => `${o.nome || ''} ${o.tipo || ''} ${o.obs || ''}`)].join(' '));
    return l;
  }
  // Para cada id vale a versão mais nova: a do JSON do repositório ou a gravada pelo site.
  function montarLocais() {
    const mapa = new Map([...S.base, ...S.fbase].map((l) => [l.id, l]));
    for (const r of S.remotos) {
      const atual = mapa.get(r.id);
      const cat = r.col === 'fornecedores' ? (CATS[r.dados.cat] && r.dados.cat !== 'espacos' ? r.dados.cat : 'servicos') : 'espacos';
      if (!atual || (atual.atualizado_em || '') < r.atualizado_em) mapa.set(r.id, { ...r.dados, id: r.id, cat, atualizado_em: r.atualizado_em, _nuvem: true });
    }
    S.locais = [...mapa.values()].filter((l) => !l.removido).map(prepLocal);
    S.porId = {};
    S.locais.forEach((l) => { S.porId[l.id] = l; });
    for (const id of [...S.cmp]) if (!S.porId[id]) S.cmp.delete(id);
  }
  async function carregarLocaisRemotos() {
    if (!API) return;
    try {
      const pegar = async (col) => {
        const r = await fetch(`${API}/dados/${col}`, { cache: 'no-store' });
        if (!r.ok) throw new Error(r.status);
        return (await r.json()).map((x) => ({ ...x, col }));
      };
      const [a, b] = await Promise.all([pegar('locais'), pegar('fornecedores')]);
      S.remotos = [...a, ...b];
      lsSet(LS.catalogo, S.remotos);
      montarLocais();
    } catch { /* fica com o que já tinha */ }
  }
  function renderOpcoes() {
    const opts = (vals, atual) => vals.map((t) => `<option ${t === atual ? 'selected' : ''}>${esc(t)}</option>`).join('');
    const ord = (a) => [...new Set(a)].filter(Boolean).sort((x, y) => x.localeCompare(y, 'pt-BR'));
    const ls = CATS[S.secao] ? daSecao() : [];
    const tipos = S.secao === 'espacos' ? ls.map((l) => l.tipo) : [...(CATS[S.secao]?.subtipos || []).filter((t) => ls.some((l) => tiposDe(l).includes(t))), ...ls.flatMap(tiposDe)];
    $('#f-tipo').innerHTML = '<option value="">Todos</option>' + opts(ord(tipos), S.f.tipo);
    $('#f-evento').innerHTML = '<option value="">Qualquer</option>' + opts(ord(ls.flatMap((l) => l.eventos || [])), S.f.evento);
    $('#rot-tipo').textContent = S.secao === 'espacos' ? 'Tipo de espaço' : porObj() ? CATS[S.secao].porObjeto.tipoRot : 'O que oferece';
    $('#campo-cap').hidden = S.secao !== 'espacos';
    $('#f-ordem option[value="cap"]').hidden = S.secao !== 'espacos';
    $('#f-ordem option[value="perto"]').hidden = S.secao !== 'espacos';
  }

  /* ============ Eventos ============ */
  const EV_STATUS = [['planejando', 'Planejando'], ['contratando', 'Contratando'], ['confirmado', 'Confirmado'], ['realizado', 'Realizado'], ['cancelado', 'Cancelado']];
  const ESC_STATUS = [['opcao', 'Opção'], ['escolhido', 'Escolhido'], ['reservado', 'Reservado'], ['contratado', 'Contratado'], ['descartado', 'Descartado']];
  const escRot = (k) => (ESC_STATUS.find((x) => x[0] === k) || ESC_STATUS[0])[1];
  const evStRot = (k) => (EV_STATUS.find((x) => x[0] === k) || EV_STATUS[0])[1];
  const fechado = (st) => st === 'escolhido' || st === 'reservado' || st === 'contratado';
  // Prazos contados para trás a partir da data do evento.
  const MODELO_TAREFAS = [
    [90, 'Definir orçamento e número de convidados'], [75, 'Visitar e reservar o espaço'], [60, 'Fechar o buffet (pedir degustação)'],
    [45, 'Contratar brinquedos, serviços e aluguéis'], [30, 'Enviar os convites'], [21, 'Encomendar bolo e doces'],
    [15, 'Confirmar presença dos convidados'], [10, 'Passar o número final de convidados ao buffet e às locadoras'],
    [7, 'Confirmar horário de montagem com todos os fornecedores'], [5, 'Pagar os saldos que vencem antes da festa'],
    [2, 'Separar lembrancinhas, decoração e itens de última hora'], [1, 'Repassar o cronograma do dia aos fornecedores'],
  ];
  // Orçamento detalhado: itens fora do catálogo. Rascunho não conta; aprovado entra no combinado.
  const CAT_GASTO = ['Lembrancinhas', 'Doces', 'Bolo', 'Salgados', 'Bebidas', 'Decoração', 'Balões', 'Convites', 'Descartáveis', 'Roupa', 'Fotos', 'Outros'];
  const MODELO_ITENS = [
    ['Bolo', 'Bolo'], ['Docinhos', 'Doces'], ['Lembrancinhas', 'Lembrancinhas'], ['Sacolinhas ou caixinhas para as lembrancinhas', 'Lembrancinhas'],
    ['Topo de bolo', 'Decoração'], ['Painel e enfeites do tema', 'Decoração'], ['Balões', 'Balões'], ['Convites', 'Convites'],
    ['Pratos, copos, talheres e guardanapos', 'Descartáveis'], ['Refrigerante e água', 'Bebidas'], ['Gelo', 'Bebidas'], ['Roupa do aniversariante', 'Roupa'],
  ];
  const novoGasto = () => ({ descricao: '', categoria: '', qtd: null, unitario: null, status: 'rascunho', pago: false, obs: '' });
  function normGasto(g) {
    if (!g || typeof g !== 'object') return novoGasto();
    // Formato antigo ("outros gastos"): descricao, valor e pago, que já contavam no combinado.
    if ('valor' in g && !('unitario' in g)) return { ...novoGasto(), descricao: g.descricao || '', qtd: 1, unitario: g.valor ?? null, status: 'aprovado', pago: !!g.pago };
    return { ...novoGasto(), ...g, status: g.status === 'aprovado' ? 'aprovado' : 'rascunho', pago: !!g.pago };
  }
  const totalGasto = (g) => (g.qtd == null ? 1 : numV(g.qtd)) * numV(g.unitario);
  const DIAS_SEM = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const dataLocal = (iso) => { const [a, m, d] = iso.slice(0, 10).split('-').map(Number); return new Date(a, m - 1, d); };
  const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  function diasAte(iso) {
    if (!iso) return null;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return Math.round((dataLocal(iso) - hoje) / 86400000);
  }
  const dataLonga = (iso) => { const d = dataLocal(iso); return `${DIAS_SEM[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
  function contagem(iso) {
    const n = diasAte(iso);
    if (n == null) return '';
    if (n > 1) return `faltam ${n} dias`;
    if (n === 1) return 'é amanhã';
    if (n === 0) return 'é hoje';
    return `foi há ${-n} ${n === -1 ? 'dia' : 'dias'}`;
  }
  const horario = (ev) => (ev.hora_inicio ? (ev.hora_fim ? `${ev.hora_inicio} às ${ev.hora_fim}` : `a partir de ${ev.hora_inicio}`) : '');
  const numV = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  function numDe(txt) {
    const t = String(txt ?? '').trim();
    if (!t) return null;
    const p = parseValor(t);
    if (typeof p === 'number') return p;
    const n = Number(t.replace(/^R\$\s*/i, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  const novoEvento = () => ({
    id: '', nome: '', tipo: '', data: '', hora_inicio: '', hora_fim: '', para_quem: '', idade: '', organiza: '', contato: '',
    adultos: null, criancas: null, tema: '', orcamento: null, status: 'planejando', descricao: '',
    escolhas: [], gastos: [], tarefas: [], cronograma: [],
  });
  function evCompleto(bruto) {
    const ev = Object.assign(novoEvento(), bruto);
    ev.gastos = (Array.isArray(ev.gastos) ? ev.gastos : []).map(normGasto);
    return ev;
  }
  const eventosAtivos = () => Object.values(S.eventos).filter((e) => e && !e.removido)
    .sort((a, b) => (a.data || '9999').localeCompare(b.data || '9999') || (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  const eventosCom = (id) => eventosAtivos().flatMap((ev) => (ev.escolhas || []).filter((e) => e.id === id).map((e) => ({ ev, esc: e })));
  const privTxt = () => (!API ? 'Nuvem não configurada neste site.'
    : S.chave ? 'Os eventos ficam na nuvem. Só quem tem a chave de edição vê.'
      : 'Entre com a chave de edição para criar e ver eventos. Eles ficam na nuvem, visíveis só para quem tem a chave.');

  // Guardar na nuvem (com cópia de trabalho no navegador para não perder nada sem conexão).
  let timerEv = null;
  function salvarEvento(ev, { render = true } = {}) {
    if (precisaChave()) return false;
    ev.atualizado_em = new Date().toISOString();
    S.eventos[ev.id] = ev;
    lsSet(LS.eventos, S.eventos);
    if (API) { S.evPend.add(ev.id); lsSet(LS.evPend, [...S.evPend]); }
    clearTimeout(timerEv); timerEv = setTimeout(sincronizarEventos, 800);
    if (render) renderTudo();
  }
  async function sincronizarEventos() {
    if (!API || !S.chave || !S.evPend.size) return;
    for (const id of [...S.evPend]) {
      try {
        const r = await fetch(`${API}/dados/eventos/${encodeURIComponent(id)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Chave': S.chave }, body: JSON.stringify(S.eventos[id]),
        });
        if (r.status === 401) { toast('Chave de edição recusada. Confira em Sincronização.'); break; }
        if (!r.ok) throw new Error(r.status);
        S.evPend.delete(id);
      } catch { /* tenta de novo depois */ }
    }
    lsSet(LS.evPend, [...S.evPend]);
  }
  async function carregarEventos() {
    if (!API || !S.chave) return;
    try {
      const r = await fetch(`${API}/dados/eventos`, { headers: { 'X-Chave': S.chave }, cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      for (const { id, dados, atualizado_em: em } of await r.json()) {
        const loc = S.eventos[id];
        if (!loc || (loc.atualizado_em || '') < em) { S.eventos[id] = { ...dados, id, atualizado_em: em }; S.evPend.delete(id); }
      }
      lsSet(LS.eventos, S.eventos); lsSet(LS.evPend, [...S.evPend]);
      sincronizarEventos();
    } catch { /* fica com o que está no aparelho */ }
  }
  window.addEventListener('online', sincronizarEventos);

  function contas(ev) {
    const fech = ev.escolhas.filter((e) => fechado(e.status));
    const aprov = ev.gastos.filter((g) => g.status === 'aprovado');
    const rasc = ev.gastos.filter((g) => g.status !== 'aprovado');
    const soma = (lista) => lista.reduce((a, g) => a + totalGasto(g), 0);
    const combinado = fech.reduce((a, e) => a + numV(e.valor), 0) + soma(aprov);
    const pago = fech.reduce((a, e) => a + numV(e.pago), 0) + soma(aprov.filter((g) => g.pago));
    const rascunho = soma(rasc);
    const pessoas = numV(ev.adultos) + numV(ev.criancas);
    const vencimentos = fech.filter((e) => e.vencimento && numV(e.valor) > numV(e.pago))
      .map((e) => ({ vencimento: e.vencimento, falta: numV(e.valor) - numV(e.pago), nome: (S.porId[e.id] || e).nome }))
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
    return {
      combinado, pago, falta: Math.max(0, combinado - pago), pessoas, porPessoa: pessoas ? combinado / pessoas : null,
      semValor: fech.filter((e) => !numV(e.valor)).length, vencimentos,
      rascunho, nRasc: rasc.length, itensAprov: soma(aprov),
    };
  }
  function barraOrc(v, total) {
    const p = Math.min(100, Math.round((v / total) * 100));
    return `<div class="barra-orc ${v > total ? 'estourou' : ''}" role="img" aria-label="${p}% do orçamento usado"><span style="width:${p}%"></span></div>`;
  }

  /* ---- Lista de eventos ---- */
  function cardEvento(bruto) {
    const ev = evCompleto(bruto);
    const c = contas(ev);
    const d = ev.data ? dataLocal(ev.data) : null;
    const passado = ev.status === 'cancelado' || ev.status === 'realizado' || (ev.data && diasAte(ev.data) < 0);
    return `<article class="card ev-card ${passado ? 'passado' : ''}">
      <a class="ev-cab" href="#evento/${ev.id}">
        <span class="ev-data">${d ? `<span class="dia">${d.getDate()}</span><span class="mes">${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}</span>` : '<span class="mes">sem data</span>'}</span>
        <span class="ev-tit"><span class="sobretitulo">${esc(ev.tipo || 'Evento')} · ${esc(evStRot(ev.status))}</span>
          <strong>${esc(ev.nome)}</strong>
          <small>${esc([ev.data ? contagem(ev.data) : null, horario(ev)].filter(Boolean).join(' · '))}</small></span>
      </a>
      <div class="corpo">
        <ul class="ev-cats">${ORDEM_CATS.map((k) => {
          const es = ev.escolhas.filter((e) => e.cat === k);
          const ok = es.some((e) => fechado(e.status));
          return `<li class="${ok ? 'ok' : es.length ? 'meio' : ''}" title="${esc(CATS[k].rot)}: ${ok ? 'escolhido' : es.length ? es.length + ' opções' : 'nada ainda'}">${ic(ok ? 'check' : CATS[k].icone)}<span>${esc(CATS[k].curto)}</span></li>`;
        }).join('')}</ul>
        <div class="preco"><span class="valor">${brl(c.combinado)} <small>combinado${numV(ev.orcamento) ? ` de ${brl(ev.orcamento)}` : ''}</small></span>
          <span class="cond">${esc([c.pessoas ? `${c.pessoas} convidados` : 'Convidados a definir', ev.para_quem ? `para ${ev.para_quem}` : null].filter(Boolean).join(' · '))}</span></div>
        ${numV(ev.orcamento) ? barraOrc(c.combinado, ev.orcamento) : ''}
        <div class="rodape-card"><a class="btn" href="#evento/${ev.id}">Abrir planejamento</a></div>
      </div>
    </article>`;
  }
  function renderEventos() {
    const evs = eventosAtivos();
    $('#aplicados').innerHTML = `<span><strong>${evs.length}</strong> ${evs.length === 1 ? 'evento' : 'eventos'}</span><span class="esp"></span>
      <button type="button" class="btn primario" data-acao="novo-evento">${ic('mais')}Novo evento</button>`;
    $('#lista').innerHTML = evs.length ? evs.map(cardEvento).join('')
      : `<div class="vazio"><h3>Nenhum evento ainda</h3>
          <p>Crie um evento para juntar espaço, buffet, brinquedos, serviços e aluguéis num lugar só, com orçamento, pagamentos e tarefas.</p>
          <p><button type="button" class="btn primario" data-acao="novo-evento">${ic('mais')}Criar o primeiro evento</button></p>
          <p class="meta">${privTxt()}</p></div>`;
  }

  /* ---- Página do evento ---- */
  function linhaEscolha(e, i) {
    const l = S.porId[e.id];
    const zap = l && zapLink(l.whatsapp, l.nome);
    const mp = l && menorPreco(l);
    const ref = l ? (mp != null ? `a partir de ${brl(mp)}` : 'valor sob consulta') : 'não está mais no catálogo';
    const v = l ? visita(l.id) : null;
    return `<div class="esc st-${e.status}">
      <div class="esc-topo">
        <button type="button" class="esc-estrela" data-esc-melhor="${i}" aria-pressed="${fechado(e.status)}" title="${fechado(e.status) ? 'Tirar dos escolhidos' : 'Marcar como escolhido'}" aria-label="${fechado(e.status) ? 'Tirar dos escolhidos' : 'Marcar como escolhido'}">${ic('estrela')}</button>
        <div class="esc-nome">${l ? `<button type="button" data-abrir="${l.id}">${esc(l.nome)}</button>` : `<span>${esc(e.nome || 'Sem nome')}</span>`}
          <small>${esc([l ? tiposDe(l)[0] : null, ref, v && v.nota ? `sua nota ${v.nota}/5` : null].filter(Boolean).join(' · '))}</small></div>
        <span class="selo-esc">${esc(escRot(e.status))}</span>
      </div>
      <div class="esc-campos">
        <label class="campo"><span>Situação</span><select data-evc="escolhas.${i}.status">${ESC_STATUS.map(([k, r]) => `<option value="${k}" ${k === e.status ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
        <label class="campo"><span>Valor combinado</span><input data-evc="escolhas.${i}.valor" data-tipo="num" inputmode="decimal" value="${e.valor != null ? esc(valorTxt(e.valor)) : ''}" placeholder="R$"></label>
        <label class="campo"><span>Já pago</span><input data-evc="escolhas.${i}.pago" data-tipo="num" inputmode="decimal" value="${e.pago != null ? esc(valorTxt(e.pago)) : ''}" placeholder="R$"></label>
        <label class="campo"><span>Saldo vence em</span><input type="date" data-evc="escolhas.${i}.vencimento" value="${esc(e.vencimento || '')}"></label>
        <label class="campo largo"><span>Observação</span><input data-evc="escolhas.${i}.obs" maxlength="300" value="${esc(e.obs || '')}" placeholder="O que foi combinado, horário de montagem…"></label>
      </div>
      <div class="esc-acoes">${zap ? `<a class="mini zap" href="${zap}" target="_blank" rel="noopener">${ic('zap')}WhatsApp</a>` : ''}
        ${l && l.telefone && !zap ? `<a class="mini" href="tel:+55${digitos(l.telefone)}">${ic('fone')}Ligar</a>` : ''}
        <span class="esp"></span><button type="button" class="link-btn" data-esc-tirar="${i}">Tirar do evento</button></div>
    </div>`;
  }
  function blocoCat(ev, k) {
    const C = CATS[k];
    const ordem = { contratado: 0, reservado: 1, escolhido: 2, opcao: 3, descartado: 4 };
    const idx = ev.escolhas.map((e, i) => [e, i]).filter(([e]) => e.cat === k).sort((a, b) => (ordem[a[0].status] ?? 3) - (ordem[b[0].status] ?? 3));
    const nF = idx.filter(([e]) => fechado(e.status)).length;
    const nO = idx.filter(([e]) => e.status === 'opcao').length;
    return `<div class="pg-cat ${nF ? 'tem' : ''}">
      <div class="pg-cat-topo"><h3>${ic(C.icone)}${esc(C.rot)}</h3>
        <span class="n">${nF ? `${nF} escolhido${nF > 1 ? 's' : ''}` : 'nada escolhido'}${nO ? ` · ${nO} ${nO === 1 ? 'opção' : 'opções'}` : ''}</span>
        <button type="button" class="btn ghost" data-picker="${k}">${ic('mais')}<span class="lbl">Adicionar opção</span></button></div>
      ${idx.length ? idx.map(([e, i]) => linhaEscolha(e, i)).join('')
        : `<p class="texto vazio-cat">Nenhuma opção ainda. <button type="button" class="link-btn" data-picker="${k}">Escolher do catálogo</button></p>`}
    </div>`;
  }
  function resumoHtml(ev, c) {
    const orc = numV(ev.orcamento);
    const aPagar = c.falta;
    const base = Math.max(orc, c.combinado + c.rascunho, 1);
    const pct = (v) => `${Math.min(100, (v / base) * 100).toFixed(1)}%`;
    const passou = orc && c.combinado > orc;
    const tarefas = (ev.tarefas || []).filter((t) => !t.feito && (t.texto || '').trim())
      .sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999')).slice(0, 3);
    return `<div class="orc-card">
        <h2>Orçamento</h2>
        <p class="orc-rot">Combinado</p>
        <p class="orc-grande">${brl(c.combinado)}</p>
        <p class="orc-sub">${orc ? `de ${brl(orc)} previstos · <strong class="${passou ? 'ruim' : 'bom'}">${passou ? `passou ${brl(c.combinado - orc)}` : `ainda cabe ${brl(orc - c.combinado)}`}</strong>` : 'Defina o valor previsto em Editar para acompanhar quanto ainda cabe.'}</p>
        <div class="orc-barra" role="img" aria-label="Pago ${brl(c.pago)}, a pagar ${brl(aPagar)}, em rascunho ${brl(c.rascunho)}">
          <span class="b-pago" style="width:${pct(c.pago)}"></span><span class="b-falta" style="width:${pct(aPagar)}"></span><span class="b-rasc" style="width:${pct(c.rascunho)}"></span>
        </div>
        <dl class="orc-leg">
          <div><dt><i class="b-pago"></i>Pago</dt><dd>${brl(c.pago)}</dd></div>
          <div><dt><i class="b-falta"></i>A pagar</dt><dd>${brl(aPagar)}</dd></div>
          <div><dt><i class="b-rasc"></i>Rascunho${c.nRasc ? ` <small>(${c.nRasc})</small>` : ''}</dt><dd>${brl(c.rascunho)}</dd></div>
          <div><dt>Por convidado</dt><dd>${c.porPessoa ? brl(Math.round(c.porPessoa)) : '—'}</dd></div>
        </dl>
        ${c.nRasc ? `<p class="orc-se ${orc && c.combinado + c.rascunho > orc ? 'ruim' : ''}">Se aprovar tudo: <strong>${brl(c.combinado + c.rascunho)}</strong></p>` : ''}
        ${c.semValor ? `<p class="nota-aviso">${ic('alerta')}<span>${c.semValor} ${c.semValor === 1 ? 'escolhido está' : 'escolhidos estão'} sem valor combinado.</span></p>` : ''}
      </div>
      ${c.vencimentos.length ? `<div class="orc-card"><h3>Próximos pagamentos</h3><ul class="vencs">${c.vencimentos.slice(0, 4).map((v) =>
        `<li class="${diasAte(v.vencimento) < 0 ? 'atrasado' : ''}"><span>${dataBR(v.vencimento)}</span><strong>${brl(v.falta)}</strong><span>${esc(v.nome)}</span></li>`).join('')}</ul></div>` : ''}
      ${tarefas.length ? `<div class="orc-card"><h3>Próximas tarefas</h3><ul class="prox-tarefas">${tarefas.map((t) =>
        `<li class="${t.prazo && diasAte(t.prazo) < 0 ? 'atrasada' : ''}"><span>${esc(t.texto)}</span>${t.prazo ? `<small>${dataBR(t.prazo).slice(0, 5)}</small>` : ''}</li>`).join('')}</ul></div>` : ''}`;
  }
  function andamentoHtml(ev) {
    const est = ORDEM_CATS.map((k) => {
      const es = ev.escolhas.filter((e) => (e.cat || 'espacos') === k && e.status !== 'descartado');
      const ok = es.some((e) => fechado(e.status));
      return [k, ok ? 'ok' : es.length ? 'meio' : 'nada', ok ? 'Resolvido' : es.length ? `${es.length} ${es.length === 1 ? 'opção' : 'opções'}` : 'Nada ainda'];
    });
    const n = est.filter((x) => x[1] === 'ok').length;
    return `<section class="andamento" aria-label="Andamento">
      <p><strong>${n} de ${est.length}</strong> categorias resolvidas</p>
      <ul>${est.map(([k, st, rot]) => `<li class="and-${st}"><span class="and-ic">${ic(st === 'ok' ? 'check' : CATS[k].icone)}</span><span><strong>${esc(CATS[k].curto)}</strong><small>${rot}</small></span></li>`).join('')}</ul>
    </section>`;
  }
  function linhasEv(lista, i, conteudo) {
    return `<div class="linha-ev">${conteudo}<button type="button" class="tirar-linha" data-ev-tirar="${lista}:${i}" aria-label="Remover">×</button></div>`;
  }
  /* ---- Orçamento detalhado ---- */
  function gruposOrc(ev) {
    const g = new Map();
    ev.gastos.forEach((x, i) => {
      const k = (x.categoria || '').trim() || 'Sem categoria';
      if (!g.has(k)) g.set(k, []);
      g.get(k).push([x, i]);
    });
    const pos = (k) => (k === 'Sem categoria' ? 999 : CAT_GASTO.includes(k) ? CAT_GASTO.indexOf(k) : 500);
    return [...g.entries()].sort((a, b) => pos(a[0]) - pos(b[0]) || a[0].localeCompare(b[0], 'pt-BR'));
  }
  const totGastoTxt = (g) => (g.unitario == null ? '—' : brl(totalGasto(g)));
  function subGrupoHtml(itens) {
    const ap = itens.filter((g) => g.status === 'aprovado').reduce((a, g) => a + totalGasto(g), 0);
    const ra = itens.filter((g) => g.status !== 'aprovado').reduce((a, g) => a + totalGasto(g), 0);
    const nRa = itens.filter((g) => g.status !== 'aprovado').length;
    return [itens.length > nRa ? `<strong>${brl(ap)}</strong> aprovado` : null, nRa ? (ra ? `${brl(ra)} em rascunho` : `${nRa} em rascunho, sem valor`) : null].filter(Boolean).join(' · ');
  }
  function somaOrcHtml(ev) {
    if (!ev.gastos.length) return '';
    const c = contas(ev);
    return `<span class="orc-ap">${ic('check')}<strong>${brl(c.itensAprov)}</strong> aprovado</span>
      <span class="orc-ra"><strong>${brl(c.rascunho)}</strong> em rascunho${c.nRasc ? ` (${c.nRasc} ${c.nRasc === 1 ? 'item' : 'itens'})` : ''}</span>`;
  }
  function linhaGasto(g, i) {
    const ap = g.status === 'aprovado';
    const num = (k, pre, ph, rot, cls) => `<label class="g-num ${cls}"><span aria-hidden="true">${pre}</span><input data-evc="gastos.${i}.${k}" data-tipo="num" inputmode="decimal" value="${g[k] != null ? esc(k === 'unitario' && g[k] % 1 ? g[k].toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : valorTxt(g[k])) : ''}" placeholder="${ph}" aria-label="${rot}"></label>`;
    return `<div class="linha-ev gasto g-${ap ? 'aprovado' : 'rascunho'}">
      <button type="button" class="g-st" data-gasto-st="${i}" aria-pressed="${ap}" title="${ap ? 'Voltar para rascunho' : 'Aprovar: passa a contar como gasto do evento'}">${ap ? `${ic('check')}Aprovado` : 'Rascunho'}</button>
      <input class="g-desc" data-evc="gastos.${i}.descricao" maxlength="200" value="${esc(g.descricao || '')}" placeholder="ex.: kit de massinhas" aria-label="Item">
      <input class="g-cat" data-evc="gastos.${i}.categoria" list="dl-cat-gasto" maxlength="60" value="${esc(g.categoria || '')}" placeholder="Categoria" aria-label="Categoria">
      ${num('qtd', 'Qtd.', '1', 'Quantidade', 'g-qtd')}
      ${num('unitario', 'R$', 'cada', 'Valor de cada', 'g-unit')}
      <span class="g-total" data-g-total="${i}" title="Quantidade × valor de cada">${totGastoTxt(g)}</span>
      ${ap ? `<label class="chk g-pago"><input type="checkbox" data-evc="gastos.${i}.pago" data-tipo="bool" ${g.pago ? 'checked' : ''}>pago</label>` : '<span class="g-pago"></span>'}
      <input class="g-obs" data-evc="gastos.${i}.obs" maxlength="300" value="${esc(g.obs || '')}" placeholder="Onde comprar, link ou observação" aria-label="Observação">
      <button type="button" class="tirar-linha" data-ev-tirar="gastos:${i}" aria-label="Remover">×</button>
    </div>`;
  }
  function listaOrc(ev) {
    const grupos = gruposOrc(ev);
    return `<p class="meta">Tudo o que não vem do catálogo: lembrancinhas, doces, bolo, decoração, convites. Deixe em rascunho enquanto pesquisa; ao aprovar, o item passa a contar no combinado do evento.</p>
      <p class="orc-soma" id="orc-soma">${somaOrcHtml(ev)}</p>
      ${grupos.map(([k, itens], n) => `<div class="orc-grupo">
        <div class="orc-grupo-topo"><h3>${esc(k)}</h3><span class="n" data-g-sub="${n}">${subGrupoHtml(itens.map((x) => x[0]))}</span></div>
        <div class="linhas-ev">${itens.map(([g, i]) => linhaGasto(g, i)).join('')}</div></div>`).join('')}
      <datalist id="dl-cat-gasto">${CAT_GASTO.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
      <div class="acoes-linha"><button type="button" class="btn ghost add-linha" data-ev-add="gastos">${ic('mais')}Adicionar item</button>
        <button type="button" class="btn ghost add-linha" data-acao="ev-sugerir-itens">${ic('check')}Sugerir itens de festa</button></div>`;
  }
  function atualizarOrc(ev) {
    document.querySelectorAll('[data-g-total]').forEach((el) => { const g = ev.gastos[Number(el.dataset.gTotal)]; if (g) el.textContent = totGastoTxt(g); });
    gruposOrc(ev).forEach(([, itens], n) => { const el = document.querySelector(`[data-g-sub="${n}"]`); if (el) el.innerHTML = subGrupoHtml(itens.map((x) => x[0])); });
    const s = $('#orc-soma'); if (s) s.innerHTML = somaOrcHtml(ev);
  }
  function sugerirItens() {
    const ev = evAtual();
    const tem = new Set(ev.gastos.map((g) => norm(g.descricao)));
    let n = 0;
    for (const [descricao, categoria] of MODELO_ITENS) {
      if (tem.has(norm(descricao))) continue;
      ev.gastos.push({ ...novoGasto(), descricao, categoria }); n++;
    }
    salvarEvento(ev);
    toast(n ? `${n} itens em rascunho. Preencha quantidade e valor de cada um.` : 'Os itens sugeridos já estão no orçamento.');
  }
  function listaTarefas(ev) {
    const ordem = ev.tarefas.map((t, i) => [t, i]).sort((a, b) => (a[0].feito ? 1 : 0) - (b[0].feito ? 1 : 0) || (a[0].prazo || '9999').localeCompare(b[0].prazo || '9999'));
    const feitas = ev.tarefas.filter((t) => t.feito).length;
    return `${ev.tarefas.length ? `<p class="meta">${feitas} de ${ev.tarefas.length} feitas</p>` : ''}
      <div class="linhas-ev">${ordem.map(([t, i]) => `<div class="linha-ev tarefa ${t.feito ? 'feita' : ''} ${!t.feito && t.prazo && diasAte(t.prazo) < 0 ? 'atrasada' : ''}">
        <label class="chk"><input type="checkbox" data-evc="tarefas.${i}.feito" data-tipo="bool" ${t.feito ? 'checked' : ''}><span class="sr">Feita</span></label>
        <input data-evc="tarefas.${i}.texto" maxlength="200" value="${esc(t.texto || '')}" placeholder="O que fazer" aria-label="Tarefa">
        <input type="date" class="curto" data-evc="tarefas.${i}.prazo" value="${esc(t.prazo || '')}" aria-label="Prazo">
        <button type="button" class="tirar-linha" data-ev-tirar="tarefas:${i}" aria-label="Remover">×</button></div>`).join('')}</div>
      <div class="acoes-linha"><button type="button" class="btn ghost add-linha" data-ev-add="tarefas">${ic('mais')}Adicionar tarefa</button>
        <button type="button" class="btn ghost add-linha" data-acao="ev-sugerir">${ic('check')}Sugerir tarefas${ev.data ? ' pela data' : ''}</button></div>`;
  }
  function listaCrono(ev) {
    const ordem = ev.cronograma.map((x, i) => [x, i]).sort((a, b) => (a[0].hora || '99').localeCompare(b[0].hora || '99'));
    return `<p class="meta">Horários do dia: montagem, chegada dos convidados, parabéns, fim do buffet.</p>
      <div class="linhas-ev">${ordem.map(([x, i]) => linhasEv('cronograma', i, `
        <input type="time" class="curto" data-evc="cronograma.${i}.hora" value="${esc(x.hora || '')}" aria-label="Horário">
        <input data-evc="cronograma.${i}.oque" maxlength="200" value="${esc(x.oque || '')}" placeholder="ex.: chegada do buffet" aria-label="O que acontece">`)).join('')}</div>
      <button type="button" class="btn ghost add-linha" data-ev-add="cronograma">${ic('mais')}Adicionar horário</button>`;
  }
  function renderPagina() {
    const el = $('#pagina');
    const bruto = S.eventos[S.paginaEv];
    if (!bruto || bruto.removido) {
      el.innerHTML = `<div class="vazio"><h3>Evento não encontrado</h3><p>Ele pode ter sido excluído${API && !S.chave ? ' ou estar salvo em outro aparelho. Informe a chave de edição para trazer da nuvem' : ''}.</p>
        <p><a class="btn" href="#eventos">Ver eventos</a></p></div>`;
      return;
    }
    const ev = evCompleto(bruto);
    const c = contas(ev);
    const local = ev.escolhas.find((e) => e.cat === 'espacos' && fechado(e.status));
    const lLocal = local && S.porId[local.id];
    const conv = [numV(ev.adultos) ? `${ev.adultos} adultos` : null, numV(ev.criancas) ? `${ev.criancas} crianças` : null].filter(Boolean).join(' + ');
    const fatos = [
      ['Para quem', esc([ev.para_quem, ev.idade].filter(Boolean).join(', '))],
      ['Quem organiza', esc([ev.organiza, ev.contato].filter(Boolean).join(' · '))],
      ['Convidados', conv ? esc(conv) + (c.pessoas && conv.includes('+') ? ` <small>(${c.pessoas})</small>` : '') : ''],
      ['Tema', esc(ev.tema)],
      ['Local', lLocal ? `<button type="button" class="link-btn" data-abrir="${lLocal.id}">${esc(lLocal.nome)}</button>${lLocal.endereco || lLocal.bairro ? ` <small>${esc(lLocal.endereco || lLocal.bairro)}</small>` : ''}` : '<span class="fraco">a definir</span>'],
    ].filter(([, v]) => v);
    el.innerHTML = `
      <div class="pg-topo">
        <a class="btn ghost" href="#eventos">${ic('voltar')}Eventos</a>
        <span class="esp"></span>
        <button type="button" class="btn" data-acao="editar-evento">${ic('editar')}<span class="lbl">Editar</span></button>
        <button type="button" class="btn" data-acao="imprimir">${ic('imprimir')}<span class="lbl">Imprimir</span></button>
      </div>
      <header class="pg-cab">
        <p class="sobretitulo">${esc(ev.tipo || 'Evento')} · ${esc(evStRot(ev.status))}</p>
        <h1>${esc(ev.nome)}</h1>
        <p class="pg-quando">${ev.data ? `<span>${ic('quero')}${esc(dataLonga(ev.data))}</span>` : '<span>Data a definir</span>'}
          ${horario(ev) ? `<span>${ic('relogio')}${esc(horario(ev))}</span>` : ''}
          ${ev.data ? `<span class="contagem">${esc(contagem(ev.data))}</span>` : ''}</p>
        ${fatos.length ? `<dl class="pg-fatos">${fatos.map(([r, v]) => `<div><dt>${r}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
        ${ev.descricao ? `<p class="pg-desc">${esc(ev.descricao)}</p>` : ''}
      </header>
      ${andamentoHtml(ev)}
      <div class="pg-grade">
      <div class="pg-principal">
      <section class="pg-sec"><h2>Fornecedores</h2>
        <p class="meta">Adicione as opções que está considerando e marque com a estrela as melhores. Pode haver mais de uma escolhida por categoria (buffet e bolo, por exemplo).</p>
        ${ORDEM_CATS.map((k) => blocoCat(ev, k)).join('')}
      </section>
      <section class="pg-sec"><div class="orc-cab"><h2>Orçamento detalhado</h2>
        <div class="seg-f" role="group" aria-label="Mostrar">${[['todos', 'Todos'], ['rascunho', 'Rascunho'], ['aprovado', 'Aprovados']].map(([k, r]) =>
          `<button type="button" data-orc-f="${k}" aria-pressed="${(S.orcF || 'todos') === k}">${r}</button>`).join('')}</div></div>
        <div id="orc-lista" class="orc-f-${S.orcF || 'todos'}">${listaOrc(ev)}</div></section>
      <section class="pg-sec"><h2>Tarefas</h2>${listaTarefas(ev)}</section>
      <section class="pg-sec"><h2>Cronograma do dia</h2>${listaCrono(ev)}</section>
      <p class="meta pg-priv">${privTxt()}</p>
      </div>
      <aside class="pg-lado" id="pg-resumo" aria-label="Resumo do orçamento">${resumoHtml(ev, c)}</aside>
      </div>`;
  }

  /* ---- Edição na própria página ---- */
  const LINHA_VAZIA = { gastos: novoGasto, tarefas: () => ({ texto: '', prazo: '', feito: false }), cronograma: () => ({ hora: '', oque: '' }) };
  function evAtual() { return S.eventos[S.paginaEv] ? evCompleto(S.eventos[S.paginaEv]) : null; }
  function setCaminho(obj, caminho, v) {
    const ps = caminho.split('.');
    let o = obj;
    for (let i = 0; i < ps.length - 1; i++) { o = o[ps[i]]; if (!o) return; }
    o[ps[ps.length - 1]] = v;
  }
  function addEscolha(evId, itemId) {
    const ev = evCompleto(S.eventos[evId]);
    const l = S.porId[itemId];
    if (!l || ev.escolhas.some((e) => e.id === itemId)) return false;
    ev.escolhas.push({ id: l.id, cat: l.cat || 'espacos', nome: l.nome, status: 'opcao', valor: null, pago: null, vencimento: '', obs: '' });
    salvarEvento(ev);
    return true;
  }
  function sugerirTarefas() {
    const ev = evAtual();
    const tem = new Set(ev.tarefas.map((t) => norm(t.texto)));
    const base = ev.data ? dataLocal(ev.data) : null;
    let n = 0;
    for (const [dias, texto] of MODELO_TAREFAS) {
      if (tem.has(norm(texto))) continue;
      let prazo = '';
      if (base) { const d = new Date(base); d.setDate(d.getDate() - dias); prazo = isoLocal(d); }
      ev.tarefas.push({ texto, prazo, feito: false }); n++;
    }
    salvarEvento(ev);
    toast(n ? `${n} tarefas sugeridas.` : 'As tarefas sugeridas já estão na lista.');
  }

  /* ---- Seletor: adicionar opção ao evento / item a um evento ---- */
  let PK = null;
  function listaPick() {
    const ev = S.eventos[S.paginaEv];
    const ja = new Set(((ev && ev.escolhas) || []).map((e) => e.id));
    const q = norm(PK.busca).split(/\s+/).filter(Boolean);
    const todos = S.locais.filter((l) => (l.cat || 'espacos') === PK.cat);
    const ls = todos.filter((l) => q.every((t) => l._busca.includes(t)))
      .sort((a, b) => (visita(b.id).favorito ? 1 : 0) - (visita(a.id).favorito ? 1 : 0) || (visita(b.id).nota || 0) - (visita(a.id).nota || 0) || completude(b) - completude(a));
    if (!ls.length) return `<p class="texto">${todos.length ? 'Nada encontrado com essa busca.' : 'Nenhum cadastrado nesta categoria ainda. Use Cadastrar novo.'}</p>`;
    return ls.map((l) => {
      const v = visita(l.id);
      const tem = ja.has(l.id);
      const mp = menorPreco(l);
      return `<button type="button" class="pick-item ${tem ? 'ok' : ''}" data-pick="${l.id}" ${tem ? 'disabled' : ''}>${ic(tem ? 'check' : 'mais')}
        <span><strong>${esc(l.nome)}</strong><small>${esc([tiposDe(l)[0], mp != null ? `a partir de ${brl(mp)}` : 'sob consulta',
          v.favorito ? 'favorito' : null, v.nota ? `nota ${v.nota}/5` : null, tem ? 'já está no evento' : null].filter(Boolean).join(' · '))}</small></span></button>`;
    }).join('');
  }
  function renderPicker() {
    const d = $('#picker');
    if (PK.modo === 'item') {
      d.innerHTML = `<div class="folha-corpo">
        <h2>${esc(CATS[PK.cat].rot)}</h2>
        <p>Adicione as opções que está considerando. Depois marque a melhor com a estrela.</p>
        <label class="busca pick-busca"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <span class="sr">Buscar</span><input id="pick-busca" type="search" placeholder="Buscar…" value="${esc(PK.busca)}" autocomplete="off"></label>
        <div class="pick-lista" id="pick-lista">${listaPick()}</div>
        <div class="acoes"><button type="button" class="btn" data-acao="pick-cadastrar">${ic('mais')}Cadastrar novo</button><span class="esp"></span>
          <button type="button" class="btn primario" data-fechar>Pronto</button></div></div>`;
    } else {
      const l = S.porId[PK.itemId];
      const evs = eventosAtivos();
      d.innerHTML = `<div class="folha-corpo">
        <h2>Adicionar a um evento</h2>
        <p><strong>${esc(l.nome)}</strong> entra como opção. No evento, marque com a estrela se for a escolhida.</p>
        <div class="pick-lista">${evs.map((ev) => {
          const tem = (ev.escolhas || []).some((e) => e.id === l.id);
          return `<button type="button" class="pick-item ${tem ? 'ok' : ''}" data-pick-ev="${ev.id}" ${tem ? 'disabled' : ''}>${ic(tem ? 'check' : 'eventos')}
            <span><strong>${esc(ev.nome)}</strong><small>${esc([ev.data ? dataBR(ev.data) : 'sem data', tem ? 'já está neste evento' : null].filter(Boolean).join(' · '))}</small></span></button>`;
        }).join('') || '<p class="texto">Você ainda não tem eventos.</p>'}</div>
        <div class="acoes"><button type="button" class="btn ouro" data-acao="pick-novo-evento">${ic('mais')}Criar evento novo</button><span class="esp"></span>
          <button type="button" class="btn ghost" data-fechar>Cancelar</button></div></div>`;
    }
  }
  function abrirPicker(cat) {
    PK = { modo: 'item', cat, busca: '' };
    renderPicker();
    $('#picker').showModal();
    setTimeout(() => { const b = $('#pick-busca'); if (b && window.matchMedia('(min-width: 700px)').matches) b.focus(); }, 50);
  }
  function abrirPickerEvento(itemId) {
    if (!S.porId[itemId]) return;
    PK = { modo: 'evento', itemId };
    renderPicker();
    $('#picker').showModal();
  }

  /* ---- Formulário do evento ---- */
  function abrirEditorEvento(id) {
    const ev = id && S.eventos[id] ? evCompleto(S.eventos[id]) : novoEvento();
    ED = { tipo: 'evento', id: id && S.eventos[id] ? id : null, cat: null, sujo: false };
    const tipos = [...new Set([...EVENTOS_BASE, 'Chá de bebê', 'Noivado', '15 anos', 'Bodas', ...eventosAtivos().map((e) => e.tipo)])].filter(Boolean);
    const d = $('#editor');
    d.innerHTML = `<form id="form-evento" novalidate>
      <div class="folha-topo">
        <button type="button" class="fechar" data-acao="cancelar-editor" aria-label="Fechar">${ic('voltar')}</button>
        <h2>${ED.id ? `Editar: ${esc(ev.nome)}` : 'Novo evento'}</h2>
      </div>
      <div class="folha-corpo">
        <fieldset class="ed-bloco"><legend>O evento</legend>
          <div class="grade-2">
            <label class="campo largo"><span>Nome do evento *</span><input name="nome" required maxlength="120" value="${esc(ev.nome)}" placeholder="ex.: Aniversário de 7 anos do Pedro"></label>
            <label class="campo"><span>Tipo</span><input name="tipo" list="dl-tipos-ev" maxlength="60" value="${esc(ev.tipo)}" placeholder="Aniversário, casamento…"></label>
            <label class="campo"><span>Situação</span><select name="status">${EV_STATUS.map(([k, r]) => `<option value="${k}" ${k === ev.status ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
            <label class="campo largo"><span>Data</span><input name="data" type="date" value="${esc(ev.data)}"></label>
            <label class="campo"><span>Começa às</span><input name="hora_inicio" type="time" value="${esc(ev.hora_inicio)}"></label>
            <label class="campo"><span>Termina às</span><input name="hora_fim" type="time" value="${esc(ev.hora_fim)}"></label>
          </div>
          <datalist id="dl-tipos-ev">${tipos.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
        </fieldset>
        <fieldset class="ed-bloco"><legend>Pessoas</legend>
          <div class="grade-2">
            <label class="campo"><span>Para quem (homenageado)</span><input name="para_quem" maxlength="120" value="${esc(ev.para_quem)}" placeholder="ex.: Pedro"></label>
            <label class="campo"><span>O que comemora</span><input name="idade" maxlength="80" value="${esc(ev.idade)}" placeholder="ex.: 7 anos, 10 anos de casados"></label>
            <label class="campo"><span>Quem organiza</span><input name="organiza" maxlength="120" value="${esc(ev.organiza)}"></label>
            <label class="campo"><span>Contato de quem organiza</span><input name="contato" maxlength="60" inputmode="tel" value="${esc(ev.contato)}"></label>
            <label class="campo"><span>Adultos</span><input name="adultos" type="number" min="0" inputmode="numeric" value="${ev.adultos ?? ''}"></label>
            <label class="campo"><span>Crianças</span><input name="criancas" type="number" min="0" inputmode="numeric" value="${ev.criancas ?? ''}"></label>
          </div>
        </fieldset>
        <fieldset class="ed-bloco"><legend>Planejamento</legend>
          <div class="grade-2">
            <label class="campo"><span>Tema / estilo</span><input name="tema" maxlength="120" value="${esc(ev.tema)}" placeholder="ex.: Fundo do mar"></label>
            <label class="campo"><span>Orçamento previsto (R$)</span><input name="orcamento" inputmode="decimal" value="${ev.orcamento != null ? esc(valorTxt(ev.orcamento)) : ''}" placeholder="ex.: 8.000"></label>
            <label class="campo largo"><span>Descrição e ideias</span><textarea name="descricao" rows="4" maxlength="3000" placeholder="Como imagina a festa, o que não pode faltar, restrições…">${esc(ev.descricao)}</textarea></label>
          </div>
          <p class="ajuda" style="margin-top:10px">${privTxt()}</p>
        </fieldset>
      </div>
      <div class="ed-rodape">
        ${ED.id ? `<button type="button" class="btn ghost perigo" data-acao="remover-evento">${ic('lixo')}<span class="lbl">Excluir</span></button>` : ''}
        <span class="espaco"></span>
        <button type="button" class="btn" data-acao="cancelar-editor">Cancelar</button>
        <button type="submit" class="btn primario">Salvar</button>
      </div>
    </form>`;
    if (!d.open) d.showModal();
    d.scrollTop = 0;
    if (!ED.id) setTimeout(() => d.querySelector('[name="nome"]').focus(), 50);
  }
  function salvarEditorEvento() {
    const f = $('#form-evento');
    const g = (n) => (f.elements[n]?.value || '').trim();
    const nome = f.elements.nome;
    if (!g('nome')) { nome.setCustomValidity('Dê um nome ao evento'); nome.reportValidity(); nome.focus(); return; }
    nome.setCustomValidity('');
    const novo = !ED.id;
    const ev = novo ? novoEvento() : evCompleto(S.eventos[ED.id]);
    if (novo) ev.id = `ev-${slug(g('nome')).slice(0, 40)}-${Date.now().toString(36)}`;
    const int = (n) => { const x = parseInt(g(n), 10); return x >= 0 ? x : null; };
    Object.assign(ev, {
      nome: g('nome'), tipo: g('tipo'), status: g('status') || 'planejando', data: g('data'), hora_inicio: g('hora_inicio'), hora_fim: g('hora_fim'),
      para_quem: g('para_quem'), idade: g('idade'), organiza: g('organiza'), contato: g('contato'), adultos: int('adultos'), criancas: int('criancas'),
      tema: g('tema'), orcamento: numDe(g('orcamento')), descricao: g('descricao'),
    });
    if (ED.addItem && S.porId[ED.addItem] && !ev.escolhas.some((e) => e.id === ED.addItem)) {
      const l = S.porId[ED.addItem];
      ev.escolhas.push({ id: l.id, cat: l.cat || 'espacos', nome: l.nome, status: 'opcao', valor: null, pago: null, vencimento: '', obs: '' });
    }
    ED.sujo = false;
    $('#editor').close();
    if (salvarEvento(ev, { render: false }) === false) return;
    toast(novo ? 'Evento criado.' : 'Evento salvo.');
    if (location.hash === `#evento/${ev.id}`) renderTudo(); else location.hash = `#evento/${ev.id}`;
  }
  function removerEvento() {
    const ev = S.eventos[ED.id];
    if (!ev || !confirm(`Excluir o evento "${ev.nome}"? As escolhas, gastos e tarefas dele saem junto.`)) return;
    ED.sujo = false;
    $('#editor').close();
    salvarEvento({ ...ev, removido: true }, { render: false });
    toast('Evento excluído.');
    location.hash = '#eventos';
  }

  /* ============ Navegação ============ */
  function hashBase() {
    if (S.paginaEv) return `#evento/${S.paginaEv}`;
    return S.secao === 'espacos' ? location.pathname + location.search : `#${S.secao}`;
  }
  function mudarSecao(sec) {
    if (S.secao === sec) return;
    S.secao = sec; S.aba = S.abaDepois || 'todos'; S.abaDepois = null; S.cmp.clear();
    Object.assign(S.f, { tipo: '', evento: '', cap: '' }); S.f.rapidos.clear();
    ['tipo', 'evento', 'cap'].forEach((c) => { $('#f-' + c).value = ''; });
    if ((S.f.ordem === 'cap' || S.f.ordem === 'perto') && sec !== 'espacos') { S.f.ordem = 'relevancia'; $('#f-ordem').value = 'relevancia'; }
    if (CATS[sec]) renderOpcoes();
  }
  function rota() {
    const h = decodeURIComponent(location.hash.slice(1));
    const antes = `${S.secao}|${S.paginaEv}`;
    let m;
    if ((m = h.match(/^evento\/(.+)$/))) { mudarSecao('eventos'); S.paginaEv = m[1]; }
    else if ((m = h.match(/^local\/(.+)$/))) {
      const l = S.porId[m[1]];
      if (l) { S.paginaEv = null; mudarSecao(l.cat || 'espacos'); renderTudo(); abrirDetalhe(l.id); return; }
    } else { S.paginaEv = null; mudarSecao(SECOES.some(([k]) => k === h) ? h : 'espacos'); }
    renderTudo();
    if (antes !== `${S.secao}|${S.paginaEv}`) {
      if ($('#picker').open) $('#picker').close();
      if ($('#detalhe').open) $('#detalhe').close();
      window.scrollTo(0, 0);
    }
    S.abaDepois = null;
  }

  /* ============ Início ============ */
  async function iniciar() {
    $('#link-sugerir').href = CFG.repo ? `https://github.com/${CFG.repo}/issues/new?template=sugerir-local.md` : '#';
    try {
      const r = await fetch('data/locais.json', { cache: 'no-cache' });
      const j = await r.json();
      S.dataDados = j.atualizado_em;
      const padrao = (j.atualizado_em || '2026-01-01') + 'T00:00:00Z';
      S.base = j.locais.map((l) => ({ ...l, atualizado_em: l.atualizado_em || padrao }));
      S.base.forEach((l) => { l.cat = 'espacos'; });
      try {
        const rf = await fetch('data/fornecedores.json', { cache: 'no-cache' });
        const jf = await rf.json();
        S.fbase = (jf.itens || []).map((l) => ({ ...l, atualizado_em: l.atualizado_em || padrao }));
      } catch { S.fbase = []; }
      S.remotos = lsGet(LS.catalogo, []);
      montarLocais();
    } catch {
      $('#lista').innerHTML = '<div class="vazio"><h3>Não foi possível carregar os locais</h3><p>Recarregue a página.</p></div>';
      return;
    }
    $('#data-dados').textContent = dataBR(S.dataDados);
    ligarFiltros();
    renderOpcoes();
    renderTudo();
    atualizarSync();
    rota();
    window.addEventListener('hashchange', rota);
    await Promise.all([carregarRemoto(), carregarLocaisRemotos(), carregarEventos()]);
    if (CATS[S.secao]) renderOpcoes();
    renderTudo();
    if (location.hash.startsWith('#local/') && !$('#detalhe').open) rota();
  }
  iniciar();
})();
