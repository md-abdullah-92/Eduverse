'use client';

export default function CertificatesPage() {
  // This would come from your API/database
  const certificates = [
    {
      id: 1,
      courseName: 'Introduction to Web Development',
      issueDate: '2025-03-15',
      instructor: 'John Doe',
      status: 'completed'
    },
    // Add more certificates
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Certificates</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{cert.courseName}</h3>
                <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                  {cert.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Instructor: {cert.instructor}</p>
              <p className="text-sm text-gray-600 mb-4">Issued: {cert.issueDate}</p>
              <button className="w-full bg-sky-900 text-white py-2 rounded-md hover:bg-sky-800 transition-colors">
                View Certificate
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
