document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('passwordForm');
    const resultDiv = document.getElementById('result');
    const generatedPasswordInput = document.getElementById('generatedPassword');
    const copyBtn = document.getElementById('copyBtn');

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const length = parseInt(document.getElementById('length').value);
            const name = document.getElementById('name').value;
            const dob = document.getElementById('Date').value;
            const petname = document.getElementById('petname').value;

            const includeUpper = document.getElementById('includeUppercase').checked;
            const includeLower = document.getElementById('includeLowercase').checked;
            const includeNumbers = document.getElementById('includeNumbers').checked;
            const includeSymbols = document.getElementById('includeSymbols').checked;

            const password = generatePersonalizedPassword(
                length, 
                { name, dob, petname }, 
                { includeUpper, includeLower, includeNumbers, includeSymbols }
            );

            generatedPasswordInput.value = password;
            resultDiv.style.display = 'block';
            
            // Update strength display
            if (typeof updateStrengthDisplay === 'function') {
                updateStrengthDisplay(password);
            }
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            generatedPasswordInput.select();
            document.execCommand('copy');
            alert('Password copied to clipboard!');
        });
    }
});

/**
 * Generates a personalized password using ONLY characters derived from the user's input.
 * Ensures date components (Day/Month/Year) and name hints stay together as atomic units.
 */
function generatePersonalizedPassword(length, personalInfo, options) {
    const { name, dob, petname } = personalInfo;
    let components = []; // This will store strings (atomic units)

    // 1. Extract intact Date of Birth components
    if (dob) {
        const dateParts = dob.split("-"); // [YYYY, MM, DD]
        if (dateParts.length === 3) {
            const numParts = Math.floor(Math.random() * 2) + 1; // Pick 1 or 2 parts
            const shuffledParts = [...dateParts].sort(() => Math.random() - 0.5);
            for (let i = 0; i < numParts; i++) {
                components.push(shuffledParts[i]);
            }
        }
    }

    // 2. Extract 2-3 character "hints" from name and petname
    [name, petname].forEach(input => {
        if (input && input.length >= 2) {
            const chunkLength = Math.min(input.length, Math.floor(Math.random() * 2) + 2);
            const start = Math.floor(Math.random() * (input.length - chunkLength + 1));
            let chunk = input.substring(start, start + chunkLength);
            
            if (options.includeUpper && !options.includeLower) {
                chunk = chunk.toUpperCase();
            } else if (options.includeLower && !options.includeUpper) {
                chunk = chunk.toLowerCase();
            }
            components.push(chunk);
        }
    });

    // 3. Build a character pool strictly from input for filler
    const cleanDob = dob.replace(/-/g, "");
    const combinedText = name + petname;
    let pool = "";
    if (options.includeUpper) pool += combinedText.toUpperCase().replace(/[^A-Z]/g, "");
    if (options.includeLower) pool += combinedText.toLowerCase().replace(/[^a-z]/g, "");
    if (options.includeNumbers) pool += (cleanDob + combinedText.replace(/[^0-9]/g, ""));
    if (options.includeSymbols) {
        const symbols = combinedText.replace(/[a-zA-Z0-9\s]/g, "");
        pool += symbols.length > 0 ? symbols : "!@#$%^&*";
    }
    if (pool.length === 0) pool = (name + petname + cleanDob).replace(/\s/g, "") || "password";

    // 4. Assemble by shuffling the units themselves, not individual characters
    // First, fill the remaining length with individual characters from the pool
    let currentLength = components.reduce((sum, c) => sum + c.length, 0);
    while (currentLength < length) {
        const char = pool.charAt(Math.floor(Math.random() * pool.length));
        components.push(char);
        currentLength++;
    }

    // Shuffle the components (the chunks and the filler characters)
    const shuffledComponents = components.sort(() => Math.random() - 0.5);
    
    // Join and trim to exact length (in case chunks were long)
    let password = shuffledComponents.join('');
    if (password.length > length) {
        // If we need to trim, try to trim from the end or just slice
        password = password.slice(0, length);
    }

    return password;
}
