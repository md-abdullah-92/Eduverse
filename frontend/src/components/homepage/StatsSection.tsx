
import { motion } from 'framer-motion';
import React from 'react';

const stats = [
    { value: '8200', label: 'Success Stories' },
    { value: '12200', label: 'Expert Mentors' },
    { value: '50000', label: 'Hours Course' },
    { value: '70000', label: 'Active Student' },
  ];

export default function StatsSection(){
    return(
         <section className="bg-teal-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20 text-center">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        className="px-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <h3 className="text-4xl font-extrabold">{stat.value}</h3>
                        <p className="text-base mt-2">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
          </section>
    )
}