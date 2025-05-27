import React, { useCallback, useState, useEffect } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import CreatedContests from "./CreatedContests";


const ContestMode = () => {
  const {user}= useAuth0();
  const navigate=useNavigate()
  const [action, setAction] = useState("");
  const [id,setId]= useState(0)
  const [attemptid,setAttemptid]=useState("")
  const [singleSubmissionDetails,setSingleSubmissionDetails]=useState("")
  const [availableContests, setAvailableContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (action === "attempt-contest") {
      const fetchContests = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/getAllContests`);
          const data = await response.json();
          if (response.ok) {
            setAvailableContests(data.data);
            setError("");
          } else {
            setError(data.msg || "Failed to fetch contests");
          }
        } catch (err) {
          setError("Error fetching contests");
        } finally {
          setLoading(false);
        }
      };

      fetchContests();
    }
  }, [action]);

  const handleActionChange = (e) => {
    setAction(e.target.value);
  };

  const handleNumQuestionsChange = (e) => {
    let value = parseInt(e.target.value, 10) || 0;

    if (value < 1) {
       value = "";
      alert("Number of questions cannot be less than 1.");
    } else if (value > 10) {
       value = "";
      alert("You can add a maximum of 10 questions.");
    }

    setNumQuestions(value);
    setQuestions(new Array(value).fill(""));
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };


  const contestCreated = () => {
    return (
      <div
        style={{
          width: "90%",
          maxWidth: "400px",
          margin: "2em auto",
          padding: "1.5em",
          backgroundColor: "#F9F9FF",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "1em",
            color: "#463E7D",
            fontWeight: "bold",
          }}
        >
          New Contest Created Successfully!
        </h2>

        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: "1em", color: "#555" }}>
            Your contest has been created and is now available for participants.
          </p>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#463E7D",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#6A5ACD")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#463E7D")}
            onClick={() => setAction("created-contests")}
          >
            View Created Contests
          </button>
        </div>
      </div>
    );
  };


  const handleCopy=()=>{
    navigator.clipboard.writeText(id)
    alert("Contest ID copied to clipboard")
  }




  const handleSubmit =async (e) => {
    e.preventDefault();
    // alert(`Time: ${time} mins, Questions: ${questions.join(", ")}`);

    if(!name || !time || !numQuestions || !questions){
      alert("Any field cannot be blank")
    }
    else if(!(numQuestions>=1 && numQuestions<=10)){
      alert("Number of questions can only be be 1-10")
    }
    else{
        console.log("axiioossssss");
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/createContest`,{
          name,
          time,
          numQuestions,
          questions,
          createdBy:user.sub
        })      
        // .then((res)=>res.json())
        .then((res)=>{
            setAction("created")
            // console.log(res);
            setId(res.data.id)
        })
        .catch((err)=>{
          console.log(err);
        })

    }
  };







  const ContestSubmissions = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedContest, setSelectedContest] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [showSubmissions, setShowSubmissions] = useState(false);

    // Fetch all contests
    useEffect(() => {
      const fetchContests = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/getAllContests`);
          const data = await response.json();
          if (response.ok) {
            setContests(data.data);
            setError("");
          } else {
            setError(data.msg || "Failed to fetch contests");
          }
        } catch (err) {
          setError("Error fetching contests");
        } finally {
          setLoading(false);
        }
      };

      fetchContests();
    }, []);

    // Fetch submissions for a specific contest
    const fetchSubmissions = async (contestId) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/getSubmission?id=${contestId}`);
        const data = await response.json();
        if (response.ok) {
          setSubmissions(data.data);
          setShowSubmissions(true);
        } else {
          setError(data.msg || "Failed to fetch submissions");
        }
      } catch (err) {
        setError("Error fetching submissions");
      }
    };

    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "2em" }}>
          Loading contests...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ color: "red", textAlign: "center", padding: "2em" }}>
          {error}
        </div>
      );
    }

    return (
      <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ color: "#463E7D", textAlign: "center", marginBottom: "1.5em" }}>
          Contest Submissions
        </h2>

        {!showSubmissions ? (
          // Show contest list
          <div className="contest-list">
            {contests.length === 0 ? (
              <div style={{ textAlign: "center" }}>No contests available</div>
            ) : (
              contests.map((contest) => (
                <div
                  key={contest._id}
                  style={{
                    padding: "1.5em",
                    marginBottom: "1em",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3 style={{ color: "#463E7D", marginBottom: "0.5em" }}>
                    {contest.name}
                  </h3>
                  <p style={{ marginBottom: "0.5em" }}>
                    <strong>Duration:</strong> {contest.time} minutes
                  </p>
                  <p style={{ marginBottom: "0.5em" }}>
                    <strong>Questions:</strong> {contest.numQuestions}
                  </p>
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#463E7D",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#6A5ACD")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#463E7D")}
                    onClick={() => {
                      setSelectedContest(contest);
                      fetchSubmissions(contest._id);
                    }}
                  >
                    View Submissions
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          // Show submissions for selected contest
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1em" }}>
              <h3 style={{ color: "#463E7D" }}>
                Submissions for {selectedContest.name}
              </h3>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowSubmissions(false);
                  setSelectedContest(null);
                  setSubmissions([]);
                }}
              >
                Back to Contests
              </button>
            </div>

            {submissions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2em" }}>
                No submissions found for this contest
              </div>
            ) : (
              <div className="submissions-list">
                {submissions.map((submission, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "1em",
                      marginBottom: "1em",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      backgroundColor: "white",
                    }}
                  >
                    <p><strong>User:</strong> {submission.userName}</p>
                    <p><strong>Submission Time:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
                    <p><strong>Score:</strong> {submission.score || "Not evaluated"}</p>
                    <button
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#463E7D",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => viewSubmissionDetails(submission)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  

// Assuming this function is used to send feedback
const submitFeedback = async (subID,logic,efficiency,codingStyle,clarity,custom) => {
  const feedback = {
      logic,
      efficiency,
      codingStyle,
      clarity,
      custom
  };
try {
     await fetch(`${import.meta.env.VITE_BACKEND_URL}/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subID,  // The ID of the submission you are updating
            feedback: feedback,
            name:user.name  // The reviewer's name who is submitting the feedback
        }),
    });
    alert("Feedback Submitted")
  
} catch (error) {
  console.log(error);
}
};



  const viewSubmissionDetails = (submission) => {
    return (
      <div
        style={{
          width: "90%",
          maxWidth: "600px",
          margin: "2em auto",
          padding: "1.5em",
          backgroundColor: "#F9F9FF",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            marginBottom: "1em",
            color: "#463E7D",
            fontWeight: "bolder",
          }}
        >
          Submission Details
        </h3>
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            marginBottom: "1.5em",
          }}
        >
          <h4 style={{ color: "#463E7D", fontWeight: "bold" }}>Submission ID:</h4>
          <p>{submission._id}</p>
  
          <h4 style={{ color: "#463E7D", fontWeight: "bold" }}>Contest ID:</h4>
          <p>{submission.contestID}</p>
  
          <h4 style={{ color: "#463E7D", fontWeight: "bold" }}>Submitted At:</h4>
          <p>{new Date(submission.submittedAt).toLocaleString()}</p>
  
          <h4 style={{ color: "#463E7D", fontWeight: "bold" }}>Answers:</h4>
          <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
            {submission.answers.map((answer, index) => (
              <li
                key={answer._id}
                style={{
                  backgroundColor: "#f9f9f9",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <p style={{ margin: "5px 0", color: "#555" }}>
                  <strong>Question {index + 1}:</strong> {answer.question}
                </p>
                <p style={{ margin: "5px 0", color: "#555" }}>
                  <strong>Your Answer:</strong> {answer.answer}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setAction("view-submissions")}
          style={{
            width: "100%",
            padding: "10px 15px",
            backgroundColor: "#463E7D",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          Back to Submissions
        </button>
      </div>
    );
  };
  
function nameHandle(e){
  setName(e.target.value)
}

  const [numQuestions, setNumQuestions] = useState(0);
  const [time, setTime] = useState("");
  const [questions, setQuestions] = useState([]);
  const [name, setName]=useState("")


  const createContest = useCallback(() => (
    
    <div
      style={{
        width: "90%",
        maxWidth: "600px",
        margin: "2em auto",
        padding: "1.5em",
        backgroundColor: "#F9F9FF",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h4
        style={{
          textAlign: "center",
          marginBottom: "1em",
          color: "#463E7D",
          fontWeight: "bolder",
        }}
      >
        Create Your Contest
      </h4>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1em" }}>
        <label style={{ fontWeight: "bold", color: "#555" }}>
            Name of the Contest:
          </label>
          <input
            type="text"
            value={name}
            onChange={nameHandle}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              marginTop: "5px",
              outline: "none",
            }}
          />
          <label style={{ fontWeight: "bold", color: "#555" }}>
            Number of Questions:
          </label>
          <input
            type="number"
            value={numQuestions}
            onChange={handleNumQuestionsChange}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              marginTop: "5px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: "1em" }}>
          <label style={{ fontWeight: "bold", color: "#555" }}>
            Time (in minutes):
          </label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              marginTop: "5px",
              outline: "none",
            }}
          />
        </div>

        {questions.map((_, index) => (
          <div key={index} style={{ marginBottom: "1em" }}>
            <label style={{ fontWeight: "bold", color: "#555" }}>
              Question {index + 1}:
            </label>
            <input
              type="text"
              value={questions[index]}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              placeholder={`Enter question ${index + 1}`}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                marginTop: "5px",
                outline: "none",
              }}
            />
          </div>
        ))}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px 15px",
            backgroundColor: "#463E7D",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#6A5ACD")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#463E7D")}
        >
          Submit
        </button>
      </form>
    </div>
  ));
        


  const attemptContest = () => (
    <div
      style={{
        width: "90%",
        maxWidth: "800px",
        margin: "2em auto",
        padding: "1.5em",
        backgroundColor: "#F9F9FF",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1em",
          color: "#463E7D",
          fontWeight: "bold",
        }}
      >
        Available Contests
      </h2>

      {loading ? (
        <div style={{ textAlign: "center" }}>Loading contests...</div>
      ) : error ? (
        <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      ) : availableContests.length === 0 ? (
        <div style={{ textAlign: "center" }}>No contests available</div>
      ) : (
        <div className="contest-list">
          {availableContests.map((contest) => (
            <div
              key={contest._id}
              style={{
                padding: "1em",
                marginBottom: "1em",
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "white",
              }}
            >
              <h3 style={{ color: "#463E7D", marginBottom: "0.5em" }}>
                {contest.name}
              </h3>
              <p style={{ marginBottom: "0.5em" }}>
                <strong>Duration:</strong> {contest.time} minutes
              </p>
              <p style={{ marginBottom: "0.5em" }}>
                <strong>Questions:</strong> {contest.numQuestions}
              </p>
              <button
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#463E7D",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#6A5ACD")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#463E7D")}
                onClick={() => navigate(`/contest-mode/contest-page/${contest._id}`)}
              >
                Attempt Contest
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <h1 style={{ textAlign: "center", padding: "1em", color: "#463E7D" }}>
        Create/Attempt Contest
      </h1>

      <div style={{ textAlign: "center", marginBottom: "1em" }}>
        <h3 style={{textDecoration:"underline", color: "#555", fontWeight: "bold" }}>
          Please select your action :-
        </h3>
        <select
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            outline: "none",
            cursor: "pointer",
          }}
          value={action}
          onChange={handleActionChange}
        >
          <option value="">---Select an option---</option>
          <option value="create-contest">Create a new contest</option>
          <option value="attempt-contest">Attempt a contest</option>
          <option value="view-submissions">View submissions</option>
          <option value="created-contests">Created contests</option>
        </select>
      </div>

      {action === "create-contest" && createContest()}
      {action === "attempt-contest" && attemptContest()}
      {action === "created" && contestCreated()}
      {action === "view-submissions" && <ContestSubmissions/>}
      {action === "view-single-submission" && viewSubmissionDetails(singleSubmissionDetails)}
      {action === "created-contests" && <CreatedContests user={user}/>}
    </>
  );
};

export default ContestMode;



