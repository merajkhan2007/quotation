// JavaScript for Interactive Doctor's Clinic Quotation

// Global State
let currentSlide = 1;
const totalSlides = 7;
let viewMode = 'presentation'; // 'presentation' or 'document'
let basePrice = 25000;
let estimatedTotal = 25000;

// ==========================================================================
// 1. INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Set Current Date dynamically on Cover Page
    const daySpan = document.getElementById("cal-day-span");
    const monthSpan = document.getElementById("cal-month-span");
    if (daySpan && monthSpan) {
        const today = new Date();
        const options = { month: 'short', year: 'numeric' };
        daySpan.textContent = today.getDate();
        monthSpan.textContent = today.toLocaleDateString('en-US', options);
    }

    // Generate Pagination Dots
    const dotsContainer = document.getElementById("dots-container");
    if (dotsContainer) {
        dotsContainer.innerHTML = "";
        for (let i = 1; i <= totalSlides; i++) {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            if (i === 1) dot.classList.add("active");
            dot.setAttribute("onclick", `goToSlide(${i})`);
            dotsContainer.appendChild(dot);
        }
    }
    
    // Keyboard Event Listeners for Presentation Navigation
    document.addEventListener("keydown", (e) => {
        if (viewMode === 'presentation') {
            if (e.key === "ArrowRight" || e.key === "Space" || e.key === "Enter") {
                changeSlide(1);
            } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
                changeSlide(-1);
            }
        }
    });

    // Touch Swipe Listeners for mobile/tablet in presentation mode
    let touchStartX = 0;
    let touchEndX = 0;
    
    const deck = document.getElementById("deck");
    if (deck) {
        deck.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        deck.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
    
    function handleSwipe() {
        if (viewMode !== 'presentation') return;
        const threshold = 50; // swipe distance threshold
        if (touchStartX - touchEndX > threshold) {
            // Swipe Left -> Next Slide
            changeSlide(1);
        } else if (touchEndX - touchStartX > threshold) {
            // Swipe Right -> Prev Slide
            changeSlide(-1);
        }
    }

    // Recalculate price in estimator to make sure initial view is correct
    recalculateCost();
});

// ==========================================================================
// 2. SLIDESHOW NAVIGATION LOGIC
// ==========================================================================
function changeSlide(direction) {
    let target = currentSlide + direction;
    if (target < 1) target = 1;
    if (target > totalSlides) target = totalSlides;
    goToSlide(target);
}

function goToSlide(slideNum) {
    if (viewMode !== 'presentation') return;
    
    // Remove current class from all slides
    const slides = document.querySelectorAll(".slide-card");
    slides.forEach(slide => slide.classList.remove("current"));
    
    // Add current class to target slide
    const targetSlide = document.querySelector(`.slide-card[data-slide="${slideNum}"]`);
    if (targetSlide) {
        targetSlide.classList.add("current");
        currentSlide = slideNum;
    }
    
    // Update active pagination dot
    const dots = document.querySelectorAll(".pagination-dots .dot");
    dots.forEach((dot, index) => {
        if (index + 1 === slideNum) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });

    // Disable/Enable control arrows at limits
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    
    if (prevBtn && nextBtn) {
        if (currentSlide === 1) {
            prevBtn.style.opacity = "0.3";
            prevBtn.style.cursor = "default";
        } else {
            prevBtn.style.opacity = "1";
            prevBtn.style.cursor = "pointer";
        }

        if (currentSlide === totalSlides) {
            nextBtn.style.opacity = "0.3";
            nextBtn.style.cursor = "default";
        } else {
            nextBtn.style.opacity = "1";
            nextBtn.style.cursor = "pointer";
        }
    }
}

// ==========================================================================
// 3. VIEW MODE TOGGLE (SLIDE VS DOCUMENT)
// ==========================================================================
function setViewMode(mode) {
    viewMode = mode;
    const body = document.body;
    const btnPresentation = document.getElementById("btn-presentation");
    const btnDocument = document.getElementById("btn-document");
    
    if (mode === 'document') {
        body.classList.remove("presentation-mode");
        body.classList.add("document-mode");
        btnPresentation.classList.remove("active");
        btnDocument.classList.add("active");
        
        // Remove individual slide height bounds
        const slides = document.querySelectorAll(".slide-card");
        slides.forEach(slide => slide.classList.remove("current"));
    } else {
        body.classList.remove("document-mode");
        body.classList.add("presentation-mode");
        btnPresentation.classList.add("active");
        btnDocument.classList.remove("active");
        
        // Restore active slide
        goToSlide(currentSlide);
    }
}

