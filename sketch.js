let getPrediction;
let img, bgImage;
let inputBox; // Input box for user input
let music;
let goodSound, mehSound, badSound;
let isMuted = false; 
let predictions = []; // Array to store prediction elements
let overlay; // For the black transparent background
let confetti = []; // Array to store confetti
let confettiTriggered = false; // Flag to track if confetti is triggered
let confettiDiv;
let canvas; // Declare canvas variable

// Barrel roll variables
let angle = 0;  // Angle for rotation
let rotationSpeed = 0.05;  // Speed of the barrel roll
let isBarrelRolling = false; // Flag to track if barrel roll is active
let totalAngle = 0;

let shakingCard = null; // Card that is currently shaking
let shakeDuration = 0;  // How long the screen shake should last
let shakeIntensity = 10;  // How strong the screen shake should be

// Prediction answers
let goodAnswers = [
  "It is certain", "Without a doubt", "You may rely on it",
  "Yes, definitely", "As I see it, yes", "Most likely",
  "Outlook good", "Yes", "Signs point to yes",
];
let mehAnswers = [
  "Reply hazy, try again", "Ask again later", "Better not tell you now",
  "Cannot predict now", "Concentrate and ask again",
];
let badAnswers = [
  "Don't count on it", "My reply is no", "My sources say no",
  "Outlook not so good", "Very doubtful"
];

// Stars for twinkling effect
let stars = [];
let numStars = 100;

function preload() {
  img = loadImage('assets/vending machine.svg'); 
  bgImage = loadImage('assets/background.svg');
  music = loadSound('assets/lofi-relax-chillhood-by-lofium.mp3');
  goodSound = loadSound('assets/tada-fanfare-a.mp3');
  mehSound = loadSound('assets/brass-fail-1-a.mp3');
  badSound = loadSound('assets/trumpet-fail.mp3');
}

function setup() {
  createCanvas(1440, 1024); // Store the canvas reference

  // Play the music in a loop
  music.loop();
  
  // Set volume to a desired level
  music.setVolume(0.5);

  if (!music.isPlaying()) {
    music.loop();
  }

  textFont("Pixelify Sans");
  textSize(120);
  fill(255); 
  textAlign(LEFT, CENTER); 
  
  // Create a confetti div
  confettiDiv = createDiv('');
  confettiDiv.style('position', 'absolute');
  confettiDiv.style('pointer-events', 'none'); // So it doesn’t block clicks
  confettiDiv.style('z-index', '2'); // Set a higher z-index
  confettiDiv.hide(); // Hide it initially
  
  overlay = createDiv('');
  overlay.position(0, 0);
  overlay.size(1440, 1024);
  overlay.style('background-color', 'rgba(0, 0, 0, 0.75)');
  overlay.style('z-index', '1');
  overlay.hide(); // Hide overlay initially

  // Create the input box
  input = createInput('');
  input.attribute('placeholder', 'Enter your question here...');
  input.position(width - 1350, (height - 120) / 2 + 80); 
  input.size(700, 60); // Set size of the input box
  input.style('font-size', '30px'); // Style the font size
  input.style('font-family', 'Roboto Mono');
  input.style('padding', '10px'); // Padding for the text
  input.style('border', '5px solid black'); // Style border

  getPrediction = createButton('Get Prediction');
  getPrediction.size(450, 100);
  getPrediction.position(width - 1200, (height - 120) / 2 + 200);
  getPrediction.mousePressed(buttonClicked);

  getPrediction.style('background-color', 'rgb(250, 89, 180)'); // Green background
  getPrediction.style('color', 'white'); // White text
  getPrediction.style('font-size', '50px'); // Larger font size
  getPrediction.style('border-width', '5px'); // Larger font size
  getPrediction.style('border-style', 'solid'); // Larger font size
  getPrediction.style('padding', '15px 10px'); // Padding
  getPrediction.style('text-align', 'center'); // Center text
  getPrediction.style('text-decoration', 'none'); // Remove underline
  getPrediction.style('display', 'inline-block'); // Inline block
  getPrediction.style('cursor', 'pointer'); // Pointer cursor on hover
  getPrediction.style('font-family', 'Pixelify Sans, sans-serif'); 

  overlay.mousePressed(() => {
    removePrediction();
  });

  // Create stars
  for (let i = 0; i < numStars; i++) {
    stars.push(new Star(random(width), random(height)));
  }
}

