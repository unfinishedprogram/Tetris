var gameInstance = null;

var scoreTitle;
var levelTitle;
var linesTitle;

var score;
var level;
var lines;


var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }
var media;

onload = function () {
	media = new function(){
		this.spriteImages = document.getElementById("spriteSheet");
		this.spriteSheet = imageToSpriteData(this.spriteImages, 128, 40);
		this.backgroundImage = document.getElementById("backgroundImage");
		this.backgroundSheet = imageToSpriteData(this.backgroundImage, 176, 160);

		this.spriteSheet3D = spriteSheetToModels(this.spriteSheet);
		this.backgroundSheet3D =  spriteSheetToModels(this.backgroundSheet);

		this.charToSprite3D =  function(charcode){
			if(charcode > 64){
				return this.spriteSheet3D[charcode+17-66];
			} else if(charcode < 58){
				return this.spriteSheet3D[charcode-6];
			} else{
				return this.spriteSheet3D[56];
			}
		}

		this.charToSprite = function(charcode){
			//A-Z : 17-43
			//0-9 : 44-53
			// .  : 54
			// -  : 55
			// *  : 56
			if(charcode > 64){
				return this.spriteSheet[charcode+17-66];
			} else if(charcode < 58){
				return this.spriteSheet[charcode-6];
			} else{
				return this.spriteSheet[56];
			}
		}
	}
	
	gameInstance = new Game(media);

	scoreTitle = new textBox(14, 1, "SCORE");
	levelTitle = new textBox(14, 6, "LEVEL");
	linesTitle = new textBox(14, 9, "LINES");

	score = new textBox(13, 3, "0");
	level = new textBox(14, 7, "0");
	lines = new textBox(14, 10, "0");

	startGame();
};


function Game(media){
	this.frame = 0;
	this.softCombo = 0;

	//loading media
	this.gameInfo = {
		score: 0,
		level: 0,
		lines: 0
	}

	this.display = {
		textBoxes: [],

		draw3DSprite:  function (sprite, x, y, z){
			let obj = new THREE.Mesh(sprite.geometry, sprite.material);
			obj.position.x = x -10;
			obj.position.y = -y;
			obj.position.z = z;
			obj.z = 0;
			activeObjects.push(obj);
		},

		drawBackground3D: function(){
			let w = 22;
			let h = 20;
			for (let x = 0; x < w; x++){
				for (let y = 0; y < h; y++){
					let tmp = media.backgroundSheet3D[y*w + x];
					let obj = new THREE.Mesh(tmp.geometry, tmp.material);
					obj.position.x = x -11;
					obj.position.y = -y + 1;
					obj.position.z = 0;


					if(x > 2 && x < 13 && y < 19 && y > 0){
						obj.position.z = -1;
					}
					if(x > 14 && x < 20 && y > 13 && y < 18){
						obj.position.z = -1;
					}
			

					activeObjects.push(obj);
				}
			}
		},

		drawTextBoxes: function(){
			for(let i = 0; i < this.textBoxes.length; i++){
				this.textBoxes[i].display();
			}
		},

		backgroundGeo: new THREE.PlaneGeometry( 5, 20 ),
		backgroundMat: new THREE.MeshBasicMaterial( {color: 0xffff00, map: new THREE.Texture(media.backgroundImage) } ),
		backgroundMesh: new THREE.Mesh(this.backgroundGeo, this.backgroundMat),
		clearScreen: function(){
			this.drawBackground3D();

		},

		drawPiece: function(piece, x, y){
			for (let i = 0; i < piece.length; i++){
				this.draw3DSprite(media.spriteSheet3D[piece[i].sprite] , piece[i].x+x+2, piece[i].y+y-2, 0)
			}
		},

		drawBoard: function(board){
			for(let y = 0; y < 20; y++){
				for(let x = 0; x < 10; x++){
					if(board[y][x]){
						this.draw3DSprite(media.spriteSheet3D[board[y][x].sprite],x+2, y-2, 0)
					}		
				}
			}
		},	
	}
	this.createGameBoard = function(){
		let board = [];
		for(let y = 0; y < 22; y++){
			row = [];
			for(let x = 0; x < 10; x++){
				row.push(null);
			}
			board.push(row);
		}
		return board;
	}

	this.removeLine = function(line){
		changeLines(1);
		gameInstance.gameInfo.level = Math.trunc(gameInstance.gameInfo.lines/10);
		changeLevel(0);
		for(let y = line; y > 0; y--){
			for(let x = 0; x < 10; x++){
				this.gameBoard[y][x] = this.gameBoard[y-1][x];
			}
		}
	}

	this.checkForTetris = function(){
		var lineCount = 0;
		for(let y = 20; y > 0; y--){
			if(this.checkForTetrisRow(y)){
				this.removeLine(y);
				lineCount++;
				y++;
			}
		}
		if(lineCount == 4){
			changeScore(1200*(gameInstance.gameInfo.level+1));
		} else if(lineCount == 3){
			changeScore(300*(gameInstance.gameInfo.level+1));
		} else if(lineCount == 2){
			changeScore(100*(gameInstance.gameInfo.level+1));
		} else if(lineCount == 1){
			changeScore(40*(gameInstance.gameInfo.level+1));
		}
	}
	this.checkForTetrisRow = function(row){
		for(let x = 0; x < 10; x++){
			if(!this.gameBoard[row][x]){
				return false;
			}
		}
		if(gameInstance.gameInfo.level < 20){
			gameInstance.gameInfo.level++;
		} else{
			clearInterval(interval);
		}
		return true;
	}



	this.gameBoard = this.createGameBoard();
	//this.display.drawBoard(gameBoard);
	//this.display.drawPiece(rotatePiece(pieces[4], 1), 5, 5);
	//this.display.drawPiece((pieces[4]), 5, 5);
	
	this.dropPiece = function(piece, board){
		this.y = 0;
		this.x = 4;
		this.piece = piece;
		this.rotation = 0;

		this.drawUpdate = function(){
			gameInstance.display.clearScreen();
			gameInstance.display.drawBoard(gameInstance.gameBoard);
			gameInstance.display.drawPiece(this.piece[this.rotation%this.piece.length], this.x, this.y);
			gameInstance.display.drawTextBoxes();
			gameInstance.display.drawPiece(pieceIndex[nextPiece][0], 13, 16);
		}

		this.detectCollision = function(x,y){
			if(board[y][x] || y >= 20 || x <= -1 || x > 9){
				return true;
			}
			return false;
		}

		this.detectPieceCollision = function(piece, x, y, rot){
			for(let i = 0; i < 4; i++){
				if(this.detectCollision(piece[rot%piece.length][i].x+x, piece[rot%piece.length][i].y+y)){
					return true;
				}
			}
			return false;
		}

		this.placePiece = function(piece, x, y, rot){
			for(let i = 0; i < 4; i++){
				board[piece[rot%piece.length][i].y+y][piece[rot%piece.length][i].x+x] = piece[rot%piece.length][i];
			}
		}

		this.stepGravity = function(){
			if(this.detectPieceCollision(this.piece, this.x, this.y+1, this.rotation)){
				this.placePiece(this.piece, this.x, this.y, this.rotation);
				if(this.y < 2){
					clearInterval(interval);
					alert("GAME OVER");
				}
				return 1;
			} else{
				this.y++;
				gameInstance.frame = 0;
				return 0;
			}
		}

		this.rotate = function(){
			if(!this.detectPieceCollision(this.piece, this.x, this.y, this.rotation+1)){
				this.rotation++;
			}
		}

		this.move = function(offset){
			if(!this.detectPieceCollision(this.piece, this.x+offset, this.y, this.rotation)){
				this.x += offset;
			}
		}
	}
}

