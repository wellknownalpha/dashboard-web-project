import { IndividualEmailService } from './individualEmailService.ts';
import { User, Device } from '../types.ts'; // Adjust this path if needed

const testUser: User = {
    displayName: "Test User",
    mail: "bharath.m@exclcloud.com" 
};

const testDevices: Device[] = [
    {
        deviceName: "Test Laptop",
        lastSeen: null
    },
    {
        deviceName: "Test Phone",
        lastSeen: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() // 16 days ago
    }
];

async function runEmailTest() {
    const result = await IndividualEmailService.sendUserAlert(testUser, testDevices, 16);
    console.log("✅ Email test result:", result ? "Success" : "Failed");
}

runEmailTest();
