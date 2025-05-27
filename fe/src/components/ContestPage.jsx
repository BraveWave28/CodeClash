import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ContestPage = () => {
  const { id } = useParams();
  const attemptid = id;
  const [contestDetails, setContestDetails] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [attemptInProgress, setAttemptInProgress] = useState(false);
  const [submissionDone, setSubmissionDone] = useState(false); // Track if submission is done

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/getContest?id=${attemptid}`)
      .then((response) => {
        const data = response.data.details;
        setContestDetails(data);
        setAnswers(new Array(data.numQuestions).fill(""));

        const savedTime = localStorage.getItem(`timer-${attemptid}`);
        const savedAttempt = localStorage.getItem(`attemptInProgress-${attemptid}`);

        if (savedAttempt) {
          setAttemptInProgress(true);
          setTimer(parseInt(savedTime, 10));
        } else {
          setAttemptInProgress(false);
          setTimer(data.time * 60); // Initialize timer in seconds
        }
      })
      .catch((error) => console.error("Error fetching contest details:", error));
  }, [attemptid]);

  useEffect(() => {
    if (!attemptInProgress || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        const newTime = prevTimer - 1;
        localStorage.setItem(`timer-${attemptid}`, newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup
  }, [attemptInProgress, timer]);

  useEffect(() => {
    if (timer <= 0 && attemptInProgress) {
      setAttemptInProgress(false);
      localStorage.removeItem(`timer-${attemptid}`);
      localStorage.removeItem(`attemptInProgress-${attemptid}`);
      alert("Time's up! Submitting your answers automatically.");
      handleSubmit();
    }
  }, [timer, attemptInProgress]);

  const startAttempt = () => {
    if (!attemptInProgress) {
      setAttemptInProgress(true);
      localStorage.setItem(`attemptInProgress-${attemptid}`, true);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleQuestionChange = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = async () => {
    // Collect the answers in the desired format
    const submissionData = {
      contestID: attemptid,
      answers: contestDetails.questions.map((question, index) => ({
        question: question,
        answer: answers[index],
      })),
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/createSubmission`, submissionData);
      if (response.status === 200) {
        alert("Submission successful!");
        localStorage.removeItem(`timer-${attemptid}`);
        localStorage.removeItem(`attemptInProgress-${attemptid}`);
        setSubmissionDone(true); // Set submissionDone to true
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      alert("Something went wrong, please try again.");
    }
  };

  if (!contestDetails ) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
          fontSize: "40px",
          fontWeight: "bold",
          color: "#6A5ACD",
        }}
      >
        No contest found , <br />Please enter correct Contest ID and try again...
      </div>
    );
  }
  if (submissionDone) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
          fontSize: "40px",
          fontWeight: "bold",
          color: "#6A5ACD",
        }}
      >
        Thank You
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#f4f6f9",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#6A5ACD",
          color: "#fff",
          padding: "15px 20px",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        Contest
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Left Side - Timer and Submit */}
        <div
          style={{
            width: "250px",
            backgroundColor: "#fff",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            margin: "20px",
          }}
        >
          <h3>{formatTime(timer)}</h3>
          {timer <= 70 && timer > 0 && (
            <p style={{ color: "red", fontWeight: "bold" }}>Hurry up!</p>
          )}
          {!attemptInProgress && (
            <button
              onClick={startAttempt}
              style={{
                backgroundColor: "#6A5ACD",
                color: "white",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                marginTop: "20px",
                fontWeight: "bold",
              }}
            >
              Start Attempt
            </button>
          )}
          {attemptInProgress && (<button
            onClick={handleSubmit}
            style={{
              backgroundColor: "#6A5ACD",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
              marginTop: "20px",
              fontWeight: "bold",
            }}
          >
            Submit
          </button>
          )}
        </div>

        {/* Main Content - Questions and Answers */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Question Navigation */}
          {attemptInProgress && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                margin: "20px",
                gap: "10px",
              }}
            >
              {contestDetails.questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionChange(index)}
                  style={{
                    padding: "12px 20px",
                    backgroundColor:
                      currentQuestionIndex === index ? "#6A5ACD" : "#ddd",
                    color: currentQuestionIndex === index ? "#fff" : "#000",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    flex: "1 0 20%",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Question {index + 1}
                </button>
              ))}
            </div>
          )}

          {/* Main Question */}
          {attemptInProgress && (
            <div
              style={{
                flex: 1,
                padding: "20px",
                backgroundColor: "#fff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                margin: "20px",
              }}
            >
              <h2>Question {currentQuestionIndex + 1}</h2>
              <p>{contestDetails.questions[currentQuestionIndex]}</p>
            </div>
          )}

          {/* Answer Section */}
          {attemptInProgress && (
            <div
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                margin: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <h2>Your Answer</h2>
              <textarea
                value={answers[currentQuestionIndex]}
                onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                style={{
                  width: "100%",
                  height: "200px",
                  padding: "10px",
                  fontSize: "16px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                }}
                placeholder="Type your answer here... (please make sure to write the answer of which question you selected)"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestPage;
