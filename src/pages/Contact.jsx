const Contact = () => {
    return (
        <section className="p-10 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-6">Contact Us</h2>
            <form className="bg-white p-6 rounded-lg shadow-lg space-y-4">
                <input type="text" placeholder="Your Name" className="w-full p-3 border rounded-lg" />
                <input type="email" placeholder="Your Email" className="w-full p-3 border rounded-lg" />
                <input type="tel" placeholder="Your Phone" className="w-full p-3 border rounded-lg" />
                <textarea placeholder="Your Message" className="w-full p-3 border rounded-lg" rows="4"></textarea>
                <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500">
                    Send Message
                </button>
            </form>
        </section>
    );
};

export default Contact;
