import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BlogPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/70 hover:bg-black shadow-xl rounded-full p-3 transition-all duration-200 group hover:scale-110"
    aria-label="Previous blog"
  >
    <svg
      className="w-5 h-5 text-white group-hover:text-yellow-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>
);

const BlogNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/70 hover:bg-black shadow-xl rounded-full p-3 transition-all duration-200 group hover:scale-110"
    aria-label="Next blog"
  >
    <svg
      className="w-5 h-5 text-white group-hover:text-yellow-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

const BlogSlider = ({ blogs, onSelectBlog, handleLike, handleDislike }) => {
  const sliderRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0px",
    focusOnSelect: false,
    prevArrow: <BlogPrevArrow />,
    nextArrow: <BlogNextArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3, centerPadding: "0px" } },
      { breakpoint: 1024, settings: { slidesToShow: 2, centerPadding: "40px" } },
      { breakpoint: 768, settings: { slidesToShow: 1, centerMode: false, centerPadding: "0px" } }
    ],
    customPaging: () => (
      <div className="w-3 h-3 bg-gray-400/50 rounded-full hover:bg-yellow-400 transition-all duration-300 mt-4 cursor-pointer"></div>
    ),
    dotsClass: "slick-dots blog-slider-dots",
  };

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
    setTimeout(() => sliderRef.current?.slickGoTo(index), 50);
  };

  return (
    <div className="relative blog-slider-container">
      <Slider ref={sliderRef} {...settings}>
        {blogs.map((blog, index) => {
          const isHovered = hoveredIndex === index;
          const isNeighbor =
            hoveredIndex !== null &&
            (index === hoveredIndex - 1 || index === hoveredIndex + 1);

          return (
            <div
              key={blog._id}
              className="px-2"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={`
                  bg-white rounded-xl overflow-hidden relative group transition-all duration-300
                  ${isHovered ? "scale-110 shadow-2xl z-30" : ""}
                  ${isNeighbor ? "scale-95 shadow-md z-10" : ""}
                  ${!isHovered && !isNeighbor ? "scale-90 shadow-lg z-0" : ""}
                `}
              >
                {blog.image && (
                  <img
                    src={`http://localhost:4000${blog.image}`}
                    alt={blog.title}
                    className="w-full h-72 md:h-80 lg:h-96 object-cover"
                  />
                )}

                {/* FIX: overlay should not block clicks */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pointer-events-none">
                  <h3 className="text-white font-semibold text-lg md:text-xl line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* FIX: buttons clickable now */}
                  <div className="flex items-center justify-between mt-4 pointer-events-auto relative z-50">
                    <button
                      onClick={() => onSelectBlog(blog)}
                      className="text-yellow-300 text-sm underline underline-offset-2 hover:text-yellow-200 transition pointer-events-auto"
                    >
                      Read More
                    </button>

                    <div className="flex items-center gap-3 text-white pointer-events-auto">
                      <button
                        onClick={() => handleLike(blog._id)}
                        className="pointer-events-auto flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition"
                        tabIndex={isHovered ? 0 : -1}
                      >
                        👍 <span>{blog.likes || 0}</span>
                      </button>

                      <button
                        onClick={() => handleDislike(blog._id)}
                        className="pointer-events-auto flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition"
                        tabIndex={isHovered ? 0 : -1}
                      >
                        👎 <span>{blog.dislikes || 0}</span>
                      </button>

                      <button
                        className="pointer-events-auto flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition"
                        tabIndex={isHovered ? 0 : -1}
                      >
                        💬 <span>{blog.commentsCount || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default BlogSlider;
