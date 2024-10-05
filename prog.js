var gridContainer;
var gridItems;
var gridSquareSize;

var counterCorrectAnswer;
var counterRounds;
var correctSquare;
var ready;

var sizeRandomPixel;
var sizeWindowWidth;
var distanceView;

// User interface output elements

var textCounterCorrectAnswer;
var textCounterRounds;
var textScreenCharacteristic;

// Function to create a new square div
function createRandomSquare() {
    const randomIndex = Math.floor(Math.random() * gridItems.length);
    correctSquare = randomIndex +1;

    const randomGridItem = gridItems[randomIndex];


    const square = document.createElement('div');
    square.id = 'random-square';
    square.className = 'random-square';
    square.style.width = `${sizeRandomPixel}px`;
    square.style.height = `${sizeRandomPixel}px`;

    const safeBorderMargin = 16;

    const maxMargin = gridSquareSize - sizeRandomPixel - 2 * safeBorderMargin;
    const randomMarginTop = Math.floor(Math.random() * maxMargin) + safeBorderMargin;
    const randomMarginLeft = Math.floor(Math.random() * maxMargin) + safeBorderMargin;

    square.style.top = `${randomMarginTop}px`;
    square.style.left = `${randomMarginLeft}px`;

    randomGridItem.appendChild(square);
}

function calculateFieldOfView(distance, length) {
    // Calculate half the length of the line AB
    var halfLength = length / 2;

    // Calculate the angle in radians
    var angleInRadians = Math.atan(halfLength / distance);

    // Convert the angle to degrees
    var angleInDegrees = angleInRadians * (180 / Math.PI);

    // Multiply by 2 to get the full angle
    var fullAngle = angleInDegrees * 2;

    return fullAngle;
}


function init() {
    // Retrieve all grid items
    gridContainer = document.getElementById('grid-container'); 
    gridItems = gridContainer.children;
    gridSquareSize = gridItems[0].getBoundingClientRect().width;


    textCounterCorrectAnswer = document.getElementById('correctAnswer');
    textCounterRounds = document.getElementById('rounds');
    textScreenCharacteristic = document.getElementById('screenCharacteristic');  

    


    // Function to handle key presses
    document.addEventListener('keydown', function(event) {
        console.log("event entered");

        var key = event.key;
        
        // Check if the key is between 1 and 9
        if (key >= '1' && key <= '9') {
            console.log("valid 1-9 key");
            userAnswer(parseInt(key));
        }
    });


    counterCorrectAnswer = 0;
    counterRounds = 0;
    ready = false;


    // TODO: Needs to be setup by the user instead

    sizeRandomPixel = 25;
    lengthWindowWidth = 32.7; // Size in cm
    distanceView = 400 // Distance in cm

    let windowHorizontalFOV = calculateFieldOfView(distanceView,lengthWindowWidth);

    let lenghtOfSquare = (lengthWindowWidth / screen.width) * sizeRandomPixel;
    let testingPPD = 1 / calculateFieldOfView(distanceView,lenghtOfSquare)

    // rounding
    testingPPD = Math.round((testingPPD + Number.EPSILON) * 100) / 100;
    windowHorizontalFOV = Math.round((windowHorizontalFOV + Number.EPSILON) * 100) / 100;

    let stringInfo = "" + screen.width + ", Window horizontal FOV: " + windowHorizontalFOV + ", Testing PPD " + testingPPD;
    textScreenCharacteristic.innerHTML = stringInfo;

    newTest();
}

const delay = ms => new Promise(res => setTimeout(res, ms));

const newTest = async () => {

    gridContainer.style.visibility = "hidden" ;

    // Remove previous square
    let squareElement = document.getElementById('random-square');
    if(squareElement){
        squareElement.remove();    
    }

    await delay(1000);

    createRandomSquare();
    console.log("correctSquare " + correctSquare);
    gridContainer.style.visibility = "visible" ;
    ready = true;
}

function userAnswer(intAnswer){
    if(ready){
        console.log(intAnswer);

        ready = false;
        if(intAnswer == correctSquare){
            counterCorrectAnswer++;
        }
        counterRounds++;
    
        updateUIanswer();
    
        newTest();
    }
}

function updateUIanswer(){
    textCounterCorrectAnswer.innerText = ""+counterCorrectAnswer;
    textCounterRounds.innerText = ""+counterRounds;
}


