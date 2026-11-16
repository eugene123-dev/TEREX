const schoolDetails = {
  Engineering: {
    name: "Engineering",
    label: "School of Engineering",
    dot: "dot-engineering",
    cover: "cover-engineering",
    symbol: '<path d="M4 20h16M6 17l3-10 3 6 3-9 3 13M8 17h8"/>',
  },
  Medicine: {
    name: "Medicine",
    label: "School of Medicine",
    dot: "dot-medicine",
    cover: "cover-medicine",
    symbol: '<path d="M12 21s-8-4.4-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.6-8 11-8 11Z"/><path d="M8.5 12h2l1.2-2.2 1.4 4.4 1.1-2.2h1.3"/>',
  },
  Business: {
    name: "Business & Economics",
    label: "School of Business & Economics",
    dot: "dot-business",
    cover: "cover-business",
    symbol: '<path d="M4 20V9m5 11V4m5 16v-7m5 7V7M2 20h20"/>',
  },
  Arts: {
    name: "Arts & Social Sciences",
    label: "School of Arts & Social Sciences",
    dot: "dot-arts",
    cover: "cover-arts",
    symbol: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h6"/>',
  },
  ScienceAerospace: {
    name: "Science & Aerospace",
    label: "School of Science & Aerospace",
    dot: "dot-science",
    cover: "cover-science",
    symbol: '<path d="M12 3 14 9l6 2-6 2-2 7-2-7-6-2 6-2 2-6Z"/><circle cx="18" cy="5" r="1"/>',
  },
  Education: {
    name: "Education",
    label: "School of Education",
    dot: "dot-education",
    cover: "cover-education",
    symbol: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M9 7h6m-6 4h6"/>',
  },
};

const documents = [
  { id: "doc-1", title: "Foundations of Structural Design", subject: "Structural Engineering", school: "Engineering", pages: 112, progress: 34, opened: "2 hours ago" },
  { id: "doc-2", title: "Human Anatomy: The Essentials", subject: "Human Anatomy", school: "Medicine", pages: 248, progress: 62, opened: "Yesterday" },
  { id: "doc-3", title: "Principles of Microeconomics", subject: "Economics", school: "Business", pages: 86, progress: 48, opened: "Yesterday" },
  { id: "doc-4", title: "African History & Society", subject: "African Studies", school: "Arts", pages: 154, progress: 35, opened: "2 days ago" },
  { id: "doc-5", title: "Circuit Analysis II", subject: "Electrical Engineering", school: "Engineering", pages: 96, progress: 76, opened: "3 days ago" },
  { id: "doc-6", title: "Pharmacology: Core Concepts", subject: "Pharmacology", school: "Medicine", pages: 203, progress: 28, opened: "4 days ago" },
  { id: "doc-7", title: "Thermodynamics Study Notes", subject: "Mechanical Engineering", school: "Engineering", pages: 74, progress: 91, opened: "5 days ago" },
  { id: "doc-8", title: "Business Statistics: A Guide", subject: "Business Studies", school: "Business", pages: 128, progress: 53, opened: "Last week" },
  { id: "doc-9", title: "Introduction to Aerospace Science", subject: "Aerospace Science", school: "ScienceAerospace", pages: 104, progress: 58, opened: "3 days ago" },
  { id: "doc-10", title: "Foundations of Education", subject: "Education Studies", school: "Education", pages: 92, progress: 42, opened: "This week" },
];

const storageKeys = {
  theme: "night-library-theme",
  progress: "night-library-progress",
  reviews: "night-library-reviews",
};
const accessCounts = [3, 5, 2, 7, 4, 2, 1];
const accessDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const grid = document.querySelector("#document-grid");
const searchInput = document.querySelector("#search-input");
const searchBox = document.querySelector(".search-box");
const emptyState = document.querySelector("#empty-state");
const toast = document.querySelector("#toast");
const uploadDialog = document.querySelector("#upload-dialog");
const pdfInput = document.querySelector("#pdf-input");
const dropZone = document.querySelector("#drop-zone");
const selectedFilesElement = document.querySelector("#selected-files");
const confirmUpload = document.querySelector("#confirm-upload");
const reviewDialog = document.querySelector("#review-dialog");
const reviewForm = document.querySelector("#review-form");
const reviewDocument = document.querySelector("#review-document");
const reviewComment = document.querySelector("#review-comment");
const submitReview = document.querySelector("#submit-review");

