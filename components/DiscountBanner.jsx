"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { fetchBanners } from "@/lib/api/banner"; // 👈 your custom API function
import { API_BASE_URL } from "@/utils/config"; // for image

const DiscountBanner = () => {
  const [banners, setBanners] = useState([]);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    fetchBanners().then((data) => {
      setBanners(data);
    });
  }, []);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.params) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, [banners]); // wait until banners are loaded

  if (banners.length === 0) {
    return <div className="h-[300px] bg-muted animate-pulse rounded-xl" />;
  }

  return (
    <div className="relative w-full max-w-screen-xl mx-auto mt-10 mb-5">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="rounded-lg"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="flex-1 p-6 md:px-12">
                    <Badge
                      variant="secondary"
                      className="mb-2 md:mb-4 text-darkBlue capitalize"
                    >
                      Sale {banner.discount_text || "Special"} off
                    </Badge>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 md:mb-4">
                      {banner.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {banner.subtitle}
                    </p>
                    {banner.coupon_code && (
                      <p className="mb-4">
                        Use code:{" "}
                        <span className="font-semibold text-primary uppercase">
                          {banner.coupon_code}
                        </span>{" "}
                        for{" "}
                        <span className="font-semibold">
                          {banner.discount_text}
                        </span>{" "}
                        OFF
                      </p>
                    )}
                    <Button>Shop Now</Button>
                  </div>
                  {/* Right image part */}
                  <div className="relative w-full md:w-1/2 aspect-[4/3] overflow-hidden">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      priority
                      className="object-cover hover:scale-105 transition-transform duration-500 ease-in-out"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Prev/Next Buttons */}
      <div
        ref={prevRef}
        className="custom-prev absolute top-1/2 -translate-y-1/2 left-4 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 cursor-pointer"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </div>
      <div
        ref={nextRef}
        className="custom-next absolute top-1/2 -translate-y-1/2 right-4 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 cursor-pointer"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default DiscountBanner;
