// Ajusta el modelo al mundo real (metros) al cargar:
//  - su base queda centrada en el origen, para que apoye sobre la superficie detectada
//  - su dimensión mayor mide tamanoMetros al 100 % (varía según el modelo elegido, ver js/config.js)
// Después, el tamaño se controla con fijarFactor() (1 = 100 %).
AFRAME.registerComponent("ajustar-modelo", {
  schema: { tamanoMetros: { default: 0.4 } },

  init() {
    this.escalaNatural = 1;
    this.factor = 1;

    this.el.addEventListener("model-loaded", () => {
      const malla = this.el.getObject3D("mesh");
      // Se mide una copia sin padre: así las animaciones de los ancestros no alteran la medida
      const caja = new THREE.Box3().setFromObject(malla.clone());
      const tamano = caja.getSize(new THREE.Vector3());
      const centro = caja.getCenter(new THREE.Vector3());

      malla.position.x -= centro.x;
      malla.position.z -= centro.z;
      malla.position.y -= caja.min.y;

      this.escalaNatural = this.data.tamanoMetros / Math.max(tamano.x, tamano.y, tamano.z);
      this.fijarFactor(this.factor);

      // ar-hit-test dibuja el reticle con el tamaño del objeto: que lo recalcule con el tamaño real
      const hitTest = this.el.sceneEl.components["ar-hit-test"];
      if (hitTest) hitTest.update();
    });
  },

  fijarFactor(factor) {
    this.factor = factor;
    const e = this.escalaNatural * factor;
    this.el.object3D.scale.set(e, e, e);
  },
});
