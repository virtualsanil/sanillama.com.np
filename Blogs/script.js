// ========================================
// FIREBASE IMPORT
// ========================================

import { db } from "../js/firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where
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

let blogs = [...staticBlogs];


// ========================================
// STATE VARIABLES
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
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

    initTheme();

    setupEventListeners();

    renderCategories();
    renderBlogs();

    // Firebase bata CMS blogs load garne
    await loadCMSBlogs();

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
        sortSelect.addEventListener("change", (event) => {

            currentSort = event.target.value;

            renderBlogs();

        });
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", toggleTheme);
    }

}


// ========================================
// LOAD CMS BLOGS FROM FIRESTORE
// ========================================

async function loadCMSBlogs() {

    try {

        const blogsRef = collection(db, "blogs");

        const publishedQuery = query(
            blogsRef,
            where("status", "==", "published")
        );

        const snapshot = await getDocs(publishedQuery);

        const cmsBlogs = [];

        snapshot.forEach((blogDoc) => {

            const data = blogDoc.data();

            const createdDate = data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date();

            cmsBlogs.push({
                id: blogDoc.id,
                title: data.title || "Untitled Blog",
                description: data.excerpt || "",
                slug: data.slug || blogDoc.id,
                category: data.category || "General",
                tags: Array.isArray(data.tags) ? data.tags : [],
                date: createdDate.toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                ),
                timestamp: createdDate.getTime(),
                readTime: calculateReadTime(data.content || ""),
                icon: "📝",
                image: data.image || "",
                featured: false,
                source: "cms"
            });

        });


        // CMS blogs lai existing blogs ma add garne
        blogs = [
            ...cmsBlogs,
            ...staticBlogs
        ];


        // UI फेरि render
        renderCategories();
        renderBlogs();

        console.log(
            "CMS blogs loaded:",
            cmsBlogs.length
        );

    } catch (error) {

        console.error(
            "Error loading CMS blogs:",
            error
        );

        // Existing blogs still show
        renderCategories();
        renderBlogs();

    }

}


// ========================================
// CALCULATE READ TIME
// ========================================

function calculateReadTime(content) {

    if (!content) {
        return "1 min read";
    }

    const words = content
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);

    const minutes = Math.max(
        1,
        Math.ceil(words.length / 200)
    );

    return `${minutes} min read`;

}


// ========================================
// GET BLOG TIMESTAMP
// ========================================

function getBlogTime(blog) {

    if (blog.timestamp) {
        return blog.timestamp;
    }

    const parsedDate = new Date(blog.date);

    if (!isNaN(parsedDate.getTime())) {
        return parsedDate.getTime();
    }

    return 0;

}


// ========================================
// CHECK NEW BLOG
// ========================================

function isNew(blog) {

    if (!blog.timestamp) {
        return false;
    }

    const now = Date.now();

    const diffDays =
        (now - blog.timestamp) /
        (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 30;

}


// ========================================
// RENDER CATEGORIES
// ========================================

function renderCategories() {

    if (!categoryContainer) return;

    const categories = [
        "All",
        ...new Set(
            blogs.map(blog => blog.category)
        )
    ];

    categoryContainer.innerHTML =
        categories.map(category => {

            const count =
                category === "All"
                    ? blogs.length
                    : blogs.filter(
                        blog =>
                            blog.category === category
                    ).length;

            return `
                <button
                    class="pill ${
                        category === currentCategory
                            ? "active"
                            : ""
                    }"
                    data-category="${escapeHTML(category)}"
                >
                    ${escapeHTML(category)} (${count})
                </button>
            `;

        }).join("");


    // Category click listeners
    document
        .querySelectorAll(".pill")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectCategory(
                        button.dataset.category
                    );

                }
            );

        });

}


// ========================================
// SELECT CATEGORY
// ========================================

function selectCategory(category) {

    currentCategory = category;

    renderCategories();
    renderBlogs();

}


// ========================================
// SEARCH
// ========================================

function handleSearch(event) {

    searchQuery =
        event.target.value
            .toLowerCase()
            .trim();

    if (clearSearchBtn) {

        clearSearchBtn.style.display =
            searchQuery
                ? "block"
                : "none";

    }

    renderBlogs();

}


