// API das visitas: Cloudflare Worker + D1 (plano gratuito).
// GET  /visitas            -> lista pública de visitas
// GET  /verificar          -> 204 se a chave (header X-Chave) estiver certa
// PUT  /visitas/:local_id  -> grava a visita (sem chave)
// GET  /dados/:colecao     -> locais, fornecedores e eventos (público)
// PUT  /dados/:colecao/:id -> cadastra ou edita sem chave. Excluir (removido: true) exige X-Chave

const MAX_BYTES = 20_000;
const MAX_BYTES_DADOS = 100_000;
// publica = qualquer um lê e grava. A chave só vale para excluir.
const COLECOES = { locais: { publica: true }, fornecedores: { publica: true }, eventos: { publica: true } };
const CRITERIOS = ['preco', 'estrutura', 'localizacao', 'atendimento', 'ambiente', 'qualidade', 'confianca', 'flexibilidade'];

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

// Data da gravação: aceita a do aparelho, mas nunca no futuro (senão travaria as edições seguintes).
function quando(v) {
  const agora = Date.now();
  const t = typeof v === 'string' ? Date.parse(v) : NaN;
  return new Date(isNaN(t) || t > agora ? agora : t).toISOString();
}

function limpar(d) {
  const txt = (v, n) => String(v ?? '').slice(0, n);
  const lista = (v) => (Array.isArray(v) ? v.slice(0, 50).map((x) => txt(x, 300)) : []);
  const nota = (v) => Math.max(0, Math.min(5, Math.round(Number(v) || 0)));
  const crit = {};
  for (const k of CRITERIOS) crit[k] = nota(d?.criterios?.[k]);
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

// Catálogo e eventos: o site define os campos; aqui só limita tamanho e formato.
// Tudo é exibido escapado no site, e links passam por verificação de http(s) lá.
function limparGenerico(v, nivel = 0) {
  if (v == null) return null;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') return v.slice(0, 5000);
  if (nivel >= 5) return null;
  if (Array.isArray(v)) return v.slice(0, 200).map((x) => limparGenerico(x, nivel + 1));
  if (typeof v === 'object') {
    const o = {};
    let n = 0;
    for (const [k, x] of Object.entries(v)) {
      if (!/^[a-z0-9_]{1,40}$/i.test(k) || n++ >= 80) continue;
      o[k] = limparGenerico(x, nivel + 1);
    }
    return o;
  }
  return null;
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
      const id = decodeURIComponent(partes[1]);
      if (!/^[a-z0-9-]{1,80}$/.test(id)) return json({ erro: 'id inválido' }, 400, h);
      const corpo = await req.text();
      if (corpo.length > MAX_BYTES) return json({ erro: 'muito grande' }, 413, h);
      let dados;
      try { dados = JSON.parse(corpo); } catch { return json({ erro: 'json inválido' }, 400, h); }
      const em = quando(dados.atualizado_em);
      await env.DB.prepare(
        `INSERT INTO visitas (local_id, dados, atualizado_em) VALUES (?1, ?2, ?3)
         ON CONFLICT(local_id) DO UPDATE SET dados = excluded.dados, atualizado_em = excluded.atualizado_em
         WHERE excluded.atualizado_em >= visitas.atualizado_em`,
      ).bind(id, JSON.stringify(limpar(dados)), em).run();
      return json({ ok: true }, 200, h);
    }

    if (partes[0] === 'dados' && COLECOES[partes[1]]) {
      const col = partes[1];
      if (req.method === 'GET' && partes.length === 2) {
        if (!COLECOES[col].publica && !(await chaveOk(req, env))) return json({ erro: 'chave inválida' }, 401, h);
        const { results } = await env.DB.prepare('SELECT id, dados, atualizado_em FROM registros WHERE colecao = ?1').bind(col).all();
        return json(results.map((r) => ({ ...r, dados: JSON.parse(r.dados) })), 200, { ...h, 'Cache-Control': 'no-store' });
      }
      if (req.method === 'PUT' && partes.length === 3) {
        const id = decodeURIComponent(partes[2]);
        if (!/^[a-z0-9-]{1,80}$/.test(id)) return json({ erro: 'id inválido' }, 400, h);
        const corpo = await req.text();
        if (corpo.length > MAX_BYTES_DADOS) return json({ erro: 'muito grande' }, 413, h);
        let dados;
        try { dados = JSON.parse(corpo); } catch { return json({ erro: 'json inválido' }, 400, h); }
        if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return json({ erro: 'formato inválido' }, 400, h);
        // Cadastrar e editar é livre. A chave vale para excluir.
        const exigeChave = !COLECOES[col].publica || dados.removido === true;
        if (exigeChave && !(await chaveOk(req, env))) return json({ erro: 'chave inválida' }, 401, h);
        const em = quando(dados.atualizado_em);
        const limpo = { ...limparGenerico(dados), id, removido: dados.removido === true };
        await env.DB.prepare(
          `INSERT INTO registros (colecao, id, dados, atualizado_em) VALUES (?1, ?2, ?3, ?4)
           ON CONFLICT(colecao, id) DO UPDATE SET dados = excluded.dados, atualizado_em = excluded.atualizado_em
           WHERE excluded.atualizado_em >= registros.atualizado_em`,
        ).bind(col, id, JSON.stringify(limpo), em).run();
        return json({ ok: true, item: limpo, atualizado_em: em }, 200, h);
      }
    }

    return json({ erro: 'não encontrado' }, 404, h);
  },
};
