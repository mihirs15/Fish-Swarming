//Canvas variables
var canvasWidth = 512;
var canvasHeight = 512;
var bgColor = "#FFF9C4";

//Flocking Variables
var boidList = [];
var initialBoids =500;

//GUI elements
var controlStartX = 50;
var controlStartY = 100;
var controlElementOffset = 20;
var labelOffset = 12;
var etaSlider;
var vSlider;
var etaLabel;
var vLabel;

//Boid Class
class Boid {
  constructor(x, y, theta) {
    this.theta = theta;
    this.position = createVector(x,y);
    this.v = 2;
    this.bodyRadius = 2;
    this.visibleRadius = 10;
  }

  show() {
    push();
    translate(this.position.x,this.position.y);
    rotate(this.theta+PI/2);
    beginShape();
    vertex(0, -this.bodyRadius);
    vertex(-0.5*this.bodyRadius, this.bodyRadius*1);
    vertex(0.5*this.bodyRadius, this.bodyRadius*1);
    endShape(CLOSE);
    pop();
  }

  getMeanTheta() {
    var sinSum = 0;
    var cosSum = 0;
    for(var i=0;i<boidList.length;i++) {
      if(p5.Vector.dist(this.position, boidList[i].position)<=this.visibleRadius) {
        sinSum+=Math.sin(boidList[i].theta)
        cosSum+=Math.cos(boidList[i].theta)
      }
    }
    return Math.atan2(sinSum, cosSum);
  }

  wrap() {
    //wrap x
    if(this.position.x<0) {
      this.position.x=canvasWidth;
    }
    else if(this.position.x>canvasWidth) {
      this.position.x=0;
    }
    //wrap y
    if(this.position.y<0) {
      this.position.y = canvasHeight;
    }
    else if(this.position.y>canvasHeight) {
      this.position.y = 0;
    }
  }

  update() {
    //get mean theta
    var meanTheta = this.getMeanTheta()
    this.theta = meanTheta + etaSlider.value()*random(-1,1);
    //calculate velocity
    var velocity = createVector(vSlider.value()*cos(this.theta), vSlider.value()*sin(this.theta))
    //update position
    this.position.add(velocity);
  }

};

function createGUIElements() {
  etaSlider = createSlider(0, 3, 0.3, 0.05);
  etaSlider.position(controlStartX, controlStartY + 1*controlElementOffset);
  etaLabel = createDiv('noise');
  etaLabel.position(etaSlider.x + etaSlider.width + labelOffset, etaSlider.y);

  vSlider = createSlider(0, 3, 2, 0.05);
  vSlider.position(controlStartX, controlStartY + 2*controlElementOffset);
  vLabel = createDiv('speed');
  vLabel.position(vSlider.x + vSlider.width + labelOffset, vSlider.y);
}

//setup here
function setup() {
  var canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2)
  background(bgColor);
  createGUIElements();
  // create initialBoids
  randomSeed(5);
  for(var i=0;i<initialBoids;i++) {
    boidList.push(new Boid(random(canvasWidth), random(canvasHeight), random(0,4*PI)));
  }
  frameRate(60);
}

function draw() {
  background(bgColor);
  for(var i=0;i<boidList.length;i++) {
    boidList[i].update();
    boidList[i].show();
    boidList[i].wrap();
  }
}
