// External libraries for PDF generation and HTML to canvas conversion
import jsPDF from 'jspdf';           // PDF generation library
import html2canvas from 'html2canvas'; // Converts HTML elements to canvas for image capture

// Type definitions and utility functions
import { User, Device } from '../types';
import { getComplianceStats } from './complianceExport';

/**
 * Export comprehensive dashboard report to PDF format
 * Captures dashboard charts as images and includes detailed statistics
 * Generates a professional report suitable for management and compliance auditing
 * 
 * Features:
 * - Executive summary with key metrics
 * - Visual charts captured from dashboard
 * - Device activity compliance details
 * - Automatic pagination for large datasets
 * 
 * @param {User[]} users - Array of users from Microsoft Graph API
 * @param {Device[]} devices - Array of devices from Microsoft Defender API
 */
export const exportDashboardToPDF = async (users: User[], devices: Device[]) => {
    // Initialize PDF document with A4 portrait orientation
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add report title and generation timestamp
    pdf.setFontSize(20);
    pdf.text('SecureOps Dashboard Report', 20, 20);
    
    pdf.setFontSize(12);
    const currentDate = new Date().toLocaleDateString();
    pdf.text(`Generated: ${currentDate}`, 20, 30);
    
    // Generate executive summary with key performance indicators
    const complianceStats = getComplianceStats(users, devices);
    const highRiskDevices = devices.filter(d => d.riskLevel === 'High').length;
    
    pdf.setFontSize(14);
    pdf.text('Executive Summary', 20, 45);
    
    // Create summary statistics array for consistent formatting
    pdf.setFontSize(10);
    const summaryText = [
        `Total Users: ${users.length}`,
        `Total Devices: ${devices.length}`,
        `High Risk Devices: ${highRiskDevices}`,
        `Compliance Rate: ${complianceStats.complianceRate.toFixed(1)}%`,
        `Compliant Users: ${complianceStats.compliantUsers}`,
        `Non-Compliant Users: ${complianceStats.nonCompliantUsers}`
    ];
    
    // Add each summary statistic with proper spacing
    summaryText.forEach((text, index) => {
        pdf.text(text, 20, 55 + (index * 6));
    });
    
    let yPosition = 100; // Track current vertical position for content placement
    
    try {
        // Define dashboard chart elements to capture
        // Each chart is identified by its data-chart attribute for reliable selection
        const chartElements = [
            { selector: '[data-chart="risk-overview"]', title: 'Device Risk Overview' },
            { selector: '[data-chart="compliance"]', title: 'Compliance Status' },
            { selector: '[data-chart="os-distribution"]', title: 'Device OS Distribution' },
            { selector: '[data-chart="device-activity"]', title: 'Device Activity Compliance' }
        ];
        
        // Process each chart element for PDF inclusion
        for (const chart of chartElements) {
            const element = document.querySelector(chart.selector) as HTMLElement;
            if (element) {
                // Convert HTML element to canvas with high quality settings
                const canvas = await html2canvas(element, {
                    scale: 2,           // High resolution for crisp images
                    useCORS: true,      // Allow cross-origin images
                    allowTaint: true    // Allow tainted canvas for external resources
                });
                
                // Convert canvas to base64 image data
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 40;  // Leave margins on both sides
                const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
                
                // Check if chart fits on current page, add new page if needed
                if (yPosition + imgHeight > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;
                }
                
                // Add chart title and image to PDF
                pdf.setFontSize(12);
                pdf.text(chart.title, 20, yPosition);
                pdf.addImage(imgData, 'PNG', 20, yPosition + 5, imgWidth, imgHeight);
                yPosition += imgHeight + 20; // Update position for next element
            }
        }
        
        // Add detailed device activity compliance section
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text('Device Activity Compliance Details', 20, 20);
        
        // Get list of users with inactive devices
        const inactiveUsers = getInactiveUsers(users, devices);
        
        if (inactiveUsers.length > 0) {
            // Section header for inactive users
            pdf.setFontSize(12);
            pdf.text(`Users with Inactive Devices (>${14} days):`, 20, 35);
            
            pdf.setFontSize(10);
            let detailY = 45;
            
            // List inactive users (limit to 20 for space management)
            inactiveUsers.slice(0, 20).forEach((item, index) => {
                // Check if we need a new page
                if (detailY > pageHeight - 30) {
                    pdf.addPage();
                    detailY = 20;
                }
                
                // Add user details with proper formatting
                pdf.text(`${index + 1}. ${item.user.displayName} (${item.user.mail})`, 20, detailY);
                pdf.text(`   Last activity: ${item.daysSinceLastSeen} days ago`, 25, detailY + 5);
                detailY += 12; // Space between entries
            });
            
            // Indicate if there are more users than displayed
            if (inactiveUsers.length > 20) {
                pdf.text(`... and ${inactiveUsers.length - 20} more users`, 20, detailY + 5);
            }
        } else {
            // Positive compliance message when all users are active
            pdf.setFontSize(12);
            pdf.text('✅ All users have active devices within the last 14 days', 20, 35);
        }
        
    } catch (error) {
        // Handle errors gracefully and inform user
        console.error('Error capturing charts:', error);
        pdf.text('Error: Could not capture dashboard charts', 20, yPosition);
        pdf.text('Please ensure the dashboard is fully loaded before exporting.', 20, yPosition + 10);
    }
    
    // Generate filename with current date and save PDF
    const filename = `SecureOps-Dashboard-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
};

/**
 * Helper function to identify users with inactive devices
 * Replicates the logic from notificationService for PDF reporting
 * 
 * Business Logic:
 * - Users are inactive if ALL their devices haven't been seen for >14 days
 * - If a user has even one active device, they are considered compliant
 * - Only users with registered devices are evaluated
 * 
 * @param {User[]} users - Array of users from Microsoft Graph API
 * @param {Device[]} devices - Array of devices from Microsoft Defender API
 * @returns {Array} Array of inactive users with days since last activity
 */
const getInactiveUsers = (users: User[], devices: Device[]) => {
    const userDeviceMap = new Map<string, Device[]>();
    const now = new Date();
    
    // Create user-to-devices mapping for efficient lookup
    devices.forEach(device => {
        if (!userDeviceMap.has(device.userId)) {
            userDeviceMap.set(device.userId, []);
        }
        userDeviceMap.get(device.userId)!.push(device);
    });

    const inactiveUsers: { user: User; daysSinceLastSeen: number }[] = [];

    // Evaluate each user's device activity status
    users.forEach(user => {
        const userDevices = userDeviceMap.get(user.id) || [];
        
        // Skip users without registered devices
        if (userDevices.length === 0) return;

        let isActive = false;           // Track if user has any active device
        let oldestLastSeen = now;       // Track oldest last seen date

        // Check activity status for all user's devices
        userDevices.forEach(device => {
            if (device.lastSeen) {
                const lastSeenDate = new Date(device.lastSeen);
                const daysSinceLastSeen = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // If any device is active within 14 days, user is compliant
                if (daysSinceLastSeen <= 14) {
                    isActive = true;
                }
                
                // Track oldest last seen date for reporting
                if (lastSeenDate < oldestLastSeen) {
                    oldestLastSeen = lastSeenDate;
                }
            }
        });

        // Add user to inactive list if no devices are active
        if (!isActive) {
            const daysSinceLastSeen = Math.floor((now.getTime() - oldestLastSeen.getTime()) / (1000 * 60 * 60 * 24));
            inactiveUsers.push({ user, daysSinceLastSeen });
        }
    });

    return inactiveUsers;
};