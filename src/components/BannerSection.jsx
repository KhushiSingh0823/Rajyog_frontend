import React, { useState, useEffect } from "react";
import ImageSlider from "../components/Slider";

const BannerSection = ({ banners }) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="banner-section">
      <div className="banner-container">

        {/* SLIDER */}
        <ImageSlider
          images={banners}
          height="300px"
          autoplay={true}
          autoplaySpeed={5000}
          currentIndex={current}
        />

        {/* LEFT ARROW */}
        <button className="arrow arrow-left" onClick={prevSlide}>❮</button>

        {/* RIGHT ARROW */}
        <button className="arrow arrow-right" onClick={nextSlide}>❯</button>

        {/* DOTS */}
        <div className="dots">
          {banners.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === current ? "active" : ""}`}
              onClick={() => setCurrent(index)}
            ></span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .banner-section {
          padding: 1.5rem 0;
          width: 100%;
        }

        .banner-container {
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
        }

        /* NEW SMALLER HEIGHTS */
        .banner-container :global(img) {
          height: 300px;
          object-fit: cover;
        }

        @media (max-width: 1024px) {
          .banner-container :global(img) {
            height: 220px;
          }
        }

        @media (max-width: 640px) {
          .banner-container :global(img) {
            height: 160px;
          }
        }

        /* ARROWS */
        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.45);
          border: none;
          color: white;
          padding: 8px 12px;
          font-size: 18px;
          cursor: pointer;
          border-radius: 50%;
          transition: 0.3s ease;
          z-index: 20;
        }
        .arrow:hover {
          background: rgba(0, 0, 0, 0.7);
        }
        .arrow-left {
          left: 12px;
        }
        .arrow-right {
          right: 12px;
        }

        /* DOTS */
        .dots {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 25;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .dot.active {
          background: white;
          transform: scale(1.25);
        }
      `}</style>
    </div>
  );
};

export default BannerSection;
