document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;

    // Check if the user already set a preference in a previous session
    const savedTheme = localStorage.getItem("theme");
    
    // Apply the saved theme if it exists
    if (savedTheme === "dark") {
        body.classList.add("dark-mode");
    }

    // Listen for clicks on the toggle button
    themeToggle.addEventListener("click", () => {
        // Toggle the 'dark-mode' class on the body
        body.classList.toggle("dark-mode");
        
        // Save the new preference to local storage
        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });
});
