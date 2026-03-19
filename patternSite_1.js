const links = document.querySelectorAll('.sub-banner a');
links.forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('link-selected');
    }
});

const tbody = document.querySelector('tbody');
const selectAllCheckbox = document.getElementById('select-all');
const addModal = document.getElementById('add-student-form');
const openAddBtn = document.querySelector('.add');
const deleteModal = document.getElementById('delete-popup');
const deleteMessage = document.querySelector('.deleteMessage');
const confirmDelBtn = document.getElementById('confirm-delete-btn');

let rowToDelete = null;
let editingRow = null;


const ROWS_PER_PAGE = 2;
let currentPage = 1;



function formatDateForTable(dateStr) {
    let parts = dateStr.split('-');
    return parts[2] + '.' + parts[1] + '.' + parts[0];
}

function formatDateForInput(dateStr) {
    let parts = dateStr.split('.');
    return parts[2] + '-' + parts[1] + '-' + parts[0];
}

function showError(id, msg) {
    const input = document.getElementById(id);
    const error = document.getElementById(id + '-error');
    if (input) input.classList.add('input-error');
    if (error) error.textContent = msg;
}

function clearError(id) {
    const input = document.getElementById(id);
    const error = document.getElementById(id + '-error');
    if (input) input.classList.remove('input-error');
    if (error) error.textContent = '';
}

