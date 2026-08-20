// ========================================
// BLOG SCRIPT
// ========================================

console.log("🔥 BLOG SCRIPT STARTED");


// ========================================
// FIREBASE IMPORT
// ========================================

import { db } from "../js/firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================================
// STATIC BLOGS
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
// BLOG STATE
// ========================================

let blogs = staticBlogs.slice();

let currentCategory = "All";

let searchQuery = "";

let currentSort = "newest";

let bookmarkedIds = new Set();


// ========================================
// DOM ELEMENTS
// ========================================

const blogGrid =
    document.getElementById("blogGrid");

const featuredContainer =
    document.getElementById("featuredContainer");

const categoryContainer =
    document.getElementById("categoryContainer");

const searchInput =
    document.getElementById("searchInput");

const clearSearchBtn =
    document.getElementById("clearSearch");

const sortSelect =
    document.getElementById("sortSelect");

const articleCount =
    document.getElementById("articleCount");

const themeToggleBtn =
    document.getElementById("themeToggle");

const toast =
    document.getElementById("toast");


// ========================================
// FIREBASE CHECK
// ========================================

try {

    console.log(
        "🔥 Firebase Project:",
        db.app.options.projectId
    );

} catch (error) {

    console.error(
        "❌ Firebase initialization check failed:",
        error
    );

}


// ========================================
// DOM READY
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🔥 DOM LOADED"
        );

        initTheme();

        setupEventListeners();

        renderCategories();

        renderBlogs();

        loadCMSBlogs();

    }
);


// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            handleSearch
        );

    }


    if (clearSearchBtn) {

        clearSearchBtn.addEventListener(
            "click",
            clearSearch
        );

    }


    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            function (event) {

                currentSort =
                    event.target.value;

                renderBlogs();

            }
        );

    }


    if (themeToggleBtn) {

        themeToggleBtn.addEventListener(
            "click",
            toggleTheme
        );

    }

}


// ========================================
// LOAD FIRESTORE BLOGS
// ========================================

async function loadCMSBlogs() {

    console.log(
        "🔥 loadCMSBlogs() STARTED"
    );


    try {

        const blogsRef =
            collection(
                db,
                "blogs"
            );


        console.log(
            "🔥 Firestore collection created"
        );


        const snapshot =
            await getDocs(
                blogsRef
            );


        console.log(
            "🔥 Firestore total blogs:",
            snapshot.size
        );


        const cmsBlogs = [];


        snapshot.forEach(
            function (blogDoc) {

                const data =
                    blogDoc.data();


                console.log(
                    "🔥 BLOG FOUND:",
                    blogDoc.id,
                    data
                );


                let createdDate;


                if (
                    data.createdAt &&
                    typeof data.createdAt.toDate ===
                    "function"
                ) {

                    createdDate =
                        data.createdAt.toDate();

                } else if (
                    data.createdAt
                ) {

                    createdDate =
                        new Date(
                            data.createdAt
                        );

                } else {

                    createdDate =
                        new Date();

                }


                const blog = {

                    id:
                        blogDoc.id,

                    title:
                        data.title ||
                        "Untitled Blog",

                    description:
                        data.excerpt ||
                        "",

                    slug:
                        data.slug ||
                        blogDoc.id,

                    category:
                        data.category ||
                        "General",

                    tags:
                        Array.isArray(
                            data.tags
                        )
                            ? data.tags
                            : [],

                    date:
                        createdDate.toLocaleDateString(
                            "en-US",
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            }
                        ),

                    timestamp:
                        createdDate.getTime(),

                    readTime:
                        calculateReadTime(
                            data.content ||
                            ""
                        ),

                    icon:
                        "📝",

                    image:
                        data.image ||
                        "",

                    featured:
                        false,

                    source:
                        "cms"

                };


                cmsBlogs.push(
                    blog
                );

            }
        );


        // ========================================
        // COMBINE
        // ========================================

        blogs =
            cmsBlogs.concat(
                staticBlogs
            );


        console.log(
            "🔥 CMS blogs:",
            cmsBlogs
        );


        console.log(
            "🔥 TOTAL BLOGS FOR UI:",
            blogs.length
        );


        renderCategories();

        renderBlogs();


        console.log(
            "✅ CMS blogs loaded:",
            cmsBlogs.length
        );

    } catch (error) {

        console.error(
            "❌ FIRESTORE ERROR:",
            error
        );


        console.error(
            "❌ ERROR MESSAGE:",
            error.message
        );


        blogs =
            staticBlogs.slice();


        renderCategories();

        renderBlogs();

    }

}


