// Arranque: pantalla de inicio, comprobación de WebXR y paso a modo AR.
document.addEventListener("DOMContentLoaded", async () => {
  const escena = document.querySelector("a-scene");
  const botonIniciar = document.getElementById("btn-iniciar");
  const mensaje = document.getElementById("inicio-mensaje");

  escena.addEventListener("enter-vr", () => document.body.classList.add("en-ar"));
  escena.addEventListener("exit-vr", () => document.body.classList.remove("en-ar", "colocado"));

  const soportado = !!navigator.xr && (await navigator.xr.isSessionSupported("immersive-ar").catch(() => false));
  if (!soportado) {
    botonIniciar.disabled = true;
    mensaje.textContent =
      "Este navegador no soporta realidad aumentada. Abre la página con Chrome en un Android compatible con ARCore, por HTTPS.";
    return;
  }

  botonIniciar.addEventListener("click", () => {
    APP.audio.asegurar(false); // el audio solo se desbloquea dentro de un gesto; suena al colocar el modelo
    escena.enterAR();
  });
});
