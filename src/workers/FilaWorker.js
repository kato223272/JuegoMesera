let personajes = [];
const MAX_PERSONAS_EN_FILA = 4;

onmessage = function(e) {
    if (e.data.accion === 'iniciarFila') {
        personajes = [];
        postMessage({ accion: 'actualizarFila', personajes });
    } else if (e.data.accion === 'agregarPersonaje') {
        if (personajes.length < MAX_PERSONAS_EN_FILA) {
            const { nombre, coordenadas } = e.data; 
            personajes.push({ nombre, coordenadas }); 
            postMessage({ accion: 'actualizarFila', personajes });
        } else {
            postMessage({ accion: 'error', mensaje: 'Máximo de personas en la fila alcanzado.' });
        }
    } else if (e.data.accion === 'eliminarPersonaje') {
        const index = personajes.findIndex(p => p.nombre === e.data.personaje);
        if (index !== -1) {
            personajes.splice(index, 1);
            postMessage({ accion: 'actualizarFila', personajes });
        }
    }
};
