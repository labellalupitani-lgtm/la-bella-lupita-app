import type { Env } from './index'

/** El proveedor solo recibe el correo y el código; nunca nombre ni teléfono. */
export async function enviarCodigo(env: Env, correo: string, codigo: string, solicitud: string): Promise<void> {
  const subject = 'Tu código de acceso a Club Lupita'
  const text = `Tu código de acceso a Club Lupita es ${codigo}. Vence en 10 minutos y solo se puede usar una vez. No lo compartás. Si no lo solicitaste, ignorá este mensaje.`
  const html = `<h1>Bienvenido a Club Lupita</h1><p>Tu código de acceso es:</p><p style="font-size:32px;letter-spacing:6px"><strong>${codigo}</strong></p><p>Vence en 10 minutos y solo se puede usar una vez. No lo compartás.</p><p>Si no lo solicitaste, ignorá este mensaje.</p>`
  if (env.RESEND_API_KEY) {
    const respuesta = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`club-lupita-acceso-${solicitud}`},
      body:JSON.stringify({from:`La Bella Lupita <${env.EMAIL_FROM}>`,to:[correo],subject,text,html}),
      signal:AbortSignal.timeout(8000),
    })
    const resultado = await respuesta.json().catch(() => null) as {id?:unknown} | null
    if (!respuesta.ok||typeof resultado?.id!=='string'||!resultado.id) throw Error('correo-no-enviado')
    return
  }
  // Compatible con el transporte de pruebas; producción usa Resend.
  if (!env.EMAIL) throw Error('correo-no-configurado')
  const resultado = await env.EMAIL.send({from:{email:env.EMAIL_FROM!,name:'La Bella Lupita · Club Lupita'},to:correo,subject,text,html})
  if (!resultado.messageId) throw Error('correo-no-enviado')
}
