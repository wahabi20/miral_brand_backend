const transporter = require('../config/mailer');

async function sendOrderNotification(order) {
  const imagesHtml = (order.productImages || [])
    .map(url => `<img src="${url}" width="120" style="border-radius:8px;margin:4px;object-fit:cover;height:120px"/>`)
    .join('');

  const statusColors = {
    pending: '#f59e0b',
    confirmed: '#10b981',
    shipped: '#6366f1',
    cancelled: '#ef4444'
  };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(99,102,241,0.15)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:32px 24px;text-align:center">
      <h1 style="color:white;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px">🛍️ Miral Brand</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:16px">Nouvelle Commande Reçue</p>
    </div>

    <!-- Body -->
    <div style="background:white;padding:32px 24px">

      <!-- Product Section -->
      <div style="background:#f5f3ff;border-radius:12px;padding:20px;margin-bottom:24px">
        <h2 style="color:#6366f1;margin:0 0 16px;font-size:18px;font-weight:600">📦 Produit Commandé</h2>
        ${imagesHtml ? `<div style="margin-bottom:16px">${imagesHtml}</div>` : ''}
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Produit</td><td style="padding:6px 0;font-weight:600;color:#1e1b4b;font-size:15px">${order.productTitle}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Catégorie</td><td style="padding:6px 0;color:#374151">${order.productCategory || '-'}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Prix unitaire</td><td style="padding:6px 0;color:#374151">${order.productPrice?.toLocaleString('fr-TN')} TND</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Quantité</td><td style="padding:6px 0;font-weight:700;color:#6366f1;font-size:16px">${order.quantity}</td></tr>
          <tr style="border-top:2px solid #6366f1">
            <td style="padding:12px 0 6px;color:#1e1b4b;font-weight:700;font-size:16px">TOTAL</td>
            <td style="padding:12px 0 6px;font-weight:800;color:#6366f1;font-size:20px">${order.totalPrice?.toLocaleString('fr-TN')} TND</td>
          </tr>
        </table>
      </div>

      <!-- Customer Section -->
      <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:24px">
        <h2 style="color:#059669;margin:0 0 16px;font-size:18px;font-weight:600">👤 Informations Client</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Nom complet</td><td style="padding:6px 0;font-weight:600;color:#1e1b4b">${order.lastName} ${order.firstName}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Téléphone</td><td style="padding:6px 0;color:#374151"><a href="tel:${order.phone}" style="color:#6366f1;text-decoration:none;font-weight:600">${order.phone}</a></td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;vertical-align:top">Adresse</td><td style="padding:6px 0;color:#374151">${order.address}</td></tr>
        </table>
      </div>

      <!-- Footer note -->
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin:0">
        Commande reçue le ${new Date(order.createdAt).toLocaleString('fr-TN', { dateStyle: 'long', timeStyle: 'short' })}
        <br>© 2024 Miral Brand
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Miral Brand Store" <${process.env.MAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🛍️ [Miral Brand] Nouvelle commande — ${order.productTitle}`,
    html
  });
}

module.exports = { sendOrderNotification };
