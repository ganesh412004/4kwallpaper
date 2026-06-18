const API_URL = "https://your-worker-name.your-subdomain.workers.dev/posts";

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const editorForm = document.getElementById("editorForm");
    const body = document.body;

    // Theme Management Sync
    if (localStorage.getItem("theme") === "dark") body.classList.add("dark-mode");
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
    });

    // Submit article post request to database
    editorForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const title = document.getElementById("postTitle").value;
        const subtitle = document.getElementById("postSubtitle").value;
        const mainContent = document.getElementById("postContent").value;

        // Combine fields for the simple database format
        const finalContent = `${subtitle}\n\n${mainContent}`;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title, content: finalContent })
            });

            if (response.ok) {
                // Return users directly to homepage to view updated layout feeds
                window.location.href = "index.html";
            } else {
                alert("Database insertion rejected. Verify configurations.");
            }
        } catch (err) {
            console.error(err);
            alert("Error sending transaction request.");
        }
    });
});
