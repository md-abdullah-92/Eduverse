

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Image from 'next/image';

export default function CourseCTASection() {
  return (
    <motion.section
           className="bg-gradient-to-r from-blue-50 to-sky-100 py-20"
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
         >
           <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-12">
             {/* Left side - stacked video thumbnails */}
             <div className="relative w-full md:w-1/2 flex justify-center items-center">
               {/* Back box */}
               <div className="w-64 h-64 bg-sky-200 rounded-xl absolute top-0 left-0 translate-x-10 -translate-y-10 z-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                   <Play className="text-sky-600" />
                 </div>
               </div>
               {/* Front box with image */}
               <div className="w-64 h-64 bg-yellow-300 rounded-xl z-10 overflow-hidden relative flex items-center justify-center">
                 <Image
                   src="/images/student.png"
                   alt="Student"
                   fill
                   className="object-cover"
                 />
                 <div className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center z-20">
                   <Play className="text-yellow-500" />
                 </div>
               </div>
             </div>
   
             {/* Right side - text content */}
             <div className="w-full md:w-1/2 text-center md:text-left">
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                 We are Always Ensure<br />Best Course for your learning
               </h2>
               <p className="text-gray-600 mb-6">
                 Lorem Ipsum is simply dummy text of the printing and IT typesetting industry. Lorem Ipsum has been the
               </p>
               <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-full transition duration-300">
                 Join Us Free
               </button>
             </div>
           </div>
         </motion.section>
  );
}
