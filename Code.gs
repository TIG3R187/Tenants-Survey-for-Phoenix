var TENANT_SURVEY_SPREADSHEET_ID_PROPERTY = 'TENANT_SURVEY_SPREADSHEET_ID';
var TENANT_SURVEY_WEB_RESPONSE_SHEET_NAME = 'Responses';
var TENANT_SURVEY_WEB_RESPONSE_FIELDS = [
  { key: 'companyTenantName', label: 'Company / Tenant Name' },
  { key: 'floorSuite', label: 'Floor / Suite' },
  { key: 'surveyMonthYear', label: 'Survey Month / Year' },
  { key: 'q1', label: 'Q1. Overall experience this month' },
  { key: 'q2', label: 'Q2. Likelihood to recommend' },
  { key: 'q3', label: 'Q3. Lease intention over next 12 months' },
  { key: 'q4', label: 'Q4. Security personnel professionalism and conduct' },
  { key: 'q5', label: 'Q5. Access control systems' },
  { key: 'q6', label: 'Q6. Experienced or witnessed security incident' },
  { key: 'q7', label: 'Q7. Comments on security' },
  { key: 'q8', label: 'Q8. Mains power reliability' },
  { key: 'q9', label: 'Q9. Backup generator / UPS performance' },
  { key: 'q10', label: 'Q10. Unplanned power interruptions' },
  { key: 'q11', label: 'Q11. Lift availability and reliability' },
  { key: 'q12', label: 'Q12. Comments on power or MEP' },
  { key: 'q13', label: 'Q13. Temperature control' },
  { key: 'q14', label: 'Q14. Fresh air ventilation and circulation' },
  { key: 'q15', label: 'Q15. Air quality / comfort issues noticed' },
  { key: 'q16', label: 'Q16. Comments on air quality or thermal comfort' },
  { key: 'q17', label: 'Q17. Common area cleanliness' },
  { key: 'q18', label: 'Q18. Washroom cleanliness and restocking' },
  { key: 'q19', label: 'Q19. Cleaning in leased space' },
  { key: 'q20', label: 'Q20. Cleaning staff courteous and unobtrusive' },
  { key: 'q21', label: 'Q21. Comments on cleaning' },
  { key: 'q22', label: 'Q22. Fire safety and evacuation confidence' },
  { key: 'q23', label: 'Q23. Emergency exits / extinguishers / signage visible' },
  { key: 'q24', label: 'Q24. Waste segregation and disposal' },
  { key: 'q25', label: 'Q25. Observed unresolved HSE hazard' },
  { key: 'q26', label: 'Q26. Comments on HSE' },
  { key: 'q27', label: 'Q27. Logged maintenance or facilities request' },
  { key: 'q28', label: 'Q28. Request acknowledgement speed' },
  { key: 'q29', label: 'Q29. Request resolution satisfaction' },
  { key: 'q30', label: 'Q30. Building management communication' },
  { key: 'q31', label: 'Q31. Parking availability and management' },
  { key: 'q32', label: 'Q32. Internet / telecoms infrastructure' },
  { key: 'q33', label: 'Q33. Reception / concierge service' },
  { key: 'q34', label: 'Q34. Service area needing most improvement' },
  { key: 'q35', label: 'Q35. Single most important improvement' },
  { key: 'q36', label: 'Q36. Other comments or commendations' }
];

/**
 * Creates the Google Sheet used by the custom HTML survey page.
 *
 * Run this once before publishing the HTML survey. Then deploy this Apps Script
 * project as a Web App and paste the deployed Web App URL into index.html.
 */
function setupTenantSurveyWebResponses() {
  var spreadsheet = SpreadsheetApp.create('Monthly Tenant Satisfaction Survey Website Responses');
  PropertiesService.getScriptProperties().setProperty(
    TENANT_SURVEY_SPREADSHEET_ID_PROPERTY,
    spreadsheet.getId()
  );

  var sheet = spreadsheet.getSheets()[0].setName(TENANT_SURVEY_WEB_RESPONSE_SHEET_NAME);
  ensureTenantSurveyWebResponseHeader_(sheet);

  Logger.log('Website response spreadsheet URL: ' + spreadsheet.getUrl());
  Logger.log('Deploy this script as a Web App and paste the Web App URL into index.html.');

  return spreadsheet.getUrl();
}

/**
 * Logs the existing SPS website response spreadsheet URL.
 * Use this if the setup function already ran but the log output was missed.
 */
