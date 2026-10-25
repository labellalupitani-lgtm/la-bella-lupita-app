// src/worker/sesion.ts
var cod = new TextEncoder();
var b64url = (b) => {
  const bytes = b instanceof Uint8Array ? b : new Uint8Array(b);
  let s = "";
  for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
var deB64url = (s) => atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
async function clave(secreto) {
  return crypto.subtle.importKey("raw", cod.encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify"
  ]);
}
async function huella(secreto, valor) {
  const firma = await crypto.subtle.sign("HMAC", await clave(secreto), cod.encode(valor));
  return b64url(firma);
}
function igualEnTiempoConstante(a, b) {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}
async function firmar(secreto, s) {
  const cuerpo = b64url(cod.encode(JSON.stringify(s)));
  const firma = await crypto.subtle.sign("HMAC", await clave(secreto), cod.encode(cuerpo));
  return `${cuerpo}.${b64url(firma)}`;
}
async function verificar(secreto, token) {
  if (!token) return null;
  const [cuerpo, firma] = token.split(".");
  if (!cuerpo || !firma) return null;
  try {
    const esperada = b64url(await crypto.subtle.sign("HMAC", await clave(secreto), cod.encode(cuerpo)));
    if (!igualEnTiempoConstante(esperada, firma)) return null;
    const s = JSON.parse(deB64url(cuerpo));
    if (typeof s.tel !== "string" || typeof s.exp !== "number") return null;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}
function codigoDeSeis() {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return String(b[0] % 1e6).padStart(6, "0");
}
export {
  codigoDeSeis,
  firmar,
  huella,
  igualEnTiempoConstante,
  verificar
};
