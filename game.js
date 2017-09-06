// todo
	// animated sprites
	// generate loot on enemy defeat

var gameScreen = document.getElementById('gameScreen');
var windowWidth = document.body.offsetWidth;
var windowHeight = document.body.offsetHeight;

gameScreen.width = windowWidth;
gameScreen.height = windowHeight;
var tools = gameScreen.getContext('2d');

var xDirection = 0;
var yDirection = 0;
var mousingDown = false;
var mouseCoords = new Vector2D();

var playerSpeed = 4;
var playerShootRestrainer = 0;
var playerFireRate = 2;

var lastUpdate = new Date();

var gameObjects = [];

var equippedWeapon = new Weapon();

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
	this.image = null;
	this.static = false;
	this.kinematic = false;
	this.grounded = false;
	this.relative = null;
	this.tags = [];
	this.currentFrame = 0;
	this.frameCount = 0;
	this.frameWidth = 0;
	this.frameDuration = 100;
	this.frameTimer = 0;
	this.animationSpeed = 0;

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
	me.healthBar.kinematic = true;
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

function Weapon(x, y, type) {
	GameObject.call(this, x, y, 50, 50);

	var me = this;

	me.fireRate = 1;
	me.damage = 2;
	me.gravity = 1;

	if (type == 'DMR') {
		me.damage = 4;
		me.gravity = 0.5;
		me.fireRate = 25;
	}

	me.tags.push('weapon');
}

