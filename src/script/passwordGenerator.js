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
            const platform = document.getElementById('platform').value;

            const includeUpper = document.getElementById('includeUppercase').checked;
            const includeLower = document.getElementById('includeLowercase').checked;
            const includeNumbers = document.getElementById('includeNumbers').checked;
            const includeSymbols = document.getElementById('includeSymbols').checked;

            const password = generatePersonalizedPassword(
                length, 
                { name, dob, petname, platform }, 
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
 * Generates a deeply personalized password using input data.
 * Structure: [Name/Pet Chunk][Connector][DOB Part] @[Platform]
 */
function generatePersonalizedPassword(length, personalInfo, options) {
    const { name, dob, petname, platform } = personalInfo;
    const cleanDob = dob.replace(/-/g, "");
    
    // 1. Prepare segments
    let prefix = "";
    if (name) {
        prefix = name.substring(0, Math.min(name.length, 4));
    } else if (petname) {
        prefix = petname.substring(0, Math.min(petname.length, 4));
    }

    let middle = "";
    if (dob) {
        const parts = dob.split("-"); // YYYY, MM, DD
        middle = parts[Math.floor(Math.random() * parts.length)]; // Use Year, Month, or Day intact
    } else if (petname && prefix !== petname.substring(0, 4)) {
        middle = petname.substring(0, 3);
    }

    // 2. Connector
    let connector = "";
    if (options.includeSymbols) {
        const symbols = "!@#$%^&*";
        connector = symbols[Math.floor(Math.random() * symbols.length)];
    } else if (options.includeNumbers) {
        connector = Math.floor(Math.random() * 10).toString();
    }

    // 3. Platform Suffix
    const suffix = platform ? `@${platform.replace(/\s/g, "")}` : "";

    // 4. Assemble initial personalized string
    let password = prefix + connector + middle + suffix;

    // 5. Apply character pool constraints and length adjustments
    const combinedText = name + petname + platform;
    let pool = "";
    if (options.includeUpper) pool += combinedText.toUpperCase().replace(/[^A-Z]/g, "");
    if (options.includeLower) pool += combinedText.toLowerCase().replace(/[^a-z]/g, "");
    if (options.includeNumbers) pool += cleanDob;
    if (options.includeSymbols) pool += "!@#$%^&*";
    
    if (pool.length === 0) pool = "password";

    // If too short, inject characters from the personalized pool *before* the platform suffix
    if (password.length < length) {
        const needed = length - password.length;
        let filler = "";
        for (let i = 0; i < needed; i++) {
            filler += pool[Math.floor(Math.random() * pool.length)];
        }
        
        const suffixIndex = platform ? password.indexOf(`@${platform.replace(/\s/g, "")}`) : password.length;
        password = password.slice(0, suffixIndex) + filler + password.slice(suffixIndex);
    }

    // Apply casing overall to respect user options while maintaining personalization
    if (options.includeUpper && !options.includeLower) {
        password = password.toUpperCase();
    } else if (options.includeLower && !options.includeUpper) {
        password = password.toLowerCase();
    }

    return password;
}