let activeSchool = "all";
let showAllDocuments = false;
let selectedFiles = [];
let nextDocumentId = 1;
let toastTimeout;
let selectedRating = 0;
let editingReviewId = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 3000);
}

function readSavedProgress() {
  try {
    const savedProgress = JSON.parse(localStorage.getItem(storageKeys.progress) || "{}");
    if (!savedProgress || typeof savedProgress !== "object" || Array.isArray(savedProgress)) {
      throw new TypeError("Saved reading progress must be an object.");
    }
    return savedProgress;
  } catch (error) {
    console.warn("Could not read saved reading progress.", error);
    return {};
  }
}

function readSavedReviews() {
  try {
    const savedReviews = JSON.parse(localStorage.getItem(storageKeys.reviews) || "{}");
    if (!savedReviews || typeof savedReviews !== "object" || Array.isArray(savedReviews)) {
      throw new TypeError("Saved PDF reviews must be an object.");
    }
    return Object.fromEntries(Object.entries(savedReviews).filter(([, review]) => (
      review
      && Number.isInteger(review.rating)
      && review.rating >= 1
      && review.rating <= 5
      && typeof review.comment === "string"
      && typeof review.createdAt === "string"
    )));
  } catch (error) {
    console.warn("Could not read saved PDF reviews.", error);
    return {};
  }
}

const savedProgress = readSavedProgress();
const reviews = readSavedReviews();
documents.forEach((item) => {
  const savedValue = savedProgress[item.id];
  if (Number.isInteger(savedValue) && savedValue >= 0 && savedValue <= 100) {
    item.progress = savedValue;
  }
});

function applyTheme(theme) {
  const lightMode = theme === "light";
  document.body.classList.toggle("light-mode", lightMode);
  document.querySelector("#theme-toggle").setAttribute(
    "aria-label",
    lightMode ? "Switch to dark mode" : "Switch to light mode",
  );
}

try {
  applyTheme(localStorage.getItem(storageKeys.theme) || "dark");
} catch (error) {
  console.warn("Could not read the saved theme preference.", error);
  applyTheme("dark");
}

function updateCounts(items = documents) {
  const count = String(items.length).padStart(2, "0");
  document.querySelector("#document-count").textContent = count;
  document.querySelector("#sidebar-count").textContent = count;
  document.querySelectorAll(".school-total").forEach((counter) => {
    const school = counter.closest(".school-link").dataset.school;
    const schoolCount = school === "all" ? documents.length : documents.filter((item) => item.school === school).length;
    counter.textContent = String(schoolCount).padStart(2, "0");
  });
}

function updateProgressMetrics() {
  const overallProgress = documents.length
    ? Math.round(documents.reduce((total, item) => total + item.progress, 0) / documents.length)
    : 0;
  document.querySelector("#overall-progress").textContent = String(overallProgress);
  document.querySelector("#overall-progress-bar").style.width = `${overallProgress}%`;
  document.querySelector("#overall-progress-track").setAttribute("aria-valuenow", String(overallProgress));

  document.querySelectorAll("[data-school-focus]").forEach((row) => {
    const school = row.dataset.schoolFocus;
    const schoolDocuments = documents.filter((item) => item.school === school);
    const progress = schoolDocuments.length
      ? Math.round(schoolDocuments.reduce((total, item) => total + item.progress, 0) / schoolDocuments.length)
      : 0;
    row.querySelector(".focus-name strong").textContent = `${progress}%`;
    row.querySelector(".focus-track span").style.width = `${progress}%`;
    row.querySelector(".focus-track").setAttribute("aria-valuenow", String(progress));
  });
}

