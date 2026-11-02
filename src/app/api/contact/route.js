import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return Response.json(
        { error: "Message is too long" },
        { status: 400 }
      );
    }

    await dbConnect();

    await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject,
      message: message.trim(),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return Response.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}