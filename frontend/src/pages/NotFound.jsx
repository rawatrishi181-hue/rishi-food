import { Link } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-fadeIn">
      <div className="relative mb-8">
        <div className="text-[150px] font-black text-gray-100 leading-none select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
            <Search className="w-16 h-16 text-primary" />
          </div>
        </div>
      </div>
      
      <h1 className="text-4xl font-black text-gray-800 mb-4 italic tracking-tight">
        Oops! Page Not Found
      </h1>
      <p className="text-gray-500 mb-10 max-w-md mx-auto font-medium leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link to="/">
          <Button className="px-8 py-4 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-primary/20 group">
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
        </Link>
        <button 
          onClick={() => window.history.back()}
          className="px-8 py-4 rounded-2xl flex items-center gap-2 font-bold text-gray-600 hover:bg-gray-100 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
