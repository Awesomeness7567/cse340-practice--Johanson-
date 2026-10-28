import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import {
    createContactForm,
    getAllContactForms
} from '../../models/forms/contact.js';

const router = Router();

const showContactForm = (req, res) => {
    res.render('forms/contact/form', { title: 'Contact Us' });
};

const handleContactSubmission = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/contact');
    }

    const { subject, message } = req.body;

    try {
        await createContactForm(subject, message);
        req.flash('success', 'Thank you for contacting us! We will respond soon.');
        res.redirect('/contact');
    } catch (error) {
    console.error('Error saving contact form:', error);
    req.flash('error', 'Unable to submit your message. Please try again later.');
    res.redirect('/contact');
    }
};

const showContactResponses = async (req, res) => {
    let contactForms = [];

    try {
        contactForms = await getAllContactForms();
    } catch (error) {
        console.error('Error retrieving contact forms:', error);
    }

    res.render('forms/contact/responses', {
        title: 'Contact Form Submissions',
        contactForms
    });
};

router.get('/', showContactForm);

router.post('/', [
    body('subject')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Subject must be at least 2 characters'),
    body('message')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Message must be at least 10 characters')
], handleContactSubmission);

router.get('/responses', showContactResponses);

export default router;
