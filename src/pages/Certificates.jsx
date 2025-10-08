import { useState } from "react";

const Certificates = () => {
    const certificates = [
        { image: "/images/cert1.jpg", title: "ISO 9001:2015" },
        { image: "/images/cert2.jpg", title: "Safety Compliance" },
        { image: "/images/cert3.jpg", title: "Quality Management" },
    ];

    const [selected, setSelected] = useState(null);

    return (
        <section className="p-10 max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-10">Our Certificates</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {certificates.map((cert, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl cursor-pointer"
                        onClick={() => setSelected(cert.image)}
                    >
                        <img src={cert.image} alt={cert.title} className="w-full h-48 object-cover" />
                        <div className="p-4 text-center">
                            <h3 className="text-lg font-semibold">{cert.title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {selected && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    onClick={() => setSelected(null)}
                >
                    <img src={selected} alt="Certificate" className="max-w-[90%] max-h-[90%] rounded-lg" />
                </div>
            )}
        </section>
    );
};

export default Certificates;
