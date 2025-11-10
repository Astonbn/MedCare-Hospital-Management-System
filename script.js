// app.js

// Global variables
let currentDate = new Date();
let patients = JSON.parse(localStorage.getItem('patients')) || [];
let staff = JSON.parse(localStorage.getItem('staff')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
    initializeCharts();
    generateCalendar();
});

function initializeApp() {
    // Set current page title
    updatePageTitle('Dashboard');
    
    // Initialize any required components
    updatePatientTable();
    updateStaffTable();
    updateInventoryTable();
}

function setupEventListeners() {
    // Navigation menu
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            switchPage(pageId);
        });
    });

    // Menu toggle for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    menuToggle.addEventListener('click', toggleSidebar);

    // Form submissions
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', handlePatientSubmit);
    }

    // Search functionality
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', handleSearch);
    });

    // Filter functionality
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', handleFilter);
    });

    // Inventory category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchInventoryCategory(this.getAttribute('data-category'));
        });
    });
}

// Navigation Functions
function switchPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Add active class to clicked nav item
        const activeNavItem = document.querySelector(`[data-page="${pageId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update page title
        updatePageTitle(getPageTitle(pageId));

        // Page-specific initializations
        switch(pageId) {
            case 'dashboard':
                updateDashboardStats();
                break;
            case 'appointments':
                generateCalendar();
                break;
            case 'reports':
                initializeReportCharts();
                break;
        }
    }
}

function updatePageTitle(title) {
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = title;
    }
}

function getPageTitle(pageId) {
    const titles = {
        'dashboard': 'Dashboard',
        'patients': 'Patient Management',
        'staff': 'Staff Management',
        'appointments': 'Appointment Scheduling',
        'billing': 'Billing & Invoicing',
        'inventory': 'Inventory Management',
        'medical-records': 'Medical Records',
        'laboratory': 'Laboratory Management',
        'pharmacy': 'Pharmacy Management',
        'reports': 'Reports & Analytics'
    };
    return titles[pageId] || 'Dashboard';
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        hideModal(event.target.id);
    }
});

// Patient Management Functions
function handlePatientSubmit(event) {
    event.preventDefault();
    
    const patientData = {
        id: 'P' + String(patients.length + 1).padStart(3, '0'),
        name: document.getElementById('patientName').value,
        age: document.getElementById('patientAge').value,
        gender: document.getElementById('patientGender').value,
        contact: document.getElementById('patientContact').value,
        address: document.getElementById('patientAddress').value,
        bloodType: document.getElementById('patientBloodType').value,
        emergencyContact: document.getElementById('emergencyContact').value,
        status: 'outpatient',
        lastVisit: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };

    patients.push(patientData);
    saveToLocalStorage('patients', patients);
    updatePatientTable();
    hideModal('patientModal');
    event.target.reset();
    
    showNotification('Patient added successfully!', 'success');
}

function updatePatientTable() {
    const tableBody = document.getElementById('patientsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    patients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.contact}</td>
            <td><span class="status ${patient.status}">${patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}</span></td>
            <td>${patient.lastVisit}</td>
            <td>
                <button class="btn-icon" onclick="viewPatient('${patient.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editPatient('${patient.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deletePatient('${patient.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function viewPatient(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        alert(`Patient Details:\nName: ${patient.name}\nAge: ${patient.age}\nContact: ${patient.contact}\nStatus: ${patient.status}`);
    }
}

function editPatient(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        // Populate modal with patient data
        document.getElementById('patientName').value = patient.name;
        document.getElementById('patientAge').value = patient.age;
        document.getElementById('patientGender').value = patient.gender;
        document.getElementById('patientContact').value = patient.contact;
        document.getElementById('patientAddress').value = patient.address;
        document.getElementById('patientBloodType').value = patient.bloodType;
        document.getElementById('emergencyContact').value = patient.emergencyContact;
        
        showModal('patientModal');
        
        // Update form to handle edit
        const form = document.getElementById('patientForm');
        form.onsubmit = function(e) {
            e.preventDefault();
            // Update patient logic here
            hideModal('patientModal');
        };
    }
}

function deletePatient(patientId) {
    if (confirm('Are you sure you want to delete this patient?')) {
        patients = patients.filter(p => p.id !== patientId);
        saveToLocalStorage('patients', patients);
        updatePatientTable();
        showNotification('Patient deleted successfully!', 'success');
    }
}

// Staff Management Functions
function updateStaffTable() {
    const tableBody = document.getElementById('staffTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    staff.forEach(staffMember => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${staffMember.id}</td>
            <td>${staffMember.name}</td>
            <td>${staffMember.role}</td>
            <td>${staffMember.department}</td>
            <td>${staffMember.contact}</td>
            <td>${staffMember.schedule}</td>
            <td>
                <button class="btn-icon" onclick="viewStaff('${staffMember.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editStaff('${staffMember.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function viewStaff(staffId) {
    const staffMember = staff.find(s => s.id === staffId);
    if (staffMember) {
        alert(`Staff Details:\nName: ${staffMember.name}\nRole: ${staffMember.role}\nDepartment: ${staffMember.department}\nContact: ${staffMember.contact}`);
    }
}

function editStaff(staffId) {
    // Implementation for editing staff
    showNotification('Edit staff functionality coming soon!', 'info');
}

// Calendar Functions
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('currentMonth').textContent = 
        currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Clear previous calendar
    calendarGrid.innerHTML = '';

    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyCell);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if there are appointments on this day
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAppointments = appointments.filter(apt => apt.date === dateStr);
        
        if (dayAppointments.length > 0) {
            const appointmentBadge = document.createElement('div');
            appointmentBadge.className = 'appointment-badge';
            appointmentBadge.textContent = dayAppointments.length;
            dayElement.appendChild(appointmentBadge);
            dayElement.classList.add('has-appointments');
        }

        // Highlight current day
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayElement.classList.add('today');
        }

        calendarGrid.appendChild(dayElement);
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
}

// Inventory Management Functions
function switchInventoryCategory(category) {
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = document.querySelector(`[data-category="${category}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    updateInventoryTable(category);
}

function updateInventoryTable(category = 'all') {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    let filteredInventory = inventory;
    if (category !== 'all') {
        filteredInventory = inventory.filter(item => item.category === category);
    }
    
    filteredInventory.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>$${item.price}</td>
            <td>${item.expiryDate}</td>
            <td><span class="status ${item.stock < 10 ? 'low-stock' : 'in-stock'}">${item.stock < 10 ? 'Low Stock' : 'In Stock'}</span></td>
            <td>
                <button class="btn-icon" onclick="editInventory('${item.code}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function editInventory(itemCode) {
    // Implementation for editing inventory
    showNotification('Edit inventory functionality coming soon!', 'info');
}

// Search and Filter Functions
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const page = event.target.closest('.page').id;
    
    switch(page) {
        case 'patients':
            filterPatients(searchTerm);
            break;
        case 'staff':
            filterStaff(searchTerm);
            break;
        case 'inventory':
            filterInventory(searchTerm);
            break;
    }
}