function clearSearch() {

    if (searchInput) {
        searchInput.value = "";
    }

    searchQuery = "";

    if (clearSearchBtn) {
        clearSearchBtn.style.display = "none";
    }

    renderBlogs();

}


// ========================================
// GET BLOG LINK
// ========================================

function getBlogLink(blog) {

    // पुराना static HTML blogs
    if (blog.source === "static") {

        return blog.slug;

    }

    // CMS blog
    return `blog.html?slug=${encodeURIComponent(
        blog.slug
    )}`;

}


// ========================================
// RENDER BLOGS
// ========================================

function renderBlogs() {

    if (!blogGrid) return;


    // FILTER
    let filtered = blogs.filter(blog => {

        const matchesCategory =
            currentCategory === "All" ||
            blog.category === currentCategory;


        const searchableText = [
            blog.title,
            blog.description,
            blog.category,
            ...(blog.tags || [])
        ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
            searchableText.includes(
                searchQuery
            );


        return (
            matchesCategory &&
            matchesSearch
        );

    });


    // SORT
    filtered.sort((a, b) => {

        if (currentSort === "newest") {

            return (
                getBlogTime(b) -
                getBlogTime(a)
            );

        }

        if (currentSort === "oldest") {

            return (
                getBlogTime(a) -
                getBlogTime(b)
            );

        }

        if (currentSort === "readTime") {

            return (
                parseInt(a.readTime) -
                parseInt(b.readTime)
            );

        }

        if (currentSort === "az") {

            return a.title.localeCompare(
                b.title
            );

        }

        return 0;

    });


    // ========================================
    // FEATURED BLOG
    // ========================================

    let featured =
        blogs.find(blog => blog.featured);


    // If no static featured, newest CMS blog
    if (!featured) {

        featured =
            [...blogs]
                .sort(
                    (a, b) =>
                        getBlogTime(b) -
                        getBlogTime(a)
                )[0];

    }


    if (featuredContainer) {

        if (
            featured &&
            currentCategory === "All" &&
            !searchQuery
        ) {

            const featuredImage =
                featured.image
                    ? `
                        <img
                            src="${escapeHTML(
                                featured.image
                            )}"
                            alt="${escapeHTML(
                                featured.title
                            )}"
                            style="
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                                border-radius: inherit;
                            "
                        >
                    `
                    : featured.icon;


            featuredContainer.innerHTML = `

                <div class="featured-card">

                    <div class="featured-content">

                        <span class="featured-badge">
                            Featured Post
                        </span>

                        <h1>
                            ${escapeHTML(
                                featured.title
                            )}
                        </h1>

                        <p>
                            ${escapeHTML(
                                featured.description
                            )}
                        </p>

                        <div class="meta-info">

                            <span>
                                <i class="fa-regular fa-calendar"></i>
                                ${escapeHTML(
                                    featured.date
                                )}
                            </span>

                            <span>
                                <i class="fa-regular fa-clock"></i>
                                ${escapeHTML(
                                    featured.readTime
                                )}
                            </span>

                        </div>

                        <br>

                        <a
                            href="${getBlogLink(
                                featured
                            )}"
                            style="
                                color: var(--accent);
                                font-weight: bold;
                                text-decoration: none;
                            "
                        >
                            Read Article
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>

                    </div>

                    <div class="featured-image-holder">

                        ${featuredImage}

                    </div>

                </div>

            `;

            featuredContainer.style.display =
                "block";

        } else {

            featuredContainer.style.display =
                "none";

        }

    }


    // ARTICLE COUNT
    if (articleCount) {

        articleCount.textContent =
            `Showing ${filtered.length} article${
                filtered.length !== 1
                    ? "s"
                    : ""
            }`;

    }


    // NO RESULTS
    if (filtered.length === 0) {

        blogGrid.innerHTML = `

            <div
                style="
                    grid-column: 1/-1;
                    text-align: center;
                    padding: 40px;
                    color: var(--text-secondary);
                "
            >
                No articles found matching your query.
            </div>

        `;

        return;

    }


    // ========================================
    // RENDER BLOG CARDS
    // ========================================

    blogGrid.innerHTML =
        filtered.map(blog => {

            const imageHTML =
                blog.image
                    ? `
                        <img
                            src="${escapeHTML(
                                blog.image
                            )}"
                            alt="${escapeHTML(
                                blog.title
                            )}"
                            style="
                                width: 100%;
                                height: 180px;
                                object-fit: cover;
                                border-radius: 12px;
                                margin-bottom: 15px;
                            "
                        >
                    `
                    : "";


            return `

                <article class="blog-card">

                    <div>

                        ${imageHTML}

                        <div class="card-top">

                            <div>

                                <span class="category-badge">

                                    ${escapeHTML(
                                        blog.category
                                    )}

                                </span>

                                ${
                                    isNew(blog)
                                        ? `
                                            <span class="new-tag">
                                                NEW
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            <div class="card-actions">

                                <button
                                    class="bookmark-btn"
                                    data-id="${escapeHTML(
                                        blog.id
                                    )}"
                                    title="Bookmark"
                                >

                                    <i
                                        class="${
                                            bookmarkedIds.has(
                                                blog.id
                                            )
                                                ? "fa-solid"
                                                : "fa-regular"
                                        } fa-bookmark"
                                    ></i>

                                </button>


                                <button
                                    class="share-btn"
                                    data-title="${escapeHTML(
                                        blog.title
                                    )}"
                                    data-url="${getBlogLink(
                                        blog
                                    )}"
                                    title="Share"
                                >

                                    <i class="fa-solid fa-share-nodes"></i>

                                </button>

                            </div>

                        </div>


                        <h3>

                            ${
                                blog.image
                                    ? ""
                                    : blog.icon
                            }

                            ${escapeHTML(
                                blog.title
                            )}

                        </h3>


                        <p>

                            ${escapeHTML(
                                blog.description
                            )}

                        </p>

                    </div>


                    <div class="card-footer">

                        <div>

                            <span>

                                <i class="fa-regular fa-calendar"></i>

                                ${escapeHTML(
                                    blog.date
                                )}

                            </span>


                            <span
                                style="margin-left: 10px;"
                            >

                                <i class="fa-regular fa-clock"></i>

                                ${escapeHTML(
                                    blog.readTime
                                )}

                            </span>

                        </div>


                        <a
                            href="${getBlogLink(blog)}"
                            style="
                                color: var(--accent);
                                font-weight: 700;
                                text-decoration: none;
                                font-size: 0.9rem;
                            "
                        >

                            Read

                            <i class="fa-solid fa-arrow-right"></i>

                        </a>

                    </div>

                </article>

            `;

        }).join("");


    setupCardActions();

}


// ========================================
// CARD ACTIONS
// ========================================

function setupCardActions() {

    document
        .querySelectorAll(".bookmark-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleBookmark(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".share-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    shareArticle(
                        button.dataset.title,
                        button.dataset.url
                    );

                }
            );

        });

}


// ========================================
// BOOKMARK
// ========================================

function toggleBookmark(id) {

    if (bookmarkedIds.has(id)) {

        bookmarkedIds.delete(id);

    } else {

        bookmarkedIds.add(id);

    }

    renderBlogs();

}


// ========================================
// SHARE
// ========================================

function shareArticle(title, url) {

    const fullURL =
        new URL(
            url,
            window.location.href
        ).href;


    if (navigator.clipboard) {

        navigator.clipboard.writeText(
            fullURL
        );

    }


    if (toast) {

        toast.textContent =
            `Link copied for "${title.substring(
                0,
                20
            )}..." 🚀`;

        toast.classList.add("show");


        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

    }

}


// ========================================
// THEME
// ========================================

function initTheme() {

    const savedTheme =
        localStorage.getItem("theme") ||
        "dark";

    document.documentElement.setAttribute(
        "data-theme",
        savedTheme
    );

    updateThemeIcon(savedTheme);

}


function toggleTheme() {

    const currentTheme =
        document.documentElement.getAttribute(
            "data-theme"
        );

    const newTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";


    document.documentElement.setAttribute(
        "data-theme",
        newTheme
    );


    localStorage.setItem(
        "theme",
        newTheme
    );


    updateThemeIcon(newTheme);

}


function updateThemeIcon(theme) {

    if (!themeToggleBtn) return;


    themeToggleBtn.innerHTML =
        theme === "dark"
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

}


// ========================================
// SECURITY
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}
