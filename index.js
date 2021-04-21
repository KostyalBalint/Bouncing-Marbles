// module aliases
var Engine = Matter.Engine,
    Body = Matter.Body,
    Events = Matter.Events,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

var runner, engine;

function rand(min, max){
  return Math.random() * (max - min) + min;
}

//function for adding static rectangles
//(x coord of centre, y coord of centre, width, height)
function wall(x, y, w, h){
  return Bodies.rectangle(x, y, w, h, {
    friction: 0,
    restitution: 0.6,
    frictionAir: 0,
    frictionStatic: 0,
    isStatic: true,
    render: {
      fillStyle: '#2C3F50', 
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
    restitution: 0.6,
    frictionAir: 0.01,
    frictionStatic: 1,
    render:{fillStyle: '#3297DB'}
  });
}

window.onload = () => {
  var start = false;

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
    parts: [Bodies.rectangle(400, 607, 810, 200, { restitution: 0.6, render: {fillStyle: '#333333', strokeStyle: 'none'} }),
            //separator
            Bodies.rectangle(400, 400, 30, 300, { restitution: 0.6, render: {fillStyle: '#333333', strokeStyle: 'none'} })],
    isStatic: true,
  });
  // add all of the bodies to the world
  Composite.add(engine.world, [ground]);
  var groundActive = false;

  //array containing the marbles
  var objects = [];

  //radius of marbels
  var r = 7;

  //generate marbles
  function generateMarbles(count){
    for (var i = 0; i < count; i++) {
      objects.push(marble(rand(30, 300), rand(20, 500), r));
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
  runner = Runner.create({
    isFixed: true,
    delta: 1000/60
  });

  // run the engine
  Runner.run(runner, engine);

  window.freq = 50;
  window.amp = 20;

  var freqchange;
  var rates = [];
  var labels = [];
  var prev_sec = 1000;

  //Add event listeners
  Events.on(engine, 'beforeUpdate', (event) =>{
    if (!start){
      engine.timing.timestamp = 0;
    }

    //add marbles until have equal to marblecount
    while(marblecount > objects.length){
      newObject = marble(rand(30, 380), rand(20, 500), r);
      objects.push(newObject);
      Composite.add(engine.world, newObject);
    }

    //remove marbles until have equal to marblecount
    while(marblecount < objects.length){
      Composite.remove(engine.world, objects.pop());
    }

    //constrain marbles
    for(var i = 0; i < objects.length; i++){
      if(objects[i].position.x < 0 || objects[i].position.x > 800 || objects[i].position.y < 0 || objects[i].position.y > 800){
        Composite.remove(engine.world, objects[i]);
        objects.splice(i, 1);
      }
    };

    //update ground and separator velocity and position
    if(groundActive){
      var omega = window.freq * 2 * 3.1415;
      var v = -amp * freq;                                                                      //sawtooth formula, assuming fps
      //var v = window.amp * omega * Math.cos((engine.timing.timestamp / 1000) * omega)/60;     //sine wave formula, assuming fps
      //var py = 600 + window.amp * Math.sin((engine.timing.timestamp / 1000) * omega);
      var py = 600 + ((engine.timing.timestamp / 1000) % (1/freq))* v ; 
      
      if (window.freq == freqchange){ //Frequency change doesnt effect marbles
        Body.setVelocity(ground, { x: 0, y: v/100 });
      }
      Body.setPosition(ground, { x: ground.position.x, y: py });
      freqchange = window.freq;
    } else {
      Body.setVelocity(ground, { x: 0, y: 0});
    }

    //Timer update
    document.getElementById("timer").innerHTML = "Timer: " + (engine.timing.timestamp / 1000).toFixed(3) + "s";

    //Counting marbles
    let left = 0; right = 0;
    objects.forEach(element => {
      if (element.position.x > 400) {right++; element.render.fillStyle = '#E84C3D'}
      else {left++; element.render.fillStyle = '#3297DB'}
    });
    document.getElementById("label-left").innerHTML = "Left: " + left + " Pcs";
    document.getElementById("label-right").innerHTML = "Right: " + right + " Pcs";
	
	// expand chart
	if ((engine.timing.timestamp) > prev_sec){
		prev_sec += 2800;
		rates.push(right * 100 / marblecount);
		labels.push(prev_sec / 1000 - 1);
		myChart.update();
	}


	var total = 0;
	for(var i = 0; i < rates.length; i++) {
		total += rates[i];
	}
	var avg = total / rates.length;
	
	document.getElementById("label-avg").innerHTML = "Avg: " + avg.toFixed(2) + "%";
  });
  
  // chart declaration
  var ctx = document.getElementById('myChart');
	var myChart = new Chart(ctx, {
	  type: 'line',
	  data: {
      labels: labels,//[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
	    datasets: [{
	      label: '% of particles on the right',
	      data: rates,
	      backgroundColor: [
	        'rgba(255, 99, 132, 0.2)'
	      ],
	      borderColor: [
	        'rgba(255, 99, 132, 1)'
	      ],
	      borderWidth: 1
	    }]
	  },
	  options: {
	    scales: {
	      y: {
	        beginAtZero: true,
	        max: 100
	      }
	    }
	  }
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

  //Start - Stop button
  document.getElementById('btn-pause-start').addEventListener('click', () => {
    start = true;
    groundActive = !groundActive;
    let btn = document.getElementById('btn-pause-start');
    if (groundActive){
      btn.innerHTML = "Stop movement";
      btn.classList.add("btn-info");
      btn.classList.remove("btn-success");
    }
    else {
      btn.innerHTML = "Start movement";
      btn.classList.add("btn-success");
      btn.classList.remove("btn-info");
    }
  });

  //Freeze - Contunue button
  document.getElementById('btn-freeze-continue').addEventListener('click', () => {
    runner.enabled = !runner.enabled;
    let btn = document.getElementById('btn-freeze-continue');
    btn.innerHTML = btn.innerHTML === "Continue time" ? "Freeze time" : "Continue time";
    btn.classList.toggle("btn-success");
    btn.classList.toggle("btn-info");
  });

  //Restart button
  document.getElementById("btn-restart").addEventListener("click", () => {
    engine.timing.timestamp = 0;
    groundActive = false;
    document.getElementById("timer").innerHTML = "Timer: " + (engine.timing.timestamp / 1000).toFixed(3) + "s";
    objects.forEach(element => {
      Composite.remove(engine.world, element);
    });
    objects = [];
    generateMarbles(window.marblecount);
    
    let btn = document.getElementById('btn-pause-start');
    btn.innerHTML = "Start movement";
    btn.classList.add("btn-success");
    btn.classList.remove("btn-info");

	// reset chart
	labels = []; rates = [];
	myChart.data.datasets[0].data = rates;
	myChart.data.labels = labels;
	
	prev_sec = 1000;
	myChart.update();
  })

};
