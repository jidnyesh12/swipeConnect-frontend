const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              SwipeChat
            </h3>
            <p className="text-slate-600">
              Connect with amazing people around the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Product</h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-800 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-800 transition-colors"
                  >
                    Premium
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-800 transition-colors"
                  >
                    Safety
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Company</h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-800 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-800 transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-800 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Support</h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-800 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-800 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-slate-800 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} SwipeChat. All rights reserved. Built
              with ❤️ for meaningful connections.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