// ========================================
// READ TIME
// ========================================

function calculateReadTime(
    content
) {

    if (!content) {

        return "1 min read";

    }


    const words =
        String(content)
            .trim()
            .split(/\s+/)
            .filter(
                function (word) {

                    return word.length > 0;

                }
            );


    const minutes =
        Math.max(
            1,
            Math.ceil(
                words.length / 200
            )
        );


    return (
        minutes +
        " min read"
    );

}


// ========================================
// BLOG TIMESTAMP
// ========================================

function getBlogTime(
    blog
) {

    if (blog.timestamp) {

        return blog.timestamp;

    }


    const parsedDate =
        new Date(
            blog.date
        );


    if (
        !isNaN(
            parsedDate.getTime()
        )
    ) {

        return parsedDate.getTime();

    }


    return 0;

}


// ========================================
// NEW BLOG
// ========================================

function isNew(
    blog
) {

    if (!blog.timestamp) {

        return false;

    }


    const now =
        Date.now();


    const diffDays =
        (
            now -
            blog.timestamp
        ) /
        (
            1000 *
            60 *
            60 *
            24
        );


    return (
        diffDays >= 0 &&
        diffDays <= 30
    );

}


// ========================================
// CATEGORIES
// ========================================

function renderCategories() {

    if (!categoryContainer) {

        return;

    }


    const categorySet =
        new Set();


    blogs.forEach(
        function (blog) {

            categorySet.add(
                blog.category
            );

        }
    );


    const categories =
        ["All"].concat(
            Array.from(
                categorySet
            )
        );


    categoryContainer.innerHTML =
        categories
            .map(
                function (category) {

                    const count =
                        category === "All"
                            ? blogs.length
                            : blogs.filter(
                                function (blog) {

                                    return (
                                        blog.category ===
                                        category
                                    );

                                }
                            ).length;


                    const activeClass =
                        category ===
                        currentCategory
                            ? "active"
                            : "";


                    return (
                        '<button ' +
                        'class="pill ' +
                        activeClass +
                        '" ' +
                        'data-category="' +
                        escapeHTML(
                            category
                        ) +
                        '">' +
                        escapeHTML(
                            category
                        ) +
                        " (" +
                        count +
                        ")" +
                        "</button>"
                    );

                }
            )
            .join("");



    document
        .querySelectorAll(
            ".pill"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        selectCategory(
                            button.dataset.category
                        );

                    }
                );

            }
        );

}


// ========================================
// SELECT CATEGORY
// ========================================

function selectCategory(
    category
) {

    currentCategory =
        category;

    renderCategories();

    renderBlogs();

}


// ========================================
// SEARCH
// ========================================