function draw() {
  background(bgImage);

  // Draw stars
  for (let star of stars) {
    star.update();
    star.display();
  }

  // Draw the vending machine image
  let imgX = width - img.width - 100;
  let imgY = (height - img.height) / 2;
  image(img, imgX, imgY);

  // Reset fill opacity before drawing text to prevent fading
  fill(255); // Reset fill to fully opaque white

  text('Magic Vending', 100, 240); 
  text('Machine', 100, 400); 

  // Create the instructions div
  instructionsDiv = createDiv('Press "M" to Mute Music<br>Click "Get Prediction" for a prediction<br>Click outside of the prediction to return<br>');
  instructionsDiv.position(width - 1350, height - 110); // Position it at the bottom
  instructionsDiv.style('font-family', 'Roboto Mono'); // Set font
  instructionsDiv.style('font-weight', '400'); // Set font
  instructionsDiv.style('font-size', '20px'); // Set font size
  instructionsDiv.style('color', 'black'); // Set text color
  instructionsDiv.style('text-align', 'left'); // Align text to the left
  instructionsDiv.style('z-index', '1'); // Ensure it's on top

  // Draw the overlay
  if (overlay && overlay.elt.style.display !== 'none') {
    overlay.show(); // Ensure overlay is visible
  }

  // Draw the prediction card last
  for (let prediction of predictions) {
    prediction.show(); // Ensure predictions are displayed

    // Apply shake effect to the card if needed
    if (prediction === shakingCard && shakeDuration > 0) {
      let shakeX = random(-shakeIntensity, shakeIntensity);
      let shakeY = random(-shakeIntensity, shakeIntensity);
      prediction.position((width - prediction.width) / 2 + shakeX, (height - prediction.height) / 2 - 30 + shakeY);
      shakeDuration--; // Reduce shake duration
    } else {
      prediction.position((width - prediction.width) / 2, (height - prediction.height) / 2 - 30); // Reset position when not shaking
    }

    if (isBarrelRolling) {
      // Apply rotation
      prediction.elt.style.transform = `rotate(${angle}rad)`;
    } else {
      prediction.elt.style.transform = 'rotate(0rad)'; // Reset rotation
    }
  }

  // Draw confetti as a separate div
  if (confettiTriggered) {
    confettiDiv.show(); // Show the confetti div
    confettiDiv.html(getConfettiHTML());
  } else {
    confettiDiv.hide(); // Hide when not triggered
  }

  // Update angle if barrel roll is active
  if (isBarrelRolling) {
    angle += rotationSpeed; // Increment the angle for barrel roll effect
    totalAngle += rotationSpeed; // Track total rotation

    // Stop after 1 spin
    if (totalAngle >= TWO_PI * 1) {
      isBarrelRolling = false; // Stop barrel roll
      totalAngle = 0; // Reset total angle
      angle = 0; // Reset angle
    }
  }
}

function keyPressed() {
  // Mute or unmute music when 'M' key is pressed
  if (key === 'M' || key === 'm') {
    if (isMuted) {
      music.setVolume(0.5); // Restore volume to unmute
      goodSound.setVolume(1);
      mehSound.setVolume(1);
      badSound.setVolume(1);
      isMuted = false;
    } else {
      music.setVolume(0); // Set volume to 0 to mute
      goodSound.setVolume(0);
      mehSound.setVolume(0);
      badSound.setVolume(0);
      isMuted = true;
    }
  }
}

// Function to create a prediction and overlay
function buttonClicked() {
  let userInput = input.value().trim(); // Get input value and trim whitespace

  // Clear the input box after getting the prediction
  input.value(''); // Set input box to an empty string

  overlay.show();

  let predictionType = floor(random(3));
  let predictionText = '';

  let sizeX = 700;
  let sizeY = 300;
  let x = (width - sizeX) / 2;
  let y = (height - sizeY) / 2;

  let newPrediction = createDiv();
  newPrediction.addClass('prediction');
  newPrediction.size(sizeX, sizeY);
  newPrediction.position(x, y);
  newPrediction.style('z-index', '2');

  newPrediction.style('display', 'flex');
  newPrediction.style('flex-direction', 'column'); // Stack text vertically
  newPrediction.style('justify-content', 'center'); // Center vertically
  newPrediction.style('align-items', 'center'); // Center horizontally

  drawCard(newPrediction, predictionType);

  if (predictionType === 0) {
    triggerConfetti();
    predictionText = random(goodAnswers);
    if (!goodSound.isPlaying()) {
      goodSound.play();
    }
  } else if (predictionType === 1) {
    predictionText = random(mehAnswers);
    isBarrelRolling = true; // Start barrel rolling effect for "meh"
    if (!mehSound.isPlaying()) {
      mehSound.play();
    }
  } else {
    predictionText = random(badAnswers);
    
    // Trigger the shake effect for bad answers
    shakingCard = newPrediction;
    shakeDuration = 50; // Shake for 30 frames

    if (!badSound.isPlaying()) {
      badSound.play();
    }
  }

  newPrediction.html(predictionText);
  newPrediction.style('overflow', 'visible'); // Allow text to wrap
  newPrediction.style('color', 'white');
  newPrediction.style('padding-top', '100px');
  newPrediction.style('font-size', '70px'); // Adjust font size as needed
  newPrediction.style('font-weight', 'bold');
  newPrediction.style('text-align', 'center'); // Center text
  newPrediction.style('max-width', '80%'); // Set a maximum width to allow wrapping
  newPrediction.style('font-family', '"Roboto Mono", sans-serif'); 

  predictions.push(newPrediction);
}

