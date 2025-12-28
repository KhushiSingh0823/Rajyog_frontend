import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlogForm from "../../components/BlogForm";
import axios from "axios";

const BlogEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch blog details by ID
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/blogs/${id}`);
        const data = res.data;

        // Ensure image has full URL for preview
        if (data.image) {
          data.image = `http://localhost:4000${data.image}`;
        }

        setBlogData(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        alert("Failed to load blog");
        navigate("/admin/blogs");
      }
    };

    fetchBlog();
  }, [id, navigate]);

  // Submit edited blog
  const handleUpdateBlog = async (formData) => {
    try {
      await axios.put(`http://localhost:4000/api/blogs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Blog Updated Successfully!");
      navigate("/admin/blogs");
    } catch (error) {
      console.error(error);
      alert("Failed to update blog");
    }
  };

  const handleGoBack = () => {
    navigate("/admin/blogs");
  };

  if (loading)
    return <p className="text-gray-600 text-sm">Loading blog details...</p>;

  return (
    <div>
      {blogData && (
        <BlogForm
          initialData={blogData}
          onSubmit={handleUpdateBlog}
          goBack={handleGoBack} // <-- Pass goBack prop here
        />
      )}
    </div>
  );
};

export default BlogEdit;
