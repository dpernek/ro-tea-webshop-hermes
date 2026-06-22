"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const displayImages =
    images.length > 0 ? images : ["/images/placeholder.svg"];

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
        <Image
          src={displayImages[selected]}
          alt={alt}
          fill
          className="object-contain p-4"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelected(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl bg-slate-50 transition-all",
                selected === index
                  ? "ring-brand ring-2 ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              )}
              aria-label={`Prikaži sliku ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${alt} - slika ${index + 1}`}
                fill
                className="object-contain p-2"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
