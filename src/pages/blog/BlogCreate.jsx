import axios from "axios";
import { useNavigate } from "react-router-dom";
import BlogForm from "../../components/BlogForm";

const BlogCreate = () => {
  const navigate = useNavigate();

  const handleCreateBlog = async (formData) => {
    try {
      await axios.post("http://localhost:4000/api/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Blog Published Successfully!");
      navigate("/admin/blogs");
    } catch (error) {
      console.log(error);
      alert("Failed to create blog");
    }
  };

  const handleGoBack = () => {
    navigate("/admin/blogs"); // Go back to the blog list
  };

  return (
    <div>
      <BlogForm onSubmit={handleCreateBlog} goBack={handleGoBack} />
    </div>
  );
};

export default BlogCreate;
