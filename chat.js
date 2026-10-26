/**
 * Matchly - Realtime Interactive Messaging
 * Group 13 - Frontend Engineering
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const chatLayout = document.querySelector('.messaging-layout');
    if (!chatLayout) return;

    const chatList = document.querySelector('.chat-list');
    const chatWindowHeader = document.querySelector('.chat-window__header');
    const headerTitle = chatWindowHeader ? chatWindowHeader.querySelector('h3') : null;
    const headerAvatar = chatWindowHeader ? chatWindowHeader.querySelector('.chat-item__avatar') : null;
    const messagesContainer = document.querySelector('.chat-window__messages');
    const inputField = document.querySelector('.chat-window__input input');
    const sendButton = document.querySelector('.chat-window__input button');

    // Conversation database
    const conversations = {
      'Priya Sharma': {
        name: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
        online: true,
        messages: [
          { type: 'received', text: 'Hey! I saw your profile and we have a lot in common.' },
          { type: 'sent', text: 'Hi Priya! Nice to meet you. I noticed you like hiking too?' },
          { type: 'received', text: 'Yes! I usually go every weekend. We should plan a trip sometime.' },
          { type: 'sent', text: "That sounds great! Let's meet." }
        ],
        replies: [
          'How about coffee this Saturday around Connaught Place?',
          'I know this really cozy café with the best cold brew!',
          'Sounds lovely! Looking forward to it 😊',
          'Have you visited Himachal recently? The trails there are breathtaking!'
        ]
      },
      'Rahul Verma': {
        name: 'Rahul Verma',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        online: false,
        messages: [
          { type: 'received', text: 'Hey there! Did you catch the cricket match yesterday?' },
          { type: 'sent', text: 'Haha yes, what a nail-biter finish!' },
          { type: 'received', text: 'Haha, I totally agree.' }
        ],
        replies: [
          'What are your plans for this weekend?',
          'That was an absolute masterclass inning!',
          'Are you into indie music festivals as well?'
        ]
      }
    };

    let activeContact = 'Priya Sharma';

    // Check URL parameters for direct conversation opening from profile page
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let targetParam = urlParams.get('chat') || urlParams.get('user');
      if (!targetParam && window.location.hash) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''));
          targetParam = hashParams.get('chat') || hashParams.get('user');
        } catch (e) {}
      }
      if (targetParam) {
        const foundName = Object.keys(conversations).find(k => k.toLowerCase() === targetParam.toLowerCase()) || targetParam;
        if (!conversations[foundName]) {
          // If candidate is in Matchly profiles database, create a chat thread
          let cand = null;
          if (window.Matchly && window.Matchly.getProfileByName) {
            cand = window.Matchly.getProfileByName(targetParam);
          }
          conversations[foundName] = {
            name: foundName,
            avatar: (cand && cand.image) ? cand.image : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
            online: true,
            messages: [
              { type: 'received', text: `Hi! Thank you for viewing my profile. I'd love to connect and learn more about you!` }
            ],
            replies: [
              'Thank you for reaching out! How has your week been?',
              'I saw we have quite a few interests in common.',
              'Would love to chat over coffee sometime soon!'
            ]
          };

          // Append to sidebar list
          if (chatList) {
            const newChatEl = document.createElement('div');
            newChatEl.className = 'chat-item';
            newChatEl.innerHTML = `
              <div class="chat-item__avatar" style="background-image: url('${conversations[foundName].avatar}')"></div>
              <div class="chat-item__info">
                <h4>${foundName}</h4>
                <p>Hi! Thank you for viewing my profile...</p>
              </div>
            `;
            chatList.appendChild(newChatEl);
          }
        }
        activeContact = foundName;
      }
    } catch (e) {}

    function scrollToBottom() {
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    function renderActiveConversation() {
      const conv = conversations[activeContact];
      if (!conv) return;

      if (headerTitle) {
        headerTitle.innerHTML = `${conv.name} ${conv.online ? '<span style="font-size: 0.75rem; color: #4caf50; font-weight: normal; margin-left: 6px;">● Online</span>' : '<span style="font-size: 0.75rem; color: #999; font-weight: normal; margin-left: 6px;">● Offline</span>'}`;
      }
      if (headerAvatar) {
        headerAvatar.style.backgroundImage = `url('${conv.avatar}')`;
      }

      // Add or update "View Profile" button in chat header
      if (chatWindowHeader) {
        let viewProfileBtn = chatWindowHeader.querySelector('.btn-chat-view-profile');
        if (!viewProfileBtn) {
          viewProfileBtn = document.createElement('a');
          viewProfileBtn.className = 'btn btn--outline btn-chat-view-profile';
          viewProfileBtn.style.cssText = 'margin-left: auto; padding: 0.35rem 0.8rem; font-size: 0.82rem; border-radius: 8px; text-decoration: none;';
          chatWindowHeader.appendChild(viewProfileBtn);
        }
        viewProfileBtn.href = (window.Matchly && window.Matchly.getProfileUrl)
          ? window.Matchly.getProfileUrl(conv.name)
          : `profile.html#name=${encodeURIComponent(conv.name)}`;
        viewProfileBtn.onclick = (e) => {
          if (window.Matchly && window.Matchly.navigateToProfile) {
            window.Matchly.navigateToProfile(conv.name, e);
          }
        };
        viewProfileBtn.innerHTML = '👤 View Profile';
      }

      if (messagesContainer) {
        messagesContainer.innerHTML = '';
        conv.messages.forEach(msg => {
          const div = document.createElement('div');
          div.className = `message message--${msg.type}`;
          div.textContent = msg.text;
          messagesContainer.appendChild(div);
        });
        scrollToBottom();
      }
    }

    // Attach click handlers to chat items in sidebar
    function initChatList() {
      const items = chatList.querySelectorAll('.chat-item');
      items.forEach(item => {
        const nameEl = item.querySelector('.chat-item__info h4');
        const contactName = nameEl ? nameEl.textContent.trim() : '';

        // If this matches activeContact, mark it active
        if (contactName.toLowerCase() === activeContact.toLowerCase()) {
          items.forEach(el => el.classList.remove('chat-item--active'));
          item.classList.add('chat-item--active');
        }

        item.addEventListener('click', () => {
          const currentItems = chatList.querySelectorAll('.chat-item');
          currentItems.forEach(el => el.classList.remove('chat-item--active'));
          item.classList.add('chat-item--active');
          if (conversations[contactName]) {
            activeContact = contactName;
            renderActiveConversation();
          }
        });
      });
    }

    // Send Message
    function sendMessage() {
      if (!inputField) return;
      const text = inputField.value.trim();
      if (!text) return;

      const conv = conversations[activeContact];
      if (!conv) return;

      // Add sent message
      conv.messages.push({ type: 'sent', text: text });
      
      const sentEl = document.createElement('div');
      sentEl.className = 'message message--sent';
      sentEl.textContent = text;
      messagesContainer.appendChild(sentEl);
      inputField.value = '';
      scrollToBottom();

      // Update preview in sidebar
      const activeItem = chatList.querySelector('.chat-item--active .chat-item__info p');
      if (activeItem) {
        activeItem.textContent = text;
      }

      // Simulate contact typing and reply
      simulateContactReply(conv);
    }

    function simulateContactReply(conv) {
      // Show typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'message message--received typing-indicator';
      typingIndicator.style.cssText = 'color: #888; font-style: italic; background: #e8eaed;';
      typingIndicator.innerHTML = `${conv.name} is typing...`;
      messagesContainer.appendChild(typingIndicator);
      scrollToBottom();

      setTimeout(() => {
        if (typingIndicator.parentNode) {
          typingIndicator.parentNode.removeChild(typingIndicator);
        }

        const replyPool = conv.replies;
        const replyText = replyPool.length > 0
          ? replyPool[Math.floor(Math.random() * replyPool.length)]
          : 'Sounds great!';

        conv.messages.push({ type: 'received', text: replyText });

        const receivedEl = document.createElement('div');
        receivedEl.className = 'message message--received';
        receivedEl.textContent = replyText;
        messagesContainer.appendChild(receivedEl);
        scrollToBottom();

        // Update preview in sidebar
        const activeItem = chatList.querySelector('.chat-item--active .chat-item__info p');
        if (activeItem) {
          activeItem.textContent = replyText;
        }

        if (window.Matchly) {
          window.Matchly.showToast(`New message from ${conv.name}`, 'info');
        }
      }, 1400);
    }

    if (sendButton) {
      sendButton.addEventListener('click', sendMessage);
    }

    if (inputField) {
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
    }

    initChatList();
    renderActiveConversation();
  });
})();
