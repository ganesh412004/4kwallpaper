const GITHUB_USERNAME = "ganesh412004";
const REPO_NAME = "4kwallpaper";
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/posts`;

const GRADIENT_COLORS = [
    { from: '#667eea', to: '#764ba2' },
    { from: '#f093fb', to: '#f5576c' },
    { from: '#4facfe', to: '#00f2fe' },
    { from: '#43e97b', to: '#38f9d7' },
    { from: '#fa709a', to: '#fee140' },
    { from: '#30cfd0', to: '#330867' },
    { from: '#a8edea', to: '#fed6e3' },
    { from: '#ff9a56', to: '#ff6a88' }
];

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const postsFeed = document.getElementById("postsFeed");
    const staffPicks = document.getElementById("staffPicks");
    const sidebarSearch = document.getElementById("sidebarSearch");
    const htmlEl = document.documentElement;

    // Theme handling
    if (!localStorage.getItem("theme")) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) htmlEl.classList.add('dark-mode');
    }

    themeToggle.addEventListener("click", () => {
        htmlEl.classList.toggle("dark-mode");
        localStorage.setItem("theme", htmlEl.classList.contains("dark-mode") ? "dark" : "light");
    });

    // Generate gradient for post
    function getGradient(index) {
        const color = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
        return `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`;
    }

    // Generate views metric
    function generateViewsMetric(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
            hash |= 0;
        }
        const base = Math.abs(hash % 1050000) + 150000;
        const label = (base >= 1000000) ? (Math.round(base/100000)/10) + 'M' : Math.round(base/1000) + 'K';
        return { num: base, label };
    }

    // Load all posts
    async function loadStoriesFromGitHub() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                postsFeed.innerHTML = '<div class="loading-state"><p>No posts yet. Add JSON files to the posts folder to get started!</p></div>';
                staffPicks.innerHTML = '<div class="loading-text">No posts available</div>';
                return;
            }

            const files = await res.json();
            const jsonFiles = files.filter(file => file.name && file.name.toLowerCase().endsWith('.json'));

            if (jsonFiles.length === 0) {
                postsFeed.innerHTML = '<div class="loading-state"><p>Your posts folder is empty. Add a .json file to get started!</p></div>';
                staffPicks.innerHTML = '<div class="loading-text">No posts available</div>';
                return;
            }

            const fetchPromises = jsonFiles.map(async (file) => {
                try {
                    const r = await fetch(file.download_url);
                    if (!r.ok) return null;
                    const parsed = await r.json();
                    parsed.__filename = file.name;
                    return parsed;
                } catch (jsonErr) {
                    console.error(`Error loading ${file.name}:`, jsonErr);
                    return null;
                }
            });

            let articles = (await Promise.all(fetchPromises)).filter(p => p !== null);
            if (articles.length === 0) {
                postsFeed.innerHTML = '<div class="loading-state"><p>Error parsing posts. Check JSON formatting.</p></div>';
                return;
            }

            // Calculate scores for ranking
            articles = articles.map(a => {
                const views = generateViewsMetric(a.title || 'Untitled');
                a.__viewsNum = views.num;
                a.__viewsLabel = views.label;
                const ageDays = a.date ? ((Date.now() - new Date(a.date)) / (1000*60*60*24)) : 3650;
                a.__ageDays = Math.max(1, ageDays);
                a.__score = (a.__viewsNum / Math.sqrt(a.__ageDays)) * (0.5 + Math.random() * 0.9);
                return a;
            });

            articles.sort((x, y) => y.__score - x.__score);

            // Render feed
            postsFeed.innerHTML = "";
            articles.forEach((post, index) => {
                const dateObj = new Date(post.date || Date.now());
                const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const wordCount = (((post.content || '') + ' ' + (post.subtitle || '')).trim().split(/\s+/).filter(Boolean)).length;
                const readingTime = Math.max(1, Math.ceil(wordCount / 200));
                const viewsLabel = post.__viewsLabel || generateViewsMetric(post.title || 'Untitled').label;

                const card = document.createElement('article');
                card.className = 'post-card';
                card.style.animationDelay = (index * 0.05) + 's';

                const filenameParam = encodeURIComponent(post.__filename || '');
                const gradient = getGradient(index);

                card.innerHTML = `
                    <a href="viewer.html?file=${filenameParam}" style="text-decoration: none; color: inherit;" class="post-link">
                        <div class="post-content">
                            <div>
                                <div class="post-header">
                                    <div class="author-badge">✓</div>
                                    <span>${dateFormatted}</span>
                                </div>
                                <h2 class="post-title">${escapeHtml(post.title || 'Untitled')}</h2>
                                <p class="post-excerpt">${escapeHtml(post.subtitle || '')}</p>
                            </div>
                            <div class="post-meta">
                                <span>${readingTime} min read</span>
                                <span>·</span>
                                <span>${viewsLabel} views</span>
                            </div>
                        </div>
                        <div class="post-image" style="--bg-image: url('${getColorForIndex(index)}'); background: ${gradient};"></div>
                    </a>
                `;

                postsFeed.appendChild(card);
            });

            // Render staff picks (top 3 posts)
            renderStaffPicks(articles.slice(0, 3));

        } catch (err) {
            postsFeed.innerHTML = '<div class="loading-state"><p>Network error. Please refresh.</p></div>';
            console.error('Fetch error:', err);
        }
    }

    function renderStaffPicks(topPosts) {
        staffPicks.innerHTML = "";
        topPosts.forEach((post, index) => {
            const item = document.createElement('div');
            item.className = 'staff-pick-item';
            const filenameParam = encodeURIComponent(post.__filename || '');

            item.innerHTML = `
                <a href="viewer.html?file=${filenameParam}" style="text-decoration: none; color: inherit; display: flex; gap: 12px; width: 100%;">
                    <div class="staff-pick-avatar" style="background: linear-gradient(135deg, ${GRADIENT_COLORS[index].from} 0%, ${GRADIENT_COLORS[index].to} 100%);"></div>
                    <div class="staff-pick-text">
                        <div class="staff-pick-author">Staff Pick</div>
                        <div class="staff-pick-title">${escapeHtml(post.title || 'Untitled')}</div>
                    </div>
                </a>
            `;
            staffPicks.appendChild(item);
        });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getColorForIndex(index) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
        return colors[index % colors.length];
    }

    // Search functionality
    sidebarSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.post-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
        });
    });

    loadStoriesFromGitHub();
});