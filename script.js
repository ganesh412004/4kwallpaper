const GITHUB_USERNAME = "ganesh412004";
const REPO_NAME = "4kwallpaper";
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/posts`;

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const searchInput = document.getElementById("headerSearch");
    const postsFeed = document.getElementById("postsFeed");
    const htmlEl = document.documentElement;

    // --- 1. THEME SWAP MANAGER ---
    themeToggle.addEventListener("click", () => {
        htmlEl.classList.toggle("dark-mode");
        localStorage.setItem("theme", htmlEl.classList.contains("dark-mode") ? "dark" : "light");
    });

    // Simulated views analytic algorithm generator
    function generateViewsCount(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs((hash % 850) + 150) + "K views";
    }

    // --- 2. RESILIENT GITHUB FETCH SYSTEM ---
    async function loadStoriesFromGitHub() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                postsFeed.innerHTML = '<p class="loading-status">Welcome Admin! Create a folder named "posts" in your repo and add your first json post file to begin.</p>';
                return;
            }
            
            const files = await res.json();
            const jsonFiles = files.filter(file => file.name.endsWith('.json'));
            
            if (jsonFiles.length === 0) {
                postsFeed.innerHTML = '<p class="loading-status">Your "posts" folder is empty. Drop a .json file in it to display content.</p>';
                return;
            }

            // SAFE CONCURRENT DOWNLOADS: Prevents 1 corrupted file from crashing the site
            const fetchPromises = jsonFiles.map(async (file) => {
                try {
                    const r = await fetch(file.download_url);
                    if (!r.ok) return null;
                    return await r.json();
                } catch (jsonErr) {
                    // Isolates the specific broken file in the console without interrupting execution
                    console.error(`Skipped broken file [${file.name}]: Check formatting syntax.`, jsonErr);
                    return null;
                }
            });

            // Filter out any broken files that returned null
            let articles = (await Promise.all(fetchPromises)).filter(p => p !== null);

            if (articles.length === 0) {
                postsFeed.innerHTML = '<p class="loading-status">Error: No valid JSON files could be parsed in your /posts folder.</p>';
                return;
            }

            // MEDIUM SHUFFLE DISTRIBUTION MATRIX ALGORITHM
            articles.sort(() => Math.random() - 0.5);

            postsFeed.innerHTML = ""; // Clear loader text

            articles.forEach(post => {
                const dateFormatted = new Date(post.date || Date.now()).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric'
                });

                const wordCount = ((post.content || "") + (post.subtitle || "")).split(/\s+/).length;
                const readingTime = Math.max(1, Math.ceil(wordCount / 200)) + " min read";
                const viewsMetric = generateViewsCount(post.title || "Untitled Wallpapers");

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
                    <h2>${post.title || "Untitled Story"}</h2>
                    <p>${post.subtitle || "No summary description available."}</p>
                `;
                postsFeed.appendChild(card);
            });

        } catch (err) {
            postsFeed.innerHTML = '<p class="loading-status">Critical network connection problem. Try refreshing your browser.</p>';
            console.error("Master fetch fatal crash: ", err);
        }
    }

    // --- 3. RESPONSIVE SEARCH INPUT FILTER ---
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

    // --- 4. AUTOMATED FOOTER MODAL LOGIC ---
    const modal = document.getElementById("footerModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const closeModal = document.getElementById("closeModal");

    const modalData = {
        about: {
            title: "About 4kwallpaper",
            text: "Welcome to 4kwallpaper. We are an curated repository dedicated to providing high-resolution imagery and ultra-HD aesthetic content landscapes. Our dynamic presentation feed updates intelligently using data structures served straight from our open-source cloud repository."
        },
        terms: {
            title: "Terms & Conditions",
            text: "By browsing this application, you agree to access content for personal visualization use cases only. Distribution structures run purely via serverless clients. Code bases and underlying script assets remain under standard creative commons digital permissions."
        },
        disclaimer: {
            title: "Disclaimer",
            text: "All assets hosted within our network paths are shared strictly for community reference. Images and wallpaper structures displayed belong to their respective creators. We do not host premium commercial properties without active structural clearances."
        }
    };

    function openModal(type) {
        modalTitle.textContent = modalData[type].title;
        modalBody.textContent = modalData[type].text;
        modal.classList.add("active");
    }

    document.getElementById("openAbout").addEventListener("click", (e) => { e.preventDefault(); openModal('about'); });
    document.getElementById("openTerms").addEventListener("click", (e) => { e.preventDefault(); openModal('terms'); });
    document.getElementById("openDisclaimer").addEventListener("click", (e) => { e.preventDefault(); openModal('disclaimer'); });

    closeModal.addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", (e) => { if(e.target === modal) modal.classList.remove("active"); });

    loadStoriesFromGitHub();
});
