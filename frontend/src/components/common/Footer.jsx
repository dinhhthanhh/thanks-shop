import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">About Thanks-Shop</h3>
                        <p className="text-gray-300 text-sm">
                            Your one-stop shop for all household cleaning products. Quality products, affordable prices.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-gray-300 hover:text-white transition-colors">
                                    Cart
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-gray-300 hover:text-white transition-colors">
                                    Orders
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <p className="text-gray-300 text-sm">Email: dinhhthanhhlove@gmail.com</p>
                        <p className="text-gray-300 text-sm">Phone: +84 911 083 919</p>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-300">
                    <p>&copy; {new Date().getFullYear()} Thanks-Shop. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
