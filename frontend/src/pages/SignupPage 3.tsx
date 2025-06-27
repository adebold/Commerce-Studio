import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    termsAccepted: false,
    isManufacturer: false
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!formData.termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    try {
      if (formData.isManufacturer) {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            roles: ["manufacturer"],
            user_type: "manufacturer"
          })
        });
        if (!response.ok) {
          throw new Error("Registration failed: " + (await response.text()));
        }
        navigate('/manufacturer-dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    }
  };

  return (
    <div className="container-sm flex-center min-h-screen py-12">
      <div className="apple-card max-w-lg w-full p-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-6">Create an Account</h1>
        {error && (
          <div className="mb-4">
            <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-center">
              {error}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus-ring"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus-ring"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus-ring"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus-ring"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus-ring"
              />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <input
              id="isManufacturer"
              name="isManufacturer"
              type="checkbox"
              checked={formData.isManufacturer}
              onChange={handleChange}
              className="mr-2 accent-primary"
            />
            <label htmlFor="isManufacturer" className="text-sm">
              I am a manufacturer registering for the platform
            </label>
          </div>
          <div className="flex items-center mt-2">
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mr-2 accent-primary"
              required
            />
            <label htmlFor="termsAccepted" className="text-sm">
              I agree to the <a href="#" className="underline text-primary">Terms and Conditions</a> and <a href="#" className="underline text-primary">Privacy Policy</a>
            </label>
          </div>
          <button
            type="submit"
            className="apple-button-primary w-full mt-4"
          >
            Sign Up
          </button>
          <div className="text-center mt-2">
            <span className="text-sm">
              Already have an account? <a href="/login" className="underline text-primary">Sign in</a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
