const FUNDRAISER_EMAIL = "REPLACE_WITH_FUNDRAISER_EMAIL@example.com";

const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");

function buildMailtoUrl(formData) {
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const interest = formData.get("interest");
  const message = formData.get("message").trim();

  const subject = `Don Skidmore Memorial Golf Outing inquiry - ${interest}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Interest: ${interest}`,
    "",
    message
  ].join("\n");

  return `mailto:${FUNDRAISER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const emailIsConfigured = !FUNDRAISER_EMAIL.includes("REPLACE_WITH");

  if (!emailIsConfigured) {
    formStatus.textContent = "The contact form is ready. Add the fundraiser email address in script.js before publishing.";
    return;
  }

  window.location.href = buildMailtoUrl(formData);
  formStatus.textContent = "Opening your email app with the message prepared.";
  contactForm.reset();
});
