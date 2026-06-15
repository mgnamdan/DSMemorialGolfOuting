const FUNDRAISER_EMAIL = "teamkeepfightingthefight@gmail.com";
const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbywtzDKeOE_pua5cLUrfOX8qOvuRfV4OKbHs-MkNInyq9NzmxVKvtvGQJONrzBAvDAxjg/exec";

const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const copyInterestLinkButton = document.querySelector("#copyInterestLink");
const copyStatus = document.querySelector("#copyStatus");
const interestFormLink = document.querySelector("#interestFormLink");
const sponsorContactButton = document.querySelector("#sponsorContactButton");
const interestSelect = contactForm.querySelector("select[name='interest']");
const messageField = contactForm.querySelector("textarea[name='message']");
const formStartedAtField = document.querySelector("#formStartedAt");
const paymentOptionSelect = document.querySelector("#paymentOption");
const paymentPanels = document.querySelectorAll("[data-payment-panel]");

formStartedAtField.value = String(Date.now());

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

function getContactPayload(formData) {
  return {
    name: formData.get("name").trim(),
    email: formData.get("email").trim(),
    interest: formData.get("interest"),
    message: formData.get("message").trim(),
    website: formData.get("website").trim(),
    formStartedAt: formData.get("formStartedAt"),
    pageUrl: window.location.href,
    submittedAt: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
}

function buildMailtoUrl(payload) {
  const { name, email, interest, message } = payload;

  const subject = `URGENT: Don Skidmore Memorial Golf Outing inquiry - ${interest}`;
  const body = [
    "A visitor submitted the website contact form.",
    "",
    `Name: ${name}`,
    `Contact email entered by visitor: ${email}`,
    `Interest: ${interest}`,
    "",
    "Message:",
    message,
    "",
    `Submitted at: ${payload.submittedAt}`,
    `Page: ${payload.pageUrl}`
  ].join("\n");
  const params = new URLSearchParams({
    subject,
    body
  });

  params.set("importance", "high");
  params.set("x-priority", "1");
  params.set("priority", "urgent");

  return `mailto:${FUNDRAISER_EMAIL}?${params.toString()}`;
}

async function sendContactPayload(payload) {
  const endpointIsConfigured = !APPS_SCRIPT_WEB_APP_URL.includes("REPLACE_WITH");

  if (!endpointIsConfigured) {
    return false;
  }

  await fetch(APPS_SCRIPT_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  return true;
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const payload = getContactPayload(formData);
  const submitButton = contactForm.querySelector("button[type='submit']");

  submitButton.disabled = true;
  formStatus.textContent = "Sending your message...";

  try {
    const sentThroughAppsScript = await sendContactPayload(payload);

    if (sentThroughAppsScript) {
      formStatus.textContent = "Message sent to the fundraiser team.";
      contactForm.reset();
      return;
    }

    window.location.href = buildMailtoUrl(payload);
    formStatus.textContent = "Opening your email app with the message prepared. Add the Apps Script URL in script.js to send automatically.";
    contactForm.reset();
  } catch (error) {
    window.location.href = buildMailtoUrl(payload);
    formStatus.textContent = "Automatic sending was unavailable, so your email app is opening with the message prepared.";
  } finally {
    submitButton.disabled = false;
  }
});
