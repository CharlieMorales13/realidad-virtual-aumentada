// Configuración central. Todos los valores ajustables viven aquí.
window.APP = window.APP || {};

APP.config = {
  // Tamaño real del modelo al 100 %: su dimensión mayor medirá esto (en metros)
  tamanoMetros: 0.4,

  // Rango del tamaño como factor del 100 % (0.3 = 30 %, 3 = 300 %)
  factorMin: 0.3,
  factorMax: 3,
  pasoBoton: 1.25, // multiplicador de los botones − y +

  // Canción: el volumen sigue al tamaño (factorMin -> volumenMin, factorMax -> volumenMax)
  musica: "assets/weirdfishes.mp3",
  volumenMin: 0.1,
  volumenMax: 1,

  // Efecto de color y opacidad sobre los materiales del GLB
  efecto: {
    colores: "#ff0055,#00d4ff,#ffe600",
    opacidadMin: 0.3,
    duracionOpacidad: 2500,
    duracionColor: 6000,
  },
};
