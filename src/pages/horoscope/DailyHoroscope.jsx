// src/pages/admin/horoscope/DailyHoroscope.jsx

import { useEffect, useState } from "react";
import {
  fetchHoroscopes,
  createHoroscope,
  updateHoroscope,
  deleteHoroscope,
} from "../../store/api/horoscopeApi";

const ZODIAC_SIGNS = [
  { name: "aries", icon: "♈" },
  { name: "taurus", icon: "♉" },
  { name: "gemini", icon: "♊" },
  { name: "cancer", icon: "♋" },
  { name: "leo", icon: "♌" },
  { name: "virgo", icon: "♍" },
  { name: "libra", icon: "♎" },
  { name: "scorpio", icon: "♏" },
  { name: "sagittarius", icon: "♐" },
  { name: "capricorn", icon: "♑" },
  { name: "aquarius", icon: "♒" },
  { name: "pisces", icon: "♓" },
];

const DailyHoroscope = () => {
  const [selectedSign, setSelectedSign] = useState("aries");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryId, setEntryId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load horoscope whenever sign or date changes
  const loadHoroscope = async () => {
    setLoading(true);

    try {
      const response = await fetchHoroscopes({
        type: "daily",
        sign: selectedSign,
        date: selectedDate,
      });

      if (response.data.length > 0) {
        const item = response.data[0];
        setEntryId(item._id);
        setTitle(item.title || "");
        setContent(item.content || "");
      } else {
        setEntryId(null);
        setTitle("");
        setContent("");
      }
    } catch (err) {
      console.error("Error loading:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadHoroscope();
  }, [selectedSign, selectedDate]);

  const handleSave = async () => {
    if (!content.trim()) {
      alert("Description is required!");
      return;
    }

    const payload = {
      type: "daily",
      sign: selectedSign,
      date: selectedDate,
      title,
      content,
    };

    try {
      if (entryId) {
        await updateHoroscope(entryId, payload);
        alert("Horoscope updated!");
      } else {
        await createHoroscope(payload);
        alert("Horoscope created!");
      }
      loadHoroscope();
    } catch (err) {
      alert("Error saving horoscope");
    }
  };

  // 🔥 DELETE FUNCTION
  const handleDelete = async () => {
    if (!entryId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this horoscope?"
    );
    if (!confirmDelete) return;

    try {
      await deleteHoroscope(entryId);
      alert("Horoscope deleted!");

      // Clear UI
      setEntryId(null);
      setTitle("");
      setContent("");

      loadHoroscope();
    } catch (err) {
      alert("Error deleting horoscope");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">✨ Daily Horoscope</h1>

      {/* Date Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-semibold mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full shadow-sm"
        />
      </div>

      {/* Zodiac Icons Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
        {ZODIAC_SIGNS.map((z) => (
          <button
            key={z.name}
            onClick={() => setSelectedSign(z.name)}
            className={`
              flex flex-col items-center p-4 rounded-xl border shadow-sm
              transition-all duration-200 hover:shadow-md hover:bg-gray-50
              ${
                selectedSign === z.name
                  ? "bg-purple-100 border-purple-400 shadow-md scale-[1.03]"
                  : "bg-white border-gray-300"
              }
            `}
          >
            <div className="text-4xl">{z.icon}</div>
            <div className="mt-2 font-semibold capitalize">{z.name}</div>
          </button>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && <p className="text-center text-gray-500 mb-4">Loading...</p>}

      {/* Horoscope Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-600 font-semibold mb-2">Title</label>
          <input
            type="text"
            placeholder="Enter horoscope title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full shadow-sm"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-semibold mb-2">
            Description
          </label>
          <textarea
            rows="6"
            placeholder="Enter horoscope description"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full shadow-sm"
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md w-full transition"
        >
          {entryId ? "Update Horoscope" : "Create Horoscope"}
        </button>

        {/* DELETE BUTTON — only show if entry exists */}
        {entryId && (
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md w-full transition"
          >
            Delete Horoscope
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyHoroscope;
