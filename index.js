const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const time = document.querySelector('#timer')

canvas.width = 840
canvas.height = 840

// Timer Shenanigans
//Beginning timers
var timeStart = Date.now()
var painMeterStart = Date.now()
var painMeterMaxTime =  30000
var timeElapsed = timeStart


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
    // c.fillStyle = 'blue'
    // c.fillRect(this.position.x, this.position.y, this.width, this.height)

    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class Player {
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity
    this.radius = 15
    this.radians = 0.75
    this.openRate = 0.12
    this.rotation = 0
  }

  draw() {
    c.save()
    c.translate(this.position.x, this.position.y)
    c.rotate(this.rotation)
    c.translate(-this.position.x, -this.position.y)
    c.beginPath()
    c.arc(
      this.position.x,
      this.position.y,
      this.radius,
      this.radians,
      Math.PI * 2 - this.radians
    )
    c.lineTo(this.position.x, this.position.y)
    c.fillStyle = 'yellow'
    c.fill()
    c.closePath()
    c.restore()
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
  constructor({ position, coordinates}) {
    this.position = position
    this.radius = 3
    this.coordinates = coordinates
  }

  draw() {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = 'white'
    c.fill()
    c.closePath()
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
    ['g', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'g'],
    ['g', ' ', 'g', 'S', 'g', 'S', 'g', ' ', 'g', 'N', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g'],
    ['g', ' ', ' ', '.', ' ', '.', 'E', '.', 'g', ' ', 'g', '.', 'g', ' ', 'E', '.', ' ', '.', 'W', ' ', 'g'],
    ['g', ' ', 'g', 'g', ' ', 'g', 'g', ' ', 'g', ' ', 'g', 'N', 'g', ' ', 'g', 'g', ' ', 'g', 'g', ' ', 'g'],
    ['g', ' ', 'E', '.', ' ', 'E', '.', ' ', 'g', ' ', 'E', '.', 'g', ' ', '.', 'W', ' ', '.', 'W', ' ', 'g'],
    ['g', ' ', 'g', 'S', ' ', 'g', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g', 'g', 'g', 'S', 'g', ' ', 'g'],
    ['g', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', ' ', '.', ' ', ' ', 'g'],
    ['g', ' ', 'g', 'g', 'g', ' ', 'g', ' ', 'g', 'g', 'g', ' ', 'g', ' ', 'g', 'N', 'g', 'g', 'g', ' ', 'g'],
    ['g', '.', 'W', 'C', 'g', ' ', 'E', '.', 'g', 'C', 'g', '.', ' ', ' ', ' ', ' ', ' ', 'E', '.', ' ', 'g'],
    ['g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g', 'N', 'g', ' ', 'g', 'g', ' ', 'g', 'g', ' ', 'g'],
    ['g', ' ', ' ', ' ', 'g', '.', ' ', '.', 'W', ' ', ' ', '.', ' ', ' ', 'g', 'C', ' ', 'E', '.', ' ', 'g'],
    ['g', ' ', 'g', 'g', 'g', 'N', 'g', ' ', 'g', ' ', 'g', 'N', 'g', ' ', 'g', 'g', 'g', 'g', 'g', ' ', 'g'],
    ['g', ' ', ' ', '.', ' ', '.', ' ', ' ', ' ', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'g'],
    ['g', ' ', 'g', 'N', 'g', 'N', 'g', ' ', 'g', 'S', ' ', 'N', 'g', ' ', 'g', 'g', ' ', 'g', 'g', ' ', 'g'],
    ['g', ' ', ' ', ' ', ' ', '.', ' ', ' ', 'g', '.', ' ', ' ', ' ', ' ', 'g', 'C', ' ', '.', 'W', ' ', 'g'],
    ['g', ' ', 'g', ' ', 'g', 'N', 'g', ' ', 'g', ' ', 'g', '.', 'W', ' ', 'g', 'g', 'g', ' ', 'g', ' ', 'g'],
    ['g', ' ', ' ', '.', 'W', 'C', 'g', '.', 'W', '.', ' ', ' ', ' ', ' ', ' ', '.', 'W', ' ', 'g', ' ', 'g'],
    ['g', ' ', 'g', 'g', 'g', ' ', 'g', ' ', 'g', 'N', 'g', 'S', 'g', ' ', 'g', ' ', 'g', ' ', 'g', ' ', 'g'],
    ['g', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'H'],
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
        case 'C':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/store-available.png')
                })
            )
            break
      case '2':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner2.png')
          })
        )
        break
      case '3':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner3.png')
          })
        )
        break
      case '4':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner4.png')
          })
        )
        break
      case 'b':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/block.png')
          })
        )
        break
      case '[':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capLeft.png')
          })
        )
        break
      case ']':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capRight.png')
          })
        )
        break
      case '_':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capBottom.png')
          })
        )
        break
      case '^':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capTop.png')
          })
        )
        break
      case '+':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeCross.png')
          })
        )
        break
      case '5':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorTop.png')
          })
        )
        break
      case '6':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorRight.png')
          })
        )
        break
      case '7':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorBottom.png')
          })
        )
        break
      case '8':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeConnectorLeft.png')
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

      case 'p':
        powerUps.push(
          new PowerUp({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2
            }
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


    if (keys.w.pressed && lastKey === 'w') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: 0,
              y: -5
            }
          },
          rectangle: boundary
        })
      ) {
        player.velocity.y = 0
        break
      } else {
        player.velocity.y = -5
      }
    }
  } else if (keys.a.pressed && lastKey === 'a') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: -5,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        player.velocity.x = 0
        break
      } else {
        player.velocity.x = -5
      }
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
              y: 5
            }
          },
          rectangle: boundary
        })
      ) {
        player.velocity.y = 0
        break
      } else {
        player.velocity.y = 5
      }
    }
  } else if (keys.d.pressed && lastKey === 'd') {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        circleCollidesWithRectangle({
          circle: {
            ...player,
            velocity: {
              x: 5,
              y: 0
            }
          },
          rectangle: boundary
        })
      ) {
        player.velocity.x = 0
        break
      } else {
        player.velocity.x = 5
      }
    }
  }

  // win condition goes here
  if (pellets.length === 0) {
    console.log('you win')
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
      pellets.splice(i, 1)
      score += 10
      scoreEl.innerHTML = score
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

    var barHeight = 100 * (currPain / painMeterMaxTime);
    bar.style.height = 100-barHeight + "%";
    bar.innerHTML = Math.round(barHeight) + "%";
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