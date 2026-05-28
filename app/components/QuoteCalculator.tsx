"use client";

import { useState, useEffect } from "react";
import { calculateQuote, type QuoteData } from "@/lib/pricing";

export default function QuoteCalculator() {
  const [formData, setFormData] = useState<QuoteData>({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    streetAddress: "",
    yardSize: "small",
    servicesNeeded: [],
    yardCondition: "well-maintained",
    howOften: "one-time",
    photos: [],
    additionalNotes: "",
  });

  const [estimate, setEstimate] = useState({
    base: 0,
    addons: 0,
    total: { min: 0, max: 0 },
  });
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Real-time quote calculation
  useEffect(() => {
    const quote = calculateQuote(formData);
    setEstimate(quote);
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      servicesNeeded: checked
        ? [...prev.servicesNeeded, value]
        : prev.servicesNeeded.filter((service) => service !== value),
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      // Validate file size (50MB max) and type
      if (file.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB");
        return;
      }

      if (!["image/jpeg", "image/png", "video/mp4"].includes(file.type)) {
        alert("Only JPG, PNG, and MP4 files are allowed");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview((prev) => [...prev, base64]);
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, base64],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotoPreview((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const finalQuote = calculateQuote(formData);

      const response = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimate: finalQuote,
        }),
      });

      if (!response.ok) throw new Error("Failed to send quote");

      setSubmitStatus("success");
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          fullName: "",
          phoneNumber: "",
          emailAddress: "",
          streetAddress: "",
          yardSize: "small",
          servicesNeeded: [],
          yardCondition: "well-maintained",
          howOften: "one-time",
          photos: [],
          additionalNotes: "",
        });
        setPhotoPreview([]);
        setSubmitStatus("idle");
      }, 3000);
    } catch (error) {
      console.error(error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-2xl overflow-hidden">
      <form onSubmit={handleSubmit}>
        {/* Section 1: Your Details */}
        <section className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-sm font-bold">
              1
            </span>
            <h2 className="text-white text-lg font-semibold">YOUR DETAILS</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Jane Smith"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-md border border-2 border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="905-555-0100"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-md border border-2 border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Email address
              </label>
              <input
                type="email"
                name="emailAddress"
                placeholder="jane@email.com"
                value={formData.emailAddress}
                onChange={handleInputChange}
                required
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-md border border-2 border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Street address{" "}
                <span className="text-gray-600">(Oshawa / Durham Region)</span>
              </label>
              <input
                type="text"
                name="streetAddress"
                placeholder="123 Main St, Oshawa, ON"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
                className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-md border border-2 border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-600"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Yard Size */}
        <section className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-sm font-bold">
              2
            </span>
            <h2 className="text-white text-lg font-semibold">YARD SIZE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: "small",
                label: "Small",
                desc: "Townhouse / semi, ~under 2,000 sq ft",
                price: "from $50",
              },
              {
                id: "medium",
                label: "Medium",
                desc: "Detached home, ~2,000–5,000 sq ft",
                price: "from $70",
              },
              {
                id: "large",
                label: "Large",
                desc: "Big lot / corner, 5,000+ sq ft",
                price: "from $100",
              },
            ].map((yard) => (
              <label
                key={yard.id}
                className={`cursor-pointer p-5 rounded-lg border-2 transition-all ${
                  formData.yardSize === yard.id
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-gray-700 bg-[#2a2a2a] hover:border-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="yardSize"
                  value={yard.id}
                  checked={formData.yardSize === yard.id}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {yard.label}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 leading-tight">
                    {yard.desc}
                  </p>
                  <p className="text-green-400 font-semibold text-base mt-3">
                    {yard.price}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Section 3: Services Needed */}
        <section className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-sm font-bold">
              3
            </span>
            <h2 className="flex flex-col sm:flex-row sm:gap-2 items-center text-white text-lg font-semibold">
              SERVICES NEEDED{" "}
              <span className="text-gray-500 font-normal text-sm">
                SELECT ALL THAT APPLY
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "grass-cutting",
                label: "Grass cutting",
                price: "+$0 (base)",
              },
              { id: "weed-removal", label: "Weed removal", price: "+$40–$60" },
              {
                id: "bush-trimming",
                label: "Bush trimming",
                price: "+$40–$70",
              },
              { id: "deep-cleanup", label: "Deep cleanup", price: "+$60–$150" },
              { id: "garden-beds", label: "Garden beds", price: "+$30–$50" },
            ].map((service) => (
              <label
                key={service.id}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                  formData.servicesNeeded.includes(service.id)
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-gray-700 bg-[#2a2a2a] hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    value={service.id}
                    checked={formData.servicesNeeded.includes(service.id)}
                    onChange={handleCheckboxChange}
                    className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-[#2a2a2a]"
                  />
                  <span className="text-white font-medium">
                    {service.label}
                  </span>
                </div>
                <span className="text-green-400 text-sm font-semibold">
                  {service.price}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Section 4: Yard Condition */}
        <section className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-sm font-bold">
              4
            </span>
            <h2 className="text-white text-lg font-semibold">YARD CONDITION</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "well-maintained",
                label: "Well maintained",
                desc: "Regular cuts, no major overgrowth\nno surcharge",
              },
              {
                id: "overgrown",
                label: "Overgrown",
                desc: "Needs extra work to get back in shape\n+$30–$50",
              },
            ].map((condition) => (
              <label
                key={condition.id}
                className={`cursor-pointer p-5 rounded-lg border-2 transition-all ${
                  formData.yardCondition === condition.id
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-gray-700 bg-[#2a2a2a] hover:border-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="yardCondition"
                  value={condition.id}
                  checked={formData.yardCondition === condition.id}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {condition.label}
                  </h3>
                  <p className="text-gray-400 text-sm whitespace-pre-line leading-relaxed">
                    {condition.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Section 5: How Often */}
        <section className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-sm font-bold">
              5
            </span>
            <h2 className="text-white text-lg font-semibold">HOW OFTEN?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "one-time", label: "One-time", discount: null },
              {
                id: "every-2-weeks",
                label: "Every 2 weeks",
                discount: "save 10%",
              },
              { id: "weekly", label: "Weekly", discount: "save 15%" },
            ].map((freq) => (
              <label
                key={freq.id}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  formData.howOften === freq.id
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-gray-700 bg-[#2a2a2a] hover:border-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="howOften"
                  value={freq.id}
                  checked={formData.howOften === freq.id}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <h3 className="text-white font-semibold">{freq.label}</h3>
                  {freq.discount && (
                    <p className="text-green-400 text-sm mt-1 font-medium">
                      {freq.discount}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Section 6: Photos/Videos */}
        <section className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-sm font-bold">
              6
            </span>
            <h2 className="flex flex-col sm:flex-row sm:gap-2 items-start sm:items-center text-white text-lg font-semibold">
              PHOTOS / VIDEOS OF YOUR YARD{" "}
              <span className="text-gray-500 font-normal text-sm">
                OPTIONAL BUT HELPS ACCURACY
              </span>
            </h2>
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,video/mp4"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="block w-full p-12 border-2 border-dashed border-gray-700 rounded-lg text-center cursor-pointer hover:border-gray-600 transition-all bg-[#2a2a2a]"
          >
            <svg
              className="mx-auto h-16 w-16 text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-white text-lg font-medium mb-1">
              Tap to upload photos or videos
            </p>
            <p className="text-gray-500 text-sm">
              JPG, PNG, MP4 — up to 10 files, 50MB each
            </p>
          </label>

          {photoPreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {photoPreview.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 7: Additional Notes */}
        <section className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-sm font-bold">
              7
            </span>
            <h2 className="flex flex-col sm:flex-row sm:gap-2 items-start sm:items-center text-white text-lg font-semibold">
              ANYTHING ELSE WE SHOULD KNOW?{" "}
              <span className="text-gray-500 font-normal text-sm">
                OPTIONAL
              </span>
            </h2>
          </div>

          <textarea
            name="additionalNotes"
            placeholder="E.g. gate access, dog in yard, specific areas to focus on..."
            value={formData.additionalNotes}
            onChange={handleInputChange}
            rows={4}
            className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-md border border-gray-700 focus:border-blue-500 focus:outline-none placeholder-gray-600 resize-none"
          />
        </section>

        {/* Instant Estimate Summary */}
        <section className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-white text-lg font-semibold">
              Your instant estimate
            </h2>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">
                {formData.yardSize === "small" && "Grass cutting — small yard"}
                {formData.yardSize === "medium" &&
                  "Grass cutting — medium yard"}
                {formData.yardSize === "large" && "Grass cutting — large yard"}
              </span>
              <span className="text-white font-semibold">
                ${estimate.base > 0 ? `${estimate.base}` : "—"}
              </span>
            </div>

            {formData.servicesNeeded.length > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Add-on services</span>
                <span className="text-white font-semibold">
                  +${estimate.addons > 0 ? `${estimate.addons}` : "0"}
                </span>
              </div>
            )}

            <div className="border-t border-gray-800 pt-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">Estimated total</p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Final price confirmed after we review your photos. No
                    surprises.
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-green-400 text-3xl sm:text-4xl font-bold whitespace-nowrap">
                    ${estimate.total.min}–${estimate.total.max}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#ffffff] hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold py-4 rounded-lg mt-6 transition-all flex items-center justify-center gap-2 text-lg shadow-lg disabled:shadow-none"
            style={{ backgroundColor: isSubmitting ? "#374151" : "#ffffff" }}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit & get my quote
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </button>

          {submitStatus === "success" && (
            <div className="bg-green-900/30 border border-green-700 text-green-400 p-4 rounded-lg text-center mt-4">
              ✓ Quote sent successfully! Check your email at{" "}
              {formData.emailAddress}
            </div>
          )}
          {submitStatus === "error" && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 p-4 rounded-lg text-center mt-4">
              Failed to send quote. Please try again or contact support.
            </div>
          )}
        </section>
      </form>
    </div>
  );
}
