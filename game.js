// All variables and elements used throughout code.
const resultElement = document.getElementById("result");
const pokemonImageElement = document.getElementById("pokemonImage");
const optionsContainer = document.getElementById("options");
const timerElement = document.getElementById("timerValue");
let usedPokemonNames = []; // This contains all old pokemon names in current playthrough.
let pokemonNames = []; // This is the list of all pokemon names in our text file.
let timer = 0;
let timerInterval;
let currentPokemon;
const playerName = localStorage.getItem("currentPlayerName");
const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};

// Function to load Pokemon names from text file.
async function loadPokemonNames() {
  try {
    const response = await fetch("pokemon-names.txt"); // Name of text file may be different.
    const text = await response.text();
    pokemonNames = text.split("\n").map((name) => name.trim()).filter((name) => name);
  } catch (error) { // Error case in case loading the names fails.
    console.error("Error loading Pokemon names:", error);
    resultElement.textContent = "Error loading Pokemon names. Please try again.";
  }
}

// Function to load a random Pokemon
async function loadQuestionWithOptions() {
  if (!pokemonNames.length) {
    await loadPokemonNames();
  }

  resetTimer();

  let pokemonName;
  do {
    pokemonName = pokemonNames[Math.floor(Math.random() * pokemonNames.length)];
  } while (usedPokemonNames.includes(pokemonName));

  // Update used Pokemon, and get new pokemon to guess.
  usedPokemonNames.push(pokemonName);
  currentPokemon = pokemonName;

  // Update Pokemon image.
  pokemonImageElement.src = `pokemon-images/${pokemonName.toLowerCase()}.png`;
  pokemonImageElement.alt = currentPokemon;
  resultElement.textContent = "Who's that Pokemon?";

  // Clear all previous options and create our input box.
  optionsContainer.innerHTML = "";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type your guess here...";
  input.id = "guessInput";
  optionsContainer.appendChild(input);

  // Automatically focus on the input box (this took forever to figure out ;-;).
  input.focus();

  // Add shortcut of "enter" to make the game feel more responsive.
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default form submission (if any)
      checkAnswer(input.value.trim().toLowerCase() === currentPokemon.toLowerCase());
      input.value = ""; // Clear input after guess.
    }
  });

  // Create guess button and set it to enter the guess when pressed.
  const guessButton = document.createElement("button");
  guessButton.textContent = "Guess";
  guessButton.id = "guessButton";
  guessButton.onclick = () => {
    checkAnswer(input.value.trim().toLowerCase() === currentPokemon.toLowerCase());
    input.value = ""; // Clear input after guess.
  };
  optionsContainer.appendChild(guessButton);
}

// Function to check for correct answer
function checkAnswer(isCorrect) {
  clearInterval(timerInterval);

  if (isCorrect) { // If its correct, add 1 to leaderboard for playername.
    resultElement.textContent = "Correct!";
    leaderboard[playerName].correctGuesses += 1;
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  } else { // Otherwise, say it's wrong.
    resultElement.textContent = `Wrong! The correct answer was ${currentPokemon}`;
  }

  setTimeout(() => loadQuestionWithOptions(), 2000); // Creates a gap between pokemon to slow the game down a bit.
}

// Timer reset function.
function resetTimer() {
  timer = 0; // Reset timer.
  timerElement.textContent = timer.toFixed(1); // Reset timer display.
  clearInterval(timerInterval); // Clear and previous timer intervals.
  const startTime = Date.now(); // Capture start time.

  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000; // Calculate elapsed time in seconds.
    timerElement.textContent = elapsed.toFixed(1); // Update display.
  }, 100); // Every 100 milliseconds
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  loadPokemonNames().then(loadQuestionWithOptions);
});
