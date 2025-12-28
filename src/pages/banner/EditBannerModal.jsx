import { useState } from "react";
import {
  FaTimes,
  FaRegImage,
  FaRegCalendarAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaTag,
  FaLayerGroup,
  FaTimesCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";

const EditBannerModal = ({ banner, onClose, onEdit }) => {
  const [title, setTitle] = useState(banner.title || "");
  const [category, setCategory] = useState(banner.category || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(
    banner.image
      ? banner.image.startsWith("http")
        ? banner.image
        : `http://localhost:4000/uploads/banners/${banner.image}`
      : null
  );
  const [createdAt, setCreatedAt] = useState(
    banner.createdAt ? banner.createdAt.split("T")[0] : ""
  );
  const [expiryDate, setExpiryDate] = useState(
    banner.expiryDate ? banner.expiryDate.split("T")[0] : ""
  );
  const [status, setStatus] = useState(banner.status || "Enabled");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!title) {
      alert("Title is required");
      return;
    }

    const formData = new FormData();
    formData.append("_id", banner._id);
    formData.append("title", title);
    formData.append("category", category || "");
    formData.append(
      "createdAt",
      createdAt || new Date().toISOString().split("T")[0]
    );
    formData.append("expiryDate", expiryDate || "");
    formData.append("status", status);
    if (imageFile) formData.append("image", imageFile);

    onEdit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FaTimes size={18} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
          Edit Banner
        </h2>

        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center gap-2 border px-3 py-2 rounded-lg">
            <FaTag className="text-gray-500" />
            <input
              type="text"
              placeholder="Banner Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          {/* Category */}
          <div className="flex items-center gap-2 border px-3 py-2 rounded-lg">
            <FaLayerGroup className="text-gray-500" />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full outline-none"
            />
          </div>

          {/* File input */}
          <div className="flex items-center gap-2 border px-3 py-2 rounded-lg cursor-pointer">
            <FaRegImage className="text-gray-500" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full outline-none cursor-pointer"
            />
          </div>

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg mt-2 border shadow-sm"
            />
          )}

          {/* Dates */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <FaRegCalendarAlt /> Created At
              </label>
              <input
                type="date"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <FaHourglassHalf /> Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 border px-3 py-2 rounded-lg">
            {status === "Enabled" ? (
              <FaCheckCircle className="text-green-500 transition-colors duration-300" />
            ) : (
              <FaTimesCircle className="text-red-500 transition-colors duration-300" />
            )}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full outline-none bg-transparent"
            >
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            Update Banner
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditBannerModal;
