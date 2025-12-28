import React from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

// Custom Arrow Components
const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl rounded-full p-3 transition-all duration-200 group hover:scale-110"
    aria-label="Previous slide"
  >
    <svg
      className="w-5 h-5 text-gray-700 group-hover:text-gray-900"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>
)

const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-xl rounded-full p-3 transition-all duration-200 group hover:scale-110"
    aria-label="Next slide"
  >
    <svg
      className="w-5 h-5 text-gray-700 group-hover:text-gray-900"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
)

const ImageSlider = ({ images, height = '500px', autoplay = true, autoplaySpeed = 4000 }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: autoplay,
    autoplaySpeed: autoplaySpeed,
    pauseOnHover: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    customPaging: (i) => (
      <div className="w-3 h-3 bg-white/30 rounded-full hover:bg-white/80 transition-all duration-300 mt-4 cursor-pointer"></div>
    ),
    dotsClass: "slick-dots custom-dots"
  }

  return (
    <div className="relative slider-container rounded-2xl overflow-hidden shadow-xl" style={{ height }}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="relative" style={{ height }}>
            {/* Image or Gradient Background */}
            {image.src ? (
              <img
                src={image.src}
                alt={image.title || `Slide ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ height }}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  height,
                  background: image.bgColor || '#f3f4f6'
                }}
              />
            )}

            {/* Overlay for better text readability */}
            {/* <div className="absolute inset-0 bg-black/20"></div> */}

            {/* Slide Content */}
            {(image.title || image.description) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-4xl">
                  {image.title && (
                    <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                      {image.title}
                    </h2>
                  )}
                  {image.description && (
                    <p className="text-lg md:text-xl mb-6 drop-shadow-md max-w-2xl mx-auto">
                      {image.description}
                    </p>
                  )}
                  {image.buttonText && (
                    <button className="bg-primary hover:bg-yellow-400 text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-lg">
                      {image.buttonText}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default ImageSlider