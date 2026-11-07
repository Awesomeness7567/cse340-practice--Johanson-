import { Router } from 'express';
import { addDemoHeaders } from '../middleware/demo/headers.js';
import {
    catalogPage,
    courseDetailPage
} from './catalog/catalog.js';
import {
    homePage,
    aboutPage,
    demoPage,
    testErrorPage
} from './index.js';
import {
  facultyListPage,
  facultyDetailPage,
} from "./faculty/faculty.js";
import { showContactForm, processContactForm, showContactResponses } from './forms/contact.js';
import { showRegistrationForm, processRegistration, processDeleteAccount, showAllUsers, showEditAccountForm, processEditAccount } from './forms/registration.js';
import { showLoginForm, processLogin, processLogout, showDashboard } from './forms/login.js';
import { contactValidation, registrationValidation, editValidation, loginValidation } from '../middleware/validation/forms.js';
import { requireLogin } from '../middleware/auth.js';

const router = Router();

router.use('/catalog', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/catalog.css">');
    next();
});

router.use('/faculty', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/faculty.css">');
    next();
});

router.use('/contact', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/contact.css">');
    next();
});

// Add registration-specific styles to all registration routes
router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

// Add login-specific styles to all login routes
router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

// Login routes (form and submission)
router.get('/login', showLoginForm);
router.post('/login', loginValidation, processLogin);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

router.get('/', homePage);
router.get('/about', aboutPage);

router.get('/catalog', catalogPage);
router.get('/catalog/:slugId', courseDetailPage);

router.get("/faculty", facultyListPage);
router.get('/faculty/:facultySlug', facultyDetailPage);

router.get('/demo', addDemoHeaders, demoPage);

router.get('/test-error', testErrorPage);

router.get('/contact', showContactForm);
router.post('/contact', contactValidation, processContactForm);
router.get('/contact/responses', showContactResponses);

// Registration routes
router.get('/register', showRegistrationForm);
router.post('/register', registrationValidation, processRegistration);
router.get('/register/list', showAllUsers);
router.get('/register/:id/edit', requireLogin, showEditAccountForm);
router.post('/register/:id/edit', requireLogin, editValidation, processEditAccount);
router.post('/register/:id/delete', requireLogin, processDeleteAccount);

export default router;
