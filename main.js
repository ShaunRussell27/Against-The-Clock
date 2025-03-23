let money = [10, 20, 50, 100];
let moneyValue;
let player1Time = 60;
let player2Time = 60;
let currentPlayer = 1;
let player1CorrectAnswers = 0;
let player2CorrectAnswers = 0;
let questions = []; // Will be loaded from questions.json
let usedQuestions = []; // To track the used questions
let gameOver = false;

// Load questions (from questions.json)
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data.questions;
        startGame();  // Initialize game once questions are loaded
    });

function startGame() {
    // Select random money value
    moneyValue = money[Math.floor(Math.random() * money.length)];
    document.getElementById("money-display").innerText = `Money: €${moneyValue}`;

    // Reset timers and correct answer counters
    player1Time = 60;
    player2Time = 60;
    player1CorrectAnswers = 0;
    player2CorrectAnswers = 0;
    usedQuestions = [];
    gameOver = false;
    updateTimerDisplay();
    updateCorrectAnswers();

    // Start Player 1's turn
    startPlayerTurn(1);
}

function startPlayerTurn(player) {
    if (gameOver) return; // Prevent starting new turn if the game is over

    if (player === 1) {
        currentPlayer = 1;
        playTurn(player1Time);
    } else {
        currentPlayer = 2;
        playTurn(player2Time);
    }
}

function playTurn(playerTime) {
    let question = getRandomQuestion();
    if (!question) {
        // If there are no questions left, end the game
        endGame();
        return;
    }

    displayQuestion(question);

    let timer = setInterval(() => {
        if (playerTime <= 0) {
            clearInterval(timer);
            endTurn();
        } else {
            playerTime--;
            updateTimerDisplay();
        }
    }, 1000);
}

function getRandomQuestion() {
    // Ensure unique questions by selecting a random question from remaining ones
    let remainingQuestions = questions.filter(q => !usedQuestions.includes(q));
    if (remainingQuestions.length === 0) return null; // No questions left

    let randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    let selectedQuestion = remainingQuestions[randomIndex];

    usedQuestions.push(selectedQuestion); // Mark the question as used
    return selectedQuestion;
}

function displayQuestion(question) {
    const questionElement = document.createElement('div');
    questionElement.innerHTML = `
        <p>${question.question}</p>
        ${question.answers.map((answer, index) => `
            <button onclick="answerQuestion(${index}, ${question.correctAnswerIndex})">${answer}</button>
        `).join('')}
    `;
    document.getElementById(`player${currentPlayer}-questions`).innerHTML = questionElement.innerHTML;
}

function answerQuestion(selectedIndex, correctIndex) {
    if (selectedIndex === correctIndex) {
        if (currentPlayer === 1) {
            player1CorrectAnswers++;
        } else {
            player2CorrectAnswers++;
        }
        updateCorrectAnswers();
    }

    endTurn();
}

function endTurn() {
    if (currentPlayer === 1) {
        if (player1CorrectAnswers >= 5 || player1Time <= 0) {
            endGame();
        } else {
            startPlayerTurn(2);
        }
    } else {
        if (player2CorrectAnswers >= 5 || player2Time <= 0) {
            endGame();
        } else {
            startPlayerTurn(1);
        }
    }
}

function endGame() {
    gameOver = true;
    let winnerMessage = '';

    if (player1CorrectAnswers >= 5 && player2CorrectAnswers < 5) {
        winnerMessage = `Player 1 wins €${player1Time * moneyValue}!`;
    } else if (player2CorrectAnswers >= 5 && player1CorrectAnswers < 5) {
        winnerMessage = `Player 2 wins €${player2Time * moneyValue}!`;
    } else {
        winnerMessage = 'No winner: Neither player answered 5 questions correctly.';
    }

    document.getElementById("result").innerText = winnerMessage;
}

function updateTimerDisplay() {
    document.getElementById('timer1').innerText = `Time: ${player1Time}s`;
    document.getElementById('timer2').innerText = `Time: ${player2Time}s`;
}

function updateCorrectAnswers() {
    document.getElementById('player1').innerHTML = `
        <h2>Player 1</h2>
        <div id="timer1">Time: ${player1Time}s</div>
        <div>Correct Answers: ${player1CorrectAnswers} / 5</div>
    `;
    document.getElementById('player2').innerHTML = `
        <h2>Player 2</h2>
        <div id="timer2">Time: ${player2Time}s</div>
        <div>Correct Answers: ${player2CorrectAnswers} / 5</div>
    `;
}