function renderAccessChart() {
  const scale = Math.max(8, ...accessCounts);
  document.querySelectorAll("[data-chart-day]").forEach((column) => {
    const dayIndex = Number(column.dataset.chartDay);
    const count = accessCounts[dayIndex];
    const bar = column.querySelector(".bar");
    const height = Math.min(100, (count / scale) * 100);
    bar.style.setProperty("--bar-height", `${height}%`);
    bar.setAttribute("aria-label", `${accessDays[dayIndex]}: ${count} opens`);
    bar.innerHTML = `<span class="bar-tooltip">${count} ${count === 1 ? "open" : "opens"}</span>`;
  });
  const total = accessCounts.reduce((sum, count) => sum + count, 0);
  const yLabels = [scale, Math.round(scale * 0.75), Math.round(scale * 0.5), Math.round(scale * 0.25), 0];
  document.querySelectorAll(".chart-y-labels span").forEach((label, index) => {
    label.textContent = String(yLabels[index]);
  });
  document.querySelector("#weekly-access-total").textContent = String(total);
  document.querySelector("#access-chart").setAttribute(
    "aria-label",
    `PDF access over the last 7 days: ${accessCounts.map((count, index) => `${accessDays[index]} ${count}`).join(", ")}`,
  );
}

function recordAccess() {
  const weekday = new Date().getDay();
  const dayIndex = weekday === 0 ? 6 : weekday - 1;
  accessCounts[dayIndex] += 1;
  renderAccessChart();
}

function renderDocument(item) {
  const school = schoolDetails[item.school];
  const review = reviews[item.id];
  const card = document.createElement("article");
  card.className = "document-card";
  card.innerHTML = `
    <div class="doc-cover ${school.cover}">
      <span class="pdf-badge">PDF</span>
      <span class="cover-symbol" aria-hidden="true"><svg viewBox="0 0 24 24">${school.symbol}</svg></span>
    </div>
    <div class="doc-info">
      <div class="doc-subject"><span class="school-dot ${school.dot}"></span>${school.name}</div>
      <h3 class="doc-title" title="${escapeAttribute(item.title)}">${escapeHtml(item.title)}</h3>
      <div class="doc-meta"><span>${escapeHtml(item.subject)}</span><span>${item.pages === "—" ? "PDF file" : `${item.pages} pages`}</span></div>
      <div class="doc-progress-top"><span>Reading progress</span><strong>${item.progress}%</strong></div>
      <div class="doc-progress-track" role="progressbar" aria-label="Progress on ${escapeAttribute(item.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.progress}"><span style="width:${item.progress}%"></span></div>
      <div class="doc-review-row">${review
        ? `<span class="doc-rating" aria-label="${review.rating} out of 5 stars">★ ${review.rating} <span>· 1 review</span></span>`
        : '<span class="doc-no-rating">No reviews yet</span>'}
        <button class="doc-review-button" type="button" data-review-document="${escapeAttribute(item.id)}">${review ? "Edit review" : "Review PDF"}</button>
      </div>
      <div class="doc-footer"><span class="last-opened">${escapeHtml(item.opened)}</span><button class="continue-button" type="button" data-document-id="${item.id}">${item.progress >= 100 ? "Completed" : "Continue"}</button></div>
    </div>`;
  card.querySelector(".continue-button").addEventListener("click", () => continueDocument(item));
  card.querySelector(".doc-review-button").addEventListener("click", () => openReviewDialog(item.id));
  return card;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function renderDocuments() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const matchingDocuments = documents.filter((item) => {
    const matchesSchool = activeSchool === "all" || item.school === activeSchool;
    const schoolName = schoolDetails[item.school].name.toLocaleLowerCase();
    const matchesSearch = !query || [item.title, item.subject, schoolName].some((value) => value.toLocaleLowerCase().includes(query));
    return matchesSchool && matchesSearch;
  });
  const displayedDocuments = showAllDocuments ? matchingDocuments : matchingDocuments.slice(0, 4);
  grid.replaceChildren(...displayedDocuments.map(renderDocument));
  emptyState.hidden = matchingDocuments.length > 0;
  document.querySelector("#recent-count").textContent = String(matchingDocuments.length).padStart(2, "0");
  const viewAllButton = document.querySelector("#view-all-button");
  viewAllButton.hidden = matchingDocuments.length <= 4;
  viewAllButton.innerHTML = showAllDocuments ? 'Show less <span>↑</span>' : 'View all <span>→</span>';
  updateCounts();
  updateProgressMetrics();
}

