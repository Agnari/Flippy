document.addEventListener("DOMContentLoaded", async () => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
        try {
            // Fetch user details from the backend
            const userResponse = await fetch("https://localhost:7045/api/User/username", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();

                // Update the DOM with user data
                document.getElementById("username").textContent = userData.username || "User";

                // Fetch user statistics from the backend
                const statsResponse = await fetch("https://localhost:7045/api/Game/statistics", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`
                    }
                });

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();

                    // Update the DOM with user statistics data
                    document.getElementById("best-score").textContent = statsData.bestScore || 0;
                    document.getElementById("fastest-game").textContent = statsData.shortestTime || "0s";
                    document.getElementById("fastest-moves").textContent = statsData.shortestMoves || 0;
                    document.getElementById("total-trivia-answered").textContent = statsData.answeredTriviaPercentage.toFixed(2) + "%" || 0;
                    document.getElementById("win-percentage").textContent = statsData.winPercentage.toFixed(2) + "%" || 0;
                } else {
                    console.error("Error fetching user statistics:", statsResponse.statusText);
                    alert("Unable to load user statistics.");
                }

            } else if (userResponse.status === 401) {
                // Unauthorized, token might be invalid or expired
                alert("Session expired. Please log in again.");
                logout();
            } else {
                console.error("Error fetching user details:", userResponse.statusText);
                alert("Unable to load user information.");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("An unexpected error occurred. Please try again later.");
        }
    } else {
        // No token found, redirect to login page
        alert("You are not logged in. Redirecting to the login page...");
        window.location.href = "login_register.html";
    }
});

function openModal() {
    document.getElementById("password-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("password-modal").style.display = "none";
}

async function changePassword() {
    const authToken = localStorage.getItem("authToken");
    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match.");
        return;
    }

    try {
        const response = await fetch("https://localhost:7045/api/User/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                oldPassword,
                newPassword
            })
        });

        if (response.ok) {
            alert("Password changed successfully.");
            closeModal();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || "Unable to change password."}`);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("An unexpected error occurred. Please try again later.");
    }
}

function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "main.html";
}

// Close modal when clicking outside of it
window.onclick = function (event) {
    const modal = document.getElementById("password-modal");
    if (event.target === modal) {
        closeModal();
    }
};
