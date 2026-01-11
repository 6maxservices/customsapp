// Translation utilities for Greek language
// This file provides helper functions to translate status values, roles, and common UI text

// Submission Status Translations
export function translateSubmissionStatus(status: string): string {
  const translations: Record<string, string> = {
    DRAFT: 'Προσχέδιο',
    SUBMITTED: 'Υποβλήθηκε',
    UNDER_REVIEW: 'Υπό Αναθεώρηση',
    APPROVED: 'Εγκεκριμένο',
    REJECTED: 'Απορρίφθηκε',
    REQUIRES_CLARIFICATION: 'Απαιτεί Διασαφήνιση',
  };
  return translations[status] || status;
}

// Task Status Translations
export function translateTaskStatus(status: string): string {
  const translations: Record<string, string> = {
    OPEN: 'Ανοιχτό',
    IN_PROGRESS: 'Σε Εξέλιξη',
    RESOLVED: 'Επιλύθηκε',
    CLOSED: 'Κλειστό',
  };
  return translations[status] || status;
}

// User Role Translations
export function translateUserRole(role: string): string {
  const translations: Record<string, string> = {
    COMPANY_ADMIN: 'Διαχειριστής Εταιρείας',
    COMPANY_OPERATOR: 'Χειριστής Εταιρείας',
    CUSTOMS_REVIEWER: 'Αναθεωρητής Τελωνείου',
    CUSTOMS_SUPERVISOR: 'Επόπτης Τελωνείου',
    CUSTOMS_DIRECTOR: 'Διευθυντής Τελωνείου',
    SYSTEM_ADMIN: 'Διαχειριστής Συστήματος',
  };
  return translations[role] || role;
}

