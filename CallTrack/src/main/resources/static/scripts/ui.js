// Basic UI enhancements: smooth scroll to top on nav, focus search on load
document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.setAttribute('inputmode', 'numeric');
        phoneInput.setAttribute('autocomplete', 'tel');
        setTimeout(() => phoneInput.focus(), 200);
    }

    const featureLinks = document.querySelectorAll('a.feature-card');
    featureLinks.forEach(link => {
        link.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});

// Small helper to format phone if needed later
export function normalizePhone(phone) {
    return (phone || '').replace(/[^\d+]/g, '').trim();
}


