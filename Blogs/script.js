// ========================================
// FIREBASE IMPORT
// ========================================

import { db } from "../js/firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================================
// EXISTING STATIC BLOGS
// ========================================

const staticBlogs = [
    {
        id: "static-1",
        title: "Top 10 AI Tools for App Developers",
        description: "Discover the best AI tools to speed up your app development workflow.",
        slug: "Top-10-AI-Tools",
        category: "AI Tools",
        date: "August 2026",
        readTime: "12 min read",
        icon: "🚀",
        image: "",
        featured: true,
        source: "static"
    },
    {
        id: "static-2",
        title: "AI for App Building",
        description: "Discover how AI tools are transforming modern app development.",
        slug: "AI-for-App-Building",
        category: "Development By AI",
        date: "August 2026",
        readTime: "12 min read",
        icon: "🚀",
        image: "",
        featured: false,
        source: "static"
    },
    {
        id: "static-3",
        title: "What Are Large Language Models (LLMs)? A Complete Beginner's Guide",
        description: "Power of a Large Language Model (LLM).",
        slug: "LLMs-A-Beginner's Guide",
        category: "AI Trends",
        date: "July 21, 2026",
        readTime: "15 min read",
        icon: "💡",
        image: "",
        featured: false,
        source: "static"
    },
    {
        id: "static-4",
        title: "How Machine Learning Works with Real Examples",
        description: "Every time you unlock your phone with your face, scroll through personalized video recommendations on YouTube, or receive a text message warning you about a suspicious credit card transaction, you are interacting with Machine Learning (ML).",
        slug: "Machine-Learning-Works",
        category: "AI Basics",
        date: "July 2026",
        readTime: "10 min read",
        icon: "⚙️",
        image: "",
        featured: false,
        source: "static"
    },
    {
        id: "static-5",
        title: "Install and Set Up Nepali Unicode Keyboard on Windows, Mac, Android, and iOS",
        description: "A complete, multi-platform guide to setting up native Devanagari typing on all your devices.",
        slug: "Set-Up-Nepali-Unicode-Keyboard",
        category: "Setup",
        date: "July 2026",
        readTime: "8 min read",
        icon: "🔑",
        image: "",
        featured: false,
        source: "static"
    },
    {
        id: "static-6",
        title: "AI Automation with n8n – Complete Beginner Guide",
        description: "Learn how to automate repetitive tasks using AI, APIs, Google Sheets, and n8n workflows.",
        slug: "ai-automation-with-n8n",
        category: "Automation",
        date: "July 2026",
        readTime: "8 min read",
        icon: "🤖",
        image: "",
        featured: false,
        source: "static"
    },
    {
        id: "static-7",
        title: "What is AI? A Beginner's Guide",
        description: "A complete breakdown of Artificial Intelligence, Machine Learning, and Generative AI for total beginners.",
        slug: "what-is-ai",
        category: "AI Basics",
        date: "July 21, 2026",
        readTime: "6 min read",
        icon: "💡",
        image: "",
        featured: false,
        source: "static"
    },
    {
        id: "static-8",
        title: "How AI is Growing in the World",
        description: "Discover how Artificial Intelligence is transforming major global industries, workforce dynamics, and the future economy.",
        slug: "how-ai-is-growing-in-the-world",
        category: "AI Trends",
        date: "July 2026",
        readTime: "7 min read",
        icon: "🌐",
        image: "",
        featured: false,
        source: "static"
    },
    {
        id: "static-9",
        title: "AI for Data Analysis: A Complete Beginner's Guide & Key Learnings",
        description: "Discover how Artificial Intelligence is transforming major global industries, workforce dynamics, and the future economy.",
        slug: "AI-for-Data-Analysis",
        category: "AI Trends",
        date: "August 2026",
        readTime: "10 min read",
        icon: "🎓",
        image: "",
        featured: false,
        source: "static"
    },
    {
        id: "static-10",
        title: "Best AI Tools for Students in 2026",
        description: "Boost your productivity with top AI tools for research, literature review, writing, coding, and exam preparation.",
        slug: "best-ai-tools-for-students",
        category: "Productivity",
        date: "July 2026",
        readTime: "5 min read",
        icon: "🎓",
        image: "",
        featured: false,
        source: "static"
    }
];


// ========================================
// ALL BLOGS
// ========================================

let blogs = staticBlogs.slice();


// ========================================
// STATE
// ========================================

let currentCategory = "All";
let searchQuery = "";
let currentSort = "newest";
let bookmarkedIds = new Set();


// ========================================
// DOM ELEMENTS
// ========================================

const blogGrid = document.getElementById("blogGrid");
const featuredContainer = document.getElementById("featuredContainer");
const categoryContainer = document.getElementById("categoryContainer");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const sortSelect = document.getElementById("sortSelect");
const articleCount = document.getElementById("articleCount");
const themeToggleBtn = document.getElementById("themeToggle");
const toast = document.getElementById("toast");


// ========================================
// SCRIPT START
// ========================================

console.log("🔥 BLOG SCRIPT STARTED");
console.log("🔥 Firebase DB:", db);


// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", function () {
    console.log("🔥 DOM LOADED");
    initTheme();
    setupEventListeners();
    renderCategories();
    renderBlogs();
    loadCMSBlogs();
});


// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", clearSearch);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", function (event) {
            currentSort = event.target.value;
            renderBlogs();
        });
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", toggleTheme);
    }
}


// ========================================
// LOAD CMS BLOGS
// ========================================