// Common UI Text Constants
export const commonText = {
  // Station Fields
  amdika: 'ΑΜΔΙΚΑ',
  prefecture: 'Νομός',
  city: 'Έδρα',
  installationType: 'Εγκατάσταση',
  stationName: 'Επωνυμία Πρατηρίου',

  // Navigation
  dashboard: 'Πίνακας Ελέγχου',
  stations: 'Καταστήματα',
  submissions: 'Υποβολές',
  tasks: 'Εργασίες',
  logout: 'Αποσύνδεση',

  // Common Actions
  view: 'Προβολή',
  edit: 'Επεξεργασία',
  delete: 'Διαγραφή',
  save: 'Αποθήκευση',
  cancel: 'Ακύρωση',
  submit: 'Υποβολή',
  verifyAndSubmit: 'Επιβεβαίωση & Υποβολή',
  back: 'Πίσω',
  create: 'Δημιουργία',
  createNew: 'Δημιουργία Νέου',
  saveChanges: 'Αποθήκευση Αλλαγών',
  close: 'Κλείσιμο',

  // Status messages
  noData: 'Δεν βρέθηκαν δεδομένα',
  error: 'Σφάλμα',
  success: 'Επιτυχία',
  required: 'Απαιτούμενο',
  optional: 'Προαιρετικό',

  // Common labels
  name: 'Όνομα',
  email: 'Email',
  password: 'Κωδικός',
  date: 'Ημερομηνία',
  status: 'Κατάσταση',
  actions: 'Ενέργειες',
  description: 'Περιγραφή',
  notes: 'Σημειώσεις',
  station: 'Κατάστημα',
  company: 'Εταιρεία',
  period: 'Περίοδος',
  title: 'Τίτλος',
  dueDate: 'Προθεσμία',
  submitted: 'Υποβλήθηκε',
  created: 'Δημιουργήθηκε',
  updated: 'Ενημερώθηκε',
  address: 'Διεύθυνση',
  review: 'Αναθεώρηση',
  approve: 'Έγκριση',
  reject: 'Απόρριψη',
  upload: 'Μεταφόρτωση',
  uploading: 'Μεταφόρτωση...',
  download: 'Λήψη',
  remove: 'Αφαίρεση',
  reply: 'Απάντηση',
  send: 'Αποστολή',
  messages: 'Μηνύματα',
  noMessages: 'Δεν υπάρχουν μηνύματα',
  loading: 'Φόρτωση...',
  loadingTasks: 'Φόρτωση εργασιών...',
  loadingSubmissions: 'Φόρτωση υποβολών...',
  loadingStations: 'Φόρτωση καταστημάτων...',
  loadingTask: 'Φόρτωση εργασίας...',
  openTasks: 'Ανοιχτές Εργασίες',
  upcomingExpirations: 'Προσεχείς Λήξεις',
  quickActions: 'Γρήγορες Ενέργειες',
  viewSubmissions: 'Προβολή Υποβολών',
  manageStations: 'Διαχείριση Καταστημάτων',
  viewTasks: 'Προβολή Εργασιών',
  viewAllTasks: 'Προβολή όλων των εργασιών',
  days: 'ημέρες',
  pendingReviews: 'Εκκρεμείς Αναθεωρήσεις',
  totalSubmissions: 'Σύνολο Υποβολών',
  reviewSubmissions: 'Αναθεώρηση υποβολών',
  viewTasksLink: 'Προβολή εργασιών',

  // File upload
  uploadFile: 'Μεταφόρτωση Αρχείου',
  fileSizeExceeds: 'Το μέγεθος αρχείου υπερβαίνει',
  uploadFailed: 'Αποτυχία μεταφόρτωσης',

  // Submission detail
  submissionInfo: 'Πληροφορίες Υποβολής',
  checklist: 'Λίστα Ελέγχου',
  evidenceFiles: 'Αρχεία Αποδεικτικών',
  editCheck: 'Επεξεργασία',
  addCheck: 'Προσθήκη',
  cancelEdit: 'Ακύρωση',
  notCompleted: 'Δεν ολοκληρώθηκε',
  completed: 'Ολοκληρώθηκε',
  submitSubmission: 'Υποβολή',
  changeStatus: 'Αλλαγή Κατάστασης',
  selectStatus: 'Επιλογή Κατάστασης',
  addNotes: 'Προσθήκη Σημειώσεων',

  // Task detail
  taskInfo: 'Πληροφορίες Εργασίας',
  assignedTo: 'Ανατέθηκε σε',
  createdBy: 'Δημιουργήθηκε από',
  dueDateLabel: 'Προθεσμία',
  taskDescription: 'Περιγραφή',
  messageThread: 'Νήμα Συνομιλίας',
  writeReply: 'Γράψτε απάντηση...',
  updateStatus: 'Ενημέρωση Κατάστασης',

  // Station detail
  stationInfo: 'Πληροφορίες Καταστήματος',
  relatedSubmissions: 'Σχετικές Υποβολές',
  relatedTasks: 'Σχετικές Εργασίες',
  relatedEvidence: 'Σχετικά Αρχεία',
  noEvidenceFiles: 'Δεν έχουν μεταφορτωθεί αρχεία αποδεικτικών',
  loadingStation: 'Φόρτωση καταστήματος...',
  backToStations: '← Πίσω στα Καταστήματα',

  // Form labels
  selectPeriod: 'Επιλογή Περιόδου...',
  selectStation: 'Επιλογή Καταστήματος...',
  requiredField: 'Απαιτούμενο πεδίο',
  selectSubmission: 'Επιλογή Υποβολής (Προαιρετικό)...',
  selectObligation: 'Επιλογή Υποχρέωσης (Προαιρετικό)...',
  taskTitle: 'Τίτλος Εργασίας',
  taskDescriptionLabel: 'Περιγραφή Εργασίας',
  backToTasks: 'Πίσω στις Εργασίες',
  backToSubmissions: 'Πίσω στις Υποβολές',
  createTask: 'Δημιουργία Εργασίας',
  createSubmission: 'Δημιουργία Υποβολής',

  // Detail pages
  submissionDetails: 'Λεπτομέρειες Υποβολής',
  taskDetails: 'Λεπτομέρειες Εργασίας',
  submissionNotFound: 'Η Υποβολή Δεν Βρέθηκε',
  taskNotFound: 'Η Εργασία Δεν Βρέθηκε',
  stationNotFound: 'Το Κατάστημα Δεν Βρέθηκε',
  notFoundMessage: 'Η εγγραφή που αναζητάτε δεν υπάρχει ή δεν έχετε πρόσβαση σε αυτήν.',
  submissionInformation: 'Πληροφορίες Υποβολής',
  taskInformation: 'Πληροφορίες Εργασίας',
  stationInformation: 'Πληροφορίες Καταστήματος',
  createdLabel: 'Δημιουργήθηκε',
  submittedBy: 'Υποβλήθηκε από',
  reviewedBy: 'Αναθεωρήθηκε από',
  relatedObligation: 'Σχετική Υποχρέωση',
  relatedSubmission: 'Σχετική Υποβολή',
  viewSubmission: 'Προβολή Υποβολής',
  reviewActions: 'Ενέργειες Αναθεώρησης',
  complianceChecklist: 'Λίστα Συμμόρφωσης',
  enterValue: 'Εισαγάγετε τιμή...',
  enterNotes: 'Εισαγάγετε σημειώσεις...',
  valueLabel: 'Τιμή',
  forLabel: 'Για',
  noEvidenceFilesUploaded: 'Δεν έχουν μεταφορτωθεί αρχεία αποδεικτικών',
  uploadEvidenceFile: 'Μεταφόρτωση Αρχείου Αποδεικτικού',
  loadingSubmission: 'Φόρτωση υποβολής...',
  markInProgress: 'Σήμανση Σε Εξέλιξη',
  markResolved: 'Σήμανση Επιλυμένης',
  none: 'Κανένα',
  noSubmissionsFound: 'Δεν βρέθηκαν υποβολές',
  noTasksFound: 'Δεν βρέθηκαν εργασίες',
  noStationsAvailable: 'Δεν υπάρχουν διαθέσιμα καταστήματα',
  noAvailablePeriods: 'Δεν υπάρχουν διαθέσιμες περίοδοι. Οι περίοδοι δημιουργούνται αυτόματα κάθε μήνα.',
  submissionPeriod: 'Περίοδος Υποβολής',
  relatedSubmissionOptional: 'Σχετική Υποβολή (Προαιρετικό)',
  relatedObligationOptional: 'Σχετική Υποχρέωση (Προαιρετικό)',
  taskDescriptionOptional: 'Περιγραφή (Προαιρετικό)',
  dueDateOptional: 'Προθεσμία (Προαιρετικό)',
  enterTaskTitle: 'Εισαγάγετε τίτλο εργασίας...',
  enterTaskDescription: 'Εισαγάγετε περιγραφή εργασίας...',
  creating: 'Δημιουργία...',
  creatingSubmission: 'Δημιουργία Υποβολής',
  creatingTask: 'Δημιουργία Εργασίας',
  failedToCreateSubmission: 'Αποτυχία δημιουργίας υποβολής',
  failedToCreateTask: 'Αποτυχία δημιουργίας εργασίας',
  pleaseSelectBoth: 'Παρακαλώ επιλέξτε και τις δύο επιλογές',
  noSubmissionsFoundForStation: 'Δεν βρέθηκαν υποβολές για αυτό το κατάστημα',
  noStations: 'Δεν βρέθηκαν καταστήματα',
  noTasks: 'Δεν βρέθηκαν εργασίες',
  noSubmissions: 'Δεν βρέθηκαν υποβολές',

  // Task Detail
  yourReplyLabel: 'Η Απάντησή σας',
  typeYourMessage: 'Γράψτε το μήνυμά σας...',
  sending: 'Αποστολή...',
  reopenTask: 'Επαναάνοιγμα',

  // Create forms
  periodNumber: 'Περίοδος',
  noneOption: 'Κανένα',
  enterTaskTitlePlaceholder: 'Εισαγάγετε τίτλο εργασίας...',
  enterTaskDescriptionPlaceholder: 'Εισαγάγετε περιγραφή εργασίας...',

  // Create Task
  onlyCustomsUsersCanCreateTasks: 'Μόνο οι χρήστες τελωνείου μπορούν να δημιουργούν εργασίες.',
  stationAndTitleRequired: 'Το Κατάστημα και ο Τίτλος είναι υποχρεωτικά',
};

// Format date for Greek locale
export function formatDateGreek(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('el-GR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// Format datetime for Greek locale
export function formatDateTimeGreek(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('el-GR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'μόλις τώρα';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} λεπτά πριν`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ώρες πριν`;
  if (diffInSeconds < 172800) return 'χθες';
  return `${Math.floor(diffInSeconds / 86400)} μέρες πριν`;
}

// Calculate days remaining until deadline
export function calculateDaysRemaining(deadline: Date | string): { days: number; status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXPIRED' } {
  const deadlineObj = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  // Reset time part to compare only dates
  now.setHours(0, 0, 0, 0);
  deadlineObj.setHours(0, 0, 0, 0);

  const diffTime = deadlineObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXPIRED' = 'NORMAL';

  if (diffDays < 0) status = 'EXPIRED';
  else if (diffDays <= 2) status = 'CRITICAL';
  else if (diffDays <= 5) status = 'WARNING';

  return { days: diffDays, status };
}
