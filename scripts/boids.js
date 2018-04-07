//Canvas variables
var canvasWidth = 480;
var canvasHeight = 480;
var bgColor = "#FFF9C4";

//GUI coordinates
var controlStartX = 50;
var controlStartY = 100;
var controlElementOffset = 20;
var labelOffset = 12;

// GUI
var attractSlider;
var alignSlider;
var repelSlider;

var radiusAttractSlider;
var radiusAlignSlider;
var radiusRepelSlider;

var attractLabel;
var alignLabel;
var repelLabel;
var radiusAttractLabel;
var radiusAlignLabel;
var radiusRepelLabel;

//Flock
var flock;
var predatorFlock;
var initialBoids = 100;

// Colors
var totalColors = 2;
var greenColor;
var blueColor;
var colorArray;

class Flock {
  constructor() {
    this.boidList = [];
  }

  //adds num Boids to the flock
  insertBoids(num, typeOfBoid) {
    for(var i=0;i<num;i++) {
      var position = createVector(random(canvasWidth), random(canvasHeight));
      var velocity = createVector(random(-1,1), random(-1,1));
      // console.log(typeOfBoid + " " + typeOfBoid === 'prey');
      if(typeOfBoid === 'prey') {
        this.boidList.push(new Boid(position, velocity))  ;
        console.log('prey inserted');
      }
      else if (typeOfBoid === 'predator') {
        this.boidList.push(new Predator(position, velocity));
        console.log('predator inserted');
      }
    }

  }

  //updates positions of all the Boids in the flock
  update() {
    for(var i=0;i<this.boidList.length;i++) {
      this.boidList[i].updatePosition();
    }
  }

  //renders all boids in the flock
  render() {
    for (var i=0;i<this.boidList.length;i++) {
      this.boidList[i].render();
    }
    stroke("#FF0000");
    noFill();
    ellipse(this.boidList[0].position.x, this.boidList[0].position.y, radiusRepelSlider.value(), radiusRepelSlider.value());
    stroke("#00FF00");
    noFill();
    ellipse(this.boidList[0].position.x, this.boidList[0].position.y, radiusAttractSlider.value(), radiusAttractSlider.value());
    stroke("#0000FF");
    noFill();
    ellipse(this.boidList[0].position.x, this.boidList[0].position.y, radiusAlignSlider.value(), radiusAlignSlider.value());
    stroke("#000000");
  }
};

//Boid Class
class Boid {
  constructor(position, velocity) {
    this.position = position;
    this.bodyRadius = 3.5;
    this.velocity = velocity;
    this.repulsionRange = 12*this.bodyRadius;
    this.alignmentRange = 25*this.bodyRadius;
    this.attractionRange = 45*this.bodyRadius;
    this.maxSpeed = 1;
    this.color = floor(random(totalColors));
  }

  wrap() {
    // wrap x
    if(this.position.x<0) {
      this.position.x=canvasWidth;
    }
    else if(this.position.x>canvasWidth) {
      this.position.x=0;
    }
    // wrap y
    if(this.position.y<0) {
      this.position.y = canvasHeight;
    }
    else if(this.position.y>canvasHeight) {
      this.position.y = 0;
    }
  }

  r1_avoid() {
    var v = createVector(0,0);
    var count = 0;
    //scan for neighbors
    for(var i=0; i<flock.boidList.length; i++) {
      if(this==flock.boidList[i])
        continue;
      //calculate displacement with respect to this boid
      var displacement = p5.Vector.sub(flock.boidList[i].position, this.position);
      var d = displacement.mag();
      //if both are too close
      if(d<=radiusRepelSlider.value()) {
        //move along the reverse direction of displacement
        displacement.normalize();
        //lower distance means more repulsion, so 1/d scaling is applied
        displacement.div(d);
        v.sub(displacement);
        count++;
      }
    }
    //take the mean of all the suggested avoidance velocities
    if(count>0)
      v.div(count);

    v.normalize();
    //v.mult(this.maxSpeed);

    return v;
  }

  r2_align() {
    //v is the perceived average velocity (direction)
    var v = createVector(0, 0);
    var count = 0;
    //scan for neighbours
    for(var i=0;i<flock.boidList.length;i++) {
      if(this==flock.boidList[i])
        continue;
      var displacement = p5.Vector.sub(flock.boidList[i].position, this.position);
      var d = displacement.mag();
      if(d <= radiusAlignSlider.value()) {
        v.add(flock.boidList[i].velocity)
        count++;
      }
    }
    //take mean neighborhood velocity
    if(count>0)
      v.div(count)
    v.normalize();
    //v.mult(this.maxSpeed);
    return v;
  }

