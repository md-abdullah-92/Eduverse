const Footer = () => {
    return (
      <footer className="bg-[#165B69] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Social */}
          <div>
            <h3 className="text-xl font-bold mb-2">🚀 Learn.</h3>
            <p className="mb-4 text-sm text-gray-200">Follow on social service</p>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook">
                <img src="/icons/facebook.png" alt="Facebook" className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Instagram">
                <img src="/icons/instagram.png" alt="Instagram" className="w-6 h-6" />
              </a>
            </div>
          </div>
  
          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Links</h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li><a href="#">Home</a></li>
              <li><a href="#">Help center</a></li>
              <li><a href="#">Service</a></li>
            </ul>
          </div>
  
          {/* Resource */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Resource</h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Carrier</a></li>
              <li><a href="#">Legal Notice</a></li>
            </ul>
          </div>
  
          {/* Contacts */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Contacts</h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>Email Us</li>
              <li>Support</li>
              <li>+8801603252292</li>
            </ul>
          </div>
        </div>
  
        {/* Bottom Bar */}
        <div className="mt-10 border-t border-gray-400 pt-4 text-center text-sm text-gray-300">
          &copy; 2025 All rights reserved.
        </div>
      </footer>
    );
  };
  
  export default Footer;
  