function renderReviews() {
  const entries = Object.entries(reviews)
    .map(([documentId, review]) => ({
      documentId,
      review,
      document: documents.find((item) => item.id === documentId),
    }))
    .filter((entry) => entry.document)
    .sort((left, right) => new Date(right.review.createdAt) - new Date(left.review.createdAt));
  const list = document.querySelector("#reviews-list");
  list.replaceChildren(...entries.map(({ documentId, review, document: item }) => {
    const card = document.createElement("article");
    card.className = "review-card";
    const school = schoolDetails[item.school];
    const createdAt = new Date(review.createdAt);
    const dateLabel = Number.isNaN(createdAt.getTime())
      ? "Recently"
      : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(createdAt);
    card.innerHTML = `
      <div class="review-card-top">
        <span class="review-school"><span class="school-dot ${school.dot}"></span>${school.name}</span>
        <span class="review-date">${dateLabel}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <div class="review-card-rating" aria-label="${review.rating} out of 5 stars">${"★".repeat(review.rating)}<span>${"★".repeat(5 - review.rating)}</span></div>
      <p>${escapeHtml(review.comment)}</p>
      <div class="review-card-footer"><span>Reviewed by ${escapeHtml(review.author || "Student")}</span><button class="edit-review-link" type="button" data-edit-review="${escapeAttribute(documentId)}">Edit review</button></div>`;
    card.querySelector(".edit-review-link").addEventListener("click", () => openReviewDialog(documentId));
    return card;
  }));
  document.querySelector("#review-count").textContent = String(entries.length).padStart(2, "0");
  document.querySelector("#reviews-empty").hidden = entries.length > 0;
  const summary = document.querySelector("#review-summary");
  summary.hidden = entries.length === 0;
  if (entries.length > 0) {
    const average = entries.reduce((sum, entry) => sum + entry.review.rating, 0) / entries.length;
    document.querySelector("#review-average").textContent = average.toFixed(1);
    document.querySelector("#review-summary-label").textContent = `${entries.length} ${entries.length === 1 ? "review" : "reviews"}`;
    document.querySelector("#review-summary").setAttribute("aria-label", `Average rating ${average.toFixed(1)} out of 5 from ${entries.length} reviews`);
  }
}

