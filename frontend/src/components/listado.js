import { listarEquipos, eliminarEquipo } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";
import { ErrorApi } from "../modules/errores.js";


const POR_PAGINA = 6;

const $lista = document.querySelector("#lista-equipos");
const $plantilla = document.querySelector("#tpl-equipo");
const $resumen = document.querySelector("#resumen");
const $paginaActual = document.querySelector("#pagina-actual");
const $btnAnterior = document.querySelector("#btn-anterior");
const $btnSiguiente = document.querySelector("#btn-siguiente");

let paginaActual = 1;
let ultimaPagina = 1;

// YA IMPLEMENTADO — "2026-09-15" -> "15 set 2026"
export const formatearFecha = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });

/**
 * TODO [F2] Listado y paginación.
 *
 * cargarPagina(pagina):
 *  - Marque la lista como ocupada (aria-busy="true") mientras carga y desmárquela al terminar.
 *  - Obtenga la página con listarEquipos(pagina, POR_PAGINA).
 *  - Vacíe la lista y, por cada equipo, clone #tpl-equipo y llene:
 *      .codigo, .nombre, .categoria (nombre de la categoría), .fecha (con formatearFecha)
 *      .estado  -> texto del estado y atributo data-estado="<estado>" (el CSS le da color)
 *      li       -> atributo data-id="<id>"
 *    Use SIEMPRE textContent con los datos de la API (nunca innerHTML).
 *  - Si no hay equipos, muestre un <li class="vacio"> con "No hay equipos registrados."
 *  - #resumen:      "Mostrando <from>–<to> de <total>"
 *  - #pagina-actual: "Página <current_page> de <last_page>"
 *  - Deshabilite #btn-anterior en la primera página y #btn-siguiente en la última.
 *  - Si falla, muestre el error con mostrarMensaje("error", ...).
 */
export const cargarPagina = async (pagina = 1) => {
  $lista.setAttribute("aria-busy", "true");

  try {
    const respuesta = await listarEquipos(pagina, POR_PAGINA);
    const equipos = respuesta.data ?? [];
    const meta = respuesta.meta ?? {};

    paginaActual = meta.current_page ?? pagina;
    ultimaPagina = meta.last_page ?? 1;

    $lista.replaceChildren();

    for (const equipo of equipos) {
      const elemento = $plantilla.content.firstElementChild.cloneNode(true);

      elemento.dataset.id = equipo.id;
      elemento.querySelector(".codigo").textContent = equipo.codigo;
      elemento.querySelector(".nombre").textContent = equipo.nombre;
      elemento.querySelector(".categoria").textContent =
        equipo.categoria?.nombre ?? "Sin categoría";
      elemento.querySelector(".fecha").textContent =
        equipo.fecha_adquisicion
          ? formatearFecha(equipo.fecha_adquisicion)
          : "";

      const estado = elemento.querySelector(".estado");
      estado.textContent = equipo.estado;
      estado.dataset.estado = equipo.estado;

      $lista.append(elemento);
    }

    if (equipos.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "No hay equipos registrados.";
      $lista.append(vacio);
    }

    const desde = meta.from ?? 0;
    const hasta = meta.to ?? 0;
    const total = meta.total ?? 0;

    $resumen.textContent = `Mostrando ${desde}–${hasta} de ${total}`;
    $paginaActual.textContent =
      `Página ${paginaActual} de ${ultimaPagina}`;

    $btnAnterior.disabled = paginaActual <= 1;
    $btnSiguiente.disabled = paginaActual >= ultimaPagina;
  } catch (error) {
    mostrarMensaje(
      "error",
      error.message || "No fue posible cargar el inventario."
    );
  } finally {
    $lista.setAttribute("aria-busy", "false");
  }
};
/**
 * TODO [F4] Eliminación con manejo de reglas de negocio.
 *
 * Use DELEGACIÓN DE EVENTOS: un solo listener en $lista que detecte clics en .btn-eliminar.
 *  - Pida confirmación con confirm().
 *  - Llame a eliminarEquipo(id).
 *  - 204: muestre "Equipo eliminado." y recargue la página actual
 *         (si era el último de la página y no es la primera, vaya a la anterior).
 *  - 409: muestre el mensaje que envía la API (error.datos.mensaje).
 *  - Otro error: muestre un mensaje general.
 */
const alHacerClicEnLista = async (evento) => {
  const boton = evento.target.closest(".btn-eliminar");

  if (!boton || !$lista.contains(boton)) {
    return;
  }

  const elemento = boton.closest("[data-id]");

  if (!elemento) {
    return;
  }

  const id = elemento.dataset.id;

  if (!confirm("¿Seguro que desea eliminar este equipo?")) {
    return;
  }

  try {
    await eliminarEquipo(id);

    mostrarMensaje("exito", "Equipo eliminado.");

    if (paginaActual > 1 && $lista.children.length === 1) {
      await cargarPagina(paginaActual - 1);
    } else {
      await cargarPagina(paginaActual);
    }
  } catch (error) {
    if (error instanceof ErrorApi && error.status === 409) {
      mostrarMensaje(
        "error",
        error.datos.mensaje ?? error.message
      );
    } else {
      mostrarMensaje(
        "error",
        error.message || "No fue posible eliminar el equipo."
      );
    }
  }
};

// Parcialmente implementado: complete el TODO de los botones de paginación.
export const iniciarListado = () => {
  $lista.addEventListener("click", alHacerClicEnLista);

  $btnAnterior.addEventListener("click", () => {
    if (paginaActual > 1) {
      cargarPagina(paginaActual - 1);
    }
  });

  $btnSiguiente.addEventListener("click", () => {
    if (paginaActual < ultimaPagina) {
      cargarPagina(paginaActual + 1);
    }
  });

  cargarPagina(1);
};