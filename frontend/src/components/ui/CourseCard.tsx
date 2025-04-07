'use client';

import Link from 'next/link';

type CourseCardProps = {
  title: string;
  description: string;
  image: string;
  instructor: string;
  slug: string;
  price?: number;
};

export const CourseCard = ({ title, description, image, instructor, slug, price }: CourseCardProps) => {
  return (
    <Link href={`/courses/${slug}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-[1.02]">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{instructor}</span>
            {price !== undefined && (
              <span className="text-sky-900 font-semibold">${price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