function handleSearch(
    event
) {

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


// ========================================
// CLEAR SEARCH
// ========================================

function clearSearch() {

    if (searchInput) {

        searchInput.value =
            "";

    }


    searchQuery =
        "";


    if (clearSearchBtn) {

        clearSearchBtn.style.display =
            "none";

    }


    renderBlogs();

}


// ========================================
// BLOG LINK
// ========================================

function getBlogLink(
    blog
) {

    if (
        blog.source ===
        "static"
    ) {

        return blog.slug;

    }


    return (
        "blog.html?slug=" +
        encodeURIComponent(
            blog.slug
        )
    );

}


// ========================================
// RENDER BLOGS
// ========================================

function renderBlogs() {

    if (!blogGrid) {

        console.error(
            "❌ blogGrid element not found"
        );

        return;

    }


    // ========================================
    // FILTER
    // ========================================

    let filtered =
        blogs.filter(
            function (blog) {

                const matchesCategory =
                    currentCategory ===
                    "All" ||
                    blog.category ===
                    currentCategory;


                const searchableText =
                    [
                        blog.title,
                        blog.description,
                        blog.category
                    ]
                    .concat(
                        blog.tags || []
                    )
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

            }
        );


    // ========================================
    // SORT
    // ========================================

    filtered.sort(
        function (a, b) {

            if (
                currentSort ===
                "newest"
            ) {

                return (
                    getBlogTime(b) -
                    getBlogTime(a)
                );

            }


            if (
                currentSort ===
                "oldest"
            ) {

                return (
                    getBlogTime(a) -
                    getBlogTime(b)
                );

            }


            if (
                currentSort ===
                "readTime"
            ) {

                return (
                    parseInt(
                        a.readTime,
                        10
                    ) -
                    parseInt(
                        b.readTime,
                        10
                    )
                );

            }


            if (
                currentSort ===
                "az"
            ) {

                return a.title.localeCompare(
                    b.title
                );

            }


            return 0;

        }
    );


    // ========================================
    // FEATURED
    // ========================================

    let featured =
        blogs.find(
            function (blog) {

                return blog.featured;

            }
        );


    if (
        !featured &&
        blogs.length > 0
    ) {

        const sortedBlogs =
            blogs
                .slice()
                .sort(
                    function (a, b) {

                        return (
                            getBlogTime(b) -
                            getBlogTime(a)
                        );

                    }
                );


        featured =
            sortedBlogs[0];

    }


    // ========================================
    // FEATURED SECTION
    // ========================================

    if (featuredContainer) {

        if (
            featured &&
            currentCategory === "All" &&
            !searchQuery
        ) {

            let featuredImage = "";


            if (featured.image) {

                featuredImage =
                    '<img ' +
                    'src="' +
                    escapeHTML(
                        featured.image
                    ) +
                    '" ' +
                    'alt="' +
                    escapeHTML(
                        featured.title
                    ) +
                    '" ' +
                    'style="' +
                    'width:100%;' +
                    'height:100%;' +
                    'object-fit:cover;' +
                    'border-radius:inherit;' +
                    '">';

            } else {

                featuredImage =
                    featured.icon;

            }


            featuredContainer.innerHTML =
                '<div class="featured-card">' +

                    '<div class="featured-content">' +

                        '<span class="featured-badge">' +
                            'Featured Post' +
                        '</span>' +

                        '<h1>' +
                            escapeHTML(
                                featured.title
                            ) +
                        '</h1>' +

                        '<p>' +
                            escapeHTML(
                                featured.description
                            ) +
                        '</p>' +

                        '<div class="meta-info">' +

                            '<span>' +
                                '<i class="fa-regular fa-calendar"></i> ' +
                                escapeHTML(
                                    featured.date
                                ) +
                            '</span>' +

                            '<span>' +
                                '<i class="fa-regular fa-clock"></i> ' +
                                escapeHTML(
                                    featured.readTime
                                ) +
                            '</span>' +

                        '</div>' +

                        '<br>' +

                        '<a href="' +
                            escapeHTML(
                                getBlogLink(
                                    featured
                                )
                            ) +
                            '" ' +
                            'style="color:var(--accent);font-weight:bold;text-decoration:none;">' +

                            'Read Article ' +

                            '<i class="fa-solid fa-arrow-right"></i>' +

                        '</a>' +

                    '</div>' +

                    '<div class="featured-image-holder">' +

                        featuredImage +

                    '</div>' +

                '</div>';


            featuredContainer.style.display =
                "block";

        } else {

            featuredContainer.style.display =
                "none";

        }

    }


    // ========================================
    // COUNT
    // ========================================

    if (articleCount) {

        articleCount.textContent =
            "Showing " +
            filtered.length +
            " article" +
            (
                filtered.length !== 1
                    ? "s"
                    : ""
            );

    }


    // ========================================
    // EMPTY
    // ========================================

    if (
        filtered.length === 0
    ) {

        blogGrid.innerHTML =
            '<div style="' +
            'grid-column:1/-1;' +
            'text-align:center;' +
            'padding:40px;' +
            'color:var(--text-secondary);' +
            '">' +
            'No articles found matching your query.' +
            '</div>';


        return;

    }


    // ========================================
    // BLOG CARDS
    // ========================================

    blogGrid.innerHTML =
        filtered
            .map(
                function (blog) {

                    let imageHTML = "";


                    if (blog.image) {

                        imageHTML =
                            '<img ' +
                            'src="' +
                            escapeHTML(
                                blog.image
                            ) +
                            '" ' +
                            'alt="' +
                            escapeHTML(
                                blog.title
                            ) +
                            '" ' +
                            'style="' +
                            'width:100%;' +
                            'height:180px;' +
                            'object-fit:cover;' +
                            'border-radius:12px;' +
                            'margin-bottom:15px;' +
                            '">';

                    }


                    let newTag = "";


                    if (
                        isNew(blog)
                    ) {

                        newTag =
                            '<span class="new-tag">' +
                            'NEW' +
                            '</span>';

                    }


                    const bookmarkIcon =
                        bookmarkedIds.has(
                            blog.id
                        )
                            ? "fa-solid"
                            : "fa-regular";


                    const blogLink =
                        getBlogLink(
                            blog
                        );


                    const iconHTML =
                        blog.image
                            ? ""
                            : blog.icon + " ";


                    return (

                        '<article class="blog-card">' +

                            '<div>' +

                                imageHTML +

                                '<div class="card-top">' +

                                    '<div>' +

                                        '<span class="category-badge">' +

                                            escapeHTML(
                                                blog.category
                                            ) +

                                        '</span>' +

                                        newTag +

                                    '</div>' +

                                    '<div class="card-actions">' +

                                        '<button ' +
                                        'class="bookmark-btn" ' +
                                        'data-id="' +
                                        escapeHTML(
                                            blog.id
                                        ) +
                                        '" ' +
                                        'title="Bookmark">' +

                                            '<i class="' +
                                            bookmarkIcon +
                                            ' fa-bookmark"></i>' +

                                        '</button>' +

                                        '<button ' +
                                        'class="share-btn" ' +
                                        'data-title="' +
                                        escapeHTML(
                                            blog.title
                                        ) +
                                        '" ' +
                                        'data-url="' +
                                        escapeHTML(
                                            blogLink
                                        ) +
                                        '" ' +
                                        'title="Share">' +

                                            '<i class="fa-solid fa-share-nodes"></i>' +

                                        '</button>' +

                                    '</div>' +

                                '</div>' +

                                '<h3>' +

                                    iconHTML +

                                    escapeHTML(
                                        blog.title
                                    ) +

                                '</h3>' +

                                '<p>' +

                                    escapeHTML(
                                        blog.description
                                    ) +

                                '</p>' +

                            '</div>' +

                            '<div class="card-footer">' +

                                '<div>' +

                                    '<span>' +

                                        '<i class="fa-regular fa-calendar"></i> ' +

                                        escapeHTML(
                                            blog.date
                                        ) +

                                    '</span>' +

                                    '<span style="margin-left:10px;">' +

                                        '<i class="fa-regular fa-clock"></i> ' +

                                        escapeHTML(
                                            blog.readTime
                                        ) +

                                    '</span>' +

                                '</div>' +

                                '<a href="' +
                                    escapeHTML(
                                        blogLink
                                    ) +
                                    '" ' +
                                    'style="color:var(--accent);font-weight:700;text-decoration:none;font-size:.9rem;">' +

                                    'Read ' +

                                    '<i class="fa-solid fa-arrow-right"></i>' +

                                '</a>' +

                            '</div>' +

                        '</article>'

                    );

                }
            )
            .join("");


    setupCardActions();

}


// ========================================
// CARD ACTIONS
// ========================================

function setupCardActions() {

    document
        .querySelectorAll(
            ".bookmark-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        toggleBookmark(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".share-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        shareArticle(
                            button.dataset.title,
                            button.dataset.url
                        );

                    }
                );

            }
        );

}


