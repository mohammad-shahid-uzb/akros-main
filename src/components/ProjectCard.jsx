const ProjectCard = ({ image, title, location }) => {
    return (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition">
            <img src={image} alt={title} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-gray-500">{location}</p>
            </div>
        </div>
    );
};

export default ProjectCard;
