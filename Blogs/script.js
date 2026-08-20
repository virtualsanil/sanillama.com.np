async function loadCMSBlogs() {
    try {
        const blogsRef = collection(db, "blogs");

        // Temporary: status filter हटाइएको
        const snapshot = await getDocs(blogsRef);

        console.log("Firestore total blogs:", snapshot.size);

        snapshot.forEach((doc) => {
            console.log("BLOG:", doc.id, doc.data());
        });

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
                date: createdDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }),
                timestamp: createdDate.getTime(),
                readTime: calculateReadTime(data.content || ""),
                icon: "📝",
                image: data.image || "",
                featured: false,
                source: "cms"
            });
        });

        blogs = [
            ...cmsBlogs,
            ...staticBlogs
        ];

        renderCategories();
        renderBlogs();

        console.log("CMS blogs loaded:", cmsBlogs.length);

    } catch (error) {
        console.error("Error loading CMS blogs:", error);

        renderCategories();
        renderBlogs();
    }
}
