// module aliases
var Engine = Matter.Engine,
    Body = Matter.Body,
    Events = Matter.Events,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

window.onload = () => {

  // create an engine
  var engine = Engine.create(document.getElementById("canvas-container"));

  // create a renderer
  var render = Render.create({
      element: document.getElementById("canvas-container"),
      engine: engine,
  });

  //Create ground and divider
  var ground = Body.create({
    parts: [Bodies.rectangle(400, 150, 810, 200), Bodies.rectangle(400, -75, 20, 300)],
    isStatic: true
  });
  // add all of the bodies to the world
  Composite.add(engine.world, [ground]);

  var objects = [];
  var r = 5;

  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 5; j++) {
      objects.push(Bodies.circle(50 + i*r*2, 50 + j*r*2, r));
    }
  }
  for (var i = 0; i < 10; i++) {
	objects.pop();  
  }
  
  Composite.add(engine.world, objects);

  //Create walls
  Composite.add(engine.world, [
      Bodies.rectangle(400, -25, 800, 100, { isStatic: true }),
      Bodies.rectangle(400, 625, 800, 100, { isStatic: true }),
      Bodies.rectangle(825, 300, 100, 600, { isStatic: true }),
      Bodies.rectangle(-25, 300, 100, 600, { isStatic: true })
  ]);

  // run the renderer
  Render.run(render);

  // create runner
  var runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);

  setFreq();
  Events.on(engine, 'beforeUpdate', (event) =>{
    var py = 500+ 200 * Math.sin(engine.timing.timestamp * (window.freq / 1000));
    Body.setVelocity(ground, { x: 0, y: py - ground.position.y });
    Body.setPosition(ground, { x: ground.position.x, y: py });
  });

};

function setFreq(){
	var f = document.getElementById("range-freq").value;
	window.freq = f;
}

function displayfreq() {
	var r = document.getElementById("range-freq").value;
	document.getElementById("freqdisp").innerHTML = "Frequency (" + r + ")";
}
function displayamp() {
	var r = document.getElementById("range-amp").value;
	document.getElementById("freqdisp").innerHTML = "Amplitude (" + r + ")";
}