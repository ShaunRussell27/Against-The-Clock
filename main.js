let money = [10, 20, 50, 100];
let moneyValue;
let player1Time = 60;
let player2Time = 60;
let currentPlayer = 1;
let player1CorrectAnswers = 0;
let player2CorrectAnswers = 0;
let questions = [];
let usedQuestions = [];
let gameOver = false;
let timer; 
let isPaused = false;
let currentQuestion = null; // Store the current question for pausing
let defaultquestions=5; //Default number of questions


// Load questions from questions.json
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        startGame();
    });

function startGame() {
    // Reset game variables
    moneyValue = money[Math.floor(Math.random() * money.length)];
    player1Time = parseInt(document.getElementById("time-select").value, 10) || 60; // Use selected time or default to 60
    player2Time = player1Time; // Both players get the same time
    player1CorrectAnswers = 0;
    player2CorrectAnswers = 0;
    usedQuestions = [];
    gameOver = false;
    currentQuestion = null;
    currentPlayer = 1; // Start with Player 1

    // Update UI elements
    document.getElementById("money").innerText = `Money: €${moneyValue}`;
    document.getElementById("winner").innerText = "Guess the Questions:"; // Clear the winner message
    document.getElementById("player1-questions").innerHTML = ""; // Clear Player 1's question area
    document.getElementById("player2-questions").innerHTML = ""; // Clear Player 2's question area

    updateTimerDisplay();
    updateCorrectAnswers();

    // Clear any existing timer
    clearInterval(timer);

    startPlayerTurn(1);
}

//saving the settings
function saveSettings() {
    // Retrieve values from the input fields
    const time = parseInt(document.getElementById("time-select").value, 10);
    const questionsCount = parseInt(document.getElementById("questions-select").value, 10);

    // Validate the inputs with users selection
    if (isNaN(time) || (time !== 30 && time !== 60 && time !== 90 && time !== 120)) {
        return;
    }
    if (isNaN(questionsCount) || (questionsCount !== 3 && questionsCount !== 5 && questionsCount !== 10 && questionsCount !== 15)) {
        return;
    }

    // Apply the settings to the game
    player1Time = time;
    player2Time = time;
    defaultquestions = questionsCount

    // Reset game variables
    player1CorrectAnswers = 0;
    player2CorrectAnswers = 0;
    usedQuestions = [];
    gameOver = false;
    currentQuestion = null;


    // this code was commented out to prevent the game from abruptly ending when settings were changed
    //fetch('questions.json')
       // .then(response => response.json())
        //.then(data => {
           // if (data.length < defaultquestions * 2) {
           //     alert(`Need at least ${defaultquestions * 2} questions for this setting`);
             //   return;
          //  }
           // questions = data.slice(0, defaultquestions); // Limit the number of questions
            //usedQuestions = []; // Reset used questions
            
            // Clear any existing timer
            //clearInterval(timer);

            // Restart the game with the new settings
            //startGame();
        //});

    // Clear any existing timer
    clearInterval(timer);

    // Restart the game with the new settings
    startGame();

}
// get whos turn it is
function startPlayerTurn(player) {
    if (gameOver) return;
    currentPlayer = player;
    currentQuestion = null; // when pressed restart two players played at once, this line fixed it

    playTurn();
}
// the tuen functionlity
function playTurn() {
    if (!currentQuestion) {
        currentQuestion = getRandomQuestion();
    }

    if (!currentQuestion) {
        endGame();
        return;
    }

    displayQuestion(currentQuestion);

    clearInterval(timer); // Clear existing timer if any

    timer = setInterval(() => {
        if (currentPlayer === 1) {
            player1Time--;
            if (player1Time <= 0) {
                clearInterval(timer);
                if (player2Time <= 0) {
                    endGame(); // End the game if both players time is 0
                } else {
                    endTurn(); // Switch to Player 2
                }
            }
        } else {
            player2Time--;
            if (player2Time <= 0) {
                clearInterval(timer);
                if (player1Time <= 0) {
                    endGame(); // End the game if both players time is 0
                } else {
                    endTurn(); // Switch to Player 1
                }
            }
        }
        updateTimerDisplay();
    }, 1000);
}


//getting the question
function getRandomQuestion() {

    // Only return null if we've reached the answer target
    if (player1CorrectAnswers >= defaultquestions || 
        player2CorrectAnswers >= defaultquestions) {
        return null;
    }
    
    let remaining = questions.filter(q => !usedQuestions.includes(q));
    if (remaining.length === 0) {
        // If we run out of questions but haven't reached answer target
        return null; 
    }

    let index = Math.floor(Math.random() * remaining.length);
    let question = remaining[index];

    //add the selected question to the current player
    usedQuestions.push(question);
    return question;
}

//displaying the question
function displayQuestion(question) {
    const questionHTML = `
        <p>${question.question}</p>
        ${question.answers.map((ans, i) => 
            `<button onclick="answerQuestion(${i}, ${question.correct})">${i+1}. ${ans}</button>`
        ).join('')}
    `;
    document.getElementById(`player${currentPlayer}-questions`).innerHTML = questionHTML;
}