textBox = function(x, y, content){
	this.x = x;
	this.y = y;
	this.content = content;
	gameInstance.display.textBoxes.push(this);
	this.display = function(){
		for(let i = 0; i < this.content.length; i++){
			gameInstance.display.draw3DSprite(media.charToSprite3D(this.content.charCodeAt(i)), this.x+i, this.y, 0.1);
		}
	}	
}

function changeScore(change){
	gameInstance.gameInfo.score += change;
	score.content = gameInstance.gameInfo.score.toString();
}
function changeLevel(change){
	gameInstance.gameInfo.level += change;
	level.content = gameInstance.gameInfo.level.toString();
}
function changeLines(change){
	gameInstance.gameInfo.lines += change;
	lines.content = gameInstance.gameInfo.lines.toString();
}

levelFrameLookup = [53, 49, 45, 41, 37, 33, 28, 22, 17, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3];


startGame = function(){
	gameInstance.frame = 0;
	changeLevel(0);
	pieceIndexNum = Math.floor(Math.random() * 7);
	nextPiece = Math.floor(Math.random() * 7);
	gameInstance.dropped = new gameInstance.dropPiece(pieceIndex[pieceIndexNum], gameInstance.gameBoard);
	start3D();
	
	//interval = setInterval(stepFrame, 1000/60);
}

stepFrame = function(){
	gameInstance.frame++;
	if(gameInstance.frame >= levelFrameLookup[gameInstance.gameInfo.level]){
		if(gameInstance.dropped.stepGravity()){
			changeScore(gameInstance.softCombo);
			gameInstance.softCombo = 0;
			gameInstance.checkForTetris();
			pieceIndexNum = nextPiece;
			nextPiece = Math.floor(Math.random() * 7);
			gameInstance.dropped = new gameInstance.dropPiece(pieceIndex[pieceIndexNum], gameInstance.gameBoard);
		} else{
			gameInstance.softCombo = 0;
		}
		gameInstance.frame = 0;
	}
	gameInstance.dropped.drawUpdate();
}


