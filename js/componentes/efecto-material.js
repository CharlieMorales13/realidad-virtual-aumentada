// Anima opacidad y color de los materiales que ya trae el GLB.
// El color parte del color original del modelo y pasa por la paleta.
AFRAME.registerComponent("efecto-material", {
  schema: {
    colores: { default: APP.config.efecto.colores },
    opacidadMin: { default: APP.config.efecto.opacidadMin },
    duracionOpacidad: { default: APP.config.efecto.duracionOpacidad },
    duracionColor: { default: APP.config.efecto.duracionColor },
  },

  init() {
    this.materiales = [];
    this.reloj = 0; // tiempo propio: se detiene al pausar y no salta al reanudar
    this.el.addEventListener("model-loaded", () => {
      const vistos = new Set();
      this.el.getObject3D("mesh").traverse((obj) => {
        if (!obj.isMesh) return;
        const lista = Array.isArray(obj.material) ? obj.material : [obj.material];
        const clonados = lista.map((m) => {
          const c = m.clone(); // no modificar materiales compartidos
          c.transparent = true;
          c.depthWrite = false;
          c.needsUpdate = true;
          if (!vistos.has(c.uuid)) {
            vistos.add(c.uuid);
            this.materiales.push({ mat: c, original: c.color.clone() });
          }
          return c;
        });
        obj.material = Array.isArray(obj.material) ? clonados : clonados[0];
      });
    });
  },

  tick(_t, dt) {
    if (!this.materiales.length) return;
    this.reloj += dt;
    const t = this.reloj;
    const d = this.data;
    const paleta = d.colores.split(",").map((c) => new THREE.Color(c.trim()));

    // Opacidad: oscila entre 1 y opacidadMin
    const k = 0.5 + 0.5 * Math.cos((2 * Math.PI * t) / d.duracionOpacidad);
    const opacidad = d.opacidadMin + (1 - d.opacidadMin) * k;

    // Color: original -> paleta[0] -> paleta[1] -> ... -> original
    const fase = ((t / d.duracionColor) % 1) * (paleta.length + 1);
    const i = Math.floor(fase);
    const f = fase - i;

    for (const { mat, original } of this.materiales) {
      const pasos = [original, ...paleta];
      mat.color.copy(pasos[i]).lerp(pasos[(i + 1) % pasos.length], f);
      mat.opacity = opacidad;
    }
  },
});
