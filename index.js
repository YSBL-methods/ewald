const newLocal = 'use strict';

const renderer = new THREE.WebGLRenderer({antialias:false});
const div = document.getElementById("mydiv");
renderer.setSize(window.innerWidth*0.52, 660);
renderer.setPixelRatio(window.devicePixelRatio);
div.appendChild(renderer.domElement);
const scene = new THREE.Scene();

//sets radius to 1/1.54 x 100 scaling
const r = 100/1.54
//constants that set the dimentions and spacing of the lattice
const minx = -r/1.5;
const maxx = r/1.5;
const miny = -r/1.5;
const maxy = r/1.5;
const minz = -r/1.5;
const maxz = r/1.5;

//sets the visual dimensions of the Unit cell - not to scale
const a = spacinga/5
const b = spacingb/5
const c = spacingc/5

let x = 0.0
let y = 0.0
let z = 0.0

//sets inital angles
var angley = 0
var anglez = 0

//creates Vectors for calculations later
const V2 = new THREE.Vector3(-r,0,0)
const V3 = new THREE.Vector3(r,0,0)
var s = new THREE.Vector3(0,0,0);

//creates Mesh Materials and Geometries
var intersect_material = new THREE.MeshBasicMaterial({color: 0x0000ff});
var intersect_geometry = new THREE.SphereBufferGeometry(2, 8, 8);
var instintersectgeo = new THREE.InstancedBufferGeometry();
instintersectgeo.index = intersect_geometry.index;
instintersectgeo.attributes.position = intersect_geometry.attributes.position;
instintersectgeo.attributes.uv = intersect_geometry.attributes.uv;

var point_geometry = new THREE.SphereBufferGeometry(0.5, 8, 8);
var instpointgeo = new THREE.InstancedBufferGeometry();
instpointgeo.index = point_geometry.index;
instpointgeo.attributes.position = point_geometry.attributes.position;
instpointgeo.attributes.uv = point_geometry.attributes.uv;

var point_material = new THREE.MeshBasicMaterial({ color: 0x000000 });
var linematerial = new THREE.LineBasicMaterial( {color: 0x000000, linewidth:5 });


var patternGeometry = new THREE.CircleBufferGeometry(0.5,8);
var instpatterngeo = new THREE.InstancedBufferGeometry();
instpatterngeo.index = patternGeometry.index;
instpatterngeo.attributes.position = patternGeometry.attributes.position;
instpatterngeo.attributes.uv = patternGeometry.attributes.uv;
var patternMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

//creates Matrixes for rotation about axis
//Delete for Y
var my =new THREE.Matrix3();
//Delete for Y
var mz =new THREE.Matrix3();

var updatematrix = new THREE.Matrix3();
var positionMatrix = new THREE.Matrix4();

//creates eulers for object rotations to be set to
var euler = new THREE.Euler(0,0,0, 'XYZ');
var euler2 = new THREE.Euler(0,-Math.PI/2,0, 'XYZ');
var rotatematrix = new THREE.Matrix4();
rotatematrix.makeRotationFromEuler(euler2);

//Group of Lattice spots (for calculation not visual)
const latticegroup = new THREE.Group();
//Group for Visible Beams
const Beams = new THREE.Group()
//Group for Pattern spots
const patterngroup = new THREE.Group();
//group for lattice spots that are intersecting the sphere;

const intersectgroup = new THREE.Group();

//Array to store inital lattice coordinates
var latticeSpots = [];

//Instanced Mesh for lattice spots(Visual Spots)
instpoint = new THREE.InstancedMesh();

//Array for Diffraction spots
var DiffSpots = [];

//sets up lattice coordinates in an array "latticeSpots"
function setuplattice() {
    na = Math.floor(maxx/spacinga)
    nb = Math.floor(maxy/spacingb)
    nc = Math.floor(maxz/spacingc)
    for ( let ix = -na; ix <= na; ix++ ) {
        for ( let iy = -nb; iy <= nb; iy++ ) {
            for ( let iz = -nc; iz <= nc; iz++ ) {
                let x = ix * spacinga
                let y = iy * spacingb
                let z = iz * spacingc
                let y1 = y + x*(Math.tan(alpha*Math.PI/180.0))
                let z1 = z + x*(Math.tan(beta*Math.PI/180.0))
                // x, y, z and flag to indicate inside/outside sphere
                latticeSpots.push([x,y1,z1,0]);
            }
        }
    }
}


