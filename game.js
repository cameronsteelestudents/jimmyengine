// todo
	// camera follow
	// generate loot on enemy defeat
	//

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

function Vector2D(x, y) {
	var me = this;
	me.x = x;
	me.y = y;

    me.add = function(anotherVector) {
    	return new Vector2D(me.x + anotherVector.x, me.y + anotherVector.y);
    }

    me.subtract = function(anotherVector) {
    	return new Vector2D(me.x - anotherVector.x, me.y - anotherVector.y);
    }

    me.getMagnitude = function() {
    	return Math.sqrt(me.x * me.x + me.y * me.y);
    }

    me.normalize = function() {
    	var magnitude = me.getMagnitude();
    	return new Vector2D(me.x / magnitude, me.y / magnitude);
    }

    me.scale = function(amount) {
    	return new Vector2D(me.x * amount, me.y * amount);
    }
}

function GameObject(x, y, w, h, color) {
	var me = this;

	this.position = new Vector2D(x, y);
	this.w = w;
	this.h = h;
	this.velocity = new Vector2D(0, 0);
	this.color = color;
	this.static = false;
	this.grounded = false;
	this.relative = null;
	this.tags = [];

	me.remove = function() {
		gameObjects.splice(gameObjects.indexOf(me), 1);
	}

	gameObjects.push(this);
}

function Character(x, y, w, h) {
	GameObject.call(this,x, y, w, h);

	var me = this;

	me.healthBar = new GameObject(0, 20, w, 10);
	me.healthBar.color = 'rgb(200, 0, 0)';
	me.healthBar.relative = this;
	me.healthBar.static = true;
	me.health = 100;
	me.maxHealth = 100;

	me.changeHealth = function(amount) {
		me.health += amount;
		me.healthBar.w = me.health / me.maxHealth * me.w;

		if (me.health <= 0) {
			me.remove();
		}
	}
}

function Enemy(x, y, type) {
	Character.call(this, x, y, 50, 50);

	var me = this;

	var mySpeed = 2;

	me.tags.push('enemy');

	me.think = function() {
		// look for player?
		// direction between the enemy and the player
		// me.position
		// player.position
		var differenceVector = player.position.subtract(me.position);
		// me.velocity 

		if(differenceVector.x > 0) {
			me.velocity.x = mySpeed;
		} else if(differenceVector.x < 0) {
			me.velocity.x = -mySpeed;
		}
	}
}

function checkCollision(gameObjectA, gameObjectB) {
	var lxA = gameObjectA.position.x;
	var rxA = lxA + 25;
	var tyA = gameObjectA.position.y;
	var byA = tyA - 25;

	var lxB = gameObjectB.position.x;
	var rxB = lxB + 25;
	var tyB = gameObjectB.position.y;
	var byB = tyB - 25;

	if (rxA < lxB || rxB < lxA || byA > tyB || byB > tyA) {
		return false;
	} else {
		return true;
	}
}

var player = new Character(10, -20, 20, 20, 'rgba(200, 0, 0, 0.5)');
var enemy = new Enemy(300, -20, 'melee');

var rock = new GameObject(50, -30, 50, 50, 'rgba(0, 200, 0, 0.9');
var spike = new GameObject(400, 20 ,10, 12, 'rgba(200, 0, 0, 0.5');
spike.tags.push('spike');
var swampguy = new GameObject(100, -50, 25, 25, 'rgba(0, 0, 200, 0.3');
var ground = new GameObject(0, -500, 1000, 10, 'rgb(0, 0, 0)');
ground.static = true;

window.addEventListener('mousedown', function(event){
	var bullet = new GameObject(player.position.x, player.position.y, 5, 5, 'rgb(50, 10, 40)');

	var mouseCoords = new Vector2D(event.clientX, -event.clientY);
	var differenceVector = mouseCoords.subtract(player.position);
	differenceVector = differenceVector.normalize();
	differenceVector = differenceVector.scale(40);
	bullet.velocity = differenceVector;

	// event.clientX
	// -event.clientY;
});

window.addEventListener('keydown', function(event) {
	if(event.keyCode == 87) {
		// w
		// yDirection = 1;
		player.velocity.y = 10;
		player.grounded = false;
		player.position.y += 10;
	}

	if(event.keyCode == 83) {
		// s
		// yDirection = -1;
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
		// yDirection = 0;
	}

	if(event.keyCode == 83) {
		// s
		// yDirection = 0;
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
	var leftXA = gameObjectA.position.x;
	var rightXA = gameObjectA.position.x + gameObjectA.w;
	var topYA = gameObjectA.position.y;
	var bottomYA = gameObjectA.position.y -gameObjectA.h;
	var leftXB = gameObjectB.position.x;
	var rightXB = gameObjectB.position.x + gameObjectB.w;
	var topYB = gameObjectB.position.y;
	var bottomYB = gameObjectB.position.y - gameObjectB.h;

	if (leftXB > rightXA || leftXA > rightXB || bottomYA > topYB || bottomYB > topYA) {
		return false;
	} else {
		return true;
	}
} 

function update() {
	tools.clearRect(0, 0, windowWidth, windowHeight);

	player.position.x += xDirection * playerSpeed;
	// player.y += yDirection * playerSpeed;

	for(var objectIndex = 0; objectIndex < gameObjects.length; objectIndex++) {
		var gameObject = gameObjects[objectIndex];

		gameObject.position = gameObject.position.add(gameObject.velocity);

		if(gameObject.tags.indexOf('enemy') != -1) {
			gameObject.think();
		}

		var hittingStatic = false;

		for(var colliderIndex = 0; colliderIndex < gameObjects.length; colliderIndex++) {
			var colliderObject = gameObjects[colliderIndex];

			if(gameObject == colliderObject) {
				continue;
			}

			if(checkCollision(gameObject, colliderObject)) {
				if(colliderObject.static) {
					hittingStatic = true;
					gameObject.grounded = true;
					gameObject.velocity.y = 0;
					gameObject.position.y = colliderObject.position.y + gameObject.h;
				}

				if(gameObject == player && colliderObject.tags.indexOf('spike') != -1) {
					player.changeHealth(-10);
				}
			}
		}

		gameObject.grounded = hittingStatic;

		if (gameObject.static == false && gameObject.grounded == false) {
			gameObject.velocity.y -= 0.2;
		}

		var drawX = gameObject.position.x;
		var drawY = gameObject.position.y;

		if(gameObject.relative != null) {
			drawX += gameObject.relative.position.x;
			drawY += gameObject.relative.position.y;
		}

		tools.fillStyle = gameObject.color;
		tools.fillRect(drawX, -drawY, gameObject.w, gameObject.h);
	}

	setTimeout(update, 10);
}

update();
