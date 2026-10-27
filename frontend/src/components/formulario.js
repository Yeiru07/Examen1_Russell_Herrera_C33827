import { crearEquipo, listarCategorias } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";
import { ErrorApi } from "../modules/errores.js";


const $form = document.querySelector("#form-equipo");
const $selectCategoria = document.querySelector("#categoria_id");
const $btnGuardar = document.querySelector("#btn-guardar");

/**
 * TODO [F3] Formulario de registro de equipos.
 *
 * iniciarFormulario({ alGuardar }):
 *  1. Llene el <select id="categoria_id"> con listarCategorias()
 *     (cree cada <option> con createElement, value = id, texto = nombre).
 *  2. Al enviar el formulario (submit):
 *     - Evite el envío tradicional.
 *     - Limpie los errores anteriores: textContent de [data-error] y aria-invalid de los campos.
 *     - Construya el objeto con FormData. categoria_id y costo_interno deben ir como números.
 *     - Deshabilite #btn-guardar y cambie su texto a "Guardando…" mientras espera.
 *     - Llame a crearEquipo(datos).
 *     - Éxito: limpie el formulario, mostrarMensaje("exito", "Equipo <codigo> registrado.")
 *              y llame a alGuardar().
 *     - 422: por cada campo de error.datos.errors, escriba el PRIMER mensaje en
 *            el <p data-error="<campo>"> y marque el campo con aria-invalid="true".
 *     - Otro error: mostrarMensaje("error", ...).
 *     - Siempre (finally): rehabilite el botón y restaure su texto.
 */
export const iniciarFormulario = ({ alGuardar }) => {
  const cargarCategorias = async () => {
    try {
      const respuesta = await listarCategorias();

      $selectCategoria.replaceChildren();

      const opcionInicial = document.createElement("option");
      opcionInicial.value = "";
      opcionInicial.textContent = "Seleccione…";
      $selectCategoria.append(opcionInicial);

      for (const categoria of respuesta.data ?? []) {
        const opcion = document.createElement("option");
        opcion.value = categoria.id;
        opcion.textContent = categoria.nombre;
        $selectCategoria.append(opcion);
      }
    } catch (error) {
      mostrarMensaje("error", error.message || "No fue posible cargar las categorías.");
    }
  };

  cargarCategorias();

  $form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    $form.querySelectorAll("[data-error]").forEach((elemento) => {
      elemento.textContent = "";
    });

    $form.querySelectorAll("[aria-invalid]").forEach((elemento) => {
      elemento.removeAttribute("aria-invalid");
    });

    const formulario = new FormData($form);
    const datos = Object.fromEntries(formulario.entries());

    datos.categoria_id = Number(datos.categoria_id);
    datos.costo_interno = Number(datos.costo_interno);

    const textoOriginal = $btnGuardar.textContent;
    $btnGuardar.disabled = true;
    $btnGuardar.textContent = "Guardando…";

    try {
      const respuesta = await crearEquipo(datos);
      const equipo = respuesta.data ?? respuesta;

      $form.reset();

      mostrarMensaje(
        "exito",
        `Equipo ${equipo.codigo} registrado.`
      );

      await alGuardar();
    } catch (error) {
      if (error instanceof ErrorApi && error.status === 422) {
        const errores = error.datos.errors ?? {};

        for (const [campo, mensajes] of Object.entries(errores)) {
          const salida = $form.querySelector(
            `[data-error="${campo}"]`
          );
          const entrada = $form.elements.namedItem(campo);

          if (salida) {
            salida.textContent = mensajes[0];
          }

          if (entrada && "setAttribute" in entrada) {
            entrada.setAttribute("aria-invalid", "true");
          }
        }

        mostrarMensaje("error", "Revise los campos indicados.");
      } else {
        mostrarMensaje(
          "error",
          error.message || "No fue posible registrar el equipo."
        );
      }
    } finally {
      $btnGuardar.disabled = false;
      $btnGuardar.textContent = textoOriginal;
    }
  });
};