//creates lattice for calculations only in group "lattice group"
function createlattice() {
    
    for(let i=0; i<latticeSpots.length; i++){

        var xs = latticeSpots[i][0];
        var ys = latticeSpots[i][1];
        var zs = latticeSpots[i][2];
        
        var point = new THREE.Points();

        point.position.set(xs,ys,zs);
        latticegroup.add(point)
    } 
}

//creates visual lattice spots as instanced mesh "instpoint"
function createlatticespots() {
    instpoint = new THREE.InstancedMesh(instpointgeo, point_material,latticeSpots.length);
    for(i=0; i<latticeSpots.length; i++){

        var xs = latticeSpots[i][0];
        var ys = latticeSpots[i][1];
        var zs = latticeSpots[i][2];
        positionMatrix.makeTranslation(xs,ys,zs);
        instpoint.setMatrixAt(i,positionMatrix);
        
    }
    scene.add(instpoint);
}

//Updates the lattice positions based on  angle of rotation about each axis
function update_orientation() {

    //clears the Beams group
    resetBeams();
    //clears the intersect group
    resetintersect();
    
    /* Delete for Y
    var new_angley = parseInt(document.getElementById("angley").value);
    document.getElementById("thetay").innerHTML = (-new_angley).toString();
    angley = new_angley*Math.PI/180.0
    */
    var new_anglez = parseInt(document.getElementById("anglez").value);
    document.getElementById("thetaz").innerHTML = (-new_anglez).toString();
    anglez = new_anglez*Math.PI/180.0

    my.set(
        Math.cos(angley), 0, Math.sin(angley),
        0, 1, 0,
        -Math.sin(angley), 0, Math.cos(angley));
    mz.set(
        Math.cos(anglez), Math.sin(anglez), 0,
        -Math.sin(anglez), Math.cos(anglez), 0,
        0, 0, 1);
    //sets lattice spots group to initial postions
    resetlatticepoints()
    //sets the rotation of lattice point (visual) to rotation Angles
    euler.set(0, angley, -anglez, 'XYZ')
    instpoint.setRotationFromEuler(euler);

    var f = latticegroup.children.length;
    //Sets rotation of unit cell to rotation angles
    unitCell.setRotationFromEuler(euler);
    unitcelledge.setRotationFromEuler(euler);
    //loop that applied rotation angle to each lattice point
    for (i=0; i<f; i++){
        //latticegroup.children[i].position.applyMatrix3(my);
        latticegroup.children[i].position.applyMatrix3(mz);
        latticegroup.children[i].geometry = (point_geometry);
        var V1 = latticegroup.children[i].position
        
        var xs = V1.getComponent(0);
        var ys = V1.getComponent(1);
        var zs = V1.getComponent(2);
        
        // EquaSphere is distance inside or outside sphere 
        var EquaSphere = ((xs*xs)+(2*r*xs)+(ys*ys)+(zs*zs));
        // Logic: if just crossed sphere, then it is visisble now
        //        if visible now for the first time, add to detector
        // 0:unseen -1:inside +1:outside -2:in/seen +2:out/seen
        if ( xs >=-r ) {  // positive side
            fl = latticeSpots[i][3];  // get current flag
            if ( fl == 0 ) {  // first time
                fl = Math.sign( EquaSphere );
            } else {  // not first time
                if ( Math.sign(fl) != Math.sign(EquaSphere) ) { // visible
                    fl = Math.sign(EquaSphere);
                    var intersectpoint = new THREE.Mesh(intersect_geometry,intersect_material);
                    intersectpoint.position.set(xs,ys,zs);
                    intersectgroup.add(intersectpoint);

                    //calculates s vector and determines diffraction spot position
                    s.addVectors(V3,V1);
                    var xs = s.getComponent(0);
                    var ys = s.getComponent(1);
                    var zs = s.getComponent(2);
                    var scalar = ((m+r)/xs);
                    var xs = (xs*scalar)-r;
                    var ys = (ys*scalar);
                    var zs = (zs*scalar);
                    if ( ys != 0 && ys >= -m && ys <= m &&
                         zs != 0 && zs >= -m && zs <= m ) {  // spot on detector
                        if(document.querySelector('#fullbeams').checked === true) {
                            var points = [];
                            points.push(V2);
                            points.push(new THREE.Vector3(xs,ys,zs));
                        } else {
                            var points = [];
                            points.push(V2);
                            points.push(V1);
                        }
                        // creates lines and addes them to Beams group
                        var linegeometry = new THREE.BufferGeometry().setFromPoints( points );
                        var line = new THREE.Line( linegeometry, linematerial );
                        linegeometry.dispose();
                        Beams.add(line);

                        if ( Math.abs(fl) < 1.5 ) { // first time visible
                            fl = 2*Math.sign(fl);
                            // create Diffraction spots and adds to Pattern group
                            var DiffSpot = new THREE.Mesh((new THREE.CircleBufferGeometry(1,32)), new THREE.MeshBasicMaterial({color: 0xff00000}));
                            DiffSpot.position.set(xs,ys,zs);
                            DiffSpot.rotateY(-Math.PI/2);
                            patterngroup.add(DiffSpot);
                        }
                    }
                }
            }
            latticeSpots[i][3] = fl;  // update flag
        }
    }
    //adds all groups to the scene and renderers scene
    scene.add(patterngroup);
    scene.add(Beams)
    scene.add(intersectgroup);
    animate();
}


    
//updates the angle of rotation about each axis

