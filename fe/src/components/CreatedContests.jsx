import React, { useState, useEffect } from "react";

const CreatedContests = ({ user }) => {
  const [contests, setContests] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    
    if(contests.length===0)
    setError("No Contests to show")

  })
  
  // Fetch contests created by the user
  const fetchContests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/viewContests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sub: user.sub }),
      });
      const data = await response.json();
      if (response.ok) {
         setContests(data.data);
         setError("");
      } else {
        setError(data.msg || "Failed to fetch contests.");
      }
    } catch (err) {
      setError("Error fetching contests.");
    }
  };

  // Handle edit button click
  const handleEdit = (contest) => {
    setEditId(contest._id);
    setEditForm({
      name: contest.name,
      time: contest.time,
      questions: [...contest.questions],
    });
  };

  // Handle edit form changes
  const handleEditChange = (field, value, index = null) => {
    if (field === "questions" && index !== null) {
      const updatedQuestions = [...editForm.questions];
      updatedQuestions[index] = value;
      setEditForm((prev) => ({ ...prev, questions: updatedQuestions }));
    } else {
      setEditForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Submit the edit form
  const submitEdit = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/editContest`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ editForm, id }),
      });

      if (response.ok) {
        fetchContests(); // Refresh contests after edit
        setEditId(null);
      } else {
        setError("Failed to update the contest.");
      }
    } catch (err) {
      setError("Error updating contest.");
    }
  };

  // Delete a contest with confirmation
  const deleteContest = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this contest?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deleteContest/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setContests((prev) => prev.filter((contest) => contest._id !== id)); // Remove from UI
      } else {
        setError("Failed to delete the contest.");
      }
    } catch (err) {
      setError("Error deleting contest.");
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <h2 style={{ textAlign: "center", color: "#463E7D" }}>Your Created Contests</h2>
      
      {contests.map((contest) =>
        editId === contest._id ? (
          <div key={contest._id} style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
            <strong style={{ color: "#463E7D" }}>Name</strong>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => handleEditChange("name", e.target.value)}
              placeholder="Contest Name"
              style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <strong style={{ color: "#463E7D" }}>Time</strong>
            <input
              type="number"
              value={editForm.time}
              onChange={(e) => handleEditChange("time", e.target.value)}
              placeholder="Contest Duration"
              style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            {editForm.questions.map((question, index) => (
              <>
                <strong style={{ color: "#463E7D" }}>Question {index + 1}</strong>
                <input
                  key={index}
                  type="text"
                  value={question}
                  onChange={(e) => handleEditChange("questions", e.target.value, index)}
                  placeholder={`Question ${index + 1}`}
                  style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => {
                  if (!editForm.name || !editForm.time) {
                    return alert("Name and Time cannot be empty.");
                  }
                  submitEdit(contest._id);
                }}
                style={{ backgroundColor: "#463E7D", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px" }}
              >
                Save
              </button>
              <button
                onClick={() => setEditId(null)}
                style={{ backgroundColor: "#ccc", color: "#333", border: "none", padding: "10px 20px", borderRadius: "4px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div key={contest._id} style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
            <h3 style={{ color: "#463E7D" }}>{contest.name}</h3>
            <p><strong>Contest id:</strong> {contest._id}</p>
            <p><strong>Time:</strong> {contest.time} minutes</p>
            <p><strong>Number of Questions:</strong> {contest.numQuestions}</p>
            <p><strong>List of Questions:</strong></p>
            <ul>
              {contest.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleEdit(contest)}
                style={{ backgroundColor: "#463E7D", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px" }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteContest(contest._id)}
                style={{ backgroundColor: "red", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px" }}
              >
                Delete
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default CreatedContests;
