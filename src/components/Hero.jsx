import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const images = [
    "/hero/6.webp",
    "/hero/5.webp",
    "/hero/2.jpg",
    "/hero/4.jpg"
];

const Hero = () => {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
            {/* Sliding Container */}
            <motion.div
                className="absolute top-0 left-0 flex h-full"
                style={{ width: `${images.length * 100}%` }}
                animate={{ x: `-${currentImage * (100 / images.length)}%` }}
                transition={{ duration: 1 }}
            >
                {images.map((img, index) => (
                    <div
                        key={index}
                        className="w-screen h-full"
                        style={{
                            backgroundImage: `url(${img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}
                    />
                ))}
            </motion.div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Text Content */}
            <motion.div
                className="relative z-10 text-white px-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <h1 className="text-5xl font-bold mb-4">Your Trusted EPC Partner</h1>
                <p className="text-xl mb-6">Solar Solutions & Building Construction Experts</p>
                <a
                    href="/contact"
                    className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500"
                >
                    Get a Quote
                </a>
            </motion.div>
        </section>
    );
};

export default Hero;