/* Delete for Y
function change_orientationy( diff ) {
    document.getElementById("angley").value = parseInt(document.getElementById("angley").value) + diff;
    update_orientation();
}*/

function change_orientationz( diff ) {
    document.getElementById("anglez").value = parseInt(document.getElementById("anglez").value) + diff;
    update_orientation();
}

//creates and draws ewald sphere
var sphere_radius = r;
var segments = 32;
var phi_start = Math.PI / 2;
var phi_length = Math.PI ;
var theta_start = 0;
var theta_length = Math.PI ;

var sphere_geometry = new THREE.SphereBufferGeometry(
    sphere_radius, segments, segments,
    phi_start, phi_length, theta_start, theta_length);
var sphere_material = new THREE.MeshBasicMaterial({
    color: 0xff0000, transparent: true, opacity: 0.5, side: THREE.DoubleSide
});

function drawSphere(){
    
    var sphere = new THREE.Mesh(sphere_geometry, sphere_material);
    sphere.position.set(-r,0,0)
    scene.add(sphere);
    sphere_geometry.dispose();
    sphere_material.dispose();
}

//creates and draws unit Cell
var unitCellgeo = new THREE.BoxBufferGeometry(a,b,c);
var ShearMatrix = new THREE.Matrix4();
ShearMatrix.makeShear(Math.tan(beta*Math.PI/180.0),Math.tan(alpha*Math.PI/180.0),0,0,0,0);
unitCellgeo.applyMatrix4(ShearMatrix);
const unitCelledges = new THREE.EdgesGeometry(unitCellgeo);
unitCellMat = new THREE.MeshBasicMaterial( { color: 0x00ff00 }  );

function drawunitcell(){
    unitCell= new THREE.Mesh(unitCellgeo,unitCellMat);
    unitcelledge = new THREE.LineSegments(unitCelledges, new THREE.LineBasicMaterial({color: 0x000000}))
    unitcelledge.position.set(-r,0,0);
    unitCell.position.set(-r,0,0);
    scene.add(unitCell);
    scene.add(unitcelledge);
}

function updateunitcell() {
    var unitCellgeo = new THREE.BoxBufferGeometry(a,b,c);
    ShearMatrix.makeShear(Math.tan(beta*Math.PI/180.0),Math.tan(alpha*Math.PI/180.0),0,0,0,0);
    unitCellgeo.applyMatrix4(ShearMatrix);
    unitcelledge.geometry = unitCellgeo
    unitCell.geometry = unitCellgeo
    animate();
}

//creates and draws Detector
let m = 1.5*r
var detectorGeometry = new THREE.BoxBufferGeometry(0,2*m,2*m);
var detectorMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
function drawDetector(){

    var detector = new THREE.Mesh(detectorGeometry,detectorMaterial);
    detector.position.set(m+1,0,0);
    scene.add (detector);
    detectorGeometry.dispose();
    detectorMaterial.dispose();
}

