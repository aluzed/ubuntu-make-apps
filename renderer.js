// Application state
let currentUser = '';
let editingAppId = null;
let selectedExecPath = null;
let selectedIconPath = null;

// DOM elements
const viewList = document.getElementById('viewList');
const viewForm = document.getElementById('viewForm');
const appList = document.getElementById('appList');
const appForm = document.getElementById('appForm');
const btnAdd = document.getElementById('btnAdd');
const btnSettings = document.getElementById('btnSettings');
const btnBack = document.getElementById('btnBack');
const btnSelectExec = document.getElementById('btnSelectExec');
const btnSelectIcon = document.getElementById('btnSelectIcon');
const appTypeSelect = document.getElementById('appType');
const labelExec = document.getElementById('labelExec');
const formTitle = document.getElementById('formTitle');
const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
const patternsList = document.getElementById('patternsList');
const newPatternInput = document.getElementById('newPatternInput');
const btnAddPattern = document.getElementById('btnAddPattern');

// Initialization
async function init() {
  currentUser = await window.electronAPI.getUsername();
  document.getElementById('currentUser').value = currentUser;
  await loadApplications();
}

// Load applications list
async function loadApplications() {
  const apps = await window.electronAPI.getApplications();
  appList.innerHTML = '';

  if (apps.length === 0) {
    appList.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-inbox" style="font-size: 3rem;"></i>
        <p class="mt-3">No applications. Click "Add" to get started.</p>
      </div>
    `;
    return;
  }

  apps.forEach(app => {
    const item = createAppListItem(app);
    appList.appendChild(item);
  });
}

// Create list item
function createAppListItem(app) {
  const div = document.createElement('div');
  div.className = 'list-group-item d-flex align-items-center justify-content-between';

  const leftDiv = document.createElement('div');
  leftDiv.className = 'd-flex align-items-center';

  // Icon
  const icon = document.createElement('img');
  icon.src = app.icon && app.icon.startsWith('/') ? `file://${app.icon}` : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect width="48" height="48" fill="%23ccc"/%3E%3C/svg%3E';
  icon.className = 'app-icon me-3';
  icon.width = 48;
  icon.height = 48;
  icon.onerror = function() {
    this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect width="48" height="48" fill="%23ccc"/%3E%3C/svg%3E';
  };

  const textDiv = document.createElement('div');
  const name = document.createElement('strong');
  name.textContent = app.name;
  const type = document.createElement('small');
  type.className = 'd-block text-muted';
  type.textContent = `${app.type} • ${app.categories || 'No category'}`;

  textDiv.appendChild(name);
  textDiv.appendChild(type);

  leftDiv.appendChild(icon);
  leftDiv.appendChild(textDiv);

  // Buttons
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'btn-group';

  const btnEdit = document.createElement('button');
  btnEdit.className = 'btn btn-sm btn-outline-primary';
  btnEdit.innerHTML = '<i class="bi bi-pencil"></i>';
  btnEdit.title = 'Edit this application';
  btnEdit.onclick = () => editApplication(app.id);

  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn btn-sm btn-outline-danger';
  btnDelete.innerHTML = '<i class="bi bi-trash"></i>';
  btnDelete.title = 'Delete this application';
  btnDelete.onclick = () => deleteApplication(app.id, app.name);

  buttonsDiv.appendChild(btnEdit);
  buttonsDiv.appendChild(btnDelete);

  div.appendChild(leftDiv);
  div.appendChild(buttonsDiv);

  return div;
}

// Show form (add mode)
function showForm() {
  editingAppId = null;
  formTitle.textContent = 'New Application';
  appForm.reset();
  document.getElementById('appId').value = '';
  selectedExecPath = null;
  selectedIconPath = null;
  document.getElementById('iconPreview').innerHTML = '';

  viewList.style.display = 'none';
  viewForm.style.display = 'block';
}

// Show list
function showList() {
  viewForm.style.display = 'none';
  viewList.style.display = 'block';
  loadApplications();
}

// Edit application
async function editApplication(id) {
  editingAppId = id;
  formTitle.textContent = 'Edit Application';

  const app = await window.electronAPI.getApplication(id);
  if (!app) {
    Swal.fire('Error', 'Application not found', 'error');
    return;
  }

  document.getElementById('appId').value = id;
  document.getElementById('appName').value = app.name;
  document.getElementById('appExec').value = app.exec;
  document.getElementById('appIcon').value = app.icon;
  document.getElementById('appType').value = app.type || 'Application';
  document.getElementById('appCategories').value = app.categories || '';

  // Icon preview
  if (app.icon) {
    const iconPreview = document.getElementById('iconPreview');
    iconPreview.innerHTML = `<img src="file://${app.icon}" class="app-icon-preview" width="64" height="64">`;
  }

  viewList.style.display = 'none';
  viewForm.style.display = 'block';
}

// Delete application
async function deleteApplication(id, name) {
  const result = await Swal.fire({
    title: 'Confirm deletion',
    text: `Do you really want to delete "${name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    const response = await window.electronAPI.deleteApplication(id);
    if (response.success) {
      Swal.fire('Deleted!', 'The application has been deleted.', 'success');
      loadApplications();
    } else {
      Swal.fire('Error', response.error, 'error');
    }
  }
}

// Select executable file/folder
btnSelectExec.addEventListener('click', async () => {
  const type = appTypeSelect.value;
  let path;

  if (type === 'Directory') {
    path = await window.electronAPI.selectDirectory();
  } else {
    path = await window.electronAPI.selectAppImage();
  }

  if (path) {
    selectedExecPath = path;
    document.getElementById('appExec').value = path;
    document.getElementById('appExecSource').value = path;
  }
});

// Select icon
btnSelectIcon.addEventListener('click', async () => {
  const path = await window.electronAPI.selectIcon();
  if (path) {
    selectedIconPath = path;
    document.getElementById('appIcon').value = path;
    document.getElementById('appIconSource').value = path;

    // Preview
    const iconPreview = document.getElementById('iconPreview');
    iconPreview.innerHTML = `<img src="file://${path}" class="app-icon-preview" width="64" height="64">`;
  }
});

// Change label based on type
appTypeSelect.addEventListener('change', () => {
  const type = appTypeSelect.value;
  if (type === 'Directory') {
    labelExec.textContent = 'Folder';
    btnSelectExec.innerHTML = '<i class="bi bi-folder2-open"></i> Browse';
  } else {
    labelExec.textContent = 'AppImage File';
    btnSelectExec.innerHTML = '<i class="bi bi-file-earmark"></i> Browse';
  }

  // Reset selection
  document.getElementById('appExec').value = '';
  selectedExecPath = null;
});

// Submit form
appForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const appId = document.getElementById('appId').value;
  const name = document.getElementById('appName').value;
  const type = appTypeSelect.value;
  const categories = document.getElementById('appCategories').value;

  let execPath = document.getElementById('appExec').value;
  let iconPath = document.getElementById('appIcon').value;

  // If new file selected (not in edit mode or file changed)
  if (selectedExecPath && type === 'Application') {
    // Ask to copy or move
    const result = await Swal.fire({
      title: 'AppImage File',
      text: 'Do you want to copy or move the file?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Copy',
      denyButtonText: 'Move',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed || result.isDenied) {
      const action = result.isConfirmed ? 'copy' : 'move';
      const response = await window.electronAPI.processAppImage(selectedExecPath, action, name);

      if (response.success) {
        execPath = response.path;
      } else {
        Swal.fire('Error', response.error, 'error');
        return;
      }
    } else {
      return; // Cancelled
    }
  }

  // Process icon
  if (selectedIconPath && selectedIconPath !== iconPath) {
    const response = await window.electronAPI.processIcon(selectedIconPath, name);
    if (response.success) {
      iconPath = response.path;
    } else {
      Swal.fire('Error', response.error, 'error');
      return;
    }
  }

  // Save .desktop file
  const desktopData = {
    id: appId || null,
    name,
    exec: execPath,
    icon: iconPath,
    type,
    categories
  };

  const response = await window.electronAPI.saveDesktopFile(desktopData);

  if (response.success) {
    Swal.fire({
      title: 'Success!',
      text: 'The application has been saved.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    showList();
  } else {
    Swal.fire('Error', response.error, 'error');
  }
});

// Event listeners
btnAdd.addEventListener('click', showForm);
btnBack.addEventListener('click', showList);

// Settings modal
btnSettings.addEventListener('click', async () => {
  await loadIgnorePatterns();
  settingsModal.show();
});

// Add pattern
btnAddPattern.addEventListener('click', async () => {
  const pattern = newPatternInput.value.trim();
  if (!pattern) {
    Swal.fire('Error', 'Please enter a pattern', 'error');
    return;
  }

  await window.electronAPI.addIgnorePattern(pattern);
  newPatternInput.value = '';
  await loadIgnorePatterns();
  Swal.fire('Success', 'Pattern added successfully', 'success');
});

// Load on startup
init();

// Settings functions

// Load ignore patterns into the modal
async function loadIgnorePatterns() {
  const patterns = await window.electronAPI.getIgnorePatterns();
  patternsList.innerHTML = '';

  if (patterns.length === 0) {
    patternsList.innerHTML = `
      <div class="text-center text-muted py-3">
        <i class="bi bi-inbox" style="font-size: 2rem;"></i>
        <p class="mt-2 mb-0">No ignore patterns configured</p>
      </div>
    `;
    return;
  }

  patterns.forEach(pattern => {
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    item.innerHTML = `
      <span><code>${pattern}</code></span>
      <button class="btn btn-sm btn-outline-danger" data-pattern="${pattern}">
        <i class="bi bi-trash"></i> Remove
      </button>
    `;

    const btnRemove = item.querySelector('button');
    btnRemove.addEventListener('click', async () => {
      const result = await Swal.fire({
        title: 'Confirm removal',
        text: `Remove pattern "${pattern}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await window.electronAPI.removeIgnorePattern(pattern);
        await loadIgnorePatterns();
        Swal.fire('Removed!', 'Pattern has been removed.', 'success');
      }
    });

    patternsList.appendChild(item);
  });
}
