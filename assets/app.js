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
    olho: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
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
    compartilhar: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.4 13.3 7.2 4.4M15.6 6.3l-7.2 4.4"/>',
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
      porObjeto: { rot: 'Cardápios e opções', um: 'opção', varios: 'opções', tipoRot: 'Tipo de buffet', ex: 'ex.: Buffet completo para 50 pessoas', grupoEx: 'ex.: Cento de salgados fritos',
        tempoRot: 'Duração', qtdRot: 'Serve (pessoas)', qtdPre: 'serve', qtdUm: 'pessoa', qtdVarios: 'pessoas', pacoteEx: 'ex.: taxa de garçom R$ 150',
        obsEx: 'o que inclui, regra para crianças, mínimo de convidados…' },
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
      porObjeto: { rot: 'Brinquedos', um: 'brinquedo', varios: 'brinquedos', tipoRot: 'Tipo de brinquedo', ex: 'ex.: Pula-pula 3 x 3 m', grupoEx: 'ex.: Pula-pula 3,05 m' },
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
      porObjeto: { rot: 'Serviços oferecidos', um: 'serviço', varios: 'serviços', tipoRot: 'Tipo de serviço', ex: 'ex.: Fotografia 4 horas', grupoEx: 'ex.: Fotografia de aniversário 4 h',
        tempoRot: 'Duração', qtdRot: 'Profissionais', qtdUm: 'profissional', qtdVarios: 'profissionais', pacoteEx: 'ex.: foto + vídeo por R$ 2.500', obsEx: 'o que entrega, prazo, deslocamento…' },
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
      porObjeto: { rot: 'Itens para alugar', um: 'item', varios: 'itens', tipoRot: 'Tipo de item', ex: 'ex.: Carrinho de pipoca', grupoEx: 'ex.: Carrinho de pipoca' },
      subtipos: ['Carrinho de pipoca', 'Algodão-doce', 'Crepe', 'Churros', 'Hot dog', 'Sorvete / açaí', 'Food truck', 'Barraquinhas temáticas',
        'Mesas e cadeiras', 'Louças e talheres', 'Toalhas e tecidos', 'Tendas', 'Som e iluminação', 'Gerador', 'Freezer / chopeira', 'Pegue e monte (decoração)', 'Decoração montada', 'Itens de bebê', 'Brinquedos de bebê'],
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
  // Foto de um brinquedo (ou item): { url, credito? }; aceita só caminho seguro.
  const fotoObj = (o) => {
    const f = o && o.foto;
    const url = f && (f.url || f);
    if (!url || typeof url !== 'string' || !urlSegura(url)) return null;
    const c = f.credito && /^https?:\/\//i.test(f.credito.url || '') ? f.credito : null;
    return { url, credito: c };
  };
  // Tempo de uso (brinquedos e aluguéis): o da empresa fica em detalhes.duracao; cada item pode ter o seu.
  const CATS_TEMPO = ['brinquedos', 'alugueis'];
  const mostraTempo = (l) => CATS_TEMPO.includes(l.cat);
  const tempoDe = (l) => String((l.detalhes || {}).duracao || '').trim();
  const tempoObj = (l, o) => String(o.duracao || '').trim() || (objetosDe(l).some((x) => x.duracao) ? '' : tempoDe(l));
  const tempoHtml = (t, cls = '', rot = 'Tempo de uso') => `<p class="tempo-uso ${t ? '' : 'sem'} ${cls}">${ic('relogio')}<span>${esc(rot)}</span><strong>${esc(t || 'não informado')}</strong></p>`;
  // Espaços: "fixo" = o local define a janela (ex.: 9h às 18h); "horas" = X horas de uso, você escolhe quando começa.
  const USO = {
    fixo: { rot: 'Horário fixo', nota: 'o local define o horário' },
    horas: { rot: 'Horas de uso', nota: 'você escolhe o horário' },
  };
  const usoDe = (l) => {
    const u = l.uso || {};
    return { modo: USO[u.modo] ? u.modo : null, texto: String(u.texto || '').trim() };
  };
  function usoHtml(l) {
    const u = usoDe(l);
    if (!u.modo) return tempoHtml('');
    return tempoHtml(u.modo === 'fixo' ? u.texto || 'definido pelo local' : `${u.texto || 'por horas'} · ${USO.horas.nota}`, 'uso-' + u.modo, USO[u.modo].rot);
  }
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
    ['horario-livre', 'Horário livre', (l) => usoDe(l).modo === 'horas'],
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
  /* ============ Compartilhar ============ */
  // Só dados públicos do local: nada de visita, nota, status ou eventos de quem está usando.
  const linkLocal = (l) => `${location.origin}${location.pathname}#local/${encodeURIComponent(l.id)}`;
  function textoLocal(l) {
    const r = [l.nome];
    const tipo = tiposDe(l)[0] || catDe(l).curto;
    const onde = ehEspaco(l) ? l.endereco || l.bairro : l.atende_em || l.bairro;
    r.push([tipo, onde, 'Palmas-TO'].filter(Boolean).join(' · '));
    const p = menorPreco(l);
    if (p != null) r.push(`A partir de ${brl(p)}`);
    if (ehEspaco(l)) {
      const u = usoDe(l);
      if (u.modo) r.push(`${USO[u.modo].rot}: ${u.texto || USO[u.modo].nota}`);
      if (l.capacidade) r.push(`Até ${l.capacidade} pessoas`);
    }
    if (l.whatsapp) r.push(`WhatsApp: ${l.whatsapp}`);
    else if (l.telefone) r.push(`Telefone: ${l.telefone}`);
    return r.join('\n');
  }
  async function compartilhar(id) {
    const l = S.porId[id];
    if (!l) return;
    const url = linkLocal(l), text = textoLocal(l);
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: l.nome, text, url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const d = $('#compartilhar');
    d.innerHTML = `<div class="folha-corpo">
      <h2>Compartilhar</h2>
      <p>${esc(l.nome)}</p>
      <pre class="comp-previa">${esc(text)}</pre>
      <label class="comp-link"><span class="sr">Link</span><input readonly value="${esc(url)}"></label>
      <div class="acoes">
        <a class="btn primario" href="https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}" target="_blank" rel="noopener">${ic('zap')}WhatsApp</a>
        <button type="button" class="btn" data-comp="copiar">${ic('check')}Copiar link</button>
        <button type="button" class="btn" data-comp="texto">Copiar com informações</button>
        ${navigator.share ? `<button type="button" class="btn" data-comp="mais">${ic('compartilhar')}Mais opções</button>` : ''}
        <button type="button" class="btn" data-fechar>Fechar</button>
      </div></div>`;
    const copiar = async (v, msg) => {
      try { await navigator.clipboard.writeText(v); toast(msg); }
      catch {
        const i = d.querySelector('input'); const v0 = i.value;
        i.value = v; i.focus(); i.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch { /* sem suporte */ }
        i.value = v0;
        if (ok) toast(msg); else { i.select(); toast('Selecione e copie o link.'); }
      }
    };
    d.onclick = (e) => {
      const b = e.target.closest('[data-comp]');
      if (!b) return;
      const k = b.dataset.comp;
      if (k === 'copiar') copiar(url, 'Link copiado.');
      if (k === 'texto') copiar(text + '\n\n' + url, 'Informações e link copiados.');
      if (k === 'mais') navigator.share({ title: l.nome, text, url }).catch(() => {});
    };
    d.showModal();
  }
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
    secao: 'espacos', paginaEv: null, rsvp: {}, rsvpPedido: {}, abaEv: 'geral', escAberto: new Set(), convF: 'todos', convBusca: '', convAberto: new Set(),
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
  // Visitas, cadastros e eventos vão direto para a nuvem, sem chave. A chave só vale para excluir.
  function pedeChaveParaExcluir() {
    if (!API || S.chave) return false;
    toast('Para excluir, informe a chave de edição.');
    if (!$('#config').open) abrirConfig();
    return true;
  }
  function salvarVisita(id, patch, { render = true } = {}) {
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
    else if (S.pendentes.size) S.sync = 'pendente';
    else if (S.sync === 'local' || S.sync === 'sem-chave') S.sync = 'ok';
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
      atualizarSync(!S.pendentes.size ? 'ok' : undefined);
      if (S.pendentes.size) sincronizar();
    } catch {
      atualizarSync('erro');
    }
  }

  async function sincronizar() {
    if (!API || !S.pendentes.size) { atualizarSync(); return; }
    atualizarSync('pendente');
    let falhou = false;
    for (const id of [...S.pendentes]) {
      try {
        const r = await fetch(`${API}/visitas/${encodeURIComponent(id)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(S.visitas[id]),
        });
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
  const SYNC_CURTO = { local: 'Sem nuvem', 'sem-chave': 'Na nuvem', pendente: 'Salvando…', ok: 'Na nuvem', erro: 'Sem conexão' };
  function renderNav() {
    const nEv = eventosAtivos().length;
    const cat = CATS[S.secao] ? S.secao : S.ultCat;
    const emCat = !S.paginaEv && !!CATS[S.secao];
    const emEv = !emCat;
    const badge = (n, cls = '') => (n ? `<span class="nav-n ${cls}">${n}</span>` : '');
    $('#nav-principal').innerHTML = `
      <a href="#${cat}" ${emCat ? 'aria-current="page"' : ''}>Catálogo</a>
      <a href="#eventos" ${emEv ? 'aria-current="page"' : ''}>Meus eventos${badge(nEv, 'ouro')}</a>`;
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
  // Crédito das fotos copiadas de terceiros (Google Maps, Instagram), um link por fonte.
  function creditoHtml(fotos) {
    const fontes = [];
    fotos.forEach((f) => {
      const c = f && f.credito;
      if (c && /^https?:\/\//i.test(c.url || '') && !fontes.some((x) => (x.nome || '') === (c.nome || ''))) fontes.push(c);
    });
    if (!fontes.length) return '';
    const rot = fotos.every((f) => f && f.credito) ? 'Fotos' : 'Parte das fotos';
    const link = (c) => `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.nome || 'fonte')}</a>`;
    if (fontes.length === 1) return `<a class="foto-credito" href="${esc(fontes[0].url)}" target="_blank" rel="noopener">${rot}: ${esc(fontes[0].nome || 'fonte')}</a>`;
    return `<span class="foto-credito">${rot}: ${fontes.map(link).join(' · ')}</span>`;
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
    const f = (l.fotos || []).find((x) => urlSegura(x.url || x)) || (l.objetos || []).map((o) => o && o.foto).find((x) => x && urlSegura(x.url || x));
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
    return `<div class="preco"><p class="pp">${p.prefixo}</p><p class="pv"><strong>${esc(p.valor)}</strong><span>${esc(porUn(p.unidade))}</span></p>${p.cond ? `<p class="pc">${esc(p.cond)}</p>` : ''}</div>`;
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
        <div class="card-icones">
          <button type="button" class="comp-btn" data-compartilhar="${l.id}" aria-label="Compartilhar ${esc(l.nome)}" title="Compartilhar">${ic('compartilhar')}</button>
          <button type="button" class="coracao" data-fav="${l.id}" aria-pressed="${v.favorito}" aria-label="${v.favorito ? 'Tirar dos' : 'Adicionar aos'} favoritos">${ic('coracao')}</button>
        </div>
      </div>
      ${st || nEv ? `<div class="card-st">${st ? `<span class="pill-st ${STATUS[v.status].cls}">${ic(STATUS[v.status].icone)}${esc(st)}</span>` : ''}${nEv ? `<span class="pill-st st-ev">${ic('eventos')}em ${nEv} ${nEv === 1 ? 'evento' : 'eventos'}</span>` : ''}</div>` : ''}
      ${precoCard(l)}
      ${mostraTempo(l) ? tempoHtml(tempoDe(l)) : ehEspaco(l) ? usoHtml(l) : ''}
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
  // Visão por objeto: cada brinquedo (ou item de aluguel) vira um cartão só, com todas as empresas que o têm.
  // O que junta itens de empresas diferentes é o campo "grupo" (ex.: Pula-pula 3,05 m); sem ele, vale o nome sem o que está entre parênteses.
  const grupoDe = (o) => String(o.grupo || '').trim() || String(o.nome || o.tipo || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const porUn = (u) => { const t = String(u || 'evento').trim(); return /^por\b/i.test(t) ? t : `/ ${t}`; };
  const qtdTxt = (l, o) => { const P = catDe(l).porObjeto || {}; return `${P.qtdPre ? `${P.qtdPre} ` : ''}${o.qtd} ${o.qtd === 1 ? P.qtdUm || 'disponível' : P.qtdVarios || 'disponíveis'}`; };
  const valNum = (o) => (typeof o.valor === 'number' ? o.valor : Infinity);
  function objetosFiltrados(empresas) {
    const q = norm(S.f.busca.trim()).split(/\s+/).filter(Boolean);
    const teto = Number(S.f.preco) || 0;
    const grupos = new Map();
    empresas.forEach((l, ord) => objetosDe(l).forEach((o, i) => {
      if (S.f.tipo && o.tipo !== S.f.tipo) return;
      if (teto && !(typeof o.valor === 'number' && o.valor <= teto)) return;
      if (q.length) { const txt = norm([grupoDe(o), o.nome, o.tipo, o.obs, l.nome, l.atende_em].join(' ')); if (!q.every((t) => txt.includes(t))) return; }
      const nome = grupoDe(o);
      const k = norm(nome);
      if (!grupos.has(k)) grupos.set(k, { k, nome, tipo: o.tipo, ofertas: [], ord });
      grupos.get(k).ofertas.push({ l, o, i, ord });
    }));
    const r = [...grupos.values()];
    r.forEach((g) => {
      g.ofertas.sort((a, b) => valNum(a.o) - valNum(b.o) || a.ord - b.ord || a.i - b.i);
      g.min = valNum(g.ofertas[0].o);
      g.nEmp = new Set(g.ofertas.map((x) => x.l.id)).size;
    });
    const nome = (g) => g.nome;
    const o = S.f.ordem;
    r.sort((a, b) => (o === 'preco' ? (a.min === b.min ? 0 : a.min < b.min ? -1 : 1) || nome(a).localeCompare(nome(b), 'pt-BR')
      : o === 'nome' ? nome(a).localeCompare(nome(b), 'pt-BR')
      : b.nEmp - a.nEmp || nome(a).localeCompare(nome(b), 'pt-BR')));
    return r;
  }
  function ofertaHtml({ l, o }, g, menor) {
    const num = typeof o.valor === 'number';
    const zap = zapLink(l.whatsapp, l.nome, o.nome || g.nome);
    const outroNome = o.nome && norm(o.nome) !== norm(g.nome) ? o.nome : '';
    const tempo = mostraTempo(l) ? tempoObj(l, o) : String(o.duracao || '').trim();
    const tRot = (catDe(l).porObjeto || {}).tempoRot ? 'duração' : 'uso';
    const inclui = itensDo(l).slice(0, 3).map((k) => itemTexto(l, k));
    const cond = [outroNome, o.obs, tempo && `${tRot}: ${tempo}`, o.qtd ? qtdTxt(l, o) : ''].filter(Boolean);
    return `<li class="oferta ${menor ? 'menor' : ''}">
      <div class="of-topo">
        <span class="of-loja">${miniCapa(l)}<button type="button" data-abrir="${l.id}">${esc(l.nome)}</button></span>
        <span class="of-valor ${num ? '' : 'consulta'}"><strong>${num ? brl(o.valor) : esc(o.valor || 'Sob consulta')}</strong>${num ? `<small>${esc(porUn(o.unidade))}</small>` : ''}</span>
      </div>
      ${cond.length ? `<p class="of-cond">${cond.map(esc).join(' · ')}</p>` : ''}
      ${inclui.length ? `<p class="of-inclui">${ic('check')}${esc(inclui.join(' · '))}</p>` : ''}
      <div class="of-acoes">
        ${zap ? `<a class="of-btn zap" href="${zap}" target="_blank" rel="noopener">${ic('zap')}WhatsApp</a>`
          : l.telefone ? `<a class="of-btn" href="tel:+55${digitos(l.telefone)}">${ic('fone')}Ligar</a>` : ''}
        <button type="button" class="of-btn" data-add-evento="${l.id}">${ic('eventos')}Ao evento</button>
      </div>
    </li>`;
  }
  function objCardHtml(g) {
    const comFoto = g.ofertas.find((x) => fotoObj(x.o));
    const f = comFoto && fotoObj(comFoto.o);
    const num = Number.isFinite(g.min);
    const nOf = g.ofertas.length;
    return `<article class="card obj-card grupo-card ${f ? 'com-capa' : ''}">
      ${f ? `<button type="button" class="card-capa" data-abrir="${comFoto.l.id}" tabindex="-1" aria-hidden="true"><img src="${esc(f.url)}" alt="" loading="lazy"><span class="capa-cred">Foto: ${esc(comFoto.l.nome)}</span></button>` : ''}
      <div class="card-cab">
        ${f ? '' : `<span class="mini-capa mono mono-${numHash(g.k) % 5}" aria-hidden="true">${ic(CATS[S.secao].icone)}</span>`}
        <div class="card-tit">
          <h2>${esc(g.nome)}</h2>
          <p class="onde">${g.tipo && g.tipo !== g.nome ? `${esc(g.tipo)} · ` : ''}${g.nEmp} ${g.nEmp === 1 ? 'loja' : 'lojas'}</p>
        </div>
      </div>
      <div class="preco ${num ? '' : 'consulta'}"><p class="pv"><strong>${num ? brl(g.min) : 'Sob consulta'}</strong>${num ? `<span>${g.nEmp > 1 ? `menor valor entre ${g.nEmp} lojas` : esc(porUn(g.ofertas[0].o.unidade))}</span>` : ''}</p>${num ? '' : '<p class="pc">Peça o valor pelo WhatsApp</p>'}</div>
      <ul class="ofertas">${g.ofertas.map((x, i) => ofertaHtml(x, g, nOf > 1 && num && i === 0)).join('')}</ul>
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
    renderAplicados(r.length, objs ? new Set(r.flatMap((g) => g.ofertas.map((x) => x.l.id))).size : null);
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
    const u = usoDe(l);
    const fatos = [
      ['Menor valor', pi.consulta ? pi.valor : brl(menorPreco(l)), pi.consulta ? '' : porUn(pi.unidade)],
      esp ? ['Capacidade', l.capacidade ? `até ${l.capacidade}` : 'Não informada', l.capacidade ? 'pessoas' : '']
        : mostraTempo(l) ? ['Tempo de uso', tempoDe(l) || 'Não informado', '']
        : ['Atende', l.atende_em || l.bairro || 'Palmas', ''],
      esp ? (u.modo ? [USO[u.modo].rot, u.texto || (u.modo === 'fixo' ? 'Definido pelo local' : 'Por horas'), USO[u.modo].nota] : ['Tempo de uso', 'Não informado', ''])
        : porObj(l.cat) && objetosDe(l).length ? [catDe(l).porObjeto.rot, `${objetosDe(l).length}`, objetosDe(l).length === 1 ? catDe(l).porObjeto.um : catDe(l).porObjeto.varios]
        : ['Oferece', tiposDe(l)[0] || catDe(l).curto, tiposDe(l).length > 1 ? `+${tiposDe(l).length - 1}` : ''],
      ['Pagamento', l.pagamento ? l.pagamento.split(/[.;]/)[0].slice(0, 60) : 'Não informado', ''],
    ];
    const v0 = visita(l.id);
    $('#detalhe').innerHTML = `
      <div class="folha-topo">
        <button type="button" class="fechar" data-fechar aria-label="Fechar">${ic('voltar')}</button>
        <h2 id="detalhe-titulo">${esc(l.nome)}</h2>
        <button type="button" class="fechar" data-compartilhar="${l.id}" aria-label="Compartilhar" title="Compartilhar">${ic('compartilhar')}</button>
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
        const f = fotoObj(o);
        return `<li class="${num && o.valor === mpObj && objs.length > 1 ? 'menor' : ''} ${f ? 'com-foto' : ''}">
          ${f ? `<figure class="obj-foto"><img src="${esc(f.url)}" alt="${esc(o.nome || o.tipo)}" loading="lazy">${f.credito ? `<figcaption><a href="${esc(f.credito.url)}" target="_blank" rel="noopener" title="Foto: ${esc(f.credito.nome || 'fonte')}">${esc(String(f.credito.nome || 'fonte').replace(/^Instagram\s+/, ''))}</a></figcaption>` : ''}</figure>` : ''}
          <div><strong>${esc(o.nome || o.tipo)}</strong>${o.tipo && o.tipo !== o.nome ? `<span class="obj-tipo">${esc(o.tipo)}</span>` : ''}
            ${mostraTempo(l) ? `<span class="obj-tempo ${tempoObj(l, o) ? '' : 'sem'}">${ic('relogio')}${esc(tempoObj(l, o) || 'Tempo de uso não informado')}</span>` : ''}
            ${o.qtd || o.obs || (!mostraTempo(l) && o.duracao) ? `<small>${[!mostraTempo(l) && o.duracao ? `${P.tempoRot || 'Duração'}: ${o.duracao}` : null, o.qtd ? qtdTxt(l, o) : null, o.obs].filter(Boolean).map(esc).join(' · ')}</small>` : ''}</div>
          <span class="obj-valor">${num ? `${o.valor === mpObj && objs.length > 1 ? '<span class="selo-menor">Menor</span>' : ''}${brl(o.valor)} <small>${esc(porUn(o.unidade))}</small>` : `<span class="fraco">${esc(o.valor || 'Sob consulta')}</span>`}</span>
        </li>`;
      }).join('')}</ul>`
        : `<div class="cartao"><p class="texto">Ainda sem a lista de ${esc(P.varios)}. Toque em Editar para cadastrar cada um com o seu valor.</p></div>`}
    </section>` : '';
    const precos = (l.precos || []).length
      ? `<div class="cartao">${l.precos.map((p) => `
          <div class="linha-preco ${typeof p.valor === 'number' && p.valor === menorPreco(l) && l.precos.length > 1 ? 'menor' : ''}">
            <span class="v">${typeof p.valor === 'number' ? brl(p.valor) : esc(p.valor || 'Sob consulta')}${p.unidade ? ` <small>${esc(porUn(p.unidade))}</small>` : ''}</span>
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
    const falta = [menorPreco(l) == null && 'o valor', esp && !l.capacidade && 'a capacidade', esp && !usoDe(l).modo && 'se o horário é fixo ou por horas de uso',
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
    const entrar = '';
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
      ...(esp ? [['Tempo de uso', ls.map((l) => {
        const u = usoDe(l);
        return u.modo ? `<strong>${USO[u.modo].rot}</strong>${u.texto ? `<br>${esc(u.texto)}` : ''}<br><small>${USO[u.modo].nota}</small>` : '—';
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
        ? `<p>Visitas, cadastros e edições são salvos direto na nuvem, sem chave, e aparecem em qualquer aparelho. Os eventos também. A chave de edição só é pedida para <strong>excluir</strong> (pergunte a quem cuida do site).</p>
           <label class="campo"><span>Chave de edição</span><input id="in-chave" type="password" autocomplete="off" value="${esc(S.chave)}" placeholder="Digite a chave"></label>
           <div class="acoes"><button class="btn primario" data-acao="salvar-chave">${S.chave ? 'Trocar chave' : 'Guardar chave'}</button>${S.chave ? '<button class="btn" data-acao="esquecer-chave">Sair</button>' : ''}</div>`
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
    toast('Pronto! Chave guardada neste aparelho.');
    $('#config').close();
    sincronizar();
    sincronizarEventos();
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
    objetos: { rot: 'item', campos: [['nome', 'Nome', 'ex.: Pula-pula 3 x 3 m'], ['grupo', 'Mesmo item que', 'nome comum, para juntar com outras lojas'], ['tipo', 'Tipo', 'escolha ou escreva'], ['valor', 'Valor', 'R$ 250 ou Sob consulta'],
      ['unidade', 'Por', 'por evento'], ['qtd', 'Quantos tem', 'ex.: 2'], ['duracao', 'Tempo de uso', 'ex.: 4 horas'], ['obs', 'Observação', 'idade, tamanho, monitor, energia…']] },
  };
  function linhaRep(tipo, d = {}) {
    return `<div class="rep-linha rep-${tipo}"${tipo === 'objetos' && d.foto ? ` data-foto="${esc(JSON.stringify(d.foto))}"` : ''}>
      ${REP[tipo].campos.map(([k, rot, ph]) => {
        const P = tipo === 'objetos' && ED && CATS[ED.cat] && CATS[ED.cat].porObjeto;
        if (P && k === 'grupo') { rot = `Mesmo ${P.um} que`; ph = `${P.grupoEx} (junta com outras lojas)`; }
        if (P && k === 'nome') ph = P.ex;
        if (P && k === 'obs' && P.obsEx) ph = P.obsEx;
        if (P && k === 'duracao' && P.tempoRot) rot = P.tempoRot;
        if (P && k === 'qtd' && P.qtdRot) { rot = P.qtdRot; ph = P.qtdPre ? 'ex.: 50' : 'ex.: 2'; }
        return `<label class="campo c-${k}"><span>${rot}</span><input data-k="${k}" ${k === 'unidade' ? 'list="dl-unidades"' : tipo === 'objetos' && k === 'tipo' ? 'list="dl-subtipos"' : tipo === 'objetos' && k === 'grupo' ? 'list="dl-grupos"' : ''} value="${esc(k === 'valor' ? valorTxt(d[k]) : d[k] || '')}" placeholder="${esc(ph)}"></label>`; }).join('')}
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
          : ''}

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
        ${C.porObjeto ? `<datalist id="dl-subtipos">${C.subtipos.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
          <datalist id="dl-grupos">${[...new Set(S.locais.filter((x) => x.cat === ED.cat).flatMap((x) => objetosDe(x).map(grupoDe)))].sort((x, y) => x.localeCompare(y, 'pt-BR')).map((t) => `<option value="${esc(t)}">`).join('')}</datalist>` : ''}
        ${blocoRep('precos', C.porObjeto ? 'Pacotes e outros valores' : 'Valores', C.porObjeto ? `Combos ou valores que valem para a empresa toda (${esc(C.porObjeto.pacoteEx || 'ex.: 3 brinquedos por R$ 600')}).` : 'Cada valor com a sua condição: dia, horário, número de convidados, pacote.', (l && l.precos) || [])}
        <datalist id="dl-unidades">${C.unidades.map((u) => `<option value="${esc(u)}">`).join('')}</datalist>
        ${blocoRep('taxas', 'Taxas extras', esp ? 'Cobranças à parte, como limpeza, caução ou energia.' : 'Frete, deslocamento, hora extra, profissional adicional.', (l && l.taxas) || [])}
        <fieldset class="ed-bloco"><legend>Pagamento, reserva e cancelamento</legend>
          <label class="campo"><span>Condições de pagamento</span><textarea name="pagamento" rows="2" maxlength="600" placeholder="ex.: 50% para reservar, resto até 7 dias antes; Pix ou cartão">${esc(l?.pagamento || '')}</textarea></label>
          <div class="grade-2" style="margin-top:10px">
            <label class="campo"><span>Reservar com quanto tempo</span><input name="antecedencia" maxlength="200" value="${esc(l?.antecedencia || '')}" placeholder="ex.: 30 dias antes"></label>
            <label class="campo"><span>Cancelamento ou adiamento</span><input name="cancelamento" maxlength="300" value="${esc(l?.cancelamento || '')}" placeholder="ex.: perde o sinal; remarca 1 vez sem custo"></label>
          </div>
        </fieldset>
        ${esp ? `<fieldset class="ed-bloco"><legend>Tempo de uso</legend>
          <div class="grade-2">
            <label class="campo"><span>Como funciona</span><select name="uso_modo">
              <option value="">Não informado</option>
              <option value="fixo" ${usoDe(l || {}).modo === 'fixo' ? 'selected' : ''}>Horário fixo (o local define)</option>
              <option value="horas" ${usoDe(l || {}).modo === 'horas' ? 'selected' : ''}>Horas de uso (você escolhe o horário)</option>
            </select></label>
            <label class="campo"><span>Horário ou duração</span><input name="uso_texto" maxlength="120" value="${esc(usoDe(l || {}).texto)}" placeholder="ex.: 9h às 18h · ou · 5 horas"></label>
          </div>
        </fieldset>
        ${blocoRep('horarios', 'Horários por dia', '', (l && l.horarios) || [])}` : ''}

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
        uso: USO[g('uso_modo')] ? { modo: g('uso_modo'), texto: g('uso_texto') || null } : null,
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
      const o = { nome: val(r, 'nome'), grupo: val(r, 'grupo') || null, tipo: val(r, 'tipo') || null, valor: parseValor(val(r, 'valor')), unidade: val(r, 'unidade') || null,
        qtd: parseInt(val(r, 'qtd'), 10) > 0 ? parseInt(val(r, 'qtd'), 10) : null, duracao: val(r, 'duracao') || null, obs: val(r, 'obs') || null };
      // a foto não tem campo no editor: mantém a que já estava na linha
      if (r.dataset.foto) { try { const ft = JSON.parse(r.dataset.foto); if (fotoObj({ foto: ft })) o.foto = ft; } catch (e) { /* ignora foto inválida */ } }
      return o.nome || o.tipo ? o : null;
    }) : undefined;
    return { ...comum, subtipos, descricao: g('descricao') || null, atende_em: g('atende_em') || null, detalhes, ...(objetos ? { objetos } : {}) };
  }

  const colDe = (dados) => (dados.cat && dados.cat !== 'espacos' ? 'fornecedores' : 'locais');
  async function gravarLocal(id, dados) {
    const col = colDe(dados);
    if (!API) { toast('A nuvem não está configurada.'); return null; }
    const excluir = dados.removido === true;
    if (excluir && pedeChaveParaExcluir()) return null;
    const em = new Date().toISOString();
    try {
      const r = await fetch(`${API}/dados/${col}/${encodeURIComponent(id)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', ...(excluir ? { 'X-Chave': S.chave } : {}) }, body: JSON.stringify({ ...dados, atualizado_em: em }),
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
    if ((b = t.closest('[data-ev-aba]'))) { irAbaEv(b.dataset.evAba); return; }
    if ((b = t.closest('[data-ir-cat]'))) {
      const alvo = $('#cat-' + b.dataset.irCat); const nav = $('.ev-abas');
      if (alvo) window.scrollTo({ top: alvo.getBoundingClientRect().top + window.scrollY - (nav ? nav.getBoundingClientRect().bottom : 0) - 10, behavior: 'smooth' });
      return;
    }
    if ((b = t.closest('[data-esc-abrir]'))) {
      const k = b.dataset.escAbrir; S.escAberto.has(k) ? S.escAberto.delete(k) : S.escAberto.add(k);
      const ev = evAtual(); const i = ev.escolhas.findIndex((e) => escK(e) === k);
      const el = b.closest('.esc');
      if (i >= 0 && el) { el.outerHTML = linhaEscolha(ev.escolhas[i], i); const n = document.querySelector(`[data-esc-k="${CSS.escape(k)}"] .esc-campos select`); if (n) n.focus({ preventScroll: true }); }
      return;
    }
    if ((b = t.closest('[data-conv-f]'))) { S.convF = b.dataset.convF; refazerTabelaConv(); const n = $('#conv-nums'); if (n) n.innerHTML = convNums(evAtual()); return; }
    if ((b = t.closest('[data-conv-abrir]'))) {
      const k = b.dataset.convAbrir; S.convAberto.has(k) ? S.convAberto.delete(k) : S.convAberto.add(k);
      refazerTabelaConv();
      const lin = document.querySelector(`[data-conv-k="${CSS.escape(k)}"]`);
      if (lin && S.convAberto.has(k)) { const i = lin.querySelector('.ct-ed input, .ct-ed select'); if (i) i.focus({ preventScroll: true }); lin.scrollIntoView({ block: 'nearest' }); }
      return;
    }
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
    if ((b = t.closest('[data-compartilhar]'))) { compartilhar(b.dataset.compartilhar); return; }
    if ((b = t.closest('[data-editar]'))) { abrirEditor(b.dataset.editar); return; }
    if ((b = t.closest('[data-add-evento]'))) { abrirPickerEvento(b.dataset.addEvento); return; }
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
      const nova = LINHA_VAZIA[lista]();
      if (lista === 'convidados') { S.convF = 'todos'; S.convBusca = ''; S.convAberto.add('c:' + nova.id); }
      ev[lista].push(nova);
      salvarEvento(ev);
      const ult = document.querySelector(`[data-evc^="${lista}.${ev[lista].length - 1}."]:not([type="checkbox"]):not([type="date"]):not([type="time"])`)
        || document.querySelector(`[data-evc^="${lista}.${ev[lista].length - 1}."]`);
      if (ult) ult.focus();
      return;
    }
    if ((b = t.closest('[data-conv-link]'))) {
      const ev = evAtual(); const cv = ev.convidados.find((x) => x.id === b.dataset.convLink);
      if (cv) copiar(linkConvite(ev, cv), `Link de ${cv.nome || 'convidado'} copiado.`);
      return;
    }
    if ((b = t.closest('[data-rota]'))) { acaoRota(b.dataset.rota); return; }
    if ((b = t.closest('[data-chegou]'))) { marcarChegada(b.dataset.chegou); return; }
    if ((b = t.closest('[data-conv-resp]'))) { novaResposta(b.dataset.convResp); return; }
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
      if (a === 'novo-evento') abrirEditorEvento(null);
      if (a === 'editar-evento') abrirEditorEvento(S.paginaEv);
      if (a === 'remover-evento') removerEvento();
      if (a === 'imprimir') window.print();
      if (a === 'ev-sugerir') sugerirTarefas();
      if (a === 'ev-sugerir-itens') sugerirItens();
      if (a === 'conv-copiar') copiar(linkConvite(evAtual()), 'Link do convite copiado.');
      if (a === 'rsvp-atualizar') carregarRsvp(S.paginaEv, { avisar: true });
      if (a === 'rsvp-novo') novaResposta(null);
      if (a === 'conv-importar') importarConvidados();
      if (a === 'conv-colar-abrir') { const d = $('#conv-import'); if (d) { d.open = true; d.scrollIntoView({ block: 'nearest' }); $('#conv-colar').focus(); } }
      if (a === 'rec-abrir') abrirRecepcao();
      if (a === 'msg-abrir') abrirMensagens();
      if (a === 'itens-sug') sugerirItensFesta(b.dataset.itsug);
      if (a === 'modelo-exemplo') {
        const ev = evAtual();
        if (String(ev.convite.modelo_html || '').trim() && !confirm('Trocar o HTML atual pelo modelo de exemplo?')) return;
        fetch('modelos/convite-exemplo.html', { cache: 'no-store' }).then((r) => r.text()).then((txt) => { ev.convite.modelo_html = txt; salvarEvento(ev); })
          .catch(() => toast('Não consegui abrir o modelo de exemplo.'));
      }
      if (a === 'modelo-baixar') {
        const ev = evAtual(); const txt = ev.convite.modelo_html || '';
        if (!txt) { toast('Ainda não há HTML.'); return; }
        const el = document.createElement('a');
        el.href = URL.createObjectURL(new Blob([txt], { type: 'text/html;charset=utf-8' }));
        el.download = `convite-${ev.id}.html`; document.body.appendChild(el); el.click(); el.remove();
      }
      if (a === 'rec-novo') chegouSemConfirmar();
      if (a === 'conv-lembrar') abrirLembretes();
      if (a === 'rsvp-csv') exportarRespostas();
      if (a === 'rsvp-imprimir') imprimirPresenca();
      if (a === 'conv-usar') {
        const ev = evAtual(); const L = lotacao(ev);
        ev.adultos = L.adultos; ev.criancas = L.criancas; salvarEvento(ev);
        toast(`Convidados do evento: ${L.adultos} adultos e ${L.criancas} crianças.`);
      }
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
      if (a === 'esquecer-chave') { S.chave = ''; lsSet(LS.chave, ''); toast('Você saiu. Para excluir, entre com a chave de novo.'); $('#config').close(); atualizarSync(); }
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
    if (t.id === 'in-modelo' && t.files[0] && S.paginaEv) {
      const f = t.files[0];
      if (f.size > 200000) { toast('Arquivo grande demais (máximo 200 KB). Use links para as imagens.'); return; }
      f.text().then((txt) => { const ev = evAtual(); ev.convite.modelo_html = txt; salvarEvento(ev); toast('Modelo carregado. Toque em Ver convite para conferir.'); });
      return;
    }
    if (t.matches('[data-rsvp]') && S.paginaEv) { editarResposta(t); return; }
    if (t.matches('[data-evc]') && S.paginaEv) {
      const ev = evAtual();
      const tp = t.dataset.tipo;
      let v = tp === 'bool' ? t.checked : t.value.trim();
      if (tp === 'num') {
        v = numDe(v);
        if (v == null && t.value.trim()) { toast('Não entendi o valor. Use números, ex.: 1.500'); t.value = ''; }
      }
      if (t.dataset.evc === 'convite.modelo_html' && String(v).length > 200000) { toast('O HTML passou de 200.000 caracteres. Tire imagens embutidas e use links.'); return; }
      setCaminho(ev, t.dataset.evc, v);
      // Mudar a categoria muda o agrupamento do orçamento: redesenha a página.
      const estrutura = t.tagName === 'SELECT' || tp === 'bool' || /^gastos\.\d+\.categoria$/.test(t.dataset.evc) || /^escolhas\.\d+\.pessoas$|^buffet_isento_ate$|^convite\.prazo$|^convidados\.\d+\.lugares$/.test(t.dataset.evc);
      salvarEvento(ev, { render: estrutura });
      if (!estrutura && /^(itens_festa\.|mesas$|pessoas_mesa$)/.test(t.dataset.evc)) { const it = $('#itens-corpo'); if (it) it.innerHTML = itensHtml(ev); }
      if (!estrutura) {
        atualizarPainel(ev);
        if (t.dataset.evc.startsWith('gastos.')) atualizarOrc(ev);
        if (t.dataset.evc.startsWith('convidados.')) atualizarConvite();
      }
    }
  });

  const timersCampo = {};
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'msg-texto') { MSG.texto = t.value; MSG.editado = true; $('#msg-lista').innerHTML = listaMensagens(); return; }
    if (t.id === 'conv-busca') { S.convBusca = t.value; refazerTabelaConv(); return; }
    if (t.id === 'rec-busca') { REC.busca = t.value; $('#rec-lista').innerHTML = listaRecepcao(); return; }
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
    escolhas: [], gastos: [], tarefas: [], cronograma: [], convite: {}, convidados: [], presentes: [], itens_festa: [], mesas: null, pessoas_mesa: null, buffet_isento_ate: null,
  });
  function evCompleto(bruto) {
    const ev = Object.assign(novoEvento(), bruto);
    ev.gastos = (Array.isArray(ev.gastos) ? ev.gastos : []).map(normGasto);
    ev.convite = { ...(ev.convite && typeof ev.convite === 'object' ? ev.convite : {}) };
    ev.convidados = (Array.isArray(ev.convidados) ? ev.convidados : []).filter(Boolean);
    ev.presentes = (Array.isArray(ev.presentes) ? ev.presentes : []).filter(Boolean);
    ev.itens_festa = (Array.isArray(ev.itens_festa) ? ev.itens_festa : []).filter(Boolean);
    return ev;
  }
  const eventosAtivos = () => Object.values(S.eventos).filter((e) => e && !e.removido)
    .sort((a, b) => (a.data || '9999').localeCompare(b.data || '9999') || (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  const eventosCom = (id) => eventosAtivos().flatMap((ev) => (ev.escolhas || []).filter((e) => e.id === id).map((e) => ({ ev, esc: e })));
  const privTxt = () => (!API ? 'Nuvem não configurada neste site.'
    : 'Os eventos ficam na nuvem e aparecem para quem abrir o site. A chave de edição só é pedida para excluir.');

  // Guardar na nuvem (com cópia de trabalho no navegador para não perder nada sem conexão).
  let timerEv = null;
  function salvarEvento(ev, { render = true } = {}) {
    ev.atualizado_em = new Date().toISOString();
    S.eventos[ev.id] = ev;
    lsSet(LS.eventos, S.eventos);
    if (API) { S.evPend.add(ev.id); lsSet(LS.evPend, [...S.evPend]); }
    clearTimeout(timerEv); timerEv = setTimeout(sincronizarEventos, 800);
    if (render) renderTudo();
  }
  async function sincronizarEventos() {
    if (!API || !S.evPend.size) return;
    for (const id of [...S.evPend]) {
      try {
        const r = await fetch(`${API}/dados/eventos/${encodeURIComponent(id)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', ...(S.eventos[id].removido && S.chave ? { 'X-Chave': S.chave } : {}) }, body: JSON.stringify(S.eventos[id]),
        });
        if (r.status === 401) { toast('Chave de edição recusada. O evento não foi excluído na nuvem.'); break; }
        if (!r.ok) throw new Error(r.status);
        S.evPend.delete(id);
      } catch { /* tenta de novo depois */ }
    }
    lsSet(LS.evPend, [...S.evPend]);
  }
  async function carregarEventos() {
    if (!API) return;
    try {
      const r = await fetch(`${API}/dados/eventos`, { cache: 'no-store' });
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
        ${(() => { const ls = ev.escolhas.filter((e) => e.status !== 'descartado').sort((a, b) => (fechado(b.status) ? 1 : 0) - (fechado(a.status) ? 1 : 0)).map((e) => S.porId[e.id]).filter(Boolean);
          return ls.length ? `<div class="ev-fotos" aria-label="Fornecedores do evento">${ls.slice(0, 6).map((l) => `<span title="${esc(l.nome)}">${miniCapa(l)}</span>`).join('')}${ls.length > 6 ? `<span class="ev-mais">+${ls.length - 6}</span>` : ''}</div>` : ''; })()}
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


  /* ---- Convites e confirmações ---- */
  const idCurto = () => Math.random().toString(36).slice(2, 8);
  const ESTILOS_CONV = [['ouro', 'Dourado'], ['rosa', 'Rosa'], ['azul', 'Azul'], ['verde', 'Verde'], ['lilas', 'Lilás'], ['sol', 'Laranja']];
  const RESP = [['sim', 'Confirmado'], ['talvez', 'Talvez'], ['nao', 'Não vai']];
  const respRot = (k) => (RESP.find((x) => x[0] === k) || [, 'Sem resposta'])[1];
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
  const idadeTxt = (x) => (x === 0 ? '<1' : String(x));
  function capCatalogo(l) {
    if (!l) return null;
    if ((l.cat || 'espacos') === 'espacos') return l.capacidade || null;
    const qs = (l.objetos || []).map((o) => Number(o && o.qtd)).filter((n) => n > 0);
    return qs.length ? Math.max(...qs) : null;
  }
  function linkConvite(ev, cv) {
    const u = new URL('convite.html', location.href);
    u.search = ''; u.hash = '';
    u.searchParams.set('e', ev.id);
    if (cv) u.searchParams.set('c', cv.id);
    return u.toString();
  }
  function textoConvite(ev, cv) {
    const tit = ev.convite.titulo || ev.nome;
    const quando = ev.data ? ` no dia ${dataBR(ev.data)}${ev.hora_inicio ? `, às ${ev.hora_inicio}` : ''}` : '';
    return `${cv && cv.nome ? `Olá, ${cv.nome.split(' ')[0]}! ` : ''}Você está convidado(a) para ${tit}${quando}. Veja o convite e confirme sua presença: ${linkConvite(ev, cv)}`;
  }
  const zapConvite = (ev, cv) => {
    const tel = cv && digitos(cv.telefone);
    return `https://wa.me/${tel ? (tel.length <= 11 ? '55' + tel : tel) : ''}?text=${encodeURIComponent(textoConvite(ev, cv))}`;
  };
  async function copiar(txt, ok) {
    try { await navigator.clipboard.writeText(txt); toast(ok); }
    catch { prompt('Copie o link:', txt); }
  }
  const rsvpsDe = (id) => S.rsvp[id] || [];
  async function carregarRsvp(id, { avisar = false } = {}) {
    if (!API || !id) return;
    try {
      const r = await fetch(`${API}/dados/confirmacoes?evento=${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      S.rsvp[id] = (await r.json()).map((x) => ({ ...x.dados, id: x.id })).filter((x) => !x.removido && x.evento === id);
      if (avisar) toast(`${plural(S.rsvp[id].length, 'resposta', 'respostas')}.`);
      if (S.paginaEv === id) atualizarConvite();
    } catch { if (avisar) toast('Não consegui buscar as respostas agora.'); }
  }
  async function salvarResposta(reg) {
    reg.atualizado_em = new Date().toISOString();
    const lista = S.rsvp[reg.evento] || (S.rsvp[reg.evento] = []);
    const i = lista.findIndex((x) => x.id === reg.id);
    if (i >= 0) lista[i] = reg; else lista.push(reg);
    atualizarConvite();
    try {
      const { id, ...dados } = reg;
      const r = await fetch(`${API}/dados/confirmacoes/${encodeURIComponent(id)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados),
      });
      if (!r.ok) throw new Error(r.status);
    } catch { toast('Não consegui salvar a resposta na nuvem. Tente de novo.'); }
  }
  function novaResposta(convId) {
    const ev = evAtual();
    if (!API) { toast('A nuvem não está configurada.'); return; }
    const cv = convId ? ev.convidados.find((x) => x.id === convId) : null;
    const id = cv ? `${ev.id}-${cv.id}` : `${ev.id}-m${idCurto()}`;
    S.convF = 'todos'; S.convBusca = ''; S.convAberto.add(cv ? 'c:' + cv.id : 'r:' + id);
    if (S.abaEv !== 'convidados') irAbaEv('convidados');
    if (rsvpsDe(ev.id).some((x) => x.id === id)) { refazerTabelaConv(); document.querySelector(`[data-rsvp-linha="${id}"]`)?.scrollIntoView({ block: 'center' }); return; }
    salvarResposta({ id, evento: ev.id, convidado: cv ? cv.id : null, nome: cv ? cv.nome : '', resposta: 'sim',
      adultos: cv && numV(cv.lugares) ? cv.lugares : 1, criancas: 0, idades: [], contato: cv ? cv.telefone || '' : '', mensagem: '', manual: true });
    refazerTabelaConv();
    setTimeout(() => { const el = document.querySelector(`[data-rsvp-linha="${id}"] input`); if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); } }, 50);
  }
  function editarResposta(t) {
    const [id, k] = t.dataset.rsvp.split('|');
    const reg = rsvpsDe(S.paginaEv).find((x) => x.id === id);
    if (!reg) return;
    let v = t.value.trim();
    if (k === 'adultos' || k === 'criancas') v = Math.max(0, Math.min(99, parseInt(v, 10) || 0));
    if (k === 'idades') {
      // Aceita "3, 7" ou com o sexo: "3m, 7f, <1f" (m = menino, f = menina).
      const toks = v.split(/[,;\s]+/).filter(Boolean).map((x) => {
        const m = /^(<\s*1|\d{1,2})\s*([mf])?$/i.exec(x.trim());
        if (!m) return null;
        const id = /^</.test(m[1]) ? 0 : parseInt(m[1], 10);
        return id >= 0 && id < 18 ? { id, sx: m[2] ? m[2].toLowerCase() : null } : null;
      }).filter(Boolean);
      v = toks.map((t) => t.id);
      reg.sexos = toks.map((t) => t.sx);
    }
    reg[k] = v;
    if (k === 'criancas' && Array.isArray(reg.idades)) reg.idades = reg.idades.slice(0, v);
    if (k === 'resposta' && v === 'nao') { reg.adultos = reg.adultos || 0; }
    salvarResposta({ ...reg });
  }
  function lotacao(ev) {
    const rs = rsvpsDe(ev.id);
    const soma = (l, k) => l.reduce((a, r) => a + (Number(r[k]) || 0), 0);
    const sim = rs.filter((r) => r.resposta === 'sim'), talvez = rs.filter((r) => r.resposta === 'talvez'), nao = rs.filter((r) => r.resposta === 'nao');
    const adultos = soma(sim, 'adultos'), criancas = soma(sim, 'criancas');
    const total = adultos + criancas;
    const maisTalvez = total + soma(talvez, 'adultos') + soma(talvez, 'criancas');
    const idades = sim.flatMap((r) => (Array.isArray(r.idades) ? r.idades : [])).filter((x) => x != null).sort((a, b) => a - b);
    const lim = typeof ev.buffet_isento_ate === 'number' ? ev.buffet_isento_ate : null;
    const isentas = lim == null ? 0 : idades.filter((x) => x <= lim).length;
    const buffet = total - isentas;
    const respondeu = new Set(rs.map((r) => r.convidado).filter(Boolean));
    const semResposta = ev.convidados.filter((c) => c.nome && !respondeu.has(c.id)).length;
    const limites = ev.escolhas.filter((e) => fechado(e.status) && (e.cat === 'espacos' || e.cat === 'buffet')).map((e) => {
      const l = S.porId[e.id];
      const cap = numV(e.pessoas) || capCatalogo(l);
      const usado = e.cat === 'buffet' ? buffet : total;
      const usadoTalvez = e.cat === 'buffet' ? buffet + (maisTalvez - total) : maisTalvez;
      return { cat: e.cat, nome: (l && l.nome) || e.nome, cap, usado, passou: cap ? usado > cap : false, risco: cap ? usado <= cap && usadoTalvez > cap : false, sobra: cap ? cap - usado : null };
    });
    return { rs, sim, talvez, nao, adultos, criancas, total, maisTalvez, idades, lim, isentas, buffet, semResposta, limites };
  }
  function avisosLotacao(L) {
    return L.limites.map((x) => {
      const nome = esc(x.nome);
      const oque = x.cat === 'buffet' ? `o buffet (${nome})` : `o espaço (${nome})`;
      const doque = x.cat === 'buffet' ? `do buffet (${nome})` : `do espaço (${nome})`;
      if (!x.cap) return `<p class="nota-aviso neutro">${ic('alerta')}<span>Informe para quantas pessoas é ${oque} para acompanhar a lotação.</span></p>`;
      if (x.passou) return `<p class="nota-aviso ruim">${ic('alerta')}<span><strong>Passou da capacidade ${doque}:</strong> ${x.usado} confirmados${x.cat === 'buffet' && L.isentas ? ' que contam no buffet' : ''} para ${x.cap} ${x.cap === 1 ? 'lugar' : 'lugares'}. ${x.usado - x.cap === 1 ? 'Falta 1 lugar' : `Faltam ${x.usado - x.cap} lugares`}.</span></p>`;
      if (x.risco) return `<p class="nota-aviso">${ic('alerta')}<span>Se os “talvez” vierem, passa da capacidade ${doque}: ${x.cap} lugares.</span></p>`;
      return '';
    }).join('');
  }
  function cardLotacao(ev) {
    if (!ev.convidados.length && !rsvpsDe(ev.id).length) return '';
    const L = lotacao(ev);
    return `<div class="orc-card"><h3>Confirmados</h3>
      <p class="orc-grande">${L.total} <small>${L.total === 1 ? 'pessoa' : 'pessoas'}</small></p>
      <p class="orc-sub">${plural(L.adultos, 'adulto', 'adultos')} · ${plural(L.criancas, 'criança', 'crianças')}${L.talvez.length ? ` · ${L.maisTalvez - L.total} talvez` : ''}${L.semResposta ? ` · ${L.semResposta} sem resposta` : ''}</p>
      ${L.limites.filter((x) => x.cap).map((x) => `<div class="lot-linha ${x.passou ? 'ruim' : ''}"><span>${esc(x.cat === 'buffet' ? 'Buffet' : 'Espaço')}</span><strong>${x.usado} / ${x.cap}</strong></div>
        <div class="orc-barra"><span class="${x.passou ? 'b-passou' : 'b-pago'}" style="width:${Math.min(100, (x.usado / x.cap) * 100).toFixed(1)}%"></span></div>`).join('')}
      ${avisosLotacao(L)}</div>`;
  }
  function lotacaoHtml(ev, { curto = false } = {}) {
    const L = lotacao(ev);
    const fx = (n) => { const m = {}; n.forEach((x) => { const k = x <= 2 ? '0 a 2 anos' : x <= 5 ? '3 a 5 anos' : x <= 9 ? '6 a 9 anos' : '10 a 17 anos'; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).map(([k, v]) => `${v} de ${k}`).join(' · '); };
    return `${curto ? (L.idades.length ? `<p class="lot-cri"><strong>Crianças confirmadas:</strong> ${esc(fx(L.idades))}</p>` : '') : `<dl class="lot-nums">
        <div><dt>Confirmados</dt><dd>${L.total}</dd><small>${plural(L.sim.length, 'resposta', 'respostas')}</small></div>
        <div><dt>Adultos</dt><dd>${L.adultos}</dd></div>
        <div><dt>Crianças</dt><dd>${L.criancas}</dd><small>${L.idades.length ? esc(fx(L.idades)) : ''}</small></div>
        <div><dt>Talvez</dt><dd>${L.maisTalvez - L.total}</dd></div>
        <div><dt>Não vão</dt><dd>${L.nao.length}</dd></div>
        <div><dt>Sem resposta</dt><dd>${L.semResposta}</dd><small>da lista</small></div>
      </dl>`}
      ${L.limites.length ? `<ul class="lot-limites">${L.limites.map((x) => `<li class="${x.passou ? 'ruim' : x.risco ? 'meio' : 'ok'}">
          <span>${ic(x.cat === 'buffet' ? 'buffet' : 'salao')}<strong>${esc(x.nome)}</strong></span>
          <span>${x.cap ? `${x.usado} de ${x.cap} ${x.cat === 'buffet' ? 'no buffet' : 'pessoas'}${x.passou ? ` · <b>passou ${x.usado - x.cap}</b>` : ` · sobram ${x.sobra}`}` : 'capacidade não informada'}</span></li>`).join('')}</ul>`
        : '<p class="meta">Marque com a estrela o espaço e o buffet escolhidos para comparar os confirmados com o que eles comportam.</p>'}
      ${(() => {
        const pa = numV(ev.adultos), pc = numV(ev.criancas);
        const prev = pa || pc ? `Previsto no evento: ${plural(pa, 'adulto', 'adultos')} e ${plural(pc, 'criança', 'crianças')}.` : 'O evento ainda não tem número de convidados previsto.';
        const dif = L.total && (pa !== L.adultos || pc !== L.criancas);
        return `<p class="lot-prev">${prev}${dif ? ` <button type="button" class="link-btn" data-acao="conv-usar">Usar os confirmados (${L.adultos} + ${L.criancas})</button>` : ''}</p>`;
      })()}
      <label class="campo lot-isento"><span>No buffet, crianças até quantos anos não contam?</span>
        <input data-evc="buffet_isento_ate" data-tipo="num" inputmode="numeric" value="${L.lim != null ? L.lim : ''}" placeholder="ex.: 5 (vazio = todas contam)"></label>
      ${avisosLotacao(L)}`;
  }
  function statusConvidado(ev, cv) {
    const r = rsvpsDe(ev.id).find((x) => x.convidado === cv.id);
    if (!r) return '<span class="chip-st pend">Sem resposta</span>';
    const n = (Number(r.adultos) || 0) + (Number(r.criancas) || 0);
    return `<span class="chip-st st-${esc(r.resposta)}">${esc(respRot(r.resposta))}${r.resposta !== 'nao' && n ? ` · ${n}` : ''}</span>`;
  }
  /* ---- Convidados: uma tabela só (lista + respostas) ---- */
  const CONV_F = [['todos', 'Todos'], ['sim', 'Confirmados'], ['talvez', 'Talvez'], ['nao', 'Não vão'], ['pend', 'Sem resposta']];
  function linhasConv(ev) {
    const rs = rsvpsDe(ev.id);
    const ids = new Set(ev.convidados.map((c) => c.id));
    const ls = ev.convidados.map((cv, i) => ({ k: 'c:' + cv.id, cv, i, r: rs.find((x) => x.convidado === cv.id) || null }));
    rs.filter((r) => !r.convidado || !ids.has(r.convidado)).forEach((r) => ls.push({ k: 'r:' + r.id, cv: null, i: -1, r }));
    return ls.map((x) => ({ ...x, st: x.r ? x.r.resposta : 'pend', nome: (x.cv && x.cv.nome) || (x.r && x.r.nome) || '' }));
  }
  function convFiltradas(ev) {
    const f = S.convF || 'todos', q = norm(S.convBusca || '');
    return linhasConv(ev).filter((x) => (f === 'todos' || x.st === f)
      && (!q || norm([x.nome, x.cv && x.cv.telefone, x.r && x.r.contato].filter(Boolean).join(' ')).includes(q)));
  }
  function convNums(ev) {
    const L = lotacao(ev);
    const f = S.convF || 'todos';
    const card = (k, rot, v, sub) => `<button type="button" class="cnum-card c-${k}" data-conv-f="${k}" aria-pressed="${f === k}"><span>${rot}</span><strong>${v}</strong><small>${sub}</small></button>`;
    const buf = L.limites.find((x) => x.cat === 'buffet' && x.cap) || L.limites.find((x) => x.cap);
    return card('sim', 'Confirmados', L.total, L.total ? `${plural(L.adultos, 'adulto', 'adultos')} · ${plural(L.criancas, 'criança', 'crianças')}` : 'pessoas')
      + card('talvez', 'Talvez', L.maisTalvez - L.total, plural(L.talvez.length, 'resposta', 'respostas'))
      + card('nao', 'Não vão', L.nao.length, L.nao.length === 1 ? 'resposta' : 'respostas')
      + card('pend', 'Sem resposta', L.semResposta, `de ${plural(ev.convidados.filter((c) => c.nome).length, 'convite', 'convites')}`)
      + (buf ? `<div class="cnum-card c-cap ${buf.passou ? 'ruim' : ''}"><span>${buf.cat === 'buffet' ? 'Buffet' : 'Espaço'}</span><strong>${buf.usado}<small> / ${buf.cap}</small></strong><small>${buf.passou ? `passou ${buf.usado - buf.cap}` : `sobram ${buf.sobra}`}</small></div>` : '');
  }
  function pessoasConv(x) {
    const { cv, r } = x;
    if (!r) return cv && numV(cv.lugares) ? `<span class="fraco">convite para ${cv.lugares}</span>` : '<span class="fraco">—</span>';
    if (r.resposta === 'nao') return '<span class="fraco">—</span>';
    const ad = Number(r.adultos) || 0, cr = Number(r.criancas) || 0;
    return [ad ? plural(ad, 'adulto', 'adultos') : null, cr ? plural(cr, 'criança', 'crianças') : null].filter(Boolean).join(' + ') || '<span class="fraco">—</span>';
  }
  function detalhesConv(ev, x) {
    const { r } = x;
    if (!r) return x.cv && x.cv.telefone ? `<span class="fraco">${esc(x.cv.telefone)}</span>` : '';
    const sx = (j) => ({ m: ' menino', f: ' menina' }[(r.sexos || [])[j]] || '');
    const idades = (r.idades || []).map((v, j) => (v == null ? null : `${idadeTxt(v)} ${v === 1 ? 'ano' : 'anos'}${sx(j)}`)).filter(Boolean);
    const pres = r.presente && ev.presentes.find((g) => g.id === r.presente);
    return [idades.length ? esc(idades.join(', ')) : null, pres ? `presente: ${esc(pres.nome)}` : null, r.mensagem ? `<em>“${esc(r.mensagem)}”</em>` : null,
      `<span class="fraco">${x.cv ? (r.manual ? 'lançada aqui' : 'pelo link') : r.manual ? 'fora da lista, lançada aqui' : 'fora da lista, pelo link'}</span>`].filter(Boolean).join(' · ');
  }
  function resumoConv(ev, x) {
    const aberto = S.convAberto.has(x.k);
    return `<span class="ct-nome"><strong>${esc(x.nome) || '<span class="fraco">Sem nome</span>'}</strong>${x.cv && x.cv.telefone ? `<small>${esc(x.cv.telefone)}</small>` : x.r && x.r.contato ? `<small>${esc(x.r.contato)}</small>` : ''}</span>
      <span class="ct-st">${x.r ? `<span class="chip-st st-${esc(x.r.resposta)}">${esc(respRot(x.r.resposta))}</span>` : '<span class="chip-st pend">Sem resposta</span>'}</span>
      <span class="ct-pes">${pessoasConv(x)}</span>
      <span class="ct-det">${detalhesConv(ev, x)}</span>
      <span class="ct-acoes">${x.cv ? `<a class="mini zap" href="${esc(zapConvite(ev, x.cv))}" target="_blank" rel="noopener" title="Abrir o WhatsApp com o convite de ${esc(x.nome)}">${ic('zap')}<span class="lbl">Enviar</span></a>` : ''}
        <button type="button" class="mini" data-conv-abrir="${esc(x.k)}" aria-expanded="${aberto}" title="${aberto ? 'Fechar' : 'Editar'}">${ic(aberto ? 'x' : 'editar')}<span class="sr">${aberto ? 'Fechar' : 'Editar'}</span></button></span>`;
  }
  function editorConv(ev, x) {
    const { cv, r, i } = x;
    const f = (k) => `data-rsvp="${esc(r.id)}|${k}"`;
    return `<div class="ct-ed">
      ${cv ? `<div class="ct-ed-grupo"><p class="ct-ed-tit">Convite</p><div class="ct-ed-campos">
        <label class="campo"><span>Nome</span><input data-evc="convidados.${i}.nome" maxlength="80" value="${esc(cv.nome || '')}" placeholder="ex.: Família Souza"></label>
        <label class="campo"><span>WhatsApp</span><input data-evc="convidados.${i}.telefone" maxlength="30" inputmode="tel" value="${esc(cv.telefone || '')}" placeholder="63 9…"></label>
        <label class="campo cnum"><span>Lugares</span><input data-evc="convidados.${i}.lugares" data-tipo="num" inputmode="numeric" value="${cv.lugares != null ? esc(cv.lugares) : ''}" placeholder="ex.: 4" title="Quantas pessoas o convite inclui"></label></div>
        <div class="acoes-linha"><button type="button" class="mini" data-conv-link="${esc(cv.id)}">Copiar link do convite</button>
          ${r ? '' : `<button type="button" class="mini" data-conv-resp="${esc(cv.id)}" title="Para quem respondeu por telefone ou pessoalmente">${ic('check')}Lançar resposta</button>`}
          <span class="esp"></span><button type="button" class="link-btn perigo" data-ev-tirar="convidados:${i}">Tirar da lista</button></div></div>` : ''}
      ${r ? `<div class="ct-ed-grupo" data-rsvp-linha="${esc(r.id)}"><p class="ct-ed-tit">Resposta</p><div class="ct-ed-campos">
        ${cv ? '' : `<label class="campo"><span>Nome</span><input ${f('nome')} maxlength="80" value="${esc(r.nome || '')}" placeholder="Nome"></label>`}
        <label class="campo"><span>Situação</span><select ${f('resposta')}>${RESP.map(([k, rot]) => `<option value="${k}" ${k === r.resposta ? 'selected' : ''}>${rot}</option>`).join('')}</select></label>
        <label class="campo cnum"><span>Adultos</span><input ${f('adultos')} type="number" min="0" max="99" inputmode="numeric" value="${Number(r.adultos) || 0}"></label>
        <label class="campo cnum"><span>Crianças</span><input ${f('criancas')} type="number" min="0" max="99" inputmode="numeric" value="${Number(r.criancas) || 0}"></label>
        <label class="campo"><span>Idades das crianças</span><input ${f('idades')} value="${esc((r.idades || []).map((v, j) => (v == null ? null : idadeTxt(v) + ((r.sexos || [])[j] || ''))).filter(Boolean).join(', '))}" placeholder="ex.: 3m, 7f" title="m = menino, f = menina"></label></div>
        <p class="meta">${[r.contato ? `Contato: ${esc(r.contato)}` : null, r.atualizado_em ? `Atualizada em ${dataBR(r.atualizado_em.slice(0, 10))}` : null, 'Idades: 3m = menino de 3 anos, 7f = menina de 7'].filter(Boolean).join(' · ')}</p></div>` : ''}
    </div>`;
  }
  function convTabela(ev) {
    const todas = linhasConv(ev);
    if (!todas.length) {
      return `<div class="conv-vazio">${ic('pessoas')}<p><strong>A lista de convidados está vazia.</strong> Adicione um por um ou cole a lista inteira. Cada convidado recebe um link com o nome dele, e as respostas aparecem aqui.</p>
        <div class="acoes-linha"><button type="button" class="btn ouro" data-ev-add="convidados">${ic('mais')}Adicionar convidado</button>
        <button type="button" class="btn" data-acao="conv-colar-abrir">Colar uma lista</button></div></div>`;
    }
    const ls = convFiltradas(ev);
    return `<div class="ctab">
      <div class="ctab-cab" aria-hidden="true"><span>Convidado</span><span>Situação</span><span>Pessoas</span><span>Detalhes</span><span></span></div>
      ${ls.length ? ls.map((x) => `<div class="ct-linha st-${x.st} ${S.convAberto.has(x.k) ? 'aberta' : ''}" data-conv-k="${esc(x.k)}">
        <div class="ct-res" data-conv-sum="${esc(x.k)}">${resumoConv(ev, x)}</div>
        ${S.convAberto.has(x.k) ? editorConv(ev, x) : ''}</div>`).join('')
        : `<p class="texto vazio-cat">Ninguém ${S.convBusca ? 'com esse nome ' : ''}neste filtro.</p>`}
      <p class="ctab-pe">${ls.length === todas.length ? plural(todas.length, 'linha', 'linhas') : `${ls.length} de ${todas.length} linhas`}</p>
    </div>`;
  }
  function filtrosConv() {
    const f = S.convF || 'todos';
    return CONV_F.map(([k, r]) => `<button type="button" data-conv-f="${k}" aria-pressed="${f === k}">${r}</button>`).join('');
  }
  function refazerTabelaConv() {
    const ev = evAtual(); if (!ev) return;
    const t = $('#conv-tabela'); if (t) t.innerHTML = convTabela(ev);
    document.querySelectorAll('[data-conv-f]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.convF === (S.convF || 'todos')));
  }
  function abaConvidados(ev) {
    const cv = ev.convite;
    return `<div class="aba-cab"><div><h2>Convidados</h2>
        <p class="meta">A lista e as respostas ficam juntas. Toque no lápis de uma linha para editar o convite ou a resposta.</p></div>
        <div class="acoes-linha">
          <button type="button" class="btn ouro" data-ev-add="convidados">${ic('mais')}Adicionar convidado</button>
          <button type="button" class="btn" data-acao="conv-colar-abrir">Colar lista</button>
          <button type="button" class="btn" data-acao="rsvp-novo" title="Para quem respondeu e não está na lista">Lançar resposta</button>
          <button type="button" class="btn" data-acao="rec-abrir">${ic('check')}Recepção</button></div></div>
      <details class="conv-cfg conv-import" id="conv-import"><summary>Colar uma lista de convidados</summary>
        <p class="ajuda">Um convidado por linha. Pode ter o WhatsApp e quantas pessoas o convite inclui, por exemplo:<br><code>Família Souza; 63 99999-0000; 4</code><br><code>Tia Ana 63988887777 2</code></p>
        <textarea id="conv-colar" rows="5" placeholder="Família Souza; 63 99999-0000; 4"></textarea>
        <button type="button" class="btn" data-acao="conv-importar">${ic('mais')}Adicionar à lista</button>
      </details>
      <div class="cnum-grade" id="conv-nums">${convNums(ev)}</div>
      <div class="ev-grade">
        <div class="ev-principal">
          <div class="ct-barra">
            <label class="ct-busca">${ic('alvo')}<input id="conv-busca" type="search" value="${esc(S.convBusca || '')}" placeholder="Buscar convidado" aria-label="Buscar convidado"></label>
            <div class="seg-f" role="group" aria-label="Filtrar">${filtrosConv()}</div>
            <span class="esp"></span>
            <div class="ct-ferr">
              <button type="button" class="mini" data-acao="msg-abrir">${ic('zap')}Mensagem</button>
              <button type="button" class="mini" data-acao="conv-lembrar">${ic('zap')}Lembrar</button>
              <button type="button" class="mini" data-acao="rsvp-csv">Planilha</button>
              <button type="button" class="mini" data-acao="rsvp-imprimir">${ic('imprimir')}Lista de presença</button>
              <button type="button" class="mini" data-acao="rsvp-atualizar" title="Buscar respostas novas">Atualizar</button></div>
          </div>
          <div id="conv-tabela">${convTabela(ev)}</div>
        </div>
        <aside class="ev-lado">
          <div class="orc-card conv-prazo"><h3>Prazo para confirmar</h3>
            <label class="campo"><span class="sr">Data limite</span><input type="date" data-evc="convite.prazo" value="${esc(cv.prazo || '')}" ${ev.data ? `max="${esc(ev.data)}"` : ''}></label>
            <label class="chk"><input type="checkbox" data-evc="convite.aceitar_apos_prazo" data-tipo="bool" ${cv.aceitar_apos_prazo ? 'checked' : ''}>Aceitar respostas depois do prazo</label>
            <p class="prazo-st">${prazoStatus(ev)}</p></div>
          <div class="orc-card"><h3>Lotação</h3><div id="conv-lotacao" class="lotacao">${lotacaoHtml(ev, { curto: true })}</div></div>
        </aside>
      </div>`;
  }
  function abaConvite(ev) {
    const cv = ev.convite;
    const auto = cv.local_auto;
    return `<div class="aba-cab"><div><h2>Convite</h2>
        <p class="meta">O convite é uma página com os dados da festa, o mapa e a confirmação de presença. Cada convidado da lista recebe um link com o nome dele.</p></div></div>
      <div class="conv-share">
        <div><strong>${esc(cv.titulo || ev.nome)}</strong><small>${prazoStatus(ev)}</small></div>
        <div class="acoes-linha">
          <a class="btn ouro" href="${esc(linkConvite(ev))}" target="_blank" rel="noopener">${ic('olho')}Ver convite</a>
          <a class="btn zap" href="${esc(zapConvite(ev, null))}" target="_blank" rel="noopener">${ic('zap')}Enviar no WhatsApp</a>
          <button type="button" class="btn" data-acao="conv-copiar">Copiar link geral</button></div>
      </div>
      <details class="conv-cfg" open><summary>Aparência e textos</summary>
        <label class="campo"><span>Aparência do convite</span><select data-evc="convite.modelo">
          <option value="" ${cv.modelo !== 'html' ? 'selected' : ''}>Modelo pronto (escolho as cores)</option>
          <option value="html" ${cv.modelo === 'html' ? 'selected' : ''}>Meu próprio HTML (design livre)</option></select></label>
        ${cv.modelo === 'html' ? `<div class="modelo-html">
          <p class="ajuda">Cole aqui o HTML do convite com o seu design. Onde quiser os dados do evento, escreva os campos entre chaves duplas:
            <code>{{titulo}}</code> <code>{{ola}}</code> <code>{{data}}</code> <code>{{dia}}</code> <code>{{mes}}</code> <code>{{horario}}</code> <code>{{local}}</code> <code>{{endereco}}</code> <code>{{tema}}</code> <code>{{mensagem}}</code> <code>{{prazo}}</code> <code>{{faltam}}</code>.
            E coloque os blocos prontos onde eles devem aparecer: <code>{{confirmacao}}</code> (confirmação de presença), <code>{{mapa}}</code>, <code>{{agenda}}</code> e <code>{{presentes}}</code>.
            Os blocos usam a fonte e a cor do texto do seu HTML; as cores dos botões vêm das variáveis <code>--cor</code>, <code>--cor-escura</code>, <code>--cor-fundo</code> e <code>--linha</code> do seu CSS.
            Scripts não rodam no convite e imagens precisam ser links (https://…).</p>
          <div class="acoes-linha">
            <button type="button" class="btn ghost" data-acao="modelo-exemplo">Começar com o modelo de exemplo</button>
            <label class="btn ghost"><input type="file" id="in-modelo" accept=".html,.htm,text/html" hidden>Carregar arquivo .html</label>
            <button type="button" class="btn ghost" data-acao="modelo-baixar">Baixar o HTML</button>
          </div>
          <textarea class="codigo" data-evc="convite.modelo_html" rows="14" spellcheck="false" autocapitalize="off" placeholder="<!doctype html>…">${esc(cv.modelo_html || '')}</textarea>
          <p class="meta">${(cv.modelo_html || '').length.toLocaleString('pt-BR')} de 200.000 caracteres. ${String(cv.modelo_html || '').includes('{{confirmacao}}') ? '' : 'Sem <code>{{confirmacao}}</code>, a confirmação aparece no fim da página.'}</p>
        </div>` : ''}
        <div class="grade-2">
          <label class="campo largo"><span>Título</span><input data-evc="convite.titulo" maxlength="120" value="${esc(cv.titulo || '')}" placeholder="${esc(ev.nome)}"></label>
          <label class="campo largo"><span>Frase de abertura</span><input data-evc="convite.chamada" maxlength="120" value="${esc(cv.chamada || '')}" placeholder="Você é nosso convidado especial para"></label>
          <label class="campo largo"><span>Mensagem</span><textarea data-evc="convite.mensagem" rows="3" maxlength="1000" placeholder="ex.: Venha comemorar com a gente! Traje: confortável.">${esc(cv.mensagem || '')}</textarea></label>
          <label class="campo"><span>Nome do local</span><input data-evc="convite.local_nome" maxlength="120" value="${esc(cv.local_nome || '')}" placeholder="${esc((auto && auto.nome) || 'Espaço escolhido')}"></label>
          <label class="campo"><span>Endereço</span><input data-evc="convite.endereco" maxlength="200" value="${esc(cv.endereco || '')}" placeholder="${esc((auto && auto.endereco) || 'Quadra, alameda, lote')}"></label>
          <label class="campo"><span>Cores</span><select data-evc="convite.estilo">${ESTILOS_CONV.map(([k, r]) => `<option value="${k}" ${k === (cv.estilo || 'ouro') ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
        </div>
        <p class="ajuda">Data, horário e tema vêm do evento (botão Editar). O local vem do espaço marcado com a estrela, se você não preencher aqui. O prazo de confirmação fica na aba Convidados.</p>
      </details>
      <details class="conv-cfg" id="rota-cfg" ${ROTA.aberta ? 'open' : ''}><summary>Local e rota no mapa ${destinoConvite(ev) ? `<small>${(cv.rota || []).length > 1 ? 'rota desenhada' : 'local marcado'}</small>` : ''}</summary>
        <p class="ajuda">O convite mostra o mapa com o local e botões para abrir no GPS (Google Maps ou Waze). Se o GPS costuma errar o caminho (condomínio, chácara, estrada de terra), desenhe a rota certa: toque em <strong>Desenhar rota</strong> e vá tocando no mapa, do ponto de partida até o local. O botão do convite manda o GPS passar pela sua rota.</p>
        <div class="rota-barra">
          <button type="button" class="btn ghost" data-rota="local">${ic('pin')}Marcar o local</button>
          <button type="button" class="btn ghost" data-rota="desenhar">${ic('rota')}Desenhar rota</button>
          <button type="button" class="btn ghost" data-rota="desfazer">Desfazer ponto</button>
          <button type="button" class="btn ghost" data-rota="limpar">Apagar rota</button>
        </div>
        <p class="rota-dica" id="rota-dica">${cv.local_coord ? '' : cv.local_auto && cv.local_auto.coord ? 'O local veio do espaço escolhido. Use “Marcar o local” para corrigir o ponto.' : 'Toque em “Marcar o local” e depois no mapa, no ponto da festa.'}</p>
        <div id="rota-mapa" class="rota-mapa" aria-label="Mapa para marcar o local e a rota"></div>
        <div class="grade-2">
          <label class="campo"><span>A rota começa em</span><input data-evc="convite.rota_partida" maxlength="120" value="${esc(cv.rota_partida || '')}" placeholder="ex.: Rotatória da TO-050 com a Teotônio"></label>
          <label class="campo largo"><span>Explicação do caminho (aparece no convite)</span><textarea data-evc="convite.rota_instrucoes" rows="3" maxlength="800" placeholder="ex.: Depois do posto, entre na segunda estrada de terra à direita. A chácara tem portão azul.">${esc(cv.rota_instrucoes || '')}</textarea></label>
        </div>
      </details>
      <details class="conv-cfg" ${ev.presentes.length || cv.presente_dica ? 'open' : ''}><summary>Presentes ${presentesResumo(ev)}</summary>
        <label class="campo"><span>Dica de presente (aparece no convite)</span><textarea data-evc="convite.presente_dica" rows="2" maxlength="500" placeholder="ex.: Fralda tamanho G, roupa tamanho 1 ano ou sapatinho número 20">${esc(cv.presente_dica || '')}</textarea></label>
        <p class="ajuda">Lista de presentes (opcional): o convidado pode reservar um item ao confirmar, e o item reservado some para os outros.</p>
        <div class="linhas-ev">${ev.presentes.map((g, i) => {
          const quem = reservaDe(ev, g.id);
          return `<div class="linha-ev pres-linha">
            <input data-evc="presentes.${i}.nome" maxlength="120" value="${esc(g.nome || '')}" placeholder="ex.: Kit de banho" aria-label="Presente">
            <input class="curto" data-evc="presentes.${i}.link" maxlength="500" inputmode="url" value="${esc(g.link || '')}" placeholder="Link da loja (opcional)" aria-label="Link">
            <span class="chip-st ${quem ? 'st-sim' : 'pend'}">${quem ? `Reservado por ${esc(quem.nome || 'alguém')}` : 'Livre'}</span>
            <button type="button" class="tirar-linha" data-ev-tirar="presentes:${i}" aria-label="Remover">×</button></div>`;
        }).join('')}</div>
        <button type="button" class="btn ghost add-linha" data-ev-add="presentes">${ic('mais')}Adicionar presente</button>
      </details>`;
  }

  function importarConvidados() {
    const ev = evAtual(); const ta = $('#conv-colar');
    const linhas = (ta ? ta.value : '').split(/\n+/).map((x) => x.trim()).filter(Boolean);
    const tem = new Set(ev.convidados.map((c) => norm(c.nome)));
    let n = 0, rep = 0;
    for (const lin of linhas.slice(0, 300)) {
      let resto = lin;
      const tel = (resto.match(/(?:\+?55\s*)?\(?\d{2}\)?\s*9?\s*\d{4}[\s.-]?\d{4}/) || [])[0] || '';
      if (tel) resto = resto.replace(tel, ' ');
      const lug = (resto.match(/(?:^|[\s;,|-])(\d{1,2})\s*(?:pessoas?|lugares?)?\s*$/i) || [])[1];
      if (lug) resto = resto.replace(/(?:^|[\s;,|-])\d{1,2}\s*(?:pessoas?|lugares?)?\s*$/i, ' ');
      const nome = resto.replace(/(^|\s)[-–]+(?=\s|$)/g, ' ').replace(/[;,|\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
      if (!nome) continue;
      if (tem.has(norm(nome))) { rep++; continue; }
      tem.add(norm(nome));
      ev.convidados.push({ id: idCurto(), nome, telefone: digitos(tel) ? tel.trim() : '', lugares: lug ? Number(lug) : null });
      n++;
    }
    if (!n) { toast(rep ? 'Esses nomes já estão na lista.' : 'Cole um convidado por linha.'); return; }
    salvarEvento(ev);
    toast(`${plural(n, 'convidado adicionado', 'convidados adicionados')}${rep ? ` (${rep} já estavam na lista)` : ''}.`);
  }
  function pendentes(ev) {
    const respondeu = new Set(rsvpsDe(ev.id).map((r) => r.convidado).filter(Boolean));
    return ev.convidados.filter((c) => c.nome && !respondeu.has(c.id));
  }
  function textoLembrete(ev, cv) {
    const tit = ev.convite.titulo || ev.nome;
    const prazo = ev.convite.prazo ? ` até ${dataBR(ev.convite.prazo).slice(0, 5)}` : '';
    return `Oi, ${cv.nome}! Passando para lembrar do convite para ${tit}${ev.data ? `, dia ${dataBR(ev.data).slice(0, 5)}` : ''}. Você consegue confirmar${prazo} se vai e quantas pessoas? É rapidinho por aqui: ${linkConvite(ev, cv)}`;
  }
  function abrirLembretes() {
    const ev = evAtual(); const ps = pendentes(ev);
    if (!ps.length) { toast(ev.convidados.length ? 'Todos da lista já responderam.' : 'Adicione convidados à lista primeiro.'); return; }
    PK = null;
    const d = $('#picker');
    d.innerHTML = `<div class="folha-corpo">
      <h2>Lembrar quem não respondeu</h2>
      <p>${plural(ps.length, 'convidado ainda não respondeu', 'convidados ainda não responderam')}. Toque em cada um para abrir o WhatsApp com o lembrete pronto.</p>
      <div class="pick-lista">${ps.map((cv) => {
        const tel = digitos(cv.telefone);
        const href = `https://wa.me/${tel ? (tel.length <= 11 ? '55' + tel : tel) : ''}?text=${encodeURIComponent(textoLembrete(ev, cv))}`;
        return `<a class="pick-item" href="${esc(href)}" target="_blank" rel="noopener" data-lembrete>${ic('zap')}<span><strong>${esc(cv.nome)}</strong><small>${tel ? esc(cv.telefone) : 'sem WhatsApp: você escolhe o contato'}</small></span></a>`;
      }).join('')}</div>
      <div class="acoes"><span class="esp"></span><button type="button" class="btn primario" data-fechar>Pronto</button></div></div>`;
    d.showModal();
  }
  function linhasRespostas(ev) {
    return rsvpsDe(ev.id).slice().sort((a, b) => ['sim', 'talvez', 'nao'].indexOf(a.resposta) - ['sim', 'talvez', 'nao'].indexOf(b.resposta) || String(a.nome).localeCompare(String(b.nome), 'pt-BR'))
      .map((r) => ({ nome: r.nome || '', situacao: respRot(r.resposta), adultos: Number(r.adultos) || 0, criancas: Number(r.criancas) || 0,
        idades: (r.idades || []).map((x, j) => (x == null ? null : `${x === 0 ? 'menos de 1' : x}${(r.sexos || [])[j] === 'm' ? ' (menino)' : (r.sexos || [])[j] === 'f' ? ' (menina)' : ''}`)).filter(Boolean).join(', '), contato: r.contato || '', recado: r.mensagem || '' }));
  }
  function exportarRespostas() {
    const ev = evAtual(); const ls = linhasRespostas(ev);
    if (!ls.length) { toast('Ainda não há respostas.'); return; }
    const cab = ['Nome', 'Situação', 'Adultos', 'Crianças', 'Idades das crianças', 'Contato', 'Recado'];
    const cel = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = '﻿' + [cab, ...ls.map((r) => [r.nome, r.situacao, r.adultos, r.criancas, r.idades, r.contato, r.recado])].map((l) => l.map(cel).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `confirmacoes-${ev.id}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function imprimirPresenca() {
    const ev = evAtual(); const L = lotacao(ev);
    const ls = linhasRespostas(ev).filter((r) => r.situacao !== 'Não vai');
    if (!ls.length) { toast('Ainda não há confirmados.'); return; }
    const w = window.open('', '_blank');
    if (!w) { toast('Permita a janela para imprimir.'); return; }
    w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Lista de presença: ${esc(ev.nome)}</title>
      <style>body{font:14px/1.4 system-ui,sans-serif;margin:24px;color:#111}h1{font-size:20px;margin:0 0 4px}p{margin:0 0 14px;color:#555}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f2f2f2}
      td.c{text-align:center}.chk{width:60px}tfoot td{font-weight:600}</style></head><body>
      <h1>${esc(ev.nome)}</h1><p>${esc([ev.data ? dataBR(ev.data) : null, `${L.adultos} adultos e ${L.criancas} crianças confirmados`, L.talvez.length ? `${L.maisTalvez - L.total} talvez` : null].filter(Boolean).join(' · '))}</p>
      <table><thead><tr><th>Nome</th><th>Situação</th><th>Adultos</th><th>Crianças</th><th>Idades</th><th>Recado</th><th class="chk">Chegou</th></tr></thead><tbody>
      ${ls.map((r) => `<tr><td>${esc(r.nome)}</td><td>${esc(r.situacao)}</td><td class="c">${r.adultos}</td><td class="c">${r.criancas}</td><td>${esc(r.idades)}</td><td>${esc(r.recado)}</td><td></td></tr>`).join('')}
      </tbody><tfoot><tr><td colspan="2">Total</td><td class="c">${ls.reduce((a, r) => a + r.adultos, 0)}</td><td class="c">${ls.reduce((a, r) => a + r.criancas, 0)}</td><td colspan="3"></td></tr></tfoot></table>
      <script>window.onload=()=>window.print()<\/script></body></html>`);
    w.document.close();
  }

  /* ---- Recepção no dia: marcar quem chegou ---- */
  const REC = { busca: '' };
  const pessoasDe = (r) => (Number(r.adultos) || 0) + (Number(r.criancas) || 0);
  function totalRecepcao() {
    const ev = evAtual(); const rs = rsvpsDe(ev.id).filter((r) => r.resposta !== 'nao');
    const esperados = rs.filter((r) => r.resposta === 'sim').reduce((a, r) => a + pessoasDe(r), 0);
    const chegaram = rs.filter((r) => r.chegou).reduce((a, r) => a + pessoasDe(r), 0);
    const grupos = rs.filter((r) => r.chegou).length;
    return `<strong>${chegaram}</strong> ${chegaram === 1 ? 'pessoa chegou' : 'pessoas chegaram'} <small>de ${esperados} confirmadas · ${plural(grupos, 'convite', 'convites')}</small>`;
  }
  function listaRecepcao() {
    const ev = evAtual(); const q = norm(REC.busca.trim());
    const rs = rsvpsDe(ev.id).filter((r) => r.resposta !== 'nao' && (!q || norm(r.nome).includes(q)))
      .sort((a, b) => (a.chegou ? 1 : 0) - (b.chegou ? 1 : 0) || String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
    if (!rs.length) return `<p class="texto vazio-cat">${q ? 'Ninguém com esse nome nas respostas.' : 'Ainda não há confirmados.'}</p>`;
    return rs.map((r) => {
      const n = pessoasDe(r);
      const det = [plural(Number(r.adultos) || 0, 'adulto', 'adultos'), r.criancas ? plural(Number(r.criancas), 'criança', 'crianças') : null, r.resposta === 'talvez' ? 'talvez' : null,
        r.chegou && r.chegada_em ? `chegou ${new Date(r.chegada_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : null].filter(Boolean).join(' · ');
      return `<button type="button" class="rec-item ${r.chegou ? 'chegou' : ''}" data-chegou="${esc(r.id)}" aria-pressed="${r.chegou ? 'true' : 'false'}">
        <span class="rec-marca" aria-hidden="true">${r.chegou ? ic('check') : ''}</span>
        <span><strong>${esc(r.nome || 'Sem nome')}</strong><small>${esc(det)}</small></span><b>${n}</b></button>`;
    }).join('');
  }
  async function abrirRecepcao() {
    const ev = evAtual();
    PK = null; REC.busca = '';
    const d = $('#picker');
    d.innerHTML = `<div class="folha-corpo rec">
      <h2>Recepção</h2>
      <p id="rec-total" class="rec-total">${totalRecepcao()}</p>
      <label class="busca pick-busca"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <span class="sr">Buscar convidado</span><input id="rec-busca" type="search" placeholder="Buscar pelo nome…" autocomplete="off"></label>
      <div class="pick-lista" id="rec-lista">${listaRecepcao()}</div>
      <p class="ajuda">Toque no nome quando o convidado chegar. Toque de novo para desfazer. Dá para usar em mais de um celular ao mesmo tempo: toque em Atualizar para ver o que os outros marcaram.</p>
      <div class="acoes"><button type="button" class="btn" data-acao="rec-novo">${ic('mais')}Chegou sem confirmar</button>
        <button type="button" class="btn ghost" data-acao="rsvp-atualizar">Atualizar</button><span class="esp"></span>
        <button type="button" class="btn primario" data-fechar>Pronto</button></div></div>`;
    d.showModal();
    carregarRsvp(ev.id);
  }
  function marcarChegada(id) {
    const ev = evAtual(); const r = rsvpsDe(ev.id).find((x) => x.id === id);
    if (!r) return;
    const novo = { ...r, chegou: !r.chegou, chegada_em: !r.chegou ? new Date().toISOString() : null };
    if (novo.chegou && r.resposta === 'talvez') novo.resposta = 'sim';
    salvarResposta(novo);
  }
  function chegouSemConfirmar() {
    const ev = evAtual();
    const nome = (prompt('Nome de quem chegou:') || '').trim().slice(0, 80);
    if (!nome) return;
    const ad = parseInt(prompt(`Quantos adultos com ${nome}? (contando com a pessoa)`, '1'), 10);
    const cr = parseInt(prompt('E quantas crianças?', '0'), 10);
    salvarResposta({ id: `${ev.id}-m${idCurto()}`, evento: ev.id, convidado: null, nome, resposta: 'sim',
      adultos: Number.isFinite(ad) && ad >= 0 ? Math.min(ad, 99) : 1, criancas: Number.isFinite(cr) && cr >= 0 ? Math.min(cr, 99) : 0, idades: [], contato: '', mensagem: '',
      manual: true, chegou: true, chegada_em: new Date().toISOString() });
  }

  /* ---- Quanto comprar de comida e bebida ---- */
  function horasEvento(ev) {
    const m = (h) => { const x = /^(\d{1,2}):(\d{2})/.exec(h || ''); return x ? Number(x[1]) * 60 + Number(x[2]) : null; };
    const a = m(ev.hora_inicio), b = m(ev.hora_fim);
    if (a == null || b == null) return null;
    const d = (b - a + 1440) % 1440;
    return d ? d / 60 : null;
  }
  // Médias usadas em festas (por pessoa, para uma festa de cerca de 4 horas).
  const centos = (n) => (n === 50 ? 'meio cento' : `${String(n / 100).replace('.', ',')} ${n <= 100 ? 'cento' : 'centos'}`);
  const QUANT = [
    { k: 'salgados', rot: 'Salgados', un: 'unid.', ad: 12, cr: 8, arred: 50, fmt: (n) => `${n} unid. (${centos(n)})`, horas: true },
    { k: 'doces', rot: 'Docinhos', un: 'unid.', ad: 4, cr: 5, arred: 50, fmt: (n) => `${n} unid. (${centos(n)})` },
    { k: 'bolo', rot: 'Bolo', un: 'kg', ad: 0.1, cr: 0.08, arred: 0.5, fmt: (n) => `${String(n).replace('.', ',')} kg` },
    { k: 'refri', rot: 'Refrigerante', un: 'L', ad: 0.6, cr: 0.4, arred: 2, fmt: (n) => `${String(n).replace('.', ',')} L (${plural(Math.ceil(n / 2), 'garrafa', 'garrafas')} de 2 L)`, horas: true },
    { k: 'suco', rot: 'Suco', un: 'L', ad: 0.2, cr: 0.4, arred: 1, fmt: (n) => `${String(n).replace('.', ',')} L`, horas: true },
    { k: 'agua', rot: 'Água', un: 'L', ad: 0.3, cr: 0.2, arred: 1.5, fmt: (n) => `${String(n).replace('.', ',')} L (${plural(Math.ceil(n / 1.5), 'garrafa', 'garrafas')} de 1,5 L)`, horas: true },
    { k: 'gelo', rot: 'Gelo', un: 'kg', ad: 0.5, cr: 0.3, arred: 5, fmt: (n) => `${n} kg (${plural(Math.ceil(n / 5), 'saco', 'sacos')} de 5 kg)`, horas: true },
    { k: 'descart', rot: 'Copos, pratos e guardanapos', un: 'unid.', ad: 3, cr: 3, arred: 10, fmt: (n) => `${n} copos · ${Math.ceil(n / 2)} pratinhos · ${n * 2} guardanapos` },
  ];
  // Base das contas de comida e lembrancinhas: previsto enquanto as respostas chegam; confirmados quando fecha.
  const BASES_FESTA = [['', 'Automático'], ['previsto', 'Previsto no evento'], ['confirmados', 'Confirmados'], ['talvez', 'Confirmados + talvez']];
  function baseFesta(ev) {
    const L = lotacao(ev);
    const prev = numV(ev.adultos) + numV(ev.criancas);
    const esc0 = ev.base_quant;
    if (esc0 === 'previsto' && prev) return { fonte: 'previsto', L };
    if (esc0 === 'confirmados' && L.total) return { fonte: 'confirmados', L };
    if (esc0 === 'talvez' && L.maisTalvez) return { fonte: 'talvez', L };
    if (!L.total) return { fonte: 'previsto', L, auto: true };
    if (!prev) return { fonte: 'confirmados', L, auto: true };
    // "Todos responderam" só vale se a lista cobre quase todo o previsto (lugares de cada convite, ou 1 se vazio).
    const cobre = ev.convidados.filter((c) => c.nome).reduce((a, c) => a + (numV(c.lugares) || 1), 0) >= prev * 0.8;
    const p = ev.convite.prazo; const fechou = (p && diasAte(p) < 0) || (cobre && ev.convidados.length && !L.semResposta) || L.total >= prev;
    return { fonte: fechou ? 'confirmados' : 'previsto', L, auto: true, fechou };
  }
  function baseFestaHtml(ev) {
    const B = baseFesta(ev); const L = B.L; const prev = numV(ev.adultos) + numV(ev.criancas);
    const n = { previsto: prev, confirmados: L.total, talvez: L.maisTalvez };
    const rot = { previsto: 'previsto no evento', confirmados: 'confirmados', talvez: 'confirmados + talvez' }[B.fonte];
    const porque = B.auto ? (B.fonte === 'previsto' ? (L.total ? ` Ainda faltam respostas, então uso o previsto. Quando todos responderem ou o prazo passar, passa a usar os confirmados.` : '') : B.fechou ? ' As respostas fecharam, então uso os confirmados.' : '') : '';
    return `<div class="base-festa"><label class="campo"><span>Calcular para</span><select data-evc="base_quant">${BASES_FESTA.map(([k, r]) => `<option value="${k}" ${k === (ev.base_quant || '') ? 'selected' : ''}>${r}${k ? ` (${n[k] || 0} pessoas)` : ''}</option>`).join('')}</select></label>
      <p class="meta">As contas abaixo usam <strong>${n[B.fonte] || 0} pessoas</strong> (${rot}).${porque}</p></div>`;
  }
  function quantHtml(ev) {
    const B = baseFesta(ev); const L = B.L;
    const usaConf = B.fonte !== 'previsto';
    const soma = (l, k) => l.reduce((a, r) => a + (Number(r[k]) || 0), 0);
    const ad = !usaConf ? numV(ev.adultos) : L.adultos + (B.fonte === 'talvez' ? soma(L.talvez, 'adultos') : 0);
    const cr = !usaConf ? numV(ev.criancas) : L.criancas + (B.fonte === 'talvez' ? soma(L.talvez, 'criancas') : 0);
    if (!ad && !cr) return '<p class="texto vazio-cat">Informe quantos adultos e crianças vão (botão Editar) ou receba confirmações pelo convite para calcular.</p>';
    // Bebês de até 2 anos quase não comem salgados e docinhos.
    const bebes = usaConf ? L.idades.filter((x) => x <= 2).length : 0;
    const h = horasEvento(ev);
    const fator = h ? Math.min(1.5, Math.max(0.75, h / 4)) : 1;
    const linhas = QUANT.map((q) => {
      const crq = q.k === 'salgados' || q.k === 'doces' ? cr - bebes : cr;
      let v = (ad * q.ad + crq * q.cr) * (q.horas ? fator : 1);
      v = Math.ceil(v / q.arred - 1e-9) * q.arred;
      v = Math.round(v * 100) / 100;
      return `<tr><th>${esc(q.rot)}</th><td>${esc(q.fmt(v))}</td></tr>`;
    }).join('');
    const base = `${B.fonte === 'talvez' ? 'Confirmados + talvez' : usaConf ? 'Confirmados' : 'Previsto no evento'}: ${plural(ad, 'adulto', 'adultos')} e ${plural(cr, 'criança', 'crianças')}${bebes ? ` (${bebes} de até 2 anos)` : ''}${h ? ` · festa de ${String(Math.round(h * 10) / 10).replace('.', ',')} h` : ''}.`;
    return `<p class="meta">${esc(base)}${B.fonte === 'confirmados' && L.maisTalvez > L.total ? ' Os “talvez” não entram na conta.' : ''}</p>
      <table class="quant"><tbody>${linhas}</tbody></table>
      <p class="ajuda">Estimativa com médias de festa (cerca de 12 salgados por adulto em 4 horas, 100 g de bolo por pessoa, 600 ml de refrigerante por adulto), já arredondada para cima. Se o buffet já inclui comida e bebida, use só para conferir o que ele vai servir.</p>`;
  }

  const reservaDe = (ev, gid) => rsvpsDe(ev.id).find((r) => r.presente === gid && r.resposta !== 'nao');
  function presentesResumo(ev) {
    const n = ev.presentes.filter((g) => g.nome).length;
    if (!n) return '';
    const res = ev.presentes.filter((g) => g.nome && reservaDe(ev, g.id)).length;
    return `<small>${res} de ${n} reservados</small>`;
  }

  /* ---- Mapa do local e rota desenhada (Leaflet, carregado só quando abre) ---- */
  const ROTA = { aberta: false, modo: '', map: null, camadas: null };
  const PALMAS = [-10.184, -48.333];
  function carregarLeaflet() {
    if (window.L) return Promise.resolve();
    if (ROTA.carregando) return ROTA.carregando;
    ROTA.carregando = new Promise((ok, falha) => {
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
      const js = document.createElement('script'); js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; js.onload = ok; js.onerror = falha; document.head.appendChild(js);
    });
    return ROTA.carregando;
  }
  function destinoConvite(ev) {
    const c = ev.convite.local_coord || (ev.convite.local_auto && ev.convite.local_auto.coord);
    return c && isFinite(c.lat) && isFinite(c.lng) ? c : null;
  }
  async function iniciarMapaRota() {
    const box = $('#rota-mapa');
    if (!box) return;
    try { await carregarLeaflet(); } catch { box.innerHTML = '<p class="texto">Não consegui carregar o mapa agora.</p>'; return; }
    if (!document.body.contains(box)) return;
    if (ROTA.map) { ROTA.map.remove(); ROTA.map = null; }
    const map = L.map(box, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
    ROTA.map = map; ROTA.camadas = L.layerGroup().addTo(map);
    map.on('click', (e) => cliqueMapa(e.latlng));
    desenharRota(true);
    modoRota(ROTA.modo);
  }
  function desenharRota(enquadrar) {
    const ev = evAtual(); if (!ROTA.map || !ev) return;
    const cor = getComputedStyle(document.documentElement).getPropertyValue('--ouro').trim() || '#b4781f';
    ROTA.camadas.clearLayers();
    const pts = (ev.convite.rota || []).filter((p) => Array.isArray(p) && p.length === 2);
    const dest = destinoConvite(ev);
    if (pts.length) {
      L.polyline(pts, { color: cor, weight: 5, opacity: .9, dashArray: '8 8' }).addTo(ROTA.camadas);
      L.circleMarker(pts[0], { radius: 7, color: '#fff', weight: 2, fillColor: '#2f6fd6', fillOpacity: 1 }).bindTooltip('Início da rota').addTo(ROTA.camadas);
      pts.slice(1).forEach((p) => L.circleMarker(p, { radius: 3, color: cor, weight: 1, fillOpacity: 1 }).addTo(ROTA.camadas));
    }
    if (dest) L.circleMarker([dest.lat, dest.lng], { radius: 10, color: '#fff', weight: 3, fillColor: '#c62828', fillOpacity: 1 }).bindTooltip('Local da festa').addTo(ROTA.camadas);
    if (enquadrar) {
      const todos = [...pts, ...(dest ? [[dest.lat, dest.lng]] : [])];
      if (todos.length > 1) ROTA.map.fitBounds(todos, { padding: [30, 30], maxZoom: 16 });
      else ROTA.map.setView(todos[0] || PALMAS, todos.length ? 15 : 12);
    }
  }
  function modoRota(m) {
    ROTA.modo = m;
    document.querySelectorAll('[data-rota="local"],[data-rota="desenhar"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rota === m)));
    const d = $('#rota-dica');
    if (d && m) d.textContent = m === 'local' ? 'Toque no mapa, no ponto exato da festa.' : 'Toque no mapa ponto a ponto, do início da rota até o local. Toque em “Desenhar rota” de novo para terminar.';
    if (ROTA.map) ROTA.map.getContainer().style.cursor = m ? 'crosshair' : '';
  }
  function cliqueMapa(ll) {
    if (!ROTA.modo) return;
    const ev = evAtual();
    const r5 = (n) => Math.round(n * 1e5) / 1e5;
    if (ROTA.modo === 'local') {
      ev.convite.local_coord = { lat: r5(ll.lat), lng: r5(ll.lng) };
      modoRota('');
      const d = $('#rota-dica'); if (d) d.textContent = 'Local marcado. Se quiser, desenhe a rota até ele.';
    } else {
      const pts = Array.isArray(ev.convite.rota) ? ev.convite.rota.slice() : [];
      if (pts.length >= 150) { toast('A rota já tem pontos demais.'); return; }
      pts.push([r5(ll.lat), r5(ll.lng)]);
      ev.convite.rota = pts;
    }
    salvarEvento(ev, { render: false });
    desenharRota(false);
  }
  function acaoRota(a) {
    const ev = evAtual();
    if (a === 'local' || a === 'desenhar') { modoRota(ROTA.modo === a ? '' : a); return; }
    if (a === 'desfazer') { const pts = (ev.convite.rota || []).slice(0, -1); ev.convite.rota = pts; }
    if (a === 'limpar') { if (!(ev.convite.rota || []).length || !confirm('Apagar a rota desenhada?')) return; ev.convite.rota = []; }
    salvarEvento(ev, { render: false });
    desenharRota(false);
  }
  document.addEventListener('toggle', (e) => {
    if (e.target.id !== 'rota-cfg') return;
    ROTA.aberta = e.target.open;
    if (ROTA.aberta) iniciarMapaRota(); else modoRota('');
  }, true);

  function prazoStatus(ev) {
    const p = ev.convite.prazo;
    if (!p) return 'Sem prazo: o convite aceita respostas até o dia da festa.';
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const [a, m, d] = p.split('-').map(Number);
    const dias = Math.round((new Date(a, m - 1, d) - hoje) / 864e5);
    if (ev.data && p > ev.data) return `<span class="ruim">O prazo está depois da data da festa.</span>`;
    if (dias < 0) return ev.convite.aceitar_apos_prazo ? `Prazo passou em ${dataBR(p)}, mas o convite ainda aceita respostas.` : `<strong>Confirmações encerradas</strong> em ${dataBR(p)}. Quem abrir o convite vê o aviso.`;
    if (dias === 0) return 'O prazo termina <strong>hoje</strong>.';
    return `Faltam <strong>${plural(dias, 'dia', 'dias')}</strong> para o prazo (${dataBR(p)}). O convite mostra a data e encerra as respostas depois dela.`;
  }

  /* ---- Mensagens em grupo pelo WhatsApp (você toca em cada contato; nada é enviado sozinho) ---- */
  const MSG = { tipo: 'vespera', grupo: 'sim', texto: '', editado: false };
  const MSG_TIPOS = [['vespera', 'Lembrete da véspera'], ['obrigado', 'Agradecimento depois da festa'], ['livre', 'Mensagem livre']];
  const MSG_GRUPOS = [['sim', 'Confirmados'], ['chegou', 'Quem chegou na festa'], ['talvez', 'Quem marcou talvez'], ['pendentes', 'Quem não respondeu'], ['todos', 'Todos da lista']];
  function modeloMsg(ev, tipo) {
    const tit = ev.convite.titulo || ev.nome;
    const cv = ev.convite;
    const local = cv.local_nome || (cv.local_auto && cv.local_auto.nome) || '';
    if (tipo === 'vespera') return `Oi, {nome}! Amanhã é dia de ${tit}!${ev.hora_inicio ? ` Começa às ${ev.hora_inicio}` : ''}${local ? ` em ${local}` : ''}. O convite tem o mapa e o caminho: {link}. Esperamos vocês!`;
    if (tipo === 'obrigado') return `Oi, {nome}! Muito obrigado por ter vindo em ${tit}. Foi muito especial ter vocês com a gente!`;
    return 'Oi, {nome}! ';
  }
  function destinatarios(ev) {
    const rs = rsvpsDe(ev.id);
    const daLista = (r) => r.convidado && ev.convidados.find((c) => c.id === r.convidado);
    const deResp = (r) => { const cv = daLista(r); return { nome: r.nome || (cv && cv.nome) || '', tel: (cv && cv.telefone) || r.contato || '', cv }; };
    if (MSG.grupo === 'pendentes') return pendentes(ev).map((cv) => ({ nome: cv.nome, tel: cv.telefone, cv }));
    if (MSG.grupo === 'todos') {
      const vistos = new Set();
      const l = ev.convidados.filter((c) => c.nome).map((cv) => { vistos.add(cv.id); return { nome: cv.nome, tel: cv.telefone, cv }; });
      rs.filter((r) => !r.convidado || !vistos.has(r.convidado)).forEach((r) => l.push(deResp(r)));
      return l;
    }
    const f = MSG.grupo === 'chegou' ? (r) => r.chegou : (r) => r.resposta === MSG.grupo;
    return rs.filter(f).map(deResp);
  }
  function listaMensagens() {
    const ev = evAtual(); const ds = destinatarios(ev);
    if (!ds.length) return `<p class="texto vazio-cat">${MSG.grupo === 'chegou' ? 'Ninguém foi marcado como chegou na Recepção.' : 'Ninguém neste grupo.'}</p>`;
    return ds.map((d) => {
      const tel = digitos(d.tel);
      const txt = MSG.texto.replace(/\{nome\}/g, d.nome).replace(/\{link\}/g, linkConvite(ev, d.cv || null));
      const href = `https://wa.me/${tel ? (tel.length <= 11 ? '55' + tel : tel) : ''}?text=${encodeURIComponent(txt)}`;
      return `<a class="pick-item" href="${esc(href)}" target="_blank" rel="noopener">${ic('zap')}<span><strong>${esc(d.nome || 'Sem nome')}</strong><small>${tel ? esc(d.tel) : 'sem WhatsApp: você escolhe o contato'}</small></span></a>`;
    }).join('');
  }
  function abrirMensagens() {
    const ev = evAtual();
    PK = null;
    if (!MSG.editado) MSG.texto = modeloMsg(ev, MSG.tipo);
    const d = $('#picker');
    const sel = (id, ops, v) => `<select id="${id}">${ops.map(([k, r]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${r}</option>`).join('')}</select>`;
    d.innerHTML = `<div class="folha-corpo">
      <h2>Mensagem para os convidados</h2>
      <div class="grade-2">
        <label class="campo"><span>Mensagem</span>${sel('msg-tipo', MSG_TIPOS, MSG.tipo)}</label>
        <label class="campo"><span>Para</span>${sel('msg-grupo', MSG_GRUPOS, MSG.grupo)}</label>
      </div>
      <label class="campo"><span>Texto ({nome} vira o nome de cada um; {link} vira o link do convite)</span>
        <textarea id="msg-texto" rows="4" maxlength="1000">${esc(MSG.texto)}</textarea></label>
      <p class="ajuda">Toque em cada nome para abrir o WhatsApp com a mensagem pronta. Nada é enviado sem você tocar em enviar.</p>
      <div class="pick-lista" id="msg-lista">${listaMensagens()}</div>
      <div class="acoes"><span class="esp"></span><button type="button" class="btn primario" data-fechar>Pronto</button></div></div>`;
    d.showModal();
  }
  document.addEventListener('change', (e) => {
    if (e.target.id === 'msg-tipo') {
      MSG.tipo = e.target.value; MSG.editado = false;
      if (MSG.tipo === 'obrigado' && MSG.grupo === 'sim' && rsvpsDe(S.paginaEv).some((r) => r.chegou)) { MSG.grupo = 'chegou'; }
      abrirMensagens();
    }
    if (e.target.id === 'msg-grupo') { MSG.grupo = e.target.value; $('#msg-lista').innerHTML = listaMensagens(); }
  });

  /* ---- Lembrancinhas, centros de mesa e outros itens que dependem de quem vai ---- */
  const TIPOS_ITEM = [['lembrancinha', 'Lembrancinha'], ['centro_mesa', 'Centro de mesa'], ['kit', 'Kit ou sacolinha'], ['decoracao', 'Decoração'], ['papelaria', 'Papelaria (tags, toppers)'], ['outro', 'Outro']];
  const PARA_ITEM = [['todos', 'Todos os convidados'], ['adultos', 'Só adultos'], ['criancas', 'Crianças (filtrar idade e sexo)'], ['convite', 'Uma por convite ou família'], ['mesa', 'Uma por mesa'], ['fixo', 'Quantidade fixa']];
  const STATUS_ITEM = [['definir', 'A definir'], ['orcando', 'Orçando'], ['encomendado', 'Encomendado'], ['pronto', 'Pronto']];
  function novoItemFesta(x = {}) {
    return { id: idCurto(), nome: '', tipo: 'lembrancinha', para: 'criancas', de: null, ate: null, sexo: '', qtd: null, folga: 10, valor: null, fornecedor: '', status: 'definir', ...x };
  }
  // Quem vai, com idade e sexo de cada criança. Sem respostas ainda, usa o previsto no evento.
  function publicoFesta(ev) {
    const rs = rsvpsDe(ev.id);
    const B = baseFesta(ev);
    const sim = rs.filter((r) => r.resposta === 'sim' || (B.fonte === 'talvez' && r.resposta === 'talvez'));
    if (sim.length && B.fonte !== 'previsto') {
      const kids = sim.flatMap((r) => Array.from({ length: Number(r.criancas) || 0 }, (_, i) => ({
        idade: Array.isArray(r.idades) && r.idades[i] != null ? r.idades[i] : null, sexo: Array.isArray(r.sexos) ? r.sexos[i] || null : null })));
      return { fonte: 'confirmados', adultos: sim.reduce((a, r) => a + (Number(r.adultos) || 0), 0), kids, convites: sim.length };
    }
    return { fonte: 'previsto', adultos: numV(ev.adultos), kids: Array.from({ length: numV(ev.criancas) }, () => ({ idade: null, sexo: null })), convites: ev.convidados.filter((c) => c.nome).length };
  }
  function mesasDe(ev, P) {
    if (numV(ev.mesas)) return { n: numV(ev.mesas), estimado: false };
    const total = P.adultos + P.kids.length;
    return { n: total ? Math.ceil(total / (numV(ev.pessoas_mesa) || 6)) : 0, estimado: true };
  }
  function contaItem(ev, it, P) {
    const det = [];
    let base = 0, semInfo = 0;
    const faixa = (it.de != null || it.ate != null) ? `de ${it.de ?? 0} a ${it.ate ?? 17} anos` : '';
    const sx = it.sexo === 'm' ? 'meninos' : it.sexo === 'f' ? 'meninas' : '';
    if (it.para === 'todos') { base = P.adultos + P.kids.length; det.push(`${base} pessoas`); }
    else if (it.para === 'adultos') { base = P.adultos; det.push(plural(base, 'adulto', 'adultos')); }
    else if (it.para === 'convite') { base = P.convites; det.push(plural(base, P.fonte === 'confirmados' ? 'convite confirmado' : 'convite da lista', P.fonte === 'confirmados' ? 'convites confirmados' : 'convites da lista')); }
    else if (it.para === 'mesa') { const m = mesasDe(ev, P); base = m.n; det.push(`${plural(base, 'mesa', 'mesas')}${m.estimado ? ' (estimadas)' : ''}`); }
    else if (it.para === 'fixo') { base = numV(it.qtd); det.push('quantidade fixa'); }
    else {
      const casa = P.kids.filter((k) => {
        if ((it.de != null || it.ate != null) && k.idade == null) return false;
        if (it.sexo && !k.sexo) return false;
        return (it.de == null || k.idade >= it.de) && (it.ate == null || k.idade <= it.ate) && (!it.sexo || k.sexo === it.sexo);
      });
      semInfo = P.kids.filter((k) => ((it.de != null || it.ate != null) && k.idade == null) || (it.sexo && !k.sexo)).length;
      base = casa.length;
      det.push(`${plural(base, 'criança', 'crianças')}${sx ? ` (${sx})` : ''}${faixa ? ` ${faixa}` : ''}`);
    }
    const folga = it.para === 'fixo' ? 0 : numV(it.folga);
    const total = Math.ceil(base * (1 + folga / 100));
    if (folga && base) det.push(`+${folga}% de folga`);
    return { base, total, det: det.join(' · '), semInfo, custo: numV(it.valor) ? numV(it.valor) * total : null };
  }
  function itensHtml(ev) {
    const P = publicoFesta(ev);
    const m = mesasDe(ev, P);
    const usaSexo = ev.itens_festa.some((i) => i.sexo);
    const sel = (cam, ops, v) => `<select data-evc="${cam}">${ops.map(([k, r]) => `<option value="${k}" ${k === (v ?? '') ? 'selected' : ''}>${r}</option>`).join('')}</select>`;
    const num = (cam, v, ph, rot) => `<label class="campo cnum"><span>${rot}</span><input data-evc="${cam}" data-tipo="num" inputmode="decimal" value="${v != null ? esc(/\.valor$/.test(cam) ? valorTxt(v) : v) : ''}" placeholder="${ph}"></label>`;
    const linhas = ev.itens_festa.map((it, i) => {
      const c = contaItem(ev, it, P);
      const k = `itens_festa.${i}`;
      return `<div class="item-festa st-${esc(it.status || 'definir')}">
        <div class="if-topo">
          <input data-evc="${k}.nome" maxlength="120" value="${esc(it.nome || '')}" placeholder="ex.: Caixinha de massinha" aria-label="Item">
          ${sel(`${k}.tipo`, TIPOS_ITEM, it.tipo)}
          ${sel(`${k}.status`, STATUS_ITEM, it.status)}
          <button type="button" class="tirar-linha" data-ev-tirar="itens_festa:${i}" aria-label="Remover">×</button>
        </div>
        <div class="if-campos">
          <label class="campo"><span>Para quem</span>${sel(`${k}.para`, PARA_ITEM, it.para)}</label>
          ${it.para === 'criancas' ? `${num(`${k}.de`, it.de, '0', 'Idade de')}${num(`${k}.ate`, it.ate, '17', 'até')}
            <label class="campo"><span>Sexo</span>${sel(`${k}.sexo`, [['', 'Todos'], ['m', 'Meninos'], ['f', 'Meninas']], it.sexo)}</label>` : ''}
          ${it.para === 'fixo' ? num(`${k}.qtd`, it.qtd, 'ex.: 1', 'Quantidade') : num(`${k}.folga`, it.folga, '10', 'Folga %')}
          ${num(`${k}.valor`, it.valor, 'R$', 'Valor unitário')}
          <label class="campo"><span>Quem faz</span><input data-evc="${k}.fornecedor" maxlength="120" value="${esc(it.fornecedor || '')}" placeholder="Fornecedor ou eu mesma"></label>
        </div>
        <p class="if-conta"><strong>${c.total}</strong> ${c.total === 1 ? 'unidade' : 'unidades'} <span>${esc(c.det)}${c.custo != null ? ` · ${brl(c.custo)}` : ''}</span></p>
        ${c.semInfo ? `<p class="nota-aviso neutro">${ic('alerta')}<span>${plural(c.semInfo, 'criança está', 'crianças estão')} sem ${it.sexo && (it.de != null || it.ate != null) ? 'idade ou sexo informados' : it.sexo ? 'sexo informado' : 'idade informada'} e ${c.semInfo === 1 ? 'ficou' : 'ficaram'} fora da conta. Complete nas respostas (ex.: 3m, 7f).</span></p>` : ''}
      </div>`;
    }).join('');
    const ativos = ev.itens_festa.filter((i) => i.nome);
    const contas = ativos.map((i) => ({ i, c: contaItem(ev, i, P) }));
    const total = contas.reduce((a, x) => a + (x.c.custo || 0), 0);
    const crSexo = P.kids.filter((k) => k.sexo).length;
    return `<p class="meta">Monte aqui o que muda conforme os convidados: lembrancinhas diferentes por idade e sexo, as comuns a todos, uma por família, centros de mesa e itens fixos. As quantidades saem ${P.fonte === 'confirmados' ? 'das confirmações' : 'do número previsto no evento (quando chegarem confirmações, passam a usar elas)'}.</p>
      <div class="if-mesas">
        ${num('mesas', ev.mesas, m.estimado && m.n ? String(m.n) : 'ex.: 10', 'Mesas')}
        ${num('pessoas_mesa', ev.pessoas_mesa, '6', 'Pessoas por mesa')}
        <p class="meta">${m.estimado ? (m.n ? `Sem número de mesas: estimei ${plural(m.n, 'mesa', 'mesas')}.` : '') : ''} ${P.kids.length ? `${plural(P.kids.length, 'criança', 'crianças')}${usaSexo || crSexo ? `, ${crSexo} com sexo informado` : ''}.` : ''}</p>
      </div>
      <label class="chk"><input type="checkbox" data-evc="convite.pedir_sexo" data-tipo="bool" ${ev.convite.pedir_sexo || usaSexo ? 'checked' : ''} ${usaSexo ? 'disabled' : ''}>Perguntar no convite se cada criança é menino ou menina${usaSexo ? ' (ligado porque há item separado por sexo)' : ''}</label>
      <div class="itens-festa">${linhas}</div>
      <div class="acoes-linha">
        <button type="button" class="btn ghost add-linha" data-ev-add="itens_festa">${ic('mais')}Adicionar item</button>
        <span class="sug-rot">Sugestões prontas:</span>
        <button type="button" class="btn ghost add-linha" data-acao="itens-sug" data-itsug="todos">Lembrancinha comum a todos</button>
        <button type="button" class="btn ghost add-linha" data-acao="itens-sug" data-itsug="sexo">Lembrancinhas de menino e de menina</button>
        <button type="button" class="btn ghost add-linha" data-acao="itens-sug" data-itsug="idade">Lembrancinhas por faixa de idade</button>
        <button type="button" class="btn ghost add-linha" data-acao="itens-sug" data-itsug="mesa">Centro de mesa</button>
      </div>
      ${contas.length ? `<h3 class="conv-sub">Para encomendar</h3><table class="quant"><tbody>
        ${contas.map(({ i, c }) => `<tr><th>${esc(i.nome)}<small>${esc(TIPOS_ITEM.find((t) => t[0] === i.tipo)?.[1] || '')}${i.fornecedor ? ` · ${esc(i.fornecedor)}` : ''} · ${esc(STATUS_ITEM.find((t) => t[0] === i.status)?.[1] || '')}</small></th><td>${c.total} un.${c.custo != null ? ` · ${brl(c.custo)}` : ''}</td></tr>`).join('')}
        ${total ? `<tr><th>Total estimado</th><td><strong>${brl(total)}</strong></td></tr>` : ''}</tbody></table>` : ''}`;
  }
  function sugerirItensFesta(tipo) {
    const ev = evAtual();
    const novos = {
      todos: [novoItemFesta({ nome: 'Lembrancinha para todos', para: 'todos' })],
      sexo: [novoItemFesta({ nome: 'Lembrancinha de menino', sexo: 'm' }), novoItemFesta({ nome: 'Lembrancinha de menina', sexo: 'f' })],
      idade: [novoItemFesta({ nome: 'Lembrancinha até 3 anos', de: 0, ate: 3 }), novoItemFesta({ nome: 'Lembrancinha de 4 a 8 anos', de: 4, ate: 8 }), novoItemFesta({ nome: 'Lembrancinha de 9 a 12 anos', de: 9, ate: 12 })],
      mesa: [novoItemFesta({ nome: 'Centro de mesa', tipo: 'centro_mesa', para: 'mesa', folga: 0 })],
    }[tipo] || [];
    ev.itens_festa.push(...novos);
    salvarEvento(ev);
    toast(`${plural(novos.length, 'item adicionado', 'itens adicionados')}. Ajuste nomes, idades e valores.`);
  }
  function atualizarConvite() {
    if (!S.paginaEv || !S.eventos[S.paginaEv]) return;
    const ev = evAtual();
    const foco = document.activeElement;
    const dentro = (el) => el && foco && el.contains(foco);
    const lot = $('#conv-lotacao'); if (lot && !dentro(lot)) lot.innerHTML = lotacaoHtml(ev, { curto: true });
    const nums = $('#conv-nums'); if (nums) nums.innerHTML = convNums(ev);
    const tab = $('#conv-tabela');
    if (tab && !dentro(tab)) tab.innerHTML = convTabela(ev);
    else if (tab) { // editando uma linha: atualiza só os resumos, sem tirar o foco
      const ls = linhasConv(ev);
      tab.querySelectorAll('[data-conv-sum]').forEach((el) => { const x = ls.find((y) => y.k === el.dataset.convSum); if (x) { el.innerHTML = resumoConv(ev, x); el.parentElement.className = `ct-linha st-${x.st} ${S.convAberto.has(x.k) ? 'aberta' : ''}`; } });
    }
    atualizarPainel(ev);
    const q = $('#quant-corpo'); if (q) q.innerHTML = quantHtml(ev);
    const bf = $('#base-festa'); if (bf && !bf.contains(document.activeElement)) bf.innerHTML = baseFestaHtml(ev);
    const it = $('#itens-corpo'); if (it && !it.contains(document.activeElement)) it.innerHTML = itensHtml(ev);
    if ($('#picker').open && $('#rec-lista')) { $('#rec-lista').innerHTML = listaRecepcao(); $('#rec-total').innerHTML = totalRecepcao(); }
  }


  /* ---- Página do evento ---- */
  const escK = (e) => `${e.cat || 'espacos'}|${e.id || e.nome || ''}`;
  function linhaEscolha(e, i) {
    const l = S.porId[e.id];
    const zap = l && zapLink(l.whatsapp, l.nome);
    const mp = l && menorPreco(l);
    const ref = l ? (mp != null ? `a partir de ${brl(mp)}` : 'valor sob consulta') : 'não está mais no catálogo';
    const v = l ? visita(l.id) : null;
    const k = escK(e); const aberto = S.escAberto.has(k);
    const din = [e.valor != null ? `<strong>${brl(e.valor)}</strong>` : null, e.pago ? `${brl(e.pago)} pago` : null, e.pessoas ? `${e.pessoas} pessoas` : null].filter(Boolean).join(' · ');
    return `<div class="esc st-${e.status} ${aberto ? 'aberta' : ''}" data-esc-k="${esc(k)}">
      <div class="esc-topo">
        <button type="button" class="esc-estrela" data-esc-melhor="${i}" aria-pressed="${fechado(e.status)}" title="${fechado(e.status) ? 'Tirar dos escolhidos' : 'Marcar como escolhido'}" aria-label="${fechado(e.status) ? 'Tirar dos escolhidos' : 'Marcar como escolhido'}">${ic('estrela')}</button>
        ${l ? `<button type="button" class="mini-capa-btn esc-capa" data-abrir="${l.id}" aria-label="Ver ${esc(l.nome)}">${miniCapa(l)}</button>` : ''}
        <div class="esc-nome">${l ? `<button type="button" data-abrir="${l.id}">${esc(l.nome)}</button>` : `<span>${esc(e.nome || 'Sem nome')}</span>`}
          <small>${esc([l ? tiposDe(l)[0] : null, ref, v && v.nota ? `sua nota ${v.nota}/5` : null].filter(Boolean).join(' · '))}</small></div>
        <span class="esc-dir"><span class="selo-esc">${esc(escRot(e.status))}</span>${din ? `<small class="esc-din">${din}</small>` : ''}</span>
        <span class="esc-bts">${zap ? `<a class="mini zap" href="${zap}" target="_blank" rel="noopener" title="WhatsApp de ${esc(l.nome)}" aria-label="WhatsApp">${ic('zap')}</a>` : ''}
          <button type="button" class="mini" data-esc-abrir="${esc(k)}" aria-expanded="${aberto}" title="${aberto ? 'Fechar' : 'Editar situação e valores'}">${ic(aberto ? 'x' : 'editar')}<span class="sr">${aberto ? 'Fechar' : 'Editar'}</span></button></span>
      </div>
      ${e.obs && !aberto ? `<p class="esc-obs">${esc(e.obs)}</p>` : ''}
      ${aberto ? `<div class="esc-campos">
        <label class="campo"><span>Situação</span><select data-evc="escolhas.${i}.status">${ESC_STATUS.map(([k, r]) => `<option value="${k}" ${k === e.status ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
        <label class="campo"><span>Valor combinado</span><input data-evc="escolhas.${i}.valor" data-tipo="num" inputmode="decimal" value="${e.valor != null ? esc(valorTxt(e.valor)) : ''}" placeholder="R$"></label>
        <label class="campo"><span>Já pago</span><input data-evc="escolhas.${i}.pago" data-tipo="num" inputmode="decimal" value="${e.pago != null ? esc(valorTxt(e.pago)) : ''}" placeholder="R$"></label>
        <label class="campo"><span>Saldo vence em</span><input type="date" data-evc="escolhas.${i}.vencimento" value="${esc(e.vencimento || '')}"></label>
        ${e.cat === 'espacos' || e.cat === 'buffet' ? `<label class="campo"><span>${e.cat === 'buffet' ? 'Buffet para (pessoas)' : 'Comporta (pessoas)'}</span><input data-evc="escolhas.${i}.pessoas" data-tipo="num" inputmode="numeric" value="${e.pessoas != null ? esc(e.pessoas) : ''}" placeholder="${l && capCatalogo(l) ? `catálogo: ${capCatalogo(l)}` : 'ex.: 80'}"></label>` : ''}
        <label class="campo largo"><span>Observação</span><input data-evc="escolhas.${i}.obs" maxlength="300" value="${esc(e.obs || '')}" placeholder="O que foi combinado, horário de montagem…"></label>
      </div>
      <div class="esc-acoes">${l && l.telefone && !zap ? `<a class="mini" href="tel:+55${digitos(l.telefone)}">${ic('fone')}Ligar</a>` : ''}
        <span class="esp"></span><button type="button" class="link-btn perigo" data-esc-tirar="${i}">Tirar do evento</button></div>` : ''}
    </div>`;
  }
  function blocoCat(ev, k) {
    const C = CATS[k];
    const ordem = { contratado: 0, reservado: 1, escolhido: 2, opcao: 3, descartado: 4 };
    const idx = ev.escolhas.map((e, i) => [e, i]).filter(([e]) => e.cat === k).sort((a, b) => (ordem[a[0].status] ?? 3) - (ordem[b[0].status] ?? 3));
    const nF = idx.filter(([e]) => fechado(e.status)).length;
    const nO = idx.filter(([e]) => e.status === 'opcao').length;
    return `<div class="pg-cat ${nF ? 'tem' : ''}" id="cat-${k}">
      <div class="pg-cat-topo"><h3>${ic(C.icone)}${esc(C.rot)}</h3>
        <span class="n">${nF ? `${nF} escolhido${nF > 1 ? 's' : ''}` : 'nada escolhido'}${nO ? ` · ${nO} ${nO === 1 ? 'opção' : 'opções'}` : ''}</span>
        <button type="button" class="btn ghost" data-picker="${k}">${ic('mais')}<span class="lbl">Adicionar opção</span></button></div>
      ${idx.length ? idx.filter(([e]) => e.status !== 'descartado').map(([e, i]) => linhaEscolha(e, i)).join('')
          + (idx.some(([e]) => e.status === 'descartado') ? `<details class="esc-descartados" ${idx.some(([e]) => e.status === 'descartado' && S.escAberto.has(escK(e))) ? 'open' : ''}><summary>${plural(idx.filter(([e]) => e.status === 'descartado').length, 'descartado', 'descartados')}</summary>${idx.filter(([e]) => e.status === 'descartado').map(([e, i]) => linhaEscolha(e, i)).join('')}</details>` : '')
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
      ${cardLotacao(ev)}
      ${c.vencimentos.length ? `<div class="orc-card"><h3>Próximos pagamentos</h3><ul class="vencs">${c.vencimentos.slice(0, 4).map((v) =>
        `<li class="${diasAte(v.vencimento) < 0 ? 'atrasado' : ''}"><span>${dataBR(v.vencimento)}</span><strong>${brl(v.falta)}</strong><span>${esc(v.nome)}</span></li>`).join('')}</ul></div>` : ''}
      ${tarefas.length ? `<div class="orc-card"><h3>Próximas tarefas</h3><ul class="prox-tarefas">${tarefas.map((t) =>
        `<li class="${t.prazo && diasAte(t.prazo) < 0 ? 'atrasada' : ''}"><span>${esc(t.texto)}</span>${t.prazo ? `<small>${dataBR(t.prazo).slice(0, 5)}</small>` : ''}</li>`).join('')}</ul></div>` : ''}`;
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
  /* ---- Painel do evento: cabeçalho, cartões, abas ---- */
  const ABAS_EV = [['geral', 'Visão geral'], ['fornecedores', 'Fornecedores'], ['convidados', 'Convidados'], ['convite', 'Convite'],
    ['festa', 'Comida e lembrancinhas'], ['orcamento', 'Orçamento'], ['dia', 'Tarefas e o dia']];
  function estCats(ev) {
    return ORDEM_CATS.map((k) => {
      const es = ev.escolhas.filter((e) => (e.cat || 'espacos') === k && e.status !== 'descartado');
      const fe = es.filter((e) => fechado(e.status));
      const nomes = fe.map((e) => (S.porId[e.id] && S.porId[e.id].nome) || e.nome).filter(Boolean);
      return { k, st: fe.length ? 'ok' : es.length ? 'meio' : 'nada', n: es.length, nomes };
    });
  }
  const barra = (v, tot, cls = '') => `<span class="kpi-barra ${cls}"><i style="width:${tot ? Math.min(100, (v / tot) * 100).toFixed(1) : 0}%"></i></span>`;
  function kpisHtml(ev, c) {
    const est = estCats(ev); const ok = est.filter((x) => x.st === 'ok').length;
    const faltam = est.filter((x) => x.st !== 'ok').map((x) => CATS[x.k].curto);
    const L = lotacao(ev); const prev = numV(ev.adultos) + numV(ev.criancas);
    const orc = numV(ev.orcamento);
    const tar = ev.tarefas.filter((t) => (t.texto || '').trim()); const feitas = tar.filter((t) => t.feito).length;
    const prox = tar.filter((t) => !t.feito).sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'))[0];
    const card = (aba, rot, valor, sub, bar, tom = '') => `<button type="button" class="kpi ${tom}" data-ev-aba="${aba}"><span class="kpi-rot">${rot}</span><strong class="kpi-v">${valor}</strong>${bar}<small class="kpi-sub">${sub}</small></button>`;
    return card('fornecedores', 'Fornecedores', `${ok}<small> de ${est.length}</small>`, faltam.length ? `Falta: ${esc(faltam.join(', '))}` : 'Tudo resolvido', barra(ok, est.length, ok === est.length ? 'ok' : ''))
      + card('convidados', 'Confirmados', `${L.total}${prev ? `<small> de ${prev}</small>` : ''}`,
        ev.convidados.length || L.rs.length ? [L.maisTalvez > L.total ? `${L.maisTalvez - L.total} talvez` : null, L.semResposta ? `${L.semResposta} sem resposta` : null].filter(Boolean).join(' · ') || 'Todos responderam' : 'Lista vazia',
        barra(L.total, prev || L.total), L.limites.some((x) => x.passou) ? 'ruim' : '')
      + card('orcamento', 'Orçamento', brl(c.combinado), orc ? `${c.combinado > orc ? 'passou' : 'de'} ${brl(orc)} · ${brl(c.pago)} pago` : `${brl(c.pago)} pago`,
        barra(c.pago, Math.max(orc, c.combinado)), orc && c.combinado > orc ? 'ruim' : '')
      + card('dia', 'Tarefas', tar.length ? `${feitas}<small> de ${tar.length}</small>` : '—', prox ? `Próxima: ${esc(prox.texto)}` : tar.length ? 'Todas feitas' : 'Lista ainda não criada', barra(feitas, tar.length, tar.length && feitas === tar.length ? 'ok' : ''));
  }
  function faltaAgora(ev, c) {
    const it = [];
    const add = (tom, txt, sub, botao) => it.push({ tom, txt, sub, botao });
    const est = estCats(ev);
    if (!ev.data) add('ruim', 'Definir a data da festa', 'Sem data não dá para combinar com os fornecedores nem ver os prazos.', ['Editar evento', 'data-acao="editar-evento"']);
    const esp = est.find((x) => x.k === 'espacos');
    if (esp.st !== 'ok') add('ruim', 'Escolher o local', esp.n ? `${plural(esp.n, 'opção', 'opções')} em análise. Marque a escolhida com a estrela.` : 'Nenhum espaço adicionado ainda.', ['Ver espaços', 'data-ev-aba="fornecedores"']);
    const outras = est.filter((x) => x.k !== 'espacos' && x.st !== 'ok');
    if (outras.length) add('meio', `Resolver ${outras.map((x) => CATS[x.k].curto.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' e $1')}`, outras.some((x) => x.n) ? 'Há opções esperando decisão.' : 'Ainda sem opções.', ['Fornecedores', 'data-ev-aba="fornecedores"']);
    const atras = c.vencimentos.filter((v) => diasAte(v.vencimento) <= 7);
    if (atras.length) add(atras.some((v) => diasAte(v.vencimento) < 0) ? 'ruim' : 'meio', `Pagar ${brl(atras.reduce((a, v) => a + v.falta, 0))}`, atras.map((v) => `${esc(v.nome)} (${dataBR(v.vencimento).slice(0, 5)})`).join(', '), ['Orçamento', 'data-ev-aba="orcamento"']);
    const L = lotacao(ev);
    const passou = L.limites.find((x) => x.passou);
    if (passou) add('ruim', `Confirmados passaram da capacidade ${passou.cat === 'buffet' ? 'do buffet' : 'do espaço'}`, `${passou.usado} para ${passou.cap} lugares.`, ['Convidados', 'data-ev-aba="convidados"']);
    if (!ev.convidados.length && !L.rs.length) add('meio', 'Montar a lista de convidados', 'Cole a lista do WhatsApp ou adicione um por um.', ['Adicionar', 'data-ev-aba="convidados"']);
    else if (L.semResposta) add('meio', `${plural(L.semResposta, 'convidado não respondeu', 'convidados não responderam')}`, ev.convite.prazo ? `Prazo: ${dataBR(ev.convite.prazo)}.` : 'Mande um lembrete pelo WhatsApp.', ['Lembrar', 'data-acao="conv-lembrar"']);
    if (ev.convidados.length && !ev.convite.prazo) add('', 'Definir o prazo de confirmação', 'Ajuda a fechar o número com o buffet.', ['Definir', 'data-ev-aba="convidados"']);
    if (!ev.tarefas.some((t) => (t.texto || '').trim())) add('', 'Criar a lista de tarefas', ev.data ? 'Sugiro as tarefas com prazo contado a partir da data da festa.' : 'O que precisa ser feito até a festa.', [ev.data ? 'Sugerir tarefas' : 'Tarefas', ev.data ? 'data-acao="ev-sugerir"' : 'data-ev-aba="dia"']);
    const tAtr = ev.tarefas.filter((t) => !t.feito && t.prazo && (t.texto || '').trim() && diasAte(t.prazo) < 0);
    if (tAtr.length) add('ruim', plural(tAtr.length, 'tarefa atrasada', 'tarefas atrasadas'), esc(tAtr.slice(0, 2).map((t) => t.texto).join(', ')), ['Tarefas', 'data-ev-aba="dia"']);
    if (c.semValor) add('', `${plural(c.semValor, 'escolhido sem valor', 'escolhidos sem valor')} combinado`, 'Preencha para o orçamento ficar certo.', ['Fornecedores', 'data-ev-aba="fornecedores"']);
    const d = diasAte(ev.data);
    if (d != null && d >= 0 && d <= 30 && !ev.cronograma.length) add('', 'Montar o cronograma do dia', 'Montagem, chegada, parabéns, fim do buffet.', ['Cronograma', 'data-ev-aba="dia"']);
    const nItens = (ev.itens_festa || []).filter((x) => x.nome && x.status !== 'pronto').length;
    if (d != null && d >= 0 && d <= 21 && nItens) add('', `${plural(nItens, 'item da festa ainda não está pronto', 'itens da festa ainda não estão prontos')}`, 'Lembrancinhas, centros de mesa e afins.', ['Ver itens', 'data-ev-aba="festa"']);
    return it;
  }
  function faltaHtml(ev, c) {
    const it = faltaAgora(ev, c);
    const mostra = it.slice(0, 5);
    return `<div class="falta-cab"><h2>O que falta agora</h2>${it.length ? `<span class="falta-n">${it.length}</span>` : ''}</div>
      ${mostra.length ? `<ol class="falta">${mostra.map((x) => `<li class="f-${x.tom || 'neutro'}"><span class="f-ponto" aria-hidden="true"></span>
        <span class="f-txt"><strong>${x.txt}</strong><small>${x.sub}</small></span>
        <button type="button" class="btn" ${x.botao[1]}>${x.botao[0]}</button></li>`).join('')}</ol>
      ${it.length > 5 ? `<p class="meta">E mais ${it.length - 5}. Resolva estes primeiro.</p>` : ''}`
      : `<p class="falta-ok">${ic('check')}Nada urgente. Tudo encaminhado por enquanto.</p>`}`;
  }
  function fornGrade(ev) {
    return `<div class="forn-grade">${estCats(ev).map((x) => `<button type="button" class="forn-mini f-${x.st}" data-ev-aba="fornecedores">
      <span class="fm-ic">${ic(x.st === 'ok' ? 'check' : CATS[x.k].icone)}</span>
      <span class="fm-txt"><strong>${esc(CATS[x.k].curto)}</strong><small>${x.st === 'ok' ? esc(x.nomes.join(', ')) : x.n ? `${plural(x.n, 'opção', 'opções')}, nada escolhido` : 'Nada ainda'}</small></span></button>`).join('')}</div>`;
  }
  function convCardHtml(ev) {
    const L = lotacao(ev);
    return `<div class="orc-card conv-card"><h3>Convite</h3>
      <p class="orc-sub">${ev.convidados.length ? `${plural(ev.convidados.length, 'convite na lista', 'convites na lista')} · ${L.total} confirmados` : 'Ninguém na lista ainda.'}</p>
      <div class="conv-card-bt"><a class="btn zap" href="${esc(zapConvite(ev, null))}" target="_blank" rel="noopener">${ic('zap')}Enviar no WhatsApp</a>
        <button type="button" class="btn" data-acao="conv-copiar">Copiar link</button></div>
      <button type="button" class="link-btn" data-ev-aba="convite">Personalizar o convite</button></div>`;
  }
  function orcNums(ev, c) {
    const orc = numV(ev.orcamento);
    const box = (cls, rot, v, sub) => `<div class="cnum-card ${cls}"><span>${rot}</span><strong>${v}</strong><small>${sub}</small></div>`;
    return box('c-cap', 'Previsto', orc ? brl(orc) : '—', orc ? 'definido no evento' : 'defina em Editar')
      + box(orc && c.combinado > orc ? 'c-nao' : 'c-sim', 'Combinado', brl(c.combinado), orc ? (c.combinado > orc ? `passou ${brl(c.combinado - orc)}` : `cabe mais ${brl(orc - c.combinado)}`) : 'fornecedores e itens aprovados')
      + box('c-sim', 'Pago', brl(c.pago), c.combinado ? `${Math.round((c.pago / c.combinado) * 100)}% do combinado` : '')
      + box('c-talvez', 'Falta pagar', brl(c.falta), c.vencimentos.length ? `próximo em ${dataBR(c.vencimentos[0].vencimento).slice(0, 5)}` : 'sem vencimento marcado')
      + box('c-pend', 'Em rascunho', brl(c.rascunho), plural(c.nRasc, 'item', 'itens') + (c.rascunho < 1 && c.nRasc ? ' sem valor' : ''));
  }
  function atualizarPainel(ev) {
    const c = contas(ev);
    const on = $('#orc-nums'); if (on) on.innerHTML = orcNums(ev, c);
    const k = $('#pg-kpis'); if (k) k.innerHTML = kpisHtml(ev, c);
    const f = $('#pg-falta'); if (f) f.innerHTML = faltaHtml(ev, c);
    const lado = $('#pg-resumo'); if (lado) lado.innerHTML = convCardHtml(ev) + resumoHtml(ev, c);
    document.querySelectorAll('[data-aba-n]').forEach((el) => { el.textContent = contadorAba(ev, el.dataset.abaN); });
  }
  function contadorAba(ev, aba) {
    if (aba === 'fornecedores') { const e = estCats(ev); return `${e.filter((x) => x.st === 'ok').length}/${e.length}`; }
    if (aba === 'convidados') { const n = lotacao(ev).total; return n ? String(n) : ''; }
    if (aba === 'dia') { const n = ev.tarefas.filter((t) => !t.feito && (t.texto || '').trim()).length; return n ? String(n) : ''; }
    return '';
  }
  function irAbaEv(aba, { rolar = true } = {}) {
    if (!ABAS_EV.some((x) => x[0] === aba)) aba = 'geral';
    S.abaEv = aba;
    document.querySelectorAll('[data-painel]').forEach((p) => { p.hidden = p.dataset.painel !== aba; });
    document.querySelectorAll('.ev-abas [data-ev-aba]').forEach((b) => b.setAttribute('aria-selected', b.dataset.evAba === aba));
    const atual = document.querySelector(`.ev-abas [data-ev-aba="${aba}"]`);
    if (atual) atual.scrollIntoView({ block: 'nearest', inline: 'center' });
    if (aba === 'convite' && ROTA.aberta) iniciarMapaRota();
    const nav = $('.ev-abas');
    if (rolar && nav) { const y = nav.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(nav).top) || 0); if (window.scrollY > y) window.scrollTo({ top: y }); }
  }
  function renderPagina() {
    const el = $('#pagina');
    const bruto = S.eventos[S.paginaEv];
    if (!bruto || bruto.removido) {
      el.innerHTML = `<div class="vazio"><h3>Evento não encontrado</h3><p>Ele pode ter sido excluído.</p>
        <p><a class="btn" href="#eventos">Ver eventos</a></p></div>`;
      return;
    }
    const ev = evCompleto(bruto);
    const c = contas(ev);
    const local = ev.escolhas.find((e) => e.cat === 'espacos' && fechado(e.status));
    const lLocal = local && S.porId[local.id];
    const cc = lLocal && lLocal.coordenadas && isFinite(lLocal.coordenadas.lat) && isFinite(lLocal.coordenadas.lng) ? { lat: lLocal.coordenadas.lat, lng: lLocal.coordenadas.lng } : null;
    const auto = lLocal ? { nome: lLocal.nome, endereco: lLocal.endereco || lLocal.bairro || '', mapa: mapaUrl(lLocal), ...(cc ? { coord: cc } : {}) } : null;
    if (JSON.stringify(auto) !== JSON.stringify(ev.convite.local_auto || null)) { ev.convite.local_auto = auto; salvarEvento(ev, { render: false }); }
    if (!S.rsvpPedido[ev.id]) { S.rsvpPedido[ev.id] = true; carregarRsvp(ev.id); }
    if (S.abaEvDe !== ev.id) { S.abaEvDe = ev.id; S.abaEv = 'geral'; S.convF = 'todos'; S.convBusca = ''; S.convAberto = new Set(); }
    const aba = S.abaEv || 'geral';
    const d = diasAte(ev.data);
    const conta = d == null ? '' : d > 0 ? `<div class="ev-conta"><strong>${d}</strong><span>${d === 1 ? 'dia para a festa' : 'dias para a festa'}</span></div>`
      : d === 0 ? '<div class="ev-conta"><strong>Hoje</strong><span>é o dia da festa</span></div>'
        : `<div class="ev-conta passou"><strong>${-d}</strong><span>${d === -1 ? 'dia' : 'dias'} desde a festa</span></div>`;
    const localTxt = (ev.convite.local_nome || (lLocal && lLocal.nome) || '').trim();
    const meta = [
      ev.data ? `<span>${ic('quero')}${esc(dataLonga(ev.data))}</span>` : `<span class="fraco">${ic('quero')}Data a definir</span>`,
      horario(ev) ? `<span>${ic('relogio')}${esc(horario(ev))}</span>` : '',
      localTxt ? `<span>${ic('pin')}${lLocal ? `<button type="button" class="link-btn" data-abrir="${lLocal.id}">${esc(localTxt)}</button>` : esc(localTxt)}</span>` : `<span class="fraco">${ic('pin')}Local a definir</span>`,
      ev.tema ? `<span class="ev-tema">Tema ${esc(ev.tema)}</span>` : '',
    ].filter(Boolean).join('');
    const conv = [numV(ev.adultos) ? `${ev.adultos} adultos` : null, numV(ev.criancas) ? `${ev.criancas} crianças` : null].filter(Boolean).join(' + ');
    const fatos = [
      ['Para quem', esc([ev.para_quem, ev.idade].filter(Boolean).join(', '))],
      ['Quem organiza', esc([ev.organiza, ev.contato].filter(Boolean).join(' · '))],
      ['Convidados previstos', conv ? esc(conv) : ''],
      ['Endereço', lLocal && (lLocal.endereco || lLocal.bairro) ? esc(lLocal.endereco || lLocal.bairro) : ''],
    ].filter(([, v]) => v);
    const painel = (k, html) => `<div class="ev-painel" data-painel="${k}" role="tabpanel" aria-label="${esc(ABAS_EV.find((x) => x[0] === k)[1])}" ${k === aba ? '' : 'hidden'}>${html}</div>`;
    el.innerHTML = `
      <header class="ev-cab">
        <a class="ev-voltar" href="#eventos">${ic('voltar')}Meus eventos</a>
        <div class="ev-cab-grade">
          <div class="ev-cab-txt">
            <p class="sobretitulo">${esc(ev.tipo || 'Evento')} <span class="ev-st ev-st-${esc(ev.status || 'planejando')}">${esc(evStRot(ev.status))}</span></p>
            <h1>${esc(ev.nome)}</h1>
            <p class="ev-meta">${meta}</p>
          </div>
          <div class="ev-cab-dir">${conta}
            <div class="ev-acoes">
              <a class="btn ouro" href="${esc(linkConvite(ev))}" target="_blank" rel="noopener">${ic('olho')}Ver convite</a>
              <button type="button" class="btn" data-acao="editar-evento">${ic('editar')}Editar</button>
              <button type="button" class="btn icone-so" data-acao="imprimir" title="Imprimir" aria-label="Imprimir">${ic('imprimir')}</button>
            </div></div>
        </div>
      </header>
      <div class="kpis" id="pg-kpis">${kpisHtml(ev, c)}</div>
      <nav class="ev-abas" role="tablist" aria-label="Partes do evento">${ABAS_EV.map(([k, r]) => `<button type="button" role="tab" data-ev-aba="${k}" aria-selected="${k === aba}">${r}<span class="aba-n" data-aba-n="${k}">${contadorAba(ev, k)}</span></button>`).join('')}</nav>
      ${painel('geral', `<div class="ev-grade">
        <div class="ev-principal">
          <section class="ev-bloco" id="pg-falta">${faltaHtml(ev, c)}</section>
          <section class="ev-bloco"><div class="bloco-cab"><h2>Fornecedores</h2><button type="button" class="link-btn" data-ev-aba="fornecedores">Ver todos</button></div>${fornGrade(ev)}</section>
          ${fatos.length || ev.descricao ? `<section class="ev-bloco"><div class="bloco-cab"><h2>Sobre o evento</h2><button type="button" class="link-btn" data-acao="editar-evento">Editar</button></div>
            ${fatos.length ? `<dl class="pg-fatos">${fatos.map(([r, v]) => `<div><dt>${r}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
            ${ev.descricao ? `<p class="pg-desc">${esc(ev.descricao)}</p>` : ''}</section>` : ''}
        </div>
        <aside class="ev-lado" id="pg-resumo" aria-label="Resumo">${convCardHtml(ev)}${resumoHtml(ev, c)}</aside>
      </div>`)}
      ${painel('fornecedores', `<div class="aba-cab"><div><h2>Fornecedores</h2>
        <p class="meta">Adicione as opções que está considerando e marque com a estrela as escolhidas. Pode haver mais de uma por categoria (buffet e bolo, por exemplo).</p></div></div>
        <div class="cat-atalhos">${estCats(ev).map((x) => `<button type="button" class="c-${x.st}" data-ir-cat="${x.k}">${ic(x.st === 'ok' ? 'check' : CATS[x.k].icone)}${esc(CATS[x.k].curto)}<small>${x.n || ''}</small></button>`).join('')}</div>
        ${ORDEM_CATS.map((k) => blocoCat(ev, k)).join('')}`)}
      ${painel('convidados', abaConvidados(ev))}
      ${painel('convite', abaConvite(ev))}
      ${painel('festa', `<div id="base-festa">${baseFestaHtml(ev)}</div><section class="ev-bloco" id="sec-quant"><h2>Comida e bebida</h2><div id="quant-corpo">${quantHtml(ev)}</div></section>
        <section class="ev-bloco" id="sec-itens"><h2>Lembrancinhas e itens da festa</h2><div id="itens-corpo">${itensHtml(ev)}</div></section>`)}
      ${painel('orcamento', `<div class="aba-cab orc-cab"><div><h2>Orçamento detalhado</h2></div>
        <div class="seg-f" role="group" aria-label="Mostrar">${[['todos', 'Todos'], ['rascunho', 'Rascunho'], ['aprovado', 'Aprovados']].map(([k, r]) =>
          `<button type="button" data-orc-f="${k}" aria-pressed="${(S.orcF || 'todos') === k}">${r}</button>`).join('')}</div></div>
        <div class="cnum-grade orc-nums" id="orc-nums">${orcNums(ev, c)}</div>
        <div id="orc-lista" class="orc-f-${S.orcF || 'todos'}">${listaOrc(ev)}</div>`)}
      ${painel('dia', `<div class="ev-grade metade">
        <section class="ev-bloco"><h2>Tarefas</h2>${listaTarefas(ev)}</section>
        <section class="ev-bloco"><h2>Cronograma do dia</h2>${listaCrono(ev)}</section></div>`)}
      <p class="meta pg-priv">${privTxt()}</p>`;
    const sw = document.querySelector('.secoes-wrap');
    document.documentElement.style.setProperty('--topo-fixo', `${sw && getComputedStyle(sw).position === 'sticky' ? sw.offsetHeight : 0}px`);
    if (ROTA.aberta && aba === 'convite') iniciarMapaRota();
  }

  /* ---- Edição na própria página ---- */
  const LINHA_VAZIA = { itens_festa: () => novoItemFesta(), presentes: () => ({ id: idCurto(), nome: '', link: '' }), convidados: () => ({ id: idCurto(), nome: '', telefone: '', lugares: null }), gastos: novoGasto, tarefas: () => ({ texto: '', prazo: '', feito: false }), cronograma: () => ({ hora: '', oque: '' }) };
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
      return `<button type="button" class="pick-item ${tem ? 'ok' : ''}" data-pick="${l.id}" ${tem ? 'disabled' : ''}>${ic(tem ? 'check' : 'mais')}${miniCapa(l)}
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
    if (!ev || pedeChaveParaExcluir() || !confirm(`Excluir o evento "${ev.nome}"? As escolhas, gastos e tarefas dele saem junto.`)) return;
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
