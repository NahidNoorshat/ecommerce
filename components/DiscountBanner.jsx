"use client";

import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import Hero2 from "../public/ecommerce_images/hero-2.png";
import Hero1 from "../public/ecommerce_images/hero-1.png";

const DiscountBanner = () => {
  return (
    <Carousel className="w-full max-w-screen-xl mx-auto mt-10 mb-5">
      <CarouselContent>
        {/* main item for loop */}
        <CarouselItem>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 p-6 md:px-12">
                  <Badge
                    variant="secondary"
                    className="mb-2 md:mb-4 text-darkBlue capitalize"
                  >
                    Sale 20% off
                  </Badge>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 md:mb-4">
                    Summer Sale
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Get ready for the season with our biggest discounts of the
                    year!
                  </p>
                  <p className="mb-4">
                    Use code:{" "}
                    <span className="font-semibold text-primary uppercase">
                      SUMMER20
                    </span>{" "}
                    for <span className="font-semibold">20%</span> OFF
                  </p>
                  <Button>Shop Now</Button>
                </div>

                <div className="w-full md:w-1/2 h-auto relative flex items-center justify-center py-2">
                  <Image
                    src={Hero2} // Placeholder for banner image
                    alt="Summer Sale Banner"
                    width={500}
                    height={500}
                    priority
                    className="h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CarouselItem>
        {/* main item for loop */}
        <CarouselItem>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 p-6 md:px-12">
                  <Badge
                    variant="secondary"
                    className="mb-2 md:mb-4 text-darkBlue capitalize"
                  >
                    Sale 20% off
                  </Badge>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 md:mb-4">
                    Summer Sale
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Get ready for the season with our biggest discounts of the
                    year!
                  </p>
                  <p className="mb-4">
                    Use code:{" "}
                    <span className="font-semibold text-primary uppercase">
                      SUMMER20
                    </span>{" "}
                    for <span className="font-semibold">20%</span> OFF
                  </p>
                  <Button>Shop Now</Button>
                </div>

                <div className="w-full md:w-1/2 h-auto relative flex items-center justify-center py-2">
                  <Image
                    src={Hero1} // Placeholder for banner image
                    alt="Summer Sale Banner"
                    width={500}
                    height={500}
                    priority
                    className="h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CarouselItem>
        {/* carousel end. */}
        {/* main item for loop */}
        <CarouselItem>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 p-6 md:px-12">
                  <Badge
                    variant="secondary"
                    className="mb-2 md:mb-4 text-darkBlue capitalize"
                  >
                    Sale 20% off
                  </Badge>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2 md:mb-4">
                    Summer Sale
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Get ready for the season with our biggest discounts of the
                    year!
                  </p>
                  <p className="mb-4">
                    Use code:{" "}
                    <span className="font-semibold text-primary uppercase">
                      SUMMER20
                    </span>{" "}
                    for <span className="font-semibold">20%</span> OFF
                  </p>
                  <Button>Shop Now</Button>
                </div>

                <div className="w-full md:w-1/2 h-auto relative flex items-center justify-center py-2">
                  <Image
                    src={Hero1} // Placeholder for banner image
                    alt="Summer Sale Banner"
                    width={500}
                    height={500}
                    priority
                    className="h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CarouselItem>
        {/* carousel end. */}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2" />
      <CarouselNext className="absolute right-2" />
    </Carousel>
  );
};

export default DiscountBanner;
