import { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import UserTypeSelection from './components/UserTypeSelection';
import DoctorAuth from './components/DoctorAuth';
import PatientAuth from './components/PatientAuth';
import Dashboard from './components/Dashboard';

type View = 'selection' | 'doctor-auth' | 'patient-auth' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('selection');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setFirebaseUid(user.uid);
        setCurrentView('dashboard');
      } else {
        setIsAuthenticated(false);
        setFirebaseUid(null);
        setCurrentView('selection');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectUserType = (type: 'doctor' | 'patient') => {
    setCurrentView(type === 'doctor' ? 'doctor-auth' : 'patient-auth');
  };

  const handleAuthSuccess = (uid: string) => {
    setIsAuthenticated(true);
    setFirebaseUid(uid);
    setCurrentView('dashboard');
  };

  const handleBack = () => {
    setCurrentView('selection');
  };

  const handleLogout = async () => {
    await auth.signOut();
    setIsAuthenticated(false);
    setFirebaseUid(null);
    setCurrentView('selection');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  switch (currentView) {
    case 'doctor-auth':
      return <DoctorAuth onBack={handleBack} onSuccess={handleAuthSuccess} />;
    case 'patient-auth':
      return <PatientAuth onBack={handleBack} onSuccess={handleAuthSuccess} />;
    default:
      return <UserTypeSelection onSelectType={handleSelectUserType} />;
  }
}

export default App;
