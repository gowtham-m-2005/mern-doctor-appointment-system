const getAppointmentConfirmedTemplate = (userName, doctorName, date, time) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f9f9ff;
      margin: 0;
      padding: 20px;
      color: #191c22;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #0052ae 0%, #006adc 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      font-family: 'Manrope', sans-serif;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #191c22;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #414753;
      margin-bottom: 30px;
    }
    .appointment-card {
      background-color: #f2f3fd;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
      border-left: 4px solid #0052ae;
    }
    .appointment-card h3 {
      color: #0052ae;
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .appointment-detail {
      display: flex;
      margin-bottom: 12px;
      align-items: center;
    }
    .appointment-detail-label {
      font-weight: 600;
      color: #191c22;
      min-width: 80px;
      font-size: 14px;
    }
    .appointment-detail-value {
      color: #414753;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background: #ffffff;
      color: #0052ae;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      border: 2px solid #0052ae;
    }
    .footer {
      background-color: #e1e2ec;
      padding: 25px 30px;
      text-align: center;
      font-size: 13px;
      color: #414753;
    }
    .footer a {
      color: #0052ae;
      text-decoration: none;
    }
    .icon {
      font-size: 24px;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Appointment Confirmed</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${userName},</p>
      <p class="message">Great news! Your appointment has been confirmed by the doctor. Here are the details:</p>
      
      <div class="appointment-card">
        <h3>📅 Appointment Details</h3>
        <div class="appointment-detail">
          <span class="appointment-detail-label">Doctor:</span>
          <span class="appointment-detail-value">Dr. ${doctorName}</span>
        </div>
        <div class="appointment-detail">
          <span class="appointment-detail-label">Date:</span>
          <span class="appointment-detail-value">${date}</span>
        </div>
        <div class="appointment-detail">
          <span class="appointment-detail-label">Time:</span>
          <span class="appointment-detail-value">${time}</span>
        </div>
      </div>
      
      <p class="message">Please arrive 10 minutes before your scheduled time. If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
      
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-appointments" class="cta-button">View My Appointments</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from DocApp. Please do not reply to this email.</p>
      <p>© ${new Date().getFullYear()} DocApp. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const getAppointmentCompletedTemplate = (userName, doctorName, date, time, prescription) => {
  const medicinesList = prescription.medicines && prescription.medicines.length > 0
    ? prescription.medicines.map(med => `
        <li style="margin-bottom: 12px; padding: 12px; background-color: #f9f9ff; border-radius: 8px;">
          <div style="font-weight: 600; color: #0052ae; margin-bottom: 4px;">${med.name}</div>
          <div style="font-size: 13px; color: #414753;">
            <strong>Dosage:</strong> ${med.dosage || 'N/A'}<br>
            <strong>Duration:</strong> ${med.duration || 'N/A'}
          </div>
        </li>
      `).join('')
    : '<li style="color: #414753;">No medicines prescribed</li>';

  const notesHtml = prescription.notes
    ? `<div style="margin-top: 15px; padding: 15px; background-color: #fff9e6; border-radius: 8px; border-left: 3px solid #ffc107;">
        <div style="font-weight: 600; color: #856404; margin-bottom: 8px;">📝 Doctor's Notes:</div>
        <div style="font-size: 14px; color: #856404; line-height: 1.5;">${prescription.notes}</div>
       </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Completed</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f9f9ff;
      margin: 0;
      padding: 20px;
      color: #191c22;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #0052ae 0%, #006adc 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      font-family: 'Manrope', sans-serif;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #191c22;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #414753;
      margin-bottom: 30px;
    }
    .appointment-card {
      background-color: #f2f3fd;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
      border-left: 4px solid #0052ae;
    }
    .appointment-card h3 {
      color: #0052ae;
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .appointment-detail {
      display: flex;
      margin-bottom: 12px;
      align-items: center;
    }
    .appointment-detail-label {
      font-weight: 600;
      color: #191c22;
      min-width: 80px;
      font-size: 14px;
    }
    .appointment-detail-value {
      color: #414753;
      font-size: 14px;
    }
    .prescription-card {
      background-color: #ffffff;
      border: 2px solid #0052ae;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
    }
    .prescription-card h3 {
      color: #0052ae;
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }
    .medicines-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      background: #ffffff;
      color: #0052ae;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      border: 2px solid #0052ae;
    }
    .footer {
      background-color: #e1e2ec;
      padding: 25px 30px;
      text-align: center;
      font-size: 13px;
      color: #414753;
    }
    .footer a {
      color: #0052ae;
      text-decoration: none;
    }
    .icon {
      font-size: 24px;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Appointment Completed</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${userName},</p>
      <p class="message">Thank you for visiting Dr. ${doctorName}. Your appointment has been completed successfully. Here's your prescription:</p>
      
      <div class="appointment-card">
        <h3>📅 Appointment Details</h3>
        <div class="appointment-detail">
          <span class="appointment-detail-label">Doctor:</span>
          <span class="appointment-detail-value">Dr. ${doctorName}</span>
        </div>
        <div class="appointment-detail">
          <span class="appointment-detail-label">Date:</span>
          <span class="appointment-detail-value">${date}</span>
        </div>
        <div class="appointment-detail">
          <span class="appointment-detail-label">Time:</span>
          <span class="appointment-detail-value">${time}</span>
        </div>
      </div>
      
      <div class="prescription-card">
        <h3>💊 Prescription</h3>
        <ul class="medicines-list">
          ${medicinesList}
        </ul>
        ${notesHtml}
      </div>
      
      <p class="message">Please follow the prescribed dosage and duration. If you have any questions or concerns, feel free to reach out to your doctor.</p>
      
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/prescriptions" class="cta-button">View/Download Prescription</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from DocApp. Please do not reply to this email.</p>
      <p>© ${new Date().getFullYear()} DocApp. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  getAppointmentConfirmedTemplate,
  getAppointmentCompletedTemplate,
};
