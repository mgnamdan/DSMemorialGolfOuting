const FUNDRAISER_EMAIL = "REPLACE_WITH_FUNDRAISER_EMAIL@example.com";

const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const copyInterestLinkButton = document.querySelector("#copyInterestLink");
const copyStatus = document.querySelector("#copyStatus");
const interestFormLink = document.querySelector("#interestFormLink");
const sponsorContactButton = document.querySelector("#sponsorContactButton");
const interestSelect = contactForm.querySelector("select[name='interest']");
const messageField = contactForm.querySelector("textarea[name='message']");
const paymentOptionSelect = document.querySelector("#paymentOption");
const paymentPanels = document.querySelectorAll("[data-payment-panel]");

function openFormWindow(event) {
  event.preventDefault();
  const link = event.currentTarget;
  const url = link.href;

  window.open(url, "_blank", "noopener,noreferrer,width=960,height=760");
}

document.querySelectorAll(".js-open-window").forEach((link) => {
  link.addEventListener("click", openFormWindow);
});

paymentOptionSelect.addEventListener("change", () => {
  paymentPanels.forEach((panel) => {
    const isSelected = panel.dataset.paymentPanel === paymentOptionSelect.value;
    panel.hidden = !isSelected;
    panel.classList.toggle("is-active", isSelected);
  });
});

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

copyInterestLinkButton.addEventListener("click", async () => {
  const link = interestFormLink.href || interestFormLink.textContent.trim();

  try {
    await copyText(link);
    copyStatus.textContent = "Registration form link copied.";
  } catch (error) {
    copyStatus.textContent = "Copy failed. You can select and copy the link above.";
  }
});

sponsorContactButton.addEventListener("click", () => {
  interestSelect.value = "Sponsorship";
  document.querySelector("#contact").scrollIntoView({ behavior: "smooth", block: "start" });
  formStatus.textContent = "Sponsorship selected. Add a note and send it to the fundraiser team.";

  window.setTimeout(() => {
    messageField.focus({ preventScroll: true });
  }, 450);
});

function buildMailtoUrl(formData) {
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const interest = formData.get("interest");
  const message = formData.get("message").trim();
  const isSponsorship = interest === "Sponsorship";

  const subject = `${isSponsorship ? "URGENT: " : ""}Don Skidmore Memorial Golf Outing inquiry - ${interest}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Interest: ${interest}`,
    "",
    message
  ].join("\n");
  const params = new URLSearchParams({
    subject,
    body
  });

  if (isSponsorship) {
    params.set("importance", "high");
    params.set("x-priority", "1");
    params.set("priority", "urgent");
  }

  return `mailto:${FUNDRAISER_EMAIL}?${params.toString()}`;
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
