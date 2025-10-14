import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { supabase, UserProfile, DoctorProfile } from '../lib/supabase';
import { LogOut, Stethoscope, User, CheckCircle, Clock } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        onLogout();
        return;
      }

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', user.uid)
        .maybeSingle();

      if (userProfile) {
        setProfile(userProfile);

        if (userProfile.user_type === 'doctor') {
          const { data: docProfile } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('user_id', user.uid)
            .maybeSingle();

          if (docProfile) {
            setDoctorProfile(docProfile);
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    onLogout();
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

  const isDoctor = profile?.user_type === 'doctor';
  const bgGradient = isDoctor
    ? 'from-blue-50 via-white to-cyan-50'
    : 'from-cyan-50 via-white to-blue-50';
  const accentColor = isDoctor ? 'blue' : 'cyan';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className={`w-10 h-10 bg-${accentColor}-100 rounded-full flex items-center justify-center mr-3`}>
                {isDoctor ? (
                  <Stethoscope className={`w-6 h-6 text-${accentColor}-600`} />
                ) : (
                  <User className={`w-6 h-6 text-${accentColor}-600`} />
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">HealthCare Portal</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {profile?.full_name}!
              </h2>
              <p className="text-gray-600">
                {isDoctor ? 'Doctor Dashboard' : 'Patient Dashboard'}
              </p>
            </div>
            <span className={`px-4 py-2 bg-${accentColor}-100 text-${accentColor}-700 rounded-full text-sm font-medium`}>
              {isDoctor ? 'Doctor' : 'Patient'}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <p className="text-gray-900 font-medium">{profile?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="text-gray-900 font-medium">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Account Type</label>
                  <p className="text-gray-900 font-medium capitalize">{profile?.user_type}</p>
                </div>
              </div>
            </div>

            {isDoctor && doctorProfile && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                <div className="flex items-center">
                  {doctorProfile.is_verified ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <p className="text-gray-900 font-medium">Verified Doctor</p>
                        <p className="text-sm text-gray-600">Your credentials have been verified</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-6 h-6 text-amber-600 mr-3" />
                      <div>
                        <p className="text-gray-900 font-medium">Pending Verification</p>
                        <p className="text-sm text-gray-600">Your certificate is under review</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 bg-${accentColor}-100 rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDoctor ? 'Appointments' : 'My Appointments'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {isDoctor ? 'Manage your patient appointments' : 'View and book appointments'}
            </p>
            <button className={`text-${accentColor}-600 hover:text-${accentColor}-700 font-medium text-sm`}>
              View All →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 bg-${accentColor}-100 rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDoctor ? 'Patient Records' : 'Medical Records'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {isDoctor ? 'Access patient medical records' : 'View your health records'}
            </p>
            <button className={`text-${accentColor}-600 hover:text-${accentColor}-700 font-medium text-sm`}>
              View All →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 bg-${accentColor}-100 rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
            <p className="text-gray-600 text-sm mb-4">
              {isDoctor ? 'Communicate with patients' : 'Chat with your doctors'}
            </p>
            <button className={`text-${accentColor}-600 hover:text-${accentColor}-700 font-medium text-sm`}>
              View All →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
