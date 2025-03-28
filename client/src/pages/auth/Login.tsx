import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card p-8 shadow-md rounded-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text mb-2">Welcome Back</h1>
            <p className="text-text-muted">Sign in to your account</p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 text-center text-sm text-text-muted">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;