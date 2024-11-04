var bookingID = document.getElementById('booking-id').value;
var paymentCompleted = false;

// Set end time 30 seconds from now
const endTime = Date.now() + (7 * 60 * 1000); // 30 seconds in milliseconds

const countdownElement = document.getElementById("countdown");
let timerInterval = setInterval(updateCountdown, 100); // Update more frequently

function updateCountdown() {
    const currentTime = Date.now();
    const remainingTime = endTime - currentTime;
    
    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        countdownElement.textContent = "00:00";
        failPayment(bookingID);
        return;
    }
    
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    
    countdownElement.textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Optional: Update page title to show countdown
    document.title = `(${countdownElement.textContent}) Payment`;
}

function failPayment(bookingID) {
    if (paymentCompleted) return;
    paymentCompleted = true;
    
    clearInterval(timerInterval);
    
    fetch(`/payment/fail/${bookingID}`, {
        method: 'POST'
    }).then(() => {
        window.location.href = '/payment-failure';
    }).catch(error => {
        console.error('Error in failing payment:', error);
        alert("ระยะเวลาชำระเงินสิ้นสุดลงแล้ว");
    });
}
function cancelBooking(bookingID){
    let con = confirm("ต้องการยกเลิกการจองหรือไม่")
    if (con){
        failPayment(bookingID) 
    }

}

function submitCardPayment(event) {
    event.preventDefault(); // Prevent default form submission
    completePayment(bookingID);
}
function completePayment(bookingID) {
    clearInterval(timerInterval);
    paymentCompleted = true;
    fetch(`/payment/success/${bookingID}`, { method: 'POST' })
    .then(() => window.location.href = `/booking-details/${bookingID}`);
}

function checkPaymentStatus(bookingID) {
    const statusInterval = setInterval(async () => {
        if (paymentCompleted) {
            clearInterval(statusInterval);
            return;
        }

        try {
            const response = await fetch(`/check-payment-status/${bookingID}`);
            const result = await response.json();
            if (result.PaymentStatus === 'Success') {
                paymentCompleted = true;
                clearInterval(statusInterval);
               
                window.location.href = `/booking-details/${bookingID}`;
            } else if (result.PaymentStatus === 'Failed') {
                paymentCompleted = true;
                clearInterval(statusInterval);
             
                window.location.href = "/payment-failure";
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    }, 5000);
}

// Handle page unload
window.addEventListener('unload', function() {
    if (!paymentCompleted) {
        navigator.sendBeacon(`/payment/fail/${bookingID}`);
    }
});

// Handle navigation back
window.addEventListener('popstate', function() {
    if (!paymentCompleted) {
        failPayment(bookingID);
    }
});

// Handle beforeunload
window.addEventListener('beforeunload', function(event) {
    if (!paymentCompleted) {
        const message = "You have an ongoing payment. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
    }
});

// Initial update
updateCountdown();
checkPaymentStatus(bookingID);