//creates and draws inital beam
var linematerial = new THREE.LineBasicMaterial( {color: 0x000000, linewidth:2.5 });
function drawbeam() {
    var points = [];
    points.push( new THREE.Vector3(-2*r, 0, 0));
    points.push( new THREE.Vector3(0, 0, 0));
    var linegeometry = new THREE.BufferGeometry().setFromPoints( points );
    var line = new THREE.Line( linegeometry, linematerial);
    scene.add(line);
    linematerial.dispose();
    linegeometry.dispose();
}

//clears arrays for groups
function resetlatticepoints(){
    latticegroup.children.splice(0,latticegroup.children.length);
    createlattice();
}

function resetBeams(){
    Beams.children.splice(0,Beams.children.length);
}

function resetintersect(){
    intersectgroup.children.splice(0,intersectgroup.children.length);
}



///Camera Controls///

const camscale = 3.0
const degrees = 45;
const ratio = window.innerWidth / window.innerHeight;
const near = 20;
const far = 800;
const camera = new THREE.PerspectiveCamera(degrees, ratio, near, far);
const camy = 0.5*camscale*r

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(-camscale*r, camy, camscale*r);
camera.lookAt(0, 0, 0);
controls.target = new THREE.Vector3(25, 25, 25);
controls.update();
controls.enabled = false;


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    
}


function recentre() {
    document.getElementById("camera").value=15
    camera.position.set(-camscale*Math.SQRT2*r*Math.sin(15*Math.PI/180.0), camy , camscale*Math.SQRT2*r*Math.cos(15*Math.PI/180.0));
    camera.lookAt(0, 0, 0);
    controls.target = new THREE.Vector3(25, 25, 25);
}


//Clears the detector
function clear() {
    //resets all groups and removes instanced meshes
    latticeSpots.splice(0,latticeSpots.length);
    setuplattice();
    resetlatticepoints();
    patterngroup.children.splice(0,patterngroup.children.length);
    
    scene.remove(instpoint);
    
    createlatticespots();
    unitCell.setRotationFromEuler(new THREE.Euler(0,0,0,'XYZ'));
    unitcelledge.setRotationFromEuler(new THREE.Euler(0,0,0,'XYZ'));
    
    resetBeams();
    animate();
    //have to call update orientation to recreate the visual lattice 
    update_orientation();
}  


//Resets the starting positions
function reset() {
    anglez=0
    document.getElementById("anglez").value = 0
    
    var new_anglez = parseInt(document.getElementById("anglez").value);
    document.getElementById("thetaz").innerHTML = (-new_anglez).toString();
    
    recentre();
    clear();
}  


function adjustcamera(){
    var tau = parseInt(document.getElementById("camera").value)*Math.PI/180.0
    camera.position.set(-camscale*Math.SQRT2*r*Math.sin(tau), camy , camscale*Math.SQRT2*r*Math.cos(tau));
    controls.update();
}



function setup() {
    
    scene.background = new THREE.Color(0xe0e0f0)

    /* Delete for Y
    document.getElementById("angley").oninput = function() { update_orientation(); }
    document.getElementById("rotl5y").onclick = function() { change_orientationy(-5); animate();}
    document.getElementById("rotl1y").onclick = function() { change_orientationy(-1); animate();}
    document.getElementById("rotr1y").onclick = function() { change_orientationy(1); animate();}
    document.getElementById("rotr5y").onclick = function() { change_orientationy(5); animate();}
    */

    document.getElementById("anglez").oninput = function() { update_orientation(); }
    document.getElementById("rotl5z").onclick = function() { change_orientationz(-5);animate(); }
    document.getElementById("rotl1z").onclick = function() { change_orientationz(-1);animate(); }
    document.getElementById("rotr1z").onclick = function() { change_orientationz(1); animate();}
    document.getElementById("rotr5z").onclick = function() { change_orientationz(5); animate();}

    document.getElementById("clear").onclick = clear;
    document.getElementById("recentre").onclick = recentre;

    document.getElementById("camera").oninput = function() { adjustcamera(); }
    
    var DiffSpot = new THREE.Mesh(patternGeometry, patternMaterial);
    DiffSpot.position.set(m,0,0);
    DiffSpot.rotateY(-Math.PI/2);
    scene.add(DiffSpot);
    
    setuplattice();
    resetlatticepoints();
    drawSphere();
    drawDetector();
    drawunitcell();
    updateunitcelldimensions()
    
    drawbeam();
}
