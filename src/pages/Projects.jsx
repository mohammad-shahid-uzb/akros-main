import ProjectCard from "../components/ProjectCard";

const Projects = () => {
    const projectList = [
        { image: "/images/solar1.jpg", title: "50MW Solar Plant", location: "Uzbekistan" },
        { image: "/images/building1.jpg", title: "Commercial Complex", location: "Tashkent" },
        { image: "/images/solar2.jpg", title: "10MW Rooftop Solar", location: "Samarkand" },
    ];

    return (
        <section className="p-10 max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-10">Our Projects</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {projectList.map((project, index) => (
                    <ProjectCard key={index} {...project} />
                ))}
            </div>
        </section>
    );
};

export default Projects;
