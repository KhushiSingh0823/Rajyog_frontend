import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import AddBannerModal from "./AddBannerModal";
import EditBannerModal from "./EditBannerModal";
import ViewBannerModal from "./ViewBannerModal";
import { FaEye, FaEdit, FaTrash, FaTag, FaCalendarAlt, FaHourglassHalf, FaLayerGroup } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  setBanners,
  addBanner as addBannerRedux,
  updateBanner as updateBannerRedux,
} from "../../store/bannerSlice";


const API_URL = "http://localhost:4000/api/banners";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const BannerList = () => {
  const banners = useSelector((state) => state.banner.banners);
  const dispatch = useDispatch();
  const [viewBanner, setViewBanner] = useState(null);
  const [editBanner, setEditBanner] = useState(null);
  const [addBannerOpen, setAddBannerOpen] = useState(false);
  const adminToken = useSelector((state) =>state.adminAuth.admin.token);


  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        dispatch(setBanners(data.map(b => ({ ...b, _id: b._id || b.id }))));
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      }
    };
    fetchBanners();
  }, [dispatch]);

  const handleAddBanner = async (formData) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to add banner");
      const newBanner = await res.json();
      dispatch(addBannerRedux({ ...newBanner, _id: newBanner._id }));
    } catch (err) {
      console.error("Failed to add banner:", err);
    }
  };

  const handleEditBanner = async (formData) => {
    try {
      const id = formData.get("_id");
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update banner");
      const updatedBanner = await res.json();
      dispatch(updateBannerRedux({ ...updatedBanner, _id: updatedBanner._id }));
    } catch (err) {
      console.error("Failed to update banner:", err);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this banner?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/${bannerId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete banner");
      dispatch(setBanners(banners.filter(b => b._id !== bannerId)));
    } catch (err) {
      console.error("Failed to delete banner:", err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <FaTag className="text-gray-500" /> Banner List
        </h1>
        <button
          className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-opacity-90 transition flex items-center gap-2"
          onClick={() => setAddBannerOpen(true)}
        >
          + Add Banner
        </button>
      </div>

      {/* Banner Grid with entrance animation */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {banners.map((banner) => (
          <motion.div
            key={banner._id}
            className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition transform hover:-translate-y-1"
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
          >
            {/* Banner Image */}
            {banner.image && (
              <img
                src={
                  banner.image.startsWith("http")
                    ? banner.image
                    : `http://localhost:4000/uploads/banners/${banner.image}`
                }
                alt={banner.title}
                className="w-full h-44 object-cover"
              />
            )}

            <div className="p-4 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaTag className="text-gray-500" /> {banner.title}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaTag className="text-gray-400" /> {banner.category}
              </p>

              {/* Dates on separate lines */}
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <FaCalendarAlt /> {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : "N/A"}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <FaHourglassHalf /> {banner.expiryDate ? new Date(banner.expiryDate).toLocaleDateString() : "N/A"}
              </p>

              {/* Actions */}
              <div className="flex justify-between mt-4">
                <motion.button
                  onClick={() => setViewBanner(banner)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEye /> <span>View</span>
                </motion.button>

                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => setEditBanner(banner)}
                    className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEdit />
                  </motion.button>

                  <motion.button
                    onClick={() => handleDeleteBanner(banner._id)}
                    className="flex items-center px-3 py-1 bg-red-100 text-red-600 rounded-lg"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      {addBannerOpen && (
        <AddBannerModal onClose={() => setAddBannerOpen(false)} onAdd={handleAddBanner} />
      )}
      {viewBanner && <ViewBannerModal banner={viewBanner} onClose={() => setViewBanner(null)} />}
      {editBanner && (
        <EditBannerModal banner={editBanner} onClose={() => setEditBanner(null)} onEdit={handleEditBanner} />
      )}
    </div>
  );
};

export default BannerList;
