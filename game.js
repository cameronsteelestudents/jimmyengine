// todo
	// healthkit
	// different suits
	// coins/currency
		// what do you spend it on?
	// animated sprites
	// generate loot on enemy defeat

var gameScreen = document.getElementById('gameScreen');
var windowWidth = document.body.offsetWidth;
var windowHeight = document.body.offsetHeight;

gameScreen.width = windowWidth;
gameScreen.height = windowHeight;
var tools = gameScreen.getContext('2d');

var defaultProjectileLifetime = 10;

var xDirection = 0;
var yDirection = 0;
var mousingDown = false;
var mouseCoords = new Vector2D();

var enemiesStanding = 0;

var currency = 20;

var playerSpeed = 4;
var playerShootRestrainer = 0;
var playerFireRate = 2;
var playerInvincible = false;

var interactiveEnvironment = null;

var lastUpdate = new Date();

var gameObjects = [];

var equippedWeapon = new Weapon(20, 0);
equippedWeapon.image = 'Images/basicweapon.png';
equippedWeapon.relative = player;

var speedPowerup = new PowerUp(100, 200, 'speed');
var invincePowerup = new PowerUp(100, 100, 'invincible')
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

	this.timeAlive = 0;
	this.lifetime = 0;
	this.position = new Vector2D(x, y);
	this.w = w;
	this.h = h;
	this.velocity = new Vector2D(0, 0);
	this.color = color;
	this.image = null;
	this.static = false;
	this.kinematic = false;
	this.fixed = false;
	this.grounded = false;
	this.relative = null;
	this.tags = [];
	this.currentFrame = 0;
	this.frameCount = 0;
	this.frameRow = 0;
	this.frameWidth = 0;
	this.frameHeight = 0;
	this.frameDuration = 100;
	this.frameTimer = 0;
	this.animationSpeed = 0;
	this.text = null;
	this.behaviors = [];
	this.clickBehaviors = [];

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
	me.healthBar.relative = me;
	me.healthBar.kinematic = true;
	me.health = 100;
	me.maxHealth = 100;

	me.armor = 0;
	me.armorBar = new GameObject(0, 20, 0, 10);
	me.armorBar.color = 'lightblue';
	me.armorBar.relative = me;
	me.armorBar.kinematic = true;


	me.changeHealth = function(amount) {
		if(me == player && playerInvincible == true) {
			return;
		}

		if(me.armor > 0 && amount < 0) {
			me.armor += amount;

			if(me.armor < 0) {
				me.health += me.armor;
				me.armor = 0;
			}

			amount = 0;
			me.armorBar.w = me.armor / 100 * me.w;
		}

		if(me == player && me.armor <= 0) {
			player.frameRow = 0;
		}

		me.health += amount;
		me.healthBar.w = me.health / me.maxHealth * me.w;

		if (me.health <= 0) {
			me.remove();

			if(me.tags.indexOf('enemy') != -1) {
				enemiesStanding -= 1;

				var coin = new GameObject(me.position.x, me.position.y, 10, 10, 'yellow');
				coin.tags.push('coin');

				if(enemiesStanding <= 0) {
					var boss = new Enemy(player.position.x + 400, 400, 'rangedBoss');
				}
			}
		}
	}

	me.addArmor = function(amount) {
		me.armor += amount;
		me.armorBar.w = me.armor / 100 * me.w;
		if(me == player) {
			player.frameRow = 1;
		}
	}
}

function PowerUp(x, y, type) {
	GameObject.call(this, x, y, 25, 25);

	var me = this;

	if(type == 'speed') {
		me.image = 'Images/speeder.png';
		me.tags.push('speeder');
	} else if(type == 'invincible'){
		me.image = 'Images/Invincible.png';
		me.tags.push('invincible');
	}
}

