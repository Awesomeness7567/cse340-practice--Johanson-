import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { emailExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser } from '../../models/forms/registration.js';

const showRegistrationForm = (req, res) => res.render('forms/registration/form', { title: 'User Registration' });
const processRegistration = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { errors.array().forEach(error => req.flash('error', error.msg)); return res.redirect('/register'); }
    const { name, email, password } = req.body;
    try {
        if (await emailExists(email)) { req.flash('warning', 'Email already registered'); return res.redirect('/register'); }
        await saveUser(name, email, await bcrypt.hash(password, 10));
        req.flash('success', 'Registration successful! You can now log in.');
        return res.redirect('/login');
    } catch (error) { console.error('Error registering user:', error); req.flash('error', 'An error occurred during registration. Please try again.'); return res.redirect('/register'); }
};
const processDeleteAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id); const currentUser = req.session.user;
    if (currentUser.roleName !== 'admin') { req.flash('error', 'You do not have permission to delete accounts.'); return res.redirect('/register/list'); }
    if (currentUser.id === targetUserId) { req.flash('error', 'You cannot delete your own account.'); return res.redirect('/register/list'); }
    try { const deleted = await deleteUser(targetUserId); req.flash(deleted ? 'success' : 'error', deleted ? 'User account deleted successfully.' : 'User not found or already deleted.'); }
    catch (error) { console.error('Error deleting user:', error); req.flash('error', 'An error occurred while deleting the account.'); }
    res.redirect('/register/list');
};
const showAllUsers = async (req, res) => {
    let users = []; try { users = await getAllUsers(); } catch (error) { console.error('Error retrieving users:', error); }
    res.render('forms/registration/list', { title: 'Registered Users', users, user: req.session?.user ?? null });
};
const showEditAccountForm = async (req, res) => {
    const targetUserId = parseInt(req.params.id); const currentUser = req.session.user; const targetUser = await getUserById(targetUserId);
    if (!targetUser) { req.flash('error', 'User not found.'); return res.redirect('/register/list'); }
    if (currentUser.id !== targetUserId && currentUser.roleName !== 'admin') { req.flash('error', 'You do not have permission to edit this account.'); return res.redirect('/register/list'); }
    res.render('forms/registration/edit', { title: 'Edit Account', user: targetUser });
};
const processEditAccount = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { errors.array().forEach(error => req.flash('error', error.msg)); return res.redirect(`/register/${req.params.id}/edit`); }
    const targetUserId = parseInt(req.params.id); const currentUser = req.session.user; const { name, email } = req.body;
    try {
        const targetUser = await getUserById(targetUserId);
        if (!targetUser) { req.flash('error', 'User not found.'); return res.redirect('/register/list'); }
        if (currentUser.id !== targetUserId && currentUser.roleName !== 'admin') { req.flash('error', 'You do not have permission to edit this account.'); return res.redirect('/register/list'); }
        if (await emailExists(email) && targetUser.email !== email) { req.flash('error', 'An account with this email already exists.'); return res.redirect(`/register/${targetUserId}/edit`); }
        await updateUser(targetUserId, name, email);
        if (currentUser.id === targetUserId) Object.assign(req.session.user, { name, email });
        req.flash('success', 'Account updated successfully.'); res.redirect('/register/list');
    } catch (error) { console.error('Error updating account:', error); req.flash('error', 'An error occurred while updating the account.'); res.redirect(`/register/${targetUserId}/edit`); }
};
export { showRegistrationForm, processRegistration, processDeleteAccount, showAllUsers, showEditAccountForm, processEditAccount };