function formatName(value) {
    value = value.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ '-]/g, '');
    value = value.replace(/^[-'\s]+/, ''); 
    value = value.replace(/ +/g, '-');
     value = value.replace(/'-/g, '-');
      value = value.replace(/-'/g, '-');
    value = value.replace(/-{2,}/g, '-');
    return value.split('-').map(word =>
        word.length === 0 ? '' : word[0].toUpperCase() + word.slice(1).toLowerCase()
    ).join('-');
}


function formatGroupName(value) {
    value = value.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9 -]/g, '');
    value = value.replace(/^[-\s]+/, ''); 
    value = value.replace(/ +/g, '-');
    value = value.replace(/^[-0-9]+/, '');
    value = value.replace(/-{2,}/g, '-');

    const parts = value.split('-');
    const letters = parts[0].replace(/[0-9]/g, '').toUpperCase();

    let numbers = '';
    if (parts[1] !== undefined) {
        numbers = parts[1].replace(/[^0-9]/g, '').slice(0, 3);
    }

    if (numbers !== '') return letters + '-' + numbers;
    if (value.includes('-')) return letters + '-';
    return letters;
}


function getVisibleCheckboxes() {
      if (!tbody) 
        return [];
    let visible = []; 
    let allCheckboxes = tbody.querySelectorAll('.student-checkbox'); 
    
    allCheckboxes.forEach(cb => {
        let row = cb.closest('tr'); 
        if (row.style.display !== 'none') { 
            visible.push(cb); 
        }
    });
    
    return visible; 
}

function renderPage(page) {
    if (!tbody) return;
    const rows = [...tbody.querySelectorAll('tr')];
    const total = Math.ceil(rows.length / ROWS_PER_PAGE) || 1;

    if (page < 1) page = 1;
    if (page > total) page = total;
    currentPage = page;

    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;

    rows.forEach((row, i) => {
        row.style.display = (i >= start && i < end) ? '' : 'none';
    });

    updatePagination(total);
    
    if (selectAllCheckbox && tbody) {
        const visibleCheckboxes = getVisibleCheckboxes();
        selectAllCheckbox.checked = visibleCheckboxes.length > 0 && visibleCheckboxes.every(cb => cb.checked);
    }

}

function updatePagination(total) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    const prevBtn = pagination.querySelector('.prev');
    const nextBtn = pagination.querySelector('.next');


    pagination.querySelectorAll('.page-btn.extra').forEach(b => b.remove());

 
const staticBtns = [...pagination.querySelectorAll('.page-btn.static')];
for (let i = staticBtns.length + 1; i <= total; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.add('page-btn', 'extra');
    pagination.insertBefore(btn, nextBtn);
}

 
    [...pagination.querySelectorAll('.page-btn')].forEach((btn, i) => {
        btn.textContent = i + 1;
        btn.classList.toggle('active-page', i + 1 === currentPage);
        btn.classList.toggle('disabled', i + 1 > total);
        btn.disabled = i + 1 > total;
        btn.onclick = () => renderPage(i + 1);
    });

 
    prevBtn.classList.toggle('disabled', currentPage === 1);
    prevBtn.disabled = currentPage === 1;
    nextBtn.classList.toggle('disabled', currentPage === total);
    nextBtn.disabled = currentPage === total;
}


function generateStudentId() {
    return 'STU-' + Date.now();
}
 
// 2. Функція збереження студента в localStorage
function saveStudentToStorage(student) {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const existingIndex = students.findIndex(s => s.id === student.id);
    if (existingIndex !== -1) {
        students[existingIndex] = student; 
    } else {
        students.push(student);           
    }
    localStorage.setItem('students', JSON.stringify(students));
}
 

function deleteStudentFromStorage(studentId) {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const updated = students.filter(s => s.id !== studentId);
    localStorage.setItem('students', JSON.stringify(updated));
}
 





if (tbody) {
    const prevBtn = document.querySelector('.pagination .prev');
    const nextBtn = document.querySelector('.pagination .next');

    prevBtn.addEventListener('click', () => renderPage(currentPage - 1));
    nextBtn.addEventListener('click', () => renderPage(currentPage + 1));

    renderPage(1);
}



if (tbody && selectAllCheckbox) {

selectAllCheckbox.addEventListener('change', function(e) {
    let visibleCheckboxes = getVisibleCheckboxes(); 
    
    visibleCheckboxes.forEach(cb => {
        cb.checked = e.target.checked;
    });
});


tbody.addEventListener('change', function(e) {
    if (e.target.classList.contains('student-checkbox')) {
        let visibleCheckboxes = getVisibleCheckboxes(); 
        
        let checkedCount = 0;
        visibleCheckboxes.forEach(cb => {
            if (cb.checked === true) {
                checkedCount++;
            }
        });

        if (checkedCount === visibleCheckboxes.length) {
            selectAllCheckbox.checked = true;  
        } else {
            selectAllCheckbox.checked = false; 
        }
    }
});

    tbody.addEventListener('click', function(e) {
        if (!addModal) return;
        const row = e.target.closest('tr');
        if (!row) return;

        if (e.target.classList.contains('edit')) {
            editingRow = row;
            document.getElementById('group').value = row.querySelector('td:nth-child(2)').textContent;
            const fullName = row.querySelector('td:nth-child(3)').textContent;
            const spaceIndex = fullName.indexOf(' ');
            document.getElementById('firstname').value = fullName.substring(0, spaceIndex);
            document.getElementById('lastname').value = fullName.substring(spaceIndex + 1);
            const genderShort = row.querySelector('td:nth-child(4)').textContent;
            document.getElementById('gender').value = genderShort === 'M' ? 'Male' : 'Female';
            const birthdayText = row.querySelector('td:nth-child(5)').textContent;
            document.getElementById('birthday').value = formatDateForInput(birthdayText);
            addModal.querySelector('.modal-header h2').textContent = 'Edit student';
            addModal.querySelector('button[type="submit"]').textContent = 'Save';
            addModal.style.display = 'flex';
        }

        if (e.target.classList.contains('delete')) {
            rowToDelete = [row];
            const name = row.querySelector('td:nth-child(3)').textContent;
            if (deleteMessage) deleteMessage.textContent = 'Delete user ' + name + '?';
            if (deleteModal) deleteModal.style.display = 'flex';
        }
    });
}


if (addModal) {
    const modalTitle = addModal.querySelector('.modal-header h2');
    const submitBtn = addModal.querySelector('button[type="submit"]');

    const birthdayInput = document.getElementById('birthday');
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 90, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    birthdayInput.min = minDate.toISOString().split('T')[0];
    birthdayInput.max = maxDate.toISOString().split('T')[0];

    const nameRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄ]([a-zA-Zа-яА-ЯіІїЇєЄ'-]{0,18}[a-zA-Zа-яА-ЯіІїЇєЄ])?$/;

     const groupRegex = /^[a-zA-Zа-яА-ЯіІїЇєЄ]+-\d{1,3}$/;


    function loadCustomGroups() {
        const select = document.getElementById('group');
        if (!select) 
            return;
        const saved = JSON.parse(localStorage.getItem('customGroups') || '[]'); 
        saved.forEach(name => addGroupOption(name));
    }

 
    function addGroupOption(name) {
    const select = document.getElementById('group');
    const exists = [...select.options].some(o => o.value === name);
    if (exists) return;
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    const otherGroup = select.querySelector('optgroup[label="OTHER*"]');
    otherGroup.insertBefore(option, otherGroup.querySelector('option[value="custom"]'));
}

    function saveCustomGroup(name) {
        const saved = JSON.parse(localStorage.getItem('customGroups') || '[]');
        if (!saved.includes(name)) {
            saved.push(name);
            localStorage.setItem('customGroups', JSON.stringify(saved));
        }
    }

    loadCustomGroups();


    document.getElementById('group').addEventListener('change', function() {
        const customInput = document.getElementById('custom-group');
        if (this.value === 'custom') {
            customInput.style.display = 'block';
            customInput.required = true;
        } else {
            customInput.style.display = 'none';
            customInput.required = false;
            customInput.value = '';
            clearError('group');
        }
    });


   const formFields = ['group', 'firstname', 'lastname', 'gender', 'birthday'];

    for (const id of formFields) {
      const el = document.getElementById(id);
      if (el) 
        el.addEventListener('input', () => clearError(id));
}

    document.getElementById('custom-group').addEventListener('input', function() {
        const pos = this.selectionStart;
        this.value = formatGroupName(this.value);
        this.setSelectionRange(pos, pos);
    });

    document.getElementById('firstname').addEventListener('input', function() {
        const pos = this.selectionStart;
        this.value = formatName(this.value);
        this.setSelectionRange(pos, pos);
    });

    document.getElementById('lastname').addEventListener('input', function() {
        const pos = this.selectionStart;
        this.value = formatName(this.value);
        this.setSelectionRange(pos, pos);
    });

    function closeAddModal() {
        addModal.style.display = 'none';
        addModal.reset();
        editingRow = null;
        modalTitle.textContent = 'Add student';
        submitBtn.textContent = 'Add';
    const customInput = document.getElementById('custom-group');
    if (customInput) {
        customInput.style.display = 'none';
        customInput.required = false;
    }
    }

    if (openAddBtn) {
        openAddBtn.addEventListener('click', function() {
            closeAddModal();
            addModal.style.display = 'flex';
        });
    }

    document.querySelectorAll('#close-add-student-btn, .cancel').forEach(btn => {
        btn.addEventListener('click', closeAddModal);
    });

    addModal.addEventListener('submit', function(e) {
        e.preventDefault();

        const groupSelect = document.getElementById('group').value;
        const customGroup = document.getElementById('custom-group').value.trim().toUpperCase();
        const group = groupSelect === 'custom' ? customGroup : groupSelect;
       

        const firstName = document.getElementById('firstname').value.trim();
        const lastName = document.getElementById('lastname').value.trim();
        const gender = document.getElementById('gender').value;
        const birthday = document.getElementById('birthday').value;

        let hasError = false;

        if (!groupSelect) {
            showError('group', 'Select or enter a group');
            hasError = true;
        } else if (groupSelect === 'custom' && !customGroup) {
            showError('group', 'Enter group name');
            hasError = true;
        } else if (groupSelect === 'custom' && !groupRegex.test(customGroup)) {
            showError('group', 'Only letters, numbers, (2-10 chars)');
            hasError = true;
        }


        if (!firstName) {
            showError('firstname', 'Enter first name');
            hasError = true;
        } else if (!nameRegex.test(firstName)) {
            showError('firstname', 'Only letters allowed (1-20)'); 
            hasError = true;
        }
        if (!lastName) {
            showError('lastname', 'Enter last name'); 
            hasError = true;
        } else if (!nameRegex.test(lastName)) {
            showError('lastname', 'Only letters allowed (1-20)'); 
            hasError = true;
        }
        if (!gender) {
             showError('gender', 'Select a gender'); 
            hasError = true; 
        }
        if (!birthday) {
            showError('birthday', 'Select a birthday'); 
            hasError = true;
        } else {
            const bDate = new Date(birthday);
            if (bDate < minDate || bDate > maxDate) {
                showError('birthday', 'Age must be between 10 and 90 years');
                 hasError = true;
            }
        }

        if (hasError)
             return;


        if (groupSelect === 'custom') {
            saveCustomGroup(customGroup);
            addGroupOption(customGroup);
        }

        const shortGender = gender === 'Male' ? 'M' : 'F';
        const formattedDate = formatDateForTable(birthday);

        if (editingRow !== null) {
             if (!editingRow.dataset.studentId) {
        editingRow.dataset.studentId = generateStudentId();
    }
            const existingId = editingRow.dataset.studentId;
            editingRow.querySelector('td:nth-child(2)').textContent = group;
            editingRow.querySelector('td:nth-child(3)').textContent = firstName + ' ' + lastName;
            editingRow.querySelector('td:nth-child(4)').textContent = shortGender;
            editingRow.querySelector('td:nth-child(5)').textContent = formattedDate;
           
        const studentPayload = {
            id:        existingId,
            group:     group,
            firstName: firstName,
            lastName:  lastName,
            gender:    gender,          
            birthday:  birthday,       
            status:    'active'
        };
 
        saveStudentToStorage(studentPayload);
        console.log('Студента оновлено :', JSON.stringify(studentPayload, null, 2));
             renderPage(currentPage); 
        } else {
            const newId = generateStudentId();
            const newRow = document.createElement('tr');
            newRow.dataset.studentId = newId;   
           
           
            newRow.innerHTML = `
                <td><input type="checkbox" class="student-checkbox"></td>
                <td>${group}</td>
                <td>${firstName} ${lastName}</td>
                <td>${shortGender}</td>
                <td>${formattedDate}</td>
                <td><div class="status-indicator active"></div></td>
                <td>
                    <button class="edit" title="Edit"></button>
                    <button class="delete" title="Delete"></button>
                </td> `;
            tbody.appendChild(newRow);
            const studentPayload = {
            id:        newId,
            group:     group,
            firstName: firstName,
            lastName:  lastName,
            gender:    gender,          
            birthday:  birthday,        
            status:    'active'
        };
 
        saveStudentToStorage(studentPayload);
        console.log('Студента додано :', JSON.stringify(studentPayload, null, 2));
            const newTotal = Math.ceil(tbody.children.length / ROWS_PER_PAGE);
            renderPage(newTotal); 
            // renderPage(currentPage);
        }

        closeAddModal();
    });
}


if (confirmDelBtn) {
    function closeDeleteModal() {
        if (deleteModal) 
            deleteModal.style.display = 'none';
        rowToDelete = null;
    }

    document.querySelectorAll('#close-delete-btn, #cancel-delete-btn').forEach(btn => {
        btn.addEventListener('click', closeDeleteModal);
    });

    confirmDelBtn.addEventListener('click', function() {
    if (rowToDelete !== null) {
        rowToDelete.forEach(r => {
            const id = r.dataset.studentId;
            if (id) {
                deleteStudentFromStorage(id);
                console.log(' Студента видалено id:', id);
            }
            r.remove();
        });
        renderPage(currentPage);
    }
    if (tbody && tbody.children.length === 0 && selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    closeDeleteModal();
});
}



if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('[SW] Registered, scope:', reg.scope))
            .catch(err => console.error('[SW] Registration failed:', err));
    });
}
 