// Function to draw a grid of random colors in the specified element
function drawCard(newPrediction, predictionType) {
  let canvas = createGraphics(newPrediction.width, newPrediction.height);
  let gridSize = 50;

  let color1, color2;
  if (predictionType === 0) {
    color1 = color(183, 210, 91);
    color2 = color(69, 152, 132);
  } else if (predictionType === 1) {
    color1 = color(249, 201, 69);
    color2 = color(230, 148, 37);
  } else {
    color1 = color(253, 177, 194);
    color2 = color(238, 111, 146);
  }

  for (let x = 0; x < canvas.width; x += gridSize) {
    for (let y = 0; y < canvas.height; y += gridSize) {
      let c = random([color1, color2]);
      canvas.fill(c);
      canvas.noStroke();
      canvas.rect(x, y, gridSize, gridSize);
    }
  }

  newPrediction.style('background-image', `url(${canvas.elt.toDataURL()})`);
  newPrediction.style('background-size', 'cover');
}

// Function to trigger confetti animation
function triggerConfetti() {
  confetti = [];
  for (let i = 0; i < 200; i++) {
    confetti.push(new Confetti());
  }
  confettiTriggered = true;
}

function runConfetti() {
  let allConfettiStopped = true;

  for (let i = confetti.length - 1; i >= 0; i--) {
    confetti[i].update();

    if (!confetti[i].hasStopped()) {
      allConfettiStopped = false;
    } else {
      confetti.splice(i, 1); // Remove stopped confetti
    }
  }

  if (allConfettiStopped) {
    confettiTriggered = false;
  }
}

// Function to generate HTML for confetti
function getConfettiHTML() {
  let html = '';
  for (let i = 0; i < confetti.length; i++) {
    html += `<div style="width: ${confetti[i].size}px; height: ${confetti[i].size}px; background-color: rgba(${confetti[i].color[0]}, ${confetti[i].color[1]}, ${confetti[i].color[2]}, ${confetti[i].opacity / 255}); position: absolute; top: ${confetti[i].y}px; left: ${confetti[i].x}px; opacity: ${confetti[i].opacity / 255};"></div>`;
  }
  return html;
}

// Function to remove the prediction and overlay
function removePrediction() {
  if (overlay) {
    overlay.hide();
  }
  if (predictions.length > 0) {
    predictions[0].style('transform', 'rotate(0rad)'); // Reset rotation
    predictions[0].remove();
    predictions = [];
  }
  confettiTriggered = false;
  isBarrelRolling = false; // Stop barrel rolling effect
  angle = 0; // Reset angle
  totalAngle = 0; // Reset total angle
}

// Confetti class
class Confetti {
  constructor() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.size = random(5, 15);
    this.color = [random(255), random(255), random(255)];
    this.speed = random(2, 5);
    this.opacity = 255;
    this.stopped = false;
  }

  update() {
    if (!this.stopped) {
      this.y += this.speed;
      this.opacity -= 5; // Decrease opacity
      if (this.opacity < 0) {
        this.opacity = 0;
        this.stopped = true; // Mark as stopped when fully faded
      }
    }
  }

  hasStopped() {
    return this.stopped;
  }
}

// Star class for twinkling effect
class Star {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(5, 10);
    this.alpha = 0; // Initial opacity
    this.fadingIn = true; // Flag for fading direction
    this.twinkleSpeed = random(2, 10); // Random speed for twinkling
  }

  update() {
    if (this.fadingIn) {
      this.alpha += this.twinkleSpeed; // Increase opacity by twinkle speed
      if (this.alpha >= 255) {
        this.alpha = 255;
        this.fadingIn = false; // Start fading out
      }
    } else {
      this.alpha -= this.twinkleSpeed; // Decrease opacity by twinkle speed
      if (this.alpha <= 0) {
        this.alpha = 0;
        this.fadingIn = true; // Start fading in
        this.resetPosition(); // Reset position when fading out
      }
    }
  }

  display() {
    fill(255, this.alpha); // Set fill color with alpha
    noStroke();
    rect(this.x, this.y, this.size, this.size); // Draw the square
  }

  resetPosition() {
    this.x = random(1440); // Random new x position
    this.y = random(880); // Random new y position
  }
}
