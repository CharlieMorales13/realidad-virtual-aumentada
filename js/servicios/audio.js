// Servicio de audio: canción en bucle con volumen controlable y beeps de retroalimentación.
// Usa un GainNode porque en iOS el audio.volume del elemento se ignora.
(function () {
  let contexto = null;
  let cancion = null;
  let ganancia = null;
  let volumen = APP.config.volumenMin;

  function obtenerContexto() {
    contexto = contexto || new (window.AudioContext || window.webkitAudioContext)();
    if (contexto.state === "suspended") contexto.resume();
    return contexto;
  }

  APP.audio = {
    // Debe llamarse dentro de un gesto del usuario (los navegadores lo exigen).
    // Crea la canción una sola vez; si reproducir es true, además la inicia.
    asegurar(reproducir = true) {
      try {
        const ctx = obtenerContexto();
        if (!cancion) {
          cancion = new Audio(APP.config.musica);
          cancion.loop = true;
          cancion.addEventListener("error", () => APP.feedback.aviso("No se pudo cargar la canción", "aviso"));
          ganancia = ctx.createGain();
          ganancia.gain.value = volumen;
          ctx.createMediaElementSource(cancion).connect(ganancia).connect(ctx.destination);
        }
        if (reproducir && cancion.paused) cancion.play().catch(() => {});
      } catch (_) {
        /* sin audio: el resto de la experiencia sigue funcionando */
      }
    },

    pausar() {
      if (cancion) cancion.pause();
    },

    // v entre 0 y 1; con transición corta para evitar chasquidos
    fijarVolumen(v) {
      volumen = v;
      if (ganancia) ganancia.gain.setTargetAtTime(v, contexto.currentTime, 0.05);
    },

    beep(frecuencia) {
      try {
        const ctx = obtenerContexto();
        const osc = ctx.createOscillator();
        const gan = ctx.createGain();
        osc.frequency.value = frecuencia;
        gan.gain.setValueAtTime(0.08, ctx.currentTime);
        gan.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        osc.connect(gan).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch (_) {
        /* sin audio */
      }
    },
  };
})();
