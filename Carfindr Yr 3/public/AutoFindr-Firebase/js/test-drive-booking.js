// Enhanced test drive booking with email notifications
class TestDriveBooking {
  constructor() {
    this.bookingForm = document.getElementById("test-drive-form")
    this.init()
  }

  init() {
    if (this.bookingForm) {
      this.bookingForm.addEventListener("submit", this.handleBookingSubmission.bind(this))
    }

    // Initialize time slots
    this.populateTimeSlots()

    // Add date change listener to update available times
    const dateInput = document.getElementById("test-drive-date")
    if (dateInput) {
      dateInput.addEventListener("change", this.updateAvailableTimeSlots.bind(this))
    }
  }

  // Handle test drive booking submission
  async handleBookingSubmission(event) {
    event.preventDefault()

    const user = firebase.auth().currentUser
    if (!user) {
      showNotification("Please log in to book a test drive", "error")
      window.location.href = "auth.html"
      return
    }

    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]')
    const originalText = submitButton.textContent
    submitButton.textContent = "Booking..."
    submitButton.disabled = true

    try {
      // Collect form data
      const formData = new FormData(event.target)
      const bookingData = this.collectBookingData(formData, user)

      // Validate booking data
      const validation = this.validateBookingData(bookingData)
      if (!validation.isValid) {
        throw new Error(validation.message)
      }

      // Generate booking reference
      bookingData.bookingReference = this.generateBookingReference()

      // Save booking to Firebase
      await this.saveBookingToDatabase(bookingData)

      // Send confirmation emails
      const emailResults = await this.sendConfirmationEmails(bookingData)

      // Show success message
      this.showBookingSuccess(bookingData, emailResults)

      // Reset form
      event.target.reset()

      // Schedule reminder email
      emailService.scheduleReminder(bookingData)
    } catch (error) {
      console.error("Booking error:", error)
      showNotification(`Booking failed: ${error.message}`, "error")
    } finally {
      // Reset button state
      submitButton.textContent = originalText
      submitButton.disabled = false
    }
  }

  // Collect booking data from form
  collectBookingData(formData, user) {
    return {
      customerId: user.uid,
      customerName: user.displayName || formData.get("customer-name"),
      customerEmail: user.email || formData.get("customer-email"),
      customerPhone: formData.get("customer-phone"),
      carMake: formData.get("test-drive-make"),
      carModel: formData.get("test-drive-model"),
      carYear: formData.get("test-drive-year") || "Latest",
      testDriveDate: formData.get("test-drive-date"),
      testDriveTime: formData.get("test-drive-time"),
      specialRequests: formData.get("special-requests"),
      emailNotifications: formData.get("email-notifications") === "on",
      smsNotifications: formData.get("sms-notifications") === "on",
      bookingTimestamp: new Date().toISOString(),
      status: "confirmed",
    }
  }

  // Validate booking data
  validateBookingData(bookingData) {
    if (!bookingData.customerName) {
      return { isValid: false, message: "Customer name is required" }
    }

    if (!bookingData.customerEmail) {
      return { isValid: false, message: "Customer email is required" }
    }

    if (!bookingData.customerPhone) {
      return { isValid: false, message: "Phone number is required" }
    }

    if (!bookingData.carMake || !bookingData.carModel) {
      return { isValid: false, message: "Please select a car make and model" }
    }

    if (!bookingData.testDriveDate) {
      return { isValid: false, message: "Test drive date is required" }
    }

    if (!bookingData.testDriveTime) {
      return { isValid: false, message: "Test drive time is required" }
    }

    // Check if date is in the future
    const selectedDate = new Date(bookingData.testDriveDate)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    if (selectedDate < tomorrow) {
      return { isValid: false, message: "Test drive must be scheduled at least 1 day in advance" }
    }

    return { isValid: true }
  }

  // Generate unique booking reference
  generateBookingReference() {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `TD-${timestamp}-${random}`.toUpperCase()
  }

  // Save booking to Firebase database
  async saveBookingToDatabase(bookingData) {
    try {
      const docRef = await firebase.firestore().collection("testDriveBookings").add(bookingData)

      bookingData.firestoreId = docRef.id
      console.log("Booking saved to database:", docRef.id)

      return docRef.id
    } catch (error) {
      console.error("Error saving booking to database:", error)
      throw new Error("Failed to save booking to database")
    }
  }

  // Send confirmation emails
  async sendConfirmationEmails(bookingData) {
    const results = {
      customerEmail: { success: false },
      adminEmail: { success: false },
    }

    try {
      // Send customer confirmation email
      if (bookingData.emailNotifications) {
        results.customerEmail = await emailService.sendTestDriveConfirmation(bookingData)
      }

      // Send admin notification email
      results.adminEmail = await emailService.sendAdminNotification(bookingData)

      return results
    } catch (error) {
      console.error("Error sending confirmation emails:", error)
      return results
    }
  }

  // Show booking success message
  showBookingSuccess(bookingData, emailResults) {
    const successMessage = `
      <div class="booking-success">
        <h3>🎉 Test Drive Booked Successfully!</h3>
        <div class="booking-details">
          <p><strong>Booking Reference:</strong> ${bookingData.bookingReference}</p>
          <p><strong>Vehicle:</strong> ${bookingData.carYear} ${bookingData.carMake} ${bookingData.carModel}</p>
          <p><strong>Date & Time:</strong> ${emailService.formatDate(bookingData.testDriveDate)} at ${bookingData.testDriveTime}</p>
          <p><strong>Location:</strong> Elite Car Series Showroom</p>
        </div>
        <div class="email-status">
          ${
            emailResults.customerEmail.success
              ? '<p class="email-success">✅ Confirmation email sent to your inbox</p>'
              : '<p class="email-warning">⚠️ Confirmation email could not be sent</p>'
          }
        </div>
        <div class="next-steps">
          <h4>What's Next?</h4>
          <ul>
            <li>You'll receive a reminder email 24 hours before your test drive</li>
            <li>Bring a valid driver's license and proof of insurance</li>
            <li>Arrive 15 minutes early for paperwork</li>
            <li>Our team will contact you if any changes are needed</li>
          </ul>
        </div>
        <div class="booking-actions">
          <button onclick="this.closest('.booking-success').remove()" class="close-btn">Close</button>
          <button onclick="window.print()" class="print-btn">Print Confirmation</button>
        </div>
      </div>
    `

    // Create and show success modal
    const modal = document.createElement("div")
    modal.className = "booking-success-modal"
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        ${successMessage}
      </div>
    `

    document.body.appendChild(modal)

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (modal.parentElement) {
        modal.remove()
      }
    }, 30000)
  }

  // Populate time slots
  populateTimeSlots() {
    const timeSelect = document.getElementById("test-drive-time")
    if (!timeSelect) return

    const timeSlots = [
      "09:00 AM",
      "09:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "12:00 PM",
      "12:30 PM",
      "01:00 PM",
      "01:30 PM",
      "02:00 PM",
      "02:30 PM",
      "03:00 PM",
      "03:30 PM",
      "04:00 PM",
      "04:30 PM",
      "05:00 PM",
      "05:30 PM",
    ]

    timeSelect.innerHTML = '<option value="">Select Time</option>'

    timeSlots.forEach((time) => {
      const option = document.createElement("option")
      option.value = time
      option.textContent = time
      timeSelect.appendChild(option)
    })
  }

  // Update available time slots based on selected date
  async updateAvailableTimeSlots() {
    const dateInput = document.getElementById("test-drive-date")
    const timeSelect = document.getElementById("test-drive-time")

    if (!dateInput.value || !timeSelect) return

    try {
      // Get existing bookings for the selected date
      const bookings = await firebase
        .firestore()
        .collection("testDriveBookings")
        .where("testDriveDate", "==", dateInput.value)
        .where("status", "==", "confirmed")
        .get()

      const bookedTimes = []
      bookings.forEach((doc) => {
        bookedTimes.push(doc.data().testDriveTime)
      })

      // Update time options
      const options = timeSelect.querySelectorAll("option")
      options.forEach((option) => {
        if (option.value && bookedTimes.includes(option.value)) {
          option.disabled = true
          option.textContent = `${option.value} (Booked)`
        } else if (option.value) {
          option.disabled = false
          option.textContent = option.value
        }
      })
    } catch (error) {
      console.error("Error checking available time slots:", error)
    }
  }
}

// Initialize test drive booking
document.addEventListener("DOMContentLoaded", () => {
  new TestDriveBooking()
})
