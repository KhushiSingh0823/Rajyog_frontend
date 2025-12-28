import { useState } from "react";
import { FaTimes, FaImage, FaChevronDown } from "react-icons/fa";

const AddBannerModal = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [createdAt, setCreatedAt] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState("Enabled");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!title || !imageFile) {
      alert("Title and Image are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category || "");
    formData.append("createdAt", createdAt || new Date().toISOString().split("T")[0]);
    formData.append("expiryDate", expiryDate || "");
    formData.append("status", status);
    formData.append("image", imageFile);

    onAdd(formData);

    setTitle("");
    setCategory("");
    setImageFile(null);
    setPreview(null);
    setCreatedAt("");
    setExpiryDate("");
    setStatus("Enabled");

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative transform transition-all duration-500 animate-slideFade">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <FaTimes size={22} />
        </button>

        <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Add Banner</h2>

        <div className="space-y-5">
          {/* Title */}
          <input
            type="text"
            placeholder="Banner Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 px-5 py-3 rounded-2xl focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-sm hover:shadow-md transition-all"
          />

          {/* Category */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none border border-gray-200 px-5 py-3 rounded-2xl pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm hover:shadow-md transition-all"
            >
              <option value="">Select Category</option>
              <option value="Promotion">Promotion</option>
              <option value="Sale">Sale</option>
              <option value="New Arrival">New Arrival</option>
            </select>
            <FaChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* File Upload */}
          <label className="w-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer hover:border-blue-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
            <div className="text-center">
              <FaImage className="mx-auto text-gray-400 mb-2 text-3xl" />
              <p className="text-gray-500 text-sm">
                {imageFile ? "Change Image" : "Upload Banner Image"}
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-2xl border border-gray-200 mt-2 transition-all shadow-sm hover:shadow-md"
            />
          )}

          {/* Dates */}
          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="text-sm text-gray-500 mb-1 block">Created At</label>
              <input
                type="date"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full border border-gray-200 px-4 py-2 rounded-2xl focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-sm hover:shadow-md transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-500 mb-1 block">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border border-gray-200 px-4 py-2 rounded-2xl focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-sm hover:shadow-md transition-all"
              />
            </div>
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-200 px-5 py-3 rounded-2xl focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-sm hover:shadow-md transition-all"
          >
            <option>Enabled</option>
            <option>Disabled</option>
          </select>

          {/* Add Banner Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all transform animate-pulse-onHover"
          >
            Add Banner
          </button>
        </div>
      </div>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

          @keyframes slideFade {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-slideFade { animation: slideFade 0.4s ease-out; }

          .animate-pulse-onHover:hover {
            animation: pulse 1s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default AddBannerModal;