  r3_attract() {
    var center = createVector(0,0);
    var count = 0;

    for(var i = 0; i < flock.boidList.length; i++) {
      if(this == flock.boidList[i])
        continue;
      var displacement = p5.Vector.sub(flock.boidList[i].position, this.position);
      var d = displacement.mag();
      if(d <= radiusAttractSlider.value() &&
        this.color == flock.boidList[i].color) {
        // console.log(this.color + " " + flock.boidList[i].color);
        center.add(flock.boidList[i].position)
        count++;
      }
    }

    if(count==0)
      return center;

    center.div(count);
    //get the center of mass with respect to this boid
    center.sub(this.position);
    //if already present at center
    if(center.mag()==0)
      return center;

    center.normalize();
    //center.mult(this.maxSpeed);
    return center;
  }

  updatePosition() {
    var v1 = this.r1_avoid().mult(repelSlider.value());
    var v2 = this.r2_align().mult(alignSlider.value());
    var v3 = this.r3_attract().mult(attractSlider.value());

    //this.velocity = createVector(0,0);
    this.velocity.add(v1);
    this.velocity.add(v2);
    this.velocity.add(v3);

    //limit velocity to maxSpeed
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.wrap();
  }

  render() {
    var theta = this.velocity.heading()
    push();
    translate(this.position.x,this.position.y);
    rotate(theta + PI / 2);
    beginShape();
    vertex(0, -this.bodyRadius);
    vertex(-0.5 * this.bodyRadius, this.bodyRadius * 1);
    vertex(0.5 * this.bodyRadius, this.bodyRadius * 1);
    // console.log(colorArray[this.color])
    fill(colorArray[this.color])
    endShape(CLOSE);
    pop();
  }
};

function createGUIElements() {
  attractSlider = createSlider(0, 2, 1, 0.05);
  repelSlider = createSlider(0, 2, 1, 0.05);
  alignSlider = createSlider(0, 2, 1, 0.05);

  radiusAttractSlider = createSlider(0,60,45,0.01);
  radiusAlignSlider = createSlider(0,60,25,0.01);
  radiusRepelSlider = createSlider(0,60,12,0.01);


  attractSlider.position(controlStartX, controlStartY + 1 * controlElementOffset);
  repelSlider.position(controlStartX, controlStartY + 2 * controlElementOffset);
  alignSlider.position(controlStartX, controlStartY + 3 * controlElementOffset);
  radiusAttractSlider.position(controlStartX, controlStartY + 4 * controlElementOffset);
  radiusRepelSlider.position(controlStartX, controlStartY + 5 * controlElementOffset);
  radiusAlignSlider.position(controlStartX, controlStartY + 6 * controlElementOffset);

  attractLabel = createDiv('attraction');
  repelLabel = createDiv('repulsion');
  alignLabel = createDiv('align');

  radiusAttractLabel = createDiv('radius attraction');
  radiusRepelLabel = createDiv('radius repulsion');
  radiusAlignLabel = createDiv('radius align');

  attractLabel.position(attractSlider.x + attractSlider.width + labelOffset, attractSlider.y);
  repelLabel.position(repelSlider.x + repelSlider.width + labelOffset, repelSlider.y);
  alignLabel.position(alignSlider.x + alignSlider.width + labelOffset, alignSlider.y);

  radiusAttractLabel.position(radiusAttractSlider.x + radiusAttractSlider.width + labelOffset, radiusAttractSlider.y);
  radiusRepelLabel.position(radiusRepelSlider.x + radiusRepelSlider.width + labelOffset, radiusRepelSlider.y);
  radiusAlignLabel.position(radiusAlignSlider.x + radiusAlignSlider.width + labelOffset, radiusAlignSlider.y);
}

//setup here
function setup() {
  // Colors
  greenColor = color(0, 255, 0);
  blueColor = color(0, 0, 255);
  colorArray = [greenColor, blueColor];
  // Canvas
  var canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2)
  background(bgColor);
  createGUIElements();
  //initialize a flock
  flock = new Flock();
  //insert initial number of boids
  flock.insertBoids(initialBoids, 'prey');
  //render the flock
  flock.render()

  // initialize predators
  predatorFlock = new Flock();
  predatorFlock.insertBoids(3, 'predator');
  predatorFlock.render();
  console.log(flock.boidList)
  frameRate(60);
}

function draw() {
  background(bgColor);
  flock.update();
  flock.render();
  predatorFlock.update();
  predatorFlock.render();
}

