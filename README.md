# ClickJR · Grupo 29

Landing del TP3 «Dos sentencias, dos soluciones» (Desarrollo de Sistemas Web Front End).

- **Landing publicada:** _(completar con el enlace de Vercel / GitHub Pages)_
- **Repositorio:** _(completar con el enlace público)_

## Integrantes y aportes

| Integrante | Aportes |
|---|---|
| _(completar)_ | _(completar)_ |
| _(completar)_ | _(completar)_ |
| _(completar)_ | _(completar)_ |

## Startup y bloque

- **Startup:** ClickJR, portal de empleo junior que ayuda a encontrar vacantes y seguir postulaciones.
- **Logo:** S01-B (archivo original `S01.webp`).
- **Origen:** startup creada por estudiantes del IFTS 16.
- **Bloque:** Selección y seguimiento.

### Sentencias

- **R3:** Si una empresa intenta agregar un finalista y ya hay tres o más finalistas activos en esa vacante, el sistema bloquea esa incorporación y solicita revisar la selección.
- **R4:** Si la empresa registra un cambio de etapa de una postulación, el sistema informa ese cambio al postulante.

### Propuestas

- **R3 · Terna con tope:** el agente cuenta los finalistas activos antes de sumar uno; con tres o más bloquea y pide revisar la selección. Decisión del grupo: la revisión la hace un reclutador (pausa o descarta a alguien y reintenta).
- **R4 · Aviso de nivel:** cada cambio de etapa llega al postulante con la nueva etapa y el próximo paso. Decisión del grupo: los avisos de cierre pasan antes por un reclutador.

## Identidad visual y experiencia

La landing abre con una pantalla de elección sobre un paisaje ilustrado al atardecer (paleta del logo: violeta, rosa, naranja y crema):

- **Busco mi primer empleo** (`#empleo`): vista juvenil. Cielo vibrante, montaña con sendero y el cursor de ClickJR en la cima, tipografías redondeadas (Fredoka + Nunito), buscador y vacantes de ejemplo, mapa de la postulación. Prioriza R4.
- **Busco talento junior** (`#talento`): vista profesional. Amanecer sobrio con skyline, tipografía Manrope, panel de pipeline de la vacante y proceso en tres pasos. Prioriza R3.

**Interacción:** GSAP 3.12.5 + ScrollTrigger (cdnjs). Parallax por capas en los paisajes (scroll y mouse en la entrada), intro animada de cada vista, tarjetas que aparecen al scrollear, la mascota que recorre las etapas de la postulación, números del pipeline que cuentan, palabras de las sentencias que se iluminan, diagramas que se dibujan siguiendo el flujo, desplegables con apertura suave e inclinación 3D en hover. Con «reducir movimiento» activado, o si GSAP no carga, la página queda estática y completa.

**Assets propios** (`assets/`): mascota cursor, nubes, colinas e íconos ilustrados (CV, ojo, entrevista, terna, oferta, campana, mapa, lupa, empresa) con la paleta del logo.

El contenido que pide la consigna (sentencias originales, propuestas, demos, diagramas, desplegables, equipo y origen) está una sola vez en el HTML y se muestra en ambas vistas; solo cambian el estilo y el orden. Los paisajes se dibujan en `<canvas>` (`scene.js`), sin imágenes externas.

## Herramientas de IA

- **Aplicación:** Claude Code (extensión de VS Code).
- **Modelos:** Claude Haiku 4.5 (primera versión) y Claude Opus 5.5 (rediseño).
- La página se construyó de forma 100% agéntica: el grupo no editó el código a mano.

## Cambios solicitados al agente

1. Leer la consigna y el logo y armar un plan para la landing.
2. Construir la primera versión en HTML, CSS y JavaScript sin frameworks, responsive.
3. Mejorar la UX/UI.
4. Rediseñar con una identidad propia y disruptiva (pixel art / retro) pensada para el público junior y para la retención de usuarios.
5. Reemplazar el pixel art por un estilo ilustrado (paisajes en capas), con una entrada de dos caminos: vista juvenil para quien busca empleo y vista profesional para empresas, sin romper la lógica pedida por la consigna.
6. Sumar interacción al scrollear, assets ilustrados propios y componentes alineados con la gráfica principal (se incorporó GSAP + ScrollTrigger).

## Estructura

```
index.html   Landing (entrada + vistas empleo / talento)
styles.css   Estilos y temas de cada vista
scene.js     Paisajes ilustrados en canvas, por capas
anim.js      Animaciones e interacción con GSAP + ScrollTrigger
script.js    Navegación entre vistas, vacantes y demos de R3 y R4 (sin backend)
assets/      Mascota, nubes, colinas e íconos ilustrados (SVG)
S01.webp     Logo original
```

Para verla en local: `npx serve .` y abrir la URL que indica. Evitar `python -m http.server` en Windows: acepta pocas conexiones simultáneas y algunos íconos o scripts pueden no cargar.

La landing no integra IA, no ejecuta agentes, no conecta APIs ni tiene backend. Las demos simulan los flujos en el navegador con datos de ejemplo.
# clickJr
