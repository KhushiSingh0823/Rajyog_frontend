// src/components/admin/VideoCard.jsx
import React from "react";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

const FALLBACK_THUMB = "/mnt/data/Screenshot 2025-11-22 234954.png";

export default function VideoCard({ v, onEdit, onDelete, onToggle }) {
  const thumb = v.coverImage ? `http://localhost:4000/${v.coverImage}` : FALLBACK_THUMB;

  return (
    <div className="bg-white rounded-xl shadow p-3 flex flex-col">
      <div className="w-full h-40 rounded overflow-hidden mb-3">
        <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 line-clamp-2">{v.title}</h4>
        <a href={v.youtubeLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 break-words">
          {v.youtubeLink.length > 60 ? `${v.youtubeLink.slice(0, 60)}...` : v.youtubeLink}
        </a>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => onEdit(v)} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded flex items-center gap-2">
            <FaEdit /> Edit
          </button>
          <button onClick={() => onDelete(v._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded flex items-center gap-2">
            <FaTrash /> Delete
          </button>
        </div>

        <button onClick={() => onToggle(v._id)} className="text-2xl">
          {v.status ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-gray-400" />}
        </button>
      </div>
    </div>
  );
}
