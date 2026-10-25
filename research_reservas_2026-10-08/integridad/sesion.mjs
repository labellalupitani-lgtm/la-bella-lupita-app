// club-lupita/src/worker/sesion.ts
import { timingSafeEqual } from "node:crypto";
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
  const aa = cod.encode(a), bb = cod.encode(b);
  return aa.byteLength === bb.byteLength && timingSafeEqual(aa, bb);
}
async function firmar(secreto, s) {
  const cuerpo = b64url(cod.encode(JSON.stringify(s)));
  const firma = await crypto.subtle.sign("HMAC", await clave(secreto), cod.encode(cuerpo));
  return `${cuerpo}.${b64url(firma)}`;
}
async function verificar(secreto, token) {
  if (!token) return null;
  if (token.length > 4096) return null;
  const partes = token.split("."), [cuerpo, firma] = partes;
  if (partes.length !== 2 || !cuerpo || !firma || !/^[A-Za-z0-9_-]+$/.test(cuerpo) || !/^[A-Za-z0-9_-]{43}$/.test(firma)) return null;
  try {
    const firmaBytes = Uint8Array.from(deB64url(firma), (c) => c.charCodeAt(0));
    if (!await crypto.subtle.verify("HMAC", await clave(secreto), firmaBytes, cod.encode(cuerpo))) return null;
    const s = JSON.parse(deB64url(cuerpo));
    if (typeof s.tel !== "string" || typeof s.exp !== "number" || !Number.isFinite(s.exp) || !["socio", "casa"].includes(s.rol)) return null;
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
