// ====================================================================
// MarketLink – eGreen Basket: Form & Input Validation Engine
// Provides robust client-side validation rules & Bootstrap 5 feedback
// ====================================================================

const Validator = {
    // Regular Expressions
    REGEX: {
        // Standard email validation
        EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        // Pakistani Phone numbers: e.g. +92 300 1234567, 03001234567, +923001234567, 0300-1234567
        PAK_PHONE: /^((\+92)|(0092)|(0))?3[0-9]{2}[-\s]?[0-9]{7}$/,
        // Names: alphabets, spaces, dots, hyphens (min 3 chars)
        NAME: /^[a-zA-Z\s.'-]{3,50}$/,
        // General URL
        URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    },

    isValidEmail(email) {
        if (!email) return false;
        return this.REGEX.EMAIL.test(email.trim());
    },

    isValidPhone(phone) {
        if (!phone) return false;
        const clean = phone.replace(/[\s-]/g, '');
        return this.REGEX.PAK_PHONE.test(phone.trim()) || (clean.length >= 10 && clean.length <= 13);
    },

    isValidName(name) {
        if (!name) return false;
        return this.REGEX.NAME.test(name.trim());
    },

    isValidPassword(password, minLength = 6) {
        if (!password) return false;
        return password.length >= minLength;
    },

    isFutureOrToday(dateStr) {
        if (!dateStr) return false;
        const inputDate = new Date(dateStr);
        inputDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate >= today;
    },

    isPositiveNumber(val) {
        const num = Number(val);
        return !isNaN(num) && num > 0;
    },

    isNonNegativeNumber(val) {
        const num = Number(val);
        return !isNaN(num) && num >= 0;
    },

    // Apply Bootstrap 5 validation styles and show inline message
    markField(inputEl, isValid, errorMessage = '') {
        if (!inputEl) return isValid;

        // Find or create invalid-feedback element
        let feedbackEl = inputEl.parentNode.querySelector('.invalid-feedback');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.className = 'invalid-feedback';
            inputEl.parentNode.appendChild(feedbackEl);
        }

        if (isValid) {
            inputEl.classList.remove('is-invalid');
            inputEl.classList.add('is-valid');
            feedbackEl.textContent = '';
        } else {
            inputEl.classList.remove('is-valid');
            inputEl.classList.add('is-invalid');
            feedbackEl.textContent = errorMessage;
        }

        return isValid;
    },

    // Reset field validation state
    clearField(inputEl) {
        if (!inputEl) return;
        inputEl.classList.remove('is-valid', 'is-invalid');
        const feedbackEl = inputEl.parentNode.querySelector('.invalid-feedback');
        if (feedbackEl) feedbackEl.textContent = '';
    }
};

window.Validator = Validator;
