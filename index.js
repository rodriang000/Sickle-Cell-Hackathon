const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const time = document.querySelector('#timer')
const crisisTime = document.querySelector('#crisisTimer')

canvas.width = 840
canvas.height = 840

var animateIndex = 0
var faceLeft = false

// Timer Shenanigans
//Beginning timers
var timeStart = Date.now()
var timeElapsed = timeStart

var painMeterStart = Date.now()
var healMeterStart = Date.now()
var crisisMeterStart = Date.now()
var painMeterMaxTime = 30000
var healMeterTime = 20000
var crisisMeterTime = 40000

var barHeight = 100
var speed = 4

var status = "stressIncrease"

var spriteLA = new Image(32, 32)
spriteLA.src = "./img/left-png/fnum1.png";
var spriteLB = new Image(32, 32)
spriteLB.src = "./img/left-png/fnum2.png";
var spriteLC = new Image(32, 32)
spriteLC.src = "./img/left-png/fnum3.png";
var spriteLD = new Image(32, 32)
spriteLD.src = "./img/left-png/fnum4.png";
var spriteLE = new Image(32, 32)
spriteLE.src = "./img/left-png/fnum5.png";
var spriteLF = new Image(32, 32)
spriteLF.src = "./img/left-png/fnum6.png";

var spriteRA = new Image(32, 32)
spriteRA.src = "./img/right-png/fnum1.png";
var spriteRB = new Image(32, 32)
spriteRB.src = "./img/right-png/fnum2.png";
var spriteRC = new Image(32, 32)
spriteRC.src = "./img/right-png/fnum3.png";
var spriteRD = new Image(32, 32)
spriteRD.src = "./img/right-png/fnum4.png";
var spriteRE = new Image(32, 32)
spriteRE.src = "./img/right-png/fnum5.png";
var spriteRF = new Image(32, 32)
spriteRF.src = "./img/right-png/fnum6.png";

var hackyAnimationTime = Date.now()

var boxSfx = [new Audio("./sfx/box1.mp3"), new Audio("./sfx/box2.mp3"), new Audio("./sfx/box3.mp3")]

var songNormal = new Audio("./sfx/songNormal.mp3")
songNormal.volume = 0.4
songNormal.loop = true

var songInit = false

var sadSong = new Audio("./sfx/sadSong.mp3")
sadSong.volume = 0.5
sadSong.loop = true


var painAudio = new Audio("./sfx/pain.wav")

var spriteLeftArray = [spriteLA, spriteLB, spriteLC, spriteLD, spriteLE, spriteLF]
var spriteRightArray = [spriteRA, spriteRB, spriteRC, spriteRD, spriteRE, spriteRF]

class Boundary {
  static width = 40
  static height = 40
  constructor({ position, image, key}) {
    this.position = position
    this.width = 40
    this.height = 40
    this.image = image
    this.key = key
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class Player {
  constructor({ position, velocity, packages = 5 }) {
    this.position = position
    this.velocity = velocity
    this.radius = 15
    this.radians = 0.75
    this.openRate = 0.12
    this.rotation = 0
    this.packages = packages
  }

    draw() {
        if (Date.now() - hackyAnimationTime > (200 / speed)) {
         animateIndex++
         if (animateIndex > 5) {
             animateIndex = 0
         }
         hackyAnimationTime = Date.now()
     }
     if (this.velocity.x > 0) {
         faceLeft = false
     }
     if (this.velocity.x < 0) {
         faceLeft = true
     }
     if (faceLeft) {
         c.drawImage(spriteLeftArray[animateIndex], this.position.x - 16,
             this.position.y - 16)
     }
     else {
         c.drawImage(spriteRightArray[animateIndex], this.position.x - 16,
             this.position.y - 16)
     }
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.radians < 0 || this.radians > 0.75) this.openRate = -this.openRate

    this.radians += this.openRate
  }
}


class Pellet {
  constructor({ position, coordinates, key = " ", enabled = false}) {
    this.position = position
    this.radius = 3
    this.coordinates = coordinates
    this.key = key
    this.enabled = enabled
  }

