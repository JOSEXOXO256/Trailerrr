const API_BASE_URL = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

let authToken = null;

function normalizeTrailer(trailer) {
    return {
        ...trailer,
        tipoTrailer: trailer.tipoTrailer ?? trailer.tipo_trailer ?? '',
        estadoCarga: trailer.estadoCarga ?? trailer.estado_carga ?? '',
        horaEntrada: trailer.horaEntrada ?? trailer.hora_entrada ?? null,
        horaSalida: trailer.horaSalida ?? trailer.hora_salida ?? null,
    };
}

async function apiRequest(url, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    };

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    let payload = null;

    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok) {
        const message = payload && payload.error
            ? payload.error
            : `Error ${response.status}: ${response.statusText}`;
        throw new Error(message);
    }

    return payload;
}

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    document.querySelectorAll('.sidebar .nav-link').forEach((link) => {
        if (link.getAttribute('data-section')) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                showSection(section);

                document.querySelectorAll('.sidebar .nav-link').forEach((item) => {
                    item.classList.remove('active');
                });
                this.classList.add('active');
            });
        }
    });

    document.getElementById('addTrailerBtn').addEventListener('click', showTrailerForm);
    document.getElementById('cancelFormBtn').addEventListener('click', hideTrailerForm);
    document.getElementById('trailerDataForm').addEventListener('submit', saveTrailer);

    document.getElementById('reportFilterForm').addEventListener('submit', generateReport);
}

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const data = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        authToken = data.token;
        currentUser = data.user;

        document.getElementById('currentUserDisplay').textContent = currentUser.username;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';

        await loadDashboardData();
        loadTrailersTable();
        showSection('dashboard');
    } catch (error) {
        console.error('Error en login:', error);
        alert(`Error: ${error.message}`);
    }
}

function handleLogout() {
    currentUser = null;
    editingTrailerId = null;
    authToken = null;
    trailers = [];

    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('loginForm').reset();
}

async function loadDashboardData() {
    try {
        const data = await apiRequest('/trailers');
        trailers = Array.isArray(data) ? data.map(normalizeTrailer) : [];

        document.getElementById('totalTrailers').textContent = trailers.length;
        document.getElementById('entradasHoy').textContent = getEntradasHoy();
        document.getElementById('salidasHoy').textContent = getSalidasHoy();
        document.getElementById('retenidos').textContent = getRetenidos();

        loadRecentActivity();
        generateStatusChart();
    } catch (error) {
        console.error('Error cargando dashboard:', error);
        alert(`Error cargando datos del dashboard: ${error.message}`);
    }
}

async function saveTrailer(e) {
    e.preventDefault();
    const isEditing = Boolean(editingTrailerId);

    const formData = {
        marca: document.getElementById('marca').value,
        placa: document.getElementById('placa').value,
        ejes: parseInt(document.getElementById('ejes').value, 10),
        peso: parseFloat(document.getElementById('peso').value),
        dimensiones: document.getElementById('dimensiones').value,
        destino: document.getElementById('destino').value,
        origen: document.getElementById('origen').value,
        historial: document.getElementById('historial').value,
        seguro: document.getElementById('seguro').value,
        caja: document.getElementById('caja').value,
        tipoTrailer: document.getElementById('tipoTrailer').value,
        estadoCarga: document.getElementById('estadoCarga').value,
        licencia: document.getElementById('licencia').value,
        operador: document.getElementById('operador').value,
    };

    try {
        if (isEditing) {
            await apiRequest(`/trailers/${editingTrailerId}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
        } else {
            await apiRequest('/trailers', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
        }

        hideTrailerForm();
        editingTrailerId = null;

        await loadDashboardData();
        loadTrailersTable();

        alert(`Trailer ${isEditing ? 'actualizado' : 'agregado'} correctamente`);
    } catch (error) {
        console.error('Error guardando trailer:', error);
        alert(`Error guardando trailer: ${error.message}`);
    }
}

async function deleteTrailer(id) {
    if (!confirm('Estas seguro de que deseas eliminar este trailer?')) {
        return;
    }

    try {
        await apiRequest(`/trailers/${id}`, {
            method: 'DELETE',
        });

        await loadDashboardData();
        loadTrailersTable();
        alert('Trailer eliminado correctamente');
    } catch (error) {
        console.error('Error eliminando trailer:', error);
        alert(`Error eliminando trailer: ${error.message}`);
    }
}

async function registrarSalida(id) {
    try {
        await apiRequest(`/trailers/${id}/salida`, {
            method: 'PUT',
        });

        await loadDashboardData();
        loadTrailersTable();
        alert('Salida registrada correctamente');
    } catch (error) {
        console.error('Error registrando salida:', error);
        alert(`Error registrando salida: ${error.message}`);
    }
}

async function registrarEntrada(id) {
    try {
        await apiRequest(`/trailers/${id}/entrada`, {
            method: 'PUT',
        });

        await loadDashboardData();
        loadTrailersTable();
        alert('Entrada registrada correctamente');
    } catch (error) {
        console.error('Error registrando entrada:', error);
        alert(`Error registrando entrada: ${error.message}`);
    }
}

globalThis.setupEventListeners = setupEventListeners;
globalThis.handleLogin = handleLogin;
globalThis.handleLogout = handleLogout;
globalThis.loadDashboardData = loadDashboardData;
globalThis.saveTrailer = saveTrailer;
globalThis.deleteTrailer = deleteTrailer;
globalThis.registrarSalida = registrarSalida;
globalThis.registrarEntrada = registrarEntrada;
