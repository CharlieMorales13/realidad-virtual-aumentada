// Interacción táctil con el modelo ya colocado (va en la entidad del gltf-model):
//   tap = pausa/reanuda · pellizco = tamaño · botones −/pausa/+/reubicar.
// El tamaño también controla el volumen de la canción. Cada acción da retroalimentación.
AFRAME.registerComponent("interaccion-tactil", {
  schema: {
    raizAnimada: { type: "selector" }, // pausar esta entidad pausa también a sus hijos
  },

  init() {
    const cfg = APP.config;
    this.escena = this.el.sceneEl;
    this.factor = 1;
    this.pausado = false;
    this.superficie = false;
    this.colocado = false;
    this.tween = null;
    this.avisoLimite = false;

    const $ = (id) => document.getElementById(id);
    const hud = $("hud");
    const controles = $("controles");

    // Estado de la fase de colocación (lo emite colocar-en-superficie)
    this.escena.addEventListener("estado-ar", (e) => {
      this.superficie = e.detail.superficie;
      this.colocado = e.detail.colocado;
      if (!this.colocado) this.reanudarSiPausado();
      this.refrescar();
    });

    // Botones. beforexrselect evita que tocarlos cuente como "colocar" en AR.
    controles.addEventListener("beforexrselect", (e) => e.preventDefault());
    $("btn-menos").addEventListener("click", () => this.escalarPaso(1 / cfg.pasoBoton));
    $("btn-mas").addEventListener("click", () => this.escalarPaso(cfg.pasoBoton));
    $("btn-pausa").addEventListener("click", () => this.alternarPausa());
    $("btn-reubicar").addEventListener("click", () => this.escena.components["colocar-en-superficie"].reubicar());

    // Gestos sobre la pantalla (solo activos con el modelo colocado)
    let inicio = null; // toque de un dedo
    let pellizco = null; // gesto de dos dedos
    let hubo2Dedos = false;
    const enControles = (e) => controles.contains(e.target);
    const distancia = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    hud.addEventListener("beforexrselect", (e) => {
      if (this.colocado) e.preventDefault();
    });

    hud.addEventListener(
      "touchstart",
      (e) => {
        if (!this.colocado || enControles(e)) return;
        if (e.touches.length === 1) {
          hubo2Dedos = false;
          inicio = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: performance.now() };
        } else if (e.touches.length === 2) {
          hubo2Dedos = true;
          inicio = null;
          pellizco = { d0: distancia(e.touches), factor0: this.factor };
        }
      },
      { passive: true }
    );

    hud.addEventListener(
      "touchmove",
      (e) => {
        if (!this.colocado || enControles(e)) return;
        if (e.touches.length === 2 && pellizco) {
          e.preventDefault();
          this.fijarFactor(pellizco.factor0 * (distancia(e.touches) / pellizco.d0));
        } else if (inicio && e.touches.length === 1) {
          const dx = e.touches[0].clientX - inicio.x;
          const dy = e.touches[0].clientY - inicio.y;
          if (Math.hypot(dx, dy) > 12) inicio = null; // se movió: ya no es un tap
        }
      },
      { passive: false }
    );

    hud.addEventListener(
      "touchend",
      (e) => {
        if (!this.colocado || enControles(e)) return;
        APP.audio.asegurar(!this.pausado);
        if (pellizco && e.touches.length < 2) {
          pellizco = null;
          APP.feedback.aviso(this.textoTamano(), "info");
          APP.feedback.vibrar(20);
        }
        // Tap corto de un solo dedo = pausa/reanuda
        if (inicio && !hubo2Dedos && e.touches.length === 0 && performance.now() - inicio.t < 300) {
          this.alternarPausa();
        }
        if (e.touches.length === 0) inicio = null;
      },
      { passive: true }
    );

    this.refrescar();
  },

  // Volumen (0..1) proporcional al tamaño
  volumenPara(factor) {
    const { factorMin, factorMax, volumenMin, volumenMax } = APP.config;
    const k = (factor - factorMin) / (factorMax - factorMin);
    return volumenMin + (volumenMax - volumenMin) * Math.min(1, Math.max(0, k));
  },

  textoTamano() {
    return `Tamaño ${Math.round(this.factor * 100)}% · 🔊 ${Math.round(this.volumenPara(this.factor) * 100)}%`;
  },

  refrescar() {
    APP.feedback.actualizar({
      superficie: this.superficie,
      colocado: this.colocado,
      pausado: this.pausado,
      factor: this.factor,
      volumen: this.volumenPara(this.factor),
    });
  },

  alternarPausa() {
    this.pausado = !this.pausado;
    const raiz = this.data.raizAnimada;
    if (this.pausado) {
      raiz.pause();
      APP.audio.pausar();
    } else {
      raiz.play();
      APP.audio.asegurar(true);
    }
    this.refrescar();
    APP.feedback.aviso(this.pausado ? "⏸ Pausado" : "▶ Reanudado", this.pausado ? "aviso" : "ok");
    APP.feedback.vibrar(this.pausado ? 50 : 25);
    APP.audio.beep(this.pausado ? 330 : 660);
  },

  // Al reubicar o salir de AR no se deja la animación congelada por accidente
  reanudarSiPausado() {
    if (!this.pausado) return;
    this.pausado = false;
    this.data.raizAnimada.play();
    APP.audio.asegurar(true);
  },

  escalarPaso(multiplicador) {
    const { factorMin, factorMax } = APP.config;
    const destino = Math.min(factorMax, Math.max(factorMin, this.factor * multiplicador));
    if (Math.abs(destino - this.factor) < 1e-4) {
      APP.feedback.aviso(multiplicador > 1 ? "Tamaño máximo" : "Tamaño mínimo", "aviso");
      APP.feedback.vibrar([30, 40, 30]);
      APP.audio.beep(200);
      return;
    }
    this.animarFactor(destino);
    APP.feedback.aviso(
      `Tamaño ${Math.round(destino * 100)}% · 🔊 ${Math.round(this.volumenPara(destino) * 100)}%`,
      "info"
    );
    APP.feedback.vibrar(20);
    APP.audio.beep(multiplicador > 1 ? 520 : 420);
  },

  // Escala directa (pellizco). Avisa una sola vez al tocar el límite.
  fijarFactor(valor) {
    const { factorMin, factorMax } = APP.config;
    const limitado = Math.min(factorMax, Math.max(factorMin, valor));
    if (limitado !== valor) {
      if (!this.avisoLimite) {
        this.avisoLimite = true;
        APP.feedback.aviso(valor > limitado ? "Tamaño máximo" : "Tamaño mínimo", "aviso");
        APP.feedback.vibrar([30, 40, 30]);
      }
    } else {
      this.avisoLimite = false;
    }
    this.aplicarFactor(limitado);
  },

  aplicarFactor(factor) {
    this.factor = factor;
    this.el.components["ajustar-modelo"].fijarFactor(factor);
    APP.audio.fijarVolumen(this.volumenPara(factor));
    this.refrescar();
  },

  // Transición suave para los botones (independiente de la pausa de A-Frame)
  animarFactor(destino) {
    cancelAnimationFrame(this.tween);
    const desde = this.factor;
    const t0 = performance.now();
    const paso = (ahora) => {
      const k = Math.min(1, (ahora - t0) / 160);
      this.aplicarFactor(desde + (destino - desde) * k);
      if (k < 1) this.tween = requestAnimationFrame(paso);
    };
    this.tween = requestAnimationFrame(paso);
  },
});