  draw() {
    switch (this.key) {
      case 'h':
        c.drawImage(createImage('./img/heal.png'), this.position.x - 20, this.position.y - 20)
        break
      case 'p':
        c.drawImage(createImage('./img/package-pickup.png'), this.position.x - 20, this.position.y - 20)
        break
      case 'w':
          c.drawImage(createImage('./img/store-available.png'), this.position.x - 20, this.position.y- 20)
        break
      case '':
        break
      default:
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
  }
}

class PowerUp {
  constructor({ position }) {
    this.position = position
    this.radius = 8
  }

  draw() {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = 'white'
    c.fill()
    c.closePath()
  }
}

const pellets = []
const boundaries = []
const powerUps = []
const player = new Player({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2
  },
  velocity: {
    x: 0,
    y: 0
  }
})
const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

let lastKey = ''
let score = 0

const map = [
    ['g', 'P', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'],
    ['g', 'p', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'g'],
    ['g', ' ', 'g', 'S', 'g', 'S', 'g', ' ', 'g', 'N', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g'],
    ['g', ' ', ' ', '.', ' ', '.', 'E', '.', 'g', 'w', 'g', '.', 'g', ' ', 'E', '.', ' ', '.', 'W', ' ', 'g'],
    ['g', ' ', 'g', 'g', ' ', 'g', 'g', ' ', 'g', ' ', 'g', 'N', 'g', ' ', 'g', 'g', ' ', 'g', 'g', ' ', 'g'],
    ['g', ' ', 'E', '.', ' ', 'E', '.', ' ', 'g', ' ', 'E', '.', 'g', ' ', '.', 'W', ' ', '.', 'W', ' ', 'g'],
    ['g', ' ', 'g', 'S', ' ', 'g', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g', 'g', 'g', 'S', 'g', ' ', 'g'],
    ['g', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', ' ', '.', ' ', ' ', 'g'],
    ['g', ' ', 'g', 'g', 'g', ' ', 'g', ' ', 'g', 'g', 'g', ' ', 'g', ' ', 'g', 'N', 'g', 'g', 'g', ' ', 'g'],
    ['g', '.', 'W', 'w', 'g', ' ', 'E', '.', 'g', 'w', 'g', '.', ' ', ' ', ' ', ' ', ' ', 'E', '.', ' ', 'g'],
    ['g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g', 'N', 'g', ' ', 'g', 'g', ' ', 'g', 'g', ' ', 'g'],
    ['g', ' ', ' ', ' ', 'g', '.', ' ', '.', 'W', ' ', ' ', '.', ' ', ' ', 'g', 'w', ' ', 'E', '.', ' ', 'g'],
    ['g', ' ', 'g', 'g', 'g', 'N', 'g', ' ', 'g', ' ', 'g', 'N', 'g', ' ', 'g', 'g', 'g', 'g', 'g', ' ', 'g'],
    ['g', ' ', ' ', '.', ' ', '.', ' ', ' ', ' ', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'g'],
    ['g', ' ', 'g', 'N', 'g', 'N', 'g', ' ', 'g', 'S', ' ', 'N', 'g', ' ', 'g', 'g', ' ', 'g', 'g', ' ', 'g'],
    ['g', ' ', ' ', ' ', ' ', '.', ' ', ' ', 'g', '.', ' ', ' ', ' ', ' ', 'g', 'w', ' ', '.', 'W', ' ', 'g'],
    ['g', ' ', 'g', ' ', 'g', 'N', 'g', ' ', 'g', ' ', 'g', '.', 'W', ' ', 'g', 'g', 'g', ' ', 'g', ' ', 'g'],
    ['g', ' ', ' ', '.', 'W', 'w', 'g', '.', 'W', '.', ' ', ' ', ' ', ' ', ' ', '.', 'W', ' ', 'g', ' ', 'g'],
    ['g', ' ', 'g', 'g', 'g', ' ', 'g', ' ', 'g', 'N', 'g', 'S', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g'],
    ['g', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'h', 'H'],
    ['g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g']
]

function createImage(src) {
  const image = new Image()
  image.src = src
  return image
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case '-':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeHorizontal.png')
          })
        )
        break
      case 'g':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/grass.png')
          })
        )
        break
        case 'S':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i,
                    },
                    image: createImage('./img/house-south.png'),
                    key: 'S'
                })
            )
            // console.log("S: ", "[", [i], ",", [j], "]" )
            // console.log(boundaries.length - 1)
            break
        case 'N':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/house-north.png'),
                    key: 'N'
                })
            )
            // console.log("N: ", "[", [i], ",", [j], "]" )
            // console.log(boundaries.length - 1)

            break
        case 'E':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/house-east.png'),
                    key: 'E'
                })
            )
            // console.log("E: ", "[", [i], ",", [j], "]" )
            // console.log(boundaries.length - 1)
            break
        case 'W':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/house-west.png')
                })
            )
            // console.log("W: ", "[", [i], ",", [j], "]" )
            // console.log(boundaries.length - 1)

            break
        case 'H':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/hospital.png')
                })
            )
            break
        case 'P':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/home.png')
                })
            )
            break
      case '.':
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2
            },
            coordinates: i.toString() + "," + j.toString()
          })
        )
        break
        case 'h':
          pellets.push(
            new Pellet({
              position: {
                x: j * Boundary.width + Boundary.width / 2,
                y: i * Boundary.height + Boundary.height / 2
              },
              key : 'h'
            })
          )
          break
        case 'p':
          pellets.push(
            new Pellet({
              position: {
                x: j * Boundary.width + Boundary.width / 2,
                y: i * Boundary.height + Boundary.height / 2
              },
              key : 'p'
            })
          )
          break
          case 'w':
            pellets.push(
              new Pellet({
                position: {
                  x: j * Boundary.width + Boundary.width / 2,
                  y: i * Boundary.height + Boundary.height / 2
                },
                key : 'w'
              })
            )
            break
    }
  })
})

