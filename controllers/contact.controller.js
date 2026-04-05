const Contact = require('../models/Contact');
const transporter = require('../config/mailer');

exports.send = async (req, res) => {
  const { firstName, lastName, phone, email, message } = req.body;
  if (!firstName || !lastName || !phone || !message) {
    return res.status(400).json({ message: 'Prénom, nom, téléphone et message sont obligatoires' });
  }

  const contact = await Contact.create({ firstName, lastName, phone, email, message });

  // Email notification (non-blocking)
  if (process.env.ADMIN_EMAIL) {
    transporter.sendMail({
      from: `"Miral Brand" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📩 Nouveau message de contact — ${firstName} ${lastName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px;text-align:center">
            <h2 style="color:white;margin:0">📩 Nouveau Message de Contact</h2>
          </div>
          <div style="padding:24px;background:white">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Prénom</td><td style="font-weight:600">${firstName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Nom</td><td style="font-weight:600">${lastName}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Téléphone</td><td><a href="tel:${phone}" style="color:#6366f1;font-weight:600">${phone}</a></td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Email</td><td>${email || '—'}</td></tr>
            </table>
            <div style="margin-top:16px;padding:16px;background:#f5f3ff;border-radius:8px">
              <p style="color:#6b7280;font-size:12px;margin:0 0 8px">Message :</p>
              <p style="margin:0;line-height:1.6">${message}</p>
            </div>
          </div>
        </div>`
    }).catch(() => {});
  }

  res.status(201).json({ message: 'Message envoyé avec succès', id: contact._id });
};

exports.getAll = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
};