function rotatePiece(piece, n){
	let rotated = [];
	let xoff = 4;
		for(let i = 0; i < piece.length; i++){
			if(n == 0){
				rotated.push(piece[i]);
			}
			if(n == 1){
				rotSq = new square(piece[i].y+2, piece[i].x-2, piece[i].sprite);
				rotated.push(rotSq);
			}
			if(n == 2){
				rotSq = new square(((piece[i].x)*-1)+xoff, piece[i].y*-1, piece[i].sprite);
				rotated.push(rotSq);
			}
			if(n == 3){
				rotSq = new square((piece[i].y*-1)+2, (piece[i].x*-1)+2, piece[i].sprite);
				rotated.push(rotSq);
			}
		}
	return rotated;
}


function handleInput(event){
	var key = event.keyCode;
	if(key == "37"){
		gameInstance.dropped.move(-1);
	}
	if(key =="39"){
		gameInstance.dropped.move(1);
	}
	if(key =="38"){
		gameInstance.dropped.rotate();
	}
	if(key =="40"){
		if(!gameInstance.dropped.stepGravity()){
			gameInstance.softCombo++;
		}
	}
	if(key =="32"){
		gameInstance.removeLine(18);
	}
	gameInstance.dropped.drawUpdate();
}

const pieces = {
	O : [[
			new square(2,1,4),
			new square(1,1,4),
			new square(2,0,4),
			new square(1,0,4)
		]
	],
	S : [[
			new square(0,1,8),
			new square(1,0,8),
			new square(1,1,8),
			new square(2,0,8)
		],
		[
			new square(0,0,8),
			new square(0,1,8),
			new square(1,1,8),
			new square(1,2,8)
		]
	],
	Z : [[
			new square(0,0,6),
			new square(1,0,6),
			new square(1,1,6),
			new square(2,1,6)
		],
		[
			new square(0,1,6),
			new square(0,2,6),
			new square(1,1,6),
			new square(1,0,6)
		]
	],
	J : [[
			new square(0,1,7),
			new square(1,1,7),
			new square(2,1,7),
			new square(0,0,7)
		],
		[
			new square(1,0,7),
			new square(1,1,7),
			new square(1,2,7),
			new square(2,0,7)
		],
		[
			new square(2,2,7),
			new square(0,1,7),
			new square(1,1,7),
			new square(2,1,7)
		],
		[
			new square(1,0,7),
			new square(1,1,7),
			new square(1,2,7),
			new square(0,2,7)
		]
	],
	L : [[
			new square(0,1,5),
			new square(1,1,5),
			new square(2,1,5),
			new square(2,0,5)
		],
		[
			new square(1,1,5),
			new square(1,0,5),
			new square(1,2,5),
			new square(2,2,5)
		],
		[
			new square(0,2,5),
			new square(0,1,5),
			new square(1,1,5),
			new square(2,1,5)
		],
		[
			new square(1,0,5),
			new square(1,1,5),
			new square(1,2,5),
			new square(0,0,5)
		]
	],
	T : [[
			new square(1,1,9),
			new square(0,1,9),
			new square(1,0,9),
			new square(2,1,9),
		],
		[
			new square(1,1,9),
			new square(1,0,9),
			new square(2,1,9),
			new square(1,2,9)
		],
		[
			new square(1,1,9),
			new square(0,1,9),
			new square(2,1,9),
			new square(1,2,9)
		],
		[
			new square(1,1,9),
			new square(0,1,9),
			new square(1,0,9),
			new square(1,2,9)
		]
	],
	I : [[
			new square(0,1,10),
			new square(1,1,11),
			new square(2,1,11),
			new square(3,1,12)
		],
		[
			new square(1,0,15),
			new square(1,1,14),
			new square(1,2,14),
			new square(1,3,13)
		]
],
};
const pieceIndex = [pieces.O,pieces.Z, pieces.S, pieces.J, pieces.L, pieces.T, pieces.I];


function square(x,y,sprite){
	this.x = x;
	this.y = y;
	this.sprite = sprite;
}

function imageToSpriteData(image, width, height){
	var spriteSheet = [];
	var tempCan = document.createElement("canvas");
	tempCan.width = width;
	tempCan.height = height;
	tempCont = tempCan.getContext("2d");
	tempCont.drawImage(image, 0, 0);
	for(let y = 0 ; y < height/8; y++){
		for(let x = 0; x < width/8; x++){
			let imgDat = tempCont.getImageData(x*8, y*8, 8, 8);
			if (imgDat.data[3]) spriteSheet.push(imgDat);
		}
	}
	return spriteSheet;
}