function Enemy(x, y, type) {
	Character.call(this, x, y, 50, 50);

	var me = this;

	var mySpeed = 2;

	me.visionRadius = 800;
	me.fireRate = 1;
	me.lastShootTime = new Date();

	me.tags.push('enemy');
	me.tags.push(type);

	me.think = function() {
		// look for player?
		// direction between the enemy and the player
		// me.position
		// player.position

		var differenceVector = player.position.subtract(me.position);
		var distance = differenceVector.getMagnitude();
		if(distance > me.visionRadius) {
			return;
		}

		switch(type) {
			case 'melee': {

				if(differenceVector.x > 0) {
					me.velocity.x = mySpeed;
				} else if(differenceVector.x < 0) {
					me.velocity.x = -mySpeed;
				}
			} break;

			case 'miner':
			case 'ranged': {
				var currentTime = new Date();
				if(currentTime - me.lastShootTime > 1000 / me.fireRate) {
					var normalizedVector = differenceVector.normalize();
					var scaledVector = normalizedVector.scale(10);
					var projectile = new GameObject(me.position.x, me.position.y, 15, 10);
					if(type == 'miner') {
						projectile.color = 'orange';
						projectile.tags.push('enemyMine');
					} else {
						projectile.tags.push('enemyBullet');
						projectile.color = 'rgb(100, 0, 0)';
					}
					scaledVector.y += distance / 100;

					// scaledVector = scaledVector.add(player.velocity.scale(10));


					projectile.velocity = scaledVector;
					me.lastShootTime = currentTime;
				}
			} break;
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

var player = new Character(0, 0, 20, 20);
player.frameWidth = 67;
player.frameCount = 2;
player.image = "Images/stickFigure.png";

var equipment = new Weapon(200, 0, 'DMR')

// var enemy = new Enemy(300, -20, 'melee');

var ground = new GameObject(0, -500, 10000, 10, 'rgb(0, 0, 0)');
ground.static = true;

generateLevel();

function generateLevel(difficulty) {
	var enemyCount = 5;

	while(enemyCount > 0) {
		// var swampguy = new GameObject(100, -50, 25, 25, 'rgba(0, 0, 200, 0.3');

		var enemyTypes = ['melee', 'ranged', 'miner'];
		var randomIndex = Math.floor(Math.random() * 3);
		var randomType = enemyTypes[randomIndex];

		var enemy = new Enemy(Math.random() * 10000, -20, randomType);
		enemyCount--;
	}

	var obstacleCount = 20;
	while(obstacleCount > 0) {
		if(Math.random() > 0.4) {
			var rock = new GameObject(Math.random() * 10000, -30, 50, 50, 'rgba(0, 200, 0, 0.9');
		} else {
			var spike = new GameObject(Math.random() * 10000, 20 ,10, 12, 'rgba(200, 0, 0, 0.5');
			spike.tags.push('spike');
		}
		
		obstacleCount--;
	}

}

window.addEventListener('mousedown', function(event) {
	mousingDown = true;
});

window.addEventListener('mouseup', function(event) {
	mousingDown = false;
});

window.addEventListener('mousemove', function(event) {
	mouseCoords.x = event.clientX;
	mouseCoords.y = -event.clientY;
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
		player.animationSpeed = 1;
	}

	if(event.keyCode == 68) {
		//d
		xDirection = 1;
		player.animationSpeed = 1;
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
		player.animationSpeed = 0;
	}

	if(event.keyCode == 68) {
		//d
		xDirection = 0;
		player.animationSpeed = 0;
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

function localToWorld(x, y) {
	var screenWidth = document.body.offsetWidth;
	var screenHeight = document.body.offsetHeight;

	var newX = (x + player.position.x) - (screenWidth / 2);
	var newY = (y + player.position.y) + (screenHeight / 2);
	return new Vector2D(newX, newY);
}

function update() {
	tools.clearRect(0, 0, windowWidth, windowHeight);

	var currentTime = new Date();
	var deltaTime = currentTime - lastUpdate;

	player.position.x += xDirection * playerSpeed;
	// player.y += yDirection * playerSpeed;

	playerShootRestrainer += deltaTime;

	if(mousingDown == true && playerShootRestrainer > 1000 / equippedWeapon.fireRate) {
		var bullet = new GameObject(player.position.x, player.position.y, 5, 5, 'rgb(50, 10, 40)');
		bullet.tags.push('bullet');

		var localCoords = localToWorld(mouseCoords.x, mouseCoords.y);
		var differenceVector = localCoords.subtract(player.position);
		differenceVector = differenceVector.normalize();
		differenceVector = differenceVector.scale(40);
		bullet.velocity = differenceVector;

		playerShootRestrainer = 0;
	}

	for(var objectIndex = 0; objectIndex < gameObjects.length; objectIndex++) {
		var gameObject = gameObjects[objectIndex];

		gameObject.position = gameObject.position.add(gameObject.velocity);

		var friction = 0.5;

		if(gameObject.grounded && gameObject.velocity.x != 0) {
			if(gameObject.velocity.x > 0) {
				gameObject.velocity.x -= friction;
				if(gameObject.velocity.x < 0) {
					gameObject.velocity.x = 0;
				}
			} else if(gameObject.velocity.x < 0) {
				gameObject.velocity.x += friction;
				if(gameObject.velocity.x > 0) {
					gameObject.velocity.x = 0;
				}
			}
		}

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

					if(gameObject.tags.indexOf('enemyBullet') != -1) {
						gameObject.remove();
					}
				}

				if(gameObject == player) {
					if(colliderObject.tags.indexOf('spike') != -1) {
						player.changeHealth(-1);
					}

					if(colliderObject.tags.indexOf('melee') != -1) {
						player.changeHealth(-5);
						var differenceVector = player.position.subtract(colliderObject.position);
						differenceVector = differenceVector.normalize();
						differenceVector = differenceVector.scale(10);
						player.velocity = differenceVector;
					}

					if(colliderObject.tags.indexOf('enemyBullet') != -1) {
						gameObject.changeHealth(-10);
						colliderObject.remove();
					}

					if(colliderObject.tags.indexOf('enemyMine') != -1) {
						gameObject.changeHealth(-15);
						gameObject.velocity.y += 10;
						colliderObject.remove();
					}

					if(colliderObject.tags.indexOf('weapon') != -1) {
						equippedWeapon = colliderObject;
						colliderObject.remove();
					}
				}

				if(gameObject.tags.indexOf('enemy') != -1 && colliderObject.tags.indexOf('bullet') != -1) {
					gameObject.changeHealth(-equippedWeapon.damage);
					colliderObject.remove();
				}
			}
		}

		gameObject.grounded = hittingStatic;

		if (gameObject.static == false && gameObject.grounded == false && gameObject.kinematic == false) {
			gameObject.velocity.y -= 0.2;
		}

		var drawX;
		var drawY;

		var offsetX = gameScreen.width / 2;
		var offsetY = gameScreen.height / 2;
		if(gameObject != player) {
			drawX = (gameObject.position.x - player.position.x) + offsetX;
			drawY = (gameObject.position.y - player.position.y) - offsetY;

			if(gameObject.relative != null) {
				drawX += gameObject.relative.position.x;
				drawY += gameObject.relative.position.y;
			}
		} else {
			drawX = offsetX;
			drawY = -offsetY;
		}

		tools.fillStyle = gameObject.color;

		gameObject.frameTimer += deltaTime;
		if(gameObject.animationSpeed > 0 && gameObject.grounded && gameObject.frameTimer > gameObject.frameDuration) {
			gameObject.currentFrame = (gameObject.currentFrame + 1) % (gameObject.frameCount);
			gameObject.frameTimer = 0;
		}

		if(gameObject.image) {
			var image = new Image();
			image.src = gameObject.image;
			tools.drawImage(
				image,
				gameObject.currentFrame * gameObject.frameWidth, 0,
				gameObject.frameWidth, 108,
				drawX, -drawY,
				gameObject.w, gameObject.h
			);
		} else {
			tools.fillRect(drawX, -drawY, gameObject.w, gameObject.h);
		}

	}

	lastUpdate = currentTime;

	setTimeout(update, 10);
}

update();
