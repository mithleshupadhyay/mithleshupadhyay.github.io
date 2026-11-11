const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Contact form: sends through FormSubmit (formsubmit.co) to the address in the
// form's action, so the static site needs no server. Without JavaScript the form
// still posts normally and FormSubmit redirects back to ?sent=1#contact.
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("cf-status");

function showContactStatus(kind, text) {
  contactStatus.className = `form-status ${kind}`;
  contactStatus.textContent = text;
}

if (contactForm && contactStatus) {
  const sentText = "Thanks, your message was sent. I will reply by email soon.";
  const failText =
    "Your message could not be sent. Please email me at mithleshupadhyay515@gmail.com.";
  const pendingText =
    "This form is still being set up. Please email me at mithleshupadhyay515@gmail.com for now.";

  if (new URLSearchParams(window.location.search).get("sent") === "1") {
    showContactStatus("ok", sentText);
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = contactForm.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(contactForm));

    if (data._honey) {
      showContactStatus("ok", sentText); // a bot filled the hidden field
      return;
    }

    data._subject = `Portfolio: ${data.topic} from ${data.name}`;
    data._replyto = data.email;
    delete data._next;

    button.disabled = true;
    showContactStatus("", "Sending...");

    try {
      const endpoint = contactForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || String(result.success) !== "true") {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      contactForm.reset();
      showContactStatus("ok", sentText);
    } catch (error) {
      console.error("Contact form:", error);
      // FormSubmit refuses messages until the owner clicks the link in its activation email.
      showContactStatus("error", /activat/i.test(error.message) ? pendingText : failText);
    } finally {
      button.disabled = false;
    }
  });
}
