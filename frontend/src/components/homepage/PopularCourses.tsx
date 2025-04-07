import Image from "next/image";
import Link from "next/link";

const courses = [
  {
    title: "Web Design Basic to advance",
    image: "/images/web-design.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "Web Development Basic to advance",
    image: "/images/web-development.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "Digital Marketing Basic to advance",
    image: "/images/digital-marketing.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "App Design Basic to advance",
    image: "/images/app-design.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "Mobile Design Basic to advance",
    image: "/images/mobile-design.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "Graphics Design Basic to advance",
    image: "/images/graphics-design.jpg",
    rating: 5,
    reviews: 2,
  },
];

export default function PopularCourses() {
  return (
    <section className="py-16 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800">Our Popular Course</h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
        {courses.map((course, index) => (
          <div key={index} className="shadow-lg rounded-2xl overflow-hidden bg-white">
            <div className="w-full h-52 relative">
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800">{course.title}</h3>
              <div className="flex items-center mt-2 text-yellow-400">
                {'★'.repeat(course.rating)}
                <span className="text-gray-600 text-sm ml-2">5.0 ({course.reviews} rating)</span>
              </div>
              <button className="mt-4 w-full border border-blue-500 text-blue-500 font-semibold py-2 rounded-md hover:bg-blue-50 transition">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* See More Button */}
      <div className="mt-10 text-center">
        <Link href="/courses">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-6 rounded-full transition shadow-md">
            See More
          </button>
        </Link>
      </div>
    </section>
  );
}
