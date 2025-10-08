import ServiceCard from "../components/ServiceCard";
import { Sun, Building2, Wrench } from "lucide-react";

const Services = () => {
    return (
        <section className="p-10 max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-10">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <ServiceCard title="Solar EPC Solutions" description="Turnkey solar projects including design, engineering, procurement, and construction." icon={<Sun />} />
                <ServiceCard title="Building Construction" description="Residential, commercial, and industrial projects built to last." icon={<Building2 />} />
                <ServiceCard title="O&M Services" description="Maintain peak performance of your projects with our expert team." icon={<Wrench />} />
            </div>
        </section>
    );
};

export default Services;