function handleFilter(event) {
    const filterValue = event.target.value;
    // Implementation for filtering data
    showNotification(`Filtering by: ${filterValue}`, 'info');
}

function filterPatients(searchTerm) {
    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.id.toLowerCase().includes(searchTerm) ||
        patient.contact.includes(searchTerm)
    );
    
    // Update table with filtered results
    const tableBody = document.getElementById('patientsTableBody');
    tableBody.innerHTML = '';
    
    filteredPatients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.contact}</td>
            <td><span class="status ${patient.status}">${patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}</span></td>
            <td>${patient.lastVisit}</td>
            <td>
                <button class="btn-icon" onclick="viewPatient('${patient.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editPatient('${patient.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function filterStaff(searchTerm) {
    // Similar implementation for staff filtering
}

function filterInventory(searchTerm) {
    // Similar implementation for inventory filtering
}

// Chart Functions
function initializeCharts() {
    initializeAdmissionChart();
    initializeRevenueChart();
    initializeDepartmentChart();
}

function initializeAdmissionChart() {
    const ctx = document.getElementById('admissionChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Patient Admissions',
                data: [12, 19, 15, 17, 14, 11, 16],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue ($)',
                data: [12000, 19000, 15000, 17000, 14000, 16000],
                backgroundColor: '#27ae60'
            }]
        },
        options: {
            responsive: true
        }
    });
}

