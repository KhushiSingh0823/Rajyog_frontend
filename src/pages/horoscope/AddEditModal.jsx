import React, { useEffect, useState } from "react";
import { addVideo, editVideo, deleteVideo } from "../../store/api/adsVideoApi"; // ⬅ added deleteVideo
import { FaTimes } from "react-icons/fa";

const FALLBACK_THUMB = "/mnt/data/Screenshot 2025-11-22 234954.png";

export default function AddEditVideoModal({ isOpen, onClose, onSaved, editing }) {
  const [title, setTitle] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setYoutubeLink(editing.youtubeLink || "");
      setPreview(
        editing.coverImage
          ? `http://localhost:4000/uploads/videos/${editing.coverImage}`
          : FALLBACK_THUMB
      );

      setCoverFile(null);
    } else {
      setTitle("");
      setYoutubeLink("");
      setCoverFile(null);
      setPreview(FALLBACK_THUMB);
    }
  }, [editing, isOpen]);

  useEffect(() => {
    if (!coverFile) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(coverFile);
  }, [coverFile]);

  if (!isOpen) return null;

  // ✅ DELETE FUNCTION (NEW)
  const handleDelete = async () => {
    if (!editing?._id) return;

    const confirmDelete = window.confirm("Are you sure you want to DELETE this video?");
    if (!confirmDelete) return;

    try {
      await deleteVideo(editing._id);
      onSaved();
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete video");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("youtubeLink", youtubeLink);

      // keep image logic intact
      if (coverFile) {
        fd.append("coverImage", coverFile);
      } else if (editing?.coverImage) {
        fd.append("existingImageUrl", editing.coverImage);
      }

      if (editing && editing._id) {
        await editVideo(editing._id, fd);
      } else {
        await addVideo(fd);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      alert(err?.response?.data?.message || "Failed to save video");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40">
      <div className="w-[680px] bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{editing ? "Edit Video" : "Add New Video"}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800"><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="Enter title"
            />

            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">YouTube Link</label>
            <input
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="https://www.youtube.com/watch?v=..."
            />

            <div className="mt-4 flex items-center gap-3">
              <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded shadow">Save</button>

              {editing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded shadow"
                >
                  Delete
                </button>
              )}

              <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>

            <div className="w-full h-44 rounded overflow-hidden border border-dashed border-gray-300 flex items-center justify-center">
              <img
                src={preview || FALLBACK_THUMB}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="mt-3"
            />

            <p className="text-xs text-gray-500 mt-2">Max size 5MB. Recommended ratio 16:9.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
