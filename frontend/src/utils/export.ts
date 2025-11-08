import type { ChatSession, Message } from '@/hooks/useChat';

export const exportToJSON = (session: ChatSession) => {
  const data = {
    title: session.title,
    id: session.id,
    lastUpdated: new Date(session.lastUpdated).toISOString(),
    messages: session.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toISOString(),
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.replace(/[^a-z0-9]/gi, '_')}_${session.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToMarkdown = (session: ChatSession) => {
  let markdown = `# ${session.title}\n\n`;
  markdown += `**Last Updated:** ${new Date(session.lastUpdated).toLocaleString()}\n\n`;
  markdown += `---\n\n`;

  session.messages.forEach((msg) => {
    const timestamp = new Date(msg.timestamp).toLocaleString();
    const role = msg.role === 'user' ? '👤 **You**' : '🤖 **Assistant**';
    markdown += `### ${role}\n`;
    markdown += `*${timestamp}*\n\n`;
    markdown += `${msg.content}\n\n`;
    markdown += `---\n\n`;
  });

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.replace(/[^a-z0-9]/gi, '_')}_${session.id}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (session: ChatSession) => {
  // Create HTML content
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${session.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          line-height: 1.6;
          color: #333;
        }
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 10px;
        }
        .metadata {
          color: #666;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .message {
          margin: 20px 0;
          padding: 15px;
          border-radius: 8px;
          page-break-inside: avoid;
        }
        .user {
          background: #e0f2fe;
          margin-left: 20px;
        }
        .assistant {
          background: #f1f5f9;
          margin-right: 20px;
        }
        .role {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .timestamp {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }
        .content {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <h1>${session.title}</h1>
      <div class="metadata">
        <p><strong>Last Updated:</strong> ${new Date(session.lastUpdated).toLocaleString()}</p>
        <p><strong>Total Messages:</strong> ${session.messages.length}</p>
      </div>
      <hr>
  `;

  session.messages.forEach((msg) => {
    const role = msg.role === 'user' ? '👤 You' : '🤖 Assistant';
    const timestamp = new Date(msg.timestamp).toLocaleString();
    html += `
      <div class="message ${msg.role}">
        <div class="role">${role}</div>
        <div class="timestamp">${timestamp}</div>
        <div class="content">${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </div>
    `;
  });

  html += `
    </body>
    </html>
  `;

  // Open print dialog with the HTML
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export const exportAllSessions = (sessions: ChatSession[], format: 'json' | 'markdown') => {
  const data = {
    exportDate: new Date().toISOString(),
    totalSessions: sessions.length,
    sessions: sessions.map(session => ({
      title: session.title,
      id: session.id,
      lastUpdated: new Date(session.lastUpdated).toISOString(),
      messageCount: session.messages.length,
      messages: session.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp).toISOString(),
      })),
    })),
  };

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_conversations_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    let markdown = `# All Conversations\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleString()}\n`;
    markdown += `**Total Sessions:** ${sessions.length}\n\n`;
    markdown += `---\n\n`;

    sessions.forEach((session, index) => {
      markdown += `## ${index + 1}. ${session.title}\n\n`;
      markdown += `**Last Updated:** ${new Date(session.lastUpdated).toLocaleString()}\n`;
      markdown += `**Messages:** ${session.messages.length}\n\n`;

      session.messages.forEach((msg) => {
        const role = msg.role === 'user' ? '👤 **You**' : '🤖 **Assistant**';
        markdown += `### ${role}\n`;
        markdown += `${msg.content}\n\n`;
      });

      markdown += `\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_conversations_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