// ========================================
// BOOKMARK
// ========================================

function toggleBookmark(
    id
) {

    if (
        bookmarkedIds.has(id)
    ) {

        bookmarkedIds.delete(
            id
        );

    } else {

        bookmarkedIds.add(
            id
        );

    }


    renderBlogs();

}


// ========================================
// SHARE
// ========================================

function shareArticle(
    title,
    url
) {

    const fullURL =
        new URL(
            url,
            window.location.href
        ).href;


    if (
        navigator.clipboard
    ) {

        navigator.clipboard.writeText(
            fullURL
        );

    }


    if (toast) {

        toast.textContent =
            "Link copied for \"" +
            String(title).substring(
                0,
                20
            ) +
            "...\" 🚀";


        toast.classList.add(
            "show"
        );


        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

    }

}


// ========================================
// THEME
// ========================================

function initTheme() {

    const savedTheme =
        localStorage.getItem(
            "theme"
        ) ||
        "dark";


    document.documentElement.setAttribute(
        "data-theme",
        savedTheme
    );


    updateThemeIcon(
        savedTheme
    );

}


// ========================================
// TOGGLE THEME
// ========================================

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


    updateThemeIcon(
        newTheme
    );

}


// ========================================
// THEME ICON
// ========================================

function updateThemeIcon(
    theme
) {

    if (!themeToggleBtn) {

        return;

    }


    if (
        theme === "dark"
    ) {

        themeToggleBtn.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

    } else {

        themeToggleBtn.innerHTML =
            '<i class="fa-solid fa-moon"></i>';

    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(value);


    return div.innerHTML;

}


// ========================================
// END
// ========================================

console.log(
    "✅ BLOG SCRIPT PARSED SUCCESSFULLY"
);
