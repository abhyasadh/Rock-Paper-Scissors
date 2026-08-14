const choices = ["rock", "paper", "scissors"];

export const getComputerChoice = () => {
  const num = Math.floor(Math.random() * 1000000);
  return choices[num % 3];
};

export const getRoundResult = (playerChoice, computerChoice) => {
  if (playerChoice === computerChoice) return "draw";

  if (
    (playerChoice === "rock" && computerChoice === "scissors") ||
    (playerChoice === "paper" && computerChoice === "rock") ||
    (playerChoice === "scissors" && computerChoice === "paper")
  ) {
    return "win";
  }
  return "lose";
};