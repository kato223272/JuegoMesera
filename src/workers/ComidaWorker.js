self.onmessage = function(e) {
    if (e.data.accion === 'pedirComida') {
        const comidas = ['drink', 'hamburguesa'];
        const comidaElegida = comidas[Math.floor(Math.random() * comidas.length)];
        
        self.postMessage({ comida: comidaElegida });
    } else {
      
        self.postMessage({ error: 'Acción no reconocida' });
    }
};
