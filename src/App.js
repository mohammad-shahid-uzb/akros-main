import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
// Existing pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Certificates from "./pages/Certificates";
import CostIntelligence from "./pages/CostIntelligence";
import InputPage from "./pages/BoqInputPage";
import RateInputPage from "./pages/RateInputPage";
import PricesPage from "./pages/PricesPage";

// New pages
import MaterialsPage from "./pages/AdminCreateMaterial";
import SupplierRegistrationPage from "./pages/SupplierRegister";
import SupplierPricePage from "./pages/SupplierEnterPrice";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <Router>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    {/* Existing routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/certificates" element={<Certificates />} />
                    <Route path="/cost-intelligence" element={<CostIntelligence />} />
                    <Route path="/input" element={<InputPage />} />
                    <Route path="/rateinput" element={<RateInputPage />} />
                    <Route path="/prices" element={<PricesPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    {/* New routes */}
                    <Route path="/materials" element={<MaterialsPage />} />
                    <Route path="/suppliers" element={<SupplierRegistrationPage />} />
                    <Route path="/supplier-prices" element={<SupplierPricePage />} />
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                </Routes>
            </div>
            <Footer />
        </Router>
    );
}

export default App;
