import React, { useRef, useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

// Custom Arrows same as before
const VideoPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black shadow-xl rounded-full p-3 transition-all duration-200 group hover:scale-110"
    aria-label="Previous video"
  >
    <svg className="w-5 h-5 text-white group-hover:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
    </svg>
  </button>
)

const VideoNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black shadow-xl rounded-full p-3 transition-all duration-200 group hover:scale-110"
    aria-label="Next video"
  >
    <svg className="w-5 h-5 text-white group-hover:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
    </svg>
  </button>
)

const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

const VideoSlider = ({ videos, autoplay = true, autoplaySpeed = 4000 }) => {
  const sliderRef = useRef(null)
  const iframesRef = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)

  const pauseAllVideos = () => {
    iframesRef.current.forEach((iframe) => {
      if (!iframe) return
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo" }),
        "*"
      )
    })
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0px",
    focusOnSelect: true,
    autoplay: false, // our autoplay is custom
    prevArrow: <VideoPrevArrow />,
    nextArrow: <VideoNextArrow />,
    beforeChange: (oldIndex, newIndex) => {
      pauseAllVideos()
      setActiveIndex(newIndex)
    },
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 }},
      { breakpoint: 768, settings: { slidesToShow: 1, centerMode: false }},
    ],
    customPaging: () => (
      <div className="w-3 h-3 bg-gray-400/50 rounded-full hover:bg-yellow-400 transition-all duration-300 mt-4 cursor-pointer"></div>
    ),
    dotsClass: "slick-dots video-slider-dots"
  }

  return (
    <div className="relative video-slider-container">
      <Slider ref={sliderRef} {...settings}>
        {videos.map((video, index) => {
          const videoId = getYouTubeVideoId(video?.youtubeLink || video?.url)
          const isActive = index === activeIndex

          return (
            <div key={index} className="px-1">
              <div className="relative bg-black rounded-xl overflow-hidden shadow-lg group">
                <div className="relative w-full h-72 md:h-80 lg:h-96">
                  <iframe
                    ref={(el) => (iframesRef.current[index] = el)}
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=${isActive ? 1 : 0}&mute=1&rel=0&controls=1&modestbranding=1&enablejsapi=1`}
                    title={video.title}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
                  <h3 className="text-white font-semibold text-lg line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              </div>
            </div>
          )
        })}
      </Slider>
    </div>
  )
}

export default VideoSlider
