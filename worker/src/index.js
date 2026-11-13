// API das visitas: Cloudflare Worker + D1 (plano gratuito).
// GET  /visitas            -> lista pública de visitas
// GET  /verificar          -> 204 se a chave (header X-Chave) estiver certa
// PUT  /visitas/:local_id  -> grava a visita (exige X-Chave)
// GET  /locais             -> locais cadastrados ou editados pelo site (público)
// PUT  /locais/:id         -> cadastra, edita ou remove um local (exige X-Chave)

const MAX_BYTES = 20_000;
const MAX_BYTES_LOCAL = 60_000;
const ITENS = ['piscina', 'climatizado', 'churrasqueira', 'cozinha', 'fogao', 'freezer', 'geladeira', 'bebedouro', 'mesas', 'cadeiras',
  'toalhas', 'som', 'palco', 'iluminacao', 'brinquedos', 'jogos', 'area_coberta', 'gramado', 'lago', 'estacionamento', 'banheiros',
  'acessivel', 'wifi', 'limpeza', 'gas', 'hospedagem', 'seguranca'];

function cors(env, req) {
  const origem = req.headers.get('Origin') || '';
  const permitidas = (env.ORIGENS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ok = permitidas.includes(origem) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origem);
  return {
    'Access-Control-Allow-Origin': ok ? origem : permitidas[0] || '',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Chave',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(dados, status, headers) {
  return new Response(dados == null ? null : JSON.stringify(dados), {
    status, headers: { ...headers, ...(dados == null ? {} : { 'Content-Type': 'application/json; charset=utf-8' }) },
  });
}

async function chaveOk(req, env) {
  const recebida = req.headers.get('X-Chave') || '';
  if (!env.CHAVE_EDICAO || !recebida) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(recebida)),
    crypto.subtle.digest('SHA-256', enc.encode(env.CHAVE_EDICAO)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

function limpar(d) {
  const txt = (v, n) => String(v ?? '').slice(0, n);
  const lista = (v) => (Array.isArray(v) ? v.slice(0, 50).map((x) => txt(x, 300)) : []);
  const nota = (v) => Math.max(0, Math.min(5, Math.round(Number(v) || 0)));
  const crit = {};
  for (const k of ['preco', 'estrutura', 'localizacao', 'atendimento', 'ambiente']) crit[k] = nota(d?.criterios?.[k]);
  return {
    status: ['', 'quero', 'visitado', 'descartado'].includes(d?.status) ? d.status : '',
    favorito: !!d?.favorito,
    data: /^\d{4}-\d{2}-\d{2}$/.test(d?.data || '') ? d.data : '',
    nota: nota(d?.nota),
    criterios: crit,
    pros: lista(d?.pros),
    contras: lista(d?.contras),
    anotacoes: txt(d?.anotacoes, 5000),
    orcamento_valor: txt(d?.orcamento_valor, 60),
    orcamento_condicao: txt(d?.orcamento_condicao, 300),
    album: /^https?:\/\//.test(d?.album || '') ? txt(d.album, 500) : '',
  };
}

function limparLocal(d) {
  const txt = (v, n) => (v == null || v === '' ? null : String(v).slice(0, n));
  const lista = (v, max, fn) => (Array.isArray(v) ? v.slice(0, max).map(fn).filter((x) => x != null) : []);
  const num = (v, min, max) => { const n = Number(v); return Number.isFinite(n) && n >= min && n <= max ? n : null; };
  const url = (v, n = 500) => { const u = txt(v, n); return u && (/^https:\/\//.test(u) || /^http:\/\//.test(u)) ? u : null; };
  const valor = (v) => (typeof v === 'number' ? num(v, 0, 10_000_000) : txt(v, 80));
  const itens = {};
  for (const k of ITENS) {
    const v = d?.itens?.[k];
    if (v === true) itens[k] = true;
    else if (typeof v === 'number' && num(v, 1, 100000) != null) itens[k] = Math.round(v);
  }
  const lat = num(d?.coordenadas?.lat, -90, 90), lng = num(d?.coordenadas?.lng, -180, 180);
  return {
    nome: txt(d?.nome, 120) || 'Sem nome',
    tipo: txt(d?.tipo, 60) || 'Espaço de eventos',
    bairro: txt(d?.bairro, 120),
    endereco: txt(d?.endereco, 300),
    coordenadas: lat != null && lng != null ? { lat, lng } : null,
    mapa: url(d?.mapa),
    capacidade: num(d?.capacidade, 1, 100000),
    precos: lista(d?.precos, 20, (p) => (p && (p.valor != null || p.condicao)
      ? { valor: valor(p.valor), unidade: txt(p.unidade, 60), condicao: txt(p.condicao, 300), inclui: txt(p.inclui, 300) } : null)),
    taxas: lista(d?.taxas, 10, (t) => (t && t.nome ? { nome: txt(t.nome, 100), valor: valor(t.valor) } : null)),
    pagamento: txt(d?.pagamento, 600),
    itens,
    comodidades: lista(d?.comodidades, 40, (c) => txt(c, 120)),
    eventos: lista(d?.eventos, 20, (c) => txt(c, 60)),
    instagram: txt(d?.instagram, 100),
    whatsapp: txt(d?.whatsapp, 30),
    telefone: txt(d?.telefone, 30),
    site: url(d?.site, 300),
    horarios: lista(d?.horarios, 10, (h) => (h && (h.dias || h.horario) ? { dias: txt(h.dias, 80) || '', horario: txt(h.horario, 120) || '' } : null)),
    fotos: lista(d?.fotos, 20, (f) => {
      const u = txt(f?.url ?? f, 500);
      return u && (/^https?:\/\//.test(u) || /^fotos\/[\w./-]+$/.test(u)) ? { url: u, legenda: txt(f?.legenda, 120) } : null;
    }),
    observacoes: txt(d?.observacoes, 3000),
    fontes: lista(d?.fontes, 10, (f) => txt(f, 300)),
    conferido_em: /^\d{4}-\d{2}-\d{2}$/.test(d?.conferido_em || '') ? d.conferido_em : null,
    status: txt(d?.status, 80),
    removido: d?.removido === true,
  };
}

export default {
  async fetch(req, env) {
    const h = cors(env, req);
    const url = new URL(req.url);
    const partes = url.pathname.split('/').filter(Boolean);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });

    if (req.method === 'GET' && partes[0] === 'visitas' && partes.length === 1) {
      const { results } = await env.DB.prepare('SELECT local_id, dados, atualizado_em FROM visitas').all();
      return json(results.map((r) => ({ ...r, dados: JSON.parse(r.dados) })), 200, { ...h, 'Cache-Control': 'no-store' });
    }

    if (req.method === 'GET' && partes[0] === 'verificar') {
      return json(null, (await chaveOk(req, env)) ? 204 : 401, h);
    }

    if (req.method === 'PUT' && partes[0] === 'visitas' && partes.length === 2) {
      if (!(await chaveOk(req, env))) return json({ erro: 'chave inválida' }, 401, h);
      const id = decodeURIComponent(partes[1]);
      if (!/^[a-z0-9-]{1,80}$/.test(id)) return json({ erro: 'id inválido' }, 400, h);
      const corpo = await req.text();
      if (corpo.length > MAX_BYTES) return json({ erro: 'muito grande' }, 413, h);
      let dados;
      try { dados = JSON.parse(corpo); } catch { return json({ erro: 'json inválido' }, 400, h); }
      const em = typeof dados.atualizado_em === 'string' && !isNaN(Date.parse(dados.atualizado_em))
        ? new Date(dados.atualizado_em).toISOString() : new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO visitas (local_id, dados, atualizado_em) VALUES (?1, ?2, ?3)
         ON CONFLICT(local_id) DO UPDATE SET dados = excluded.dados, atualizado_em = excluded.atualizado_em
         WHERE excluded.atualizado_em >= visitas.atualizado_em`,
      ).bind(id, JSON.stringify(limpar(dados)), em).run();
      return json({ ok: true }, 200, h);
    }

    if (req.method === 'GET' && partes[0] === 'locais' && partes.length === 1) {
      const { results } = await env.DB.prepare('SELECT id, dados, atualizado_em FROM locais').all();
      return json(results.map((r) => ({ ...r, dados: JSON.parse(r.dados) })), 200, { ...h, 'Cache-Control': 'no-store' });
    }

    if (req.method === 'PUT' && partes[0] === 'locais' && partes.length === 2) {
      if (!(await chaveOk(req, env))) return json({ erro: 'chave inválida' }, 401, h);
      const id = decodeURIComponent(partes[1]);
      if (!/^[a-z0-9-]{1,80}$/.test(id)) return json({ erro: 'id inválido' }, 400, h);
      const corpo = await req.text();
      if (corpo.length > MAX_BYTES_LOCAL) return json({ erro: 'muito grande' }, 413, h);
      let dados;
      try { dados = JSON.parse(corpo); } catch { return json({ erro: 'json inválido' }, 400, h); }
      const em = typeof dados.atualizado_em === 'string' && !isNaN(Date.parse(dados.atualizado_em))
        ? new Date(dados.atualizado_em).toISOString() : new Date().toISOString();
      const limpo = { id, ...limparLocal(dados) };
      await env.DB.prepare(
        `INSERT INTO locais (id, dados, atualizado_em) VALUES (?1, ?2, ?3)
         ON CONFLICT(id) DO UPDATE SET dados = excluded.dados, atualizado_em = excluded.atualizado_em
         WHERE excluded.atualizado_em >= locais.atualizado_em`,
      ).bind(id, JSON.stringify(limpo), em).run();
      return json({ ok: true, local: limpo, atualizado_em: em }, 200, h);
    }

    return json({ erro: 'não encontrado' }, 404, h);
  },
};
