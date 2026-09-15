import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar     from './components/common/Navbar';
import Footer     from './components/common/Footer';
import ProtectedRoute      from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';
import GuestRoute      from './components/common/GuestRoute';

import Home           from './pages/Home/Home';
import TutorsPage     from './pages/TutorsPage/TutorsPage';
import TutorProfile   from './pages/TutorProfile/TutorProfile';
import LoginPage      from './pages/LoginPage/LoginPage';
import RegisterTutor  from './pages/RegisterTutor/RegisterTutor';
import RegisterStudent from './pages/RegisterStudent/RegisterStudent';
import Dashboard      from './pages/Dashboard/Dashboard';
import Support        from './pages/Support/Support';
import Students       from './pages/Students/Students';
import AdminPage      from './pages/AdminPage/AdminPage';
import RegisterAdmin  from './pages/RegisterAdmin/RegisterAdmin';
import PasswordReset  from './pages/LoginPage/PasswordReset';
import ForgetPassword  from './pages/LoginPage/ForgetPassword';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/"                 element={<Home />} />
          <Route path="/tutors"           element={<TutorsPage />} />
          <Route path="/tutors/:id"       element={<TutorProfile />} />
          <Route path="/login"            element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register-tutor"   element={<GuestRoute><RegisterTutor /></GuestRoute>} />
          <Route path="/student-register" element={<GuestRoute><RegisterStudent /></GuestRoute>} />
          <Route path="/admin-register"   element={<GuestRoute><RegisterAdmin /></GuestRoute>} />
          <Route path="/support"          element={<Support />} />
          <Route path="/students"         element={<Students />} />
          <Route path="/PasswordReset"         element={<PasswordReset />} />
           <Route path="/ForgetPassword"         element={<ForgetPassword />} />

          {/* Protected: any logged-in user */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
