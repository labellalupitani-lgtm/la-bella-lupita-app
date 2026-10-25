# Carta · mejora de búsqueda y navegación

Cambios integrados en el proyecto real, conservando la dirección aprobada. **Sin publicación en producción.**

## Abrir y probar

1. Abrí la [vista previa local](http://127.0.0.1:5262/__preview/entrar).
2. Entrá en **Carta** y buscá `pizza`. Los resultados ocupan el ancho disponible.
3. Usá **Borrar**: vuelve la categoría que tenías elegida y el foco al buscador.
4. En Brunch, abrí un plato después de recorrer la lista. Probá cerrar con Escape y repetir después de recargar la ficha.

La banda superior identifica los datos de prueba. Todo se ejecuta en memoria; las pruebas no realizan operaciones reales. El [selector local](http://127.0.0.1:5262/__preview) permite volver a entrar con una cuenta sintética.

Si el servidor terminó, ejecutá desde `club-lupita`:

```powershell
npm run build
node scripts/vista-previa-diseno.mjs --port 5262 --dist dist --equipo
```

## Entrega y comprobaciones

- [Antes y después](COMPARAR.html): mismo tamaño y consulta en la preview Vite; móvil y escritorio.
- [Referencias y dirección](REFERENCIAS.md): las tres URLs y las dos imágenes adjuntas inspeccionadas.
- [Decisiones, cambios, pruebas y pendientes](REGISTRO.md).
- [Diagnóstico independiente](revision-inicial.md) y [revalidación independiente](revision-final.md).

Pasaron compilación/guardianes, ocho grupos de exploración en Vite, ocho en build y catorce de regresión de Carta. Incluyen cinco anchos, texto ampliado, teclado, vacío, errores, variantes, cotización y recuperación de cobros simulados. Axe no detectó hallazgos en los tamaños comprobados.

La revisión técnica no sustituye tu validación visual. Quedan pendientes pruebas con dispositivos físicos y lector de pantalla real. El siguiente ciclo recomendado es revisar el acceso a cuenta desde la consulta pública de productos.
