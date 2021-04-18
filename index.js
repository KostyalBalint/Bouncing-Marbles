// module aliases
var Engine = Matter.Engine,
    Body = Matter.Body,
    Events = Matter.Events,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

var runner, engine;

//function for adding static rectangles
//(x coord of centre, y coord of centre, width, height)
function wall(x, y, w, h){
  return Bodies.rectangle(x, y, w, h, {
    friction: 0,
    restitution: 0.8,
    frictionAir: 0,
    frictionStatic: 0,
    isStatic: true,
    render: {
      fillStyle: 'grey', 
      strokeStyle: 'white',
      lineWidth: 0
    }
  });
}

//function for adding marbles
//(x coord of centre, y coord of centre, radius)
function marble(x, y, r){
  return Bodies.circle(x, y, r, {
    friction: 0,
    restitution: 0.8,
    frictionAir: 0,
    frictionStatic: 0,
    render:{
      fillStyle: 'SlateBlue'
    }
  });
}

window.onload = () => {

  // create an engine
  engine = Engine.create(document.getElementById("canvas-container"));

  // create a renderer
  var render = Render.create({
      element: document.getElementById("canvas-container"),
      engine: engine,
      options:{
        wireframes: false,
      }
  });

  //Create ground and divider
  var ground = Body.create({
    //bottom part
    parts: [Bodies.rectangle(400, 150, 810, 200, { render: {fillStyle: 'none', strokeStyle: 'white',lineWidth: 3} }),
            //separator
            Bodies.rectangle(400, -100, 20, 300, { render: {fillStyle: 'none', strokeStyle: 'white',lineWidth: 3} })],
    isStatic: true,
  });
  // add all of the bodies to the world
  Composite.add(engine.world, [ground]);

  //array containing the marbles
  var objects = [];

  //radius of marbels
  var r = 5;

  //generate marbles
  function generateMarbles(count){
    let x = 0, y = 0;
    for (var i = 0; i < count; i++) {
      if (50 + x*r*2 >= 390) {x = 0; ++y;} //x can go until the divider
      objects.push(marble(50 + x*r*2, 50 + y*r*2, r));
      x++;
    }
    Composite.add(engine.world, objects);
  }

  window.marblecount = document.getElementById("range-marblecount").value;
  generateMarbles(window.marblecount);

  //Create walls
  Composite.add(engine.world, [
    wall(400, -25, 800, 100),
    wall(400, 625, 800, 100),
    wall(825, 300, 100, 600),
    wall(-25, 300, 100, 600)
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
    //add marbles until have equal to marblecount
    while(marblecount > objects.length){
      newObject = marble(50, 50, r);
      objects.push(newObject);
      Composite.add(engine.world, newObject);
    }

    //remove marbles until have equal to marblecount
    while(marblecount < objects.length){
      Composite.remove(engine.world, objects.pop());
    }

    //update ground and separator velocity and position
    var py = 600 + window.amp * Math.sin((engine.timing.timestamp / 1000) * window.freq * 2 * 3.1415);
    Body.setVelocity(ground, { x: 0, y: py - ground.position.y });
    Body.setPosition(ground, { x: ground.position.x, y: py });

    //Timer update
    document.getElementById("timer").innerHTML = "Timer: " + (engine.timing.timestamp / 1000).toFixed(3) + "s";

    //Counting marbles
    let left = 0; right = 0;
    objects.forEach(element => {
      if (element.position.x > 400) {right++; element.render.fillStyle = 'Brown'}
      else {left++; element.render.fillStyle = 'SlateBlue'}
      document.getElementById("label-left").innerHTML = "Left (" + left + ")";
      document.getElementById("label-right").innerHTML = "Right (" + right + ")";
    });
  });

  //frequency slider
  document.getElementById("range-freq").addEventListener('input', () => {
    window.freq = document.getElementById("range-freq").value;
    document.getElementById("label-freq").innerHTML = "Frequency (" + window.freq + " Hz)";
  });

  //amplitude slider
  document.getElementById("range-amp").addEventListener('input', () => {
    let amp = document.getElementById("range-amp").value;
    document.getElementById("label-amp").innerHTML = "Amplitude (" + amp + ")";
    window.amp = amp;
  });

  //marblecount slider
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
