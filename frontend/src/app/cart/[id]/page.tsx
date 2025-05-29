"use client";
import {
  ArrowRight,
  BookOpen,
  Clock,
  CreditCard,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const EduverseCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "Advanced React Development",
      instructor: "Sarah Chen",
      price: 89.99,
      duration: "12 hours",
      students: "15,234",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop",
      level: "ADVANCED",
    },
    {
      id: 2,
      title: "UI/UX Design Masterclass",
      instructor: "Alex Rodriguez",
      price: 69.99,
      duration: "8 hours",
      students: "8,921",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop",
      level: "INTERMEDIATE",
    },
    {
      id: 3,
      title: "Python for Data Science",
      instructor: "Dr. Maria Silva",
      price: 79.99,
      duration: "15 hours",
      students: "22,156",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=200&fit=crop",
      level: "BEGINNER",
    },
  ]);

  const [promoCode, setPromoCode] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const removeItem = (id: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCartItems(cartItems.filter((item) => item.id !== id));
      setIsAnimating(false);
    }, 300);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-700";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-700";
      case "ADVANCED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-700 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-700 to-purple-600 bg-clip-text text-transparent">
              Eduverse
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Complete your learning journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-6 h-6 text-teal-700" />
              <h2 className="text-2xl font-bold text-gray-900">
                Shopping Cart
              </h2>
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "course" : "courses"}
              </span>
            </div>

            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/50 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  <div className="relative overflow-hidden rounded-xl flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-32 h-24 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-teal-700 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 font-medium">
                          by {item.instructor}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-all duration-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-700">
                          {item.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{item.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {item.students} students
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(
                          item.level
                        )}`}
                      >
                        {item.level}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${item.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 sticky top-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-teal-700" />
                Order Summary
              </h3>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                  />
                  <button className="px-6 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl font-medium transition-all duration-300">
                    Apply
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 rounded-xl">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  30-day money-back guarantee
                </span>
              </div>

              {/* Checkout Button */}
              <button className="w-full bg-gradient-to-r from-teal-700 to-purple-600 hover:from-teal-800 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 group">
                Complete Purchase
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              {/* Benefits */}
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-700" />
                  What you get:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-700 rounded-full" />
                    Lifetime access to courses
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-700 rounded-full" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-700 rounded-full" />
                    24/7 instructor support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-700 rounded-full" />
                    Mobile and desktop access
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EduverseCart;
