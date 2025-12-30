// js/script.js

const API_BASE_URL = "https://genoveva-unratable-shaniqua.ngrok-free.dev";

const eventSelect = document.getElementById('eventSelect');
const visitDateInput = document.getElementById('visitDate');
const customPurposeDiv = document.getElementById('customPurposeDiv');
const customPurposeInput = document.getElementById('customPurposeInput');
const studentProofSection = document.getElementById('studentProofSection');
const studentIdInput = document.getElementById('studentIdInput');
const form = document.getElementById('visitorForm');

// --- STEP 1: FETCH EVENTS ON LOAD ---
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/events`);
        const events = await response.json();

        // Clear "Loading..."
        eventSelect.innerHTML = '<option value="">-- Select Event --</option>';

        // Add Events from API
        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name} (${event.date})`;
            
            // Store logic data in datasets
            option.dataset.type = 'event';
            option.dataset.date = event.date;
            option.dataset.proof = event.requires_student_proof; 
            
            eventSelect.appendChild(option);
        });

        // Add Custom Option
        const customOption = document.createElement('option');
        customOption.value = "custom";
        customOption.textContent = "Other / Personal Visit";
        customOption.dataset.type = "custom";
        eventSelect.appendChild(customOption);

    } catch (error) {
        console.error('Error loading events:', error);
        eventSelect.innerHTML = '<option>Error: Could not connect to server</option>';
    }
});

// --- STEP 2: HANDLE DROPDOWN LOGIC ---
eventSelect.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const type = selectedOption.dataset.type;

    if (type === 'custom') {
        visitDateInput.removeAttribute('readonly');
        visitDateInput.classList.remove('bg-light');
        visitDateInput.value = ''; 
        customPurposeDiv.style.display = 'block';
        customPurposeInput.required = true;
        studentProofSection.style.display = 'none';
        studentIdInput.required = false;

    } else if (type === 'event') {
        visitDateInput.value = selectedOption.dataset.date;
        visitDateInput.setAttribute('readonly', true);
        visitDateInput.classList.add('bg-light');
        customPurposeDiv.style.display = 'none';
        customPurposeInput.required = false;

        // Check for boolean string or actual boolean
        if (selectedOption.dataset.proof === 'true' || selectedOption.dataset.proof === true) {
            studentProofSection.style.display = 'block';
            studentIdInput.required = true;
        } else {
            studentProofSection.style.display = 'none';
            studentIdInput.required = false;
        }
    } else {
        // Reset
        customPurposeDiv.style.display = 'none';
        studentProofSection.style.display = 'none';
        visitDateInput.value = '';
    }
});

// --- STEP 3: HANDLE FORM SUBMIT ---
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page reload

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    
    // Show loading state
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    const formData = new FormData(form);
    
    // Add 'visit_type' explicitly
    const selectedOption = eventSelect.options[eventSelect.selectedIndex];
    formData.append('visit_type', selectedOption.dataset.type);

    try {
        const response = await fetch(`${API_BASE_URL}/api/visitor/register`, {
            method: 'POST',
            body: formData 
        });

        const result = await response.json();
        
        if (response.ok) {
            alert("Application Received! Please wait for approval.");
            form.reset();
            // Reset UI
            customPurposeDiv.style.display = 'none';
            studentProofSection.style.display = 'none';
        } else {
            alert("Error: " + (result.message || "Unknown error"));
        }
    } catch (error) {
        console.error(error);
        alert("Connection Error. Is the backend server running?");
    } finally {
        // Restore button
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
});
