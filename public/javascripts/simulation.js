(function() {
  var DRAW_SCALE, G, Planet, Point3d, Simulation, SolarSystem, canvas, canvas_element, dt, hours_per_step, originx, originy, planets_data, refresh_rate, scale, simulation,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  G = 6.6742e-11;

  DRAW_SCALE = 9e-10;

  hours_per_step = 30;

  dt = 3600 * hours_per_step;

  refresh_rate = 20;

  planets_data = ["Sun", 0, 695000000, 1.989E+030, 0, "yellow", "Mercury", 57900000000, 2440000, 3.33E+023, 47900, "gray", "Venus", 108000000000, 6050000, 4.869E+024, 35000, "red", "Earth", 150000000000, 6378140, 5.976E+024, 29800, "blue", "Mars", 227940000000, 3397200, 6.421E+023, 24100, "red", "Jupiter", 778330000000, 71492000, 1.9E+027, 13100, "brown", "Saturn", 1429400000000, 60268000, 5.688E+026, 9640, "gray", "Uranus", 2870990000000, 25559000, 8.686E+025, 6810, "gray", "Neptune", 4504300000000, 24746000, 1.024E+026, 5430, "yellow", "Pluto", 5913520000000, 1137000, 1.27E+022, 4740, "black"];

  Point3d = (function() {

    function Point3d(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    Point3d.prototype.print = function() {
      return console.log(" x: " + this.x + ", y: " + this.y + ", z: " + this.z + " ");
    };

    Point3d.prototype.minus = function(p) {
      return new Point3d(this.x - p.x, this.y - p.y, this.z - p.z);
    };

    Point3d.prototype.plus = function(p) {
      return new Point3d(this.x + p.x, this.y + p.y, this.z + p.z);
    };

    Point3d.prototype.divided = function(p) {
      return new Point3d(this.x / p, this.y / p, this.z / p);
    };

    Point3d.prototype.multiply = function(p) {
      return new Point3d(this.x * p, this.y * p, this.z * p);
    };

    Point3d.prototype.distance = function() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    };

    return Point3d;

  })();

  Planet = (function() {

    function Planet(name, radius, mass, pos, vel, color) {
      this.name = name;
      this.radius = radius;
      this.mass = mass;
      this.pos = pos;
      this.vel = vel;
      this.color = color;
    }

    Planet.prototype.draw = function() {
      var below, center_x, center_y, radius, scaled_center_x, scaled_center_y;
      scaled_center_x = (canvas_element.width / 2) / scale;
      scaled_center_y = (canvas_element.height / 2) / scale;
      center_x = Math.floor(scaled_center_x + this.pos.x * DRAW_SCALE);
      center_y = Math.floor(scaled_center_y + this.pos.z * DRAW_SCALE);
      if (isNaN(center_x) || isNaN(center_y)) return;
      radius = this.radius * DRAW_SCALE * 40;
      if (this.name !== "Sun") radius *= 10;
      canvas.beginPath();
      canvas.arc(center_x, center_y, radius, 0, 2 * Math.PI, false);
      canvas.fillStyle = this.color;
      canvas.fill();
      canvas.lineWidth = 1;
      canvas.strokeStyle = "black";
      canvas.stroke();
      if (this.name !== "Sun") {
        below = center_y + radius + 5;
        return canvas.fillText(this.name, center_x, below);
      }
    };

    Planet.prototype.print = function() {};

    return Planet;

  })();

  SolarSystem = (function() {

    function SolarSystem() {}

    SolarSystem.prototype.load = function() {
      var color, i, mass, name, planet, planet_data, pos, radius, vel, _len, _step;
      this.planets = [];
      for (i = 0, _len = planets_data.length, _step = 6; i < _len; i += _step) {
        planet_data = planets_data[i];
        name = planets_data[i];
        pos = new Point3d(planets_data[i + 1], 0, 0);
        vel = new Point3d(0, 0, planets_data[i + 4]);
        radius = planets_data[i + 2];
        mass = planets_data[i + 3];
        color = planets_data[i + 5];
        planet = new Planet(name, radius, mass, pos, vel, color);
        this.planets.push(planet);
        planet.print();
      }
      return this.sun = this.planets[0];
    };

    SolarSystem.prototype.step = function(dt) {
      var planet, _i, _len, _ref, _results;
      _ref = this.planets;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        planet = _ref[_i];
        if (planet !== this.sun) this.update_planet(planet, dt);
        _results.push(planet.draw());
      }
      return _results;
    };

    SolarSystem.prototype.update_planet = function(planet, dt) {
      var acc, diff_vel, distance, radius;
      radius = planet.pos;
      distance = radius.distance();
      acc = (-G * this.sun.mass) / distance;
      diff_vel = radius.divided(Math.sqrt(distance));
      diff_vel = diff_vel.multiply(acc * dt);
      planet.vel = planet.vel.plus(diff_vel);
      return planet.pos = planet.pos.plus(planet.vel.multiply(dt));
    };

    SolarSystem.prototype.print = function() {
      var planet, _i, _len, _ref, _results;
      _ref = this.planets;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        planet = _ref[_i];
        _results.push(planet.print());
      }
      return _results;
    };

    return SolarSystem;

  })();

  Simulation = (function() {

    function Simulation() {
      this.clear_canvas = __bind(this.clear_canvas, this);
      this.display_info = __bind(this.display_info, this);
      this.step = __bind(this.step, this);
      this.set_step = __bind(this.set_step, this);
      this.stop = __bind(this.stop, this);
      this.start = __bind(this.start, this);      this.current_time = 0;
      this.solar_system = new SolarSystem;
      this.simulation_running = false;
    }

    Simulation.prototype.start = function() {
      if (this.simulation_running) return;
      this.current_time = 0;
      this.simulation_running = true;
      this.solar_system.load();
      return this.step();
    };

    Simulation.prototype.stop = function() {
      return this.simulation_running = false;
    };

    Simulation.prototype.set_step = function() {
      hours_per_step = 1 * document.getElementById("hours_per_step").value;
      return dt = 3600 * hours_per_step;
    };

    Simulation.prototype.step = function() {
      this.clear_canvas();
      this.current_time += dt / 3600;
      this.solar_system.step(dt);
      this.display_info();
      if (this.simulation_running) return setTimeout(this.step, refresh_rate);
    };

    Simulation.prototype.display_info = function() {
      var days, time_in_days, years;
      time_in_days = Math.floor(this.current_time / 24);
      days = time_in_days % 365;
      years = Math.floor(time_in_days / 365.25);
      canvas.save();
      canvas.setTransform(1, 0, 0, 1, 0, 0);
      canvas.fillText("" + years + " years, " + days + " days ", 10, 20);
      return canvas.restore();
    };

    Simulation.prototype.clear_canvas = function() {
      canvas.save();
      canvas.setTransform(1, 0, 0, 1, 0, 0);
      canvas.clearRect(0, 0, canvas_element.width, canvas_element.height);
      return canvas.restore();
    };

    return Simulation;

  })();

  canvas_element = document.getElementById("main");

  canvas = canvas_element.getContext("2d");

  canvas_element.width = window.innerWidth * 0.95;

  canvas_element.height = window.innerHeight * 0.8;

  simulation = new Simulation;

  document.getElementById("start_button").addEventListener("click", simulation.start);

  document.getElementById("stop_button").addEventListener("click", simulation.stop);

  document.getElementById("hours_per_step").addEventListener("change", simulation.set_step);

  simulation.start();

  window.onresize = function(event) {
    canvas_element.width = window.innerWidth * 0.95;
    return canvas_element.height = window.innerHeight * 0.8;
  };

  scale = 1;

  originx = 0;

  originy = 0;

  canvas_element.onmousewheel = function(event) {
    var mousex, mousey, wheel, zoom;
    mousex = event.clientX - canvas.offsetLeft;
    mousey = event.clientY - canvas.offsetTop;
    wheel = event.wheelDelta / 120;
    zoom = 1 + wheel / 8;
    canvas.translate(originx, originy);
    canvas.scale(zoom, zoom);
    canvas.translate(-(mousex / scale + originx - mousex / (scale * zoom)), -(mousey / scale + originy - mousey / (scale * zoom)));
    originx = mousex / scale + originx - mousex / (scale * zoom);
    originy = mousey / scale + originy - mousey / (scale * zoom);
    return scale *= zoom;
  };

}).call(this);
