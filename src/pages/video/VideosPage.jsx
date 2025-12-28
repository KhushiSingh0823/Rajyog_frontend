// src/pages/admin/VideoManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchVideos, deleteVideo, toggleVideo } from "../../store/api/adsVideoApi";
import AddEditVideoModal from "../../components/video/AddEditVideoModal";
import VideoCard from "../../components/video/VideoCard";

const PAGE_SIZE = 9; // grid cards per page

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all / enabled / disabled

  const [view, setView] = useState("grid"); // grid | table
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchVideos();
      const list = data.videos ?? data.data ?? [];
      setVideos(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // CRUD helpers
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    await deleteVideo(id);
    load();
  };

  const handleToggle = async (id) => {
    await toggleVideo(id);
    load();
  };

  // Search + filter + pagination
  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const q = query.trim().toLowerCase();
      if (q) {
        const match =
          (v.title || "").toLowerCase().includes(q) ||
          (v.youtubeLink || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter === "enabled") return v.status === true;
      if (statusFilter === "disabled") return v.status === false;
      return true;
    });
  }, [videos, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ads Videos</h1>
          <p className="text-sm text-gray-500">
            Manage Ads Videos — add, edit, toggle or delete
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search + Filter */}
          <div className="flex items-center bg-white border rounded-lg overflow-hidden">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or link..."
              className="px-4 py-2 outline-none w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-l"
            >
              <option value="all">All</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="bg-white border rounded-lg px-2 py-1">
            <button
              className={`px-3 py-1 ${view === "grid" ? "bg-gray-100 rounded" : ""}`}
              onClick={() => setView("grid")}
            >
              Grid
            </button>
            <button
              className={`px-3 py-1 ${view === "table" ? "bg-gray-100 rounded" : ""}`}
              onClick={() => setView("table")}
            >
              Table
            </button>
          </div>

          {/* Add Video */}
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800"
          >
            + Add Video
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Grid View */}
          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageItems.map((v) => (
                <VideoCard
                  key={v._id}
                  v={v}
                  onEdit={(v) => {
                    setEditing(v);
                    setModalOpen(true);
                  }}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cover</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">YouTube Link</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((v, i) => (
                    <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">{i + 1}</td>
                      <td className="px-4 py-3">
                        <img
                          src={
                            v.coverImage
                              ? `http://localhost:4000/${v.coverImage}`
                              : "/mnt/data/Screenshot 2025-11-22 234954.png"
                          }
                          alt={v.title}
                          className="w-24 h-14 object-cover rounded-lg border border-gray-200"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{v.title}</td>
                      <td className="px-4 py-3">
                        <a
                          href={v.youtubeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {v.youtubeLink}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {v.status ? (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => {
                            setEditing(v);
                            setModalOpen(true);
                          }}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleToggle(v._id)}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 transition"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 flex-wrap gap-2">
            <div className="text-sm text-gray-600">
              Showing{" "}
              {filtered.length === 0
                ? 0
                : (page - 1) * PAGE_SIZE + 1}{" "}
              - {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <div className="px-3 py-1 border rounded">
                {page} / {totalPages}
              </div>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <AddEditVideoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
        editing={editing}
      />
    </div>
  );
}
