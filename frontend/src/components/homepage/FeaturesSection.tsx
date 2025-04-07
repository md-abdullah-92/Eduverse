
import { motion } from "framer-motion";

import { User, Clock, Monitor, DollarSign } from 'lucide-react';

const benefits = [
  {
    title: 'One on One Monitor',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
    icon: <User className="text-white" />,
    bg: 'bg-blue-600',
  },
  {
    title: '24/7 Mentor',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
    icon: <Clock className="text-white" />,
    bg: 'bg-lime-600',
  },
  {
    title: 'Whiteboard',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
    icon: <Monitor className="text-white" />,
    bg: 'bg-pink-600',
  },
  {
    title: 'Affordable Price',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
    icon: <DollarSign className="text-white" />,
    bg: 'bg-orange-500',
  },
];

export default function FeaturesSection() {
    return (
        <motion.section
            id="features"
            className="bg-gradient-to-r from-blue-50 to-sky-100 py-20 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, amount: 0.2 }}
        >
             <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-sky-900 mb-4">Benefits of Online Education</h2>
                    <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                      Discover how online learning empowers flexibility, accessibility, and personalized education.
                    </p>
          
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                      {benefits.map((item, index) => (
                        <motion.div
                          key={index}
                          className="bg-white rounded-2xl shadow-md p-6 text-left"
                          whileHover={{ scale: 1.05 }}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.bg}`}>
                            {item.icon}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.section>
    )
}