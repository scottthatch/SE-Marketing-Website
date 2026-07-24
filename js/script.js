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

const year = document.querySelector("#copyright-year");
if (year) year.textContent = new Date().getFullYear();

const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");

if (form && status) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.dataset.state = "";

        if (!form.reportValidity()) {
            status.textContent = "Please complete the required fields and use a valid email address.";
            status.dataset.state = "error";
            return;
        }

        const button = form.querySelector("button[type='submit']");
        button.disabled = true;
        status.textContent = "Sending your inquiry…";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.success !== true) {
                throw new Error(result.error || "Your inquiry could not be sent.");
            }

            form.reset();
            status.textContent = "Thanks—your inquiry was sent. We’ll be in touch soon.";
            status.dataset.state = "success";
        } catch (error) {
            status.textContent = `${error.message || "Your inquiry could not be sent."} Please try again or email hello@truepartnertech.com.`;
            status.dataset.state = "error";
        } finally {
            button.disabled = false;
        }
    });
}
