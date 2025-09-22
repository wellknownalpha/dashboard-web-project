import jsPDF from 'jspdf';

/**
 * Export documentation to PDF format
 * Converts the comprehensive documentation into a professional PDF document
 */
export const exportDocumentationToPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number = 10) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
        }
    };

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
            checkPageBreak();
            pdf.text(line, margin, yPosition);
            yPosition += lineHeight;
        });
    };

    // Helper function to add section header
    const addSectionHeader = (title: string, fontSize: number = 16) => {
        checkPageBreak(15);
        yPosition += 5;
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, yPosition);
        yPosition += lineHeight + 3;
        
        // Add underline
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
        yPosition += 5;
    };

    // Title Page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Microsoft 365 & Defender Dashboard', pageWidth / 2, 60, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text('Complete Documentation', pageWidth / 2, 80, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Version 1.2.0', pageWidth / 2, 100, { align: 'center' });
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 110, { align: 'center' });
    
    // Add company logo placeholder
    pdf.setFontSize(14);
    pdf.text('SecureOps Security Team', pageWidth / 2, 200, { align: 'center' });
    
    pdf.addPage();
    yPosition = margin;

    // Table of Contents
    addSectionHeader('Table of Contents', 18);
    const tocItems = [
        '1. Overview',
        '2. System Architecture', 
        '3. Installation & Setup',
        '4. Core Features & Usage',
        '5. API Documentation',
        '6. Security Considerations',
        '7. Monitoring & Logging',
        '8. Testing & QA',
        '9. Deployment & Updates',
        '10. Maintenance & Troubleshooting',
        '11. Versioning & Changelog',
        '12. Contributing',
        '13. Appendices'
    ];
    
    tocItems.forEach(item => {
        addText(item, 11);
    });

    pdf.addPage();
    yPosition = margin;

    // 1. Overview
    addSectionHeader('1. Overview');
    
    addText('Application Name: Microsoft 365 & Defender Dashboard (SecureOps Dashboard)', 12, true);
    yPosition += 3;
    
    addText('A comprehensive, enterprise-grade unified security dashboard that provides real-time monitoring and management of Microsoft 365 users and Microsoft Defender devices. The application integrates with Microsoft Graph API and Defender API to deliver actionable security insights for IT administrators and security teams.');
    
    yPosition += 5;
    addText('Primary Objectives:', 11, true);
    addText('• Real-time Security Monitoring: Continuous monitoring of user accounts and device security status');
    addText('• Compliance Management: Automated compliance tracking with 14-day device activity thresholds');
    addText('• Risk Assessment: Visual risk analysis and device security health monitoring');
    addText('• Alert Management: Automated email notifications for non-compliant users and security issues');
    addText('• Administrative Control: Role-based access control with comprehensive user management');

    yPosition += 5;
    addText('Target Users:', 11, true);
    addText('• Security Operations Center (SOC) Analysts: Monitor security compliance and device risks');
    addText('• IT Administrators: Manage user accounts, device policies, and security configurations');
    addText('• Security Engineers: Analyze security trends and implement compliance policies');
    addText('• Compliance Officers: Generate reports and ensure organizational security standards');
    addText('• IT Managers: Executive oversight of security posture and compliance metrics');

    // 2. System Architecture
    addSectionHeader('2. System Architecture');
    
    addText('High-Level Architecture:', 12, true);
    addText('The application follows a three-tier architecture with Frontend (React/TypeScript), Backend (Node.js/Express), and External APIs (Microsoft Graph and Defender APIs).');
    
    yPosition += 5;
    addText('Backend Components:', 11, true);
    addText('• Authentication Service: Role-based access control with MFA support');
    addText('• Microsoft API Service: Integration with Graph and Defender APIs');
    addText('• Device User Mapping Service: Smart association between users and devices');
    addText('• Email Alert Service: Automated compliance notifications');
    addText('• Export Services: CSV and PDF report generation');

    yPosition += 5;
    addText('Frontend Components:', 11, true);
    addText('• Dashboard Module: Main dashboard with KPIs and charts');
    addText('• Compliance Module: Compliance monitoring and management');
    addText('• User Management Module: User administration and role management');
    addText('• Device Module: Device monitoring and risk assessment');

    // 3. Installation & Setup
    addSectionHeader('3. Installation & Setup');
    
    addText('Prerequisites:', 12, true);
    addText('• Node.js v18.0.0 or higher (LTS recommended)');
    addText('• npm v8.0.0 or higher');
    addText('• Modern Browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+');
    addText('• Azure Subscription with admin access');
    addText('• Azure AD Tenant access');
    addText('• App Registration with proper API permissions');

    yPosition += 5;
    addText('Installation Steps:', 11, true);
    addText('1. Clone repository: git clone <repository-url>');
    addText('2. Install dependencies: npm run install:all');
    addText('3. Configure Azure app registration');
    addText('4. Set up environment variables in backend/.env');
    addText('5. Start application: npm run start:full');

    // 4. Core Features & Usage
    addSectionHeader('4. Core Features & Usage');
    
    addText('Dashboard Overview:', 12, true);
    addText('The main dashboard provides real-time insights into organizational security posture with key performance indicators, visual analytics, and interactive charts.');
    
    yPosition += 3;
    addText('Key Performance Indicators (KPIs):', 11, true);
    addText('• Total Users: Count of Microsoft 365 licensed users');
    addText('• Total Devices: Count of registered Defender devices');
    addText('• High Risk Devices: Devices with high security risk levels');
    addText('• Last Synced: Timestamp of last successful data refresh');

    yPosition += 5;
    addText('User Management Features:', 11, true);
    addText('• User CRUD Operations: Create, read, update, delete user accounts');
    addText('• Role Management: GlobalAdmin, Admin, Viewer role assignments');
    addText('• MFA Configuration: TOTP-based multi-factor authentication setup');
    addText('• Password Management: Secure password policies and reset functionality');

    yPosition += 5;
    addText('Compliance Management:', 11, true);
    addText('• Real-time Tracking: Continuous monitoring of user compliance status');
    addText('• 14-Day Rule: Device activity threshold for compliance determination');
    addText('• Risk Assessment: Automated risk level calculation');
    addText('• Violation Detection: Identification of non-compliant users');

    // 5. Security Considerations
    addSectionHeader('5. Security Considerations');
    
    addText('Authentication & Authorization:', 12, true);
    addText('The application implements comprehensive security measures including multi-factor authentication, role-based access control, and secure password management.');
    
    yPosition += 3;
    addText('Security Features:', 11, true);
    addText('• TOTP-based MFA compatible with Google Authenticator');
    addText('• bcrypt password hashing with cost factor 12');
    addText('• Role-based permissions (GlobalAdmin, Admin, Viewer)');
    addText('• Session management with automatic timeouts');
    addText('• Audit logging for all user actions');

    yPosition += 5;
    addText('Data Privacy:', 11, true);
    addText('• Minimal data collection - only necessary information');
    addText('• No persistent server-side storage');
    addText('• Automatic session cleanup');
    addText('• GDPR compliance considerations');

    // 6. API Documentation
    addSectionHeader('6. API Documentation');
    
    addText('Core API Endpoints:', 12, true);
    addText('• GET /api/health - Server status and connectivity check');
    addText('• GET /api/users - Microsoft Graph users with licenses');
    addText('• GET /api/devices - Microsoft Defender devices with risk levels');
    
    yPosition += 5;
    addText('Microsoft Graph API Integration:', 11, true);
    addText('Required permissions: User.Read.All, Directory.Read.All, User.ReadWrite.All');
    addText('Rate limits: 10,000 requests per 10 minutes per application');
    
    yPosition += 3;
    addText('Microsoft Defender API Integration:', 11, true);
    addText('Required permissions: Machine.Read.All, SecurityEvents.Read.All');
    addText('Rate limits: 100 requests per minute per application');

    // 7. Deployment & Updates
    addSectionHeader('7. Deployment & Updates');
    
    addText('Deployment Options:', 12, true);
    addText('Frontend: Vercel, Netlify, Azure Static Web Apps');
    addText('Backend: Azure App Service, AWS Lambda, Heroku');
    
    yPosition += 5;
    addText('Environment Configuration:', 11, true);
    addText('• Development: Local development with hot reload');
    addText('• Staging: Pre-production testing environment');
    addText('• Production: Live environment with monitoring');

    // 8. Maintenance & Troubleshooting
    addSectionHeader('8. Maintenance & Troubleshooting');
    
    addText('Common Issues:', 12, true);
    addText('• No data showing: Check backend server and API permissions');
    addText('• Authentication errors: Verify Azure credentials and permissions');
    addText('• MFA issues: Check system time synchronization');
    addText('• Performance issues: Monitor API response times and optimize queries');

    yPosition += 5;
    addText('Support Escalation:', 11, true);
    addText('• Level 1: Basic troubleshooting and user support');
    addText('• Level 2: Technical issues and configuration problems');
    addText('• Level 3: Development team and architectural issues');

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
        pdf.text('Microsoft 365 & Defender Dashboard - Documentation v1.2.0', margin, pageHeight - 10);
    }

    // Save the PDF
    const filename = `Microsoft-365-Defender-Dashboard-Documentation-v1.2.0-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
};

/**
 * Export documentation to Word-compatible format (HTML)
 * Creates an HTML file that can be opened in Microsoft Word
 */
export const exportDocumentationToWord = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Microsoft 365 & Defender Dashboard - Documentation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #0078d4; border-bottom: 3px solid #0078d4; padding-bottom: 10px; }
        h2 { color: #106ebe; border-bottom: 2px solid #106ebe; padding-bottom: 5px; margin-top: 30px; }
        h3 { color: #323130; margin-top: 25px; }
        .toc { background-color: #f8f9fa; padding: 20px; border-left: 4px solid #0078d4; }
        .code { background-color: #f1f3f4; padding: 10px; border-radius: 4px; font-family: 'Courier New', monospace; }
        .highlight { background-color: #fff4ce; padding: 2px 4px; }
        .warning { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; }
        .info { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 50px;">
        <h1 style="font-size: 28px; margin-bottom: 10px;">Microsoft 365 & Defender Dashboard</h1>
        <h2 style="font-size: 20px; color: #666; border: none;">Complete Documentation</h2>
        <p><strong>Version:</strong> 1.2.0</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Document Owner:</strong> SecureOps Development Team</p>
    </div>

    <div class="toc">
        <h2>Table of Contents</h2>
        <ol>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#architecture">System Architecture</a></li>
            <li><a href="#installation">Installation & Setup</a></li>
            <li><a href="#features">Core Features & Usage</a></li>
            <li><a href="#api">API Documentation</a></li>
            <li><a href="#security">Security Considerations</a></li>
            <li><a href="#monitoring">Monitoring & Logging</a></li>
            <li><a href="#testing">Testing & QA</a></li>
            <li><a href="#deployment">Deployment & Updates</a></li>
            <li><a href="#maintenance">Maintenance & Troubleshooting</a></li>
            <li><a href="#versioning">Versioning & Changelog</a></li>
            <li><a href="#contributing">Contributing</a></li>
            <li><a href="#appendices">Appendices</a></li>
        </ol>
    </div>

    <div class="page-break"></div>

    <h1 id="overview">1. Overview</h1>
    
    <h3>Application Name</h3>
    <p><strong>Microsoft 365 & Defender Dashboard (SecureOps Dashboard)</strong></p>
    
    <h3>Description</h3>
    <p>A comprehensive, enterprise-grade unified security dashboard that provides real-time monitoring and management of Microsoft 365 users and Microsoft Defender devices. The application integrates with Microsoft Graph API and Defender API to deliver actionable security insights for IT administrators and security teams.</p>
    
    <h3>Primary Objectives</h3>
    <ul>
        <li><strong>Real-time Security Monitoring:</strong> Continuous monitoring of user accounts and device security status</li>
        <li><strong>Compliance Management:</strong> Automated compliance tracking with 14-day device activity thresholds</li>
        <li><strong>Risk Assessment:</strong> Visual risk analysis and device security health monitoring</li>
        <li><strong>Alert Management:</strong> Automated email notifications for non-compliant users and security issues</li>
        <li><strong>Administrative Control:</strong> Role-based access control with comprehensive user management</li>
    </ul>

    <h3>Target Users</h3>
    <ul>
        <li><strong>Security Operations Center (SOC) Analysts:</strong> Monitor security compliance and device risks</li>
        <li><strong>IT Administrators:</strong> Manage user accounts, device policies, and security configurations</li>
        <li><strong>Security Engineers:</strong> Analyze security trends and implement compliance policies</li>
        <li><strong>Compliance Officers:</strong> Generate reports and ensure organizational security standards</li>
        <li><strong>IT Managers:</strong> Executive oversight of security posture and compliance metrics</li>
    </ul>

    <div class="page-break"></div>

    <h1 id="architecture">2. System Architecture</h1>
    
    <h3>High-Level Architecture</h3>
    <p>The application follows a three-tier architecture:</p>
    <ul>
        <li><strong>Frontend Layer:</strong> React/TypeScript with Tailwind CSS</li>
        <li><strong>Backend Layer:</strong> Node.js/Express with Microsoft API integration</li>
        <li><strong>External APIs:</strong> Microsoft Graph API and Defender API</li>
    </ul>

    <h3>Backend Components</h3>
    <ul>
        <li><strong>Authentication Service:</strong> Role-based access control with MFA support</li>
        <li><strong>Microsoft API Service:</strong> Integration with Graph and Defender APIs</li>
        <li><strong>Device User Mapping Service:</strong> Smart association between users and devices</li>
        <li><strong>Email Alert Service:</strong> Automated compliance notifications</li>
        <li><strong>Export Services:</strong> CSV and PDF report generation</li>
    </ul>

    <div class="page-break"></div>

    <h1 id="installation">3. Installation & Setup</h1>
    
    <h3>Prerequisites</h3>
    <ul>
        <li><strong>Node.js:</strong> v18.0.0 or higher (LTS recommended)</li>
        <li><strong>npm:</strong> v8.0.0 or higher</li>
        <li><strong>Modern Browser:</strong> Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</li>
        <li><strong>Azure Subscription:</strong> Active subscription with admin access</li>
        <li><strong>Azure AD Tenant:</strong> Access to Azure Active Directory</li>
        <li><strong>App Registration:</strong> Configured with proper API permissions</li>
    </ul>

    <h3>Installation Steps</h3>
    <div class="code">
        <p># Clone repository<br>
        git clone &lt;repository-url&gt;<br>
        cd Dashboard</p>
        
        <p># Install dependencies<br>
        npm run install:all</p>
        
        <p># Configure environment<br>
        cp backend/.env.example backend/.env<br>
        # Edit backend/.env with Azure credentials</p>
        
        <p># Start application<br>
        npm run start:full</p>
    </div>

    <div class="page-break"></div>

    <h1 id="features">4. Core Features & Usage</h1>
    
    <h3>Dashboard Overview</h3>
    <p>The main dashboard provides real-time insights into organizational security posture with key performance indicators, visual analytics, and interactive charts.</p>

    <h3>Key Features</h3>
    <ul>
        <li><strong>User Management:</strong> Complete CRUD operations with role-based access</li>
        <li><strong>Device Monitoring:</strong> Real-time device status and risk assessment</li>
        <li><strong>Compliance Tracking:</strong> 14-day activity monitoring and violation detection</li>
        <li><strong>Alert System:</strong> Automated email notifications for non-compliant users</li>
        <li><strong>Reporting:</strong> CSV and PDF export capabilities</li>
        <li><strong>Multi-Factor Authentication:</strong> TOTP-based MFA with Google Authenticator</li>
    </ul>

    <div class="page-break"></div>

    <h1 id="security">5. Security Considerations</h1>
    
    <h3>Authentication & Authorization</h3>
    <ul>
        <li><strong>Multi-Factor Authentication:</strong> TOTP-based MFA compatible with Google Authenticator</li>
        <li><strong>Role-Based Access Control:</strong> GlobalAdmin, Admin, and Viewer roles</li>
        <li><strong>Password Security:</strong> bcrypt hashing with cost factor 12</li>
        <li><strong>Session Management:</strong> Secure session handling with automatic timeouts</li>
    </ul>

    <h3>Data Privacy</h3>
    <ul>
        <li><strong>Minimal Data Collection:</strong> Only necessary user and device information</li>
        <li><strong>No Persistent Storage:</strong> Data cached temporarily in browser localStorage</li>
        <li><strong>Automatic Cleanup:</strong> Session data cleared on logout</li>
        <li><strong>GDPR Compliance:</strong> Adherent to privacy regulations</li>
    </ul>

    <div class="page-break"></div>

    <h1 id="maintenance">6. Maintenance & Troubleshooting</h1>
    
    <h3>Common Issues</h3>
    <table>
        <tr>
            <th>Issue</th>
            <th>Symptoms</th>
            <th>Solution</th>
        </tr>
        <tr>
            <td>No Data Showing</td>
            <td>Empty dashboard, loading indicators</td>
            <td>Check backend server status and API permissions</td>
        </tr>
        <tr>
            <td>Authentication Errors</td>
            <td>401/403 errors, login failures</td>
            <td>Verify Azure credentials and permissions</td>
        </tr>
        <tr>
            <td>MFA Issues</td>
            <td>Invalid codes, QR code problems</td>
            <td>Check system time synchronization</td>
        </tr>
    </table>

    <h3>Support Escalation</h3>
    <ul>
        <li><strong>Level 1:</strong> Basic troubleshooting and user support</li>
        <li><strong>Level 2:</strong> Technical issues and configuration problems</li>
        <li><strong>Level 3:</strong> Development team and architectural issues</li>
    </ul>

    <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666;">
        <p><strong>Document Version:</strong> 1.2.0</p>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Document Owner:</strong> SecureOps Development Team</p>
        <p><strong>Approved By:</strong> IT Security Manager</p>
    </div>
</body>
</html>`;

    // Create and download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Microsoft-365-Defender-Dashboard-Documentation-v1.2.0-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};