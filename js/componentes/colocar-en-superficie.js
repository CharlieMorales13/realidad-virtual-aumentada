// Coloca el modelo sobre una superficie real usando WebXR hit-test (componente ar-hit-test de A-Frame).
// Va en <a-scene>. Flujo: se detecta la superficie -> el usuario toca -> el modelo queda anclado ahí.
// Emite en la escena: "modelo-colocado" y "modelo-reubicando".
AFRAME.registerComponent("colocar-en-superficie", {
  schema: { target: { type: "selector" } },

  init() {
    this.colocado = false;
    this.superficie = false;
    const escena = this.el;

    escena.addEventListener("enter-vr", () => {
      if (!escena.is("ar-mode")) return;
      this.reiniciar();
      APP.feedback.pista("Mueve el celular despacio para detectar el piso o una mesa");
      APP.feedback.aviso("Buscando superficie…", "info");
      this.notificar();
    });

    escena.addEventListener("exit-vr", () => {
      this.reiniciar();
      this.data.target.object3D.visible = false;
    });

    escena.addEventListener("ar-hit-test-achieved", () => {
      this.superficie = true;
      APP.feedback.pista("Toca la pantalla para colocar el modelo");
      APP.feedback.aviso("Superficie detectada", "ok");
      APP.feedback.vibrar(30);
      APP.audio.beep(660);
      this.notificar();
    });

    escena.addEventListener("ar-hit-test-select", () => {
      this.colocado = true;
      escena.setAttribute("ar-hit-test", "enabled", false); // ya no sigue buscando
      document.body.classList.add("colocado");
      APP.feedback.pista("Toca = pausa · Pellizca = tamaño");
      APP.feedback.aviso("Modelo colocado", "ok");
      APP.feedback.vibrar(50);
      APP.audio.beep(520);
      APP.audio.asegurar(true);
      escena.emit("modelo-colocado");
      this.notificar();
    });
  },

  // Vuelve a activar la búsqueda para mover el modelo a otro lugar
  reubicar() {
    this.colocado = false;
    this.el.setAttribute("ar-hit-test", "enabled", true);
    document.body.classList.remove("colocado");
    APP.feedback.pista("Toca la nueva posición para colocar el modelo");
    APP.feedback.aviso("Elige otro lugar", "aviso");
    APP.feedback.vibrar(25);
    APP.audio.beep(420);
    this.el.emit("modelo-reubicando");
    this.notificar();
  },

  reiniciar() {
    this.colocado = false;
    this.superficie = false;
    this.el.setAttribute("ar-hit-test", "enabled", true);
    document.body.classList.remove("colocado");
  },

  // La interacción táctil escucha este evento para refrescar el HUD con el estado completo
  notificar() {
    this.el.emit("estado-ar", { superficie: this.superficie, colocado: this.colocado });
  },
});
