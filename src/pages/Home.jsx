import Hero from "../components/Hero";
import ServiceCard from "../components/ServiceCard";
import { Sun, Building2, Wrench, CheckCircle, Users, Briefcase } from "lucide-react";

const Home = () => {
    return (
        <div className="bg-white text-gray-800">
            {/* Hero Section */}
            <Hero />

            {/* Services */}
            <section className="py-20 px-6 bg-gray-100">
                <h2 className="text-4xl font-extrabold text-center mb-6">Our Core Services</h2>
                <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                    Delivering top-quality EPC solutions with precision, speed, and reliability for businesses worldwide.
                </p>
                <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    <ServiceCard
                        title="Solar EPC Solutions"
                        description="Turnkey solar projects from concept to commissioning, with guaranteed performance."
                        icon={<Sun />}
                    />
                    <ServiceCard
                        title="Building Construction"
                        description="Modern, sustainable buildings for residential, commercial, and industrial purposes."
                        icon={<Building2 />}
                    />
                    <ServiceCard
                        title="O&M Services"
                        description="Comprehensive operations & maintenance to ensure long-term project reliability."
                        icon={<Wrench />}
                    />
                </div>
            </section>

            {/* About + Stats */}
            <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-4xl font-extrabold mb-6">Who We Are</h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Akros Consultancy Services is a trusted name in EPC and construction, delivering
                        high-performance solar energy, building projects, and industrial maintenance solutions.
                    </p>
                    <p className="text-gray-500 mb-8">
                        With innovation, safety, and sustainability at our core, we help businesses achieve their
                        infrastructure goals efficiently.
                    </p>
                    <a
                        href="/about"
                        className="bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
                    >
                        Learn More
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                        <h3 className="text-4xl font-bold text-yellow-500">10+</h3>
                        <p className="text-gray-600">Years Experience</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                        <h3 className="text-4xl font-bold text-yellow-500">BIM</h3>
                        <p className="text-gray-600">Expert Solutions</p>
                    </div>
                </div>
            </section>

            {/* Industries */}
            <section className="py-20 px-6 bg-gray-50">
                <h2 className="text-4xl font-extrabold text-center mb-6">Industries We Serve</h2>
                <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                    From renewable energy to industrial and commercial projects, we deliver excellence across sectors.
                </p>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
                    <div className="p-6 bg-white shadow rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">Renewable Energy</h3>
                        <p className="text-gray-600">Solar and hybrid energy projects for sustainable growth.</p>
                    </div>
                    <div className="p-6 bg-white shadow rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">Industrial</h3>
                        <p className="text-gray-600">Customized infrastructure for large-scale industries.</p>
                    </div>
                    <div className="p-6 bg-white shadow rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">Commercial</h3>
                        <p className="text-gray-600">Smart office spaces and commercial complexes with modern designs.</p>
                    </div>
                </div>
            </section>

            {/* Projects */}
            <section className="py-20 px-6 bg-gray-100">
                <h2 className="text-4xl font-extrabold text-center mb-10">Recent Projects</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <img src="/hero/1.jpg" alt="Project 1" className="w-full h-48 object-cover" />
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-2">50 MW Solar Plant</h3>
                            <p className="text-gray-600">A landmark solar energy project for sustainable power generation.</p>
                        </div>
                    </div>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <img src="/hero/2.jpg" alt="Project 2" className="w-full h-48 object-cover" />
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-2">Commercial Tower</h3>
                            <p className="text-gray-600">Designed and constructed a modern high-rise business center.</p>
                        </div>
                    </div>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <img src="/hero/3.jpg" alt="Project 3" className="w-full h-48 object-cover" />
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-2">Maintenance Solutions</h3>
                            <p className="text-gray-600">Comprehensive maintenance for key industrial projects worldwide.</p>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 px-6 bg-gray-50">
                <h2 className="text-4xl font-extrabold text-center mb-10">Why Choose Us?</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
                    <div>
                        <CheckCircle className="text-yellow-500 w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
                        <p className="text-gray-600">Top-notch quality in every project we deliver.</p>
                    </div>
                    <div>
                        <Users className="text-yellow-500 w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
                        <p className="text-gray-600">Skilled professionals for hassle-free execution.</p>
                    </div>
                    <div>
                        <Briefcase className="text-yellow-500 w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Timely Delivery</h3>
                        <p className="text-gray-600">We respect deadlines and deliver on time.</p>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-yellow-500 text-center text-white">
                <h2 className="text-4xl font-bold mb-4">Let’s Build Your Next Project</h2>
                <p className="mb-6 text-lg max-w-2xl mx-auto">
                    Partner with AKROS for innovative EPC solutions that deliver quality and value.
                </p>
                <a
                    href="/contact"
                    className="bg-white text-yellow-500 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition"
                >
                    Get a Free Consultation
                </a>
            </section>

        </div>
    );
};

export default Home;
