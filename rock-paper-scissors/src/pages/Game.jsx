import React, { useEffect, useState } from "react";
import { socket, isConnected, sendMessage } from "../components/socketService";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import rock from "../assets/rock.png";
import paper from "../assets/paper.png";
import scissors from "../assets/scissors.png";
import home from "../assets/home.png";
import restart from "../assets/restart.png";
import ready from "../assets/ready.png";
import copy from "../assets/copy.png";
import { connectToServer } from "../components/socketService";

function Game() {
  const { gameId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const [choice, setChoice] = useState("");
  const [hasOpponent, setHasOpponent] = useState(
    location.state?.opponent ?? true
  );
  const [opponentChoice, setOpponentChoice] = useState("");

  const [result, setResult] = useState("");
  const [status, setStatus] = useState(
    hasOpponent
      ? location.state?.choiceMade ?? false
        ? "Opponent have made their choice!"
        : "Opponent is Choosing..."
      : "Waiting for Opponent to Join..."
  );

  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const [rematchRequests, setRematchRequests] = useState({
    you: false,
    opponent: false,
  });

  useEffect(() => {
    if (!isConnected) {
      connectToServer(
        "ws://localhost:5000",
        () => {},
        (error) => console.error("WebSocket error:", error),
        () => console.log("WebSocket connection closed")
      );
      sendMessage({ type: "join_game", gameId });
      localStorage.setItem("gameId", gameId);
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "player_joined") {
        setHasOpponent(true);
        setStatus("Opponent is Choosing...");
      } else if (message.type === "choice_made") {
        setStatus("Opponent have made their choice!");
        setHasOpponent(true);
      } else if (message.type === "game_result") {
        setOpponentChoice(message.opponentChoice);
        setResult(message.result);
        if (message.result === "win") {
          setPlayerScore((prevScore) => prevScore + 1);
        } else if (message.result === "lose") {
          setOpponentScore((prevScore) => prevScore + 1);
        }
      } else if (message.type === "rematch_requested") {
        setRematchRequests((prev) => ({ ...prev, opponent: true }));
      } else if (message.type === "rematch_accepted") {
        setChoice("");
        setOpponentChoice("");
        setResult("");
        setRematchRequests({
          you: false,
          opponent: false,
        });
        setStatus("Opponent is Choosing...");
      } else if (message.type === "info") {
        toast.info(message.message);
        if (message.message === "Other player disconnected. Game ended.") {
          setHasOpponent(false);
          setPlayerScore(0);
          setOpponentScore(0);
          setChoice("");
          setOpponentChoice("");
          setResult("");
          setRematchRequests({
            you: false,
            opponent: false,
          });
          setStatus("Waiting for Opponent to Join...");
        }
      } else if (message.type === "error") {
        toast.error(message.message);
        navigate("/");
      }
    };
  }, [navigate, gameId]);

  const sendMove = (move) => {
    if (hasOpponent) {
      setChoice(move);
      sendMessage({ type: "make_choice", gameId, choice: move });
    }
  };

  const viewChoice = (move) => {
    document.getElementById("choiceImageImg").src = move;
  };

  console.log(hasOpponent);

  return (
    <div className="gamePage">
      <div className="gameArea">
        <div className="players player-1">
          <div className="playerName">
            You{" "}
            {playerScore !== 0 || opponentScore !== 0 ? `(${playerScore})` : ""}
          </div>
          <div className="choiceImage">
            <img id="choiceImageImg" src={rock} alt="" height={"200px"} />
          </div>
          {choice ? (
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
                  id="rockBtn"
                  className={`choiceBtn ${hasOpponent ? "" : "disabled"}`}
                  onMouseOver={() => viewChoice(rock)}
                  onClick={() => sendMove("rock")}
                >
                  <img src={rock} alt="" width="24px" /> Rock
                </button>

                <button
                  id="paperBtn"
                  className={`choiceBtn ${hasOpponent ? "" : "disabled"}`}
                  onMouseOver={() => viewChoice(paper)}
                  onClick={() => sendMove("paper")}
                >
                  <img src={paper} alt="" width="24px" /> Paper
                </button>

                <button
                  id="scissorsBtn"
                  className={`choiceBtn ${hasOpponent ? "" : "disabled"}`}
                  onMouseOver={() => viewChoice(scissors)}
                  onClick={() => sendMove("scissors")}
                >
                  <img src={scissors} alt="" width="24px" /> Scissors
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="players player-2">
          <div className="playerName">
            Opponent{" "}
            {playerScore !== 0 || opponentScore !== 0
              ? `(${opponentScore})`
              : ""}
          </div>
          <div className="choiceImage">
            {opponentChoice ? (
              <img
                id="opponentChoice"
                src={
                  opponentChoice === "rock"
                    ? rock
                    : opponentChoice === "paper"
                    ? paper
                    : scissors
                }
                alt=""
                height={"200px"}
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
                {status === "Opponent have made their choice!" ? (
                  <img
                    src={ready}
                    alt=""
                    width={"80px"}
                    style={{ marginBottom: "14px" }}
                  />
                ) : (
                  <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                )}
                <span style={{ fontSize: "20px" }}>{status}</span>
              </div>
            )}
          </div>
          {hasOpponent ? (
            result ? (
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
            )
          ) : (
            <div className="text">
              <div className="gameId">
                Game ID: {gameId}
                <img
                  src={copy}
                  alt=""
                  height={"24px"}
                  onClick={() => {
                    navigator.clipboard.writeText(gameId);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {result && (
        <>
          <div className="afterResult">
            {rematchRequests.you && (
              <span className="rematchRequests left">Rematch Requested!</span>
            )}
            <button
              onClick={() => {
                setRematchRequests((prev) => ({ ...prev, you: true }));
                sendMessage({ type: "request_rematch", gameId });
              }}
            >
              <img src={restart} alt="" width={"30px"} />
            </button>
            {rematchRequests.opponent && (
              <span className="rematchRequests right">Rematch Requested!</span>
            )}
            <button
              onClick={() => {
                navigate("/");
              }}
            >
              <img src={home} alt="" width={"36px"} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Game;
