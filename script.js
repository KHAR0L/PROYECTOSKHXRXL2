document.addEventListener('DOMContentLoaded', () => {

    const AUTH_KEY = 'auth_status';
    const PASSWORD = 'quieroamimama123';

    // --- Funciones para la Autenticación
    function checkAuth() {
        const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true';
        if (isAuthenticated) {
            showTable();
        } else {
            showLoginScreen();
        }
    }

    function showLoginScreen() {
        const loginScreen = document.createElement('div');
        loginScreen.id = 'login-screen';
        loginScreen.className = 'login-container';
        loginScreen.innerHTML = `
            <div class="login-box">
                <h2>Acceso a Proyectos</h2>
                <div class="input-group">
                    <input type="password" id="password-input" placeholder="Ingresa tu contraseña">
                </div>
                <button id="login-btn">Entrar</button>
                <p id="login-message" class="login-message"></p>
            </div>
        `;
        document.body.appendChild(loginScreen);

        const loginBtn = document.getElementById('login-btn');
        const passwordInput = document.getElementById('password-input');
        const loginMessage = document.getElementById('login-message');

        loginBtn.addEventListener('click', () => {
            if (passwordInput.value === PASSWORD) {
                localStorage.setItem(AUTH_KEY, 'true');
                loginMessage.innerText = 'Acceso concedido. Cargando tabla...';
                loginMessage.style.color = 'var(--accent-color)';
                setTimeout(() => {
                    loginScreen.remove();
                    showTable();
                }, 1000);
            } else {
                loginMessage.innerText = 'Contraseña incorrecta. Inténtalo de nuevo.';
                loginMessage.style.color = '#e74c3c';
            }
        });

        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }

    function showTable() {
        document.querySelector('h2').style.display = 'block';
        document.querySelector('.container').style.display = 'block';
        document.getElementById('agregarProyecto').style.display = 'block';
        
        cargarProyectos();
        updateContainerHeight();

        setInterval(() => {
            reordenarTabla();
            guardarProyectos();
        }, 60000);
    }

    const titulo = document.querySelector('h2');
    if (titulo) {
        titulo.innerText = "Proyectos KHXRXL";
        titulo.style.fontFamily = 'Montserrat, sans-serif';
    }
    document.body.style.display = 'flex';

    const tableBody = document.querySelector('#clientesTable tbody');
    const agregarProyectoBtn = document.getElementById('agregarProyecto');
    const container = document.querySelector('.container');

    document.querySelector('h2').style.display = 'none';
    document.querySelector('.container').style.display = 'none';
    document.getElementById('agregarProyecto').style.display = 'none';

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

    function guardarProyectos() {
        const filas = Array.from(tableBody.querySelectorAll('tr'));
        const proyectos = filas.map(fila => {
            const datos = {};
            fila.querySelectorAll('td').forEach(td => {
                const label = td.dataset.label;
                const input = td.querySelector('input, select');
                const span = td.querySelector('span');

                if (input) {
                    datos[label] = input.value;
                } else if (span) {
                    datos[label] = span.innerText.trim();
                } else {
                    datos[label] = td.innerText.trim();
                }

                if (label === 'Progreso') {
                    const trabajadoInput = td.querySelector('input[placeholder="Trabajado"]');
                    const metaInput = td.querySelector('input[placeholder="Meta"]');
                    datos['Progreso_trabajado'] = trabajadoInput.value;
                    datos['Progreso_meta'] = metaInput.value;
                }
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
                    const span = td.querySelector('span');
                    
                    if (input) {
                        input.value = valor || '';
                    }
                    if (span) {
                        span.innerText = valor || '';
                    }

                    if (label === 'Estado' && valor) {
                        td.className = `estado ${valor.replace(' ', '-')}`;
                    } else if (label === 'Prioridad' && valor) {
                        td.className = `prioridad ${valor.replace(' ', '')}`;
                    } else if (label === 'Progreso') {
                        const trabajadoInput = td.querySelector('input[placeholder="Trabajado"]');
                        const metaInput = td.querySelector('input[placeholder="Meta"]');
                        if (trabajadoInput) trabajadoInput.value = proyecto['Progreso_trabajado'] || '';
                        if (metaInput) metaInput.value = proyecto['Progreso_meta'] || '';
                    }
                });
                tableBody.appendChild(fila);
                actualizarFila(fila);
                toggleEditar(fila, fila.querySelector('.edit-btn'), false);
            });
            reordenarTabla();
        }
    }
    
    function crearFila() {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td data-label="Cliente"><span></span><input type="text"></td>
            <td data-label="Contacto"><span></span><input type="text"></td>
            <td data-label="Proyecto"><span></span><input type="text"></td>
            <td data-label="Estado" class="estado Pendiente"><span>Pendiente</span></td>
            <td data-label="Tentativa"><span></span><input type="date"></td>
            <td data-label="Plazo (días)"><span></span><input type="number" min="0" max="365" step="1"></td>
            <td data-label="Restante"><span>-</span></td>
            <td data-label="Calidad">
                <span></span>
                <select>
                    <option value="Básica">Básica</option>
                    <option value="Media">Media</option>
                    <option value="Avanzada">Avanzada</option>
                </select>
            </td>
            <td data-label="Prioridad" class="prioridad SinPrioridad"><span>Sin Prioridad</span></td>
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
                <span></span>
                <div class="progress-input-group">
                    <input type="number" placeholder="Trabajado">
                    <input type="number" placeholder="Meta">
                </div>
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
            </td>
            <td data-label="Acciones"></td>
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
        fila.querySelector('td[data-label="Acciones"]').appendChild(acciones);

        fila.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => {
                actualizarFila(fila);
                guardarProyectos();
            });
        });

        btnEditar.addEventListener('click', () => {
            toggleEditar(fila, btnEditar);
            if (fila.dataset.editing === 'false') {
                reordenarTabla();
                guardarProyectos();
            }
        });

        btnBorrar.addEventListener('click', () => {
            const filaHeight = fila.getBoundingClientRect().height;
            fila.style.setProperty('--row-height', `${filaHeight}px`);
            fila.classList.add('project-delete-anim');
            fila.addEventListener('animationend', () => {
                fila.remove();
                reordenarTabla();
                guardarProyectos();
            }, { once: true });
        });
        
        const today = new Date().toISOString().split('T')[0];
        fila.querySelector('input[type="date"]').value = today;

        toggleEditar(fila, btnEditar, true);

        return fila;
    }

    function toggleEditar(fila, btn, forceState) {
        const isEditing = forceState !== undefined ? forceState : fila.dataset.editing === 'true';
        fila.dataset.editing = !isEditing;

        btn.innerHTML = !isEditing ? '✅' : '📝';
        
        fila.querySelectorAll('td').forEach(td => {
            const span = td.querySelector('span');
            const input = td.querySelector('input, select, .progress-input-group');

            if (span && input) {
                span.style.display = isEditing ? 'none' : 'inline-block';
                input.style.display = isEditing ? 'inline-block' : 'none';
                
                if (td.dataset.label === 'Progreso') {
                    input.style.display = isEditing ? 'flex' : 'none';
                }

                if (isEditing) {
                    if (input.tagName === 'SELECT') {
                        input.value = span.innerText.trim();
                    } else if (td.dataset.label === 'Progreso') {
                        const partes = span.innerText.split('/');
                        const trabaj = partes[0] ? partes[0].trim() : '';
                        const meta = partes[1] ? partes[1].trim() : '';
                        td.querySelector('input[placeholder="Trabajado"]').value = trabaj;
                        td.querySelector('input[placeholder="Meta"]').value = meta;
                    } else {
                        input.value = span.innerText.trim();
                    }
                } else {
                    span.innerText = input.value || '';
                }
            }
        });

        const progressContainer = fila.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.style.display = !isEditing ? 'block' : 'none';
        }

        updateContainerHeight();
    }

    function actualizarFila(fila) {
        const getInputValue = (label) => fila.querySelector(`td[data-label="${label}"] input, td[data-label="${label}"] select`)?.value;

        const trabajadoInput = fila.querySelector('td[data-label="Progreso"] input[placeholder="Trabajado"]');
        const metaInput = fila.querySelector('td[data-label="Progreso"] input[placeholder="Meta"]');
        const trabajado = parseFloat(trabajadoInput?.value) || 0;
        const meta = parseFloat(metaInput?.value) || 0;

        const progresoPerc = meta > 0 ? Math.min(trabajado / meta, 1) : 0;
        fila.querySelector('.progress-bar').style.width = `${progresoPerc * 100}%`;
        fila.querySelector('td[data-label="Progreso"] span').innerText = `${trabajado} / ${meta}`;

        const fechaTentativa = new Date(getInputValue('Tentativa'));
        const plazoDias = parseFloat(getInputValue('Plazo (días)')) || 0;
        const monto = parseFloat(getInputValue('Monto')) || 0;

        const hoy = new Date();
        let restante = '-';
        if (!isNaN(fechaTentativa.getTime()) && plazoDias > 0) {
            const diasTranscurridos = Math.floor((hoy.getTime() - fechaTentativa.getTime()) / (1000 * 60 * 60 * 24));
            restante = plazoDias - diasTranscurridos;
        }
        fila.querySelector('td[data-label="Restante"] span').innerText = restante >= 0 ? restante : 0;

        let estado = 'Pendiente';
        if (meta > 0 && trabajado >= meta) {
            estado = 'Completado';
        } else if (restante < 0 && restante !== '-') {
            estado = 'Atrasado';
        } else if (trabajado > 0) {
            estado = 'En-progreso';
        }

        const estadoCell = fila.querySelector('td[data-label="Estado"]');
        estadoCell.querySelector('span').innerText = estado.replace('-', ' ');
        estadoCell.className = `estado ${estado}`;
        
        const prioridadCell = fila.querySelector('td[data-label="Prioridad"]');
        const calidad = getInputValue('Calidad');
        const calidadPunt = calidad === 'Básica' ? 1 : calidad === 'Media' ? 3 : 5;
        const factorMonto = monto ? Math.pow(monto / 100, 0.6) : 0;
        let factorPlazo = 0;
        if (plazoDias > 0) factorPlazo = Math.max(0, 1 - (restante / plazoDias));

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
        prioridadCell.querySelector('span').innerText = nivel.replace(/([A-Z])/g, ' $1').trim();
        prioridadCell.className = `prioridad ${nivel}`;

        fila.dataset.prioridadValue = prioridadMap[nivel];
    }

    function reordenarTabla() {
        const filas = Array.from(tableBody.querySelectorAll('tr'));
        filas.forEach(fila => actualizarFila(fila));

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
        tableBody.appendChild(nuevaFila);

        nuevaFila.classList.add('new-project-anim');
        nuevaFila.addEventListener('animationend', () => {
            nuevaFila.classList.remove('new-project-anim');
            reordenarTabla();
            guardarProyectos();
        }, { once: true });
        
        actualizarFila(nuevaFila);
        toggleEditar(nuevaFila, nuevaFila.querySelector('.edit-btn'), false);
    });

    checkAuth();

});
