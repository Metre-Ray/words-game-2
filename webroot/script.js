class App {
  constructor() {
    const wordInput = document.getElementById('wordInput');
    const submitButton = document.getElementById('submitWord');
    const statusDiv = document.getElementById('status');
    const timerDisplay = document.getElementById('timerDisplay');
    const startOverButton = document.getElementById('startOver');
    let timeLimit = 60;
    let startWord = 'start';
    let playerNumber = 2;

    startOverButton.addEventListener('click', () => {
      window.parent?.postMessage(
        { type: 'gameOver', data: {} },
        '*'
      );
    });

    // When the Devvit app sends a message with `context.ui.webView.postMessage`, this will be triggered
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      // Reserved type for messages sent via `context.ui.webView.postMessage`
      if (type === 'devvit-message') {
        const { message } = data;

        // Always output full message
        // output.replaceChildren(JSON.stringify(message, undefined, 2));

        if (message.type === 'initialData') {
          timeLimit = message.data.timeLimit;
          startWord = message.data.startWord;
          playerNumber = message.data.playerNumber;
          startGame(startWord, timeLimit);
        }
      }
    });


    function startGame(startWord, timeLimit) {
      let lastLetter = null;
      let usedWords = new Set();
      let currentPlayer = 1;
  
      wordInput.value = startWord;
  
      let timeout;
      let countdownInterval;
      submitButton.addEventListener('click', () => {
          const word = wordInput.value.trim().toLowerCase();
  
          if (!word) {
              updateStatus('Please enter a word.', 'error');
              return;
          }
  
          if (usedWords.has(word)) {
              updateStatus('This word has already been used.', 'error');
              return;
          }
  
          if (lastLetter && word[0] !== lastLetter) {
              updateStatus(`Invalid word! The word must start with '${lastLetter}'.`, 'error');
              return;
          }
  
          usedWords.add(word);
          clearTimeout(timeout);
          clearInterval(countdownInterval);
          lastLetter = word[word.length - 1];
          updateStatus(`Valid word! Player ${currentPlayer} played: "${word}". Next word must start with '${lastLetter}'.`, 'success');
          
          currentPlayer = currentPlayer === playerNumber ? 1 : currentPlayer + 1;
  
          wordInput.value = '';

          let timeRemaining = timeLimit;
          updateDisplay(timeRemaining);

          countdownInterval = setInterval(() => {
            timeRemaining--;
            if (timeRemaining <= 0) {
              clearInterval(countdownInterval);
              updateDisplay(0);
            } else {
              updateDisplay(timeRemaining);
            }
          }, 1000);
  
          timeout = setTimeout(() => {
            endGame(usedWords, currentPlayer, playerNumber);
          }, timeLimit * 1000);
      });
    }

    function endGame(usedWords, currentPlayer, playerNumber) {
      wordInput.disabled = true;
      const playerWinner = [];
      for (let i = 1; i < playerNumber + 1; i++) {
        if (i !== currentPlayer) {
          playerWinner.push(i);
        }
      }
      updateStatus(`Time is over! Game over. Winner: Player ${playerWinner.join(', ')}. Total word length: ${usedWords.size}`, 'error');
    }

    function updateStatus(message, statusType) {
      statusDiv.textContent = message;
      statusDiv.className = `status ${statusType}`;
    }

    function updateDisplay(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
  }


}

new App();
