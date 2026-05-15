// Function to toggle the visibility of the password input field
function togglePassword() {
  const x = document.getElementById("password");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

// Password strength checker function
function checkPasswordStrength(password) {
  let strength = 0;
  let feedback = [];

  if (password.length === 0) return { strength: -1, feedback: [] };

  // Check for length
  if (password.length >= 6) strength++;
  else feedback.push("At least 6 characters");
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) strength++;
  else feedback.push("Uppercase letter");

  // Check for lowercase letters
  if (/[a-z]/.test(password)) strength++;
  else feedback.push("Lowercase letter");

  // Check for numbers
  if (/\d/.test(password)) strength++;
  else feedback.push("Number");

  // Check for special characters
  if (/[@$!%*?&\/#^()_+=\-\[\]{}|;:',.<>?]/.test(password)) strength++;
  else feedback.push("Special character (@$!%*?&/#^()_+=...)");

  return { strength, feedback };
}

// Get strength label and color
function getStrengthInfo(strength) {
  if (strength === -1) return { text: "-", color: "#6b7280", percent: 0 };
  const labels = [
    { text: "Very Weak", color: "#ef4444", percent: 10 },
    { text: "Very Weak", color: "#ef4444", percent: 20 },
    { text: "Weak", color: "#f97316", percent: 30 },
    { text: "Moderate", color: "#eab308", percent: 50 },
    { text: "Strong", color: "#84cc16", percent: 75 },
    { text: "Very Strong", color: "#22c55e", percent: 90 },
    { text: "Very Strong", color: "#22c55e", percent: 100 }
  ];
  return labels[Math.min(strength, 6)];
}

// Update strength display in real-time
function updateStrengthDisplay(password) {
  const result = checkPasswordStrength(password);
  const strength = result.strength;
  const strengthText = document.getElementById("strength-text");
  const strengthMeter = document.getElementById("strength-meter");
  const sd = document.getElementById("strengthDisplay");
  
  const info = getStrengthInfo(strength);

  if (strengthText) {
    strengthText.textContent = info.text;
    strengthText.style.color = info.color;
  }
  if (strengthMeter) {
    strengthMeter.style.width = info.percent + "%";
    strengthMeter.style.backgroundColor = info.color;
  }
  
  if (sd) {
    sd.style.display = password.length > 0 ? "block" : "none";
  }
}

// Reset form to initial state
function resetForm() {
  document.getElementById("passwordForm").reset();
  document.getElementById("result").style.display = "none";
  document.getElementById("password").type = "password";
  
  const st = document.getElementById("strength-text");
  if (st) {
    st.textContent = "-";
    st.style.color = "#6b7280";
  }
  const sm = document.getElementById("strength-meter");
  if (sm) sm.style.width = "0%";
  
  document.getElementById("submitBtn").style.display = "block";
  const sd = document.getElementById("strengthDisplay");
  if (sd) sd.style.display = "none";
  document.getElementById("password").focus();
}

// Main logic
document.addEventListener('DOMContentLoaded', function () {
  const passwordInput = document.getElementById("password");
  const form = document.getElementById("passwordForm");
  const strengthDisplay = document.getElementById("strengthDisplay");

  if (strengthDisplay) strengthDisplay.style.display = "none";

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      updateStrengthDisplay(this.value);
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      if (!passwordInput) return; // Exit if this isn't the checker form
      e.preventDefault();
      const password = passwordInput.value;
      const result = checkPasswordStrength(password);
      const strength = result.strength;
      const info = getStrengthInfo(strength);

      updateStrengthDisplay(password);

      let resultHTML = `<p style="font-size: 1.1rem; margin: 10px 0;">Your password strength: <strong style="color: ${info.color};">${info.text}</strong></p>`;

      if (result.feedback.length > 0) {
        resultHTML += `<p style="margin: 10px 0;">To make your password stronger, add:</p><ul style="margin-left: 20px;">`;
        result.feedback.forEach(item => {
          resultHTML += `<li>${item}</li>`;
        });
        resultHTML += `</ul>`;
      } else {
        resultHTML += `<p style="color: #22c55e; margin: 10px 0;">✓ Excellent! Your password meets all security criteria.</p>`;
      }

      const resultText = document.getElementById("resultText");
      const resultDiv = document.getElementById("result");
      const submitBtn = document.getElementById("submitBtn");

      if (resultText) resultText.innerHTML = resultHTML;
      if (resultDiv) resultDiv.style.display = "block";
      if (submitBtn) submitBtn.style.display = "none";
    });
  }
});
