$(document).ready(function() {

  console.log("Initializing canvas variables");
  const canvas = document.getElementById('whiteboard');
  const context = canvas.getContext('2d');

  let colorChoice = document.getElementById('colorChoice');
  let current = {
    color: colorChoice.value
  };

  let drawing = false;

  colorChoice.addEventListener('change', (event) => {
    current.color = colorChoice.value;
    console.log(color);
  });

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 20), false);
  
  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 20), false);

  socket.on('drawing', onDrawingEvent);

  socket.on('mouse', onMouseMovingEvent);

  /* Draw your own line, then emit the line you drew to others*/
  function drawLine(x0, y0, x1, y1, color, emit){

    console.log('drawining line');
    context.beginPath();

    /* We need to programmatically set this or hardcode this at the end XD */
    context.moveTo(x0 - 100, y0 - 75);
    context.lineTo(x1 - 100, y1 - 75);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }



  /* Listeners */
  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }


  /* Listeners */
  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
  }

   /* Listeners */
  function onMouseMove(e){

    let w = canvas.width;
    let h = canvas.height;
    if (!drawing) { 

        socket.emit('mouse', {
            x0: e.clientX / w,
            y0: e.clientY / h,
            name: "hardcode"
        });

        onDrawingEvent(); 
    }
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second

  // Helper function to limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent

  /* Socket.IO Listener (shows others) */
  function onMouseMovingEvent(data){

    let w = canvas.width;
    let h = canvas.height;

    element.style.left = data.x0 * w + 'px'
    element.style.top = data.y0 * h + 'px'

  }

  /* Socket.IO Listener (draws others)*/
  function onDrawingEvent(data){
    let w = canvas.width;
    let h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

});