const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const systemPromptCheckbox = document.getElementById('useSystemPrompt');
const systemPromptInput = document.getElementById('systemPromptInput');

// Enable/disable system prompt input
systemPromptCheckbox.addEventListener('change', (e) => {
    systemPromptInput.disabled = !e.target.checked;
});

// Handle Enter key (Shift+Enter for new line)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send button click
sendBtn.addEventListener('click', sendMessage);

function addMessage(content, role = 'assistant') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = role === 'user' ? 'You' : 'Claude';

    const text = document.createElement('div');
    text.textContent = content;

    messageDiv.appendChild(label);
    messageDiv.appendChild(text);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageDiv;
}

function addErrorMessage(error) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message error';

    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = 'Error';

    const text = document.createElement('div');
    text.textContent = error;

    messageDiv.appendChild(label);
    messageDiv.appendChild(text);
    messagesContainer.appendChild(messageDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    messageInput.disabled = isLoading;

    if (isLoading) {
        sendBtn.innerHTML = '<span class="loading"></span>';
    } else {
        sendBtn.textContent = 'Send';
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    // Add user message
    addMessage(message, 'user');

    // Clear input
    messageInput.value = '';

    // Set loading state
    setLoading(true);

    try {
        const payload = {
            message: message
        };

        // Add system prompt if enabled
        if (systemPromptCheckbox.checked && systemPromptInput.value.trim()) {
            payload.systemPrompt = systemPromptInput.value.trim();
        }

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            addMessage(data.response, 'assistant');
        } else {
            addErrorMessage(data.error || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Error:', error);
        addErrorMessage(`Failed to send message: ${error.message}`);
    } finally {
        setLoading(false);
        messageInput.focus();
    }
}

// Focus input on load
messageInput.focus();
