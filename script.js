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

    console.log("Page loaded. Starting to fetch posts...");

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

    // Get random Medium-style placeholder image
    function getPlaceholderImageUrl(index) {
        const placeholders = [
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop',
            'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=300&fit=crop',
            'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=300&fit=crop',
            'https://images.unsplash.com/photo-1516321318423-f06b1b504d4a?w=600&h=300&fit=crop',
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=300&fit=crop',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=300&fit=crop',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=300&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop'
        ];
        return placeholders[index % placeholders.length];
    }

    // Load all posts
    async function loadStoriesFromGitHub() {
        try {
            console.log("Fetching from:", API_URL);
            const res = await fetch(API_URL);
            console.log("Response status:", res.status, res.ok);
            
            if (!res.ok) {
                console.log("API not OK, showing empty state");
                postsFeed.innerHTML = '<div class="loading-state"><p>📝 No posts yet. Add JSON files to the <code>posts</code> folder in your repo to get started!</p></div>';
                staffPicks.innerHTML = '<div class="loading-text">No posts yet</div>';
                return;
            }

            const files = await res.json();
            console.log("Files found:", files.length);
            
            if (!Array.isArray(files)) {
                console.error("Response is not an array:", files);
                postsFeed.innerHTML = '<div class="loading-state"><p>⚠️ Error: posts folder structure invalid</p></div>';
                return;
            }
            
            const jsonFiles = files.filter(file => file.name && file.name.toLowerCase().endsWith('.json'));
            console.log("JSON files found:", jsonFiles.length, jsonFiles.map(f => f.name));

            if (jsonFiles.length === 0) {
                console.log("No JSON files found");
                postsFeed.innerHTML = '<div class="loading-state"><p>📂 Your posts folder is empty. Add a .json file to get started!</p></div>';
                staffPicks.innerHTML = '<div class="loading-text">No posts available</div>';
                return;
            }

            const fetchPromises = jsonFiles.map(async (file) => {
                try {
                    console.log("Fetching post file:", file.name);
                    const r = await fetch(file.download_url);
                    if (!r.ok) {
                        console.error(`Failed to fetch ${file.name}:`, r.status);
                        return null;
                    }
                    const parsed = await r.json();
                    parsed.__filename = file.name;
                    console.log("Parsed post:", parsed.title);
                    return parsed;
                } catch (jsonErr) {
                    console.error(`Error loading ${file.name}:`, jsonErr);
                    return null;
                }
            });

            let articles = (await Promise.all(fetchPromises)).filter(p => p !== null);
            console.log("Valid articles loaded:", articles.length);
            
            if (articles.length === 0) {
                console.error("All articles failed to parse");
                postsFeed.innerHTML = '<div class="loading-state"><p>⚠️ Error parsing posts. Check JSON formatting in your posts.</p></div>';
                return;
            }

            // Calculate scores for ranking
            articles = articles.map((a, i) => {
                const views = generateViewsMetric(a.title || 'Untitled');
                a.__viewsNum = views.num;
                a.__viewsLabel = views.label;
                const ageDays = a.date ? ((Date.now() - new Date(a.date)) / (1000*60*60*24)) : 0.1;
                a.__ageDays = Math.max(1, ageDays);
                a.__score = (a.__viewsNum / Math.sqrt(a.__ageDays)) * (0.5 + Math.random() * 0.9);
                a.__index = i;
                return a;
            });

            articles.sort((x, y) => y.__score - x.__score);
            console.log("Articles sorted by score");

            // Render feed
            postsFeed.innerHTML = "";
            articles.forEach((post, index) => {
                const dateObj = new Date(post.date || Date.now());
                const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const wordCount = (((post.content || '') + ' ' + (post.subtitle || '')).trim().split(/\s+/).filter(Boolean)).length;
                const readingTime = Math.max(1, Math.ceil(wordCount / 200));
                const viewsLabel = post.__viewsLabel || generateViewsMetric(post.title || 'Untitled').label;
                const imageUrl = getPlaceholderImageUrl(index);

                const card = document.createElement('article');
                card.className = 'post-card';
                card.style.animationDelay = (index * 0.05) + 's';

                const filenameParam = encodeURIComponent(post.__filename || '');

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
                        <div class="post-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"></div>
                    </a>
                `;

                postsFeed.appendChild(card);
            });

            console.log("Feed rendered with", articles.length, "posts");
            // Render staff picks (top 3 posts)
            renderStaffPicks(articles.slice(0, 3));

        } catch (err) {
            console.error('Critical fetch error:', err);
            postsFeed.innerHTML = '<div class="loading-state"><p>🔴 Network error. Please check console and refresh.</p></div>';
        }
    }

    function renderStaffPicks(topPosts) {
        staffPicks.innerHTML = "";
        if (topPosts.length === 0) {
            staffPicks.innerHTML = '<div class="loading-text">No posts available</div>';
            return;
        }
        
        topPosts.forEach((post, index) => {
            const item = document.createElement('div');
            item.className = 'staff-pick-item';
            const filenameParam = encodeURIComponent(post.__filename || '');
            const imageUrl = getPlaceholderImageUrl(index);

            item.innerHTML = `
                <a href="viewer.html?file=${filenameParam}" style="text-decoration: none; color: inherit; display: flex; gap: 12px; width: 100%;">
                    <div class="staff-pick-avatar" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"></div>
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

    // Search functionality
    if (sidebarSearch) {
        sidebarSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.post-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    loadStoriesFromGitHub();
});