async function loadCMSBlogs() {
    console.log("🔥 loadCMSBlogs() STARTED");

    try {
        console.log("🔥 Firebase Project:", db.app.options.projectId);

        // --------------------------------
        // FIRESTORE COLLECTION
        // --------------------------------
        const blogsRef = collection(db, "blogs");
        const querySnapshot = await getDocs(blogsRef);

        const cmsBlogs = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            cmsBlogs.push({
                id: doc.id,
                title: data.title || "Untitled Blog",
                description: data.description || "No description available.",
                slug: data.slug || doc.id,
                category: data.category || "General",
                date: data.date || new Date().toLocaleDateString(),
                readTime: data.readTime || "5 min read",
                icon: data.icon || "📄",
                image: data.image || "",
                featured: data.featured || false,
                source: "cms"
            });
        });

        console.log(`🔥 Loaded ${cmsBlogs.length} blogs from Firestore`);

        // Merge static and CMS blogs
        blogs = [...staticBlogs, ...cmsBlogs];

        // Re-render everything with the new data
        renderCategories();
        renderBlogs();

    } catch (error) {
        console.error("🔥 Error fetching CMS blogs:", error);
        showToast("Failed to load newer articles.");
    }
}


// ========================================
// RENDER CATEGORIES
// ========================================

function renderCategories() {
    if (!categoryContainer) return;

    // Get unique categories
    const categories = ["All", ...new Set(blogs.map(blog => blog.category))];

    categoryContainer.innerHTML = "";

    categories.forEach(category => {
        const btn = document.createElement("button");
        btn.className = `category-btn ${currentCategory === category ? "active" : ""}`;
        btn.textContent = category;
        
        btn.addEventListener("click", () => {
            currentCategory = category;
            // Update active class
            document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            renderBlogs();
        });

        categoryContainer.appendChild(btn);
    });
}


// ========================================
// RENDER BLOGS
// ========================================

function renderBlogs() {
    if (!blogGrid) return;

    // 1. Filter
    let filteredBlogs = blogs.filter(blog => {
        const matchesCategory = currentCategory === "All" || blog.category === currentCategory;
        const matchesSearch = blog.title.toLowerCase().includes(searchQuery) || 
                              blog.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    // 2. Sort
    if (currentSort === "a-z") {
        filteredBlogs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === "newest") {
        // Simple reverse for static demo; robust app would parse Date strings
        filteredBlogs.reverse();
    }

    // 3. Separate Featured (Optional logic - only show featured if no search and "All" category)
    const featuredBlog = filteredBlogs.find(b => b.featured);
    if (featuredContainer && featuredBlog && currentCategory === "All" && !searchQuery) {
        featuredContainer.innerHTML = createBlogHTML(featuredBlog, true);
        featuredContainer.style.display = "block";
        // Remove featured from grid
        filteredBlogs = filteredBlogs.filter(b => b.id !== featuredBlog.id);
    } else if (featuredContainer) {
        featuredContainer.style.display = "none";
    }

    // 4. Render Grid
    blogGrid.innerHTML = "";
    
    if (filteredBlogs.length === 0) {
        blogGrid.innerHTML = `<p class="no-results">No articles found matching your criteria.</p>`;
    } else {
        filteredBlogs.forEach(blog => {
            blogGrid.innerHTML += createBlogHTML(blog, false);
        });
    }

    // 5. Update Count
    if (articleCount) {
        const totalShowing = filteredBlogs.length + (featuredContainer && featuredContainer.style.display === "block" ? 1 : 0);
        articleCount.textContent = `${totalShowing} Article${totalShowing !== 1 ? 's' : ''}`;
    }
}


// ========================================
// HTML TEMPLATE GENERATOR
// ========================================

function createBlogHTML(blog, isFeatured) {
    const isBookmarked = bookmarkedIds.has(blog.id);
    const bookmarkIcon = isBookmarked ? "★" : "☆";

    return `
        <article class="card ${isFeatured ? 'card-featured' : ''}" data-id="${blog.id}">
            <div class="card-icon">${blog.icon}</div>
            <div class="card-content">
                <span class="badge category-badge">${blog.category}</span>
                <h3><a href="/blog/${blog.slug}">${blog.title}</a></h3>
                <p>${blog.description}</p>
                <div class="card-meta">
                    <span>${blog.date}</span> • <span>${blog.readTime}</span>
                </div>
            </div>
            <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark('${blog.id}')" title="Bookmark Article">
                ${bookmarkIcon}
            </button>
        </article>
    `;
}


// ========================================
// SEARCH & ACTIONS
// ========================================

function handleSearch(e) {
    searchQuery = e.target.value.toLowerCase();
    
    if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery.length > 0 ? "block" : "none";
    }
    
    renderBlogs();
}

function clearSearch() {
    searchInput.value = "";
    searchQuery = "";
    clearSearchBtn.style.display = "none";
    renderBlogs();
}


// ========================================
// BOOKMARKS & TOAST
// ========================================

// Expose to window so inline onclick can access it
window.toggleBookmark = function(id) {
    if (bookmarkedIds.has(id)) {
        bookmarkedIds.delete(id);
        showToast("Removed from bookmarks");
    } else {
        bookmarkedIds.add(id);
        showToast("Added to bookmarks!");
    }
    renderBlogs(); // Re-render to update the icon states
}

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// ========================================
// THEME HANDLING
// ========================================

function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.body.classList.add("dark-mode");
        if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
    } else {
        if (themeToggleBtn) themeToggleBtn.textContent = "🌙";
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (themeToggleBtn) {
        themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
    }
}
