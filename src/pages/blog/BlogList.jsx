import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const navigate = useNavigate();

  const loadBlogs = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/blogs");
      setBlogs(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load blogs");
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/blogs/${id}`);
      alert("Blog deleted successfully!");
      loadBlogs();
    } catch (error) {
      console.error(error);
      alert("Failed to delete!");
    }
  };

  const handleToggleStatus = async (blog) => {
    try {
      const res = await axios.patch(
        `http://localhost:4000/api/blogs/${blog._id}/status`
      );
      const updatedBlog = res.data.blog;
      setBlogs((prev) =>
        prev.map((b) => (b._id === updatedBlog._id ? updatedBlog : b))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            All Blogs
          </h2>
          <button
            onClick={() => navigate("/admin/blogs/create")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-transform transform hover:scale-105 shadow-sm"
          >
            ＋ Create Blog
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 text-sm shadow-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-gray-800">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold uppercase tracking-wide">
                <th className="p-3 border-b">Image</th>
                <th className="p-3 border-b">Title</th>
                <th className="p-3 border-b">Category</th>
                <th className="p-3 border-b">Created</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-400">
                    No blogs found.
                  </td>
                </tr>
              ) : (
                filtered.map((blog) => (
                  <tr
                    key={blog._id}
                    className={`text-sm border-b hover:bg-gray-50 transition ${
                      blog.status === "disabled" ? "opacity-50" : ""
                    }`}
                  >
                    <td className="p-3 border">
                      {blog.image ? (
                        <img
                          src={`http://localhost:4000${blog.image}`}
                          alt={blog.title}
                          className="w-20 h-20 rounded-xl cursor-pointer object-cover shadow-md hover:scale-110 transition-transform"
                          onClick={() =>
                            setPreviewImage(`http://localhost:4000${blog.image}`)
                          }
                        />
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-3 border font-medium">{blog.title}</td>

                    <td className="p-3 border capitalize">{blog.category}</td>

                    <td className="p-3 border">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3 border">
                      <div
                        onClick={() => handleToggleStatus(blog)}
                        className={`relative w-14 h-7 rounded-full cursor-pointer transition-all duration-300 ${
                          blog.status === "enabled"
                            ? "bg-gradient-to-r from-green-400 to-green-600 shadow-lg"
                            : "bg-gray-300 shadow-inner"
                        }`}
                      >
                        <div
                          className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300"
                          style={{
                            transform:
                              blog.status === "enabled"
                                ? "translateX(100%)"
                                : "translateX(0%)",
                          }}
                        ></div>
                      </div>
                    </td>

                    <td className="p-3 border">
                      <div className="flex flex-wrap gap-2 justify-start">
                        <button
                          onClick={() => setSelectedBlog(blog)}
                          className="px-3 py-2 border border-gray-600 text-gray-700 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition shadow-sm flex items-center justify-center"
                        >
                          <FaEye />
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/admin/blogs/edit/${blog._id}`)
                          }
                          className="px-3 py-2 text-white bg-gray-900 rounded-xl hover:bg-black transition shadow-sm flex items-center justify-center"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="px-3 py-2 text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-sm flex items-center justify-center"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-lg"
            />
            <button
              className="absolute top-2 right-2 bg-red-600 text-white px-4 py-1 rounded-xl hover:bg-red-700 shadow-md"
              onClick={() => setPreviewImage(null)}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {selectedBlog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-3xl font-bold mb-3">{selectedBlog.title}</h2>
            <p className="text-gray-600 text-sm mb-5">
              📌 {selectedBlog.category} •{" "}
              {new Date(selectedBlog.createdAt).toLocaleDateString()}
            </p>

            {selectedBlog.image && (
              <img
                src={`http://localhost:4000${selectedBlog.image}`}
                className="w-full rounded-2xl mb-5 shadow-md"
                alt="Blog"
              />
            )}

            <div className="bg-gray-50 p-5 rounded-xl shadow-inner mb-5 prose max-w-full text-gray-700 leading-relaxed whitespace-pre-line">
              {selectedBlog.content}
            </div>

            <button
              onClick={() => setSelectedBlog(null)}
              className="absolute top-3 right-3 bg-gray-900 text-white px-4 py-1 rounded-xl hover:bg-black shadow-md"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogList;
