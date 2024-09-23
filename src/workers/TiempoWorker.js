let temporizador; 
let TiempoRestante; 

self.onmessage = function(e) {
    if (e.data.action === 'start') {
        TiempoRestante = e.data.limitTime;

        if (typeof TiempoRestante !== 'number' || TiempoRestante <= 0) {
            self.postMessage({ error: 'error en tiempo limitado' });
            return;
        }

        temporizador = setInterval(() => {
            TiempoRestante -= 1000; 
            self.postMessage({ remaining: TiempoRestante });
            
            if (TiempoRestante <= 0) {
                clearInterval(temporizador);
                self.postMessage({ expired: true });
            }
        }, 1000);
    } else if (e.data.action === 'stop') {
        clearInterval(temporizador);
        self.postMessage({ stopped: true });
    }
};
