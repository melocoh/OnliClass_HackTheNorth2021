$(document).ready(function() {

  console.log("Initializing Firepad Variables");
  
  // Initialize the Firebase SDK.
  firebase.initializeApp({
      apiKey: "AIzaSyAahnvh9EVU1sMGP0UHbdnUpA1teVrJ5jY",
      databaseURL: "https://firepad-5d082-default-rtdb.firebaseio.com"
  });

  // Get Firebase Database reference.
  const firepadRef = firebase.database().ref();

  // Create CodeMirror (with lineWrapping on).
  const codeMirror = CodeMirror(document.getElementById('firepad'), {
      lineWrapping: true
  });

  // Create Firepad (with rich text toolbar and shortcuts enabled).
  const firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
      richTextShortcuts: true,
      richTextToolbar: true,
      defaultText: 'Hello, World!'
  });

  // Desmos code
  let elt = document.getElementById('calculator');
  let calculator = Desmos.GraphingCalculator(elt);
  calculator.setExpression({
      id: 'graph1',
      latex: 'y=x^2'
  });

});