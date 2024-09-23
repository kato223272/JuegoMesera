let mesera;
let mesas; 
let isPaused = false; 
let timerWorker; 
let filaWorker; 
let pedidoWorker;
let prepararComidaWorker; 
let timerText; 

const limitTime = 100000; 
let remainingTime = limitTime; 
let personajesEnFila = []; 
let addPersonInterval;
let selectedPerson = null; 
let comidaPosX = 60;

const config = {
    width: 1520,
    height: 700,
    parent: "containerJuego",
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('fondo', '../assets/maxresdefault.jpg');
    this.load.image('drink', '../assets/bebida.png');
    this.load.image('hamburguesa', '../assets/hamburguesa.png');
    this.load.image('mesa', '../assets/mesa silla.png');
    this.load.image('mesera', '../assets/mesera.png');
    this.load.image('persona', '../assets/Persona.svg');
    this.load.image('nube', '../assets/R.png');
}

class Person {
    constructor(scene, x, y, name) {
        this.sprite = scene.physics.add.image(x, y, 'persona').setScale(0.17);
        this.name = name; 
        this.isAssigned = false; 
        this.isMoving = false;
        this.comidaSprite = null; 
        this.nubeSprite = null;
        this.isFoodOrdered = false;

        this.sprite.setInteractive();
        this.sprite.on('pointerdown', () => {
            this.selectPerson();
        });
    }


    deliverFood() {
        if (this.isAssigned) {
            const deliveryX = this.sprite.x;
            const deliveryY = this.sprite.y;

            mesera.setVelocity(0); // Detener cualquier movimiento anterior
            game.scene.scenes[0].physics.moveTo(mesera, deliveryX, deliveryY, 200); // velocidad de la mesera

            // entrega de comida
            this.checkDeliveryEvent = game.scene.scenes[0].time.addEvent({
                delay: 100,
                callback: () => this.checkDeliveryArrival(deliveryX, deliveryY),
                loop: true,
            });
        }
    }
    
    checkDeliveryArrival(deliveryX, deliveryY) {
        const distance = Phaser.Math.Distance.Between(mesera.x, mesera.y, deliveryX, deliveryY);
        if (distance < 10) {
            mesera.setVelocity(0); 
            game.scene.scenes[0].time.removeEvent(this.checkDeliveryEvent);
            console.log("Comida entregada a " + this.name + "");
    
           
            const mesa = mesas.getChildren().find(m => m.isOccupied && this.sprite.x === m.x && this.sprite.y === m.y);
    
            this.isAssigned = false; 
            this.isFoodOrdered = false; // limpiar la comida ordenada
            
          
        }
    }
    
    
    
    moveToNewPosition(newX, newY) {
    game.scene.scenes[0].physics.moveTo(this.sprite, newX, newY, 200); // Velocidad a la que se mueve
}

    showOrderCloud() {
        this.nubeSprite = game.scene.scenes[0].add.image(this.sprite.x + 88, this.sprite.y - 70, 'nube').setScale(0.2); 
        this.nubeSprite.setInteractive();
        this.nubeSprite.on('pointerdown', () => {
            this.showFood();
        });
    }
    
    showFood() {
        const opcionesComida = ['drink', 'hamburguesa'];
        const comidaAleatoria = opcionesComida[Math.floor(Math.random() * opcionesComida.length)];
        this.comidaSprite = game.scene.scenes[0].add.image(this.nubeSprite.x, this.nubeSprite.y, comidaAleatoria).setScale(0.5);
        this.comidaSprite.setOrigin(0.5, 0.5);

        // poder interactuar con la comida
        this.comidaSprite.setInteractive();
        this.comidaSprite.on('pointerdown', () => {
            this.moveToFood(this.comidaSprite);
        });

        // 3 segundos para mostrar la comida de abajo
        setTimeout(() => {
            this.displayFoodBelow(comidaAleatoria);
        }, 3000);
    }

