###########################################
# Globals 
###########################################
#Gravitation force constant
G = 6.6742e-11
#Initial drawing scale
DRAW_SCALE = 9e-10
#hours the universe advance every step
hours_per_step = 30
# actual variable used in physics (we use seconds)
dt = 3600 * hours_per_step
#refresh rate in ms
refresh_rate = 20

planets_data = [
  "Sun",0,695000000,1.989E+030,0, "yellow"
  "Mercury",57900000000,2440000,3.33E+023,47900, "gray"
  "Venus",108000000000,6050000,4.869E+024,35000, "red"
  "Earth",150000000000,6378140,5.976E+024,29800, "blue"
  "Mars",227940000000,3397200,6.421E+023,24100, "red"
  "Jupiter",778330000000,71492000,1.9E+027,13100, "brown"
  "Saturn",1429400000000,60268000,5.688E+026,9640, "gray"
  "Uranus",2870990000000,25559000,8.686E+025,6810, "gray"
  "Neptune",4504300000000,24746000,1.024E+026,5430, "yellow"
  "Pluto",5913520000000,1137000,1.27E+022,4740, "black"
]




###########################################
# A Point in 3D space, very badly programmed but 
# it seems I can not define -, +, *, / in CS 
###########################################
class Point3d
  constructor: (@x, @y, @z) ->

  print: () ->
    console.log " x: #{@x}, y: #{@y}, z: #{@z} "
 
  minus: (p) ->
    new Point3d(@x - p.x, @y - p.y, @z - p.z)

  plus: (p) ->
    new Point3d(@x + p.x, @y + p.y, @z + p.z)

  divided: (p) ->
    new Point3d(@x / p, @y / p, @z / p)

  multiply: (p) ->
    new Point3d(@x * p, @y * p, @z * p)

  distance: () ->
    @x*@x + @y*@y + @z*@z


###########################################
# A planet 
###########################################
class Planet
  constructor: (@name, @radius, @mass, @pos, @vel, @color ) ->

  draw: () ->
    scaled_center_x = (canvas_element.width / 2 ) / scale
    scaled_center_y = (canvas_element.height / 2 ) / scale
    center_x = Math.floor( scaled_center_x + @pos.x * DRAW_SCALE )
    center_y = Math.floor( scaled_center_y + @pos.z * DRAW_SCALE )
    #happens when canvas_element not yet initialized
    return if isNaN(center_x) or isNaN(center_y)
    radius = @radius * DRAW_SCALE * 40
    if @name isnt "Sun"
      radius *= 10

    canvas.beginPath()
    canvas.arc(center_x, center_y, radius, 0, 2 * Math.PI, false)
    canvas.fillStyle = @color
    canvas.fill()
    canvas.lineWidth = 1
    canvas.strokeStyle = "black"
    canvas.stroke()

    if @name isnt "Sun"
      below = center_y + radius + 5
      canvas.fillText(@name, center_x, below)
      #alert(center_x)
      #canvas.fillText(@name, Math.floor(center_x), 10)

  print: () ->
    #console.log @name, @pos


###########################################
# The solar system
###########################################
class SolarSystem
  constructor: () ->

  load: () ->
    @planets = []
    for planet_data, i in planets_data by 6
      name = planets_data[i]
      pos = new Point3d(planets_data[i + 1], 0,0)
      vel = new Point3d(0, 0, planets_data[i + 4])
      radius = planets_data[i+2]
      mass = planets_data[i+3]
      color = planets_data[i+5]
      planet = new Planet(name, radius, mass, pos, vel, color)
      @planets.push planet
      planet.print()
    @sun = @planets[0]

  step: (dt) ->
    for planet in @planets
      if planet isnt @sun
        this.update_planet(planet, dt)
      planet.draw()

  update_planet: (planet, dt) ->
    radius = planet.pos
    distance = radius.distance()
    acc = (-G * @sun.mass) / distance
    diff_vel = radius.divided( Math.sqrt(distance))
    diff_vel = diff_vel.multiply( acc * dt)
    planet.vel  = planet.vel.plus( diff_vel )
    planet.pos = planet.pos.plus( planet.vel.multiply(dt) )

  print: () ->
    for planet in @planets
      planet.print()
 


###########################################
# Control and display of the simulation
###########################################
class Simulation
  constructor: () ->
    @current_time = 0
    @solar_system = new SolarSystem
    @simulation_running = false
    
  start: () =>
    return if @simulation_running
    @current_time = 0
    @simulation_running = true
    @solar_system.load()
    this.step()

  stop: () =>
    @simulation_running = false

  step: () =>
    this.clear_canvas()

    @current_time += (dt /3600)
    @solar_system.step(dt)
    this.display_info()
    if (@simulation_running)
      setTimeout(this.step, refresh_rate)

  display_info: () =>
    time_in_days = Math.floor(@current_time / 24)
    days = time_in_days % 365
    years = Math.floor( time_in_days / 365.25 )
    canvas.save()
    canvas.setTransform(1,0,0,1,0,0)
    canvas.fillText("#{years} years, #{days} days ", 10, 20)
    canvas.restore()

  #this can go to a canvas class
  clear_canvas: =>
    canvas.save()
    canvas.setTransform(1,0,0,1,0,0)
    canvas.clearRect(0, 0, canvas_element.width, canvas_element.height)
    canvas.restore()


canvas_element = document.getElementById("main")
canvas = canvas_element.getContext "2d"


simulation = new Simulation
document.getElementById("start_button").addEventListener "click", simulation.start
document.getElementById("stop_button").addEventListener "click", simulation.stop

simulation.start()



#####################################
# Zoom for the canvas. 
# scale variable is used by the planets to render correctly
# TODO: this is kind of thrown away here
#####################################

scale = 1
originx = 0
originy = 0

canvas_element.onmousewheel = (event) ->
  mousex = event.clientX - canvas.offsetLeft
  mousey = event.clientY - canvas.offsetTop
  wheel = event.wheelDelta/120

  zoom = 1 + wheel/8

  canvas.translate( originx, originy)

  canvas.scale(zoom,zoom)
  canvas.translate(
        -( mousex / scale + originx - mousex / ( scale * zoom ) ),
        -( mousey / scale + originy - mousey / ( scale * zoom ) )
  )

  originx = ( mousex / scale + originx - mousex / ( scale * zoom ) )
  originy = ( mousey / scale + originy - mousey / ( scale * zoom ) )
  scale *= zoom
