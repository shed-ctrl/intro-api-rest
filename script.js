const API_URL = "https://698a1bc4c04d974bc6a16911.mockapi.io/api/v1/dispositivos_IoT";
const deviceModal = new bootstrap.Modal(document.getElementById('deviceModal'));
const deviceForm = document.getElementById('deviceForm');
const tableBody = document.getElementById('deviceTableBody');

// Mapeo de textos para facilitar la lectura
const direcciones = {
    "1": "adelante", "2": "detener", "3": "atrás",
    "4": "vuelta derecha adelante", "5": "vuelta izquierda adelante",
    "6": "vuelta derecha atrás", "7": "vuelta izquierda atrás",
    "8": "giro 90° derecha", "9": "giro 90° izquierda"
};

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', getDevices);

// --- FUNCIONES DE API ---

async function getDevices() {
    try {
        const response = await fetch(API_URL);
        const devices = await response.json();
        renderTable(devices);
    } catch (error) {
        console.error("Error cargando dispositivos:", error);
    }
}

async function saveDevice(e) {
    e.preventDefault();
    
    const id = document.getElementById('deviceId').value;
    const deviceData = {
        deviceName: document.getElementById('deviceName').value,
        direccionCode: parseInt(document.getElementById('direccionCode').value),
        direccionText: direcciones[document.getElementById('direccionCode').value],
        ipClient: document.getElementById('ipClient').value || "0.0.0.0",
        dateTime: new Date().toISOString()
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deviceData)
        });

        if (response.ok) {
            deviceModal.hide();
            getDevices();
            deviceForm.reset();
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    }
}

async function deleteDevice(id) {
    if (confirm('¿Estás seguro de eliminar este dispositivo?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            getDevices();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}

// --- UTILIDADES DE UI ---

function renderTable(devices) {
    tableBody.innerHTML = '';
    devices.forEach(dev => {
        tableBody.innerHTML += `
            <tr>
                <td><small class="text-muted">#${dev.id}</small></td>
                <td><strong>${dev.deviceName}</strong></td>
                <td><span class="badge-direction">${dev.direccionText}</span></td>
                <td><code>${dev.direccionCode}</code></td>
                <td>${new Date(dev.dateTime).toLocaleString()}</td>
                <td>${dev.ipClient}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editDevice('${dev.id}')">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteDevice('${dev.id}')">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function openModal() {
    document.getElementById('modalTitle').innerText = "Nuevo Dispositivo";
    document.getElementById('deviceId').value = "";
    deviceForm.reset();
    deviceModal.show();
}

async function editDevice(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const dev = await response.json();
        
        document.getElementById('modalTitle').innerText = "Editar Dispositivo";
        document.getElementById('deviceId').value = dev.id;
        document.getElementById('deviceName').value = dev.deviceName;
        document.getElementById('direccionCode').value = dev.direccionCode;
        document.getElementById('ipClient').value = dev.ipClient;
        
        deviceModal.show();
    } catch (error) {
        alert("No se pudo obtener la información del dispositivo");
    }
}

deviceForm.onsubmit = saveDevice;