    displayFoodBelow(comida) {
        const y = game.config.height - 60;
        const comidaSprite = game.scene.scenes[0].add.image(comidaPosX, y, comida).setScale(0.5).setOrigin(0.5, 0.5);
        
        // hacer que se pueda interactuar con la comida
        comidaSprite.setInteractive();
        comidaSprite.on('pointerdown', () => {
            this.moveToFood(comidaSprite);
        });

        comidaPosX += 60; // actualizar la posición X para colocar la comida a lado
    }

    moveToFood(comidaSprite) {
        const foodX = comidaSprite.x;
        const foodY = comidaSprite.y;
    
        // mover la mesera hacia la comida
        mesera.setVelocity(0);
        game.scene.scenes[0].physics.moveTo(mesera, foodX, foodY, 200); 
    
        // comprobar la llegada a la comida
        this.checkArrivalEvent = game.scene.scenes[0].time.addEvent({
            delay: 100,
            callback: () => this.checkFoodArrival(foodX, foodY, comidaSprite),
            loop: true,
        });
    }

    checkFoodArrival(foodX, foodY, comidaSprite) {
        const distance = Phaser.Math.Distance.Between(mesera.x, mesera.y, foodX, foodY);
        if (distance < 10) {
            mesera.setVelocity(0); // detener la mesera
            game.scene.scenes[0].time.removeEvent(this.checkArrivalEvent);
            console.log("¡Mesera ha recogido la comida!");
    
            // almacenar la referencia de la comida recogida
            this.collectedFood = comidaSprite;
            comidaSprite.destroy(); // eliminar la comida después de recogerla
        }
    }
    
    removeOrderCloud() {
        if (this.nubeSprite) {
            this.nubeSprite.destroy();
            this.nubeSprite = null; //limpiar
        }
        if (this.comidaSprite) {
            this.comidaSprite.destroy();
            this.comidaSprite = null; 
        }
    }
    

    moveToTable(tableX, tableY) {
        const speed = 260; 
        this.isMoving = true; 
        game.scene.scenes[0].physics.moveTo(this.sprite, tableX, tableY, speed);
    
        this.checkArrivalEvent = game.scene.scenes[0].time.addEvent({
            delay: 100, 
            callback: () => this.checkArrival(tableX, tableY),
            loop: true,
        });
    }

    checkArrival(tableX, tableY) {
        if (!this.sprite) return;
        const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, tableX, tableY);
        if (distance < 10) {
            this.sprite.setVelocity(0);
            const index = personajesEnFila.indexOf(this);
            if (index !== -1) {
                personajesEnFila.splice(index, 1);
            }
            this.isMoving = false;
            game.scene.scenes[0].time.removeEvent(this.checkArrivalEvent);
            
            const mesa = mesas.getChildren().find(m => m.x === tableX && m.y === tableY);
            if (mesa) {
                mesa.isOccupied = true;
                console.log(`${this.name} ha sido llevado a la mesa.`);
                this.showOrderCloud();
            }
        }
    }
    
    selectPerson() {
        if (!this.isAssigned && !this.isMoving) { 
            if (!this.isFoodOrdered) { // verificar si la comida ya fue ordenada
                selectedPerson = this; 
                console.log(`${this.name} seleccionada`);
                this.isFoodOrdered = true; // marcar que la comida ha sido ordenada
                pedidoWorker.postMessage({ accion: 'pedirComida' }); 
            } else {
                console.log(`${this.name} ya ha ordenado comida.`);
            }
        } else if (this.isAssigned) {
            this.deliverFood(); 
        }
    }
}