function logTenantSurveyWebResponsesUrl() {
  var sheet = getTenantSurveyWebResponseSheet_();
  ensureTenantSurveyWebResponseHeader_(sheet);

  var url = sheet.getParent().getUrl();
  Logger.log('SPS response spreadsheet URL: ' + url);

  return url;
}

/**
 * Receives submissions from the branded HTML survey and appends them to Sheets.
 */
function doPost(e) {
  var sheet = getTenantSurveyWebResponseSheet_();
  ensureTenantSurveyWebResponseHeader_(sheet);

  var row = [new Date()];
  for (var i = 0; i < TENANT_SURVEY_WEB_RESPONSE_FIELDS.length; i++) {
    row.push(getPostedTenantSurveyValue_(e, TENANT_SURVEY_WEB_RESPONSE_FIELDS[i].key));
  }

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput('Tenant Satisfaction Survey response endpoint is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getTenantSurveyWebResponseSheet_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty(TENANT_SURVEY_SPREADSHEET_ID_PROPERTY);
  var spreadsheet;

  if (spreadsheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    } catch (error) {
      spreadsheet = null;
    }
  }

  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create('Monthly Tenant Satisfaction Survey Website Responses');
    properties.setProperty(TENANT_SURVEY_SPREADSHEET_ID_PROPERTY, spreadsheet.getId());
  }

  var sheet = spreadsheet.getSheetByName(TENANT_SURVEY_WEB_RESPONSE_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.getSheets()[0];
    sheet.setName(TENANT_SURVEY_WEB_RESPONSE_SHEET_NAME);
  }

  return sheet;
}

