const animatedElements = document.querySelectorAll(".animate-on-scroll");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.18 }
    );

    animatedElements.forEach((element) => observer.observe(element));
} else {
    animatedElements.forEach((element) => element.classList.add("visible"));
}
