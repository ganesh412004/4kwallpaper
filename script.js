// REPLACE THIS URL with your live Cloudflare Worker routing target
const API_URL = "https://your-worker-name.your-subdomain.workers.dev/posts";

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const searchInput = document.getElementById("headerSearch");
    const postsFeed = document.getElementById("postsFeed");
    const body = document.body;

    // 1. Core Theme Logic
    if (localStorage.getItem("theme") === "dark") body.classList.add("dark-mode");
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
    });

    // 2. Load Content from Database via Cloudflare Worker
    async function fetchDatabasePosts() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            postsFeed.innerHTML = "";

            if (data.length === 0) {
                postsFeed.innerHTML = '<p class="loading-status">No stories found. Click "Write" to publish your first post!</p>';
                return;
            }

            data.forEach(post => {
                const dateFormatted = new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                });
                
                const card = document.createElement("article");
                card.className = "medium-card";
                card.innerHTML = `
                    <div class="meta-row">Published on ${dateFormatted}</div>
                    <h2>${post.title}</h2>
                    <p>${post.content.length > 160 ? post.content.substring(0, 160) + "..." : post.content}</p>
                `;
                postsFeed.appendChild(card);
            });
        } catch (err) {
            postsFeed.innerHTML = '<p class="loading-status">Error connecting to database feed.</p>';
            console.error(err);
        }
    }

    // 3. Native Search Input Logic
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const stories = document.querySelectorAll(".medium-card");

        stories.forEach(story => {
            const heading = story.querySelector("h2").textContent.toLowerCase();
            const text = story.querySelector("p").textContent.toLowerCase();
            story.style.display = (heading.includes(query) || text.includes(query)) ? "flex" : "none";
        });
    });

    fetchDatabasePosts();
});
