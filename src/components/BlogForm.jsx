import { useState, useEffect } from "react";

const BlogForm = ({ onSubmit, initialData = {}, goBack }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize form values when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setTitle(initialData.title || "");
      setCategory(initialData.category || "");
      setShortDesc(initialData.shortDesc || "");
      setContent(initialData.content || "");
      setImagePreview(initialData.image || null); // full URL already set in BlogEdit
    }
  }, [initialData]);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !category || !shortDesc || !content) {
      alert("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("shortDesc", shortDesc);
    formData.append("content", content);
    if (image) formData.append("image", image); // append new image only if changed

    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        {initialData?._id ? "Edit Blog" : "Create Blog"}
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Blog Title *</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Category *</label>
          <select
            className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            <option value="Yoga">Yoga</option>
            <option value="Ayurveda">Ayurveda</option>
            <option value="Health">Health</option>
            <option value="Meditation">Meditation</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Astrology">Astrology</option>
          </select>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Short Description *</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-primary"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="Write a short description"
          ></textarea>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Cover Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="mt-3 w-48 h-32 object-cover rounded-lg shadow-sm"
            />
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Content *</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg h-48 focus:ring-2 focus:ring-primary"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your full blog content here..."
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          {goBack && (
            <button
              type="button"
              onClick={goBack}
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all duration-200"
            >
              Go Back
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-800 shadow-sm hover:bg-black transition-all duration-200 ease-out"
          >
            {initialData?._id ? "Update Blog" : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm; 