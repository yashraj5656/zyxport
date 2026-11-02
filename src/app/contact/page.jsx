import ContactForm from "./ContactForm";
import "./contact.css";

export const metadata = {
  title: "Contact Us — Zyxport Esports",
  description:
    "Get in touch with the Zyxport team for support, partnerships, or tournament queries.",
};

const contactMethods = [
  {
    icon: "📧",
    title: "Email",
    value: "support@zyxport.com",
    href: "mailto:zqentra@gmail.com",
    description: "General queries, refunds, and account issues.",
  },
  {
    icon: "💬",
    title: "Discord",
    value: "discord.gg/zyxport",
    href: "https://instagram.com/zyxport",
    description: "Fastest response — join our community server.",
  },
  {
    icon: "📱",
    title: "Instagram",
    value: "@zyxport",
    href: "https://instagram.com/zyxport",
    description: "Tournament announcements and updates.",
  },
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <div className="contact-container">
        {/* HEADER */}
        <header className="contact-header">
          <span className="eyebrow">WE'RE HERE TO HELP</span>
          <h1>
            GET IN <span>TOUCH</span>
          </h1>
          <p>
            Questions about a tournament? Payment issue? Partnership enquiry?
            We read every message and reply within 24 hours.
          </p>
        </header>

        <div className="contact-grid">
          {/* LEFT — CONTACT FORM */}
          <section className="contact-form-card">
            <h2>Send a Message</h2>
            <ContactForm />
          </section>

          {/* RIGHT — CONTACT METHODS */}
          <aside className="contact-methods">
            <h2>Other Ways to Reach Us</h2>

            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                className="contact-method-card"
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  method.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                <span className="contact-method-icon">{method.icon}</span>
                <div>
                  <strong>{method.title}</strong>
                  <span className="contact-method-value">{method.value}</span>
                  <small>{method.description}</small>
                </div>
              </a>
            ))}

            <div className="contact-response-note">
              <strong>⏱ Average Response Time</strong>
              <p>
                Discord: <strong>~2 hours</strong>
                <br />
                Email: <strong>within 24 hours</strong>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}