

window.onload = function() {

	

	var container = document.getElementById( 'container' ),
		containerWidth, containerHeight,
		renderer,
		scene,
		camera,
		cubes,
		geom,
		range = 50,
		mouseVector,
		axes,
		controls;

	containerWidth = container.clientWidth;
	containerHeight = container.clientHeight;

	// Set up renderer, scene and camera
	renderer = new THREE.CanvasRenderer();
	renderer.setSize( containerWidth, containerHeight );
	container.appendChild( renderer.domElement );

	renderer.setClearColorHex( 0xeeeedd, 1.0 );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 45, containerWidth / containerHeight, 1, 10000 );
	camera.position.set( 0, 0, range * 2 );
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	// Add some cubes to the scene
	geom = new THREE.CubeGeometry( 5, 5, 5 );

	cubes = new THREE.Object3D();
	scene.add( cubes );

	for(var i = 0; i < 10; i++ ) {
		var grayness = Math.random() * 0.5 + 0.25,
			mat = new THREE.MeshBasicMaterial(),
			cube = new THREE.Mesh( geom, mat );
		mat.color.setRGB( grayness, grayness, grayness );
		cube.position.set( range * (0.5 - Math.random()), range * (0.5 - Math.random()), range * (0.5 - Math.random()) );
		cube.rotation.set( Math.random(), Math.random(), Math.random() ).multiplyScalar( 2 * Math.PI );
		cube.grayness = grayness;
		cubes.add( cube );
	}

	// Axes
	axes = buildAxes();
	scene.add( axes );

	//scale
	var mat = new THREE.LineBasicMaterial({
		color: 0xFF0000,
		opacity: 0.5,
		
		transparent: true,
    		linewidth: 5
		} );
	if(mat === undefined)
		aleart('Material');
	var geom = new THREE.Geometry();
	geom.vertices.push( new THREE.Vertex( new THREE.Vector3(0, 0, 0) ));
	geom.vertices.push( new THREE.Vertex( new THREE.Vector3(0, 0, 0) ));
	geom.dynamic=true;
	var line = new THREE.Line( geom , mat );
	line.dynamic = true;
	scene.add( line );

	// Picking stuff

	projector = new THREE.Projector();
	mouseVector = new THREE.Vector3();

	// User interaction
	window.addEventListener( 'mousemove', onMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener('click',mouseClick,false);

	controls = new THREE.TrackballControls( camera );
	controls.zoomSpeed = 0.1;



	// And go!
	animate();



function getCompoundBoundingBox(object3D) {
    var box = null;
    object3D.traverse(function (obj3D) {
        var geometry = obj3D.geometry;
        if (geometry === undefined) return;
        geometry.computeBoundingBox();
        if (box === null) {
            box = geometry.boundingBox;
        } else {
            box.union(geometry.boundingBox);
        }
    });
    return box;
}


var state="None";
var startPos;

 function mouseClick(e)
 { 
		mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
		mouseVector.y = 1 - 2 * ( e.clientY / containerHeight );

		var raycaster = projector.pickingRay( mouseVector.clone(), camera ),
			intersects = raycaster.intersectObjects( cubes.children );

		cubes.children.forEach(function( cube ) {
			cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
		});

			
		for( var i = 0; i < intersects.length; i++ ) {
			var intersection = intersects[ i ],
				obj = intersection.object;

			obj.material.color.setRGB( 1.0 - i / intersects.length, 1, 0 );
			var pos = obj.position;
			if (pos === undefined)			
				alert("position undefined");
			if(state === 'None')
			{
				startPos = pos;
				state = 'Start';


			if(line === undefined)
				alert("No line");
			line.geometry.vertices[0].x = pos.x;
			line.geometry.vertices[0].y = pos.y;
			line.geometry.vertices[0].z = pos.z;
			line.geometry.vertices[1].x = pos.x;
			line.geometry.vertices[1].y = pos.y;
			line.geometry.vertices[1].z = pos.z;
			line.geometry.__dirtyVertices = true;


			}
			else if(state === 'Start')
			{
				var distance = Math.sqrt(Math.pow(startPos.x-pos.x,2)+Math.pow(startPos.y-pos.y,2)+Math.pow(startPos.z-pos.z,2));
				
				alert("Distance = "+distance);
				state = 'None';
			line.geometry.vertices[0].x = 0;
			line.geometry.vertices[0].y = 0;
			line.geometry.vertices[0].z = 0;
			line.geometry.vertices[1].x = 0;
			line.geometry.vertices[1].y = 0;
			line.geometry.vertices[1].z = 0;
			line.geometry.__dirtyVertices = true;
			}
		
		}

 	}
	function onMouseMove( e ) {
		
		mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
		mouseVector.y = 1 - 2 * ( e.clientY / containerHeight );

		var raycaster = projector.pickingRay( mouseVector.clone(), camera ),
			intersects = raycaster.intersectObjects( cubes.children );

		cubes.children.forEach(function( cube ) {
			cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
		});

			
		for( var i = 0; i < intersects.length; i++ ) {
			var intersection = intersects[ i ],
				obj = intersection.object;
			if(state === 'None')
			{
			obj.material.color.setRGB( 1.0 - i / intersects.length, 0, 0 );
			}
			else
			{
			obj.material.color.setRGB( 1.0 - i / intersects.length, 0, 1 );
		
			var pos = obj.position;

			line.geometry.vertices[1].x = pos.x;
			line.geometry.vertices[1].y = pos.y;
			line.geometry.vertices[1].z = pos.z;
			line.geometry.__dirtyVertices = true;
			
			}
		}

		
	}

	function onWindowResize( e ) {
		containerWidth = container.clientWidth;
		containerHeight = container.clientHeight;
		renderer.setSize( containerWidth, containerHeight );
		camera.aspect = containerWidth / containerHeight;
		camera.updateProjectionMatrix();
	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		renderer.render( scene, camera );
	}

	function buildAxes() {
		var axes = new THREE.Object3D();

		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 100, 0, 0 ), 0xFF0000, false ) ); // +X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -100, 0, 0 ), 0x800000, true) ); // -X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 100, 0 ), 0x00FF00, false ) ); // +Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -100, 0 ), 0x008000, true ) ); // -Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 100 ), 0x0000FF, false ) ); // +Z
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -100 ), 0x000080, true ) ); // -Z

		return axes;

	}

	function buildAxis( src, dst, colorHex, dashed ) {
		var geom = new THREE.Geometry(),
			mat; 

		if(dashed) {
			mat = new THREE.LineDashedMaterial({ linewidth: 1, color: colorHex, dashSize: 5, gapSize: 5 });
		} else {
			mat = new THREE.LineBasicMaterial({ linewidth: 1, color: colorHex });
		}

		geom.vertices.push( src.clone() );
		geom.vertices.push( dst.clone() );

		var axis = new THREE.Line( geom, mat );

		return axis;

	}

}
