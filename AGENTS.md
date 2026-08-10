# Instrucciones para agentes

## Alcance

Estas instrucciones se aplican a todo el repositorio.

## Calidad y entrega

- Antes de considerar un incremento terminado, ejecutar localmente `npm run check` y `npm run build` cuando el cambio afecte código, configuración o dependencias.
- Corregir localmente los fallos antes de utilizar GitHub Actions como comprobación remota.
- Mantener documentación y contratos del proyecto alineados con los cambios funcionales o estructurales.

## GitHub Actions — Local First / Remote Gate

- No usar GitHub Actions como bucle de desarrollo.
- No añadir triggers automáticos por cada `push` de trabajo salvo necesidad técnica documentada.
- La validación ordinaria de lint, typecheck y build se realiza localmente.
- El workflow remoto de calidad se reserva a Pull Requests hacia `main` o a una ejecución manual deliberada.
- Usar filtros por rutas para no ejecutar CI por cambios exclusivamente documentales o assets que no afecten al producto.
- Usar `concurrency` con `cancel-in-progress: true` para descartar ejecuciones obsoletas.
- No generar artifacts ni matrices remotas sin una necesidad concreta.
- Antes de ampliar CI, justificar qué riesgo detecta, por qué no basta la validación local y cuál es el momento mínimo en el que debe ejecutarse.

Principio obligatorio: **validar localmente primero; ejecutar GitHub Actions solo como gate remoto necesario.**
