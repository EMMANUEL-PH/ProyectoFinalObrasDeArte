// Obtenemos el formulario
const formulario = document.getElementById("formBusqueda");
const campoBusqueda = document.getElementById("cadenaBusqueda");
const errorBusqueda = document.getElementById("errorBusqueda");
const respuesta = document.getElementById("publicaciones");

// ocultamos el row donde se mostrarán las publicaciones
const respuestas = document.querySelector("#seccion-respuestas");
respuestas.style.display = "none";

// variable para formatear los datos junto con el HTML y mostrar publicaciones
// o en su caso mensaje de error
let salida = "";

// Registramos la función buscarObras, mediante el método addEventListener
formulario.addEventListener("submit", buscarObras);

async function buscarObras(evento) {
    // Cancela el envío habitual del formulario antes de ejecutar un await
    // Así el navegador se queda en la misma página
    evento.preventDefault();
    // verificamos que hubiera escrito algo en la caja de texto

    // si no escribió nada imprimimos en la página el mensaje correspondiente
    if (!campoBusqueda.value.trim()) {
        errorBusqueda.textContent = "Proporciona la cadena de búsqueda";
        campoBusqueda.focus();
        return;
    }

    // si escribió algo
    // // Obtenemos el criterio seleccionado para saber cómo realizar la búsqueda.
    const radioSeleccionado = formulario.querySelector(
        'input[name="criterio"]:checked'
    );

    // Leemos el valor del radio
    const criterio = radioSeleccionado.value;

    // Creamos una promesa para realizar la petición asíncrona a la API.
    let myPromise = new Promise(function (resolve, reject) {

        // creamos el objeto XMLHttpRequest para enviar y recibir datos del servidor
        let request = new XMLHttpRequest();

        // definimos la URL para hacer la solicitud al API con base
        // a la opción seleccionada por el usuario
        let peticion = "";

        if (radioSeleccionado.value === "q") {
            peticion =
                "https://www.promociones.pescaderiaelcharco.com/obras/?q=" +
                encodeURIComponent(campoBusqueda.value.trim());
        }
        else if (criterio === "tipo") {
            peticion =
                "https://www.promociones.pescaderiaelcharco.com/obras/?tipo=" +
                encodeURIComponent(campoBusqueda.value.trim());
        }
        else if (criterio === "anio") {
            peticion =
                "https://www.promociones.pescaderiaelcharco.com/obras/?anio=" +
                encodeURIComponent(campoBusqueda.value.trim());
        }
        else if (criterio === "m") {
            peticion =
                "https://www.promociones.pescaderiaelcharco.com/obras/index.php?m=" +
                encodeURIComponent(campoBusqueda.value.trim());
        }

        // abrimos la conexión con el método GET y la URL del recurso en internet que recibirá los datos
        // condicionado por el criterio seleccionado
        request.open("GET", peticion);

        // Evento que se ejecuta cuando el servidor responde
        request.onload = function () {
            //Si la respuesta del servidor tiene un código 200 (éxito)
            if (request.status >= 200 && request.status < 300) {
                try {
                    // convertimos la respuesta (texto) a un objeto JSON y resolvemos la promesa
                    resolve(JSON.parse(request.responseText));
                } catch (e) {
                    reject(new Error("La respuesta JSON no es valida"));
                }
            }
            else {
                reject(new Error("Error HTTP " + request.status));
            } // fin del if request.status
        };

        // Evento que se ejecuta si hay un error de red o CORS
        request.onerror = function () {
            reject(new Error("Error de red o CORS"));
        };

        // enviamos la petición hacia el servidor destino
        request.send();
    }); // fin de la solicitud al servido

    // Esperamos la resolución de la promesa con await
    try {
        // hacemos visible el elemento de salida
        respuestas.style.display = "block";

        // Esperamos la respuesta del servidor
        const data = await myPromise;

        salida = "";

        // Verificamos que tipo de dato es lo que me regreso la promesa
        if (Array.isArray(data)) {
            //si se cumple es un arreglo de objetos


            if (data.length == 0) {
                throw new Error("Se lanza excepcion, ya que el arreglo esta vacío");
            }

            salida += `<h2>Resultados de la búsqueda</h2>
           <hr>`;

            data.forEach((obras) => {
                console.log("https://www.promociones.pescaderiaelcharco.com/obras" + obras.imagen);

                salida += `<article class="obras">
                <div class="row">
                    <div class="col-md-6">
                        <img src="https://www.promociones.pescaderiaelcharco.com/obras${obras.imagen}"
                        class="img-fluid"
                        alt="${obras.titulo}">
                    </div>
                    <div class="col-md-6">
                        <h3>${obras.titulo}</h3>
                        <p>${obras.descripcion}</p>
                        <p>Artista: ${obras.artista}</p>
                        <p>Año: ${obras.anio}</p>
                        <p>Tipo: ${obras.tipo}</p>
                        <p>Movimiento: ${obras.movimiento}</p>
                    </div>
                </div>
            </article>
            `;
            });
        }
        else if (data !== null && typeof data === "object") {

        }

    } catch (error) {
        let mensaje = "No se pudo completar la búsqueda. Revisa tu conexión e inténtalo de nuevo.";

        if (error.message === "Se lanza excepcion, ya que el arreglo esta vacío") {
            mensaje = "No se encontró ningún resultado";
        }

        salida = `<article class="obras">
        <p>${mensaje}</p>
        </article>
    `;
    } // fin del bloque try

    // damos salida en la página web según el resultado
    respuesta.innerHTML = salida;

}