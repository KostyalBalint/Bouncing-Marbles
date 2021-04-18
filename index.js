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

  //generate balls
  function generateMarbles(count){
    let x = 0, y = 0;
    for (var i = 0; i < count; i++) {
      if (50 + x*r*2 >= 390) {x = 0; ++y;} //x can go until the divider
      objects.push(Bodies.circle(50 + x*r*2, 50 + y*r*2, r));
      x++;
    }
    Composite.add(engine.world, objects);
  }

  window.marblecount = document.getElementById("range-marblecount").value;
  generateMarbles(window.marblecount);

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
    while(marblecount > objects.length){
      circle = Bodies.circle(50, 50, r);
      objects.push(circle);
      Composite.add(engine.world, circle);
    }
      while(marblecount < objects.length){
      Composite.remove(engine.world, objects.pop());
    }
    var py = 600 + window.amp * Math.sin((engine.timing.timestamp / 1000) * window.freq * 2 * 3.1415);
    Body.setVelocity(ground, { x: 0, y: py - ground.position.y });
    Body.setPosition(ground, { x: ground.position.x, y: py });

    //Timer update
    document.getElementById("timer").innerHTML = "Timer: " + (engine.timing.timestamp / 1000).toFixed(3) + "s";

    //Counting marbles
    let left = 0; right = 0;
    objects.forEach(element => {
      if (element.position.x > 400) {right++;}
      else {left++;}
      document.getElementById("label-left").innerHTML = "Left (" + left + ")";
      document.getElementById("label-right").innerHTML = "Right (" + right + ")";
    });
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

  document.getElementById("range-marblecount").addEventListener('input', () => {
    window.marblecount = document.getElementById("range-marblecount").value;
    document.getElementById("label-marblecount").innerHTML = "Marble Count (" + window.marblecount + ")";
  });

  //Start - Pause button
  document.getElementById('btn-pause-start').addEventListener('click', () => {
    runner.enabled = !runner.enabled;
    let btn = document.getElementById('btn-pause-start');
    btn.innerHTML = btn.innerHTML === "Start" ? "Pause" : "Start";
    btn.classList.toggle("btn-success");
    btn.classList.toggle("btn-info");
  });

  //Restart button
  document.getElementById("btn-restart").addEventListener("click", () => {
    engine.timing.timestamp = 0;
    document.getElementById("timer").innerHTML = "Timer: " + (engine.timing.timestamp / 1000).toFixed(3) + "s";
    objects.forEach(element => {
      Composite.remove(engine.world, element);
    });
    objects = [];
    generateMarbles(window.marblecount);
  })

};
