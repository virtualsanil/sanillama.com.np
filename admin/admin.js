import {
    auth,
    db
} from "../js/firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================================
// CLOUDINARY SETTINGS
// ========================================

const CLOUDINARY_CLOUD_NAME = "fp9xeizv";
const CLOUDINARY_UPLOAD_PRESET = "anillama_blog_upload";


// ========================================
// CHECK ADMIN LOGIN
// ========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    console.log("Admin logged in:", user.email);

});


// ========================================
// LOGOUT
// ========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "index.html";

        } catch (error) {

            alert("Logout failed: " + error.message);

        }

    });

}


// ========================================
// DASHBOARD BLOG LIST
// ========================================

const blogList = document.getElementById("blogList");

async function loadBlogs() {

    if (!blogList) return;

    const loading = document.getElementById("loading");
    const emptyState = document.getElementById("emptyState");

    loading.style.display = "block";
    blogList.innerHTML = "";

    try {

        const blogsRef = collection(db, "blogs");

        const q = query(
            blogsRef,
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        loading.style.display = "none";

        let total = 0;
        let published = 0;
        let draft = 0;

        if (snapshot.empty) {

            emptyState.style.display = "block";

            document.getElementById("totalBlogs").textContent = 0;
            document.getElementById("publishedBlogs").textContent = 0;
            document.getElementById("draftBlogs").textContent = 0;

            return;

        }

        emptyState.style.display = "none";

        snapshot.forEach((blogDoc) => {

            const blog = blogDoc.data();

            total++;

            if (blog.status === "published") {
                published++;
            } else {
                draft++;
            }

            const image = blog.image ||
                "https://via.placeholder.com/300x200?text=No+Image";

            const statusClass =
                blog.status === "published"
                    ? "status-published"
                    : "status-draft";

            const item = document.createElement("div");

            item.className = "blog-item";

            item.innerHTML = `

                <img
                    src="${image}"
                    class="blog-item-image"
                    alt="${escapeHTML(blog.title || "Blog Image")}"
                >

                <div class="blog-item-content">

                    <h3>
                        ${escapeHTML(blog.title || "Untitled Blog")}
                    </h3>

                    <p>
                        ${escapeHTML(blog.excerpt || "")}
                    </p>

                    <span class="status ${statusClass}">
                        ${blog.status || "draft"}
                    </span>

                </div>

                <div class="blog-item-actions">

                    <button
                        class="edit-btn"
                        data-id="${blogDoc.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        data-id="${blogDoc.id}"
                    >
                        Delete
                    </button>

                </div>

            `;

            blogList.appendChild(item);

        });

        document.getElementById("totalBlogs").textContent = total;
        document.getElementById("publishedBlogs").textContent = published;
        document.getElementById("draftBlogs").textContent = draft;

        setupBlogActions();

    } catch (error) {

        console.error(error);

        loading.textContent =
            "Error loading blogs: " + error.message;

    }

}


// ========================================
// EDIT / DELETE BUTTONS
// ========================================

function setupBlogActions() {

    document.querySelectorAll(".edit-btn")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const blogId = button.dataset.id;

                window.location.href =
                    `editor.html?id=${blogId}`;

            });

        });


    document.querySelectorAll(".delete-btn")
        .forEach((button) => {

            button.addEventListener("click", async () => {

                const blogId = button.dataset.id;

                const confirmDelete = confirm(
                    "Are you sure you want to delete this blog?"
                );

                if (!confirmDelete) return;

                try {

                    await deleteDoc(
                        doc(db, "blogs", blogId)
                    );

                    alert("Blog deleted successfully!");

                    loadBlogs();

                } catch (error) {

                    alert(
                        "Delete failed: " +
                        error.message
                    );

                }

            });

        });

}


// ========================================
// REFRESH
// ========================================

const refreshBtn =
    document.getElementById("refreshBtn");

if (refreshBtn) {

    refreshBtn.addEventListener("click", loadBlogs);

}


// ========================================
// AUTO GENERATE SLUG
// ========================================

const titleInput =
    document.getElementById("title");

const slugInput =
    document.getElementById("slug");

if (titleInput && slugInput) {

    titleInput.addEventListener("input", () => {

        const slug = titleInput.value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        slugInput.value = slug;

    });

}


// ========================================
// IMAGE PREVIEW
// ========================================

const coverImage =
    document.getElementById("coverImage");

const imagePreview =
    document.getElementById("imagePreview");

let selectedImageFile = null;
let existingImageUrl = "";

if (coverImage) {

    coverImage.addEventListener("change", (event) => {

        const file = event.target.files[0];

        if (!file) return;

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {

            alert(
                "Image must be smaller than 5MB."
            );

            coverImage.value = "";
            return;

        }

        selectedImageFile = file;

        const reader = new FileReader();

        reader.onload = function (e) {

            imagePreview.src = e.target.result;

            imagePreview.style.display = "block";

        };

        reader.readAsDataURL(file);

    });

}


// ========================================
// CLOUDINARY IMAGE UPLOAD
// ========================================

