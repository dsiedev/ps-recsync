/**
 * RecSync Admin JavaScript
 */

// Wait for DOM to be ready
function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

// Initialize when ready
ready(function() {
    console.log('RecSync Admin JS loaded');
    initApiKeyCopy();
});

// Also try to initialize after a short delay in case DOM is not ready
setTimeout(function() {
    console.log('RecSync Admin JS delayed init');
    initApiKeyCopy();
}, 1000);

/**
 * Initialize API Key copy button functionality
 */
function initApiKeyCopy() {
    console.log('Initializing API Key copy functionality...');
    
    // Find the API Key input field
    const apiKeyInput = document.querySelector('input[name="RECSYNC_API_KEY"]');
    
    if (!apiKeyInput) {
        console.log('API Key input not found, retrying in 500ms...');
        setTimeout(initApiKeyCopy, 500);
        return;
    }
    
    console.log('API Key input found:', apiKeyInput);
    
    // Check if button already exists
    const existingBtn = document.querySelector('#copyApiKeyBtn');
    if (existingBtn) {
        console.log('Copy button already exists, skipping...');
        return;
    }
    
    // Create copy button using PrestaShop pattern
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.id = 'copyApiKeyBtn';
    copyBtn.className = 'btn btn-default';
    copyBtn.innerHTML = '<i class="icon-copy"></i>';
    copyBtn.title = 'Copy API Key to clipboard';
    
    // Insert button to the right of the input field
    const formGroup = apiKeyInput.closest('.form-group');
    if (formGroup) {
        // Find the col-lg-8 container that holds the input
        const inputContainer = apiKeyInput.closest('.col-lg-8');
        if (inputContainer) {
            // Create a wrapper div for input and button
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            
            // Move the input to the wrapper
            inputContainer.insertBefore(wrapper, apiKeyInput);
            wrapper.appendChild(apiKeyInput);
            
            // Add the button to the wrapper
            wrapper.appendChild(copyBtn);
            console.log('Copy button added to input wrapper');
        } else {
            // Fallback: add to form group
            formGroup.appendChild(copyBtn);
            console.log('Copy button added to form group (fallback)');
        }
        
        // Add click event using PrestaShop pattern
        copyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            copyApiKeyToClipboard(apiKeyInput, copyBtn);
        });
        
        // Show/hide button based on input value
        apiKeyInput.addEventListener('input', function() {
            copyBtn.style.display = this.value ? 'inline-block' : 'none';
        });
        
        // Initial visibility
        copyBtn.style.display = apiKeyInput.value ? 'inline-block' : 'none';
        
    } else {
        console.log('Form group not found');
    }
}

/**
 * Copy API Key to clipboard
 */
function copyApiKeyToClipboard(input, button) {
    console.log('Copy function called');
    
    // Always get the real API key value from the hidden field
    const realValueInput = document.querySelector('input[name="RECSYNC_API_KEY_REAL"]');
    if (realValueInput && realValueInput.value) {
        const apiKeyValue = realValueInput.value;
        console.log('Real API Key value found:', apiKeyValue);
        
        // Use modern clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
            console.log('Using modern clipboard API');
            navigator.clipboard.writeText(apiKeyValue).then(function() {
                console.log('Copy successful');
                showCopySuccess(button);
            }).catch(function(err) {
                console.error('Failed to copy: ', err);
                fallbackCopyTextToClipboard(apiKeyValue, button);
            });
        } else {
            console.log('Using fallback copy method');
            // Fallback for older browsers
            fallbackCopyTextToClipboard(apiKeyValue, button);
        }
    } else {
        console.log('Real API Key value not found');
        showCopyError(button, 'API Key not configured');
    }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(button);
        } else {
            showCopyError(button, 'Copy failed');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showCopyError(button, 'Copy failed');
    }
    
    document.body.removeChild(textArea);
}

/**
 * Show copy success feedback using PrestaShop pattern
 */
function showCopySuccess(button) {
    console.log('Showing copy success');
    const originalText = button.innerHTML;
    const originalTitle = button.title;
    
    // Update button appearance
    button.classList.add('copied');
    button.innerHTML = '<i class="icon-check"></i> Copied!';
    button.title = 'Copied!';
    
    // Show PrestaShop success message
    if (typeof showSuccessMessage !== 'undefined') {
        showSuccessMessage('API Key copied to clipboard!');
    }
    
    // Reset after 2 seconds
    setTimeout(function() {
        button.classList.remove('copied');
        button.innerHTML = originalText;
        button.title = originalTitle;
    }, 2000);
}

/**
 * Show copy error feedback using PrestaShop pattern
 */
function showCopyError(button, message) {
    console.log('Showing copy error:', message);
    const originalText = button.innerHTML;
    const originalTitle = button.title;
    
    // Update button appearance
    button.style.background = '#dc3545';
    button.style.borderColor = '#dc3545';
    button.style.color = 'white';
    button.innerHTML = '<i class="icon-times"></i> Error';
    button.title = message;
    
    // Show PrestaShop error message
    if (typeof showErrorMessage !== 'undefined') {
        showErrorMessage(message);
    }
    
    // Reset after 3 seconds
    setTimeout(function() {
        button.style.background = '';
        button.style.borderColor = '';
        button.style.color = '';
        button.innerHTML = originalText;
        button.title = originalTitle;
    }, 3000);
}

/**
 * Utility function to show notifications
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} recsync-notification`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
