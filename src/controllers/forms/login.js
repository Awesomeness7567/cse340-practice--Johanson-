import { body, validationResult } from 'express-validator';
import { findUserByEmail, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';

const router = Router();

/**
 * Validation rules for login form
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password is required')
];

/**
 * Display the login form.
 */
const showLoginForm = (req, res) => {
    // TODO: Render the login form view (forms/login/form)
    // TODO: Pass title: 'User Login'
    res.render('forms/login/form', { title: 'User Login' });
};

/**
 * Process login form submission.
 */
const processLogin = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // TODO: Log validation errors to console
        req.flash('error', 'Invalid email or password. Please try again.');
        // TODO: Redirect back to /login
        return res.redirect('/login');
    }

    // TODO: Extract email and password from req.body
    const { email, password } = req.body;

    try {
        // TODO: Find user by email using findUserByEmail()
        // TODO: If not found, log "User not found" and redirect to /login
        const user = await findUserByEmail(email);
        if (!user) {
            req.flash('error', 'User not found. Please check your email and try again.');
            return res.redirect('/login');
        }

        // TODO: Verify password using verifyPassword(password, user.password)
        // TODO: If password incorrect, log "Invalid password" and redirect to /login
        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid password. Please try again.');
            return res.redirect('/login');
        }

        // SECURITY: Remove password from user object before storing in session
        delete user.password;

        // TODO: Store user in session: req.session.user = user
        // TODO: Redirect to /dashboard
        req.session.user = user;

        req.flash('success', `Welcome, ${user.name}!`);
        res.redirect('/dashboard');
    } catch (error) {
        // Model functions do not catch errors, so handle them here
        // TODO: Log error to console
        console.error('Error processing login:', error);
        req.flash('error', 'An error occurred while processing your login. Please try again.');
        // TODO: Redirect to /login
        res.redirect('/login');
    }
};

/**
 * Handle user logout.
 * 
 * NOTE: connect.sid is the default session cookie name since we did not
 * specify a custom name when creating the session in server.js.
 */
const processLogout = (req, res) => {
    if (!req.session) {
        return res.redirect('/');
    }

    delete req.session.user;
    req.flash('success', 'You have been logged out successfully.');
    return res.redirect('/');

};

/**
 * Display protected dashboard (requires login).
 */
const showDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

    // Security check! Ensure user and sessionData do not contain password field
    if (user && user.password) {
        console.error('Security error: password found in user object');
        delete user.password;
    }
    if (sessionData.user && sessionData.user.password) {
        console.error('Security error: password found in sessionData.user');
        delete sessionData.user.password;
    }

    // TODO: Render the dashboard view (dashboard)
    // TODO: Pass title: 'Dashboard', user, and sessionData to template
    res.render('dashboard', { title: 'Dashboard', user, sessionData });
};

// Routes
router.get('/', showLoginForm);
router.post('/', loginValidation, processLogin);

// Export router as default, and specific functions for root-level routes
export default router;
export { processLogout, showDashboard };