function renderReviewDocuments(selectedId = "") {
  reviewDocument.replaceChildren(...documents.map((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.title} — ${schoolDetails[item.school].name}`;
    return option;
  }));
  if (selectedId && documents.some((item) => item.id === selectedId)) {
    reviewDocument.value = selectedId;
  }
}

function setRating(rating) {
  selectedRating = rating;
  document.querySelectorAll(".rating-star").forEach((button) => {
    const isSelected = Number(button.dataset.rating) === rating;
    button.classList.toggle("selected", Number(button.dataset.rating) <= rating);
    button.setAttribute("aria-checked", String(isSelected));
  });
  updateReviewSubmitState();
}

function updateReviewSubmitState() {
  submitReview.disabled = selectedRating === 0 || !reviewComment.value.trim();
  document.querySelector("#review-character-count").textContent = `${reviewComment.value.length} / 500`;
}

function openReviewDialog(documentId = "") {
  renderReviewDocuments(documentId);
  editingReviewId = documentId || null;
  const previousReview = editingReviewId ? reviews[editingReviewId] : null;
  reviewComment.value = previousReview ? previousReview.comment : "";
  setRating(previousReview ? previousReview.rating : 0);
  submitReview.textContent = previousReview ? "Save changes" : "Post review";
  reviewDialog.showModal();
  if (!documentId) reviewDocument.focus();
}

function closeReviewDialog() {
  reviewDialog.close();
  reviewForm.reset();
  editingReviewId = null;
  selectedRating = 0;
  document.querySelectorAll(".rating-star").forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-checked", "false");
  });
  updateReviewSubmitState();
}

function continueDocument(item) {
  if (item.fileUrl) {
    const openedWindow = window.open(item.fileUrl, "_blank");
    if (!openedWindow) {
      showToast("Your browser blocked the PDF tab. Allow pop-ups to open it.");
      return;
    }
    openedWindow.opener = null;
  }
  recordAccess();
  item.progress = Math.min(100, item.progress + 5);
  item.opened = "Just now";
  if (!item.uploaded) {
    try {
      savedProgress[item.id] = item.progress;
      localStorage.setItem(storageKeys.progress, JSON.stringify(savedProgress));
    } catch (error) {
      console.warn("Could not save reading progress.", error);
      showToast("Progress updated for now, but couldn't be saved on this device.");
      renderDocuments();
      renderAccessChart();
      renderReviews();
      return;
    }
  }
  renderDocuments();
  showToast(item.progress === 100 ? "PDF marked as complete. Lovely work!" : "Reading progress updated.");
}

function selectSchool(school) {
  activeSchool = school;
  showAllDocuments = false;
  document.querySelectorAll(".school-link").forEach((button) => {
    const selected = button.dataset.school === school;
    button.classList.toggle("selected", selected);
    if (selected) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
  renderDocuments();
}

function renderSelectedFiles() {
  selectedFilesElement.replaceChildren(...selectedFiles.map((file) => {
    const row = document.createElement("div");
    row.className = "selected-file";
    row.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v6h5M9 14h6m-6 3h6"/></svg>';
    const name = document.createElement("span");
    name.textContent = file.name;
    row.append(name);
    return row;
  }));
  confirmUpload.disabled = selectedFiles.length === 0;
  confirmUpload.textContent = selectedFiles.length > 1 ? `Add ${selectedFiles.length} PDFs` : "Add PDF";
}

function handleFiles(fileList) {
  const files = Array.from(fileList);
  const validFiles = files.filter((file) => file.name.toLocaleLowerCase().endsWith(".pdf"));
  const rejectedCount = files.length - validFiles.length;
  selectedFiles = [...selectedFiles, ...validFiles];
  renderSelectedFiles();
  if (rejectedCount > 0) {
    showToast(`${rejectedCount} file${rejectedCount === 1 ? "" : "s"} skipped. Choose PDF files only.`);
  }
}

document.querySelector("#theme-toggle").addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
  applyTheme(nextTheme);
  try {
    localStorage.setItem(storageKeys.theme, nextTheme);
  } catch (error) {
    console.warn("Could not save the theme preference.", error);
    showToast("Theme changed, but couldn't be saved on this device.");
  }
});

document.querySelectorAll(".school-link").forEach((button) => {
  button.addEventListener("click", () => selectSchool(button.dataset.school));
});

searchInput.addEventListener("input", renderDocuments);
searchBox.addEventListener("click", () => {
  searchBox.classList.add("search-open");
  searchInput.focus();
});
searchInput.addEventListener("blur", () => searchBox.classList.remove("search-open"));
document.querySelector("#view-all-button").addEventListener("click", () => {
  showAllDocuments = !showAllDocuments;
  renderDocuments();
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

document.querySelector("#upload-trigger").addEventListener("click", () => {
  if (activeSchool !== "all") {
    document.querySelector("#upload-school").value = activeSchool;
  }
  uploadDialog.showModal();
});

function closeUploadDialog() {
  uploadDialog.close();
  selectedFiles = [];
  pdfInput.value = "";
  renderSelectedFiles();
}

document.querySelector("#dialog-close").addEventListener("click", closeUploadDialog);
document.querySelector("#cancel-upload").addEventListener("click", closeUploadDialog);
uploadDialog.addEventListener("click", (event) => {
  if (event.target === uploadDialog) closeUploadDialog();
});
pdfInput.addEventListener("change", () => handleFiles(pdfInput.files));

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragging");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragging"));
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
  handleFiles(event.dataTransfer.files);
});

document.querySelector("#upload-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (selectedFiles.length === 0) return;
  const school = document.querySelector("#upload-school").value;
  selectedFiles.forEach((file) => {
    const title = file.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim() || "Untitled PDF";
    const fileUrl = URL.createObjectURL(file);
    documents.unshift({
      id: `upload-${Date.now()}-${nextDocumentId++}`,
      title,
      subject: "Uploaded PDF",
      school,
      pages: "—",
      progress: 0,
      opened: "Just added",
      uploaded: true,
      fileUrl,
    });
  });
  const addedCount = selectedFiles.length;
  selectSchool(school);
  showAllDocuments = true;
  renderDocuments();
  closeUploadDialog();
  showToast(`${addedCount} PDF${addedCount === 1 ? "" : "s"} added. Files stay in this browser session.`);
});

document.querySelector("#add-review-button").addEventListener("click", () => openReviewDialog());
document.querySelectorAll(".rating-star").forEach((button) => {
  button.addEventListener("click", () => setRating(Number(button.dataset.rating)));
  button.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      const nextRating = Math.min(5, Number(button.dataset.rating) + 1);
      setRating(nextRating);
      document.querySelector(`[data-rating="${nextRating}"]`).focus();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextRating = Math.max(1, Number(button.dataset.rating) - 1);
      setRating(nextRating);
      document.querySelector(`[data-rating="${nextRating}"]`).focus();
    }
  });
});
reviewComment.addEventListener("input", updateReviewSubmitState);
reviewDocument.addEventListener("change", () => {
  const selectedReview = reviews[reviewDocument.value];
  editingReviewId = selectedReview ? reviewDocument.value : null;
  reviewComment.value = selectedReview ? selectedReview.comment : "";
  setRating(selectedReview ? selectedReview.rating : 0);
  submitReview.textContent = selectedReview ? "Save changes" : "Post review";
  updateReviewSubmitState();
});
document.querySelector("#review-dialog-close").addEventListener("click", closeReviewDialog);
document.querySelector("#cancel-review").addEventListener("click", closeReviewDialog);
reviewDialog.addEventListener("click", (event) => {
  if (event.target === reviewDialog) closeReviewDialog();
});
reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const documentId = reviewDocument.value;
  const comment = reviewComment.value.trim();
  if (!documentId || !comment || selectedRating < 1 || selectedRating > 5) {
    showToast("Choose a rating and write a review before posting.");
    return;
  }
  const existingReview = reviews[documentId];
  reviews[documentId] = {
    rating: selectedRating,
    comment,
    author: existingReview?.author || "Student",
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(storageKeys.reviews, JSON.stringify(reviews));
  } catch (error) {
    if (existingReview) reviews[documentId] = existingReview;
    else delete reviews[documentId];
    console.warn("Could not save the PDF review.", error);
    showToast("Couldn't save your review on this device. Please check available storage and try again.");
    return;
  }
  renderReviews();
  renderDocuments();
  closeReviewDialog();
  showToast(existingReview ? "Your PDF review has been updated." : "Your PDF review has been posted.");
});

window.addEventListener("beforeunload", () => {
  documents.forEach((item) => {
    if (item.fileUrl) URL.revokeObjectURL(item.fileUrl);
  });
});

renderDocuments();