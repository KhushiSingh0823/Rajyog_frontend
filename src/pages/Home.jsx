// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ImageSlider from '../components/Slider'
import VideoSlider from '../components/VideoSlider'
import BlogSlider from '../components/BlogSlider'
import { fetchVideos } from "../store/api/adsVideoApi";
import { fetchHoroscopes } from "../store/api/horoscopeApi";

const zodiacIcons = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};
const zodiacList = Object.keys(zodiacIcons);

const Home = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  // ====== ORIGINAL STATES ======
  const [quantities, setQuantities] = useState({ 1: 1, 2: 1, 3: 1 })
  const [blogs, setBlogs] = useState([])
  const [banners, setBanners] = useState([])
  const [selectedBlog, setSelectedBlog] = useState(null)
  const products = [
    { id: 1, name: "Yoga Starter Package", price: 49.99, description: "Perfect for beginners - includes yoga mat, blocks, and strap", image: "🧘‍♀️" },
    { id: 2, name: "Meditation Bundle", price: 79.99, description: "Complete meditation kit with cushion, bells, and guide", image: "🕯️" },
    { id: 3, name: "Wellness Premium Pack", price: 129.99, description: "All-inclusive wellness package with accessories and classes", image: "🌿" }
  ]

  // ====== VIDEO + HOROSCOPE STATES ======
  const [videos, setVideos] = useState([])
  const [selectedSign, setSelectedSign] = useState("aries")
  const [selectedType, setSelectedType] = useState("daily")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [horoscope, setHoroscope] = useState(null)
  const [loadingHoroscope, setLoadingHoroscope] = useState(false)

  // ====== STATIC SLIDER ======
  /*const sliderImages = [
    { src: '/banner_181706549773.png', title: '', description: '', buttonText: '' },
    { src: '/banner_231715679713.png', title: '', description: '', buttonText: '' },
    { src: '', bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', title: 'Expert Guidance Awaits', description: 'Learn from certified instructors with years of experience', buttonText: 'Meet Our Teachers' }
  ]*/

  // ====== FETCH BLOGS + BANNERS ======
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/blogs")
        const enabledBlogs = (res.data.blogs || res.data)
          .filter(b => b.status === "enabled")
          .map(blog => ({
            ...blog,
            likes: blog.likes || 0,
            dislikes: blog.dislikes || 0,
            commentsCount: blog.commentsCount || 0
          }))
        setBlogs(enabledBlogs)
      } catch (error) { console.log("Error fetching blogs:", error) }
    }

    const fetchBanners = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/banners")
        const enabledBanners = (res.data.banners || res.data)
          .filter(b => b.status === "Enabled")
          .map(b => ({
            src: b.image ? (b.image.startsWith("http") ? b.image : `http://localhost:4000/uploads/banners/${b.image}`) : '',
            title: b.title || '', description: b.description || '', buttonText: b.buttonText || '', bgColor: b.bgColor || ''
          }))
        setBanners(enabledBanners)
      } catch (err) { console.log("Error fetching banners:", err) }
    }

    fetchBlogs()
    fetchBanners()
  }, [])

  // ====== LIKE/DISLIKE BLOG ======
  const handleLike = async (blogId) => {
    try {
      const res = await axios.post(
        `http://localhost:4000/api/blogs/${blogId}/like`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      )
      const likes = res?.data?.data?.likes ?? 0
      const dislikes = res?.data?.data?.dislikes ?? 0
      setBlogs(prev => prev.map(blog => blog._id === blogId ? { ...blog, likes, dislikes } : blog))
    } catch (err) { console.error(err) }
  }
  const handleDislike = async (blogId) => {
    try {
      const res = await axios.post(
        `http://localhost:4000/api/blogs/${blogId}/dislike`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      )
      const likes = res?.data?.data?.likes ?? 0
      const dislikes = res?.data?.data?.dislikes ?? 0
      setBlogs(prev => prev.map(blog => blog._id === blogId ? { ...blog, likes, dislikes } : blog))
    } catch (err) { console.error(err) }
  }

  // ====== UPDATE QUANTITY ======
  const updateQuantity = (productId, change) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, prev[productId] + change) }))
  }

  // ====== FETCH ASTROLOGY VIDEOS ======
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await fetchVideos()
        const list = res.data.videos ?? res.data.data ?? []
        setVideos(list.filter(v => v.status === true))
      } catch (err) { console.error("Error fetching videos:", err); setVideos([]) }
    }
    loadVideos()
  }, [])

  // ====== FETCH HOROSCOPE ======
  useEffect(() => { loadHoroscope() }, [selectedSign, selectedDate, selectedType])
  async function loadHoroscope() {
    setLoadingHoroscope(true)
    try {
      let finalDate = selectedDate
      if (selectedType === "yearly") finalDate = selectedDate.split("-")[0]
      const res = await fetchHoroscopes({ type: selectedType, sign: selectedSign, date: finalDate })
      setHoroscope(res?.data?.length > 0 ? res.data[0] : null)
    } catch { setHoroscope(null) }
    setLoadingHoroscope(false)
  }

  return (
    <div className="bg-accent min-h-screen">

      {/* ⭐ BANNER SLIDER */}
      <div className="banner-section py-8 px-2 sm:px-3 lg:px-4">
        <div className="banner-container max-w-7xl mx-auto">
          {/*<ImageSlider images={banners.length ? banners : sliderImages} height="600px" autoplay autoplaySpeed={5000} />*/}
          {banners.length > 0 && (
             <ImageSlider images={banners} />
         )}
        </div>
      </div>

      {/* ⭐ ASTROLOGY VIDEOS */}
      <section className="py-16 bg-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Astrology Videos</h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto">
              Explore the ancient wisdom of astrology and discover how celestial movements influence your life journey.
            </p>
          </div>
          <VideoSlider videos={videos} autoplay={false} autoplaySpeed={6000} />
        </div>
      </section>

      {/* ⭐ BLOGS SECTION */}
      <section className="py-16 bg-yellow-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Latest Blogs</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">Read our latest insights, tips, and guides on astrology and spiritual wisdom.</p>
          </div>
          {blogs.length === 0 ? (
            <p className="text-center text-gray-600">No blogs available at the moment.</p>
          ) : (
            <BlogSlider blogs={blogs} onSelectBlog={setSelectedBlog} handleLike={handleLike} handleDislike={handleDislike} />
          )}
        </div>
      </section>

      {/* ⭐ BLOG MODAL */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <h2 className="text-2xl font-semibold mb-2">{selectedBlog.title}</h2>
            <p className="text-gray-600 text-sm mb-4">📌 {selectedBlog.category} • {new Date(selectedBlog.createdAt).toLocaleDateString()}</p>
            {selectedBlog.image && <img src={`http://localhost:4000${selectedBlog.image}`} className="w-full rounded-lg mb-4 shadow" alt="Blog" />}
            <p className="text-gray-800 whitespace-pre-line">{selectedBlog.content}</p>
            <button onClick={() => setSelectedBlog(null)} className="absolute top-3 right-3 bg-gray-900 text-white px-3 py-1 rounded">✕</button>
          </div>
        </div>
      )}

      {/* ⭐ HERO SECTION */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold">Welcome to RajYog</h1>
          <p className="text-xl md:text-2xl text-gray-800 mt-4 max-w-3xl mx-auto">
            Transform your life through the ancient wisdom of yoga and meditation. Find inner peace and balance.
          </p>
          <button className="mt-8 bg-accent px-8 py-3 rounded-lg font-semibold hover:shadow-lg">
            Start Your Journey
          </button>
        </div>
      </section>

      {/* ⭐ FEATURES SECTION */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-4xl font-bold">Why Choose RajYog?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Experience holistic wellness with our comprehensive approach to yoga and spirituality.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
          <div className="bg-secondary p-8 rounded-lg text-center hover:shadow-lg">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">❤️</div>
            <h3 className="text-xl font-semibold">Personalized Practice</h3>
            <p className="text-gray-600">Tailored sessions designed specifically for your goals.</p>
          </div>
          <div className="bg-secondary p-8 rounded-lg text-center hover:shadow-lg">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">🧘</div>
            <h3 className="text-xl font-semibold">Mindful Meditation</h3>
            <p className="text-gray-600">Learn ancient meditation techniques to calm your mind.</p>
          </div>
          <div className="bg-secondary p-8 rounded-lg text-center hover:shadow-lg">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">👥</div>
            <h3 className="text-xl font-semibold">Expert Guidance</h3>
            <p className="text-gray-600">Learn from certified instructors with years of experience.</p>
          </div>
        </div>
      </section>

      {/* ⭐ PRODUCTS SECTION */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-4xl font-bold">Our Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Enhance your yoga and meditation practice with our curated products.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
          {products.map(product => (
            <div key={product.id} className="bg-accent rounded-lg shadow-lg p-6 hover:shadow-xl">
              <div className="text-center mb-8" style={{ fontSize: '8rem' }}>{product.image}</div>
              <h3 className="text-lg font-bold text-gray-900 text-center">{product.name}</h3>
              <p className="text-gray-600 text-xs text-center">{product.description}</p>
              <div className="text-center font-bold mt-3">${product.price}</div>
              <div className="flex items-center justify-center gap-2 my-4">
                <button onClick={() => updateQuantity(product.id, -1)} className="w-6 h-6 bg-gray-200 rounded-full">-</button>
                <span className="font-bold">{quantities[product.id]}</span>
                <button onClick={() => updateQuantity(product.id, 1)} className="w-6 h-6 bg-gray-200 rounded-full">+</button>
              </div>
              <div className="text-center mb-4"><strong>Total:</strong> ${(product.price * quantities[product.id]).toFixed(2)}</div>
              <button className="w-full bg-primary py-3 rounded-lg">Add to Cart</button>
            </div>
          ))}
        </div>
      </section>

      {/* ⭐ HOROSCOPE SECTION */}
      <section className="py-20 bg-gradient-to-b from-white to-yellow-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-12 tracking-tight">
            🔮 {selectedType.toUpperCase()} Horoscope
          </h2>
          <div className="flex justify-center gap-6 mb-10">
            {["daily", "weekly", "yearly"].map(type => (
              <button key={type} onClick={() => setSelectedType(type)}
                className={`px-6 py-2 rounded-full font-semibold shadow-md transition-all ${selectedType===type?"bg-yellow-500 text-white":"bg-white border border-gray-300 hover:bg-yellow-100"}`}>
                {type.toUpperCase()}
              </button>
            ))}
          </div>
          {selectedType !== "yearly" && (
            <div className="flex justify-center mb-12">
              <input type="date" className="p-3 px-5 rounded-xl border border-gray-300 shadow-md hover:border-gray-400 focus:ring-2 focus:ring-yellow-400 transition-all text-gray-700"
                value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} />
            </div>
          )}
          {selectedType === "yearly" && (
            <h3 className="text-center mb-10 text-xl font-semibold">Selected Year: {selectedDate.split("-")[0]}</h3>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 text-center mb-14">
            {zodiacList.map(sign => (
              <div key={sign} onClick={()=>setSelectedSign(sign)}
                className={`cursor-pointer p-6 rounded-2xl shadow-lg border transition-all duration-300 transform backdrop-blur-sm ${selectedSign===sign?"bg-yellow-300 border-yellow-500 scale-105 shadow-xl":"bg-white/70 hover:bg-yellow-100 border-gray-300"}`}>
                <div className="text-4xl mb-2">{zodiacIcons[sign]}</div>
                <p className="capitalize font-semibold text-gray-800">{sign}</p>
              </div>
            ))}
          </div>
          <div className="bg-white shadow-2xl rounded-3xl p-10 border border-yellow-200 max-w-3xl mx-auto">
            {loadingHoroscope ? (
              <p className="text-center text-lg text-gray-700">Loading horoscope...</p>
            ) : horoscope ? (
              <>
                <h3 className="text-3xl font-bold mb-4 capitalize text-yellow-700 text-center">{selectedSign} — {selectedType==="yearly"?selectedDate.split("-")[0]:selectedDate}</h3>
                {horoscope.title && <h4 className="text-xl font-semibold mb-3 text-gray-900 text-center">{horoscope.title}</h4>}
                <p className="text-gray-700 leading-relaxed text-lg text-center">{horoscope.content}</p>
              </>
            ) : (<p className="text-center text-lg text-gray-500">No horoscope available for this selection.</p>)}
          </div>
        </div>
      </section>

      {/* ⭐ STATS SECTION */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div><div className="text-4xl font-bold">500+</div><div>Happy Students</div></div>
          <div><div className="text-4xl font-bold">50+</div><div>Yoga Classes</div></div>
          <div><div className="text-4xl font-bold">10+</div><div>Expert Instructors</div></div>
          <div><div className="text-4xl font-bold">5</div><div>Years Experience</div></div>
        </div>
      </section>

      {/* ⭐ FLOATING CHAT BUTTON */}
      <button onClick={()=>navigate('/chat-with-admin')} className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-xl">💬</button>
    </div>
  )
}

export default Home
