// Servicio de retroalimentación: avisos en pantalla, vibración e indicadores del HUD.
(function () {
  let temporizador = null;
  const $ = (id) => document.getElementById(id);

  APP.feedback = {
    // Aviso grande y breve en pantalla. tipo: "info" | "ok" | "aviso"
    aviso(texto, tipo = "info") {
      const toast = $("toast");
      toast.textContent = texto;
      toast.dataset.tipo = tipo;
      toast.classList.add("visible");
      clearTimeout(temporizador);
      temporizador = setTimeout(() => toast.classList.remove("visible"), 1400);
    },

    vibrar(patron) {
      if (navigator.vibrate) navigator.vibrate(patron); // no disponible en iOS Safari
    },

    // Instrucción fija que guía al usuario en cada fase
    pista(texto) {
      $("pista").textContent = texto;
    },

    // Refresca indicadores y botones a partir del estado actual
    actualizar({ superficie, colocado, pausado, factor, volumen }) {
      const chipSuperficie = $("chip-superficie");
      chipSuperficie.textContent = colocado ? "● Colocado" : superficie ? "● Superficie lista" : "○ Buscando superficie…";
      chipSuperficie.dataset.estado = colocado || superficie ? "ok" : "busca";

      const chipPausa = $("chip-pausa");
      chipPausa.textContent = pausado ? "⏸ Pausado" : "▶ En movimiento";
      chipPausa.dataset.estado = pausado ? "pausa" : "play";

      $("chip-tamano").textContent = `${Math.round(factor * 100)}% · 🔊 ${Math.round(volumen * 100)}%`;

      $("btn-pausa").textContent = pausado ? "▶" : "⏸";
      $("btn-menos").disabled = !colocado || factor <= APP.config.factorMin + 1e-4;
      $("btn-mas").disabled = !colocado || factor >= APP.config.factorMax - 1e-4;
      $("btn-pausa").disabled = !colocado;
      $("btn-reubicar").disabled = !colocado;
    },
  };
})();
