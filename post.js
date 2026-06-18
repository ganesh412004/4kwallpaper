// Automatically configured for your repository
const GITHUB_USERNAME = "ganesh412004";
const REPO_NAME = "4kwallpaper";

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    const editorForm = document.getElementById("editorForm");
    const htmlEl = document.documentElement;

    themeToggle.addEventListener("click", () => {
        htmlEl.classList.toggle("dark-mode");
        localStorage.setItem("theme", htmlEl.classList.contains("dark-mode") ? "dark" : "light");
    });

    editorForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("postTitle").value;
        const subtitle = document.getElementById("postSubtitle").value;
        const content = document.getElementById("postContent").value;
        const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

        // Formats data layout structure
        const jsonOutput = {
            title: title,
            subtitle: subtitle,
            content: content,
            date: todayStr
        };

        // Makes a clean, URL-friendly file name from the title
        const cleanFileName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'story';

        // Copies the JSON automatically into your clipboard memory
        navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2)).then(() => {
            alert(`Success! Post code copied to your clipboard.\n\nFile Name: ${cleanFileName}.json\n\nYou will now be sent directly to GitHub. Just click paste (Ctrl+V / Cmd+V) and commit the file!`);
            
            // Seamlessly opens the exact folder destination layout in your repository
            window.location.href = `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/new/main/posts?filename=${cleanFileName}.json`;
        }).catch(err => {
            console.error("Clipboard failed: ", err);
            alert("Could not copy code automatically. Please manually copy the data output.");
        });
    });
});
