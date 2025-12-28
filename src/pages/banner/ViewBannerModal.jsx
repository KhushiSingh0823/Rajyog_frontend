import { FaTimes, FaRegCalendarAlt, FaLayerGroup, FaHourglassHalf, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const ViewBannerModal = ({ banner, onClose }) => {
  const imageUrl = banner.image
    ? banner.image.startsWith("http")
      ? banner.image
      : `http://localhost:4000/uploads/banners/${banner.image}`
    : "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FaTimes size={18} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{banner.title}</h2>

        {/* Banner Image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={banner.title}
            className="w-full h-60 object-cover rounded-lg mb-4 shadow-md"
          />
        )}

        {/* Banner Details */}
        <div className="space-y-2 text-gray-700">
          <p className="flex items-center gap-2">
            <FaLayerGroup className="text-gray-500" /> 
            <span className="font-semibold">Category:</span> {banner.category}
          </p>
          <p className="flex items-center gap-2">
            <FaRegCalendarAlt className="text-gray-500" />
            <span className="font-semibold">Created At:</span>{" "}
            {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : "N/A"}
          </p>
          <p className="flex items-center gap-2">
            <FaHourglassHalf className="text-gray-500" />
            <span className="font-semibold">Expiry Date:</span>{" "}
            {banner.expiryDate ? new Date(banner.expiryDate).toLocaleDateString() : "N/A"}
          </p>
          <p className="flex items-center gap-2">
            {banner.status === "Enabled" ? (
              <FaCheckCircle className="text-green-500 transition-colors duration-300" />
            ) : (
              <FaTimesCircle className="text-red-500 transition-colors duration-300" />
            )}
            <span className="font-semibold">Status:</span> {banner.status}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewBannerModal;