// ==========================================================================
// 4. INTERACTIVE PRICE ESTIMATOR DRAWER
// ==========================================================================
function toggleEstimator() {
    const drawer = document.getElementById("calculator-drawer");
    const overlay = document.getElementById("drawer-overlay");
    
    if (drawer && overlay) {
        drawer.classList.toggle("open");
        overlay.classList.toggle("open");
    }
}

function recalculateCost() {
    let total = basePrice;
    
    // Add-on item prices
    const addons = {
        'opt-hosting': 4500,
        'opt-domain': 1200,
        'opt-sms': 3000,
        'opt-logo': 2500,
        'opt-support': 6000
    };
    
    for (const [id, price] of Object.entries(addons)) {
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked) {
            total += price;
        }
    }
    
    estimatedTotal = total;
    
    // Update Drawer Price Display
    const drawerTotalText = document.getElementById("estimator-total-price");
    if (drawerTotalText) {
        drawerTotalText.textContent = `₹${total.toLocaleString('en-IN')}`;
    }
}

function applyCalculatorEstimate() {
    // Update main quote cost text (Slide 6)
    const costDisplay = document.getElementById("cost-display-value");
    if (costDisplay) {
        costDisplay.textContent = `₹${estimatedTotal.toLocaleString('en-IN')}/-`;
        
        // Highlight effect
        costDisplay.style.transform = "scale(1.15)";
        costDisplay.style.color = "#f4511e";
        setTimeout(() => {
            costDisplay.style.transform = "scale(1)";
            costDisplay.style.color = "";
        }, 600);
    }
    
    // Add visual details in table on Slide 6 (Dynamic Addons Rows)
    updatePriceTableWithAddons();
    
    // Close Drawer
    toggleEstimator();
    
    // Auto jump to Slide 6 to see the cost update
    if (viewMode === 'presentation') {
        goToSlide(6);
    } else {
        // Scroll to slide 6 in document mode
        const costSlide = document.querySelector('.slide-card[data-slide="6"]');
        if (costSlide) {
            costSlide.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function updatePriceTableWithAddons() {
    const tableBody = document.querySelector(".cost-table tbody");
    if (!tableBody) return;
    
    // Reset table body back to core
    tableBody.innerHTML = `
        <tr>
            <td>
                <strong>Website Design & Development</strong>
                <p class="service-details">Fully responsive front-end site & layout</p>
            </td>
            <td class="price-col font-bold">₹25,000</td>
        </tr>
        <tr>
            <td>
                <strong>Clinic Management System</strong>
                <p class="service-details">Patient scheduling, patient list, records management</p>
            </td>
            <td class="price-col text-green font-semibold">Included</td>
        </tr>
        <tr>
            <td>
                <strong>Report Upload/Download Panel</strong>
                <p class="service-details">Secure dashboard for doctor upload and OPD code access</p>
            </td>
            <td class="price-col text-green font-semibold">Included</td>
        </tr>
        <tr>
            <td>
                <strong>Booking & Payment Integration</strong>
                <p class="service-details">Online booking forms and payment gateway setup</p>
            </td>
            <td class="price-col text-green font-semibold">Included</td>
        </tr>
        <tr>
            <td>
                <strong>Admin Dashboard</strong>
                <p class="service-details">Back-office for staff to view metrics and database</p>
            </td>
            <td class="price-col text-green font-semibold">Included</td>
        </tr>
        <tr>
            <td>
                <strong>SEO & Security Setup</strong>
                <p class="service-details">SSL setup, clean sitemaps, semantic formatting</p>
            </td>
            <td class="price-col text-green font-semibold">Included</td>
        </tr>
    `;
    
    // Check which addons are selected and append rows
    const addonsList = [
        { id: 'opt-hosting', name: 'Premium Cloud Hosting (1 Year)', desc: '99.9% uptime, daily backups, secure SSL servers', price: 4500 },
        { id: 'opt-domain', name: 'Custom Domain Registration', desc: '1 Year registration for .com or .in domain name', price: 1200 },
        { id: 'opt-sms', name: 'WhatsApp & SMS Gateway API Integration', desc: 'Auto appointment & report notification messages', price: 3000 },
        { id: 'opt-logo', name: 'Custom Logo & Branding Package', desc: 'Vector logo files & social marketing materials', price: 2500 },
        { id: 'opt-support', name: 'Extended Technical Support (1 Year)', desc: 'Extend 30 days to 1 year support and updates', price: 6000 }
    ];
    
    addonsList.forEach(addon => {
        const cb = document.getElementById(addon.id);
        if (cb && cb.checked) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <strong>${addon.name}</strong>
                    <p class="service-details">${addon.desc}</p>
                </td>
                <td class="price-col font-bold" style="color: var(--accent-blue)">+₹${addon.price.toLocaleString('en-IN')}</td>
            `;
            tableBody.appendChild(tr);
        }
    });
}

// ==========================================================================
// 5. PATIENT REPORT PORTAL SIMULATION LOGIC
// ==========================================================================
const mockReports = {
    "OPD-101": {
        name: "Rajesh Kumar",
        age: 38,
        test: "Full Blood Count & Lipid Profile",
        date: "24 May 2025",
        file: "Rajesh_BloodTest_OPD101.pdf"
    },
    "OPD-102": {
        name: "Sunita Sharma",
        age: 45,
        test: "Chest X-Ray (Posteroanterior view)",
        date: "20 May 2025",
        file: "Sunita_ChestXRay_OPD102.pdf"
    },
    "OPD-103": {
        name: "John Doe",
        age: 29,
        test: "Electrocardiogram (ECG) Report",
        date: "18 May 2025",
        file: "JohnDoe_ECG_OPD103.pdf"
    }
};

function simulateReportSearch() {
    const inputField = document.getElementById("opd-input");
    const resultsContainer = document.getElementById("report-results");
    
    if (!inputField || !resultsContainer) return;
    
    const opdId = inputField.value.trim().toUpperCase();
    
    if (!opdId) {
        resultsContainer.innerHTML = `<div class="result-placeholder" style="color: var(--accent-orange)">Please enter an OPD ID to search.</div>`;
        return;
    }
    
    // Show Loading Spinner
    resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div class="spinner"></div>
            <span style="font-size: 11px; color: var(--text-light)">Retrieving records...</span>
        </div>
    `;
    
    // Simulate API delay (1.2 seconds)
    setTimeout(() => {
        const report = mockReports[opdId];
        
        if (report) {
            resultsContainer.innerHTML = `
                <div class="sim-success-card">
                    <div class="patient-info">
                        <h5>${report.name} (${report.age} Y/M)</h5>
                        <p><strong>Test:</strong> ${report.test}</p>
                        <p><strong>Date:</strong> ${report.date} | 🟢 Secure Status</p>
                    </div>
                    <a href="#" class="pdf-download-link" onclick="downloadMockPDF('${report.file}', '${report.name}'); return false;">
                        📥 Download
                    </a>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="result-placeholder" style="color: var(--accent-orange); font-size: 11px; line-height: 1.4;">
                    ❌ No record found for <strong>${opdId}</strong>.<br>Try <strong>OPD-101</strong>, <strong>OPD-102</strong>, or <strong>OPD-103</strong>.
                </div>
            `;
        }
    }, 1200);
}

// Generate simple Text Blob as Mock PDF download
function downloadMockPDF(filename, patientName) {
    const textContent = `
=========================================
       IMPACTARROWS CLINIC SYSTEM
         PATIENT MEDICAL REPORT
=========================================
Patient Name: ${patientName}
Report File: ${filename}
Security Hash: MD5-9F8A837C091A80A8
Status: Verified & Approved
-----------------------------------------
This is a simulated PDF file generated
by the ImpactArrows doctor quotation app
to demonstrate the functional Report Portal.
=========================================
    `;
    
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(".pdf", ".txt"); // download as .txt to verify easily
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==========================================================================
// 6. PHONE BOOKING PAYMENT SIMULATION
// ==========================================================================
function simulatePaymentClick(button) {
    if (!button) return;
    
    const originalText = button.textContent;
    button.textContent = "PROCESSING...";
    button.style.backgroundColor = "#ab47bc";
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = "SUCCESS! ✓";
        button.style.backgroundColor = "#43a047";
        
        // Notify user/sim
        alert("Payment Simulated Successfully! Patient booking is confirmed, WhatsApp message and email sent.");
        
        // Reset payment button after 3 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = "";
            button.disabled = false;
        }, 3000);
    }, 1500);
}

// ==========================================================================
// 7. CLINIC ADMIN DASHBOARD SIMULATOR LOGIC
// ==========================================================================

// Global registry tracking (Starts at OPD-104)
let nextOpdNum = 104;
let registeredPatientCount = 3;
let appointmentCount = 3;

// Doctors state
const doctorsDb = {
    1: { name: "Dr. Lalit Kumar", dept: "General Medicine", active: true },
    2: { name: "Dr. Sarah Smith", dept: "Pediatrics", active: true },
    3: { name: "Dr. Ramesh Dev", dept: "Cardiology", active: true }
};

// Open Dashboard Simulator
function openDashboardDemo(e) {
    if (e) {
        e.stopPropagation(); // prevent slideshow click trigger
    }
    const modal = document.getElementById("dashboard-modal");
    if (modal) {
        modal.classList.add("open");
        document.body.style.overflow = "hidden"; // disable background scroll
        updateDbDocOptions(); // initialize doctor dropdown
    }
}

// Close Dashboard Simulator
function closeDashboardDemo() {
    const modal = document.getElementById("dashboard-modal");
    if (modal) {
        modal.classList.remove("open");
        document.body.style.overflow = ""; // restore scroll
    }
}

function closeDashboardDemoOnOverlay(e) {
    if (e.target.id === "dashboard-modal") {
        closeDashboardDemo();
    }
}

// Sidebar Tab Switcher
function switchDbTab(e, tabId) {
    // Deactivate all tabs
    const tabContents = document.querySelectorAll(".db-tab-content");
    tabContents.forEach(content => content.classList.remove("active"));
    
    const tabLinks = document.querySelectorAll(".db-tab-link");
    tabLinks.forEach(link => link.classList.remove("active"));
    
    // Activate target
    document.getElementById(tabId).classList.add("active");
    e.currentTarget.classList.add("active");
}

// Doctor Availability Toggle
function toggleDoctorStatus(docId) {
    const doc = doctorsDb[docId];
    if (!doc) return;
    
    doc.active = !doc.active;
    
    // Update indicator UI
    const indicator = document.getElementById(`doc-status-indicator-${docId}`);
    const text = document.getElementById(`doc-status-text-${docId}`);
    
    if (indicator && text) {
        if (doc.active) {
            indicator.className = "status-indicator-dot online";
            text.textContent = "Available (In Cabin)";
        } else {
            indicator.className = "status-indicator-dot offline";
            text.textContent = "Busy / On Leave";
        }
    }
    
    // Log Activity
    addDbActivityLog(`Doctor status: <strong>${doc.name}</strong> is now ${doc.active ? 'Available' : 'Busy/On Leave'}.`);
    
    // Re-verify active count
    let activeCount = 0;
    for (const d of Object.values(doctorsDb)) {
        if (d.active) activeCount++;
    }
    document.getElementById("db-stat-doctors").textContent = activeCount;
    
    // Update dropdown in scheduling forms
    updateDbDocOptions();
}

// Dynamic Doctor Dropdown Options based on Selected Department
function updateDbDocOptions() {
    const deptSelect = document.getElementById("db-apt-dept");
    const docSelect = document.getElementById("db-apt-doc");
    if (!deptSelect || !docSelect) return;
    
    const dept = deptSelect.value;
    docSelect.innerHTML = "";
    
    let added = false;
    for (const [id, doc] of Object.entries(doctorsDb)) {
        if (doc.dept === dept) {
            const opt = document.createElement("option");
            opt.value = doc.name;
            opt.textContent = doc.name + (doc.active ? "" : " (Busy)");
            opt.disabled = !doc.active;
            if (doc.active && !added) {
                opt.selected = true;
                added = true;
            }
            docSelect.appendChild(opt);
        }
    }
    
    if (!added) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "No doctors available";
        opt.disabled = true;
        opt.selected = true;
        docSelect.appendChild(opt);
    }
}

// Handle Appointment Booking Submit
function handleDbAppointmentSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById("db-apt-name");
    const deptSelect = document.getElementById("db-apt-dept");
    const docSelect = document.getElementById("db-apt-doc");
    const timeInput = document.getElementById("db-apt-time");
    
    if (!nameInput || !deptSelect || !docSelect || !timeInput) return;
    if (!docSelect.value) {
        alert("Please select an available doctor.");
        return;
    }
    
    const name = nameInput.value.trim();
    const dept = deptSelect.value;
    const doctor = docSelect.value;
    const rawTime = timeInput.value;
    
    // Format Time (HH:MM to 12-hour AM/PM)
    const [hours, minutes] = rawTime.split(":");
    let formattedTime = "";
    const h = parseInt(hours);
    if (h === 0) formattedTime = `12:${minutes} AM`;
    else if (h === 12) formattedTime = `12:${minutes} PM`;
    else if (h > 12) formattedTime = `${h - 12}:${minutes} PM`;
    else formattedTime = `${h}:${minutes} AM`;
    
    // Append to Table
    const tableBody = document.querySelector("#db-appointments-table tbody");
    if (tableBody) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${name}</td>
            <td>${dept}</td>
            <td>${doctor}</td>
            <td>${formattedTime}</td>
            <td><span class="db-status-pill success">Scheduled</span></td>
        `;
        tableBody.insertBefore(tr, tableBody.firstChild);
    }
    
    // Update Stat count
    appointmentCount++;
    document.getElementById("db-stat-bookings").textContent = appointmentCount;
    
    // Log Activity
    addDbActivityLog(`Booking confirmed: <strong>${name}</strong> for ${dept} (${formattedTime}).`);
    
    // Reset Form
    nameInput.value = "";
    
    // Alert user simulation
    alert(`SMS Alert Sent! Simulated WhatsApp/SMS notification sent successfully to patient: "${name}, your appointment with ${doctor} is scheduled for ${formattedTime}."`);
}

// Handle Patient Registry Submit
function handleDbPatientSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById("db-pat-name");
    const ageInput = document.getElementById("db-pat-age");
    const genderSelect = document.getElementById("db-pat-gender");
    const phoneInput = document.getElementById("db-pat-phone");
    const reportInput = document.getElementById("db-pat-report");
    
    if (!nameInput || !ageInput || !genderSelect || !phoneInput || !reportInput) return;
    
    const name = nameInput.value.trim();
    const age = ageInput.value;
    const gender = genderSelect.value;
    const phone = phoneInput.value.trim();
    const diagnosis = reportInput.value.trim();
    
    // Generate OPD ID
    const generatedOpdId = `OPD-${nextOpdNum}`;
    nextOpdNum++;
    
    // 1. Add to patients database table list
    const tableBody = document.querySelector("#db-patients-table tbody");
    if (tableBody) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${generatedOpdId}</strong></td>
            <td>${name}</td>
            <td>${age} / ${gender}</td>
            <td>${phone}</td>
        `;
        tableBody.insertBefore(tr, tableBody.firstChild);
    }
    
    // 2. IMPORTANT INTEGRATION: Insert into mockReports object in script.js database!
    // This allows the user to immediately search and download this patient's report on Slide 4
    mockReports[generatedOpdId] = {
        name: name,
        age: age,
        test: diagnosis,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        file: `${name.replace(/\s+/g, '')}_DiagnosticReport_${generatedOpdId}.pdf`
    };
    
    // Update Stats counts
    registeredPatientCount++;
    document.getElementById("db-stat-patients").textContent = registeredPatientCount;
    
    // Log Activity
    addDbActivityLog(`New Patient registered: <strong>${name}</strong>. Generated ID: <strong>${generatedOpdId}</strong>.`);
    
    // Reset Form
    nameInput.value = "";
    ageInput.value = "";
    phoneInput.value = "";
    reportInput.value = "";
    
    // Alert user simulation
    alert(`Patient Registered Successfully!\nGenerated OPD ID: ${generatedOpdId}\n\nYou can now go to Slide 4 (Medical Report Portal) and search for "${generatedOpdId}" to test the download interface!`);
}

// Log new activity to panel
function addDbActivityLog(text) {
    const list = document.getElementById("db-activity-list");
    if (!list) return;
    
    const today = new Date();
    const hours = today.getHours().toString().padStart(2, '0');
    const minutes = today.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    const item = document.createElement("div");
    item.className = "db-activity-item";
    item.innerHTML = `
        <span class="activity-time">${timeStr}</span>
        <p>${text}</p>
    `;
    list.insertBefore(item, list.firstChild);
}

