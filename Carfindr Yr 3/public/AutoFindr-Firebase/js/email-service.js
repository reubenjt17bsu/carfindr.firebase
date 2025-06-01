// Email service for test drive confirmations using EmailJS
class EmailService {
  constructor() {
    // Initialize EmailJS with your public key
    this.publicKey = "YOUR_EMAILJS_PUBLIC_KEY" // Replace with your actual EmailJS public key
    this.serviceId = "YOUR_SERVICE_ID" // Replace with your EmailJS service ID
    this.templateId = "test_drive_confirmation" // Template ID for test drive confirmations
    this.adminTemplateId = "admin_notification" // Template ID for admin notifications

    this.init()
  }

  // Initialize EmailJS
  init() {
    if (typeof emailjs !== "undefined") {
      emailjs.init(this.publicKey)
    } else {
      console.error("EmailJS library not loaded")
    }
  }

  // Send test drive confirmation email to customer
  async sendTestDriveConfirmation(bookingData) {
    try {
      const templateParams = {
        to_name: bookingData.customerName,
        to_email: bookingData.customerEmail,
        customer_name: bookingData.customerName,
        customer_phone: bookingData.customerPhone,
        car_make: bookingData.carMake,
        car_model: bookingData.carModel,
        car_year: bookingData.carYear,
        test_drive_date: this.formatDate(bookingData.testDriveDate),
        test_drive_time: bookingData.testDriveTime,
        dealership_name: "Elite Car Series",
        dealership_address: "123 Luxury Auto Blvd, Premium City, PC 12345",
        dealership_phone: "(555) 123-CARS",
        booking_reference: bookingData.bookingReference,
        confirmation_link: `${window.location.origin}/confirm-booking.html?ref=${bookingData.bookingReference}`,
        cancellation_link: `${window.location.origin}/cancel-booking.html?ref=${bookingData.bookingReference}`,
      }

      const response = await emailjs.send(this.serviceId, this.templateId, templateParams)

      console.log("Customer confirmation email sent successfully:", response)
      return { success: true, response }
    } catch (error) {
      console.error("Error sending customer confirmation email:", error)
      return { success: false, error }
    }
  }

  // Send notification email to admin/dealership
  async sendAdminNotification(bookingData) {
    try {
      const templateParams = {
        to_email: "admin@elitecarseries.com", // Admin email
        customer_name: bookingData.customerName,
        customer_email: bookingData.customerEmail,
        customer_phone: bookingData.customerPhone,
        car_make: bookingData.carMake,
        car_model: bookingData.carModel,
        car_year: bookingData.carYear,
        test_drive_date: this.formatDate(bookingData.testDriveDate),
        test_drive_time: bookingData.testDriveTime,
        booking_reference: bookingData.bookingReference,
        special_requests: bookingData.specialRequests || "None",
        booking_timestamp: new Date().toLocaleString(),
      }

      const response = await emailjs.send(this.serviceId, this.adminTemplateId, templateParams)

      console.log("Admin notification email sent successfully:", response)
      return { success: true, response }
    } catch (error) {
      console.error("Error sending admin notification email:", error)
      return { success: false, error }
    }
  }

  // Send reminder email (24 hours before test drive)
  async sendTestDriveReminder(bookingData) {
    try {
      const templateParams = {
        to_name: bookingData.customerName,
        to_email: bookingData.customerEmail,
        customer_name: bookingData.customerName,
        car_make: bookingData.carMake,
        car_model: bookingData.carModel,
        test_drive_date: this.formatDate(bookingData.testDriveDate),
        test_drive_time: bookingData.testDriveTime,
        dealership_name: "Elite Car Series",
        dealership_address: "123 Luxury Auto Blvd, Premium City, PC 12345",
        dealership_phone: "(555) 123-CARS",
        booking_reference: bookingData.bookingReference,
        preparation_tips: this.getPreparationTips(),
      }

      const response = await emailjs.send(
        this.serviceId,
        "test_drive_reminder", // Reminder template ID
        templateParams,
      )

      console.log("Reminder email sent successfully:", response)
      return { success: true, response }
    } catch (error) {
      console.error("Error sending reminder email:", error)
      return { success: false, error }
    }
  }

  // Format date for email templates
  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get preparation tips for test drive
  getPreparationTips() {
    return `
• Bring a valid driver's license
• Arrive 15 minutes early for paperwork
• Bring proof of insurance
• Wear comfortable driving shoes
• Prepare any questions about the vehicle
• Consider bringing a co-driver for a second opinion
    `.trim()
  }

  // Schedule reminder email (to be called by a scheduler)
  scheduleReminder(bookingData) {
    const testDriveDate = new Date(bookingData.testDriveDate)
    const reminderDate = new Date(testDriveDate.getTime() - 24 * 60 * 60 * 1000) // 24 hours before
    const now = new Date()

    if (reminderDate > now) {
      const timeUntilReminder = reminderDate.getTime() - now.getTime()

      setTimeout(() => {
        this.sendTestDriveReminder(bookingData)
      }, timeUntilReminder)

      console.log(`Reminder scheduled for ${reminderDate.toLocaleString()}`)
    }
  }
}

// Initialize email service
const emailService = new EmailService()

// Export for global access
window.emailService = emailService
