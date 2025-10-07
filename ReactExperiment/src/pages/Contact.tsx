function Contact() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Contact</h1>
      <p className="text-lg mb-6">
        Get in touch with us for any questions or inquiries.
      </p>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Email</h2>
          <p className="text-gray-700">contact@example.com</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Location</h2>
          <p className="text-gray-700">123 Main Street, City, Country</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
