export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">This is a test page to verify routing is working.</p>
        <div className="mt-8 space-y-4">
          <a href="/auth/login" className="block text-blue-600 hover:text-blue-800">
            Go to Login Page
          </a>
          <a href="/auth/register" className="block text-blue-600 hover:text-blue-800">
            Go to Register Page
          </a>
        </div>
      </div>
    </div>
  );
}