async function uploadImageToCloudinary(file) {

    if (!file) {

        return existingImageUrl;

    }

    const uploadStatus =
        document.getElementById("uploadStatus");

    uploadStatus.textContent =
        "Uploading image... Please wait.";

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );

    try {

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error?.message ||
                "Image upload failed"
            );

        }

        uploadStatus.textContent =
            "Image uploaded successfully!";

        return data.secure_url;

    } catch (error) {

        uploadStatus.textContent =
            "Image upload failed: " +
            error.message;

        throw error;

    }

}


// ========================================
// EDIT MODE
// ========================================

const urlParams =
    new URLSearchParams(window.location.search);

const editBlogId =
    urlParams.get("id");


async function loadBlogForEdit() {

    if (!editBlogId) return;

    document.getElementById(
        "editorTitle"
    ).textContent = "Edit Blog";

    try {

        const blogRef =
            doc(db, "blogs", editBlogId);

        const snapshot =
            await getDoc(blogRef);

        if (!snapshot.exists()) {

            alert("Blog not found.");

            window.location.href =
                "dashboard.html";

            return;

        }

        const blog = snapshot.data();

        document.getElementById("title").value =
            blog.title || "";

        document.getElementById("slug").value =
            blog.slug || "";

        document.getElementById("category").value =
            blog.category || "";

        document.getElementById("status").value =
            blog.status || "draft";

        document.getElementById("tags").value =
            Array.isArray(blog.tags)
                ? blog.tags.join(", ")
                : "";

        document.getElementById("excerpt").value =
            blog.excerpt || "";

        document.getElementById("content").value =
            blog.content || "";

        document.getElementById("metaTitle").value =
            blog.metaTitle || "";

        document.getElementById(
            "metaDescription"
        ).value =
            blog.metaDescription || "";

        existingImageUrl =
            blog.image || "";

        if (existingImageUrl) {

            imagePreview.src =
                existingImageUrl;

            imagePreview.style.display =
                "block";

        }

    } catch (error) {

        alert(
            "Error loading blog: " +
            error.message
        );

    }

}


// ========================================
// SAVE BLOG
// ========================================

const blogForm =
    document.getElementById("blogForm");

let selectedStatus = "published";


const saveDraftBtn =
    document.getElementById("saveDraftBtn");

if (saveDraftBtn) {

    saveDraftBtn.addEventListener(
        "click",
        () => {

            selectedStatus = "draft";

            blogForm.requestSubmit();

        }
    );

}


if (blogForm) {

    blogForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const publishBtn =
                document.getElementById(
                    "publishBtn"
                );

            const formMessage =
                document.getElementById(
                    "formMessage"
                );

            const statusSelect =
                document.getElementById(
                    "status"
                );

            let finalStatus =
                selectedStatus;

            // Normal publish button
            if (selectedStatus !== "draft") {

                finalStatus =
                    statusSelect.value;

            }

            publishBtn.disabled = true;

            publishBtn.textContent =
                "Saving...";

            formMessage.textContent = "";

            try {

                const title =
                    document.getElementById(
                        "title"
                    ).value.trim();

                const slug =
                    document.getElementById(
                        "slug"
                    ).value.trim();

                const category =
                    document.getElementById(
                        "category"
                    ).value.trim();

                const tagsText =
                    document.getElementById(
                        "tags"
                    ).value;

                const excerpt =
                    document.getElementById(
                        "excerpt"
                    ).value.trim();

                const content =
                    document.getElementById(
                        "content"
                    ).value.trim();

                const metaTitle =
                    document.getElementById(
                        "metaTitle"
                    ).value.trim();

                const metaDescription =
                    document.getElementById(
                        "metaDescription"
                    ).value.trim();


                const tags = tagsText
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(tag => tag);


                if (!title || !slug || !excerpt || !content) {

                    throw new Error(
                        "Please fill all required fields."
                    );

                }


                // Upload image
                const imageUrl =
                    await uploadImageToCloudinary(
                        selectedImageFile
                    );


                const blogData = {

                    title: title,
                    slug: slug,
                    category: category,

                    tags: tags,

                    excerpt: excerpt,
                    content: content,

                    image: imageUrl,

                    status: finalStatus,

                    metaTitle:
                        metaTitle || title,

                    metaDescription:
                        metaDescription || excerpt,

                    updatedAt:
                        serverTimestamp()

                };


                if (editBlogId) {

                    await updateDoc(
                        doc(
                            db,
                            "blogs",
                            editBlogId
                        ),
                        blogData
                    );

                    formMessage.textContent =
                        "Blog updated successfully!";

                } else {

                    blogData.createdAt =
                        serverTimestamp();

                    blogData.publishedAt =
                        finalStatus === "published"
                            ? serverTimestamp()
                            : null;

                    await addDoc(
                        collection(db, "blogs"),
                        blogData
                    );

                    formMessage.textContent =
                        "Blog saved successfully!";

                    blogForm.reset();

                    imagePreview.style.display =
                        "none";

                    selectedImageFile = null;

                }


                formMessage.style.color =
                    "green";

                selectedStatus = "published";

                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 1500);


            } catch (error) {

                console.error(error);

                formMessage.textContent =
                    "Error: " +
                    error.message;

                formMessage.style.color =
                    "red";

            } finally {

                publishBtn.disabled = false;

                publishBtn.textContent =
                    "🚀 Publish Blog";

            }

        }
    );

}


// ========================================
// SECURITY: ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ========================================
// INITIAL LOAD
// ========================================

loadBlogs();
loadBlogForEdit();