function circleCollidesWithRectangle({ circle, rectangle }) {
  const padding = Boundary.width / 2 - circle.radius - 1
  return (
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x - padding &&
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y - padding &&
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  )
}

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.clearRect(0, 0, canvas.width, canvas.height)

    //constantly updates speed of current direction.
    if (player.velocity.x > 0) {
        player.velocity.x = speed
    }
    if (player.velocity.x < 0) {
        player.velocity.x = -speed
    }
    if (player.velocity.y > 0) {
        player.velocity.y = speed
    }
    if (player.velocity.y < 0) {
        player.velocity.y = -speed
    }
    //Does legit updates
    if (keys.w.pressed && lastKey === 'w') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: -speed
            }
          },
          rectangle: boundary
        })
      ) {
        player.velocity.y = 0
        break
      } else {
          player.velocity.y = -speed
        }
        }
        //Hack for init song
        if (!songInit) {
            songNormal.play()
            songInit = true;
        }
  } else if (keys.a.pressed && lastKey === 'a') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: -speed,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        player.velocity.x = 0
        break
      } else {
          player.velocity.x = -speed
        }

        }
        //Hack for init song
        if (!songInit) {
            songNormal.play()
            songInit = true;
        }
  } else if (keys.s.pressed && lastKey === 's') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: speed
            }
          },
          rectangle: boundary
        })
      ) {
        player.velocity.y = 0
        break
      } else {
        player.velocity.y = speed
      }
        }
        //Hack for init song
        if (!songInit) {
            songNormal.play()
            songInit = true;
        }
  } else if (keys.d.pressed && lastKey === 'd') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: speed,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        player.velocity.x = 0
        break
      } else {
        player.velocity.x = speed
      }
        }
        //Hack for init song
        if (!songInit) {
            songNormal.play()
            songInit = true;
        }
  }

  // win condition goes here
  if (pellets.length === 0) {
      console.log('you win')
      var winSfx = new Audio("./sfx/LevelComplete.mp3");
      winSfx.play();
      cancelAnimationFrame(animationId)
  }

  // touch pellets here
  for (let i = pellets.length - 1; 0 <= i; i--) {
    const pellet = pellets[i]
    pellet.draw()
    if (
      Math.hypot(
        pellet.position.x - player.position.x,
        pellet.position.y - player.position.y
      ) <
      pellet.radius + player.radius
    ) {
      if (pellet.key == 'w') {
        //TODO: Implement w logic
        // Decreases stress 10%
        // Remove 15 percent
        pellets.splice(i, 1)
         console.log(barHeight)
         var waterSfx = new Audio("./sfx/water.mp3")
      }
      if (pellet.key == 'h') {
        // TODO: implement h logic
          var healSfx = new Audio("./sfx/Hospital.mp3")
          healSfx.play()
      } else if (pellet.key == 'p') {
        player.packages = 5
      } else {
        if (player.packages > 0) {
          pellets.splice(i, 1)
          score += 10
          scoreEl.innerHTML = score
          player.packages -= 1

          boxSound = boxSfx[Math.floor(Math.random() * 3)]
          boxSound.play();
        } else {
          console.log("You need more packages!")
        }
      }
    }
  }

  boundaries.forEach((boundary) => {
    boundary.draw()

    if (
      circleCollidesWithRectangle({
        circle: player,
        rectangle: boundary
      })
    ) {
      player.velocity.x = 0
      player.velocity.y = 0
    }
  })
  player.update()

  if (player.velocity.x > 0) player.rotation = 0
  else if (player.velocity.x < 0) player.rotation = Math.PI
  else if (player.velocity.y > 0) player.rotation = Math.PI / 2
  else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5

  var delta = Date.now() - timeStart; // milliseconds elapsed since start
  time.innerHTML = Math.round(delta / 1000);

    var bar = document.getElementById("painBar");

    var currPain = Date.now() - painMeterStart;
    if (currPain > painMeterMaxTime) {
        currPain = painMeterMaxTime
    }

    var currHeal = Date.now() - healMeterStart;
    if (currHeal > healMeterTime) {
        currHeal = healMeterTime
    }

    var currCrisis = Date.now() - crisisMeterStart;
    if (currCrisis > crisisMeterTime) {
        currCrisis = crisisMeterTime
    }

    if (status == "stressIncrease") {
        barHeight = 100 * (currPain / painMeterMaxTime);
        if (barHeight >= 100) {
            status = "crisis"
            crisisMeterStart = Date.now()
            painAudio.play()
            songNormal.pause()
            sadSong.play()
        }
    }
    else if (status == "crisis") {
        barHeight = 100
        if (currCrisis >= crisisMeterTime) {
            status = "crisisHealing"
            healMeterStart = Date.now()
            sadSong.pause()
            songNormal.play()
        }
        crisisTime.innerHTML = Math.round((crisisMeterTime - currCrisis) / 1000)
    }
    else if (status == "crisisHealing") {
        barHeight = 100 - (100* (currHeal / healMeterTime))
        if (barHeight <= 0) {
            status = "stressIncrease"
            painMeterStart = Date.now()
        }
    }

    bar.style.height = 100 - barHeight + "%";
    bar.innerHTML = Math.round(barHeight) + "%";
    speed = 4 - ( 4 * (barHeight /  100))
    if (speed < .5) {
        speed = .5
    }
} // end of animate()

animate()

addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break
    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break
    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break
  }
})

addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'w':
      keys.w.pressed = false

      break
    case 'a':
      keys.a.pressed = false

      break
    case 's':
      keys.s.pressed = false

      break
    case 'd':
      keys.d.pressed = false

      break
  }
})