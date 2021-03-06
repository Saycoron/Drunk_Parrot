const SerialPort = require('serialport')
const arDrone = require("ar-drone")
const drone = arDrone.createClient()
let bVolando
//-------------------------------------------------------------------- SerialPort
const ReadLine = SerialPort.parsers.Readline

const port = new SerialPort("COM8", { baudRate: 9600 })
const parser = port.pipe(new ReadLine({ delimiter: '\r\n' }))

parser.on('open', function () { console.log('Se encuentra abierta la conexion') })
parser.on('data', function (data) { selectorDeVar(data) })
//--------------------------------------------------------------------

//-------------------------------------------------------------------- Movimientos
function despegar () {
  drone.stop()
  //drone.config("control:altitude_max", 100000);
  drone.takeoff()
}

function aterrizar () {
    drone.stop()
    drone.land()
}

function fuerza (sFuerza) {
  if (sFuerza == "+") { drone.up(1) }
  if (sFuerza == "-") { drone.down(1) }
}

function adelantarRetroceder (sDireccion) {
  drone.stop()
  if (sDireccion == "ADE") { drone.front(1) }
  if (sDireccion == "RET") { drone.back(1) }
}

function strafe (sDireccion) {
  drone.stop()
  if (sDireccion == "IZQ") { drone.left(1) }
  if (sDireccion == "DER") { drone.right(1) }
}

function rotar (sDireccion) {
  if (sDireccion == "IZQ") { drone.counterClockwise(1) }
  if (sDireccion == "DER") { drone.clockwise(1) }
}

function calibrarBrujula () {
  drone.stop()
  drone.calibrate(1)
}
//--------------------------------------------------------------------

//-------------------------------------------------------------------- Interpretar datos Arduino
function selectorDeVar (sDatosArduino) {
  let sDatos = sDatosArduino
  let sDatosPrefijo = sDatos.substring(0, 4)
  let iLargoDatos = sDatos.length
  let sDatosFinal = sDatos.substring(4, iLargoDatos)

  console.log(sDatosArduino)

  if (sDatosPrefijo == "#00#") { 
    if (sDatosFinal == "0") { 
      despegar()
      bVolando = true
      console.log("Volando")
    } else {
      aterrizar()
      bVolando = false
      console.log("Aterrizando")
    } 
  }

  if (sDatosPrefijo == "#01#") { 
    // X = arriba abajo(arriba =1023, abajo 0, medio 510)
    sDatosFinal = parseInt(sDatosFinal)
    if (sDatosFinal <= 400) { 
      fuerza("-")
    } else if (sDatosFinal >= 600) {
      fuerza("+")
    } else { drone.stop() }
  }
  
  if (sDatosPrefijo == "#02#") { 
    // Y = izquierda derecha (izquierda =0, derecha 1023, medio 533)
    sDatosFinal = parseInt(sDatosFinal)
    if (sDatosFinal <= 400) { 
      rotar("IZQ")
    } else if (sDatosFinal >= 600) {
      rotar("DER")
    } else { drone.stop() }
  
  }
  if (sDatosPrefijo == "#03#") { 
    // Pitch(adelante-30 a -90, atras 30 a 90, medio -30 a 30)
    sDatosFinal = parseInt(sDatosFinal)
    if (sDatosFinal <= -30) { 
      adelantarRetroceder("ADE")
    } else if (sDatosFinal >= 30) {
      adelantarRetroceder("RET")
    } else { drone.stop() }
  }
  if (sDatosPrefijo == "#04#") { 
    // Roll(derecha -30 a -90, izquierda 30 a 90, medio -30 a 30)
    sDatosFinal = parseInt(sDatosFinal)
    if (sDatosFinal <= -30) { 
      strafe("DER")
    } else if (sDatosFinal >= 30) {
      strafe("IZQ")
    } else { drone.stop() }  
  } 
  if (sDatosPrefijo == "#06#") {  }
}
