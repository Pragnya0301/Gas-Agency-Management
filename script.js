// Firebase Config (Replace with your own)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    projectId: "YOUR_PROJECT_ID",
    // ... rest of config
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/**
 * LOGGING UTILITY
 * Satisfies: "Logging is a must for every action"
 */
function systemLog(action, status, userId) {
    const logData = {
        action: action,
        status: status,
        user: userId,
        timestamp: new Date().toLocaleString()
    };
    console.log(`[SYSTEM_LOG]:`, logData);
    // Persist log to Firebase for admin auditing
    db.collection("logs").add(logData);
}

// User Registration: Logic to assign 12 barrels initially
async function handleRegister() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
        const res = await auth.createUserWithEmailAndPassword(email, pass);
        await db.collection("users").doc(res.user.uid).set({
            email: email,
            barrelsRemaining: 12,
            role: "member"
        });
        systemLog("USER_REGISTRATION", "SUCCESS", email);
        alert("Registered! You have 12 barrels for the year.");
    } catch (err) {
        systemLog("USER_REGISTRATION", "FAILED", email);
        alert(err.message);
    }
}

// Booking Logic: Safe & Optimized
async function requestBooking() {
    const user = auth.currentUser;
    const userRef = db.collection("users").doc(user.uid);
    
    const doc = await userRef.get();
    const currentBarrels = doc.data().barrelsRemaining;

    if (currentBarrels > 0) {
        await db.collection("bookings").add({
            userId: user.uid,
            status: "pending",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        systemLog("BOOKING_REQUEST", "PENDING", user.email);
        alert("Booking request sent to Administrator!");
    } else {
        systemLog("BOOKING_REQUEST", "DENIED_LIMIT_REACHED", user.email);
        alert("Error: You have used all 12 barrels for this year.");
    }
}