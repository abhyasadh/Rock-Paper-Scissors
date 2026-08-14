import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getComputerChoice, getRoundResult } from "../utils/gameLogic";
import rock from "../assets/rock.png";
import paper from "../assets/paper.png";
import scissors from "../assets/scissors.png";
import home from "../assets/home.png";
import restart from "../assets/restart.png";

function SinglePlayer() {
  const navigate = useNavigate();

  const [playerChoice, setPlayerChoice] = useState("");
  const [computerChoice, setComputerChoice] = useState("");
  const [result, setResult] = useState("");
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);

  const playRound = (move) => {
    const computerMove = getComputerChoice();
    const roundResult = getRoundResult(move, computerMove);

    setPlayerChoice(move);
    setComputerChoice(computerMove);
    setResult(roundResult);

    if (roundResult === "win") {
      setPlayerScore((prev) => prev + 1);
    } else if (roundResult === "lose") {
      setComputerScore((prev) => prev + 1);
    }
  };

  const restartRound = () => {
    setPlayerChoice("");
    setComputerChoice("");
    setResult("");
  };

  const viewChoice = (move) => {
    document.getElementById("choiceImageImg").src = move;
  };

  const isScored = playerScore !== 0 || computerScore !== 0;

  return (
    <div className="gamePage">
      <div className="gameArea">
        <div className="players player-1">
          <div className="playerName">You {isScored ? `(${playerScore})` : ""}</div>
          <div className="choiceImage">
            <img id="choiceImageImg" className="panelImage" src={rock} alt="" />
          </div>
          {playerChoice ? (
            result ? (
              <div
                className="result"
                style={{
                  backgroundColor:
                    result === "win"
                      ? "green"
                      : result === "lose"
                      ? "red"
                      : "gray",
                }}
              >
                {result === "win" ? "WON" : result === "lose" ? "LOST" : "DRAW"}
              </div>
            ) : (
              <div></div>
            )
          ) : (
            <div className="text">
              <p>Make your choice:</p>
              <div className="choices">
                <button
                  className="choiceBtn"
                  onMouseOver={() => viewChoice(rock)}
                  onClick={() => playRound("rock")}
                >
                  <img src={rock} alt="" width="24px" /> Rock
                </button>
                <button
                  className="choiceBtn"
                  onMouseOver={() => viewChoice(paper)}
                  onClick={() => playRound("paper")}
                >
                  <img src={paper} alt="" width="24px" /> Paper
                </button>
                <button
                  className="choiceBtn"
                  onMouseOver={() => viewChoice(scissors)}
                  onClick={() => playRound("scissors")}
                >
                  <img src={scissors} alt="" width="24px" /> Scissors
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="players player-2">
          <div className="playerName">
            Computer {isScored ? `(${computerScore})` : ""}
          </div>
          <div className="choiceImage">
            {computerChoice ? (
              <img
                className="panelImage"
                src={
                  computerChoice === "rock"
                    ? rock
                    : computerChoice === "paper"
                    ? paper
                    : scissors
                }
                alt=""
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <div className="lds-ellipsis">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <span className="statusText">Computer is Choosing...</span>
              </div>
            )}
          </div>
          {result ? (
            <div
              className="result"
              style={{
                backgroundColor:
                  result === "win"
                    ? "red"
                    : result === "lose"
                    ? "green"
                    : "gray",
              }}
            >
              {result === "win" ? "LOST" : result === "lose" ? "WON" : "DRAW"}
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {result && (
        <div className="afterResult">
          <button onClick={restartRound}>
            <img src={restart} className="restartIcon" alt="" />
          </button>
          <button
            onClick={() => {
              navigate("/");
            }}
          >
            <img src={home} className="homeIcon" alt="" />
          </button>
        </div>
      )}
    </div>
  );
}

export default SinglePlayer;