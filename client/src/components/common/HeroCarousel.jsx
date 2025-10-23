// src/components/common/HeroCarousel.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';

// ⚠️ IMPORTANT: Replace these with your actual banner images and links
const bannerImages = [
  { img: '/images/banners/new-collection-banner.jpg', link: '#products' },
  { img: '/images/banners/great-deals-banner.jpg', link: '#products' },
  { img: '/images/banners/electronics-sale-banner.jpg', link: '#products' }
];

const HeroCarousel = () => {
  return (
    <section className="w-full mb-12">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        centeredSlides={true}
        loop={true}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        className="mySwiper h-[350px] md:h-[450px] rounded-lg shadow-lg"
      >
        {bannerImages.map((banner, index) => (
          <SwiperSlide key={index}>
            <Link to={banner.link}>
              <img 
                src={banner.img} 
                alt={`Promotional Banner ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroCarousel;