const PasswordValidator= require("password-validator");
// Create a new password schema
const schema = new PasswordValidator();
// Add password requirements
schema
  .is().min(8)                                    // Minimum length 8
  .is().max(100)                                  // Maximum length 100
  .has().uppercase()                              // Must have uppercase letters
  .has().lowercase()                              // Must have lowercase letters
  .has().digits(1)                                // Must have at least 1 digit
  .has().symbols(1)                               // Must have at least 1 symbol
  .has().not().spaces();                          // Should not contain spaces

const validatePassword=(password)=> {
    const validationResult = schema.validate(password, { list: true });
    if (validationResult.length > 0) {
      const missingRequirements = validationResult.map((requirement) => {
        if (requirement === 'min') {
          return 'Minimum length should be 8 characters';
        }
        if (requirement === 'max') {
          return 'Maximum length should be 100 characters';
        }
        if (requirement === 'uppercase') {
          return 'At least one uppercase letter is required';
        }
        if (requirement === 'lowercase') {
          return 'At least one lowercase letter is required';
        }
        if (requirement === 'digits') {
          return 'At least one digit is required';
        }
        if (requirement === 'symbols') {
          return 'At least one symbol is required';
        }
        if (requirement === 'spaces') {
          return 'Spaces are not allowed';
        }
      });
      return missingRequirements;
   }
 return null; // Password meets all requirements
}

module.exports = validatePassword;