function Weapon(x, y, type) {
	GameObject.call(this, x, y, 25, 25);

	var me = this;

	me.kinematic = true;

	me.fireRate = 5;
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

	enemiesStanding += 1;

	if(type == 'rangedBoss') {
		me.maxHealth = 2000;
		me.health = 2000;
	}

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
					projectile.lifetime = defaultProjectileLifetime;
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

			case 'rangedBoss': {
				var currentTime = new Date();
				if(currentTime - me.lastShootTime > 1000 / me.fireRate) {
					var normalizedVector = differenceVector.normalize();
					var scaledVector = normalizedVector.scale(10);
					var projectile = new GameObject(me.position.x, me.position.y, 15, 10);
					projectile.lifetime = defaultProjectileLifetime;
					projectile.tags.push('bossMissile');
					projectile.kinematic = true;
					projectile.behaviors.push(function() {
						if(projectile.timeAlive < 2) {
							var differenceVector = player.position.subtract(projectile.position);
							differenceVector = differenceVector.normalize();
							differenceVector = differenceVector.scale(10);
							// projectile.velocity = projectile.velocity.add(differenceVector);
							projectile.velocity = differenceVector;
						}
					});
					projectile.color = 'rgb(255, 0, 0)';
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
player.frameHeight = 108;
player.frameCount = 2;
player.image = "Images/stickFigure.png";

var equipment = new Weapon(200, 0, 'DMR')
// equipment.image = 'Images/basicweapon.png';
// var enemy = new Enemy(300, -20, 'melee');

// var boss = new Enemy(500, 400, 'rangedBoss');

var ground = new GameObject(0, -500, 10000, 10, 'rgb(0, 0, 0)');
ground.static = true;

var shop = new GameObject(Math.random() * 7345, 25, 132, 96);
shop.image = "Images/shopTruck.png";

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

	var worldCoords = localToWorld(event.clientX, -event.clientY);
	var mouseObject = new GameObject(worldCoords.x, worldCoords.y, 1, 1);
	var fixedMouseObject = new GameObject(event.clientX, -event.clientY, 1, 1);

	for (var objectIndex = 0; objectIndex < gameObjects.length; objectIndex++) {
		var gameObject = gameObjects[objectIndex];

		if(gameObject.fixed) {
			if(checkCollision(fixedMouseObject, gameObject)) {
				if(gameObject.clickBehaviors.length) {
					for (var behaviorIndex = 0; behaviorIndex < gameObject.clickBehaviors.length; behaviorIndex++) {
						var behavior = gameObject.clickBehaviors[behaviorIndex];
						behavior();
						//If behaviorIndex is < 0 then search it for the specific behavior 
					}
				}
			}
		}

		if(checkCollision(mouseObject, gameObject)) {
			if(gameObject.clickBehaviors.length) {
				for (var behaviorIndex = 0; behaviorIndex < gameObject.clickBehaviors.length; behaviorIndex++) {
					var behavior = gameObject.clickBehaviors[behaviorIndex];
					behavior();
					//If behaviorIndex is < 0 then search it for the specific behavior 
				}
			}
		}
	}
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

	if(event.keyCode == 69) {
		//e
		if(interactiveEnvironment != null){
			if(interactiveEnvironment == shop) {
				// open the shop
				var armorButton = new GameObject(10, -50, 150, 50);
				armorButton.image = 'Images/Armor_Icon.png';
				armorButton.text = 'armor';
				armorButton.kinematic = true;
				armorButton.fixed = true;
				armorButton.clickBehaviors.push(function() {
					// buy armor
					if(currency >= 20) {
						currency -= 20;
						player.addArmor(100);
					}

				});
			}
		}

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
		bullet.lifetime = 0.15; //defaultProjectileLifetime;
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

		gameObject.timeAlive += deltaTime / 1000;
		if(gameObject.lifetime > 0 && gameObject.timeAlive > gameObject.lifetime) {
			gameObject.remove();
			objectIndex--;
			continue;
		}

		gameObject.position = gameObject.position.add(gameObject.velocity);

		for (var behaviorIndex = 0; behaviorIndex < gameObject.behaviors.length; behaviorIndex++) {
			var behavior = gameObject.behaviors[behaviorIndex];
			behavior();
		}

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
					if(colliderObject == shop) {
						interactiveEnvironment = shop;
					}

					if(colliderObject.tags.indexOf('spike') != -1) {
						player.changeHealth(-1);
					}

					if(colliderObject.tags.indexOf('coin') != -1) {
						// player.changeCoin(1);
						currency += 1;
						colliderObject.remove();
					}

					if(colliderObject.tags.indexOf('melee') != -1) {
						player.changeHealth(-5);
						var differenceVector = player.position.subtract(colliderObject.position);
						differenceVector = differenceVector.normalize();
						differenceVector = differenceVector.scale(10);
						player.velocity = differenceVector;
					}

					if(colliderObject.tags.indexOf('speeder') != -1) {
						playerSpeed += 10;
						colliderObject.remove();

						setTimeout(function() {
							playerSpeed -= 10;
						}, 20000);
					}

					if(colliderObject.tags.indexOf('invincible') != -1) {
						playerInvincible = true;
						colliderObject.remove();

						setTimeout(function() {
							playerInvincible = false;
						}, 15000);
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
						// colliderObject.remove();
						colliderObject.relative = player;
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

		if(gameObject.fixed == true) {
			drawX = gameObject.position.x;
			drawY = gameObject.position.y;
		} else {
			if(gameObject != player) {
				drawX = (gameObject.position.x - player.position.x) + offsetX;
				drawY = (gameObject.position.y - player.position.y) - offsetY;

				if(gameObject.relative != null) {
					// if(gameObject.relative == player) {
					// 	drawX = player.position.x + gameObject.position.x;
					// 	drawY = player.position.y + gameObject.position.y;
					// } else {
						drawX += gameObject.relative.position.x;
						drawY += gameObject.relative.position.y;
					// }
				}
			} else {
				drawX = offsetX;
				drawY = -offsetY;
			}
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

			if(gameObject.frameWidth != 0) {
				tools.drawImage(
					image,
					gameObject.currentFrame * gameObject.frameWidth,
					gameObject.frameRow * gameObject.frameHeight,
					gameObject.frameWidth,
					gameObject.frameHeight,
					drawX, -drawY,
					gameObject.w, gameObject.h
				);
			} else {
				tools.drawImage(
					image,
					drawX, -drawY,
					gameObject.w, gameObject.h
				);
			}
		} else {
			tools.fillRect(drawX, -drawY, gameObject.w, gameObject.h);
		}

	}

	tools.font = '36px monospace';
	tools.fillText(currency + ' coins', 50, 50);

	lastUpdate = currentTime;

	setTimeout(update, 10);
}

update();