//changing the turns
function endTurn() {
    if (currentPlayer === 1) {
        if (player1CorrectAnswers >= defaultquestions) {
            endGame(); // Player 1 wins
        } else if (player1Time <= 0) {
            currentPlayer = 2; // Switch to Player 2
            startPlayerTurn(2);
        } else {
            currentPlayer = 2; // Switch to Player 2
            startPlayerTurn(2);
        }
    } else {
        if (player2CorrectAnswers >= defaultquestions) {
            endGame(); // Player 2 wins
        } else if (player2Time <= 0) {
            currentPlayer = 1; // Switch to Player 1
            startPlayerTurn(1);
        } else {
            currentPlayer = 1; // Switch to Player 1
            startPlayerTurn(1);
        }
    }
}


//ending the game
function endGame() {
    clearInterval(timer);
    gameOver = true;

    let result = '';
    // Check if Player 1 has won
    if (player1CorrectAnswers >= defaultquestions && player2CorrectAnswers < defaultquestions) {
    result = `Player 1 wins €${player1Time * moneyValue}!`;
    }
    // Check if Player 2 has won
    else if (player2CorrectAnswers >= defaultquestions && player1CorrectAnswers < defaultquestions) {
        result = `Player 2 wins €${player2Time * moneyValue}!`;
    }
    else if (usedQuestions.length >= defaultquestions) {
        if (player1CorrectAnswers > player2CorrectAnswers) {
            result = `Player 1 wins €${player1Time * moneyValue}!`;
        } else if (player2CorrectAnswers > player1CorrectAnswers) {
            result = `Player 2 wins €${player2Time * moneyValue}!`;
        }
    }
    else {
        result = `No winner: Neither player answered ${defaultquestions} questions correctly in the timeframe.`;
    }

     // Display the result in the #winner div
     document.getElementById("winner").innerText = result;

     // clear the question areas
     document.getElementById("player1-questions").innerHTML = '';
     document.getElementById("player2-questions").innerHTML = '';
}
//update the timer display
function updateTimerDisplay() {
    document.getElementById('timer1').innerText = `Time: ${player1Time}s`;
    document.getElementById('timer2').innerText = `Time: ${player2Time}s`;
}


//update the correct answers
function updateCorrectAnswers() {
    document.getElementById('player1').querySelector('div:nth-child(3)').innerText =
        `Correct Answers: ${player1CorrectAnswers} / ${defaultquestions}`;
    document.getElementById('player2').querySelector('div:nth-child(3)').innerText =
        `Correct Answers: ${player2CorrectAnswers} / ${defaultquestions}`;
}

function pauseGame() {
    if (!gameOver) {
        if (!isPaused) {
            clearInterval(timer); // Stop the timer
            isPaused = true;
            document.getElementById('pause-game').innerText = 'Resume Game'; // Update button
        } else {
            isPaused = false;
            document.getElementById('pause-game').innerText = 'Pause Game'; // Update button text

            

            // Resume the timer without fetching a new question
            timer = setInterval(() => {
                if (currentPlayer === 1) {
                    player1Time--;
                    if (player1Time <= 0) {
                        clearInterval(timer);
                        endTurn();
                    }
                } else {
                    player2Time--;
                    if (player2Time <= 0) {
                        clearInterval(timer);
                        endTurn();
                    }
                }
                updateTimerDisplay();
            }, 1000);
        }
    }
}



function answerQuestion(selected, correct) {
    // Prevent answering if the game is paused
    if (isPaused) {
        return; // Exit the function if the game is paused
    }
    // This is the line of code that was added to fix the questions still being answerable when user chooses to pause game
    
    clearInterval(timer); // Stop the timer when the player answers

    let feedback = ''; // Variable to store feedback message

    if (selected === correct) {
        const correctAnswer = currentQuestion.answers[correct];
        feedback = `Correct! The answer was: "${correctAnswer}"`;
        if (currentPlayer === 1) player1CorrectAnswers++;
        else player2CorrectAnswers++;
        updateCorrectAnswers(); // Update the correct answers display
    } else {
        const correctAnswer = currentQuestion.answers[correct];
        feedback = `Wrong! The correct answer was: "${correctAnswer}"`;
        //feedback = `Wrong! The correct answer was: ${correct + 1}`;//adding 1 as to correct answe index
    }

    // Display how many answers were correct
    document.getElementById(`player${currentPlayer}-questions`).innerHTML = `
        <p>${feedback}</p>
        <p>Correct Answers: ${
            currentPlayer === 1 ? player1CorrectAnswers : player2CorrectAnswers
        }/${defaultquestions}</p>
    `;

    // Clear the current question
    currentQuestion = null;

    // Wait for 2 seconds 
    setTimeout(() => {
        endTurn();
    }, 2000);
}

//errors encountered
//pausing the game:
//making the settings work for the entire game and displaying the settings in the UI
//when settings were changed the game would sometime abruptly end fix this by getting rid of the questions being fetched in save Setting()
//when the game was paused the questions were still answerable fixed this by exiting the function if the game is paused in answerQuestion()