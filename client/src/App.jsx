import { AuthProvider } from "./context/AuthContext.jsx";

export default function App() {
  return (
    <AuthProvider>
      {/* Router, routes and layout will wrap here in the next steps */}
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <span className="text-3xl">🛍️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ShopEase Frontend
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Phase 4: Frontend Base Setup Active
          </p>
          <div className="space-y-2 text-left text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> Vite + React 18
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> Tailwind CSS & Inter Typography
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> Axios + 401 Refresh Interceptor
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span> AuthContext + useAuth mounted
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