// Predator class
class Predator {
  constructor(position, velocity) {
    this.position = position;
    this.bodyRadius = 10.0;
    this.velocity = velocity;
    this.repulsionRange = 12 * this.bodyRadius;
    this.alignmentRange = 25 * this.bodyRadius;
    this.attractionRange = 45 * this.bodyRadius;
    this.maxSpeed = 1;
    this.color = color(255, 0, 0);
  }

  wrap() {
    // wrap x
    if(this.position.x<0) {
      this.position.x=canvasWidth;
    }
    else if(this.position.x>canvasWidth) {
      this.position.x=0;
    }
    // wrap y
    if(this.position.y<0) {
      this.position.y = canvasHeight;
    }
    else if(this.position.y>canvasHeight) {
      this.position.y = 0;
    }
  }

  r1_avoid() {
    var v = createVector(0,0);
    var count = 0;
    //scan for neighbors
    for(var i=0; i<flock.boidList.length; i++) {
      if(this==flock.boidList[i])
        continue;
      //calculate displacement with respect to this boid
      var displacement = p5.Vector.sub(flock.boidList[i].position, this.position);
      var d = displacement.mag();
      //if both are too close
      if(d<=radiusRepelSlider.value()) {
        //move along the reverse direction of displacement
        displacement.normalize();
        //lower distance means more repulsion, so 1/d scaling is applied
        displacement.div(d);
        v.sub(displacement);
        count++;
      }
    }
    //take the mean of all the suggested avoidance velocities
    if(count>0)
      v.div(count);

    v.normalize();
    //v.mult(this.maxSpeed);

    return v;
  }

  r2_align() {
    //v is the perceived average velocity (direction)
    var v = createVector(0, 0);
    var count = 0;
    //scan for neighbours
    for(var i=0;i<flock.boidList.length;i++) {
      if(this==flock.boidList[i])
        continue;
      var displacement = p5.Vector.sub(flock.boidList[i].position, this.position);
      var d = displacement.mag();
      if(d <= radiusAlignSlider.value()) {
        v.add(flock.boidList[i].velocity)
        count++;
      }
    }
    //take mean neighborhood velocity
    if(count>0)
      v.div(count)
    v.normalize();
    //v.mult(this.maxSpeed);
    return v;
  }

  r3_attract() {
    var center = createVector(0,0);
    var count = 0;

    for(var i = 0; i < flock.boidList.length; i++) {
      if(this == flock.boidList[i])
        continue;
      var displacement = p5.Vector.sub(flock.boidList[i].position, this.position);
      var d = displacement.mag();
      if(d <= radiusAttractSlider.value() &&
        this.color == flock.boidList[i].color) {
        // console.log(this.color + " " + flock.boidList[i].color);
        center.add(flock.boidList[i].position)
        count++;
      }
    }

    if(count==0)
      return center;

    center.div(count);
    //get the center of mass with respect to this boid
    center.sub(this.position);
    //if already present at center
    if(center.mag()==0)
      return center;

    center.normalize();
    //center.mult(this.maxSpeed);
    return center;
  }

  r4_lock() {
    var neighbordist = 200;
    var averageBoid = createVector(0,0);
    var nearbyBoids = 0;

    for (var b of flock.boidList) {
      var distance = p5.Vector.dist(this.position, b.position);
      if (distance < neighbordist) {
        averageBoid.add(b.position);
        nearbyBoids++;
      }
    }

    if (nearbyBoids) {
      averageBoid.div(nearbyBoids);
      var desired = p5.Vector.sub(averageBoid, this.position);
      return desired.limit(0.1);
    }
    return createVector(0,0);
  }

  updatePosition() {
    // var v1 = this.r1_avoid().mult(repelSlider.value());
    // var v2 = this.r2_align().mult(alignSlider.value());
    // var v3 = this.r3_attract().mult(attractSlider.value());

    //this.velocity = createVector(0,0);
    // this.velocity.add(v1);
    // this.velocity.add(v2);
    // this.velocity.add(v3);

    //limit velocity to maxSpeed
    var lockingVelocity = this.r4_lock().mult(1.0);
    this.velocity.add(lockingVelocity);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.wrap();
  }

  render() {
    var theta = this.velocity.heading()
    push();
    translate(this.position.x,this.position.y);
    rotate(theta + PI / 2);
    beginShape();
    vertex(0, -this.bodyRadius);
    vertex(-0.5 * this.bodyRadius, this.bodyRadius * 1);
    vertex(0.5 * this.bodyRadius, this.bodyRadius * 1);
    // console.log(colorArray[this.color])
    fill(this.color)
    endShape(CLOSE);
    pop();
  }
};
