import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import Header from '../components/Header';

const Debug = () => {
  const { user } = useAuthStore();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/me');
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!userInfo) {
    return <div className="p-4">No user data</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header title="Debug Console" showBackButton={true} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 p-8 border border-white/20">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            User Permissions
          </h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">User Info</h2>
              <div className="bg-gray-50 p-4 rounded space-y-2">
                <p>
                  <strong>ID:</strong> {userInfo.id}
                </p>
                <p>
                  <strong>Name:</strong> {userInfo.name}
                </p>
                <p>
                  <strong>Email:</strong> {userInfo.email}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Roles</h2>
              {userInfo.roles && userInfo.roles.length > 0 ? (
                <div className="bg-blue-50 p-4 rounded space-y-2">
                  {userInfo.roles.map((role) => (
                    <div key={role.id} className="text-blue-900">
                      <strong>{role.label}</strong> ({role.name})
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded text-gray-600">No roles assigned</div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Permissions</h2>
              {userInfo.permissions && userInfo.permissions.length > 0 ? (
                <div className="bg-green-50 p-4 rounded space-y-1">
                  {userInfo.permissions.map((perm) => (
                    <div key={perm} className="text-green-900 font-mono">
                      ✓ {perm}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded text-gray-600">No permissions assigned</div>
              )}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Can upload images?</strong>{' '}
                {userInfo.permissions?.includes('cars.update') ? '✓ YES' : '✗ NO'}
              </p>
              <p className="text-sm text-yellow-800">
                <strong>Can create cars?</strong>{' '}
                {userInfo.permissions?.includes('cars.create') ? '✓ YES' : '✗ NO'}
              </p>
              <p className="text-sm text-yellow-800">
                <strong>Can moderate cars?</strong>{' '}
                {userInfo.permissions?.includes('cars.moderate') ? '✓ YES' : '✗ NO'}
              </p>
            </div>

            <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>
                If you cannot upload images, make sure you have the{' '}
                <code className="bg-white px-1">cars.update</code> permission.
              </p>
              <p>
                You need to be logged in as a <strong>Seller</strong> or <strong>Admin</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Debug;
