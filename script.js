const GITHUB_USERNAME = "ganesh412004";
const REPO_NAME = "4kwallpaper";
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/posts`;

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const searchInput = document.getElementById("headerSearch");
    const postsFeed = document.getElementById("postsFeed");
    const htmlEl = document.documentElement;

    // Respect saved preference or system if not set
    if (!localStorage.getItem("theme")) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) htmlEl.classList.add('dark-mode');
    }

    // --- ENHANCED THEME SWAP MANAGER ---
    themeToggle.addEventListener("click", () => {
        htmlEl.classList.toggle("dark-mode");
        localStorage.setItem("theme", htmlEl.classList.contains("dark-mode") ? "dark" : "light");
    });

    // Generate a deterministic numeric view count and formatted label
    function generateViewsMetric(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
            hash |= 0; // force 32bit
        }
        // base between 150k and 1.2M
        const base = Math.abs(hash % 1050000) + 150000;
        // return numeric and label
        const label = (base >= 1000000) ? (Math.round(base/100000)/10) + 'M views' : Math.round(base/1000) + 'K views';
        return { num: base, label };
    }

    // Download and parse all JSON posts safely, keeping filename
    async function loadStoriesFromGitHub() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                postsFeed.innerHTML = '<p class="loading-status">Welcome! Posts folder is empty. Add your first JSON post file to begin.</p>';
                return;
            }

            const files = await res.json();
            const jsonFiles = files.filter(file => file.name && file.name.toLowerCase().endsWith('.json'));

            if (jsonFiles.length === 0) {
                postsFeed.innerHTML = '<p class="loading-status">Your "posts" folder is empty. Add a .json file to display content.</p>';
                return;
            }

            const fetchPromises = jsonFiles.map(async (file) => {
                try {
                    const r = await fetch(file.download_url);
                    if (!r.ok) return null;
                    const parsed = await r.json();
                    // Attach filename for linking to post viewer
                    parsed.__filename = file.name;
                    return parsed;
                } catch (jsonErr) {
                    console.error(`Skipped broken file [${file.name}]: Check formatting syntax.`, jsonErr);
                    return null;
                }
            });

            let articles = (await Promise.all(fetchPromises)).filter(p => p !== null);
            if (articles.length === 0) {
                postsFeed.innerHTML = '<p class="loading-status">Error: No valid JSON files could be parsed in your /posts folder.</p>';
                return;
            }

            // Compute a view metric for each and a lightweight ranking score (weighted randomness like Medium)
            articles = articles.map(a => {
                const views = generateViewsMetric(a.title || 'Untitled');
                a.__viewsNum = views.num;
                a.__viewsLabel = views.label;
                // freshness weight (newer posts get slight bump) if date exists
                const ageDays = a.date ? ((Date.now() - new Date(a.date)) / (1000*60*60*24)) : 3650;
                a.__ageDays = Math.max(1, ageDays);
                // Medium-style algorithm: views weighted by freshness + randomness factor
                a.__score = (a.__viewsNum / Math.sqrt(a.__ageDays)) * (0.5 + Math.random() * 0.9);
                return a;
            });

            // Sort by score desc with integrated randomness
            articles.sort((x, y) => y.__score - x.__score);

            // Render
            postsFeed.innerHTML = "";

            articles.forEach((post, index) => {
                const dateFormatted = new Date(post.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const wordCount = (((post.content || '') + ' ' + (post.subtitle || '')).trim().split(/\s+/).filter(Boolean)).length;
                const readingTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
                const viewsMetric = post.__viewsLabel || generateViewsMetric(post.title || 'Untitled').label;

                const card = document.createElement('article');
                card.className = 'medium-card';
                card.style.animationDelay = (index * 0.1) + 's';

                // Link to post viewer with filename param
                const filenameParam = encodeURIComponent(post.__filename || '');
                card.innerHTML = `
                    <a class="card-link" href="viewer.html?file=${filenameParam}" aria-label="Open story ${escapeHtml(post.title || 'story')}">
                        <div class="meta-row">
                            <span class="algorithm-badge">Popular</span>
                            <span>&middot;</span>
                            <span>${dateFormatted}</span>
                            <span>&middot;</span>
                            <span>${readingTime}</span>
                            <span>&middot;</span>
                            <span>${viewsMetric}</span>
                        </div>
                        <h2>${escapeHtml(post.title || 'Untitled Story')}</h2>
                        <p>${escapeHtml(post.subtitle || 'No summary description available.')}</p>
                    </a>
                `;

                postsFeed.appendChild(card);
            });

        } catch (err) {
            postsFeed.innerHTML = '<p class="loading-status">Network connection issue. Please refresh your browser.</p>';
            console.error('Fetch error: ', err);
        }
    }

    // Utility: simple escape to avoid injecting HTML from posts
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- SEARCH FUNCTIONALITY ---
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const q = e.target.value.toLowerCase().trim();
                const cards = document.querySelectorAll('.medium-card');
                let visibleCount = 0;
                cards.forEach(card => {
                    const text = (card.textContent || '').toLowerCase();
                    const isVisible = !q || text.includes(q);
                    card.style.display = isVisible ? 'flex' : 'none';
                    if (isVisible) visibleCount++;
                });
                if (visibleCount === 0 && q) {
                    const noResults = document.createElement('p');
                    noResults.className = 'loading-status';
                    noResults.textContent = 'No stories found matching your search.';
                    postsFeed.appendChild(noResults);
                }
            }, 300);
        });
    }

    // Footer modal logic
    const modal = document.getElementById('footerModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    const modalData = {
        about: { 
            title: 'About 4kwallpaper', 
            text: 'Welcome to 4kwallpaper. A curated feed dedicated to providing inspiring, high-resolution content and stories. Posts are stored directly in our GitHub repository and displayed using a Medium-style algorithm that balances popularity with freshness.'
        },
        terms: { 
            title: 'Terms & Conditions', 
            text: 'By browsing this application, you agree to access content for personal use only. All content is sourced from our community and GitHub repository.'
        },
        disclaimer: { 
            title: 'Disclaimer', 
            text: 'All posts and content are community-driven. We do not claim ownership of all materials. Content is shared for educational and inspirational purposes only.' 
        }
    };

    function openModal(type) {
        modalTitle.textContent = modalData[type].title;
        modalBody.textContent = modalData[type].text;
        modal.classList.add('active');
    }

    document.getElementById('openAbout').addEventListener('click', (e) => { e.preventDefault(); openModal('about'); });
    document.getElementById('openTerms').addEventListener('click', (e) => { e.preventDefault(); openModal('terms'); });
    document.getElementById('openDisclaimer').addEventListener('click', (e) => { e.preventDefault(); openModal('disclaimer'); });

    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    loadStoriesFromGitHub();
});