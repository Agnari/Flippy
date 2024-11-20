document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".login form");
    const signupForm = document.querySelector(".signup form");

    // API base URL
    const API_BASE_URL = "https://localhost:7045/api/Login";

    // Handle login form submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        // Extract email and password from form inputs
        const email = loginForm.querySelector("input[name='email']").value;
        const password = loginForm.querySelector("input[name='pswd']").value;

        try {
            console.log("login start");
            // Send a POST request to the login endpoint
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Login successful!");
                console.log("Token:", data.token); // Log the token or store it for future use
                // Store the token in localStorage for future API calls
                localStorage.setItem("authToken", data.token);
                // Redirect to the main page
                window.location.href = "main.html";
            } else {
                const error = await response.text();
                alert(`Login failed: ${error}`);
            }
        } catch (err) {
            console.error("Error during login:", err);
            alert("An error occurred during login. Please try again.");
        }
    });

    // Handle signup form submission
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        // Extract username, email, and password from form inputs
        const username = signupForm.querySelector("input[name='txt']").value;
        const email = signupForm.querySelector("input[name='email']").value;
        const password = signupForm.querySelector("input[name='pswd']").value;

        try {
            // Send a POST request to the register endpoint
            console.log("reg start");
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                alert("Registration successful! You can now log in.");
                // Switch to login form
                document.getElementById("chk").checked = false;
            } else {
                const error = await response.text();
                alert(`Registration failed: ${error}`);
            }
        } catch (err) {
            console.error("Error during registration:", err);
            alert("An error occurred during registration. Please try again.");
        }
    });
});
