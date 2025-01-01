"use client"

import { useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    })
    const [recaptchaValue, setRecaptchaValue] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (recaptchaValue) {
            // Log the form data and reCAPTCHA token
            console.log("Form submitted:", formData)
            console.log("reCAPTCHA value:", recaptchaValue)

            // Perform actual form submission logic (e.g., sending data to a backend API)
            // fetch('/your-backend-endpoint', {
            //   method: 'POST',
            //   body: JSON.stringify(formData),
            //   headers: { 'Content-Type': 'application/json' },
            // }).then(response => {
            //   if (response.ok) {
            //     // Handle success
            //   }
            // }).catch(error => {
            //   console.error('Error:', error)
            // })
        } else {
            console.log("Please complete the reCAPTCHA")
        }
    }

    const handleScrollToProjects = () => {
        const projectsSection = document.getElementById("projects-section")
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: "smooth" })
        }
    }

    const handleScrollToContact = () => {
        const contactSection = document.getElementById("contact-section")
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth" })
        }
    }

    const handleScroll = (e) => {
        if (e.deltaY < 0) {
            // Scrolling up
            handleScrollToProjects()
        } else if (e.deltaY > 0) {
            // Scrolling down
            handleScrollToContact()
        }
    }

    // The function that gets triggered on button click (related to reCAPTCHA)
    const onChange = async (e) => {
        e.preventDefault()
        if (window.grecaptcha) {
            try {
                // Wait for reCAPTCHA to execute and get the token
                const token = await window.grecaptcha.enterprise.execute(
                    "6LehoqoqAAAAAL8Ffh_2EcyjTYnI4D0UxLtuHFh3",
                    { action: "LOGIN" }
                )
                console.log("reCAPTCHA token:", token)
                // You can use this token for authentication here
            } catch (error) {
                console.error("Error executing reCAPTCHA:", error)
            }
        } else {
            console.error("reCAPTCHA is not loaded")
        }
    }

    return (
        <section
            className="align-middle vertical-align-middle"
            id="contact-section"
            onWheel={handleScroll}
        >
            <div className="p-10 flex items-center">
                <span className="w-full border-t border-solid border-white"></span>
                <h2 className="text-4xl font-bold text-center mx-4">Contact&nbsp;Me</h2>
                <span className="w-full border-t border-solid border-white"></span>
            </div>
            <div className="flex justify-center relative w-full">
                <form className="w-full max-w-md" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 md:gap-6">
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="text"
                                name="name"
                                id="floating_first_name"
                                className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <label
                                htmlFor="floating_first_name"
                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                                First name
                            </label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="text"
                                name="floating_last_name"
                                id="floating_last_name"
                                className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="floating_last_name"
                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                                Last name
                            </label>
                        </div>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <input
                            type="email"
                            name="email"
                            id="floating_email"
                            className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <label
                            htmlFor="floating_email"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Email address
                        </label>
                    </div>
                    <div className="grid md:grid-cols-2 md:gap-6">
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="tel"
                                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                name="floating_phone"
                                id="floating_phone"
                                className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="floating_phone"
                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                                Phone number (123-456-7890)
                            </label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input
                                type="text"
                                name="floating_company"
                                id="floating_company"
                                className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="floating_company"
                                className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                            >
                                Company (Ex. Google)
                            </label>
                        </div>
                    </div>
                    <div className="relative z-0 w-full mb-5 group">
                        <textarea
                            name="message"
                            id="message"
                            rows="4"
                            className="block py-2.5 px-0 w-full text-sm text-white-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            placeholder=" "
                            required
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                        <label
                            htmlFor="message"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                            Your message
                        </label>
                    </div>
                    <ReCAPTCHA
                        sitekey="6LehoqoqAAAAAL8Ffh_2EcyjTYnI4D0UxLtuHFh3"
                        onChange={(value) => setRecaptchaValue(value)}
                    />
                    <button
                        type="submit"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </section>
    )
}