function initializeDepartmentChart() {
    const ctx = document.getElementById('departmentChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Emergency'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#3498db',
                    '#e74c3c',
                    '#f39c12',
                    '#9b59b6',
                    '#1abc9c'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

function initializeReportCharts() {
    // Additional charts for reports page
    initializeRevenueChart();
    initializeDepartmentChart();
}

// Utility Functions
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function updateDashboardStats() {
    // Update dashboard statistics
    const totalPatients = patients.length;
    const totalStaff = staff.length;
    const todayAppointments = appointments.filter(apt => 
        apt.date === new Date().toISOString().split('T')[0]
    ).length;
    
    // Update DOM elements
    const patientCount = document.querySelector('.stat-card:nth-child(1) h3');
    const staffCount = document.querySelector('.stat-card:nth-child(2) h3');
    const appointmentCount = document.querySelector('.stat-card:nth-child(3) h3');
    
    if (patientCount) patientCount.textContent = totalPatients;
    if (staffCount) staffCount.textContent = totalStaff;
    if (appointmentCount) appointmentCount.textContent = todayAppointments;
}

// Sample Data Loading
function loadSampleData() {
    if (patients.length === 0) {
        patients = [
            {
                id: 'P001',
                name: 'John Doe',
                age: 35,
                gender: 'male',
                contact: '+1-555-0123',
                address: '123 Main St, City, State',
                bloodType: 'O+',
                emergencyContact: '+1-555-0124',
                status: 'admitted',
                lastVisit: '2024-01-15'
            }
        ];
        saveToLocalStorage('patients', patients);
    }

    if (staff.length === 0) {
        staff = [
            {
                id: 'S001',
                name: 'Dr. Sarah Wilson',
                role: 'Doctor',
                department: 'Cardiology',
                contact: '+1-555-0124',
                schedule: '9 AM - 5 PM'
            }
        ];
        saveToLocalStorage('staff', staff);
    }

    if (inventory.length === 0) {
        inventory = [
            {
                code: 'MED001',
                name: 'Paracetamol',
                category: 'medicines',
                stock: 500,
                price: 0.50,
                expiryDate: '2025-06-15'
            }
        ];
        saveToLocalStorage('inventory', inventory);
    }
}

// Additional utility functions for other modules
function viewInvoice(invoiceId) {
    showNotification(`Viewing invoice: ${invoiceId}`, 'info');
}

function printInvoice(invoiceId) {
    showNotification(`Printing invoice: ${invoiceId}`, 'info');
}

function viewLabResult(testId) {
    showNotification(`Viewing lab result: ${testId}`, 'info');
}

function updateLabResult(testId) {
    showNotification(`Updating lab result: ${testId}`, 'info');
}

function generateReport() {
    showNotification('Generating comprehensive report...', 'success');
}

// Export functions for global access
window.showModal = showModal;
window.hideModal = hideModal;
window.viewPatient = viewPatient;
window.editPatient = editPatient;
window.deletePatient = deletePatient;
window.viewStaff = viewStaff;
window.editStaff = editStaff;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.editInventory = editInventory;
window.viewInvoice = viewInvoice;
window.printInvoice = printInvoice;
window.viewLabResult = viewLabResult;
window.updateLabResult = updateLabResult;
window.generateReport = generateReport;