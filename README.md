# StackPacks

Coleccionable de cartas para aprender desarrollo. Cada día abres sobres, cada carta es un tema corto
y al estudiarla evoluciona. Completar series desbloquea tecnologías más avanzadas.

## Desarrollo

```bash
pnpm install
pnpm dev        # http://localhost:3000  (guía de estilos en /estilos)
pnpm lint
pnpm test
pnpm build
pnpm validate:data   # revisa /data (añade --urls con: pnpm validate:urls)
pnpm icons           # regenera los iconos usados tras cambiar /data
pnpm simulate        # simula el ritmo del sorteo con las cartas reales
```

La guía del proyecto está en [CLAUDE.md](CLAUDE.md).
