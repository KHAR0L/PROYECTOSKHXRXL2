document.addEventListener('DOMContentLoaded', () => {
    const titulo = document.querySelector('h2');
    if (titulo) {
        titulo.innerText = "Proyectos KHXRXL";
        titulo.style.fontFamily = 'Montserrat, sans-serif';
    }

    const tableBody = document.querySelector('#clientesTable tbody');
    const agregarProyectoBtn = document.getElementById('agregarProyecto');
    const container = document.querySelector('.container');

    const prioridadMap = {
        'MuyAlta': 5,
        'Alta': 4,
        'Media': 3,
        'Baja': 2,
        'MuyBaja': 1,
        'SinPrioridad': 0
    };

    const updateContainerHeight = () => {
        const tableHeight = tableBody.getBoundingClientRect().height;
        container.style.height = `${tableHeight + 60}px`;
    };

    // --- NUEVAS FUNCIONES DE PERSISTENCIA ---
    function guardarProyectos() {
        const filas = Array.from(tableBody.querySelectorAll('tr'));
        const proyectos = filas.map(fila => {
            const datos = {};
            fila.querySelectorAll('td').forEach(td => {
                const label = td.dataset.label;
                let valor;
                const input = td.querySelector('input, select');
                if (input) {
                    valor = input.value;
                } else {
                    valor = td.innerText.trim();
                }
                datos[label] = valor;
            });
            return datos;
        });
        localStorage.setItem('proyectos', JSON.stringify(proyectos));
    }

    function cargarProyectos() {
        const proyectosString = localStorage.getItem('proyectos');
        if (proyectosString) {
            const proyectos = JSON.parse(proyectosString);
            proyectos.forEach(proyecto => {
                const fila = crearFila();
                fila.querySelectorAll('td').forEach(td => {
                    const label = td.dataset.label;
                    const valor = proyecto[label];
                    const input = td.querySelector('input, select');

                    if (input) {
                        input.value = valor;
                    }

                    if (label === 'Estado') {
                        td.innerText = valor;
                        td.className = `estado ${valor.replace(' ', '-')}`;
                    } else if (label === 'Prioridad') {
                        td.innerText = valor;
                        td.className = `prioridad ${valor.replace(' ', '')}`;
                    }
                });
                tableBody.appendChild(fila);
                actualizarFila(fila);
                toggleEditar(fila, fila.querySelector('.edit-btn'), false); // Cambia a modo visual
            });
            reordenarTabla();
        }
    }

    // --- CÓDIGO ORIGINAL MODIFICADO ---

    function crearFila() {
        const fila = document.createElement('tr');
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        fila.innerHTML = `
            <td data-label="Cliente"><span></span><input type="text"></td>
            <td data-label="Contacto"><span></span><input type="text"></td>
            <td data-label="Proyecto"><span></span><input type="text"></td>
            <td data-label="Estado" class="estado Pendiente">Pendiente</td>
            <td data-label="Tentativa"><span></span><input type="date" value="${formattedDate}"></td>
            <td data-label="Plazo (días)"><span></span><input type="number" min="0" max="365" step="1"></td>
            <td data-label="Restante" class="restante">-</td>
            <td data-label="Calidad">
                <span></span>
                <select>
                    <option value="Básica">Básica</option>
                    <option value="Media">Media</option>
                    <option value="Avanzada">Avanzada</option>
                </select>
            </td>
            <td data-label="Prioridad" class="prioridad SinPrioridad">Sin Prioridad</td>
            <td data-label="Monto"><span></span><input type="number"></td>
            <td data-label="Pago">
                <span></span>
                <select>
                    <option value="PayPal">PayPal</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Otro">Otro</option>
                </select>
            </td>
            <td data-label="Progreso">
                <div class="progress-input-group">
                    <span></span>
                    <input type="number" placeholder="Trabajado"> /
                    <input type="number" placeholder="Meta">
                </div>
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
            </td>
        `;

        const acciones = document.createElement('div');
        acciones.className = 'acciones-flotantes';
        const btnEditar = document.createElement('button');
        btnEditar.innerHTML = '📝';
        btnEditar.className = 'edit-btn';
        const btnBorrar = document.createElement('button');
        btnBorrar.innerHTML = '🗑️';
        btnBorrar.className = 'delete-btn';
        acciones.append(btnEditar, btnBorrar);

        fila.appendChild(acciones);

        fila.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => {
                actualizarFila(fila);
                guardarProyectos(); // Guarda al actualizar
            });
        });

        btnEditar.addEventListener('click', () => {
            toggleEditar(fila, btnEditar);
            if (fila.dataset.editing === 'false') {
                reordenarTabla();
                guardarProyectos(); // Guarda al salir del modo de edición
            }
        });

        btnBorrar.addEventListener('click', () => {
            const filaHeight = fila.getBoundingClientRect().height;
            fila.style.setProperty('--row-height', `${filaHeight}px`);

            fila.classList.add('project-delete-anim');

            fila.addEventListener('animationend', () => {
                fila.remove();
                reordenarTabla();
                guardarProyectos(); // Guarda al borrar
            }, { once: true });
        });

        toggleEditar(fila, btnEditar, true);

        return fila;
    }

    function toggleEditar(fila, btn, forceState) {
        const isEditing = forceState !== undefined ? forceState : fila.dataset.editing === 'true';
        fila.dataset.editing = !isEditing;

        btn.innerHTML = !isEditing ? '✅' : '📝';

        fila.querySelectorAll('td').forEach(td => {
            const span = td.querySelector('span');
            const input = td.querySelector('input, select');
            if (span && input) {
                span.style.display = !isEditing ? 'none' : 'inline-block';
                input.style.display = !isEditing ? 'inline-block' : 'none';

                if (!isEditing) {
                    span.innerText = input.value || '';
                }
            }
        });

        const progressInputs = fila.querySelector('td[data-label="Progreso"]');
        if (progressInputs) {
            const inputs = progressInputs.querySelectorAll('input');
            const progressContainer = progressInputs.querySelector('.progress-container');
            const span = progressInputs.querySelector('span');

            span.style.display = !isEditing ? 'inline-block' : 'none';
            inputs.forEach(i => i.style.display = !isEditing ? 'inline-block' : 'none');
            progressContainer.style.display = !isEditing ? 'none' : 'block';
        }

        updateContainerHeight();
    }

    function actualizarFila(fila) {
        const getInputValue = (cellIndex) => fila.cells[cellIndex].querySelector('input, select')?.value;

        const trabajadoInput = fila.cells[11].querySelector('input[placeholder="Trabajado"]');
        const metaInput = fila.cells[11].querySelector('input[placeholder="Meta"]');
        const trabajado = parseFloat(trabajadoInput?.value) || 0;
        const meta = parseFloat(metaInput?.value) || 0;

        const progresoPerc = meta > 0 ? Math.min(trabajado / meta, 1) : 0;
        fila.querySelector('.progress-bar').style.width = `${progresoPerc * 100}%`;

        const fechaTentativa = new Date(getInputValue(4));
        const plazoDias = parseFloat(getInputValue(5)) || 0;
        const monto = parseFloat(getInputValue(9)) || 0;

        const hoy = new Date();
        let restante = '-';
        if (!isNaN(fechaTentativa.getTime()) && plazoDias > 0) {
            const diasTranscurridos = Math.floor((hoy.getTime() - fechaTentativa.getTime()) / (1000 * 60 * 60 * 24));
            restante = plazoDias - diasTranscurridos;
        }
        fila.cells[6].innerText = restante >= 0 ? restante : 0;

        let estado = 'Pendiente';
        if (meta > 0 && trabajado >= meta) {
            estado = 'Completado';
        } else if (restante < 0) {
            estado = 'Atrasado';
        } else if (trabajado > 0) {
            estado = 'En-progreso';
        }

        fila.cells[3].innerText = estado.replace('-', ' ');
        fila.cells[3].className = `estado ${estado}`;

        const prioridadCell = fila.cells[8];
        const calidad = getInputValue(7);
        const calidadPunt = calidad === 'Básica' ? 1 : calidad === 'Media' ? 3 : 5;
        const factorMonto = monto ? Math.pow(monto / 100, 0.6) : 0;
        let factorPlazo = 0;
        if (plazoDias > 0) factorPlazo = Math.max(0, 1 - (restante / 365));

        const urgencia = (1 - progresoPerc) * 5 + factorPlazo * 5;
        const puntos = urgencia + calidadPunt + factorMonto * 1.2;

        let nivel = 'SinPrioridad';
        if (plazoDias > 0) {
            if (puntos >= 14) nivel = 'MuyAlta';
            else if (puntos >= 11) nivel = 'Alta';
            else if (puntos >= 8) nivel = 'Media';
            else if (puntos >= 5) nivel = 'Baja';
            else nivel = 'MuyBaja';
        }
        prioridadCell.innerText = nivel.replace(/([A-Z])/g, ' $1').trim();
        prioridadCell.className = `prioridad ${nivel}`;

        fila.dataset.prioridadValue = prioridadMap[nivel];

        fila.querySelectorAll('td').forEach(td => {
            const span = td.querySelector('span');
            const input = td.querySelector('input, select');
            if (span && input) span.innerText = input.value || '';
        });
    }

    function reordenarTabla() {
        const filas = Array.from(tableBody.querySelectorAll('tr'));
        filas.forEach(fila => actualizarFila(fila));
        guardarProyectos();

        const posicionesIniciales = new Map();
        filas.forEach(fila => {
            posicionesIniciales.set(fila, fila.getBoundingClientRect());
            fila.style.transition = 'none';
        });

        filas.sort((a, b) => {
            const prioridadA = parseInt(a.dataset.prioridadValue, 10);
            const prioridadB = parseInt(b.dataset.prioridadValue, 10);
            return prioridadB - prioridadA;
        });

        filas.forEach(fila => tableBody.appendChild(fila));

        requestAnimationFrame(() => {
            filas.forEach(fila => {
                const nuevaPosicion = fila.getBoundingClientRect();
                const posicionInicial = posicionesIniciales.get(fila);
                const deltaY = posicionInicial.top - nuevaPosicion.top;

                if (Math.abs(deltaY) > 1) {
                    fila.style.transform = `translateY(${deltaY}px)`;
                    fila.offsetHeight;

                    requestAnimationFrame(() => {
                        fila.style.transition = 'transform 0.5s ease-in-out';
                        fila.style.transform = '';
                    });
                } else {
                    fila.style.transition = 'none';
                    fila.style.transform = '';
                }
            });
        });

        updateContainerHeight();
    }

    agregarProyectoBtn.addEventListener('click', () => {
        const nuevaFila = crearFila();

        const currentTableHeight = tableBody.getBoundingClientRect().height;
        tableBody.appendChild(nuevaFila);

        const newTableHeight = tableBody.getBoundingClientRect().height;
        container.style.height = `${newTableHeight + 60}px`;

        nuevaFila.classList.add('new-project-anim');

        nuevaFila.addEventListener('animationend', () => {
            nuevaFila.classList.remove('new-project-anim');
            reordenarTabla();
            guardarProyectos(); // Guarda al añadir
        }, { once: true });

        actualizarFila(nuevaFila);
    });

    // Iniciar la actualización periódica cada 1 minuto (60000ms)
    setInterval(() => {
        reordenarTabla();
        guardarProyectos(); // Guarda periódicamente
    }, 60000);

    // Cargar los datos al iniciar la página
    cargarProyectos();
    updateContainerHeight();
});
