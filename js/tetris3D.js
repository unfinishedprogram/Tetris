function updateWindowDims(){
	let windowWidth = window.innerWidth;
	let windowHeight = window.innerHeight;

	let targetWidth = windowHeight / 9 * 10;
	let targetHeight = windowWidth  / 10 * 9;
	let newWidth;
	let newHeight;
	if (targetHeight > windowHeight) {
		newWidth = targetWidth;
		newHeight = windowHeight;
	}
	else {
		newWidth = windowWidth;
		newHeight = targetHeight;
	}
			
	renderer.setSize(newWidth, newHeight);
}

window.onresize = function() {
	updateWindowDims();
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, 10 / 9, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();

updateWindowDims()

//renderer.setSize( windowWidth * 16, windowHeight * 16 );
document.body.appendChild(renderer.domElement);

renderer.setClearColor( 0xffffff, 1 );

camera.position.z = 12.5;
camera.position.x = -0.5;
camera.position.y = -8.5;


boxGeo = new THREE.BoxGeometry()

activeObjects = []

function clearScene(){

	for(object of activeObjects){
		scene.remove( object );
	}
	activeObjects = [];
}

function drawScene(){
	for(object of activeObjects){
		scene.add( object );
	}
	//console.log(scene.children.length)
}


function spriteSheetToModels(spriteSheet){
	modelSheet = [];
	for(sprite of spriteSheet){
		let texture = new THREE.Texture(sprite);
		texture.magFilter = THREE.NearestFilter;
		texture.needsUpdate = true;
		material = new THREE.MeshBasicMaterial({ color: 0xffffff, map:texture} );
		newMesh = new THREE.Mesh(boxGeo, material)
		modelSheet.push(newMesh);
	}
	return modelSheet;
}

function animate(){
	clearScene();
	stepFrame();
	drawScene();

	renderer.render( scene, camera );
}
var interval;

function start3D(){
	interval = setInterval(
		() => {
			 animate(); 
		}, 
		1000/60);	
}
