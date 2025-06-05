"use client";
import { useAuth } from "@/app/auth/context";
import { useToast } from "@/components/ui_elements/toast";
import cartService from "@/lib/api/cartService";
import { CartItem } from "@/utils/types";
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  Loader2,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Helper functions
const getLevelColor = (level: string) => {
  const colors = {
    BEGINNER: "bg-green-100 text-green-700",
    INTERMEDIATE: "bg-yellow-100 text-yellow-700",
    ADVANCED: "bg-red-100 text-red-700",
  };
  return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700";
};

const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + Number(item.course.price), 0);
};

// Components
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
    <div className="flex items-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
      <span className="text-lg text-gray-600">Loading cart...</span>
    </div>
  </div>
);

const EmptyCart = () => {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Your cart is empty
      </h2>
      <p className="text-gray-600 mb-6">
        Add some courses to get started with your learning journey!
      </p>
      <button
        className="bg-gradient-to-r from-teal-700 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
        onClick={() => router.push("/courses")}
      >
        Browse Courses
      </button>
    </div>
  );
};

const CartItemCard = ({
  item,
  index,
  onRemove,
  isRemoving,
}: {
  item: CartItem;
  index: number;
  onRemove: (courseId: number) => void;
  isRemoving: boolean;
}) => (
  <div
    className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/50 hover:scale-[1.02]"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex gap-6">
      <div className="relative overflow-hidden rounded-xl flex-shrink-0">
        <img
          src={item.course.coverPhotoUrl || "https://via.placeholder.com/150"}
          alt={item.course.title}
          className="w-32 h-24 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-xl text-gray-900 group-hover:text-teal-700 transition-colors duration-300">
              {item.course.title}
            </h3>
            <p className="text-gray-600 font-medium">
              by {item.course.instructorId}
            </p>
          </div>
          <button
            onClick={() => onRemove(item.course.id)}
            disabled={isRemoving}
            className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-all duration-300 disabled:opacity-50"
          >
            {isRemoving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium text-gray-700">
              {item.course.averageRating || "New"}
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(
              item.course.level
            )}`}
          >
            {item.course.level}
          </span>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            ৳ {item.course.price}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OrderSummary = ({
  subtotal,
  onCheckout,
  isCheckingOut,
}: {
  subtotal: number;
  onCheckout: () => void;
  isCheckingOut: boolean;
}) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 sticky top-4">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <CreditCard className="w-6 h-6 text-teal-700" />
      Order Summary
    </h3>

    {/* Price Breakdown */}
    <div className="space-y-4 mb-6">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span> ৳ {subtotal.toFixed(2)}</span>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between text-2xl font-bold text-gray-900">
          <span>Total</span>
          <span> ৳ {subtotal.toFixed(2)}</span>
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
    <button
      onClick={onCheckout}
      disabled={isCheckingOut}
      className="w-full bg-gradient-to-r from-teal-700 to-purple-600 hover:from-teal-800 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
    >
      {isCheckingOut ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Complete Purchase
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </>
      )}
    </button>

    {/* Benefits */}
    <div className="mt-6 space-y-3">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-teal-700" />
        What you get:
      </h4>
      <ul className="space-y-2 text-sm text-gray-600">
        {[
          "Lifetime access to courses",
          "Certificate of completion",
          "24/7 instructor support",
          "Mobile and desktop access",
        ].map((benefit, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-700 rounded-full" />
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const EduverseCart = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [checkingOut, setCheckingOut] = useState(false);

  // Fetch cart data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user?.id) {
      showToast("Please login to view your cart", "error");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.getCart(user.id);

      if (response.success) {
        setCartItems(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      const data = error as { message: string };
      showToast(data.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (courseId: number) => {
    if (!user?.id) {
      showToast("Please login to remove a course from your cart", "error");
      return;
    }

    try {
      setRemoving((prev) => ({ ...prev, [courseId]: true }));
      const response = await cartService.removeFromCart(user.id, courseId);

      if (response.success) {
        setCartItems((prev) => prev.filter((item) => item.id !== courseId));
        showToast("Course removed from cart", "success");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      const data = error as { message: string };
      showToast(data.message, "error");
    } finally {
      setRemoving((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);

      const cartTotal = calculateSubtotal(cartItems);

      // Call your API to create payment intent
      const response = await fetch(
        "http://localhost:5002/api/purchase/payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: cartTotal,
            currency: "usd",
            metadata: {
              cartId: user?.id,
              source: "web_checkout",
            },
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Navigate to checkout page with payment intent data
        router.push(
          `/checkout?clientSecret=${data.data.clientSecret}&paymentIntentId=${
            data.data.paymentIntentId
          }&amount=${cartTotal.toString()}`
        );
        showToast("Checkout started successfully!", "success");
      } else {
        throw new Error(data.message || "Failed to create payment intent");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // Show error message to user
      showToast("Failed to start checkout. Please try again.", "error");
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = calculateSubtotal(cartItems);

  if (loading) {
    return <LoadingScreen />;
  }

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

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
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
                <CartItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={removeItem}
                  isRemoving={removing[item.course.id]}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={subtotal}
                onCheckout={handleCheckout}
                isCheckingOut={checkingOut}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EduverseCart;
