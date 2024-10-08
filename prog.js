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
var gridContainerSize;
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
var divInfoPanel;
var textCounterCorrectAnswers;
var textCounterRounds;
var textDistance;
var textScreenCharacteristics;
var textTestingPixel;
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


function resizeTestGrid(){
    viewportHeightTruePx=window.innerHeight * window.devicePixelRatio;
    viewportWidthTruePx=window.innerWidth * window.devicePixelRatio;

    
    if (viewportHeightTruePx > viewportWidthTruePx){
        gridContainerSize = viewportWidthTruePx;
    }else{
        gridContainerSize = viewportHeightTruePx;
    }

    // Make sure there is enough space for the info panel
    let ratioViewport = viewportWidthTruePx/viewportHeightTruePx; 
    if(ratioViewport < 1.4 && ratioViewport > 0.75){
        gridContainerSize= gridContainerSize * 0.8;
    }

    gridContainerSize = Math.floor(gridContainerSize);

    let gridPadding = Math.floor(0.04 * gridContainerSize);
    let gridGap = Math.floor(0.01* gridContainerSize);
    gridItemSize = Math.floor((gridContainerSize - gridPadding * 2 - gridGap * 2) / 3);
    
    gridContainer.style.gridTemplateRows = "repeat(3, " + gridItemSize +"px)";
    gridContainer.style.gridTemplateColumns = "repeat(3, " + gridItemSize +"px)";
    gridContainer.style.gap = ""+gridGap+"px";
    gridContainer.style.padding = ""+gridPadding+"px";
}

function resizeInfoPanel(){
    let width = 300;
    let height = 220;
    let padding = 20;
    
    let infoPanelRatio = width/height;

    divInfoPanel.style.width =""+width+"px";
    divInfoPanel.style.height=""+height+"px";
    divInfoPanel.style.padding=""+padding+"px";

    let zoomScale;
    if (viewportHeightTruePx > viewportWidthTruePx){
        let remainingHeight = viewportHeightTruePx-gridContainerSize;

        let ratioSpaceLeft = viewportWidthTruePx/remainingHeight;
        if(ratioSpaceLeft>infoPanelRatio){
            zoomScale = (remainingHeight)/(padding*2+height);
        }else{
            zoomScale = (viewportWidthTruePx)/(padding*2+width);
        }

    }else{
        let remainingWitdh = viewportWidthTruePx-gridContainerSize;

        let ratioSpaceLeft = remainingWitdh/viewportHeightTruePx;
        if(ratioSpaceLeft>infoPanelRatio){
            zoomScale = (viewportHeightTruePx)/(padding*2+height);
        }else{
            zoomScale = (remainingWitdh)/(padding*2+width);
        }
    }

    zoomScale = Math.floor((zoomScale + Number.EPSILON) * 100) / 100;

    divInfoPanel.style.zoom = zoomScale;
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


function onPageLoaded(){
    // Retrieve all IDs
    gridContainer = document.getElementById('grid-container'); 
    gridItems = gridContainer.children;

    divInfoPanel = document.getElementById('info-panel');
    textCounterCorrectAnswers = document.getElementById('correctAnswers');
    textCounterRounds = document.getElementById('rounds');
    textDistance = document.getElementById('distance');  
    textScreenCharacteristics = document.getElementById('screenCharacteristics');
    textTestingPixel = document.getElementById('testingPixel');
    textTestingPPD = document.getElementById('testingPPD');  

    addKeyPressEvent();

    resizeTestGrid();
    resizeInfoPanel();

    gridContainer.style.visibility="visible";
}

function setup(){ 
    /* // Manual override
    sizeWindowWidthCm = 32.7;
    distanceViewCm = 400 
    */

    resizeTestGrid();
    resizeInfoPanel();

    let windowHorizontalFOV = calculateFieldOfView(distanceViewCm,sizeWindowWidthCm);
    windowHorizontalFOV = Math.round((windowHorizontalFOV + Number.EPSILON) * 100) / 100;
    let stringInfo = "<li>"+sizeWindowWidthCm +"cm</li><li>" + Math.round(viewportWidthTruePx) + " pixels</li><li>" + windowHorizontalFOV + "HFOV</li>";
    textScreenCharacteristics.innerHTML = stringInfo;

    textDistance.innerHTML=""+distanceViewCm+"cm";

    // Reset every values
    counterCorrectAnswer = 0;
    counterRounds = 0;
    ready = false;

    // Size for first test
    sizeSquareToFindPixels = Math.round(gridItemSize /3);

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

    textTestingPPD.innerHTML = Math.round((testingPPD + Number.EPSILON) * 100) / 100;
    textTestingPixel.innerHTML = ""+sizeSquareToFindPixels + " pixels²"; 
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
            let newSize;
            if(sizeSquareToFindPixels >10){
                newSize =  Math.round(sizeSquareToFindPixels * 0.7);
            }else{
                newSize =  Math.floor(sizeSquareToFindPixels * 0.9);
            }

            
            if(newSize >= sizeSquareToFindPixels || newSize <= safeMinimalTestSizePx){
                alert('Cannot test further difficulty !\nRedo the test at a greater distance\nYou can see above ' + (Math.round((testingPPD + Number.EPSILON) * 100) / 100) + ' PPD')
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
            alert('Score too low to go to the next test.\nnYou can see above ' + (Math.round((testingPPD + Number.EPSILON) * 100) / 100) + ' PPD') ;
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
    gridContainer.style.visibility = "visible" ;
    ready = true;
}

function userAnswer(intAnswer){
    if(ready){

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