function ensureTenantSurveyWebResponseHeader_(sheet) {
  var headers = ['Timestamp'];
  for (var i = 0; i < TENANT_SURVEY_WEB_RESPONSE_FIELDS.length; i++) {
    headers.push(TENANT_SURVEY_WEB_RESPONSE_FIELDS[i].label);
  }

  var existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var needsHeader = false;
  for (var j = 0; j < headers.length; j++) {
    if (existingHeaders[j] !== headers[j]) {
      needsHeader = true;
      break;
    }
  }

  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function getPostedTenantSurveyValue_(e, key) {
  if (e && e.parameters && e.parameters[key] && e.parameters[key].length > 0) {
    return e.parameters[key].join(', ');
  }

  if (e && e.parameter && e.parameter[key]) {
    return e.parameter[key];
  }

  return '';
}

/**
 * Creates the monthly tenant satisfaction survey as a Google Form and links it
 * to a newly created Google Sheet for raw responses.
 *
 * How to use:
 * 1. Open https://script.google.com and create a new Apps Script project.
 * 2. Paste this file into Code.gs.
 * 3. Run createTenantSatisfactionSurvey().
 * 4. Approve the requested permissions.
 * 5. Check Executions or Logs for the form and spreadsheet URLs.
 */
function createTenantSatisfactionSurvey() {
  var title = 'Monthly Tenant Satisfaction Survey';
  var responseSheet = SpreadsheetApp.create(title + ' Responses');
  var form = FormApp.create(title);

  form
    .setDescription(
      'Grade A Office Building | Lagos, Nigeria\n\n' +
        'CONFIDENTIAL\n' +
        'Approx. 5 minutes to complete\n\n' +
        'Please rate each item on a scale of 1 to 5 ' +
        '(1 = Very Poor/Very Dissatisfied, 5 = Excellent/Very Satisfied). ' +
        'For yes/no questions, select the appropriate answer. Use the comments ' +
        'fields to elaborate on any rating. All feedback is reviewed monthly by ' +
        'building management.'
    )
    .setConfirmationMessage('Thank you for completing this survey.')
    .setCollectEmail(false)
    .setLimitOneResponsePerUser(false)
    .setAcceptingResponses(true)
    .setDestination(FormApp.DestinationType.SPREADSHEET, responseSheet.getId());

  try {
    form.setRequireLogin(false);
  } catch (error) {
    Logger.log('Could not disable sign-in requirement automatically: ' + error);
  }

  addTenantDetails_(form);
  addOverallBuildingExperience_(form);
  addSecurityServices_(form);
  addPowerProvisionAndMep_(form);
  addIndoorAirQuality_(form);
  addCleaningAndJanitorial_(form);
  addHealthSafetyEnvironment_(form);
  addFacilitiesManagement_(form);
  addParkingAmenitiesConnectivity_(form);
  addOpenFeedbackAndPriorities_(form);

  Logger.log('Form edit URL: ' + form.getEditUrl());
  Logger.log('Public form URL: ' + form.getPublishedUrl());
  Logger.log('Response spreadsheet URL: ' + responseSheet.getUrl());

  return {
    formEditUrl: form.getEditUrl(),
    publicFormUrl: form.getPublishedUrl(),
    responseSpreadsheetUrl: responseSheet.getUrl()
  };
}

function addTenantDetails_(form) {
  form.addSectionHeaderItem().setTitle('Tenant Details');

  addText_(form, 'Company / Tenant Name', 'Enter the company or tenant name.', true);
  addText_(form, 'Floor / Suite', 'Enter the floor, suite, or office location.', true);
  addText_(form, 'Survey Month / Year', 'Example: May 2026', true);
}

function addOverallBuildingExperience_(form) {
  addPage_(form, 'A. Overall Building Experience', 'General impressions of the building this month');

  addRating_(
    form,
    'Q1. How satisfied are you with your overall experience in this building this month?',
    '1 = Very dissatisfied / Very poor, 5 = Very satisfied / Excellent.'
  );
  addMultipleChoice_(
    form,
    'Q2. How likely are you to recommend this building to another business?',
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    '0 = Not at all likely, 10 = Extremely likely.',
    true
  );
  addMultipleChoice_(
    form,
    'Q3. Which best describes your lease intention over the next 12 months?',
    ['Definitely renew', 'Likely to renew', 'Undecided', 'Considering relocation', 'Planning to vacate'],
    'Select one.',
    true
  );
}

function addSecurityServices_(form) {
  addPage_(form, 'B. Security Services', 'Access control, guard presence, incident response');

  addRating_(form, 'Q4. How would you rate the professionalism and conduct of security personnel?');
  addRating_(
    form,
    'Q5. How satisfied are you with access control systems (turnstiles, visitor management, parking access)?'
  );
  addYesNo_(form, 'Q6. Did you experience or witness any security incident this month?');
  addParagraph_(form, 'Q7. Comments on security (optional)', '', false);
}

function addPowerProvisionAndMep_(form) {
  addPage_(form, 'C. Power Provision & MEP Systems', 'Electricity reliability, backup power, lifts, HVAC');

  addRating_(form, 'Q8. How satisfied are you with the reliability of mains power supply to your space?');
  addRating_(form, 'Q9. How would you rate the performance of backup generator/UPS systems during outages?');
  addMultipleChoice_(
    form,
    'Q10. Approximately how many unplanned power interruptions affected your operations this month?',
    ['None', '1-2 interruptions', '3-5 interruptions', 'More than 5 interruptions'],
    'Select one.',
    true
  );
  addRating_(form, 'Q11. How satisfied are you with lift availability and reliability?');
  addParagraph_(form, 'Q12. Comments on power or MEP (optional)', '', false);
}

function addIndoorAirQuality_(form) {
  addPage_(form, 'D. Indoor Air Quality & Thermal Comfort', 'HVAC performance, temperature control, ventilation');

  addRating_(form, 'Q13. How satisfied are you with the temperature control in your workspace?');
  addRating_(form, 'Q14. How would you rate fresh air ventilation and air circulation in your floor/office?');
  addCheckbox_(
    form,
    'Q15. Did you notice any of the following this month?',
    [
      'Stuffiness / low airflow',
      'Excessive cold',
      'Unusual odours',
      'Humidity issues',
      'Excessive heat',
      'None of the above'
    ],
    'Select all that apply.',
    true
  );
  addParagraph_(form, 'Q16. Comments on air quality or thermal comfort (optional)', '', false);
}

function addCleaningAndJanitorial_(form) {
  addPage_(form, 'E. Cleaning & Janitorial Services', 'Common areas, washrooms, office cleaning');

  addRating_(form, 'Q17. How would you rate the cleanliness of building common areas (lobby, corridors, lifts)?');
  addRating_(form, 'Q18. How would you rate washroom cleanliness and restocking (soap, tissue, sanitiser)?');
  addRating_(form, 'Q19. How satisfied are you with the frequency and quality of cleaning in your leased space?');
  addYesNo_(form, 'Q20. Were cleaning staff courteous and unobtrusive during working hours?');
  addParagraph_(form, 'Q21. Comments on cleaning (optional)', '', false);
}

function addHealthSafetyEnvironment_(form) {
  addPage_(form, 'F. Health, Safety & Environment (HSE)', 'Fire safety, emergency preparedness, waste management');

  addRating_(
    form,
    "Q22. How confident are you in the building's fire safety and emergency evacuation procedures?",
    '1 = Not at all confident, 5 = Fully confident.'
  );
  addYesNo_(form, 'Q23. Are emergency exits, fire extinguishers, and signage clearly visible and accessible?');
  addRating_(form, 'Q24. How satisfied are you with waste segregation and disposal arrangements?');
  addYesNo_(form, 'Q25. Did you observe any unresolved HSE hazard this month?');
  addParagraph_(
    form,
    'Q26. Comments on HSE (optional)',
    'Describe any hazard, near-miss, or suggestion.',
    false
  );
}

function addFacilitiesManagement_(form) {
  addPage_(form, 'G. Facilities Management & Responsiveness', 'Help desk, maintenance, communication');

  var requestLoggedItem = form
    .addMultipleChoiceItem()
    .setTitle('Q27. Did you log a maintenance or facilities request this month?')
    .setRequired(true);

  var requestFollowUpPage = addPage_(
    form,
    'G. Facilities Request Follow-up',
    'Complete this section only if you logged a maintenance or facilities request this month.'
  );

  addMultipleChoice_(
    form,
    'Q28. How quickly was your request acknowledged?',
    ['Within 1 hour', 'Within 4 hours', 'Same day', 'Next day or more', 'No acknowledgement received'],
    'Select one.',
    true
  );
  addRating_(form, 'Q29. How satisfied were you with the resolution of your request?');

  var managementCommunicationPage = addPage_(
    form,
    'G. Management Communication',
    'Building management notices, planned works, and updates'
  );

  addRating_(
    form,
    'Q30. How would you rate communication from building management (notices, planned works, updates)?'
  );

  requestLoggedItem.setChoices([
    requestLoggedItem.createChoice('Yes', requestFollowUpPage),
    requestLoggedItem.createChoice('No', managementCommunicationPage)
  ]);
}

function addParkingAmenitiesConnectivity_(form) {
  addPage_(form, 'H. Parking, Amenities & Connectivity', 'Parking management, telecoms, concierge services');

  addRating_(form, 'Q31. How satisfied are you with parking availability and management?');
  addRating_(
    form,
    'Q32. How would you rate the quality and reliability of building-provided internet/telecoms infrastructure?'
  );
  addRating_(form, 'Q33. How satisfied are you with the reception/concierge service for guests and visitors?');
}

function addOpenFeedbackAndPriorities_(form) {
  addPage_(form, 'I. Open Feedback & Priorities', 'Your priorities and suggestions');

  addMultipleChoice_(
    form,
    'Q34. Which service area needs the most improvement this month?',
    [
      'Power provision',
      'Security',
      'Cleaning & janitorial',
      'Air quality & thermal comfort',
      'HSE',
      'Facilities management',
      'Parking',
      'Connectivity',
      'Reception / concierge',
      'Overall management communication'
    ],
    'Select one.',
    true
  );
  addParagraph_(
    form,
    'Q35. What is the single most important improvement building management could make to enhance your experience?',
    'Your most impactful suggestion.',
    true
  );
  addParagraph_(form, 'Q36. Any other comments or commendations for the building management team?', 'Other feedback.', false);
}

function addPage_(form, title, helpText) {
  var page = form.addPageBreakItem().setTitle(title);
  if (helpText) {
    page.setHelpText(helpText);
  }
  return page;
}

function addText_(form, title, helpText, required) {
  var item = form.addTextItem().setTitle(title).setRequired(required);
  if (helpText) {
    item.setHelpText(helpText);
  }
  return item;
}

function addParagraph_(form, title, helpText, required) {
  var item = form.addParagraphTextItem().setTitle(title).setRequired(required);
  if (helpText) {
    item.setHelpText(helpText);
  }
  return item;
}

function addRating_(form, title, helpText) {
  return addMultipleChoice_(
    form,
    title,
    ['1', '2', '3', '4', '5', 'N/A'],
    helpText || '1 = Very dissatisfied / Very poor, 5 = Very satisfied / Excellent.',
    true
  );
}

function addYesNo_(form, title) {
  return addMultipleChoice_(form, title, ['Yes', 'No'], '', true);
}

function addMultipleChoice_(form, title, choices, helpText, required) {
  var item = form.addMultipleChoiceItem().setTitle(title).setChoiceValues(choices).setRequired(required);
  if (helpText) {
    item.setHelpText(helpText);
  }
  return item;
}

function addCheckbox_(form, title, choices, helpText, required) {
  var item = form.addCheckboxItem().setTitle(title).setChoiceValues(choices).setRequired(required);
  if (helpText) {
    item.setHelpText(helpText);
  }
  return item;
}
