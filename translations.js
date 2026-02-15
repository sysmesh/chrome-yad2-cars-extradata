"class Translations {
  constructor() {
    this.translations = {
      \"popup\": {
        \"title\": \"מידע נוסף על מודעה\",
        \"button\": \"מצא מידע נוסף\",
        \"processing\": \"מחפש מידע נוסף. ..\",
        \"checking_page\": \"בודק את המידע. ..\",
        \"valid_page\": \"דף מודעת רכב תקין\",
        \"invalid_page\": \"זה לא דף של מודעת רכב\",
        \"detected_plate\": \"זוהתה לוחית רישוי: {plate}\",
        \"no_plate_detected\": \"לא זוהו לוחיות רישוי. ({count} תמונות נבדקות)\",
        \"settings\": \"הגדרות\",
        \"error_communication\": \"שגיאה: הדף לא נטען כראוי\",
        \"error_injection\": \"שגיאה: תקלה ביישום\"
      },
      \"content\": {
        \"analysis_results\": \"מידע נוסף\",
        \"most_frequent_plate\": \"לוחית רישוי: {plate}\",
        \"fetching_data\": \"מחפש מידע נוסף. ..\",
        \"error\": \"שגיאה:\",
        \"no_data_found\": \"לא נמצא מידע על הרכב\",
        \"error_parsing\": \"שגיאה בניתוח המידע\",
        \"no_flaws\": \"לא הצלחתנו למצוא פגמים ברכב\"
      },
      \"vehicle_fields\": {
        \"בעלות\": \"בעלות\",
        \"ארץ ייצור\": \"ארץ ייצור\",
        \"קוד דגם\": \"קוד דגם\",
        \"רמת גימור\": \"רמת גימור\",
        \"רמת אבזור בטיחותי\": \"רמת אבזור בטיחותי\",
        \"קבוצת זיהום\": \"קבוצת זיהום\",
        \"שנת ייצור\": \"שנת ייצור\",
        \"דגם מנוע\": \"דגם מנוע\",
        \"מועד עלייה לכביש\": \"מועד עלייה לכביש\",
        \"מבחן רישוי אחרון\": \"מבחן רישוי אחרון\",
        \"תוקף רישוי שנתי\": \"תוקף רישוי שנתי\",
        \"צבע רכב\": \"צבע רכב\",
        \"צמיג קדמי\": \"צמיג קדמי\",
        \"צמיג אחורי\": \"צמיג אחורי\",
        \"סוג דלק\": \"סוג דלק\",
        \"unknown\": \"לא ידוע\"
      },
      \"analysis_fields\": {
        \"plate_number\": \"לוחית רישוי\",
        \"make_model\": \"יצרן/דגם\",
        \"year\": \"שנה\",
        \"color\": \"צבע\",
        \"damage\": \"פגמים ויזואליים\",
        \"confidence\": \"ביטחון\"
      },
      \"chatgpt\": {
        \"system_prompt\": \"You are an expert vehicle identification assistant specializing in Israeli vehicles. You are an expert in buying used cars and you are able to visually detect slight defects in used cars via photos (i.e. dents, scratches, rust, mismatching gaps, mismatching part colors etc.).\\n Analyze images carefully and provide accurate information in Hebrew when possible. Always return valid JSON format without additional text or formatting.\",
        \"prompt\": \"Analyze this vehicle image and return the following details as pure JSON (without Markdown code blocks) with Hebrew values:\\n1. plateNumber (license plate in format 'ABC123' or 'NONE' if not visible)\\n2. make (car manufacturer in Hebrew)\\n3. model (car model in Hebrew)\\n4. year (production year)\\n5. color (in Hebrew)\\n6. damage or visual detected defects (description in Hebrew)\\n7. confidence (0-1 confidence score)\\nReturn ONLY valid JSON with these exact keys, without any additional text or formatting.\" 
      }
    };
  }

  get(category, key, params = {}) {
    const text = this.translations[category]?.[key] || key;
    return this.interpolate(text, params);
  }

  interpolate(text, params) {
    return text.replace(/{(\w+)}/g, (match, key) => params[key] || match);
  }

  getVehicleField(field) {
    return this.translations.vehicle_fields[field] || field;
  }

  getChatGPTPrompt() {
    return this.translations.chatgpt.prompt;
  }

  getChatGPTSystemPrompt() {
    return this.translations.chatgpt.system_prompt;
  }
}

// Create a global instance
const translations = new Translations();

// Export for use in different contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Translations;
} else if (typeof window !== 'undefined') {
  window.Translations = Translations;
  window.translations = translations;
}"