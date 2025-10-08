const ServiceCard = ({ title, description, icon }) => {
    return (
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
            <div className="text-4xl text-yellow-400 mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

export default ServiceCard;
