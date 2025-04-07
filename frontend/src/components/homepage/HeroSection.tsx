import { motion } from 'framer-motion';
import { inriaSerif,  reemKufi, poppins } from '@/utils/font';
import Link from 'next/link';



export default function HeroSection() {
    return (
          <motion.section
                id="home"
                className="bg-gradient-to-r from-blue-50 to-sky-100 py-20"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
              <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                  {/* Left Text */}
                  <motion.div
                    className="md:w-1/2 mb-12 md:mb-0 pl-16"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
              <h1 className={`text-5xl font-bold text-[#0f172a] leading-snug mb-6 ${inriaSerif.className}`}>
                   Scale your<br />Learning with<br />the power of AI
              </h1>

              <p className={`text-xl text-[#374151] font-semibold ${reemKufi.className}`}>
                 JOIN US FOR FREE
              </p>
             { /* need some space between button */}
             <span className="block h-4"></span>

              <Link
        href="/auth/register"
        className={`bg-[#1A5B6D] text-white px-6 py-2 rounded-xl font-semibold text-base hover:bg-[#154C5B] transition-colors ${poppins.className}`}
        >
              Start Learning
            </Link>
                  </motion.div>
        
                  {/* Right Visual Grid */}
                  <motion.div
                    className="md:w-1/2 grid grid-cols-[auto_auto] gap-x-4 gap-y-4 justify-center items-center"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className="w-40 h-40 rounded-full bg-blue-200 overflow-hidden flex items-center justify-center transition-transform"
                    >
                      <img src="/images/person1.png" alt="Person 1" className="w-full h-full object-cover" />
                    </motion.div>
        
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-40 h-40 bg-pink-300 rounded-xl overflow-hidden flex items-center justify-center transition-transform"
                    >
                      <img src="/images/person2.png" alt="Person 2" className="w-full h-full object-cover" />
                    </motion.div>
        
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-40 h-40 bg-yellow-300 rounded-lg transition-transform"
                    />
        
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-40 h-40 bg-gray-300 rounded-br-[80px] rounded-tr-[80px] transition-transform"
                    />
                  </motion.div>
                </div>
              </motion.section>
    )
}
