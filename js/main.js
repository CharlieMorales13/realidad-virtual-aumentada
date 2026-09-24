// Arranque: selector de modelo, pantalla de inicio, comprobación de WebXR y paso a modo AR.
document.addEventListener("DOMContentLoaded", async () => {
  const escena = document.querySelector("a-scene");
  const objetoModelo = document.getElementById("objeto-modelo");
  const botonIniciar = document.getElementById("btn-iniciar");
  const mensaje = document.getElementById("inicio-mensaje");
  const listaModelos = document.getElementById("lista-modelos");

  escena.addEventListener("enter-vr", () => document.body.classList.add("en-ar"));
  escena.addEventListener("exit-vr", () => document.body.classList.remove("en-ar", "colocado"));

  // --- Selector de modelo ---
  let seleccionado = APP.config.modelos[0];
  listaModelos.innerHTML = "";
  for (const modelo of APP.config.modelos) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "modelo-boton";
    boton.textContent = modelo.nombre;
    boton.setAttribute("aria-pressed", modelo === seleccionado ? "true" : "false");
    boton.addEventListener("click", () => {
      seleccionado = modelo;
      listaModelos
        .querySelectorAll(".modelo-boton")
        .forEach((b) => b.setAttribute("aria-pressed", b === boton ? "true" : "false"));
    });
    listaModelos.appendChild(boton);
  }

  // --- Soporte WebXR ---
  const soportado = !!navigator.xr && (await navigator.xr.isSessionSupported("immersive-ar").catch(() => false));
  if (!soportado) {
    botonIniciar.disabled = true;
    mensaje.textContent =
      "Este navegador no soporta realidad aumentada. Abre la página con Chrome en un Android compatible con ARCore, por HTTPS.";
    return;
  }

  botonIniciar.addEventListener("click", () => {
    // Se aplica el modelo elegido antes de entrar a AR: ruta, tamaño real y si lleva el efecto de color
    objetoModelo.setAttribute("gltf-model", `url(${seleccionado.archivo})`);
    objetoModelo.setAttribute("ajustar-modelo", "tamanoMetros", seleccionado.tamanoMetros);
    objetoModelo.setAttribute("efecto-material", "activo", seleccionado.efecto !== false);

    APP.audio.asegurar(false); // el audio solo se desbloquea dentro de un gesto; suena al colocar el modelo
    escena.enterAR();
  });
});
