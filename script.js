document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const searchInput = document.getElementById("headerSearch");
    const body = document.body;

    // --- 1. THEME TOGGLE LOGIC ---
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        body.classList.add("dark-mode");
    }

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });

    // --- 2. FULLY WORKING SEARCH BAR LOGIC ---
    searchInput.addEventListener("input", (e) => {
        const searchQuery = e.target.value.toLowerCase().trim();
        const posts = document.querySelectorAll(".post-card");

        posts.forEach(post => {
            const title = post.querySelector("h3").textContent.toLowerCase();
            const description = post.querySelector("p").textContent.toLowerCase();

            // If the query matches either the title or text body, display it. Otherwise, hide it.
            if (title.includes(searchQuery) || description.includes(searchQuery)) {
                post.style.display = "block";
            } else {
                post.style.display = "none";
            }
        });
    });

    // Listen for the "Enter" key inside search
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            console.log("Search executed for: ", searchInput.value);
            // Optional: Add logic to fetch distinct results from Cloudflare backend here later
        }
    });
});
