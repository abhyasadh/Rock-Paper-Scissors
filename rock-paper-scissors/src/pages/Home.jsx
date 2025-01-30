import React, { useEffect, useState } from "react";
import image from "../assets/background.png";
import { useNavigate } from "react-router-dom";
import {
  connectToServer,
  disconnect,
  sendMessage,
} from "../components/socketService";
import { toast } from "react-toastify";

function Home() {
  const navigate = useNavigate();
  const localGameId = localStorage.getItem("gameId");
  const [joiningGame, setJoiningGame] = useState(false);

  useEffect(() => {
    disconnect();
    localStorage.removeItem("gameId");
  }, [localGameId]);

  const createGame = () => {
    connectToServer(
      "ws://localhost:5000",
      (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "game_created") {
          localStorage.setItem("gameId", message.gameId);
          navigate(`/${message.gameId}`, {state: {opponent: false, choiceMade: false}});
        } else if (message.type === "info") {
          toast.info(message.message);
        } else if (message.type === "error") {
          alert(message.message);
        }
      },
      (error) => console.error("WebSocket error:", error),
      () => console.log("WebSocket connection closed")
    );

    sendMessage({ type: "create_game" });
  };

  const joinGame = () => {
    let gameIdInput = document.getElementById("gameIdInput");
    const enteredGameId = gameIdInput.value.trim();
    if (!enteredGameId) {
      alert("Please enter a game ID.");
      return;
    }

    connectToServer(
      "ws://localhost:5000",
      (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "choice_made") {
          localStorage.setItem("gameId", message.gameId);
          navigate(`/${message.gameId}`, {state: {opponent: true, choiceMade: true}});
        } else if (message.type === "game_joined") {
          localStorage.setItem("gameId", message.gameId);
          navigate(`/${message.gameId}`, {state: {opponent: true, choiceMade: false}});
        } else if (message.type === "info") {
          toast.info(message.message);
        } else if (message.type === "error") {
          toast.error(message.message);
        }
      },
      (error) => console.error("WebSocket error:", error),
      () => console.log("WebSocket connection closed")
    );
    const gameId = enteredGameId;
    sendMessage({ type: "join_game", gameId });
  };

  return (
    <>
      <div className="homePage">
        <div className="container">
          <div className="imageContainer">
            <img src={image} alt="" />
          </div>
          <h1>Rock Paper Scissors</h1>

          <div className="menu" id="menu">
            <button
              id="createGameBtn"
              className="button"
              onClick={() => {
                createGame();
              }}
            >
              Create Game
            </button>
            {!joiningGame ? (
              <button
                id="joinGameBtn"
                className="button"
                onClick={() => {
                  setJoiningGame(true);
                }}
              >
                Join Game
              </button>
            ) : (
              <div className="gameIdInputContainer">
                <input
                  type="text"
                  id="gameIdInput"
                  placeholder="Game ID"
                  autoComplete="off"
                  autoFocus="on"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      joinGame();
                    }
                  }}
                />
                <button
                  id="joinGameSubmitBtn"
                  onClick={() => {
                    joinGame();
                  }}
                >
                  <span>➜</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;