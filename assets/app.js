(() => {
  'use strict';

  /* ============ Config e utilidades ============ */
  const CFG = Object.assign({ apiUrl: '', repo: '' }, window.LEP_CONFIG || {});
  const API = (CFG.apiUrl || '').replace(/\/+$/, '');
  const LS = { locais: 'lep.locais.v1', visitas: 'lep.visitas.v1', pendentes: 'lep.pendentes.v1', chave: 'lep.chave', ui: 'lep.ui.v1' };
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
  const ITEM_ROT = Object.fromEntries(ITENS.map(([k, r]) => [k, r]));
  const temItem = (l, k) => !!(l.itens && l.itens[k]);
  function itemTexto(l, k) {
    const v = l.itens && l.itens[k];
    if (typeof v === 'number') return `${v} ${ITEM_ROT[k].toLowerCase()}`;
    return ITEM_ROT[k];
  }
  const itensDo = (l) => ITENS.filter(([k]) => temItem(l, k)).map(([k]) => k);

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

  const urlSegura = (u) => (/^https?:\/\//i.test(u || '') || /^fotos\/[\w./-]+$/.test(u || '') ? u : null);
  function menorPreco(l) {
    const vs = (l.precos || []).map((p) => p.valor).filter((v) => typeof v === 'number');
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
  function zapLink(numero, nome) {
    let d = digitos(numero);
    if (!d) return null;
    if (!d.startsWith('55')) d = '55' + d;
    const msg = `Olá! Encontrei o ${nome} pesquisando locais de eventos em Palmas. Pode me passar valores, condições e datas disponíveis?`;
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

  /* ============ Estado ============ */
  const S = {
    locais: [], porId: {}, dataDados: '', base: [], remotos: [],
    visitas: lsGet(LS.visitas, {}),
    pendentes: new Set(lsGet(LS.pendentes, [])),
    chave: lsGet(LS.chave, ''),
    aba: 'todos',
    f: { busca: '', tipo: '', evento: '', cap: '', preco: '', ordem: 'relevancia', rapidos: new Set() },
    cmp: new Set(),
    detalheId: null, detalheAba: 'sobre',
    sync: 'local', // local | sem-chave | pendente | ok | erro
  };
  const ui = lsGet(LS.ui, {});
  if (ui.ordem) S.f.ordem = ui.ordem;

  const vazia = () => ({ status: '', favorito: false, data: '', nota: 0, criterios: {}, pros: [], contras: [], anotacoes: '', orcamento_valor: '', orcamento_condicao: '', album: '', atualizado_em: '' });
  const visita = (id) => Object.assign(vazia(), S.visitas[id] || {});

  /* ============ Persistência e sincronização ============ */
  let timerSync = null;
  function salvarVisita(id, patch, { render = true } = {}) {
    S.visitas[id] = Object.assign(visita(id), patch, { atualizado_em: new Date().toISOString() });
    lsSet(LS.visitas, S.visitas);
    if (API) { S.pendentes.add(id); lsSet(LS.pendentes, [...S.pendentes]); }
    clearTimeout(timerSync);
    timerSync = setTimeout(sincronizar, 800);
    atualizarSync();
    if (render) { renderAbas(); renderLista(); renderNumeros(); }
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
  }
  function textoSync() {
    return {
      local: 'Salvo neste aparelho',
      'sem-chave': 'Salvo neste aparelho. Informe a chave de edição para salvar na nuvem.',
      pendente: 'Salvando na nuvem…',
      ok: 'Salvo na nuvem',
      erro: 'Não foi possível salvar na nuvem; ficou guardado neste aparelho e tenta de novo depois.',
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
  function filtrados() {
    const q = norm(S.f.busca.trim()).split(/\s+/).filter(Boolean);
    const cap = Number(S.f.cap) || 0;
    const teto = Number(S.f.preco) || 0;
    const rapidos = RAPIDOS.filter(([k]) => S.f.rapidos.has(k));
    const r = S.locais.filter((l) => {
      if (!passaAba(l)) return false;
      if (S.f.tipo && l.tipo !== S.f.tipo) return false;
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
      return completude(b) - completude(a) || a.nome.localeCompare(b.nome, 'pt-BR');
    });
    return r;
  }

  /* ============ Render: topo ============ */
  function renderNumeros() {
    const vs = Object.values(S.visitas);
    const comPreco = S.locais.filter((l) => menorPreco(l) != null).length;
    $('#numeros').innerHTML = `
      <div><dt>Locais</dt><dd>${S.locais.length}</dd></div>
      <div><dt>Com valor</dt><dd>${comPreco}</dd></div>
      <div><dt>Visitados</dt><dd>${vs.filter((v) => v.status === 'visitado').length}</dd></div>`;
  }
  function renderAbas() {
    const cont = (k) => (k === 'todos' ? S.locais.length
      : S.locais.filter((l) => (k === 'favoritos' ? visita(l.id).favorito : visita(l.id).status === k)).length);
    $('#abas').innerHTML = ABAS.map(([k, r]) =>
      `<button type="button" class="aba" data-aba="${k}" aria-pressed="${S.aba === k}">${r} <span class="n">${cont(k)}</span></button>`).join('');
  }
  function renderRapidos() {
    $('#chips-rapidos').innerHTML = RAPIDOS.map(([k, r]) =>
      `<button type="button" class="chip" data-rapido="${k}" aria-pressed="${S.f.rapidos.has(k)}">${r}</button>`).join('');
  }
  function renderAplicados(n) {
    const tags = [];
    const add = (rot, acao) => tags.push(`<button type="button" class="tag-filtro" data-remover="${acao}">${esc(rot)} <span aria-hidden="true">×</span><span class="sr">remover filtro</span></button>`);
    if (S.f.busca.trim()) add(`“${S.f.busca.trim()}”`, 'busca');
    if (S.f.tipo) add(S.f.tipo, 'tipo');
    if (S.f.evento) add(S.f.evento, 'evento');
    if (Number(S.f.cap)) add(`${S.f.cap}+ convidados`, 'cap');
    if (Number(S.f.preco)) add(`até ${brl(Number(S.f.preco))}`, 'preco');
    RAPIDOS.forEach(([k, r]) => { if (S.f.rapidos.has(k)) add(r, 'r:' + k); });
    const total = S.locais.filter(passaAba).length;
    $('#aplicados').innerHTML = `<span><strong>${n}</strong> ${n === 1 ? 'local' : 'locais'}${n !== total ? ` de ${total}` : ''}</span>`
      + tags.join('') + (tags.length > 1 ? '<button type="button" class="link-btn" data-remover="tudo">limpar tudo</button>' : '');
    const nf = tags.length;
    const b = $('#n-filtros'); b.hidden = !nf; b.textContent = nf;
  }

  /* ============ Render: cards ============ */
  function capaHtml(l, grande = false) {
    const fotos = (l.fotos || []).filter((f) => urlSegura(f.url || f));
    if (fotos.length) {
      if (grande && fotos.length > 1) return `<div class="galeria">${fotos.map((f) => `<img src="${esc(f.url || f)}" alt="${esc(f.legenda || 'Foto de ' + l.nome)}" loading="lazy">`).join('')}</div>`;
      const f = fotos[0];
      return `<img src="${esc(f.url || f)}" alt="${esc(f.legenda || 'Foto de ' + l.nome)}" loading="lazy">`;
    }
    const a = artePorTipo(l.tipo);
    return `<div class="capa-arte arte-${a}">${ic(a)}<span class="ini">${esc(iniciais(l.nome))}</span></div>`;
  }
  function precoCard(l) {
    const mp = menorPreco(l);
    if (mp == null) {
      const txt = (l.precos || []).find((p) => typeof p.valor === 'string');
      return `<div class="preco consulta"><span class="valor">${txt ? esc(txt.valor) : 'Valor sob consulta'}</span><span class="cond">${txt ? esc(txt.condicao || '') : 'Peça orçamento pelo contato'}</span></div>`;
    }
    const nums = l.precos.filter((p) => typeof p.valor === 'number');
    const p = nums.find((x) => x.valor === mp);
    const mx = Math.max(...nums.map((x) => x.valor));
    const faixa = mx > mp ? `${brl(mp)} a ${brl(mx)}` : `a partir de ${brl(mp)}`;
    const tx = (l.taxas || []).filter((t) => typeof t.valor === 'number').reduce((a, t) => a + t.valor, 0);
    const cond = (nums.length > 1 ? `${nums.length} condições · menor: ${p.condicao}` : p.condicao) + (tx ? ` · + ${brl(tx)} em taxas` : '');
    return `<div class="preco"><span class="valor">${faixa} <small>/ ${esc(p.unidade || 'evento')}</small></span><span class="cond">${esc(cond || '')}</span></div>`;
  }
  function estrelas(n) {
    return `<span class="estrelas" aria-label="${n} de 5">${'★'.repeat(n)}<span class="apagada">${'★'.repeat(5 - n)}</span></span>`;
  }
  function cardHtml(l) {
    const v = visita(l.id);
    const st = STATUS[v.status];
    const zap = zapLink(l.whatsapp, l.nome);
    const insta = instaUrl(l.instagram);
    const its = itensDo(l);
    const tags = [l.capacidade ? `até ${l.capacidade} pessoas` : null, ...its.slice(0, 4).map((k) => itemTexto(l, k)),
      its.length > 4 ? `+${its.length - 4} itens` : null].filter(Boolean);
    return `<article class="card ${v.status === 'descartado' ? 'descartado' : ''}">
      <div class="capa-box">
        <button type="button" class="capa" data-abrir="${l.id}" aria-label="Ver detalhes de ${esc(l.nome)}">${capaHtml(l)}</button>
        <span class="selo-tipo">${esc(l.tipo)}</span>
        ${v.status ? `<span class="selo-visita ${st.cls}">${ic(st.icone)}${st.rotulo}${v.status === 'visitado' && v.data ? ' · ' + dataBR(v.data) : ''}</span>` : ''}
        <button type="button" class="coracao" data-fav="${l.id}" aria-pressed="${v.favorito}" aria-label="${v.favorito ? 'Remover dos' : 'Adicionar aos'} favoritos">${ic('coracao')}</button>
      </div>
      <div class="corpo">
        <h2><button type="button" data-abrir="${l.id}">${esc(l.nome)}</button></h2>
        <p class="onde">${ic('pin')}${esc(l.bairro || 'Palmas')}</p>
        ${precoCard(l)}
        ${v.nota ? `<div class="minha-nota">${estrelas(v.nota)} sua nota${v.pros.length || v.contras.length ? ` · ${v.pros.length} prós, ${v.contras.length} contras` : ''}</div>` : ''}
        ${tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        <div class="rodape-card">
          ${zap ? `<a class="mini zap" href="${zap}" target="_blank" rel="noopener" title="WhatsApp">${ic('zap')}WhatsApp</a>` : ''}
          ${insta ? `<a class="mini insta" href="${esc(insta)}" target="_blank" rel="noopener" title="Instagram" aria-label="Instagram">${ic('insta')}</a>` : ''}
          ${!zap && l.telefone ? `<a class="mini" href="tel:+55${digitos(l.telefone)}">${ic('fone')}Ligar</a>` : ''}
          <span class="esp"></span>
          <label class="cmp"><input type="checkbox" data-cmp="${l.id}" ${S.cmp.has(l.id) ? 'checked' : ''}> Comparar</label>
        </div>
      </div>
    </article>`;
  }
  function renderLista() {
    const r = filtrados();
    renderAplicados(r.length);
    if (!r.length) {
      const msg = S.aba === 'todos'
        ? ['Nada com esses filtros', 'Tente tirar algum filtro ou buscar por outro termo.']
        : ['Lista vazia por enquanto', 'Abra um local e use “Minha visita” para marcar favorito, visita ou descarte.'];
      $('#lista').innerHTML = `<div class="vazio"><h3>${msg[0]}</h3><p>${msg[1]}</p></div>`;
    } else {
      $('#lista').innerHTML = r.map(cardHtml).join('');
    }
    renderBarraComparar();
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
      zap && `<a class="btn zap" href="${zap}" target="_blank" rel="noopener">${ic('zap')}WhatsApp</a>`,
      l.telefone && `<a class="btn" href="tel:+55${digitos(l.telefone)}">${ic('fone')}${esc(l.telefone)}</a>`,
      insta && `<a class="btn" href="${esc(insta)}" target="_blank" rel="noopener">${ic('insta')}${esc(instaArroba(l.instagram))}</a>`,
      urlSegura(l.site) && `<a class="btn" href="${esc(l.site)}" target="_blank" rel="noopener">${ic('site')}Site</a>`,
      `<a class="btn" href="${esc(mapaUrl(l))}" target="_blank" rel="noopener">${ic('mapa')}Mapa</a>`,
    ].filter(Boolean).join('');
    const meta = [l.tipo, l.endereco || l.bairro, l.capacidade ? `até ${l.capacidade} pessoas` : null].filter(Boolean).map(esc).join(' · ');
    $('#detalhe').innerHTML = `
      <div class="folha-topo">
        <button type="button" class="fechar" data-fechar aria-label="Fechar">${ic('voltar')}</button>
        <h2 id="detalhe-titulo">${esc(l.nome)}</h2>
        <button type="button" class="fechar" data-editar="${l.id}" aria-label="Editar local" title="Editar local">${ic('editar')}</button>
        <button type="button" class="coracao" style="position:static;box-shadow:none;border:1px solid var(--linha)" data-fav="${l.id}" aria-pressed="${visita(l.id).favorito}" aria-label="Favorito">${ic('coracao')}</button>
      </div>
      <div class="folha-capa">${capaHtml(l, true)}</div>
      <div class="folha-corpo">
        <h1>${esc(l.nome)}</h1>
        <p class="meta">${meta}</p>
        <div class="contatos">${contatos}</div>
        <div class="segmento" role="tablist">
          <button type="button" role="tab" data-daba="sobre" aria-selected="${S.detalheAba === 'sobre'}">Informações</button>
          <button type="button" role="tab" data-daba="visita" aria-selected="${S.detalheAba === 'visita'}">Minha visita</button>
        </div>
        <div id="painel-detalhe">${S.detalheAba === 'sobre' ? sobreHtml(l) : visitaHtml(l)}</div>
      </div>`;
    atualizarSync();
  }
  function sobreHtml(l) {
    const precos = (l.precos || []).length
      ? `<div class="cartao">${l.precos.map((p) => `
          <div class="linha-preco">
            <span class="v">${typeof p.valor === 'number' ? brl(p.valor) : esc(p.valor || 'Sob consulta')}${p.unidade ? ` <small>/ ${esc(p.unidade)}</small>` : ''}</span>
            <span class="c">${esc(p.condicao || 'Condição não informada')}</span>
            ${p.inclui ? `<span class="i">Inclui: ${esc(p.inclui)}</span>` : ''}
          </div>`).join('')}</div>`
      : '<div class="cartao"><p class="texto">Sem valor publicado. Peça orçamento informando data, horário e número de convidados.</p></div>';
    const taxas = (l.taxas || []).length
      ? `<div class="cartao" style="margin-top:8px">${l.taxas.map((t) => `<div class="linha-preco"><span class="v">+ ${typeof t.valor === 'number' ? brl(t.valor) : esc(t.valor)}</span><span class="c">${esc(t.nome)}</span></div>`).join('')}</div>`
      : '';
    const pagamento = l.pagamento ? `<div class="cartao" style="margin-top:8px"><div class="linha-preco"><span class="v"><small>Pagamento</small></span><span class="c" style="font-weight:400">${esc(l.pagamento)}</span></div></div>` : '';
    const v = visita(l.id);
    const orc = v.orcamento_valor ? `<div class="cartao" style="margin-top:8px"><div class="linha-preco"><span class="v">${esc(v.orcamento_valor)}</span><span class="c">Orçamento que você recebeu</span>${v.orcamento_condicao ? `<span class="i">${esc(v.orcamento_condicao)}</span>` : ''}</div></div>` : '';
    const horarios = (l.horarios || []).length
      ? `<ul class="lista-simples">${l.horarios.map((h) => `<li><strong>${esc(h.dias)}</strong>: ${esc(h.horario)}</li>`).join('')}</ul>`
      : '<p class="texto">Não informado. Pergunte o horário de início e término e se há cobrança por hora extra.</p>';
    return `
      <section class="secao"><h3>Valores e condições</h3>${precos}${taxas}${pagamento}${orc}
        <div class="nota-aviso">${ic('alerta')}<span>O valor muda com o dia da semana, a temporada, a duração e o que está incluso. Os daqui são referência de ${dataBR(l.conferido_em)}.</span></div>
      </section>
      <section class="secao"><h3>Horários de uso</h3><div class="cartao">${horarios}</div></section>
      <section class="secao"><h3>O que vem</h3>
        ${itensDo(l).length
          ? `<ul class="vem">${itensDo(l).map((k) => `<li>${ic('check')}${esc(itemTexto(l, k))}</li>`).join('')}</ul>`
          : '<div class="cartao"><p class="texto">Ainda não informado. Pergunte o que vem no aluguel e cadastre em Editar.</p></div>'}
        ${(l.comodidades || []).length ? `<h4 class="sub-h">Detalhes e outros itens</h4><ul class="tags">${l.comodidades.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      </section>
      ${(l.eventos || []).length ? `<section class="secao"><h3>Bom para</h3><ul class="tags">${l.eventos.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>` : ''}
      ${l.observacoes ? `<section class="secao"><h3>Observações</h3><div class="cartao"><p class="texto">${esc(l.observacoes)}</p></div></section>` : ''}
      <p style="margin:22px 0 0"><button type="button" class="btn" data-editar="${l.id}">${ic('editar')}Editar informações deste local</button></p>
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
    return `
      <section class="secao"><h3>Situação</h3>
        <div class="status-visita">${Object.entries(STATUS).map(([k, s]) =>
          `<button type="button" data-status="${k}" data-v="${k}" aria-pressed="${v.status === k}">${ic(s.icone)}${s.rotulo}</button>`).join('')}</div>
      </section>
      <section class="secao"><h3>Visita e nota geral</h3>
        <div class="cartao" style="padding:12px 14px">
          <div class="grade-2">
            <label class="campo"><span>Data da visita</span><input type="date" data-campo="data" value="${esc(v.data)}"></label>
            <div class="campo"><span>Nota geral</span>
              <div class="nota-geral" role="radiogroup" aria-label="Nota geral">${[1, 2, 3, 4, 5].map((n) =>
                `<button type="button" role="radio" aria-checked="${v.nota === n}" aria-label="${n} de 5" data-nota="${n}" class="${n <= v.nota ? 'on' : ''}">★</button>`).join('')}</div>
            </div>
          </div>
        </div>
      </section>
      <section class="secao"><h3>Avaliação por critério</h3>
        <div class="cartao criterios">${CRITERIOS.map(([k, r]) => `
          <div class="criterio"><span>${r}</span><div class="pontos">${[1, 2, 3, 4, 5].map((n) =>
            `<button type="button" data-crit="${k}:${n}" class="${(v.criterios[k] || 0) >= n ? 'on' : ''}" aria-label="${r}: ${n}">${n}</button>`).join('')}</div></div>`).join('')}
        </div>
      </section>
      ${listaEditHtml('pros', v.pros, 'Prós', 'Ex.: estacionamento amplo')}
      ${listaEditHtml('contras', v.contras, 'Contras', 'Ex.: som só até 22h')}
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
    b.hidden = S.cmp.size === 0;
    $('#txt-comparar').textContent = S.cmp.size === 1 ? '1 selecionado · escolha mais um' : `${S.cmp.size} selecionados`;
    b.querySelector('[data-acao="abrir-comparar"]').disabled = S.cmp.size < 2;
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
    const linhas = [
      ['Tipo', ls.map((l) => esc(l.tipo))],
      ['Onde', ls.map((l) => esc(l.bairro || '—'))],
      ['Menor valor', ls.map((l, i) => {
        const p = (l.precos || []).find((x) => x.valor === precos[i]);
        return [precos[i] != null ? `<strong>${brl(precos[i])}</strong><br><small>${esc(p.unidade || '')} · ${esc(p.condicao || '')}</small>` : 'Sob consulta', precos[i] != null && precos[i] === bp];
      })],
      ['Taxas extras', ls.map((l) => ((l.taxas || []).length ? l.taxas.map((t) => `${esc(t.nome)}: ${typeof t.valor === 'number' ? brl(t.valor) : esc(t.valor)}`).join('<br>') : '—'))],
      ['Orçamento recebido', vs.map((v) => (v.orcamento_valor ? `${esc(v.orcamento_valor)}<br><small>${esc(v.orcamento_condicao)}</small>` : '—'))],
      ['Capacidade', ls.map((l, i) => [l.capacidade ? `${l.capacidade} pessoas` : '—', caps[i] && caps[i] === bc])],
      ['Situação', vs.map((v) => STATUS[v.status].rotulo + (v.data ? ` (${dataBR(v.data)})` : ''))],
      ['Nota geral', vs.map((v, i) => [v.nota ? estrelas(v.nota) : '—', notas[i] && notas[i] === bn])],
      ...CRITERIOS.map(([k, r]) => {
        const vals = vs.map((v) => v.criterios[k] || null);
        const b = melhor(vals, true);
        return [r, vals.map((x) => [x ? `${x}/5` : '—', x && x === b])];
      }),
      ['Prós', vs.map((v) => lista(v.pros))],
      ['Contras', vs.map((v) => lista(v.contras))],
      ['O que vem', ls.map((l) => lista(itensDo(l).map((k) => itemTexto(l, k))))],
      ['Outros itens', ls.map((l) => lista(l.comodidades || []))],
    ];
    $('#comparar').innerHTML = `
      <div class="folha-topo">
        <button type="button" class="fechar" data-fechar aria-label="Fechar">${ic('voltar')}</button>
        <h2>Comparando ${ls.length} locais</h2>
      </div>
      <div class="folha-corpo" style="padding-bottom:8px"><p class="meta">Em verde, o melhor de cada linha. Notas e orçamentos vêm do que você registrou nas visitas.</p></div>
      <div class="tabela-wrap"><table class="tabela-cmp">
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
      <h2>Sincronização</h2>
      ${API
        ? `<p>As visitas ficam salvas neste aparelho e na nuvem. Qualquer pessoa vê o que foi registrado; para <strong>gravar</strong> visitas e <strong>cadastrar ou editar locais</strong> é preciso a chave de edição (pergunte a quem cuida do site).</p>
           <label class="campo"><span>Chave de edição</span><input id="in-chave" type="password" autocomplete="off" value="${esc(S.chave)}" placeholder="Digite a chave"></label>
           <div class="acoes"><button class="btn primario" data-acao="salvar-chave">Salvar chave</button>${S.chave ? '<button class="btn" data-acao="esquecer-chave">Esquecer neste aparelho</button>' : ''}</div>`
        : `<p>Sem nuvem configurada: as visitas ficam salvas só neste navegador. Use o backup para levar para outro aparelho.</p>`}
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
    } catch { toast('Não consegui falar com a nuvem agora. A chave foi guardada mesmo assim.'); }
    S.chave = v; lsSet(LS.chave, v);
    Object.keys(S.visitas).forEach((id) => S.pendentes.add(id));
    lsSet(LS.pendentes, [...S.pendentes]);
    toast('Chave salva. Sincronizando…');
    $('#config').close();
    sincronizar();
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
    while (S.porId[id] || S.base.some((l) => l.id === id) || S.remotos.some((r) => r.id === id)) id = `${base}-${n++}`;
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
    precos: { rot: 'valor', campos: [['valor', 'Valor', 'R$ 1.500 ou Sob consulta'], ['unidade', 'Por', 'diária, evento, 5h de uso'], ['condicao', 'Condição', 'sexta a domingo, até 100 pessoas'], ['inclui', 'O que esse valor inclui', 'mesas, limpeza…']] },
    taxas: { rot: 'taxa', campos: [['nome', 'Taxa', 'limpeza, caução, energia'], ['valor', 'Valor', 'R$ 150']] },
    horarios: { rot: 'horário', campos: [['dias', 'Dias', 'sábado'], ['horario', 'Horário', '8h às 2h']] },
  };
  function linhaRep(tipo, d = {}) {
    return `<div class="rep-linha rep-${tipo}">
      ${REP[tipo].campos.map(([k, rot, ph]) => `<label class="campo c-${k}"><span>${rot}</span><input data-k="${k}" value="${esc(k === 'valor' ? valorTxt(d[k]) : d[k] || '')}" placeholder="${esc(ph)}"></label>`).join('')}
      <button type="button" class="tirar-linha" data-tirar-linha aria-label="Remover ${REP[tipo].rot}">×</button>
    </div>`;
  }
  function blocoRep(tipo, titulo, ajuda, itens) {
    return `<fieldset class="ed-bloco"><legend>${titulo}</legend>${ajuda ? `<p class="ajuda">${ajuda}</p>` : ''}
      <div class="rep" data-rep="${tipo}">${(itens.length ? itens : [{}]).map((d) => linhaRep(tipo, d)).join('')}</div>
      <button type="button" class="btn ghost add-linha" data-acao="add-linha" data-rep="${tipo}">${ic('mais')}Adicionar ${REP[tipo].rot}</button>
    </fieldset>`;
  }

  function abrirEditor(id) {
    const l = id ? S.porId[id] : null;
    if (id && !l) return;
    ED = { id: l ? l.id : null, sujo: false };
    if ($('#detalhe').open) $('#detalhe').close();
    limparHash();
    const it = (l && l.itens) || {};
    const eventosTodos = [...new Set([...EVENTOS_BASE, ...S.locais.flatMap((x) => x.eventos || [])])];
    const evSel = new Set((l && l.eventos) || []);
    const mapaTxt = l ? (l.mapa || (l.coordenadas ? `${l.coordenadas.lat}, ${l.coordenadas.lng}` : '')) : '';
    const situ = [...new Set([...SITUACOES, ...(l && l.status ? [l.status] : [])])];
    const d = $('#editor');
    d.innerHTML = `<form id="form-editor" novalidate>
      <div class="folha-topo">
        <button type="button" class="fechar" data-acao="cancelar-editor" aria-label="Fechar">${ic('voltar')}</button>
        <h2>${l ? `Editar: ${esc(l.nome)}` : 'Cadastrar local'}</h2>
      </div>
      <div class="folha-corpo">
        ${!API ? '<p class="nota-aviso">A nuvem não está configurada, então não dá para salvar cadastros por aqui.</p>'
          : !S.chave ? '<p class="nota-aviso">Para salvar você vai precisar da chave de edição. Pode preencher agora e informar a chave na hora de salvar.</p>' : ''}

        <fieldset class="ed-bloco"><legend>Básico</legend>
          <div class="grade-2">
            <label class="campo largo"><span>Nome do local *</span><input name="nome" required maxlength="120" value="${esc(l?.nome || '')}" placeholder="ex.: Chácara Recanto do Sol"></label>
            <label class="campo"><span>Tipo</span><input name="tipo" list="dl-tipos" maxlength="60" value="${esc(l?.tipo || '')}" placeholder="Salão de festas, Chácara…"></label>
            <label class="campo"><span>Capacidade (pessoas)</span><input name="capacidade" type="number" inputmode="numeric" min="1" max="100000" value="${esc(l?.capacidade ?? '')}" placeholder="ex.: 150"></label>
            <label class="campo"><span>Bairro / quadra</span><input name="bairro" maxlength="120" value="${esc(l?.bairro || '')}" placeholder="ex.: 403 Sul"></label>
            <label class="campo"><span>Endereço</span><input name="endereco" maxlength="300" value="${esc(l?.endereco || '')}"></label>
            <label class="campo largo"><span>Localização no mapa</span><input name="mapa" maxlength="500" value="${esc(mapaTxt)}" placeholder="Cole o link do Google Maps ou as coordenadas (-10.18, -48.33)"></label>
          </div>
          <datalist id="dl-tipos">${[...new Set(['Salão de festas', 'Chácara', 'Espaço com piscina', 'Espaço de eventos', 'Restaurante', ...S.locais.map((x) => x.tipo)])].map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
        </fieldset>

        <fieldset class="ed-bloco"><legend>O que vem no aluguel</legend>
          <p class="ajuda">Marque o que está incluso. Mesas e cadeiras aceitam a quantidade.</p>
          <div class="pills">${ITENS.map(([k, rot, tipo]) => {
            const v = it[k];
            return `<label class="pill${tipo === 'num' ? ' com-qtd' : ''}"><input type="checkbox" data-item="${k}" ${v ? 'checked' : ''}><span>${ic('check')}${esc(rot)}</span>${tipo === 'num'
              ? `<input type="number" class="qtd" data-qtd="${k}" min="1" max="100000" inputmode="numeric" placeholder="qtd" aria-label="Quantidade de ${esc(rot.toLowerCase())}" value="${typeof v === 'number' ? v : ''}">` : ''}</label>`;
          }).join('')}</div>
          <label class="campo" style="margin-top:12px"><span>Outros itens e detalhes (um por linha)</span><textarea name="comodidades" rows="3" placeholder="ex.: 2 piscinas (adulto e infantil)&#10;Mesa de bolo&#10;Decoração não inclusa">${esc(((l && l.comodidades) || []).join('\n'))}</textarea></label>
        </fieldset>

        ${blocoRep('precos', 'Valores', 'Cada valor com a sua condição: dia da semana, horário, número de convidados, pacote.', (l && l.precos) || [])}
        ${blocoRep('taxas', 'Taxas extras', 'Cobranças à parte, como limpeza, caução ou energia.', (l && l.taxas) || [])}
        <fieldset class="ed-bloco"><legend>Pagamento</legend>
          <label class="campo"><span>Condições de pagamento</span><textarea name="pagamento" rows="2" maxlength="600" placeholder="ex.: 50% para reservar, resto até 7 dias antes; Pix ou cartão">${esc(l?.pagamento || '')}</textarea></label>
        </fieldset>
        ${blocoRep('horarios', 'Horários de uso', '', (l && l.horarios) || [])}

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
          <label class="campo" style="margin-top:10px"><span>Observações</span><textarea name="observacoes" rows="4" maxlength="3000" placeholder="Regras, restrições de som, o que não está incluso, pontos de atenção…">${esc(l?.observacoes || '')}</textarea></label>
        </fieldset>

        <fieldset class="ed-bloco"><legend>Origem dos dados</legend>
          <div class="grade-2">
            <label class="campo"><span>Situação</span><select name="status">${situ.map((x) => `<option ${x === (l?.status || 'Informado pelo local') ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
            <label class="campo"><span>Fontes (uma por linha)</span><textarea name="fontes" rows="2" placeholder="Conversa no WhatsApp, link do anúncio…">${esc(((l && l.fontes) || []).join('\n'))}</textarea></label>
          </div>
        </fieldset>
      </div>
      <div class="ed-rodape">
        ${l ? `<button type="button" class="btn ghost perigo" data-acao="remover-local">${ic('lixo')}<span class="lbl">Remover</span></button>` : ''}
        <span class="espaco"></span>
        <button type="button" class="btn" data-acao="cancelar-editor">Cancelar</button>
        <button type="submit" class="btn primario" id="btn-salvar-local">Salvar</button>
      </div>
    </form>`;
    if (!d.open) d.showModal();
    d.querySelector('.folha-corpo').scrollTop = 0;
    d.scrollTop = 0;
    if (!l) setTimeout(() => d.querySelector('[name="nome"]').focus(), 50);
  }

  function lerEditor() {
    const f = $('#form-editor');
    const g = (n) => (f.elements[n]?.value || '').trim();
    const base = ED.id ? S.porId[ED.id] : {};
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
    const horarios = rep('horarios', (r) => (val(r, 'dias') || val(r, 'horario') ? { dias: val(r, 'dias'), horario: val(r, 'horario') } : null));
    const eventos = [...f.querySelectorAll('[data-evento]:checked')].map((c) => c.dataset.evento);
    g('eventos_extra').split(',').map((x) => x.trim()).filter(Boolean).forEach((x) => { if (!eventos.includes(x)) eventos.push(x); });
    const legendas = Object.fromEntries((base.fotos || []).map((x) => [x.url || x, x.legenda || null]));
    const mapa = g('mapa');
    const coord = mapa.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    const cap = parseInt(g('capacidade'), 10);
    return {
      nome: g('nome'),
      tipo: g('tipo') || 'Espaço de eventos',
      bairro: g('bairro') || null,
      endereco: g('endereco') || null,
      coordenadas: coord ? { lat: Number(coord[1]), lng: Number(coord[2]) } : null,
      mapa: /^https?:\/\//i.test(mapa) ? mapa : null,
      capacidade: cap > 0 ? cap : null,
      precos, taxas,
      pagamento: g('pagamento') || null,
      itens,
      comodidades: linhas(g('comodidades')),
      eventos,
      instagram: g('instagram') || null,
      whatsapp: g('whatsapp') || null,
      telefone: g('telefone') || null,
      site: urlSegura(g('site')) ? g('site') : null,
      horarios,
      fotos: linhas(g('fotos')).filter((u) => urlSegura(u)).map((u) => ({ url: u, legenda: legendas[u] || null })),
      observacoes: g('observacoes') || null,
      fontes: linhas(g('fontes')),
      conferido_em: new Date().toISOString().slice(0, 10),
      status: g('status') || null,
    };
  }

  async function gravarLocal(id, dados) {
    if (!API) { toast('A nuvem não está configurada.'); return null; }
    if (!S.chave) { toast('Informe a chave de edição para salvar.'); abrirConfig(); return null; }
    const em = new Date().toISOString();
    try {
      const r = await fetch(`${API}/locais/${encodeURIComponent(id)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Chave': S.chave }, body: JSON.stringify({ ...dados, atualizado_em: em }),
      });
      if (r.status === 401) { toast('Chave de edição incorreta.'); abrirConfig(); return null; }
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      S.remotos = S.remotos.filter((x) => x.id !== id).concat({ id, dados: j.local, atualizado_em: j.atualizado_em });
      lsSet(LS.locais, S.remotos);
      montarLocais(); renderOpcoes(); renderTudo();
      return j.local;
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
    ED.sujo = false; $('#editor').close();
    toast(novo ? 'Local cadastrado.' : 'Alterações salvas.');
    abrirDetalhe(id);
  }

  async function removerLocal() {
    const l = S.porId[ED.id];
    if (!l || !confirm(`Remover "${l.nome}" da lista? Ele deixa de aparecer para todo mundo.`)) return;
    const { _busca, _nuvem, ...resto } = l;
    const ok = await gravarLocal(l.id, { ...resto, removido: true });
    if (!ok) return;
    ED.sujo = false; $('#editor').close();
    toast('Local removido da lista.');
  }

  function fecharEditor() {
    if (ED && ED.sujo && !confirm('Descartar as alterações que você fez?')) return;
    const volta = ED && ED.id;
    if (ED) ED.sujo = false;
    $('#editor').close();
    if (volta && S.porId[volta]) abrirDetalhe(volta); // volta para onde estava
  }
  function limparHash() {
    if (location.hash.startsWith('#local/')) history.replaceState(null, '', location.pathname + location.search);
  }

  /* ============ Toast ============ */
  let tt;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2800);
  }

  /* ============ Eventos ============ */
  function renderTudo() { renderNumeros(); renderAbas(); renderRapidos(); renderLista(); if ($('#detalhe').open) renderDetalhe(); }

  function ligarFiltros() {
    const campos = { busca: '#f-busca', tipo: '#f-tipo', evento: '#f-evento', cap: '#f-cap', preco: '#f-preco', ordem: '#f-ordem' };
    for (const [k, sel] of Object.entries(campos)) {
      const e = $(sel);
      e.value = S.f[k];
      e.addEventListener('input', () => {
        S.f[k] = e.value;
        if (k === 'ordem') lsSet(LS.ui, { ordem: e.value });
        renderLista();
      });
    }
    $('#btn-filtros').addEventListener('click', (e) => {
      const p = $('#painel-filtros');
      const aberto = p.classList.toggle('aberto');
      e.currentTarget.setAttribute('aria-expanded', aberto);
    });
    $('#btn-config').addEventListener('click', abrirConfig);
    const obs = new IntersectionObserver(([en]) => $('#barra').classList.toggle('colada', !en.isIntersecting), { threshold: 0 });
    obs.observe($('.hero'));
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    let b;
    if ((b = t.closest('[data-aba]'))) { S.aba = b.dataset.aba; renderAbas(); renderLista(); return; }
    if ((b = t.closest('[data-rapido]'))) {
      const k = b.dataset.rapido; S.f.rapidos.has(k) ? S.f.rapidos.delete(k) : S.f.rapidos.add(k);
      renderRapidos(); renderLista(); return;
    }
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
      salvarVisita(id, { favorito: fav });
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
    if ((b = t.closest('[data-tirar-linha]'))) {
      const rep = b.closest('.rep'); const linha = b.closest('.rep-linha');
      if (rep.children.length > 1) linha.remove(); else linha.querySelectorAll('input').forEach((i) => { i.value = ''; });
      ED.sujo = true; return;
    }
    if ((b = t.closest('[data-acao]'))) {
      const a = b.dataset.acao;
      if (a === 'novo-local') abrirEditor(null);
      if (a === 'cancelar-editor') fecharEditor();
      if (a === 'remover-local') removerLocal();
      if (a === 'add-linha') {
        const rep = $(`#editor [data-rep="${b.dataset.rep}"]`);
        rep.insertAdjacentHTML('beforeend', linhaRep(b.dataset.rep));
        rep.lastElementChild.querySelector('input').focus();
      }
      if (a === 'abrir-comparar') abrirComparar();
      if (a === 'limpar-comparar') { S.cmp.clear(); renderLista(); }
      if (a === 'salvar-chave') salvarChave();
      if (a === 'esquecer-chave') { S.chave = ''; lsSet(LS.chave, ''); toast('Chave removida deste aparelho.'); $('#config').close(); atualizarSync(); }
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
    if (t.matches('[data-cmp]')) {
      const id = t.dataset.cmp;
      if (t.checked) {
        if (S.cmp.size >= MAX_CMP) { t.checked = false; toast(`Compare até ${MAX_CMP} locais por vez.`); return; }
        S.cmp.add(id);
      } else S.cmp.delete(id);
      renderBarraComparar();
    }
    if (t.id === 'in-import' && t.files[0]) importar(t.files[0]);
  });

  const timersCampo = {};
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.matches('[data-campo]') || !S.detalheId) return;
    const id = S.detalheId, k = t.dataset.campo, v = t.value;
    clearTimeout(timersCampo[k]);
    timersCampo[k] = setTimeout(() => salvarVisita(id, { [k]: v }, { render: true }), 500);
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-editor') { e.preventDefault(); salvarEditor(); return; }
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
    l._busca = norm([l.nome, l.tipo, l.bairro, l.endereco, l.observacoes, ...(l.comodidades || []), ...(l.eventos || []),
      ...itensDo(l).map((k) => ITEM_ROT[k]), ...(l.precos || []).map((p) => `${p.condicao || ''} ${p.inclui || ''}`)].join(' '));
    return l;
  }
  // Para cada id vale a versão mais nova: a do JSON do repositório ou a gravada pelo site.
  function montarLocais() {
    const mapa = new Map(S.base.map((l) => [l.id, l]));
    for (const r of S.remotos) {
      const atual = mapa.get(r.id);
      if (!atual || (atual.atualizado_em || '') < r.atualizado_em) mapa.set(r.id, { ...r.dados, id: r.id, atualizado_em: r.atualizado_em, _nuvem: true });
    }
    S.locais = [...mapa.values()].filter((l) => !l.removido).map(prepLocal);
    S.porId = {};
    S.locais.forEach((l) => { S.porId[l.id] = l; });
    for (const id of [...S.cmp]) if (!S.porId[id]) S.cmp.delete(id);
  }
  async function carregarLocaisRemotos() {
    if (!API) return;
    try {
      const r = await fetch(`${API}/locais`, { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      S.remotos = await r.json();
      lsSet(LS.locais, S.remotos);
      montarLocais();
    } catch { /* fica com o que já tinha */ }
  }
  function renderOpcoes() {
    const opts = (vals, atual) => vals.map((t) => `<option ${t === atual ? 'selected' : ''}>${esc(t)}</option>`).join('');
    const ord = (a) => [...new Set(a)].filter(Boolean).sort((x, y) => x.localeCompare(y, 'pt-BR'));
    $('#f-tipo').innerHTML = '<option value="">Todos</option>' + opts(ord(S.locais.map((l) => l.tipo)), S.f.tipo);
    $('#f-evento').innerHTML = '<option value="">Qualquer</option>' + opts(ord(S.locais.flatMap((l) => l.eventos || [])), S.f.evento);
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
      S.remotos = lsGet(LS.locais, []);
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
    const m = location.hash.match(/^#local\/(.+)$/);
    if (m) abrirDetalhe(decodeURIComponent(m[1]));
    await Promise.all([carregarRemoto(), carregarLocaisRemotos()]);
    renderOpcoes();
    renderTudo();
  }
  iniciar();
})();
