// Automatically configured for your repository
const GITHUB_USERNAME = "ganesh412004";
const REPO_NAME = "4kwallpaper";
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/posts`;

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const searchInput = document.getElementById("headerSearch");
    const postsFeed = document.getElementById("postsFeed");
    const htmlEl = document.documentElement;

    // 1. Theme Toggle Logic
    themeToggle.addEventListener("click", () => {
        htmlEl.classList.toggle("dark-mode");
        localStorage.setItem("theme", htmlEl.classList.contains("dark-mode") ? "dark" : "light");
    });

    // 2. Fetch posts automatically from your GitHub repository folder
    async function loadStoriesFromGitHub() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                postsFeed.innerHTML = '<p class="loading-status">Welcome! Create a folder named "posts" in your GitHub repository and add your first post to begin.</p>';
                return;
            }
            
            const files = await res.json();
            const jsonFiles = files.filter(file => file.name.endsWith('.json'));
            
            if (jsonFiles.length === 0) {
                postsFeed.innerHTML = '<p class="loading-status">Your feed is empty. Use post.html to create a post!</p>';
                return;
            }

            postsFeed.innerHTML = ""; // Clear loading message

            // Fetch file contents concurrently
            const fetchPromises = jsonFiles.map(file => fetch(file.download_url).then(r => r.json()));
            const articles = await Promise.all(fetchPromises);

            // Sort posts by date (newest first)
            articles.sort((a, b) => new Date(b.date) - new Date(a.date));

            articles.forEach(post => {
                const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                });

                const card = document.createElement("article");
                card.className = "medium-card";
                card.innerHTML = `
                    <div class="meta-row">Published on ${dateFormatted}</div>
                    <h2>${post.title}</h2>
                    <p>${post.subtitle}</p>
                `;
                postsFeed.appendChild(card);
            });

        } catch (err) {
            postsFeed.innerHTML = '<p class="loading-status">Error connecting to your GitHub story feed.</p>';
            console.error(err);
        }
    }

    // 3. Search Bar Filter Logic
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
