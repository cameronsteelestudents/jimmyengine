var gameScreen = document.getElementById('gameScreen');
var windowWidth = document.body.offsetWidth;
var windowHeight = document.body.offsetHeight;

gameScreen.width = windowWidth;
gameScreen.height = windowHeight;
var tools = gameScreen.getContext('2d');

var xDirection = 0;
var yDirection = 0;

var playerSpeed = 4;

var gameObjects = [];

function GameObject(x, y, w, h, color) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.color = color;
	this.static = false;
	this.grounded = false;
	gameObjects.push(this);
}

function checkCollision(gameObjectA, gameObjectB) {
	var lxA = gameObjectA.x;
	var rxA = lxA + 25;
	var tyA = gameObjectA.y;
	var byA = tyA - 25;

	var lxB = gameObjectB.x;
	var rxB = lxB + 25;
	var tyB = gameObjectB.y;
	var byB = tyB - 25;

	if (rxA < lxB || rxB < lxA || byA > tyB || byB > tyA) {
		return false;
	} else {
		return true;
	}
}

var player = new GameObject(10, -20, 20, 20, 'rgba(200, 0, 0, 0.5)');
var rock = new GameObject(50, -30, 50, 50, 'rgba(0, 200, 0, 0.9');
var swampguy = new GameObject(100, -50, 25, 25, 'rgba(0, 0, 200, 0.3');
var ground = new GameObject(225, -500, 1000, 10, 'rgb(0, 0, 0)');
ground.static = true;

window.addEventListener('keydown', function(event) {
	if(event.keyCode == 87) {
		// w
		yDirection = 1;
	}

	if(event.keyCode == 83) {
		// s
		yDirection = -1;
	}

	if(event.keyCode == 65) {
		// a
		xDirection = -1;
	}

	if(event.keyCode == 68) {
		//d
		xDirection = 1;
	}
});

window.addEventListener('keyup', function(event) {
	if(event.keyCode == 87) {
		// w
		yDirection = 0;
	}

	if(event.keyCode == 83) {
		// s
		yDirection = 0;
	}

	if(event.keyCode == 65) {
		// a
		xDirection = 0;
	}

	if(event.keyCode == 68) {
		//d
		xDirection = 0;
	}
});

function checkCollision(gameObjectA, gameObjectB) {
	var leftXA = gameObjectA.x;
	var rightXA = gameObjectA.x + gameObjectA.w;
	var topYA = gameObjectA.y;
	var bottomYA = gameObjectA.y -gameObjectA.h;
	var leftXB = gameObjectB.x;
	var rightXB = gameObjectB.x + gameObjectB.w;
	var topYB = gameObjectB.y;
	var bottomYB = gameObjectB.y - gameObjectB.h;

	if (leftXB > rightXA || leftXA > rightXB || bottomYA > topYB || bottomYB > topYA) {
		return false;
	} else {
		return true;
	}
} 

function update() {
	tools.clearRect(0, 0, windowWidth, windowHeight);

	player.x += xDirection * playerSpeed;
	player.y += yDirection * playerSpeed;

	for(var objectIndex = 0; objectIndex < gameObjects.length; objectIndex++) {
		var gameObject = gameObjects[objectIndex];

		for(var colliderIndex = 0; colliderIndex < gameObjects.length; colliderIndex++) {
			var colliderObject = gameObjects[colliderIndex];
			if(checkCollision(gameObject, colliderObject)) {
				if(colliderObject.static) {
					gameObject.grounded = true;
				}
			}
		}

		if (gameObject.static == false && gameObject.grounded == false) {
			gameObject.y -= 2;
		}
		tools.fillStyle = gameObject.color;
		tools.fillRect(gameObject.x, -gameObject.y, gameObject.w, gameObject.h);
	}

	setTimeout(update, 10);
}

update();
