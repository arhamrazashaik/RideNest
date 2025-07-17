import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaAppStore, FaGooglePlay, FaHeadset } from 'react-icons/fa';

const Footer = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">About</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  Press
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/help" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  Safety
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/covid" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  COVID-19 Resources
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300">
                  Accessibility
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-center">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300 flex items-center"
                >
                  <FaTwitter className="h-5 w-5 mr-2" />
                  <span>Twitter</span>
                </a>
              </li>
              <li className="flex items-center">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300 flex items-center"
                >
                  <FaFacebook className="h-5 w-5 mr-2" />
                  <span>Facebook</span>
                </a>
              </li>
              <li className="flex items-center">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300 flex items-center"
                >
                  <FaInstagram className="h-5 w-5 mr-2" />
                  <span>Instagram</span>
                </a>
              </li>
              <li className="flex items-center">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-300 flex items-center"
                >
                  <FaLinkedin className="h-5 w-5 mr-2" />
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-12 border-t border-gray-200 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">KR0354</span>
                <span className="ml-2 text-sm font-medium text-gray-500">Ride Sharing</span>
              </Link>
              <p className="mt-2 text-sm text-gray-500">
                &copy; {new Date().getFullYear()} KR0354 Ride Sharing. All rights reserved.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-4 mb-4">
                <motion.a
                  href="#"
                  className="text-gray-400 hover:text-primary-600 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="sr-only">App Store</span>
                  <FaAppStore className="h-6 w-6" />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-gray-400 hover:text-primary-600 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="sr-only">Google Play</span>
                  <FaGooglePlay className="h-6 w-6" />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-gray-400 hover:text-primary-600 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="sr-only">Support</span>
                  <FaHeadset className="h-6 w-6" />
                </motion.a>
              </div>
              <div className="text-sm text-gray-500">
                <a href="/contact" className="hover:text-primary-600 transition-colors duration-300">
                  24/7 Customer Support
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
