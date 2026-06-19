const GITHUB_USERNAME = "ganesh412004";
const REPO_NAME = "4kwallpaper";
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/posts`;

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const storyContent = document.getElementById("storyContent");
    const htmlEl = document.documentElement;

    // Respect saved preference or system if not set
    if (!localStorage.getItem("theme")) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) htmlEl.classList.add('dark-mode');
    }

    // Theme toggle
    themeToggle.addEventListener("click", () => {
        htmlEl.classList.toggle("dark-mode");
        localStorage.setItem("theme", htmlEl.classList.contains("dark-mode") ? "dark" : "light");
    });

    // Get filename from URL
    const params = new URLSearchParams(window.location.search);
    const filename = params.get('file');

    if (!filename) {
        storyContent.innerHTML = '<p class="loading-status">No story selected.</p>';
        return;
    }

    // Fetch and display the post
    async function loadStory() {
        try {
            const fileUrl = `${API_URL}/${encodeURIComponent(filename)}`;
            const res = await fetch(fileUrl);
            
            if (!res.ok) {
                storyContent.innerHTML = '<p class="loading-status">Story not found.</p>';
                return;
            }

            const fileData = await res.json();
            const contentRes = await fetch(fileData.download_url);
            const post = await contentRes.json();

            // Update page title
            document.title = (post.title || 'Story') + ' - 4kwallpaper';

            // Format date
            const dateFormatted = new Date(post.date || Date.now()).toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long', 
                day: 'numeric' 
            });

            // Calculate reading time
            const wordCount = (((post.content || '') + ' ' + (post.subtitle || '')).trim().split(/\s+/).filter(Boolean)).length;
            const readingTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

            // Escape HTML for safety
            function escapeHtml(str) {
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }

            // Convert markdown-like content to HTML (basic conversion)
            function formatContent(text) {
                let html = escapeHtml(text);
                
                // Preserve line breaks
                html = html.replace(/\n\n/g, '</p><p>');
                html = html.replace(/\n/g, '<br>');
                html = '<p>' + html + '</p>';
                
                // Basic markdown-like support
                html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
                
                return html;
            }

            // Build the story HTML
            storyContent.innerHTML = `
                <a href="index.html" class="back-link">← Back to Feed</a>
                <h1>${escapeHtml(post.title || 'Untitled')}</h1>
                <p class="subtitle">${escapeHtml(post.subtitle || '')}</p>
                <div class="meta">
                    <span>${dateFormatted}</span>
                    <span>&middot;</span>
                    <span>${readingTime}</span>
                </div>
                <div class="content">${formatContent(post.content || '')}</div>
            `;

        } catch (err) {
            storyContent.innerHTML = '<p class="loading-status">Error loading story. Please try again.</p>';
            console.error('Error loading story:', err);
        }
    }

    // Footer modal logic
    const modal = document.getElementById('footerModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    const modalData = {
        about: { 
            title: 'About 4kwallpaper', 
            text: 'Welcome to 4kwallpaper. A curated feed dedicated to providing inspiring, high-resolution content and stories. Posts are stored directly in our GitHub repository and displayed using a Medium-style algorithm.'
        },
        terms: { 
            title: 'Terms & Conditions', 
            text: 'By browsing this application, you agree to access content for personal use only.'
        },
        disclaimer: { 
            title: 'Disclaimer', 
            text: 'All posts and content are community-driven. Content is shared for educational and inspirational purposes only.' 
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

    loadStory();
});