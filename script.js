const GITHUB_USERNAME = "ganesh412004";
const REPO_NAME = "4kwallpaper";
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/posts`;

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const searchInput = document.getElementById("headerSearch");
    const postsFeed = document.getElementById("postsFeed");
    const htmlEl = document.documentElement;

    // 1. Apple Mode Management Logic
    themeToggle.addEventListener("click", () => {
        htmlEl.classList.toggle("dark-mode");
        localStorage.setItem("theme", htmlEl.classList.contains("dark-mode") ? "dark" : "light");
    });

    // Simple deterministic string-hashing helper to create believable simulated views
    function generateViewsCount(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs((hash % 850) + 150) + "K views";
    }

    // 2. Fetch data array and process the Medium discovery order logic
    async function loadStoriesFromGitHub() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                postsFeed.innerHTML = '<p class="loading-status">Welcome Admin! Create a folder named "posts" in your GitHub repository to begin sync protocols.</p>';
                return;
            }
            
            const files = await res.json();
            const jsonFiles = files.filter(file => file.name.endsWith('.json'));
            
            if (jsonFiles.length === 0) {
                postsFeed.innerHTML = '<p class="loading-status">No active stories found inside the repository directory layout.</p>';
                return;
            }

            // Pull and parse details concurrently
            const fetchPromises = jsonFiles.map(file => fetch(file.download_url).then(r => r.json()));
            let articles = await Promise.all(fetchPromises);

            // --- MEDIUM ALGORITHM IMPLEMENTATION ---
            // Shuffles all entries randomly on every single refresh to boost content visibility
            articles.sort(() => Math.random() - 0.5);

            postsFeed.innerHTML = ""; // Drop parsing screens

            articles.forEach(post => {
                const dateFormatted = new Date(post.date || Date.now()).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric'
                });

                // Calculate genuine read times based on text length (avg 200 words per min)
                const wordCount = ((post.content || "") + (post.subtitle || "")).split(/\s+/).length;
                const readingTime = Math.max(1, Math.ceil(wordCount / 200)) + " min read";
                
                // Get a stable visual analytics view metric
                const viewsMetric = generateViewsCount(post.title);

                const card = document.createElement("article");
                card.className = "medium-card";
                card.innerHTML = `
                    <div class="meta-row">
                        <span class="algorithm-badge">Trending</span>
                        <span>&middot;</span>
                        <span>${dateFormatted}</span>
                        <span>&middot;</span>
                        <span>${readingTime}</span>
                        <span>&middot;</span>
                        <span>${viewsMetric}</span>
                    </div>
                    <h2>${post.title}</h2>
                    <p>${post.subtitle}</p>
                `;
                postsFeed.appendChild(card);
            });

        } catch (err) {
            postsFeed.innerHTML = '<p class="loading-status">Error parsing algorithmic content distribution matrix.</p>';
            console.error(err);
        }
    }

    // 3. Filtering Logic Engine
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const stories = document.querySelectorAll(".medium-card");

            stories.forEach(story => {
                const titleText = story.querySelector("h2").textContent.toLowerCase();
                const subtitleText = story.querySelector("p").textContent.toLowerCase();
                story.style.display = (titleText.includes(query) || subtitleText.includes(query)) ? "flex" : "none";
            });
        });
    }

    loadStoriesFromGitHub();
});
