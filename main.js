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
let timer; // GLOBAL TIMER
let isPaused = false;
let currentQuestion = null; // Store the current question for pausing

// Load questions from questions.json
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        startGame();
    });

function startGame() {
    moneyValue = money[Math.floor(Math.random() * money.length)];
    document.getElementById("money").innerText = `Money: €${moneyValue}`;
    
    player1Time = 60;
    player2Time = 60;
    player1CorrectAnswers = 0;
    player2CorrectAnswers = 0;
    usedQuestions = [];
    gameOver = false;

    updateTimerDisplay();
    updateCorrectAnswers();

    startPlayerTurn(1);
}

function startPlayerTurn(player) {
    if (gameOver) return;
    currentPlayer = player;
    playTurn();
}

function playTurn() {
    if (!currentQuestion) {
        currentQuestion = getRandomQuestion();
    }

    if (!currentQuestion) {
        endGame();
        return;
    }

    displayQuestion(currentQuestion); // Fixed typo: currentQuestion

    clearInterval(timer); // Clear existing timer if any

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

function getRandomQuestion() {
    let remaining = questions.filter(q => !usedQuestions.includes(q));
    if (remaining.length === 0) return null;

    let index = Math.floor(Math.random() * remaining.length);
    let question = remaining[index];

    usedQuestions.push(question);
    return question;
}

function displayQuestion(question) {
    const questionHTML = `
        <p>${question.question}</p>
        ${question.answers.map((ans, i) => 
            `<button onclick="answerQuestion(${i}, ${question.correct})">${ans}</button>`
        ).join('')}
    `;
    document.getElementById(`player${currentPlayer}-questions`).innerHTML = questionHTML;
}

function endTurn() {
    if (currentPlayer === 1) {
        if (player1CorrectAnswers >= 5 || player1Time <= 0) {
            startPlayerTurn(2);
        } else {
            currentPlayer = 2; // Switch to Player 2
            startPlayerTurn(2);
        }
    } else {
        if (player2CorrectAnswers >= 5 || player2Time <= 0) {
            endGame();
        } else {
            currentPlayer = 1; // Switch to Player 1
            startPlayerTurn(1);
        }
    }
}

function endGame() {
    clearInterval(timer);
    gameOver = true;

    let result = '';
    if (player1CorrectAnswers >= 5 && player2CorrectAnswers < 5) {
        result = `Player 1 wins €${player1Time * moneyValue}!`;
    } else if (player2CorrectAnswers >= 5 && player1CorrectAnswers < 5) {
        result = `Player 2 wins €${player2Time * moneyValue}!`;
    } else {
        result = 'No winner: Neither player answered 5 questions correctly.';
    }

     // Display the result in the #winner div
     document.getElementById("winner").innerText = result;

     // Optionally, clear the question areas
     document.getElementById("player1-questions").innerHTML = '';
     document.getElementById("player2-questions").innerHTML = '';
}

function updateTimerDisplay() {
    document.getElementById('timer1').innerText = `Time: ${player1Time}s`;
    document.getElementById('timer2').innerText = `Time: ${player2Time}s`;
}

function updateCorrectAnswers() {
    document.getElementById('player1').querySelector('div:nth-child(3)').innerText =
        `Correct Answers: ${player1CorrectAnswers} / 5`;
    document.getElementById('player2').querySelector('div:nth-child(3)').innerText =
        `Correct Answers: ${player2CorrectAnswers} / 5`;
}

function pauseGame() {
    if (!gameOver) {
        if (!isPaused) {
            clearInterval(timer); // Stop the timer
            isPaused = true;
            document.getElementById('pause-game').innerText = 'Resume Game'; // Update button text
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
    clearInterval(timer); // Stop the timer when the player answers

    let feedback = ''; // Variable to store feedback message

    if (selected === correct) {
        feedback = 'Correct!';
        if (currentPlayer === 1) player1CorrectAnswers++;
        else player2CorrectAnswers++;
        updateCorrectAnswers(); // Update the correct answers display
    } else {
        feedback = `Wrong! The correct answer was: ${correct}`;
    }

    // Display feedback message
    document.getElementById(`player${currentPlayer}-questions`).innerHTML = `
        <p>${feedback}</p>
        <p>Correct Answers: ${
            currentPlayer === 1 ? player1CorrectAnswers : player2CorrectAnswers
        } / 5</p>
    `;

    // Clear the current question
    currentQuestion = null;

    // Wait for 2 seconds before ending the turn
    setTimeout(() => {
        endTurn();
    }, 2000);
}