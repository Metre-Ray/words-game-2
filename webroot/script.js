class App {
  constructor() {
    const output = document.querySelector('#messageOutput');
    const increaseButton = document.querySelector('#btn-increase');
    const decreaseButton = document.querySelector('#btn-decrease');
    const usernameLabel = document.querySelector('#username');
    const counterLabel = document.querySelector('#counter');
    
    const wordInput = document.getElementById('wordInput');
    const submitButton = document.getElementById('submitWord');
    const statusDiv = document.getElementById('status');
    var counter = 0;
    let timeLimit = 60;
    let startWord = 'start';

    // When the Devvit app sends a message with `context.ui.webView.postMessage`, this will be triggered
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      // Reserved type for messages sent via `context.ui.webView.postMessage`
      if (type === 'devvit-message') {
        const { message } = data;

        // Always output full message
        // output.replaceChildren(JSON.stringify(message, undefined, 2));

        // Load initial data
        if (message.type === 'initialData') {
          // const { username, currentCounter } = message.data;
          timeLimit = message.data.timeLimit;
          startWord = message.data.startWord;
          startGame(startWord, timeLimit);
          // usernameLabel.innerText = username;
          // counterLabel.innerText = counter = currentCounter;
        }

        // Update counter
        // if (message.type === 'updateCounter') {
        //   const { currentCounter } = message.data;
        //   counterLabel.innerText = counter = currentCounter;
        // }
      }
    });

    // increaseButton.addEventListener('click', () => {
    //   // Sends a message to the Devvit app
    //   window.parent?.postMessage(
    //     { type: 'setCounter', data: { newCounter: Number(counter + 1) } },
    //     '*'
    //   );
    // });

    // decreaseButton.addEventListener('click', () => {
    //   // Sends a message to the Devvit app
    //   window.parent?.postMessage(
    //     { type: 'setCounter', data: { newCounter: Number(counter - 1) } },
    //     '*'
    //   );
    // });







    function startGame(startWord, timeLimit) {
      let lastLetter = null;
      let usedWords = new Set();
      let currentPlayer = 1;
  
      wordInput.value = startWord;
  
      let timeout;
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
          lastLetter = word[word.length - 1];
          updateStatus(`Valid word! Player ${currentPlayer} played: "${word}". Next word must start with '${lastLetter}'.`, 'success');
          
          // Switch player
          currentPlayer = currentPlayer === 1 ? 2 : 1;
  
          // Clear the input field
          wordInput.value = '';
  
          timeout = setTimeout(() => {
            endGame(usedWords, currentPlayer);
          }, timeLimit * 1000)
      });
    }

    function endGame(usedWords, currentPlayer) {
      wordInput.disabled = true;
      updateStatus(`Time is over! Game over. Winner: Player ${currentPlayer}. Total word length: ${usedWords.size}`, 'error');
    }

    function updateStatus(message, statusType) {
      statusDiv.textContent = message;
      statusDiv.className = `status ${statusType}`;
    }

    // document.getElementById('gameForm').addEventListener('submit', () => {
    //   document.querySelector('.game-container').style.display = 'block';
    //   document.getElementById('gameForm').classList.add('hidden');
    // });
  }


}

new App();
