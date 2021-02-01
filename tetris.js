const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

const canvas_width = 800;
const canvas_height = 600;

c.width = canvas_width;
c.height = canvas_height;

var pressedKeys = {};

window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

var gameBoard = [];

const gameHeight = 22;
const gameWidth = 10;

var IBlock = [
[0,0,0,0],
[0,0,0,0],
[1,1,1,1],
[0,0,0,0]];
var JBlock = [
[0,0,0,0],
[0,1,0,0],
[0,1,1,1],
[0,0,0,0]];
var LBlock = [
[0,0,0,0],
[0,0,0,1],
[0,1,1,1],
[0,0,0,0]];
var OBlock = [
[0,0,0,0],
[0,1,1,0],
[0,1,1,0],
[0,0,0,0]];
var SBlock = [
[0,0,0,0],
[0,0,1,1],
[0,1,1,0],
[0,0,0,0]];
var TBlock = [
[0,0,0,0],
[0,0,1,0],
[0,1,1,1],
[0,0,0,0]];
var ZBlock = [
[0,0,0,0],
[0,1,1,0],
[0,0,1,1],
[0,0,0,0]];

for (var i = gameHeight - 1; i >= 0; i--) {
	gameBoard[i] = [];
	for (var j = gameWidth - 1; j >= 0; j--) {
		gameBoard[i].push(null);
	}
}

console.log(gameBoard);

function block(color){
	this.color;
}

function rotate(matrix) {
	if (!matrix.length) return null;
	if (matrix.length === 1) return matrix;
	transpose(matrix);
	matrix.forEach((row) => {
		reverse(row, 0, row.length - 1);
	});
}

function transpose(matrix) {
	for (let i = 0; i < matrix.length; i++) {
		for (let j = i; j < matrix[0].length; j++) {
			const temp = matrix[i][j];
			matrix[i][j] = matrix[j][i];
			matrix[j][i] = temp;
		}
	}
	return matrix;
}

function reverse(row, start, end) {
	while (start < end) {
		const temp = row[start];
		row[start] = row[end];
		row[end] = temp;
		start++;
		end--;
	}
	return row;
}


function addBlock(block, rotation){
	var tempBlock = JSON.parse(JSON.stringify(block));
	for (var i = 0; i <= rotation; i++) {
		rotate(tempBlock);
	}
	for (var i = 0; i < tempBlock.length; i++) {
		for (var j = 0; j < tempBlock[0].length; j++) {
			if (tempBlock[i][j]) {
				gameBoard[i][j+3] = tempBlock[i][j];
			}
		}
	}
}

function drawBoard(){
	
	for (var i = gameBoard.length - 1; i >= 0; i--) {
		for (var j = gameBoard[0].length - 1; j >= 0; j--) {
			if (gameBoard[i][j]) {
				//ctx.fillRect(0,0,100,100);
				ctx.fillRect(i*20, j*20, 20, 20);
				//ctx.fillRect(100, 100, 50, 50);
			}
		}
	}
}

function clear(matrix){
	for (var i = matrix.length - 1; i >= 0; i--) {
		for (var j = matrix[i].length - 1; j >= 0; j--) {
			matrix[i][j] = null;
		}
	}
}

//drawBoard();
var i = 0;
function updateGame(){
	clear(gameBoard);
	ctx.clearRect(0,0,canvas_width, canvas_height);
	i++;
	if (i > 3){i = 0};
	addBlock(JBlock, i)
	drawBoard();
	console.log(i);
}
setInterval(function(){ updateGame(); }, 1000);