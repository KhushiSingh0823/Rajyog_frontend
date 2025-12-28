import { useEffect, useState } from "react";
import axios from "axios";
import { FaVideo, FaPlus, FaTrash, FaEdit, FaTimes } from "react-icons/fa";

const API_BASE = "http://localhost:4000/api/admin/ads-video";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [status, setStatus] = useState(true);

  // Fetch videos
  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/`);
      setVideos(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Upload New Video
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", title);
    form.append("youtubeLink", youtubeLink);
    form.append("status", status);
    form.append("coverImage", coverImage);

    try {
      await axios.post(`${API_BASE}/add`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      fetchVideos();
      setTitle("");
      setYoutubeLink("");
      setCoverImage(null);
      setStatus(true);
    } catch (err) {
      console.log(err);
    }
  };

  // Delete Video
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/delete/${id}`);
      fetchVideos();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaVideo className="text-primary text-3xl" /> Videos
          </h1>
          <p className="text-sm text-gray-500">Manage advertisement videos</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Add Video
        </button>
      </div>

      {/* VIDEO LIST */}
      <div className="bg-white p-5 shadow rounded-xl">
        <h2 className="text-lg font-semibold mb-4">All Videos</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3">Cover Image</th>
                <th className="p-3">Title</th>
                <th className="p-3">YouTube Link</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {videos.map((video) => (
                <tr key={video._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={`http://localhost:4000/${video.coverImage}`}
                      className="w-20 h-14 rounded object-cover shadow"
                    />
                  </td>

                  <td className="p-3 font-medium">{video.title}</td>

                  <td className="p-3">
                    <a
                      href={video.youtubeLink}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      {video.youtubeLink}
                    </a>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        video.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {video.status ? "Enabled" : "Disabled"}
                    </span>
                  </td>

                  <td className="p-3 flex gap-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaEdit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD VIDEO MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[450px] p-6 rounded-xl shadow relative">

            {/* close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Add New Video</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>

              <div>
                <label className="block text-sm mb-1">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">YouTube Link</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Cover Image</label>
                <input
                  type="file"
                  className="w-full"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={status}
                  onChange={() => setStatus(!status)}
                />
                <span>Enable / Disable</span>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded"
              >
                Upload
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Videos;
