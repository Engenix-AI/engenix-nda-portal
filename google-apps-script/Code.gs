const CONFIG = {
  LEADS_SHEET_NAME: 'Demo Leads',
  NOTIFICATION_EMAIL: 'demo@engenix.co',
  SENDER_NAME: 'ENGENIX',
  SEND_CONFIRMATION: true,
  MAX_REQUESTS_PER_EMAIL_PER_DAY: 5
};

const HEADERS = [
  'Timestamp','Lead Score','Priority','Status','Name','Dealership / Group',
  'Work Email','Phone','Role','Monthly Volume','Rooftops','DMS','Demo Focus',
  'Source','Page','Browser','Follow-up Owner','Next Action','Notes'
];

function setupEngenix() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Open Apps Script from a Google Sheet.');

  PropertiesService.getScriptProperties()
    .setProperty('ENGENIX_SPREADSHEET_ID', spreadsheet.getId());

  let sheet = spreadsheet.getSheetByName(CONFIG.LEADS_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.LEADS_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');

    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList([
        'New','Contacted','Qualified','Demo Scheduled',
        'Pilot','Proposal','Won','Lost'
      ], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange('D2:D').setDataValidation(rule);
  }
}

function doGet() {
  return HtmlService.createHtmlOutput('<h1>ENGENIX Intake</h1><p>Endpoint online.</p>');
}

function doPost(e) {
  try {
    const data = e && e.parameter ? e.parameter : {};
    if (clean_(data.website, 200)) return response_({ ok: true });

    const lead = {
      name: clean_(data.name, 120),
      company: clean_(data.company, 160),
      email: clean_(data.email, 180).toLowerCase(),
      phone: clean_(data.phone, 40),
      role: clean_(data.role, 100),
      monthlyVolume: clean_(data.monthlyVolume, 80),
      rooftops: clean_(data.rooftops, 80),
      dms: clean_(data.dms, 100),
      challenge: clean_(data.challenge, 1800),
      source: clean_(data.source, 120),
      page: clean_(data.page, 500),
      userAgent: clean_(data.userAgent, 500)
    };

    validate_(lead);
    rateLimit_(lead.email);

    const score = score_(lead);
    const priority = score >= 75 ? 'Hot' : score >= 50 ? 'Qualified' : 'Nurture';

    appendLead_(lead, score, priority);
    notify_(lead, score, priority);
    if (CONFIG.SEND_CONFIRMATION) confirm_(lead);

    return response_({ ok: true });
  } catch (error) {
    console.error(error);
    return response_({ ok: false, error: error.message || 'Unexpected submission error.' });
  }
}

function validate_(lead) {
  if (!lead.name || !lead.company || !lead.email || !lead.role || !lead.challenge) {
    throw new Error('Please complete all required fields.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) {
    throw new Error('Please enter a valid work email.');
  }
}

function sheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('ENGENIX_SPREADSHEET_ID');
  if (!id) throw new Error('Run setupEngenix() first.');
  return SpreadsheetApp.openById(id).getSheetByName(CONFIG.LEADS_SHEET_NAME);
}

function appendLead_(lead, score, priority) {
  const sheet = sheet_();
  sheet.appendRow([
    new Date(), score, priority, 'New', lead.name, lead.company, lead.email,
    lead.phone, lead.role, lead.monthlyVolume, lead.rooftops, lead.dms,
    lead.challenge, lead.source, lead.page, lead.userAgent, '', '', ''
  ]);

  const cell = sheet.getRange(sheet.getLastRow(), 3);
  if (priority === 'Hot') cell.setBackground('#dc2626').setFontColor('#ffffff');
  else if (priority === 'Qualified') cell.setBackground('#f59e0b').setFontColor('#111827');
  else cell.setBackground('#2563eb').setFontColor('#ffffff');
}

function score_(lead) {
  let score = 15;
  const role = lead.role.toLowerCase();

  if (role.includes('owner') || role.includes('dealer principal')) score += 25;
  else if (role.includes('general manager')) score += 22;
  else if (role.includes('finance director') || role.includes('compliance')) score += 18;
  else if (role.includes('investor')) score += 15;
  else score += 8;

  const volumePoints = {'600+':22,'300–599':18,'150–299':14,'75–149':9,'Under 75':4};
  const rooftopPoints = {'25+':22,'10–24':18,'5–9':14,'2–4':9,'1':4};

  score += volumePoints[lead.monthlyVolume] || 0;
  score += rooftopPoints[lead.rooftops] || 0;
  if (lead.dms) score += 4;
  if (lead.phone) score += 4;
  if (lead.challenge.length >= 180) score += 8;

  return Math.min(100, score);
}

function notify_(lead, score, priority) {
  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: `[${priority.toUpperCase()} ${score}/100] Private demo: ${lead.company} — ${lead.name}`,
    body: [
      'New ENGENIX private demo request','',
      `Lead Score: ${score}/100`,
      `Priority: ${priority}`,
      `Name: ${lead.name}`,
      `Dealership / Group: ${lead.company}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone || 'Not provided'}`,
      `Role: ${lead.role}`,
      `Monthly Volume: ${lead.monthlyVolume || 'Not provided'}`,
      `Rooftops: ${lead.rooftops || 'Not provided'}`,
      `DMS: ${lead.dms || 'Not provided'}`,
      `Demo Focus: ${lead.challenge}`,
      `Source: ${lead.source || 'Website'}`,
      `Page: ${lead.page || 'Unknown'}`
    ].join('\n'),
    name: CONFIG.SENDER_NAME,
    replyTo: lead.email
  });
}

function confirm_(lead) {
  MailApp.sendEmail({
    to: lead.email,
    subject: 'ENGENIX private demonstration request received',
    body: [
      `Thank you, ${lead.name}.`,'',
      `We received your private demonstration request for ${lead.company}.`,
      'A member of the ENGENIX team will contact you shortly.','',
      'ENGEN LLC d/b/a ENGENIX'
    ].join('\n'),
    name: CONFIG.SENDER_NAME
  });
}

function rateLimit_(email) {
  const cache = CacheService.getScriptCache();
  const key = `rate:${email}`;
  const count = Number(cache.get(key) || 0);
  if (count >= CONFIG.MAX_REQUESTS_PER_EMAIL_PER_DAY) {
    throw new Error('Too many requests were submitted. Please try again later.');
  }
  cache.put(key, String(count + 1), 21600);
}

function response_(payload) {
  const safe = JSON.stringify(payload).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput(`
    <!doctype html><html><body><script>
      window.top.postMessage(
        Object.assign({ source: 'engenix-google-form' }, ${safe}),
        '*'
      );
    </script></body></html>
  `);
}

function clean_(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
}
