import { Link } from 'react-router-dom';
import { FaInstagram, FaYoutube, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4 inline-flex">
              <Sparkles className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl tracking-tight text-gray-900">TheViewMint</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              The creator-first platform. Turn your views into income by creating content for top brands.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/theviewmint?igsh=MWlldDViazcxMGFmMw%3D%3D&utm_source=qr" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                <FaYoutube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/campaigns" className="text-gray-500 hover:text-primary transition-colors text-sm">Browse Campaigns</Link></li>
              <li><Link to="/for-creators" className="text-gray-500 hover:text-primary transition-colors text-sm">For Creators</Link></li>
              <li><Link to="/learn" className="text-gray-500 hover:text-primary transition-colors text-sm">How it Works</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Support</h4>
            <ul className="space-y-4">
              <li><a href="mailto:admin@theviewmint.in" className="text-gray-500 hover:text-primary transition-colors text-sm">Contact Us</a></li>
              <li><Link to="#" className="text-gray-500 hover:text-primary transition-colors text-sm">FAQ</Link></li>
              <li><Link to="#" className="text-gray-500 hover:text-primary transition-colors text-sm">Help Center</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="text-gray-500 hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="#" className="text-gray-500 hover:text-primary transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="#" className="text-gray-500 hover:text-primary transition-colors text-sm">Creator Agreement</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} TheViewMint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
