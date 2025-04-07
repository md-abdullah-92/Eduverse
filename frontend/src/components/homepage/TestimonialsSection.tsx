import Image from 'next/image';
import { motion } from 'framer-motion';


const testimonials = [
  {
    name: 'Beth Luna',
    image: '/beth.jpg',
    stars: 5,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
  },
  {
    name: 'Belinda Gomez',
    image: '/belinda.jpg',
    stars: 5,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
  },
  {
    name: 'Howard Clayton',
    image: '/howard.jpg',
    stars: 5,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
  },
];

export default function TestimonialsSection() {
  return (
    <motion.section
           id="testimonials"
            className="bg-gradient-to-r from-blue-50 to-sky-100 py-20 text-center"
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           viewport={{ once: true, amount: 0.2 }}
         >
           
             <h2 className="text-4xl font-bold text-[#1f1f4e]">What our Students say</h2>
             <p className="text-gray-600 mt-2 max-w-xl mx-auto">
               Hear what our students have to say about their experience.
             </p>
   
             <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
               {testimonials.map((testimonial, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-xl shadow-md text-left">
                   <h3 className="text-lg font-semibold text-[#1f1f4e]">Great Platform</h3>
                   <span className="text-3xl text-[#1f1f4e] mt-2">“</span>
                   <p className="text-sm text-gray-600 mt-2">{testimonial.text}</p>
                   <hr className="my-4" />
                   <div className="flex items-center gap-3">
                     <Image
                       src={testimonial.image}
                       alt={testimonial.name}
                       width={40}
                       height={40}
                       className="rounded-full"
                     />
                     <div>
                       <p className="font-semibold text-sm">{testimonial.name}</p>
                       <div className="text-yellow-400 text-sm">
                         {'★'.repeat(testimonial.stars)}
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           
         </motion.section>
  );
}
