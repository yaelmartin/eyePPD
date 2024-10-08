// Rounds settings
var defaultRoundsToPassToNextDifficulty = 5;
var requiredRatioToPassToNextDifficulty = 0;
var safeMinimalTestSizePx = 2;

var useNumberPad = true;


var arrayTests;
var currentTestResultStruct;
var sizeSquareToFindPixels;

var testingPPD;

var gridContainer;
var gridItems;
var gridItemSize;

var counterCorrectAnswer;
var counterRounds;
var correctSquare;
var ready;


var sizeWindowWidthCm;
var distanceViewCm;
var viewportWidthTruePx;
var viewportHeightTruePx;

// User interface output elements
var textCounterCorrectAnswers;
var textCounterRounds;
var textScreenCharacteristics;
var textTestingPPD;


// Function to create a new square div
function createRandomSquare() {
    const randomIndex = Math.floor(Math.random() * gridItems.length);
    correctSquare = randomIndex +1;

    const randomGridItem = gridItems[randomIndex];


    const square = document.createElement('div');
    square.id = 'random-square';
    square.className = 'random-square';
    square.style.width = `${sizeSquareToFindPixels}px`;
    square.style.height = `${sizeSquareToFindPixels}px`;

    const safeBorderMargin = Math.round(gridItemSize * 0.2);

    const maxMargin = gridItemSize - sizeSquareToFindPixels - 2 * safeBorderMargin;
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


//
function mapScreenGridInfoPanel(){
    viewportHeightTruePx=window.innerHeight * window.devicePixelRatio;
    viewportWidthTruePx=window.innerWidth * window.devicePixelRatio;
    
    
    let truePixelsMax;
    
    if (viewportHeightTruePx > viewportWidthTruePx){
        truePixelsMax = viewportWidthTruePx;
        console.log("height is higer, using witfdh");
    }else{
        truePixelsMax = viewportHeightTruePx;
        console.log("height lower higer, using height");
    }
    truePixelsMax = Math.floor(truePixelsMax);



    console.log("pixelratio",window.devicePixelRatio);
    console.log(truePixelsMax)

    let gridPadding = Math.floor(0.04 * truePixelsMax);
    let gridGap = Math.floor(0.01* truePixelsMax);
    gridItemSize = Math.floor((truePixelsMax - gridPadding * 2 - gridGap * 2) / 3);
    
    gridContainer.style.gridTemplateRows = "repeat(3, " + gridItemSize +"px)";
    gridContainer.style.gridTemplateColumns = "repeat(3, " + gridItemSize +"px)";
    gridContainer.style.gap = ""+gridGap+"px";
    gridContainer.style.padding = ""+gridPadding+"px";
}

function addKeyPressEvent(){
    document.addEventListener('keydown', function(event) {
        //console.log("event entered");

        var key = event.key;
        
        // Check if the key is between 1 and 9
        if (key >= '1' && key <= '9') {
            //console.log("valid 1-9 key");

            choice = parseInt(key)
            if(useNumberPad){
                // Map numpad keys to grid positions
                const numpadMap = {
                    '7': 1, '8': 2, '9': 3,
                    '4': 4, '5': 5, '6': 6,
                    '1': 7, '2': 8, '3': 9
                };
                choice = numpadMap[key];
            }

            userAnswer(choice);
        }
    });
}

const initFullscreen = async () => {
    checkCookies(); // Ask the user his window's with and view distance, apply them to variables
    document.documentElement.requestFullscreen(); 
    await delay(1000); // Delay is required for elements to update before calling mapScreenGridInfoPanel()
    setup();
}

function init(){
    checkCookies(); // Ask the user his window's with and view distance, apply them to variables
    setup();
}


function setup(){ 
    /* // Manual override
    sizeWindowWidthCm = 32.7;
    distanceViewCm = 400 
    */

    // Retrieve all grid items
    gridContainer = document.getElementById('grid-container'); 
    gridItems = gridContainer.children;


    textCounterCorrectAnswers = document.getElementById('correctAnswers');
    textCounterRounds = document.getElementById('rounds');
    textScreenCharacteristics = document.getElementById('screenCharacteristics');  
    textTestingPPD = document.getElementById('testingPPD');  

    mapScreenGridInfoPanel();

    addKeyPressEvent();

    let windowHorizontalFOV = calculateFieldOfView(distanceViewCm,sizeWindowWidthCm);
    windowHorizontalFOV = Math.round((windowHorizontalFOV + Number.EPSILON) * 100) / 100;
    let stringInfo = "<li>"+sizeWindowWidthCm +"cm</li><li>" + Math.round(viewportWidthTruePx) + " pixels</li><li>" + windowHorizontalFOV + "HFOV</li>";
    textScreenCharacteristics.innerHTML = stringInfo;

    // Reset every values
    counterCorrectAnswer = 0;
    counterRounds = 0;
    ready = false;

    // Size for first test
    sizeSquareToFindPixels = gridItemSize /3;

    updateTestingPPD();

    // Tests difficulty and rounds setup
    arrayTests = new Array();
    currentTestResultStruct = new TestResult(testingPPD, 0, 0, sizeSquareToFindPixels);
    arrayTests.push(currentTestResultStruct);

    newTestDifficulty();
}

function updateTestingPPD(){

    let lenghtOfSquareCm = (sizeWindowWidthCm / viewportWidthTruePx) * sizeSquareToFindPixels;
    testingPPD = 1 / calculateFieldOfView(distanceViewCm,lenghtOfSquareCm)

    textTestingPPD.innerHTML= Math.round((testingPPD + Number.EPSILON) * 100) / 100;
}

function newTestDifficulty(){
    // Shorten the numbers of rounds for low testingPPD
    if(testingPPD < 15){
        roundsToPassToNextDifficulty = 2;
    }else{
        roundsToPassToNextDifficulty = defaultRoundsToPassToNextDifficulty;
    }

    // All rounds of the test are finished, trying to go to next difficulty
    if(currentTestResultStruct.rounds >= roundsToPassToNextDifficulty){

        // Verify the previous test was successful
        if(currentTestResultStruct.ratio() > requiredRatioToPassToNextDifficulty){
            
            // Change the pixel
            let newSize =  Math.round(sizeSquareToFindPixels * 0.7);
            
            if(newSize >= sizeSquareToFindPixels || newSize <= safeMinimalTestSizePx){
                alert('Cant test further difficulty !')
            }else{
                // We continue to next
                sizeSquareToFindPixels = newSize;
                updateTestingPPD();

                console.log('New test! testingPPD is ' + testingPPD + ', sizeSquareToFindPixels is ' + sizeSquareToFindPixels + 'px');
    
                currentTestResultStruct = new TestResult(testingPPD, 0, 0, sizeSquareToFindPixels);
                arrayTests.push(currentTestResultStruct);

                newRound();

            }
        }else{
            alert('Score too low to go to the next test.');
        }

    }else{
        newRound();
    }
}


const delay = ms => new Promise(res => setTimeout(res, ms));

const newRound = async () => {

    gridContainer.style.visibility = "hidden" ;

    // Remove previous square
    let squareElement = document.getElementById('random-square');
    if(squareElement){
        squareElement.remove();    
    }

    await delay(100);

    createRandomSquare();
    console.log("correctSquare " + correctSquare);
    gridContainer.style.visibility = "visible" ;
    ready = true;
}

function userAnswer(intAnswer){
    if(ready){
        console.log("user's answer is " + intAnswer);

        ready = false;
        if(intAnswer == correctSquare){
            counterCorrectAnswer++;

            currentTestResultStruct.correctAnswers ++;
        }
        counterRounds++;

        currentTestResultStruct.rounds ++;
    
        updateUIanswer();
    
        newTestDifficulty();
    }
}

function updateUIanswer(){
    textCounterCorrectAnswers.innerText = ""+counterCorrectAnswer;
    textCounterRounds.innerText = ""+counterRounds;
}


