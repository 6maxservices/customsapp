import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { commonText } from '../../lib/translations';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Show more detailed error message
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        (err.response?.status === 400 ? 'Μη έγκυρο email ή κωδικός' : 'Σφάλμα σύνδεσης. Παρακαλώ δοκιμάστε ξανά.');
      setError(errorMessage);

      // Log full error for debugging
      if (import.meta.env.DEV) {
        console.error('Login error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          stack: err.stack,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Customs App Fuel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">Συνδεθείτε στον λογαριασμό σας</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {commonText.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={commonText.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {commonText.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={commonText.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Σύνδεση...' : 'Σύνδεση'}
            </button>
          </div>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">Development Users (Click to Fill)</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onClick={() => { setEmail('station@alpha.gr'); setPassword('password123'); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded border text-left">
              <div className="font-semibold text-gray-700">Station Operator</div>
              <div className="text-gray-500">station@alpha.gr</div>
            </button>

            <button type="button" onClick={() => { setEmail('admin@alpha.gr'); setPassword('password123'); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded border text-left">
              <div className="font-semibold text-gray-700">Company Admin</div>
              <div className="text-gray-500">admin@alpha.gr</div>
            </button>

            <button type="button" onClick={() => { setEmail('user@alpha.gr'); setPassword('password123'); }} className="p-2 bg-gray-50 hover:bg-gray-100 rounded border text-left">
              <div className="font-semibold text-gray-700">Company Operator</div>
              <div className="text-gray-500">user@alpha.gr</div>
            </button>

            <button type="button" onClick={() => { setEmail('reviewer@customs.gov.gr'); setPassword('password123'); }} className="p-2 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 text-left">
              <div className="font-semibold text-blue-800">Customs Reviewer</div>
              <div className="text-blue-600">reviewer@customs.gov.gr</div>
            </button>

            <button type="button" onClick={() => { setEmail('supervisor@customs.gov.gr'); setPassword('password123'); }} className="p-2 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 text-left">
              <div className="font-semibold text-blue-800">Customs Supervisor</div>
              <div className="text-blue-600">supervisor@customs.gov.gr</div>
            </button>

            <button type="button" onClick={() => { setEmail('director@customs.gov.gr'); setPassword('password123'); }} className="p-2 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 text-left">
              <div className="font-semibold text-blue-800">Customs Director</div>
              <div className="text-blue-600">director@customs.gov.gr</div>
            </button>

            <button type="button" onClick={() => { setEmail('admin@system.gov.gr'); setPassword('password123'); }} className="col-span-2 p-2 bg-purple-50 hover:bg-purple-100 rounded border border-purple-100 text-left text-center">
              <span className="font-semibold text-purple-800">System Admin: </span>
              <span className="text-purple-600">admin@system.gov.gr</span>
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Password for all: password123</p>
        </div>
      </div>
    </div>
  );
}

