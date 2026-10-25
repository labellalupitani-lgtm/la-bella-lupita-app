# Auditoría y tres propuestas · La Bella Lupita

Abrir la [portada navegable](http://127.0.0.1:5311/) o el [informe con matriz filtrable](http://127.0.0.1:5311/informe.html). El servidor escucha únicamente en este equipo.

## Qué probar

- **Carta y pedido:** elegir entre los 73 productos, personalizar, revisar el total, confirmar y seguir el estado. Los escenarios permiten simular error o respuesta perdida, sin duplicar el cargo simulado.
- **Tu visita:** elegir fecha, grupo y zona, revisar, confirmar, cambiar, consultar un resultado incierto y cancelar. El resumen distingue lo propuesto de lo confirmado. El calendario de la demo es de prueba.
- **Pedidos del turno:** revisar la espera, aceptar, confirmar restricciones, preparar, marcar listo y entregar. Cambiar rol a cocina o caja permite evaluar densidad y permisos; la cancelación exige motivo.

Los controles «Escenarios» al final de cada propuesta permiten revisar bordes sin alterar datos reales. Recargar reinicia los datos simulados.

## Documentación

[Crítica general](INFORME.md), [fichas por módulo](MODULOS.md), [cobertura](COBERTURA.md), [plan priorizado](PLAN.md), [multimedia](MULTIMEDIA.md), [movimiento](MOVIMIENTO.md), [referencias](REFERENCIAS.md) y [revisión independiente](REVISION.md).

Las carpetas base, compra, visitas y equipo contienen la evidencia de la aplicación original. Las carpetas revision-funcion, revision-sistema y revision-oficio contienen verificaciones independientes de las propuestas. integracion contiene las capturas finales conjuntas.

## Volver a abrir después de cerrar el servidor

Desde la carpeta club-lupita, con las dependencias locales instaladas:

```powershell
node entregables/auditoria-integral-2026-10-21/servir-demo.mjs
```

Para editar y recompilar exclusivamente las propuestas:

```powershell
node node_modules/typescript/bin/tsc -p entregables/auditoria-integral-2026-10-21/prototipos/tsconfig.json
node node_modules/vite/bin/vite.js build --config entregables/auditoria-integral-2026-10-21/prototipos/vite.config.ts
node entregables/auditoria-integral-2026-10-21/consolidar.mjs
node entregables/auditoria-integral-2026-10-21/generar-informe.mjs
```

## Límites

La aplicación auditada es la compilación congelada indicada en BASE.json. Estas propuestas no conectan pagos, envíos, correos ni servicios de negocio. Las pruebas de la aplicación original usan Worker y base en memoria; no son datos de producción. La cobertura se refiere al inventario definido y distingue las comprobaciones de campo pendientes. Los recursos comerciales pendientes tienen un encargo editorial; no se inventó su autenticidad. La integración en la aplicación y la publicación requieren una fase posterior.
