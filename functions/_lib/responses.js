export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function redirect(location, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("location", location);
  return new Response(null, { status: 302, ...init, headers });
}

export function badRequest(message = "Requisição inválida") {
  return json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Não autorizado") {
  return json({ error: message }, { status: 401 });
}

export function forbidden(message = "Sem permissão") {
  return json({ error: message }, { status: 403 });
}

export function notFound(message = "Não encontrado") {
  return json({ error: message }, { status: 404 });
}

export function methodNotAllowed() {
  return json({ error: "Método não permitido" }, { status: 405 });
}

export function serverError(message = "Erro interno") {
  return json({ error: message }, { status: 500 });
}
