const GITHUB_USERNAME = "ganesh412004";
const REPO_NAME = "4kwallpaper";
const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/posts`;

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const storyContent = document.getElementById("storyContent");
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

    // Get filename from URL
    const params = new URLSearchParams(window.location.search);
    const filename = params.get('file');

    console.log("Loading post with filename:", filename);

    if (!filename) {
        storyContent.innerHTML = '<div class="loading-status">No post selected.</div>';
        return;
    }

    // Fetch and display the post
    async function loadStory() {
        try {
            const fileUrl = `${API_URL}/${encodeURIComponent(filename)}`;
            console.log("Fetching from:", fileUrl);
            
            const res = await fetch(fileUrl);
            console.log("Response status:", res.status);
            
            if (!res.ok) {
                storyContent.innerHTML = '<div class="loading-status">Post not found (404).</div>';
                return;
            }

            const fileData = await res.json();
            console.log("File metadata:", fileData);
            
            const contentRes = await fetch(fileData.download_url);
            console.log("Content response status:", contentRes.status);
            
            const post = await contentRes.json();
            console.log("Post loaded:", post.title);

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

            // Convert markdown-like content to HTML
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
                    <span>·</span>
                    <span>${readingTime}</span>
                </div>
                <div class="content">${formatContent(post.content || '')}</div>
            `;

        } catch (err) {
            console.error('Error loading story:', err);
            storyContent.innerHTML = '<div class="loading-status">Error loading story. Please try again.</div>';
        }
    }

    loadStory();
});