document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('passwordForm');
    const resultDiv = document.getElementById('result');
    const passwordsList = document.getElementById('passwordsList');

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

            // Generate 4 passwords
            const passwords = [];
            for (let i = 0; i < 4; i++) {
                const password = generatePersonalizedPassword(
                    length, 
                    { name, dob, petname, platform }, 
                    { includeUpper, includeLower, includeNumbers, includeSymbols }
                );
                passwords.push(password);
            }

            // Display all 4 passwords
            displayPasswords(passwords);
            resultDiv.style.display = 'block';
        });
    }
});

/**
 * Displays 4 generated passwords with individual copy functionality
 */
function displayPasswords(passwords) {
    const passwordsList = document.getElementById('passwordsList');
    passwordsList.innerHTML = '';
    passwordsList.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px;';

    passwords.forEach((password, index) => {
        const passwordItem = document.createElement('div');
        passwordItem.className = 'password-item';
        passwordItem.style.cssText = 'border: 1px solid #ddd; padding: 15px; border-radius: 8px; background-color: #f9f9f9;';

        const label = document.createElement('p');
        label.textContent = `Password ${index + 1}:`;
        label.style.cssText = 'margin: 0 0 10px 0; font-weight: bold;';

        const passwordInput = document.createElement('input');
        passwordInput.type = 'text';
        passwordInput.value = password;
        passwordInput.readOnly = true;
        passwordInput.style.cssText = 'width: 100%; padding: 8px; font-family: monospace; font-size: 0.9rem; margin-bottom: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;';

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.style.cssText = 'padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;';

        copyBtn.addEventListener('click', () => {
            passwordInput.select();
            document.execCommand('copy');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#28a745';
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '#007bff';
            }, 2000);
        });

        // Add strength display for each password
        const strengthDisplay = document.createElement('div');
        strengthDisplay.className = 'password-strength-display';
        strengthDisplay.style.cssText = 'margin-top: 10px;';

        const strengthLabel = document.createElement('p');
        strengthLabel.style.cssText = 'margin: 5px 0; font-size: 0.9rem;';
        strengthLabel.innerHTML = `Strength: <span class="strength-text" style="font-weight: bold;">-</span>`;

        const strengthBar = document.createElement('div');
        strengthBar.style.cssText = 'background-color: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 5px;';

        const strengthMeter = document.createElement('div');
        strengthMeter.className = 'strength-meter';
        strengthMeter.style.cssText = 'height: 100%; width: 0%; border-radius: 4px; transition: width 0.3s ease;';

        strengthBar.appendChild(strengthMeter);
        strengthDisplay.appendChild(strengthLabel);
        strengthDisplay.appendChild(strengthBar);

        // Update strength for this password
        if (typeof updateStrengthDisplay === 'function') {
            updateStrengthDisplay(password, strengthLabel.querySelector('.strength-text'), strengthMeter);
        }

        passwordItem.appendChild(label);
        passwordItem.appendChild(passwordInput);
        passwordItem.appendChild(copyBtn);
        passwordItem.appendChild(strengthDisplay);

        passwordsList.appendChild(passwordItem);
    });
}

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
