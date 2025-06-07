'use client';

import React from "react";

import {
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  
  Download,
  Eye,
  
  Play,
  Users,
  
  
} from "lucide-react";



const BestSellingCourse: React.FC = () => {
  // Replace this with actual data from props or context
  
  return (
      <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  <span>Best Selling Course</span>
                </h3>
                <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1">
                  <span>View All</span>
                  <ChevronRight size={16} />
                </button>
              </div>
    
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="relative w-full lg:w-80 h-52 rounded-2xl overflow-hidden shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold">
                    #1 Bestseller
                  </div>
                </div>
    
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Complete Business Finance & Accounting Masterclass
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center space-x-1">
                        <BookOpen size={16} />
                        <span>12 Lessons</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>2,340 Students</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>8 Weeks</span>
                      </span>
                    </div>
                  </div>
    
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-teal-600">$49.99</span>
                    <span className="text-lg text-gray-400 line-through">
                      $99.99
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      50% OFF
                    </span>
                  </div>
    
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-xl font-bold text-gray-900">2,340</div>
                      <div className="text-sm text-gray-600">Enrollments</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-xl font-bold text-green-600">
                        $116,940
                      </div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-xl font-bold text-blue-600">4.8</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-xl font-bold text-purple-600">92%</div>
                      <div className="text-sm text-gray-600">Completion</div>
                    </div>
                  </div>
    
                  <div className="flex space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200">
                      <Eye size={16} />
                      <span>View Course</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200">
                      <Download size={16} />
                      <span>Download Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
           
  );
};

export default BestSellingCourse;
