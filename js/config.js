// Configuración central. Todos los valores ajustables viven aquí.
window.APP = window.APP || {};

APP.config = {
  // Modelos disponibles en el selector de la pantalla de inicio.
  //   id: usado para el <a-asset-item> (queda como "modelo-<id>") — sin espacios
  //   archivo: ruta al .glb dentro de assets/
  //   tamanoMetros: tamaño real de su dimensión mayor al 100 % (en metros)
  //   efecto: si aplica la animación de color/opacidad (algunos modelos ya tienen su color final)
  modelos: [
    { id: "criatura", nombre: "Criatura de colores", archivo: "assets/modelo.glb", tamanoMetros: 0.4, efecto: true },
    { id: "spongebob", nombre: "Bob Esponja", archivo: "assets/spongebob.glb", tamanoMetros: 0.35, efecto: false },
  ],

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
