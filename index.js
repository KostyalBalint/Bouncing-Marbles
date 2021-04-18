// module aliases
var Engine = Matter.Engine,
    Body = Matter.Body,
    Events = Matter.Events,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

var runner, engine;

window.onload = () => {

  // create an engine
  engine = Engine.create(document.getElementById("canvas-container"));

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

  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      objects.push(Bodies.circle(50 + i*r*2, 50 + j*r*2, r));
    }
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
  runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);

  window.freq = 5;
  window.amp = 10;

  //Add event listeners
  Events.on(engine, 'beforeUpdate', (event) =>{
    var py = 600 + window.amp * Math.sin((engine.timing.timestamp / 1000) * window.freq * 2 * 3.1415);
    Body.setVelocity(ground, { x: 0, y: py - ground.position.y });
    Body.setPosition(ground, { x: ground.position.x, y: py });
  });

  document.getElementById("range-freq").addEventListener('input', () => {
    window.freq = document.getElementById("range-freq").value;
    document.getElementById("label-freq").innerHTML = "Frequency (" + window.freq + " Hz)";
  });

  document.getElementById("range-amp").addEventListener('input', () => {
    	let amp = document.getElementById("range-amp").value;
    	document.getElementById("label-amp").innerHTML = "Amplitude (" + amp + ")";
      window.amp = amp;
  });

  //Start - Pause button
  document.getElementById('btn-pause-start').addEventListener('click', () => {
    runner.enabled = !runner.enabled;
    let btn = document.getElementById('btn-pause-start');
    btn.innerHTML = btn.innerHTML === "Start" ? "Pause" : "Start";
    btn.classList.toggle("btn-success");
    btn.classList.toggle("btn-info");
  });

};