function create() {
    this.add.image(0, 0, 'fondo').setOrigin(0, 0).setDisplaySize(config.width, config.height);

    timerWorker = new Worker('../workers/TiempoWorker.js');
    filaWorker = new Worker('../workers/FilaWorker.js');
    pedidoWorker = new Worker('../workers/PedidoWorker.js');
    prepararComidaWorker = new Worker('../workers/GenerarComida.js'); 

    timerWorker.onmessage = function(e) {
        if (e.data.expired) {
            handleTimeExpired();
        } else if (e.data.remaining !== undefined) { 
            remainingTime = e.data.remaining; 
            updateTimerText(); 
        }
    };

    timerText = this.add.text(16, 16, '', { fontSize: '32px', fill: 'black' });
    updateTimerText();

    filaWorker.onmessage = function(e) {
        if (e.data.accion === 'actualizarFila') {
            updateQueue(e.data.personajes);
        }
    };

    pedidoWorker.onmessage = function(e) {
        handleFoodOrder(e.data.comida);
    };

    prepararComidaWorker.onmessage = function(e) {
        const comidaPreparada = e.data.comida;
        mostrarComidaPreparada(comidaPreparada); 
    };

    mesas = this.physics.add.staticGroup(); 
    createTables();

    mesera = this.physics.add.image(500, 500, "mesera").setScale(0.17);
    mesera.setCollideWorldBounds(true);

    const startButton = document.createElement('button');
    startButton.innerText = 'Iniciar Juego';
    startButton.className = 'start-button'; 
    document.body.appendChild(startButton);
    startButton.addEventListener('click', startGame);
}

function handleTimeExpired() {
    isPaused = true; 
    game.scene.pause(); 
    document.body.classList.add('paused'); 
    showMessage("¡Tiempo agotado! Se ha detenido toda la interacción.");
    mesera.setVelocity(0); 
    clearInterval(addPersonInterval);
}

function updateQueue(nombres) {
    personajesEnFila.forEach(persona => persona.sprite.destroy());
    personajesEnFila = []; 

    nombres.forEach((nombre, index) => {
        const x = 300 - index * 50; 
        const y = 300; 
        const nuevaPersona = new Person(game.scene.scenes[0], x, y, nombre);
        personajesEnFila.push(nuevaPersona);
    });
}

function handleFoodOrder(comida) {
    if (comida && selectedPerson) {
        selectedPerson.comidaSprite = comida; 
        selectedPerson.isAssigned = true; 
        console.log(`Se asignó ${comida} a ${selectedPerson.name}.`);
    } else {
        console.log('No se pudo asignar comida.');
    }
}

function createTables() {
    const positions = [
        { x: 700, y: 200 },
        { x: 1100, y: 200 },
        { x: 1100, y: 500 },
        { x: 700, y: 500 }
    ];
    
    positions.forEach(pos => {
        const mesa = mesas.create(pos.x, pos.y, "mesa").setScale(.8);
        mesa.isOccupied = false;
        mesa.setInteractive();
        mesa.on('pointerdown', () => onTableClick(mesa));
    });
}

function onTableClick(mesa) {
    if (selectedPerson && !mesa.isOccupied) {
        selectedPerson.moveToTable(mesa.x, mesa.y);
        selectedPerson.removeOrderCloud(); 
        selectedPerson = null; 
    } else {
        console.log("Mesa ocupada o no se ha seleccionado a nadie.");
    }
}

function startGame() {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        document.body.removeChild(existingMessage);
    }

    remainingTime = limitTime; 
    timerWorker.postMessage({ action: 'start', limitTime: remainingTime }); 
    isPaused = false; 
    game.scene.resume(); 
    document.body.classList.remove('paused'); 

    addPersonInterval = setInterval(() => {
        const nombre = `Persona ${personajesEnFila.length + 1}`;
        filaWorker.postMessage({ accion: 'agregarPersonaje', nombre });
    }, 10000); 
}

function update(time, delta) {}

function updateTimerText() {
    const seconds = Math.floor(remainingTime / 1000);
    timerText.setText(`Tiempo restante: ${seconds}s`);
}

function mostrarComidaPreparada(comida) {
    const x = 50; 
    const y = game.config.height - 100; 
    game.scene.scenes[0].add.image(x, y, comida).setScale(0.5).setOrigin(0.5, 0.5); 
}

function showMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.innerText = text;
    messageElement.className = 'message'; 
    document.body.appendChild(messageElement);

    messageElement.onclick = () => {
        document.body.removeChild(messageElement);
        if (isPaused) {
            game.scene.resume(); 
            document.body.classList.remove('paused');
            isPaused = false;
        }
    };
}
