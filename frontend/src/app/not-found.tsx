export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-6">Sorry, the page you are looking for does not exist or you do not have access.</p>
        <a href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Go Home</a>
      </div>
    </div>
  );
}
